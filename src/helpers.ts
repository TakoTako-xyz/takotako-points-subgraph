import {
  Address,
  BigDecimal,
  BigInt,
  log,
  TypedMap,
  Value,
} from "@graphprotocol/graph-ts";
import { ERC20 } from "./types/LendingPool/ERC20";
import { ERC20SymbolBytes } from "./types/LendingPool/ERC20SymbolBytes";
import { GToken } from "./types/LendingPool/GToken";
import { AToken } from "./types/LendingPool/AToken";
import { VariableDebtToken } from "./types/LendingPool/VariableDebtToken";
import {
  Account,
  Market,
  MarketAccount,
  MarketSnapshot,
  Protocol,
  ProtocolAccount,
  Token,
} from "./types/schema";
import { ERC20NameBytes } from "./types/LendingPool/ERC20NameBytes";
import {
  BIGDECIMAL_ZERO,
  BIGINT_ONE,
  BIGINT_ZERO,
  DEFAULT_DECIMALS,
  INT_ZERO,
} from "./constants";
import { ProtocolData } from "./types";

export const INVALID_TOKEN_DECIMALS = 0;
export const UNKNOWN_TOKEN_VALUE = "unknown";

export function fetchTokenSymbol(tokenAddress: Address): string {
  const contract = ERC20.bind(tokenAddress);
  const contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress);

  // try types string and bytes32 for symbol
  let symbolValue = UNKNOWN_TOKEN_VALUE;
  const symbolResult = contract.try_symbol();
  if (!symbolResult.reverted) {
    return symbolResult.value;
  }

  // non-standard ERC20 implementation
  const symbolResultBytes = contractSymbolBytes.try_symbol();
  if (!symbolResultBytes.reverted) {
    // for broken pairs that have no symbol function exposed
    if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
      symbolValue = symbolResultBytes.value.toString();
    }
  }

  return symbolValue;
}

export function fetchTokenName(tokenAddress: Address): string {
  const contract = ERC20.bind(tokenAddress);
  const contractNameBytes = ERC20NameBytes.bind(tokenAddress);

  // try types string and bytes32 for name
  let nameValue = UNKNOWN_TOKEN_VALUE;
  const nameResult = contract.try_name();
  if (!nameResult.reverted) {
    return nameResult.value;
  }

  // non-standard ERC20 implementation
  const nameResultBytes = contractNameBytes.try_name();
  if (!nameResultBytes.reverted) {
    // for broken exchanges that have no name function exposed
    if (!isNullEthValue(nameResultBytes.value.toHexString())) {
      nameValue = nameResultBytes.value.toString();
    }
  }

  return nameValue;
}

export function fetchTokenDecimals(tokenAddress: Address): i32 {
  const contract = ERC20.bind(tokenAddress);

  // try types uint8 for decimals
  const decimalResult = contract.try_decimals();
  if (!decimalResult.reverted) {
    const decimalValue = decimalResult.value;
    return decimalValue;
  }

  return INVALID_TOKEN_DECIMALS as i32;
}

export function isNullEthValue(value: string): boolean {
  return (
    value ==
    "0x0000000000000000000000000000000000000000000000000000000000000001"
  );
}

export function getOrCreateToken(address: Address, market: Market): Token {
  let token = Token.load(address.toHexString());

  if (!token) {
    token = new Token(address.toHexString());

    token.symbol = fetchTokenSymbol(address);
    token.name = fetchTokenName(address);
    token.decimals = fetchTokenDecimals(address);
    token._market = market.id;

    token.save();
  }

  return token;
}

////////////////////////
///// Initializers /////
////////////////////////

export function getOrCreateProtocol(protocolData: ProtocolData): Protocol {
  let protocol = Protocol.load(protocolData.protocolAddress);

  if (!protocol) {
    protocol = new Protocol(protocolData.protocolAddress);

    protocol.name = protocolData.name;
    protocol.slug = protocolData.slug;
    protocol.network = protocolData.network;
    protocol.totalPoolCount = INT_ZERO;
    protocol.cumulativeUniqueUsers = INT_ZERO;
    protocol.totalSupplyUSD = BIGDECIMAL_ZERO;
    protocol.totalBorrowUSD = BIGDECIMAL_ZERO;
    protocol.totalPoints = BIGDECIMAL_ZERO;
    protocol._marketIDs = [];
  }

  protocol.save();

  return protocol;
}

export function getOrCreateMarket(
  marketId: Address,
  protocolData: ProtocolData
): Market {
  let market = Market.load(marketId.toHexString());

  if (!market) {
    log.info("[getOrCreateMarket] Creating new market {}", [
      marketId.toHexString(),
    ]);

    // get protocol
    const protocol = getOrCreateProtocol(protocolData);
    protocol.totalPoolCount++;
    const markets = protocol._marketIDs;
    markets.push(marketId.toHexString());
    protocol._marketIDs = markets;
    protocol.save();

    // Create a new Market
    market = new Market(marketId.toHexString());

    // create inputToken
    const inputToken = getOrCreateToken(marketId, market);

    market.protocol = protocol.id;
    market.inputToken = inputToken.id;
    // these are set in reserveInitialized()
    market.createdTimestamp = BIGINT_ZERO;
    market.createdBlockNumber = BIGINT_ZERO;

    market.save();
  }

  return market;
}

export function getOrCreateAccount(
  accountID: string,
  protocol: Protocol
): Account {
  let account = Account.load(accountID);
  if (!account) {
    account = new Account(accountID);
    account.totalBorrowUSD = BIGDECIMAL_ZERO;
    account.totalSupplyUSD = BIGDECIMAL_ZERO;
    account.totalPoints = BIGDECIMAL_ZERO;
    account.save();

    const protocolAccountID = `${protocol.id}-${protocol.cumulativeUniqueUsers}`;
    const protocolAccount = new ProtocolAccount(protocolAccountID);
    protocolAccount.protocol = protocol.id;
    protocolAccount.account = account.id;
    protocolAccount.save();

    protocol.cumulativeUniqueUsers += 1;
    protocol.save();
  }
  return account;
}

