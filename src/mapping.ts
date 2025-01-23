import { ReserveInitialized } from "./types/LendingPoolConfigurator/LendingPoolConfigurator";
import { ProtocolData } from "./types";
import {
  BIGDECIMAL_ZERO,
  DEFAULT_DECIMALS,
  PositionSide,
  TakoTakoProtocol,
  ZERO_ADDRESS,
} from "./constants";
import {
  Borrow,
  Deposit,
  LiquidationCall,
  Repay,
  ReserveDataUpdated,
  Withdraw,
} from "./types/LendingPool/LendingPool";
import { AToken } from "./types/LendingPool/AToken";
import { VariableDebtToken } from "./types/LendingPool/VariableDebtToken";
import { Transfer as CollateralTransfer } from "./types/templates/AToken/AToken";
import { Transfer as VariableTransfer } from "./types/templates/VariableDebtToken/VariableDebtToken";
import {
  Address,
  BigInt,
  BigDecimal,
  ethereum,
  log,
} from "@graphprotocol/graph-ts";
import { GToken } from "./types/LendingPool/GToken";
import {
  Account,
  Market,
  ProtocolAccount,
  Snapshot,
  Token,
} from "./types/schema";
import {
  createAccount,
  exponentToBigDecimal,
  getDecimalsOfMarkets,
  getMarketByAuxillaryToken,
  getOrCreateMarket,
  getOrCreateMarketAccount,
  getOrCreateProtocol,
  getOrCreateToken,
  getPriceOfMarkets,
} from "./helpers";
import {
  AToken as ATokenTemplate,
  VariableDebtToken as VTokenTemplate,
} from "./types/templates";

function getProtocolData(): ProtocolData {
  return new ProtocolData(
    TakoTakoProtocol.PROTOCOL_ADDRESS,
    TakoTakoProtocol.NAME,
    TakoTakoProtocol.SLUG,
    TakoTakoProtocol.NETWORK
  );
}

export function handleReserveInitialized(event: ReserveInitialized): void {
  // This function handles market entity from reserve creation event
  // Attempt to load or create the market implementation

  const underlyingToken = event.params.asset;
  const outputToken = event.params.aToken;
  const variableDebtToken = event.params.variableDebtToken;
  const protocolData = getProtocolData();

  // update and initialize specofic market variables
  const market = getOrCreateMarket(underlyingToken, protocolData);

  // create tokens
  const outputTokenEntity = getOrCreateToken(outputToken, market);
  const variableDebtTokenEntity = getOrCreateToken(variableDebtToken, market);

  market.name = outputTokenEntity.name;
  market.outputToken = outputTokenEntity.id;
  market.createdBlockNumber = event.block.number;
  market.createdTimestamp = event.block.timestamp;
  market._vToken = variableDebtTokenEntity.id;
  VTokenTemplate.create(variableDebtToken);

  market.save();

  // create AToken template to watch Transfer
  ATokenTemplate.create(outputToken);
}

export function handleReserveDataUpdated(event: ReserveDataUpdated): void {
  // update rewards if there is an incentive controller
  const market = Market.load(event.params.reserve.toHexString());
  if (!market) {
    log.warning("[handleReserveDataUpdated] Market not found", [
      event.params.reserve.toHexString(),
    ]);
    return;
  }

  const gTokenContract = GToken.bind(Address.fromString(market.outputToken!));

  // update gToken price
  let assetPriceUSD: BigDecimal;

  const tryPrice = gTokenContract.try_getAssetPrice();
  if (tryPrice.reverted) {
    log.warning(
      "[handleReserveDataUpdated] Token price not found in Market: {}",
      [market.id]
    );
    return;
  }

  // get asset price normally
  assetPriceUSD = tryPrice.value
    .toBigDecimal()
    .div(exponentToBigDecimal(DEFAULT_DECIMALS));

  // update market prices
  market.inputTokenPriceUSD = assetPriceUSD;

  market.save();
}

