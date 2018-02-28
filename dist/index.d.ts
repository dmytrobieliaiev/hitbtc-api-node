import { HitBTCCandlePeriod, HitBTCRESTMethod, IHitBTCOrder, IHitBTCRESTParams } from "./interfaces";
import WebsocketClient from "./websocketClient";
export default class HitBTC {
    static WebsocketClient: typeof WebsocketClient;
    key: any;
    secret: any;
    baseUrl: string;
    url: string;
    constructor({key, secret, isDemo}: IHitBTCRESTParams);
    requestPublic: (endpoint: string, params?: {}) => Promise<any>;
    requestPrivate: (endpoint: string, params?: {}, method?: HitBTCRESTMethod) => Promise<any>;
    currencies: () => Promise<any>;
    currency: (curr: string) => Promise<any>;
    symbols: () => Promise<any>;
    symbol: (sym: string) => Promise<any>;
    tickers: () => Promise<any>;
    ticker: (symbol: string) => Promise<any>;
    trades: (symbol: string, params: any) => Promise<any>;
    orderbook: (symbol: string, { limit }: {
        limit: number;
    }) => Promise<any>;
    candles: (symbol: string, { limit, period }: {
        limit: number;
        period: HitBTCCandlePeriod;
    }) => Promise<any>;
    tradingBalance: () => Promise<any>;
    getOrders: () => Promise<IHitBTCOrder[]>;
    getOrder: (clientOrderId: string) => Promise<IHitBTCOrder>;
    newOrder: (params: any) => Promise<IHitBTCOrder>;
    editOrder: (clientOrderId: string, params: any) => Promise<IHitBTCOrder>;
    cancelOrders: (params: {
        symbol?: string | undefined;
    }) => Promise<IHitBTCOrder[]>;
    cancelOrder: (clientOrderId: string) => Promise<IHitBTCOrder>;
    fee: (symbol: string) => Promise<any>;
    orderHistory: (params: any) => Promise<any>;
    tradesHistory: (params: any) => Promise<any>;
    tradesByOrder: (orderId: string) => Promise<any>;
    accountBalance: () => Promise<any>;
    getCryptoAddress: (currency: string) => Promise<any>;
    newCryptoAddress: (currency: string) => Promise<any>;
    withdraw: (params: any) => Promise<any>;
    transfer: (params: {
        currency: string;
        amount: number;
        type: string;
    }) => Promise<any>;
    transactions: (params: any) => Promise<any>;
    transaction: (id: string, params: any) => Promise<any>;
}