export function getOrCreateMarketAccount(
  marketID: string,
  accountID: string
): MarketAccount {
  const accountMarketID = marketID.concat("-").concat(accountID);
  let accountMarket = MarketAccount.load(accountMarketID);
  if (!accountMarket) {
    accountMarket = new MarketAccount(accountMarketID);
    accountMarket.market = marketID;
    accountMarket.account = accountID;
    accountMarket.supplied = BIGINT_ZERO;
    accountMarket.borrowed = BIGINT_ZERO;
  }
  return accountMarket;
}

export function getOrCreateMarketSnapshot(
  snapshotId: string,
  marketId: string
): MarketSnapshot {
  const marketSnapshotID = snapshotId.concat("-").concat(marketId);
  let marketSnapshot = MarketSnapshot.load(marketSnapshotID);
  if (!marketSnapshot) {
    marketSnapshot = new MarketSnapshot(marketSnapshotID);
    marketSnapshot.market = marketId;
    marketSnapshot.snapshot = snapshotId;
    marketSnapshot.accountCount = 0;
    marketSnapshot.totalSupplyUSD = BIGDECIMAL_ZERO;
    marketSnapshot.totalBorrowUSD = BIGDECIMAL_ZERO;
    marketSnapshot.priceUSD = BIGDECIMAL_ZERO;
  }
  return marketSnapshot;
}

export function updateMarketAccount(market: Market, accountID: string): void {
  const accountMarket = getOrCreateMarketAccount(market.id, accountID);

  // get account balances of AToken
  const aTokenContract = AToken.bind(Address.fromString(market.outputToken!));
  const aBalanceResult = aTokenContract.try_balanceOf(
    Address.fromString(accountID)
  );
  if (aBalanceResult.reverted) {
    log.warning("[updateMarketAccount] Error getting balance for account: {}", [
      accountID,
    ]);
    throw new Error("Error getting balance for account");
  } else {
    accountMarket.supplied = aBalanceResult.value;
  }

  // get account balances of VariableDebtToken
  const variableDebtContract = VariableDebtToken.bind(
    Address.fromString(market._vToken!)
  );
  const vDebtBalanceResult = variableDebtContract.try_balanceOf(
    Address.fromString(accountID)
  );
  if (vDebtBalanceResult.reverted) {
    log.warning("[updateMarketAccount] Error getting balance for account: {}", [
      accountID,
    ]);
    throw new Error("Error getting balance for account");
  } else {
    accountMarket.borrowed = vDebtBalanceResult.value;
  }
  accountMarket.save();
}

// returns the market based on any auxillary token
// ie, outputToken, vToken, or sToken
export function getMarketByAuxillaryToken(
  auxillaryToken: string,
  protocolData: ProtocolData
): Market | null {
  const protocol = getOrCreateProtocol(protocolData);

  for (let i = 0; i < protocol._marketIDs.length; i++) {
    const market = Market.load(protocol._marketIDs[i]);

    if (!market) {
      continue;
    }

    if (market.outputToken!.toLowerCase() == auxillaryToken.toLowerCase()) {
      // we found a matching market!
      return market;
    }
    if (
      market._vToken &&
      market._vToken!.toLowerCase() == auxillaryToken.toLowerCase()
    ) {
      return market;
    }
    if (
      market._sToken &&
      market._sToken!.toLowerCase() == auxillaryToken.toLowerCase()
    ) {
      return market;
    }
  }

  return null; // no market found
}

export function getPriceOfMarkets(
  protocol: Protocol
): TypedMap<string, BigDecimal> {
  const prices = new TypedMap<string, BigDecimal>();
  for (let i = 0; i < protocol._marketIDs.length; i++) {
    const market = Market.load(protocol._marketIDs[i]);
    if (!market) {
      log.warning("[getPriceOfMarkets] Market not found in Protocol: {}", [
        protocol.id,
      ]);
      throw new Error("Market not found");
    }

    const gTokenContract = GToken.bind(Address.fromString(market.outputToken!));

    // update gToken price
    let assetPriceUSD: BigDecimal;

    const tryPrice = gTokenContract.try_getAssetPrice();
    if (tryPrice.reverted) {
      log.warning("[getPriceOfMarkets] Token price not found in Market: {}", [
        market.id,
      ]);
      throw new Error("Token price not found");
    }

    // get asset price normally
    assetPriceUSD = tryPrice.value
      .toBigDecimal()
      .div(exponentToBigDecimal(DEFAULT_DECIMALS));

    prices.set(market.id, assetPriceUSD);
  }
  return prices;
}

export function getDecimalsOfMarkets(
  protocol: Protocol
): TypedMap<string, Value> {
  const decimals = new TypedMap<string, Value>();
  for (let i = 0; i < protocol._marketIDs.length; i++) {
    const market = Market.load(protocol._marketIDs[i]);
    if (!market) {
      log.warning("[getPriceOfMarkets] Market not found in Protocol: {}", [
        protocol.id,
      ]);
      throw new Error("Market not found");
    }

    const token = Token.load(market.outputToken!);
    decimals.set(market.id, Value.fromI32(token!.decimals));
  }
  return decimals;
}

// n => 10^n
export function exponentToBigDecimal(decimals: i32): BigDecimal {
  let result = BIGINT_ONE;
  const ten = BigInt.fromI32(10);
  for (let i = 0; i < decimals; i++) {
    result = result.times(ten);
  }
  return result.toBigDecimal();
}