export function handleDeposit(event: Deposit): void {
  const marketId = event.params.reserve;
  const protocolData = getProtocolData();
  const accountID = event.params.onBehalfOf;

  const market = Market.load(marketId.toHexString());
  if (!market) {
    log.warning("[Deposit] Market not found on protocol: {}", [
      marketId.toHexString(),
    ]);
    return;
  }
  const protocol = getOrCreateProtocol(protocolData);

  // create account
  let account = Account.load(accountID.toHexString());
  if (!account) {
    account = createAccount(accountID.toHexString(), protocol);

    protocol.cumulativeUniqueUsers += 1;
    protocol.save();
  }
  account.save();

  // update market account
  const accountMarket = getOrCreateMarketAccount(market.id, account.id);
  const aTokenContract = AToken.bind(Address.fromString(market.outputToken!));
  const aBalanceResult = aTokenContract.try_balanceOf(accountID);
  if (aBalanceResult.reverted) {
    log.warning("[Deposit] Error getting balance for account: {}", [
      accountID.toHexString(),
    ]);
  } else {
    accountMarket.supplied = aBalanceResult.value;
  }
  accountMarket.save();

  protocol.save();
  market.save();
}

export function handleWithdraw(event: Withdraw): void {
  const marketId = event.params.reserve;
  const protocolData = getProtocolData();
  const accountID = event.params.to;

  const market = Market.load(marketId.toHexString());
  if (!market) {
    log.warning("[Withdraw] Market not found on protocol: {}", [
      marketId.toHexString(),
    ]);
    return;
  }
  const protocol = getOrCreateProtocol(protocolData);

  // get account
  let account = Account.load(accountID.toHexString());
  if (!account) {
    account = createAccount(accountID.toHexString(), protocol);

    protocol.cumulativeUniqueUsers += 1;
    protocol.save();
  }
  account.save();

  // update market account
  const accountMarket = getOrCreateMarketAccount(market.id, account.id);
  const aTokenContract = AToken.bind(Address.fromString(market.outputToken!));
  const aBalanceResult = aTokenContract.try_balanceOf(accountID);
  if (aBalanceResult.reverted) {
    log.warning("[Withdraw] Error getting balance for account: {}", [
      accountID.toHexString(),
    ]);
  } else {
    accountMarket.supplied = aBalanceResult.value;
  }
  accountMarket.save();
}

export function handleBorrow(event: Borrow): void {
  const marketId = event.params.reserve;
  const protocolData = getProtocolData();
  const accountID = event.params.onBehalfOf;
  const market = Market.load(marketId.toHexString());
  if (!market) {
    log.warning("[Borrow] Market not found on protocol: {}", [
      marketId.toHexString(),
    ]);
    return;
  }
  const protocol = getOrCreateProtocol(protocolData);

  // create account
  let account = Account.load(accountID.toHexString());
  if (!account) {
    account = createAccount(accountID.toHexString(), protocol);

    protocol.cumulativeUniqueUsers += 1;
    protocol.save();
  }
  account.save();

  // update market account
  const accountMarket = getOrCreateMarketAccount(market.id, account.id);
  const variableDebtContract = VariableDebtToken.bind(
    Address.fromString(market._vToken!)
  );
  const vDebtBalanceResult = variableDebtContract.try_balanceOf(accountID);
  if (vDebtBalanceResult.reverted) {
    log.warning("[Borrow] Error getting balance for account: {}", [
      accountID.toHexString(),
    ]);
  } else {
    accountMarket.borrowed = vDebtBalanceResult.value;
  }
  accountMarket.save();

  // update metrics
  protocol.save();
  market.save();
}

