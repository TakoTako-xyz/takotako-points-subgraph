import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export const INT_ZERO = 0 as i32;

export const BIGINT_ZERO = BigInt.fromI32(0);
export const BIGINT_ONE = BigInt.fromI32(1);

export const BIGDECIMAL_ZERO = BigDecimal.zero();
export const BIGDECIMAL_ONE = new BigDecimal(BIGINT_ONE);

export const DEFAULT_DECIMALS = 18;

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export namespace Network {
  export const TAIKO = "TAIKO"; // Taiko mainnet
}

export namespace TakoTakoProtocol {
  export const NAME = "TAKOTAKO";
  export const SLUG = "takotako";
  export const PROTOCOL_ADDRESS = "0x225BD906D398B1748d7DeF4a35A96f6E5eFD1420"; // LendingPoolAddressesProvider
  export const NETWORK = Network.TAIKO;
}

export namespace PositionSide {
  export const LENDER = "LENDER";
  export const BORROWER = "BORROWER";
}