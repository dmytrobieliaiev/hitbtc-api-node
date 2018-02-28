export interface IHitBTCRESTParams {
  key: string;
  secret: string;
  isDemo?: boolean;
}

export type HitBTCRESTMethod = "get" | "put" | "post" | "delete";

export type HitBTCCandlePeriod =
  | "M1"
  | "M3"
  | "M5"
  | "M15"
  | "M30"
  | "H1"
  | "H4"
  | "D1"
  | "D7"
  | "1M";

export type HitBTCStatus =
  | "new"
  | "suspended"
  | "partiallyFilled"
  | "filled"
  | "canceled"
  | "expired";

export type TimeInForce = "GTC" | "FOK" | "IOC" | "Day" | "GTD";
export type Type = "limit" | "market" | "stopLimit" | "stopMarket";

export interface IHitBTCOrder {
  id: number;
  clientOrderId: string;
  symbol: string;
  side: "buy" | "sell";
  status: HitBTCStatus;
  type: Type;
  timeInForce: TimeInForce;
  quantity: string;
  price: string;
  cumQuantity: string;
  createdAt: string;
  updatedAt: string;
}