export function handleRepay(event: Repay): void {
  const marketId = event.params.reserve;
  const protocolData = getProtocolData();
  const accountID = event.params.user;

  const market = Market.load(marketId.toHexString());
  if (!market) {
    log.warning("[Repay] Market not found on protocol: {}", [
      marketId.toHexString(),
    ]);
    return;
  }
  const protocol = getOrCreateProtocol(protocolData);

  // get account
  let account = Account.load(accountID.toHexString());
  if (!account) {
    account = createAccount(accountID.toHexString(), protocol);

    protocol.cumulativeUniqueUsers += 1;
    protocol.save();
  }
  account.save();

  // update market account
  const accountMarket = getOrCreateMarketAccount(market.id, account.id);
  const variableDebtContract = VariableDebtToken.bind(
    Address.fromString(market._vToken!)
  );
  const vDebtBalanceResult = variableDebtContract.try_balanceOf(accountID);
  if (vDebtBalanceResult.reverted) {
    log.warning("[Borrow] Error getting balance for account: {}", [
      accountID.toHexString(),
    ]);
  } else {
    accountMarket.borrowed = vDebtBalanceResult.value;
  }
  accountMarket.save();
}

export function handleLiquidationCall(event: LiquidationCall): void {
  const marketId = event.params.collateralAsset;
  const protocolData = getProtocolData();
  const liquidator = event.params.liquidator;
  const borrower = event.params.user;
  const debtToken = event.params.debtAsset;

  const market = Market.load(marketId.toHexString());
  if (!market) {
    log.warning("[Liquidate] Market not found on protocol: {}", [
      marketId.toHexString(),
    ]);
    return;
  }
  const protocol = getOrCreateProtocol(protocolData);

  // update liquidators account
  let liquidatorAccount = Account.load(liquidator.toHexString());
  if (!liquidatorAccount) {
    liquidatorAccount = createAccount(liquidator.toHexString(), protocol);

    protocol.cumulativeUniqueUsers += 1;
    protocol.save();
  }
  liquidatorAccount.save();

  const variableDebtContract = VariableDebtToken.bind(debtToken);

  // update market account for liquidator
  const liquidatorMarket = getOrCreateMarketAccount(
    market.id,
    liquidator.toHexString()
  );
  const vDebtLiqBalanceResult = variableDebtContract.try_balanceOf(liquidator);
  if (vDebtLiqBalanceResult.reverted) {
    log.warning("[Liquidate] Error getting balance for account: {}", [
      liquidator.toHexString(),
    ]);
  } else {
    liquidatorMarket.borrowed = vDebtLiqBalanceResult.value;
  }
  liquidatorMarket.save();

  // get borrower account
  let account = Account.load(borrower.toHexString());
  if (!account) {
    account = createAccount(borrower.toHexString(), protocol);

    protocol.cumulativeUniqueUsers += 1;
    protocol.save();
  }
  account.save();

  // update market account for liquidator
  const borrowerMarket = getOrCreateMarketAccount(
    market.id,
    borrower.toHexString()
  );
  const vDebtBorBalanceResult = variableDebtContract.try_balanceOf(borrower);
  if (vDebtBorBalanceResult.reverted) {
    log.warning("[Liquidate] Error getting balance for account: {}", [
      borrower.toHexString(),
    ]);
  } else {
    borrowerMarket.borrowed = vDebtBorBalanceResult.value;
  }
  borrowerMarket.save();

  const repayTokenMarket = Market.load(debtToken.toHexString());
  if (!repayTokenMarket) {
    log.warning("[Liquidate] Repay token market not found on protocol: {}", [
      debtToken.toHexString(),
    ]);
    return;
  }

  const debtAsset = Token.load(debtToken.toHexString());
  if (!debtAsset) {
    log.warning("[Liquidate] Debt asset not found on protocol: {}", [
      debtToken.toHexString(),
    ]);
    return;
  }

  protocol.save();
  market.save();
}

/////////////////////////
//// Transfer Events ////
/////////////////////////

export function handleCollateralTransfer(event: CollateralTransfer): void {
  _handleTransfer(
    event,
    getProtocolData(),
    PositionSide.LENDER,
    event.params.to,
    event.params.from
  );
}

export function handleVariableTransfer(event: VariableTransfer): void {
  _handleTransfer(
    event,
    getProtocolData(),
    PositionSide.BORROWER,
    event.params.to,
    event.params.from
  );
}

