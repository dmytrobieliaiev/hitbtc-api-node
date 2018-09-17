export declare type Listener = (data: IWebsocketData) => void;
export declare type EventListener = (...args: any[]) => void;
export declare type MessageListener = (event: MessageEvent) => void;
interface ICallbacks {
    onOrderBookSnapshot?: Function;
    onOrderBookUpdate?: Function;
    onOrder?: Function;
    onTicker?: Function;
    onTrades?: Function;
    onActiveOrders?: Function;
    onError?: Function;
    onReady?: Function;
}
interface ISocket {
    on: Function;
    send: Function;
    readyState: number;
    ws: WebSocket;
}
export interface IWebsocketParams {
    readonly key: string;
    readonly secret: string;
    readonly isDemo?: boolean;
    readonly baseUrl?: string;
}
export declare type IWebsocketData = IBaseWebsocketData | IWebsocketBookData | IWebsocketTickerData;
export interface IBaseWebsocketData {
    readonly jsonrpc: string;
    readonly method?: string;
    readonly params?: any;
    readonly result?: any;
    readonly error?: any;
    readonly id?: number;
}
export interface IWebsocketBookData extends IBaseWebsocketData {
    readonly method: "snapshotOrderbook" | "updateOrderbook";
    readonly params: IWebsocketBookParams;
    readonly error: never;
    readonly result: never;
    readonly id: never;
}
export interface IWebsocketBookItem {
    readonly price: string;
    readonly size: string;
}
export interface IWebsocketBookParams {
    readonly ask: IWebsocketBookItem[];
    readonly bid: IWebsocketBookItem[];
    readonly sequence: number;
    readonly symbol: string;
}
export interface IWebsocketTickerData extends IBaseWebsocketData {
    readonly method: "ticker";
    readonly params: ITickerParams;
    readonly error: never;
    readonly result: never;
    readonly id: never;
}
export interface ITickerParams {
    readonly ask: string;
    readonly bid: string;
    readonly last: string;
    readonly open: string;
    readonly low: string;
    readonly high: string;
    readonly volume: string;
    readonly volumeQuote: string;
    readonly timestamp: string;
    readonly symbol: string;
}
export declare function isTickerMessage(data: IWebsocketData): data is IWebsocketTickerData;
export declare function isOrderbookMessage(data: IWebsocketData): data is IWebsocketBookData;
export default class HitBTCWebsocketClient {
    baseUrl: string;
    subscriptions: string[];
    socket: ISocket;
    private requestId;
    private responseId;
    isReconnecting: boolean;
    reconnectQueue: Function[];
    constructor({ key, secret, isDemo, baseUrl }: IWebsocketParams);
    createRequest: (method: string, params?: {}) => string;
    sendRequest: (method: string, params: any) => void;
    addListener: (listener: Listener) => any;
    addEventListener: (event: "error" | "message" | "close" | "open", listener: EventListener) => any;
    addOnOpenListener: (listener: () => void) => any;
    bindCallbacks: (callbacks: ICallbacks) => void;
    subscribeMarkets(pairs: string[]): void;
    subscribeTicker(pairs: string[]): void;
    unsubscribeMarkets(symbols: string[]): void;
    getActiveOrders(): void;
    subscribeOrders(): void;
    cancelOrder(clientOrderId: string): void;
    createOrder(symbol: string, orderType: string, side: string, amount: string, price: string, extend?: object): void;
}
export {};
