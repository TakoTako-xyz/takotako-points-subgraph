// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal,
} from "@graphprotocol/graph-ts";

export class Token extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Token entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Token must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      );
      store.set("Token", id.toString(), this);
    }
  }

  static loadInBlock(id: string): Token | null {
    return changetype<Token | null>(store.get_in_block("Token", id));
  }

  static load(id: string): Token | null {
    return changetype<Token | null>(store.get("Token", id));
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get name(): string {
    let value = this.get("name");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set name(value: string) {
    this.set("name", Value.fromString(value));
  }

  get symbol(): string {
    let value = this.get("symbol");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set symbol(value: string) {
    this.set("symbol", Value.fromString(value));
  }

  get decimals(): i32 {
    let value = this.get("decimals");
    if (!value || value.kind == ValueKind.NULL) {
      return 0;
    } else {
      return value.toI32();
    }
  }

  set decimals(value: i32) {
    this.set("decimals", Value.fromI32(value));
  }

  get lastPriceBlockNumber(): BigInt | null {
    let value = this.get("lastPriceBlockNumber");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set lastPriceBlockNumber(value: BigInt | null) {
    if (!value) {
      this.unset("lastPriceBlockNumber");
    } else {
      this.set("lastPriceBlockNumber", Value.fromBigInt(<BigInt>value));
    }
  }

  get _market(): string | null {
    let value = this.get("_market");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set _market(value: string | null) {
    if (!value) {
      this.unset("_market");
    } else {
      this.set("_market", Value.fromString(<string>value));
    }
  }

  get _type(): string | null {
    let value = this.get("_type");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set _type(value: string | null) {
    if (!value) {
      this.unset("_type");
    } else {
      this.set("_type", Value.fromString(<string>value));
    }
  }
}

export class Protocol extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Protocol entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Protocol must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      );
      store.set("Protocol", id.toString(), this);
    }
  }

  static loadInBlock(id: string): Protocol | null {
    return changetype<Protocol | null>(store.get_in_block("Protocol", id));
  }

  static load(id: string): Protocol | null {
    return changetype<Protocol | null>(store.get("Protocol", id));
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get name(): string {
    let value = this.get("name");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set name(value: string) {
    this.set("name", Value.fromString(value));
  }

  get slug(): string {
    let value = this.get("slug");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set slug(value: string) {
    this.set("slug", Value.fromString(value));
  }

  get network(): string {
    let value = this.get("network");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set network(value: string) {
    this.set("network", Value.fromString(value));
  }

  get cumulativeUniqueUsers(): i32 {
    let value = this.get("cumulativeUniqueUsers");
    if (!value || value.kind == ValueKind.NULL) {
      return 0;
    } else {
      return value.toI32();
    }
  }

  set cumulativeUniqueUsers(value: i32) {
    this.set("cumulativeUniqueUsers", Value.fromI32(value));
  }

  get totalPoolCount(): i32 {
    let value = this.get("totalPoolCount");
    if (!value || value.kind == ValueKind.NULL) {
      return 0;
    } else {
      return value.toI32();
    }
  }

  set totalPoolCount(value: i32) {
    this.set("totalPoolCount", Value.fromI32(value));
  }

  get markets(): MarketLoader {
    return new MarketLoader("Protocol", this.get("id")!.toString(), "markets");
  }

  get totalSupplyUSD(): BigDecimal {
    let value = this.get("totalSupplyUSD");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set totalSupplyUSD(value: BigDecimal) {
    this.set("totalSupplyUSD", Value.fromBigDecimal(value));
  }

  get totalBorrowUSD(): BigDecimal {
    let value = this.get("totalBorrowUSD");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set totalBorrowUSD(value: BigDecimal) {
    this.set("totalBorrowUSD", Value.fromBigDecimal(value));
  }

  get totalPoints(): BigDecimal {
    let value = this.get("totalPoints");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set totalPoints(value: BigDecimal) {
    this.set("totalPoints", Value.fromBigDecimal(value));
  }

  get _marketIDs(): Array<string> {
    let value = this.get("_marketIDs");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toStringArray();
    }
  }

  set _marketIDs(value: Array<string>) {
    this.set("_marketIDs", Value.fromStringArray(value));
  }
}

export class ProtocolAccount extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save ProtocolAccount entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type ProtocolAccount must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      );
      store.set("ProtocolAccount", id.toString(), this);
    }
  }

  static loadInBlock(id: string): ProtocolAccount | null {
    return changetype<ProtocolAccount | null>(
      store.get_in_block("ProtocolAccount", id),
    );
  }

  static load(id: string): ProtocolAccount | null {
    return changetype<ProtocolAccount | null>(store.get("ProtocolAccount", id));
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get protocol(): string {
    let value = this.get("protocol");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set protocol(value: string) {
    this.set("protocol", Value.fromString(value));
  }

  get account(): string {
    let value = this.get("account");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set account(value: string) {
    this.set("account", Value.fromString(value));
  }
}

export class Market extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Market entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Market must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      );
      store.set("Market", id.toString(), this);
    }
  }

  static loadInBlock(id: string): Market | null {
    return changetype<Market | null>(store.get_in_block("Market", id));
  }

  static load(id: string): Market | null {
    return changetype<Market | null>(store.get("Market", id));
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get protocol(): string {
    let value = this.get("protocol");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set protocol(value: string) {
    this.set("protocol", Value.fromString(value));
  }

  get name(): string | null {
    let value = this.get("name");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set name(value: string | null) {
    if (!value) {
      this.unset("name");
    } else {
      this.set("name", Value.fromString(<string>value));
    }
  }

  get inputToken(): string {
    let value = this.get("inputToken");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set inputToken(value: string) {
    this.set("inputToken", Value.fromString(value));
  }

  get outputToken(): string | null {
    let value = this.get("outputToken");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set outputToken(value: string | null) {
    if (!value) {
      this.unset("outputToken");
    } else {
      this.set("outputToken", Value.fromString(<string>value));
    }
  }

  get createdTimestamp(): BigInt {
    let value = this.get("createdTimestamp");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set createdTimestamp(value: BigInt) {
    this.set("createdTimestamp", Value.fromBigInt(value));
  }

  get createdBlockNumber(): BigInt {
    let value = this.get("createdBlockNumber");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set createdBlockNumber(value: BigInt) {
    this.set("createdBlockNumber", Value.fromBigInt(value));
  }

  get _vToken(): string | null {
    let value = this.get("_vToken");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set _vToken(value: string | null) {
    if (!value) {
      this.unset("_vToken");
    } else {
      this.set("_vToken", Value.fromString(<string>value));
    }
  }

  get _sToken(): string | null {
    let value = this.get("_sToken");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set _sToken(value: string | null) {
    if (!value) {
      this.unset("_sToken");
    } else {
      this.set("_sToken", Value.fromString(<string>value));
    }
  }
}

export class MarketAccount extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save MarketAccount entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type MarketAccount must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      );
      store.set("MarketAccount", id.toString(), this);
    }
  }

  static loadInBlock(id: string): MarketAccount | null {
    return changetype<MarketAccount | null>(
      store.get_in_block("MarketAccount", id),
    );
  }

  static load(id: string): MarketAccount | null {
    return changetype<MarketAccount | null>(store.get("MarketAccount", id));
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get market(): string {
    let value = this.get("market");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set market(value: string) {
    this.set("market", Value.fromString(value));
  }

  get account(): string {
    let value = this.get("account");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set account(value: string) {
    this.set("account", Value.fromString(value));
  }

  get supplied(): BigInt {
    let value = this.get("supplied");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set supplied(value: BigInt) {
    this.set("supplied", Value.fromBigInt(value));
  }

  get borrowed(): BigInt {
    let value = this.get("borrowed");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set borrowed(value: BigInt) {
    this.set("borrowed", Value.fromBigInt(value));
  }
}

export class Account extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Account entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Account must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      );
      store.set("Account", id.toString(), this);
    }
  }

  static loadInBlock(id: string): Account | null {
    return changetype<Account | null>(store.get_in_block("Account", id));
  }

  static load(id: string): Account | null {
    return changetype<Account | null>(store.get("Account", id));
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get protocols(): ProtocolAccountLoader {
    return new ProtocolAccountLoader(
      "Account",
      this.get("id")!.toString(),
      "protocols",
    );
  }

  get markets(): MarketAccountLoader {
    return new MarketAccountLoader(
      "Account",
      this.get("id")!.toString(),
      "markets",
    );
  }

  get totalSupplyUSD(): BigDecimal {
    let value = this.get("totalSupplyUSD");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set totalSupplyUSD(value: BigDecimal) {
    this.set("totalSupplyUSD", Value.fromBigDecimal(value));
  }

  get totalBorrowUSD(): BigDecimal {
    let value = this.get("totalBorrowUSD");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set totalBorrowUSD(value: BigDecimal) {
    this.set("totalBorrowUSD", Value.fromBigDecimal(value));
  }

  get totalPoints(): BigDecimal {
    let value = this.get("totalPoints");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set totalPoints(value: BigDecimal) {
    this.set("totalPoints", Value.fromBigDecimal(value));
  }
}

export class Snapshot extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Snapshot entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Snapshot must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      );
      store.set("Snapshot", id.toString(), this);
    }
  }

  static loadInBlock(id: string): Snapshot | null {
    return changetype<Snapshot | null>(store.get_in_block("Snapshot", id));
  }

  static load(id: string): Snapshot | null {
    return changetype<Snapshot | null>(store.get("Snapshot", id));
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }

  get protocol(): string {
    let value = this.get("protocol");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set protocol(value: string) {
    this.set("protocol", Value.fromString(value));
  }

  get marketSnapshots(): MarketSnapshotLoader {
    return new MarketSnapshotLoader(
      "Snapshot",
      this.get("id")!.toString(),
      "marketSnapshots",
    );
  }

  get accountCount(): i32 {
    let value = this.get("accountCount");
    if (!value || value.kind == ValueKind.NULL) {
      return 0;
    } else {
      return value.toI32();
    }
  }

  set accountCount(value: i32) {
    this.set("accountCount", Value.fromI32(value));
  }

  get finalized(): boolean {
    let value = this.get("finalized");
    if (!value || value.kind == ValueKind.NULL) {
      return false;
    } else {
      return value.toBoolean();
    }
  }

  set finalized(value: boolean) {
    this.set("finalized", Value.fromBoolean(value));
  }

  get totalSupplyUSD(): BigDecimal {
    let value = this.get("totalSupplyUSD");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set totalSupplyUSD(value: BigDecimal) {
    this.set("totalSupplyUSD", Value.fromBigDecimal(value));
  }

  get totalBorrowUSD(): BigDecimal {
    let value = this.get("totalBorrowUSD");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set totalBorrowUSD(value: BigDecimal) {
    this.set("totalBorrowUSD", Value.fromBigDecimal(value));
  }

  get points(): BigDecimal {
    let value = this.get("points");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set points(value: BigDecimal) {
    this.set("points", Value.fromBigDecimal(value));
  }
}

export class MarketSnapshot extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save MarketSnapshot entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type MarketSnapshot must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      );
      store.set("MarketSnapshot", id.toString(), this);
    }
  }

  static loadInBlock(id: string): MarketSnapshot | null {
    return changetype<MarketSnapshot | null>(
      store.get_in_block("MarketSnapshot", id),
    );
  }

  static load(id: string): MarketSnapshot | null {
    return changetype<MarketSnapshot | null>(store.get("MarketSnapshot", id));
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get market(): string {
    let value = this.get("market");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set market(value: string) {
    this.set("market", Value.fromString(value));
  }

  get snapshot(): string {
    let value = this.get("snapshot");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set snapshot(value: string) {
    this.set("snapshot", Value.fromString(value));
  }

  get accountCount(): i32 {
    let value = this.get("accountCount");
    if (!value || value.kind == ValueKind.NULL) {
      return 0;
    } else {
      return value.toI32();
    }
  }

  set accountCount(value: i32) {
    this.set("accountCount", Value.fromI32(value));
  }

  get totalSupplyUSD(): BigDecimal {
    let value = this.get("totalSupplyUSD");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set totalSupplyUSD(value: BigDecimal) {
    this.set("totalSupplyUSD", Value.fromBigDecimal(value));
  }

  get totalBorrowUSD(): BigDecimal {
    let value = this.get("totalBorrowUSD");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set totalBorrowUSD(value: BigDecimal) {
    this.set("totalBorrowUSD", Value.fromBigDecimal(value));
  }

  get priceUSD(): BigDecimal {
    let value = this.get("priceUSD");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigDecimal();
    }
  }

  set priceUSD(value: BigDecimal) {
    this.set("priceUSD", Value.fromBigDecimal(value));
  }
}

export class MarketLoader extends Entity {
  _entity: string;
  _field: string;
  _id: string;

  constructor(entity: string, id: string, field: string) {
    super();
    this._entity = entity;
    this._id = id;
    this._field = field;
  }

  load(): Market[] {
    let value = store.loadRelated(this._entity, this._id, this._field);
    return changetype<Market[]>(value);
  }
}

export class ProtocolAccountLoader extends Entity {
  _entity: string;
  _field: string;
  _id: string;

  constructor(entity: string, id: string, field: string) {
    super();
    this._entity = entity;
    this._id = id;
    this._field = field;
  }

  load(): ProtocolAccount[] {
    let value = store.loadRelated(this._entity, this._id, this._field);
    return changetype<ProtocolAccount[]>(value);
  }
}

export class MarketAccountLoader extends Entity {
  _entity: string;
  _field: string;
  _id: string;

  constructor(entity: string, id: string, field: string) {
    super();
    this._entity = entity;
    this._id = id;
    this._field = field;
  }

  load(): MarketAccount[] {
    let value = store.loadRelated(this._entity, this._id, this._field);
    return changetype<MarketAccount[]>(value);
  }
}

export class MarketSnapshotLoader extends Entity {
  _entity: string;
  _field: string;
  _id: string;

  constructor(entity: string, id: string, field: string) {
    super();
    this._entity = entity;
    this._id = id;
    this._field = field;
  }

  load(): MarketSnapshot[] {
    let value = store.loadRelated(this._entity, this._id, this._field);
    return changetype<MarketSnapshot[]>(value);
  }
}