function _handleTransfer(
  event: ethereum.Event,
  protocolData: ProtocolData,
  positionSide: string,
  to: Address,
  from: Address
): void {
  const asset = event.address;
  const protocol = getOrCreateProtocol(protocolData);
  const market = getMarketByAuxillaryToken(asset.toHexString(), protocolData);
  if (!market) {
    log.warning("[_handleTransfer] market not found: {}", [
      asset.toHexString(),
    ]);
    return;
  }

  // if the to / from addresses are the same as the asset
  // then this transfer is emitted as part of another event
  // ie, a deposit, withdraw, borrow, repay, etc
  // we want to let that handler take care of position updates
  // and zero addresses mean it is apart of a burn / mint
  if (
    to == Address.fromString(ZERO_ADDRESS) ||
    from == Address.fromString(ZERO_ADDRESS) ||
    to == asset ||
    from == asset
  ) {
    return;
  }

  // grab accounts
  let toAccount = Account.load(to.toHexString());
  if (!toAccount) {
    toAccount = createAccount(to.toHexString(), protocol);

    protocol.cumulativeUniqueUsers += 1;
    protocol.save();
  }

  let fromAccount = Account.load(from.toHexString());
  if (!fromAccount) {
    fromAccount = createAccount(from.toHexString(), protocol);

    protocol.cumulativeUniqueUsers += 1;
    protocol.save();
  }

  const aTokenContract = AToken.bind(Address.fromString(market.outputToken!));
  const variableDebtContract = VariableDebtToken.bind(
    Address.fromString(market._vToken!)
  );

  // update balance from sender
  if (fromAccount) {
    const accountMarket = getOrCreateMarketAccount(market.id, fromAccount.id);

    if (positionSide === PositionSide.LENDER) {
      const aBalanceResult = aTokenContract.try_balanceOf(
        Address.fromString(fromAccount.id)
      );
      if (aBalanceResult.reverted) {
        log.warning("[Transfer.from] Error getting balance for account: {}", [
          fromAccount.id,
        ]);
      } else {
        accountMarket.supplied = aBalanceResult.value;
      }
    } else if (positionSide === PositionSide.BORROWER) {
      const vDebtBalanceResult = variableDebtContract.try_balanceOf(
        Address.fromString(fromAccount.id)
      );
      if (vDebtBalanceResult.reverted) {
        log.warning("[Transfer.from] Error getting balance for account: {}", [
          fromAccount.id,
        ]);
      } else {
        accountMarket.borrowed = vDebtBalanceResult.value;
      }
    }
    accountMarket.save();
  }

  // update balance from receiver
  if (toAccount) {
    const accountMarket = getOrCreateMarketAccount(market.id, toAccount.id);

    if (positionSide === PositionSide.LENDER) {
      const aBalanceResult = aTokenContract.try_balanceOf(
        Address.fromString(toAccount.id)
      );
      if (aBalanceResult.reverted) {
        log.warning("[Transfer.to] Error getting balance for account: {}", [
          toAccount.id,
        ]);
      } else {
        accountMarket.supplied = aBalanceResult.value;
      }
    } else if (positionSide === PositionSide.BORROWER) {
      const vDebtBalanceResult = variableDebtContract.try_balanceOf(
        Address.fromString(toAccount.id)
      );
      if (vDebtBalanceResult.reverted) {
        log.warning("[Transfer.to] Error getting balance for account: {}", [
          toAccount.id,
        ]);
      } else {
        accountMarket.borrowed = vDebtBalanceResult.value;
      }
    }
    accountMarket.save();
  }
}

