import {
  Address,
  BigInt,
  BigDecimal,
  ethereum,
  log,
  store,
} from "@graphprotocol/graph-ts";
import { ReserveInitialized } from "./types/LendingPoolConfigurator/LendingPoolConfigurator";
import { ProtocolData } from "./types";
import {
  BIGDECIMAL_ONE,
  BIGDECIMAL_ZERO,
  PositionSide,
  TakoTakoProtocol,
  ZERO_ADDRESS,
} from "./constants";
import {
  Borrow,
  Deposit,
  LiquidationCall,
  Repay,
  Withdraw,
} from "./types/LendingPool/LendingPool";
import { Transfer as CollateralTransfer } from "./types/templates/AToken/AToken";
import { Transfer as VariableTransfer } from "./types/templates/VariableDebtToken/VariableDebtToken";
import { Account, Market, ProtocolAccount, Snapshot } from "./types/schema";
import {
  exponentToBigDecimal,
  getDecimalsOfMarkets,
  getMarketByAuxillaryToken,
  getOrCreateAccount,
  getOrCreateMarket,
  getOrCreateMarketAccount,
  getOrCreateMarketSnapshot,
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

export function handleDeposit(event: Deposit): void {
  const amount = event.params.amount;
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
  const account = getOrCreateAccount(accountID.toHexString(), protocol);

  // update market account
  // updateMarketAccount(market, account.id);
  const accountMarket = getOrCreateMarketAccount(market.id, account.id);
  accountMarket.supplied = accountMarket.supplied.plus(amount);
  accountMarket.save();

  protocol.save();
  market.save();
}

export function handleWithdraw(event: Withdraw): void {
  const amount = event.params.amount;
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
  const account = getOrCreateAccount(accountID.toHexString(), protocol);

  // update market account
  // updateMarketAccount(market, account.id);
  const accountMarket = getOrCreateMarketAccount(market.id, account.id);
  accountMarket.supplied = accountMarket.supplied.minus(amount);
  accountMarket.save();
}

export function handleBorrow(event: Borrow): void {
  const amount = event.params.amount;
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
  const account = getOrCreateAccount(accountID.toHexString(), protocol);

  // update market account
  // updateMarketAccount(market, account.id);
  const accountMarket = getOrCreateMarketAccount(market.id, account.id);
  accountMarket.borrowed = accountMarket.borrowed.plus(amount);
  accountMarket.save();

  // update metrics
  protocol.save();
  market.save();
}

export function handleRepay(event: Repay): void {
  const amount = event.params.amount;
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
  const account = getOrCreateAccount(accountID.toHexString(), protocol);

  // update market account
  // updateMarketAccount(market, account.id);
  const accountMarket = getOrCreateMarketAccount(market.id, account.id);
  accountMarket.borrowed = accountMarket.borrowed.minus(amount);
  accountMarket.save();
}

export function handleLiquidationCall(event: LiquidationCall): void {
  // const marketId = event.params.collateralAsset;
  // const protocolData = getProtocolData();
  // const liquidator = event.params.liquidator;
  // const borrower = event.params.user;
  // const debtToken = event.params.debtAsset;
  // const market = Market.load(marketId.toHexString());
  // if (!market) {
  //   log.warning("[Liquidate] Market not found on protocol: {}", [
  //     marketId.toHexString(),
  //   ]);
  //   return;
  // }
  // const protocol = getOrCreateProtocol(protocolData);
  // // update accounts
  // getOrCreateAccount(liquidator.toHexString(), protocol);
  // getOrCreateAccount(borrower.toHexString(), protocol);
  // // update market account for liquidator and borrower
  // updateMarketAccount(market, liquidator.toHexString());
  // updateMarketAccount(market, borrower.toHexString());
  // const repayTokenMarket = Market.load(debtToken.toHexString());
  // if (!repayTokenMarket) {
  //   log.warning("[Liquidate] Repay token market not found on protocol: {}", [
  //     debtToken.toHexString(),
  //   ]);
  //   return;
  // }
  // // update market account for liquidator and borrower
  // updateMarketAccount(repayTokenMarket, liquidator.toHexString());
  // updateMarketAccount(repayTokenMarket, borrower.toHexString());
  // const debtAsset = Token.load(debtToken.toHexString());
  // if (!debtAsset) {
  //   log.warning("[Liquidate] Debt asset not found on protocol: {}", [
  //     debtToken.toHexString(),
  //   ]);
  //   return;
  // }
  // protocol.save();
  // market.save();
}

/////////////////////////
//// Transfer Events ////
/////////////////////////

export function handleCollateralTransfer(event: CollateralTransfer): void {
  _handleTransfer(
    event,
    event.params.value,
    getProtocolData(),
    PositionSide.LENDER,
    event.params.to,
    event.params.from
  );
}

export function handleVariableTransfer(event: VariableTransfer): void {
  _handleTransfer(
    event,
    event.params.value,
    getProtocolData(),
    PositionSide.BORROWER,
    event.params.to,
    event.params.from
  );
}

function _handleTransfer(
  event: ethereum.Event,
  amount: BigInt,
  protocolData: ProtocolData,
  side: string,
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
  const toAccount = getOrCreateAccount(to.toHexString(), protocol);
  const fromAccount = getOrCreateAccount(from.toHexString(), protocol);

  // update balance from sender
  if (fromAccount) {
    // updateMarketAccount(market, fromAccount.id);
    const fromAccountMarket = getOrCreateMarketAccount(
      market.id,
      fromAccount.id
    );
    if (side == PositionSide.BORROWER) {
      fromAccountMarket.borrowed = fromAccountMarket.borrowed.minus(amount);
    } else {
      fromAccountMarket.supplied = fromAccountMarket.supplied.minus(amount);
    }
    fromAccountMarket.save();
  }

  // update balance from receiver
  if (toAccount) {
    // updateMarketAccount(market, toAccount.id);
    const toAccountMarket = getOrCreateMarketAccount(market.id, toAccount.id);
    if (side == PositionSide.BORROWER) {
      toAccountMarket.borrowed = toAccountMarket.borrowed.plus(amount);
    } else {
      toAccountMarket.supplied = toAccountMarket.supplied.plus(amount);
    }
    toAccountMarket.save();
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
  if (!snapshot) {
    // Create a new DailyEntity if it doesn't exist
    snapshot = new Snapshot(uniqueId);
    snapshot.timestamp = BigInt.fromI32(startOfDayTimestamp);

    snapshot.protocol = protocol.id;
    // Count the total number of Account entities in the Subgraph
    snapshot.accountCount = 0;
    snapshot.finalized = false;
    snapshot.totalSupplyUSD = BIGDECIMAL_ZERO;
    snapshot.totalBorrowUSD = BIGDECIMAL_ZERO;
    snapshot.points = BIGDECIMAL_ZERO;
    snapshot.save();
  }

  // If the snapshot is already finalized, return
  if (snapshot.finalized) {
    return;
  }

  const prices = getPriceOfMarkets(protocol);
  const decimals = getDecimalsOfMarkets(protocol);

  let totalSupplyUSD = BIGDECIMAL_ZERO;
  let totalBorrowUSD = BIGDECIMAL_ZERO;

  // Process the next 20000 accounts
  let maxUserIndex = snapshot.accountCount + 20000;
  if (maxUserIndex > protocol.cumulativeUniqueUsers) {
    maxUserIndex = protocol.cumulativeUniqueUsers;
  }
  for (let i = snapshot.accountCount; i < maxUserIndex; i++) {
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
          const accMarket = accMarkets[j];
          if (
            accMarket.supplied.equals(BigInt.fromI32(0)) &&
            accMarket.borrowed.equals(BigInt.fromI32(0))
          ) {
            store.remove("MarketAccount", accMarket.id);
            continue;
          }

          const price = prices.get(accMarket.market);
          if (!price) {
            throw new Error("[handleBlock] Price not found");
          }
          const marketDecimals = decimals.get(accMarket.market)!.toI32();

          const marketSnapshot = getOrCreateMarketSnapshot(
            snapshot.id,
            accMarket.market
          );
          // Calculate the total supply USD
          if (accMarket.supplied.gt(BigInt.fromI32(0))) {
            const supplyAmount = accMarket.supplied.toBigDecimal();
            const supplyAmountUSD = supplyAmount
              .div(exponentToBigDecimal(marketDecimals))
              .times(price);
            totalSupplyUSD = totalSupplyUSD.plus(supplyAmountUSD);
            accountSupplyUSD = accountSupplyUSD.plus(supplyAmountUSD);
            marketSnapshot.totalSupplyUSD =
              marketSnapshot.totalSupplyUSD.plus(supplyAmountUSD);
          }
          if (accountSupplyUSD.lt(BIGDECIMAL_ONE)) {
            log.warning("[handleBlock] Account supply less than 1: {}", [
              account.id,
            ]);
            continue;
          }

          // Calculate the total borrow USD
          if (accMarket.borrowed.gt(BigInt.fromI32(0))) {
            const borrowAmount = accMarket.borrowed.toBigDecimal();
            const borrowAmountUSD = borrowAmount
              .div(exponentToBigDecimal(marketDecimals))
              .times(price);
            totalBorrowUSD = totalBorrowUSD.plus(borrowAmountUSD);
            accountBorrowUSD = accountBorrowUSD.plus(borrowAmountUSD);
            marketSnapshot.totalBorrowUSD =
              marketSnapshot.totalBorrowUSD.plus(borrowAmountUSD);
          }
          marketSnapshot.accountCount += 1;
          marketSnapshot.priceUSD = price;
          marketSnapshot.save();
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
    snapshot.accountCount += 1;
  }

  // Save the snapshot
  snapshot.totalSupplyUSD = snapshot.totalSupplyUSD.plus(totalSupplyUSD);
  snapshot.totalBorrowUSD = snapshot.totalBorrowUSD.plus(totalBorrowUSD);
  snapshot.points = snapshot.totalSupplyUSD
    .times(new BigDecimal(BigInt.fromI32(10)))
    .plus(snapshot.totalBorrowUSD.times(new BigDecimal(BigInt.fromI32(50))));
  snapshot.finalized = snapshot.accountCount == protocol.cumulativeUniqueUsers;
  snapshot.save();

  // Update the protocol entity
  protocol.totalSupplyUSD = snapshot.totalSupplyUSD;
  protocol.totalBorrowUSD = snapshot.totalBorrowUSD;
  protocol.totalPoints = protocol.totalPoints.plus(snapshot.points);
  protocol.save();
}