export function handleBlock(block: ethereum.Block): void {
  const protocol = getOrCreateProtocol(getProtocolData());

  // Calculate the timestamp for the start of the day at 00:00 UTC
  const timestamp = block.timestamp.toI32(); // Current block timestamp in seconds
  const startOfDayTimestamp = (timestamp / 86400) * 86400; // Start of the day at 00:00 UTC

  // Create a unique ID for the day using the start of day timestamp
  const uniqueId = startOfDayTimestamp.toString();

  // Check if an entity with this ID already exists
  let snapshot = Snapshot.load(uniqueId);
  if (snapshot == null) {
    // Create a new DailyEntity if it doesn't exist
    snapshot = new Snapshot(uniqueId);
    snapshot.timestamp = BigInt.fromI32(startOfDayTimestamp);

    // Count the total number of Account entities in the Subgraph
    snapshot.accountCount = protocol.cumulativeUniqueUsers;
    snapshot.protocol = protocol.id;
    snapshot.totalSupplyUSD = BIGDECIMAL_ZERO;
    snapshot.totalBorrowUSD = BIGDECIMAL_ZERO;
    snapshot.points = BIGDECIMAL_ZERO;

    const prices = getPriceOfMarkets(protocol);
    const decimals = getDecimalsOfMarkets(protocol);

    let totalSupplyUSD = BIGDECIMAL_ZERO;
    let totalBorrowUSD = BIGDECIMAL_ZERO;

    for (let i = 0; i < protocol.cumulativeUniqueUsers; i++) {
      let procotolAccount = ProtocolAccount.load(`${protocol.id}-${i}`);
      if (procotolAccount != null) {
        const account = Account.load(procotolAccount.account);
        if (account == null) {
          throw new Error("[handleBlock] Account not found");
        } else {
          const accMarkets = account.markets.load();

          let accountSupplyUSD = BIGDECIMAL_ZERO;
          let accountBorrowUSD = BIGDECIMAL_ZERO;

          for (let j = 0; j < accMarkets.length; j++) {
            const price = prices.get(accMarkets[j].market);
            if (!price) {
              throw new Error("[handleBlock] Price not found");
            }

            const marketDecimals = decimals.get(accMarkets[j].market)!.toI32();

            // Calculate the total supply USD
            if (accMarkets[j].supplied.gt(BigInt.fromI32(0))) {
              const supplyAmount = accMarkets[j].supplied.toBigDecimal();
              const supplyAmountUSD = supplyAmount
                .div(exponentToBigDecimal(marketDecimals))
                .times(price);
              totalSupplyUSD = totalSupplyUSD.plus(supplyAmountUSD);
              accountSupplyUSD = accountSupplyUSD.plus(supplyAmountUSD);
            }

            // Calculate the total borrow USD
            if (accMarkets[j].borrowed.gt(BigInt.fromI32(0))) {
              const borrowAmount = accMarkets[j].borrowed.toBigDecimal();
              const borrowAmountUSD = borrowAmount
                .div(exponentToBigDecimal(marketDecimals))
                .times(price);
              totalBorrowUSD = totalBorrowUSD.plus(borrowAmountUSD);
              accountBorrowUSD = accountBorrowUSD.plus(borrowAmountUSD);
            }
          }

          // TODO: save account
          account.totalSupplyUSD = accountSupplyUSD;
          account.totalBorrowUSD = accountBorrowUSD;
          account.totalPoints = account.totalPoints
            .plus(accountSupplyUSD.times(new BigDecimal(BigInt.fromI32(10))))
            .plus(accountBorrowUSD.times(new BigDecimal(BigInt.fromI32(50))));
          account.save();
        }
      }
    }

    // Save the snapshot
    snapshot.totalSupplyUSD = totalSupplyUSD;
    snapshot.totalBorrowUSD = totalBorrowUSD;
    snapshot.points = totalSupplyUSD
      .times(new BigDecimal(BigInt.fromI32(10)))
      .plus(totalBorrowUSD.times(new BigDecimal(BigInt.fromI32(50))));
    snapshot.save();

    // Update the protocol entity
    protocol.totalSupplyUSD = snapshot.totalSupplyUSD;
    protocol.totalBorrowUSD = snapshot.totalBorrowUSD;
    protocol.totalPoints = protocol.totalPoints.plus(snapshot.points);
    protocol.save();
  }
}
