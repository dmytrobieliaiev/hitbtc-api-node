import { uniq } from "ramda";
const nodeReconnectWs = require('node-reconnect-ws');

export type Listener = (data: IWebsocketData) => void;
export type EventListener = (...args: any[]) => void;
export type MessageListener = (event: MessageEvent) => void;

// const withData = (listener: Listener): MessageListener => 
//   pipe(prop("data"), (data: string) => JSON.parse(data), listener);
  

interface ICallbacks {
  onOrderBook?: Function;
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
}

export interface IWebsocketParams {
  readonly key: string;
  readonly secret: string;
  readonly isDemo?: boolean;
  readonly baseUrl?: string;
}

export type IWebsocketData =
  | IBaseWebsocketData
  | IWebsocketBookData
  | IWebsocketTickerData;

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

export function isTickerMessage(
  data: IWebsocketData,
): data is IWebsocketTickerData {
  return data.method === "ticker";
}

export function isOrderbookMessage(
  data: IWebsocketData,
): data is IWebsocketBookData {
  return (
    data.method === "snapshotOrderbook" || data.method === "updateOrderbook"
  );
}

export default class HitBTCWebsocketClient {
  public baseUrl: string;
  public subscriptions: string[];
  public socket: ISocket;
  private requestId: number;
  private responseId: number;

  constructor({ key, secret, isDemo = false, baseUrl }: IWebsocketParams) {
    this.subscriptions = [];
    this.responseId = 0;

    if (baseUrl) {
      this.baseUrl = baseUrl;
    } else {
      const domain = `${isDemo ? `demo-api` : `api`}.hitbtc.com`;
      this.baseUrl = `wss://${domain}/api/2/ws`;
    }

    const hasCredentials = !!(key && secret);

    this.requestId = 0;

    if (hasCredentials) {
      this.socket = new nodeReconnectWs({
        url: this.baseUrl,
        protocol: [],
        reconnectInterval: 4000,
        autoConnect: true,
        maxRetries: Infinity,
      });
      this.socket.on('open', () => {
        this.sendRequest(`login`, {
          algo: `BASIC`,
          pKey: key,
          sKey: secret,
        });
      });
    }
  }

  public createRequest = (method: string, params = {}) => {
    const id = this.requestId;
    this.requestId += 1;
    return JSON.stringify({
      method,
      params,
      id,
    });
  }

  public sendRequest = (method: string, params: any) =>
    this.socket.send(this.createRequest(method, params))

  public addListener = (listener: Listener) =>
    this.socket.on(`message`, (data: string) => listener(JSON.parse(data)));

  // public removeListener = (listener: Listener) =>
  //   this.socket.removeEventListener(`message`, withData(listener))

  public addEventListener = (event: keyof WebSocketEventMap, listener: EventListener) =>
    this.socket.on(event, listener)

  // public removeEventListener = (event: keyof WebSocketEventMap, listener: EventListener) =>
    // this.socket.removeEventListener(event, listener)

  public addOnOpenListener = (listener: () => void) =>
    this.socket.on(`open`, listener)

  // public removeOnOpenListener = (listener: () => void) =>
  //   this.socket.off(`open`, listener)
  
  // Custom code
  // Lets define some callbacks
  public bindCallbacks = (callbacks: ICallbacks) => {
    this.addListener((data) => {
      const isError = (data && data.error);
      const method = data && data.method;
      const params = data && data.params;
      if (isError && callbacks.onError) {
        callbacks.onError(JSON.stringify(data.error));
      }
      if (callbacks.onReady) {
        this.responseId += 1;
        if (this.responseId === 1){
          callbacks.onReady();
        }
        if (this.responseId + 1 === Number.MAX_SAFE_INTEGER) {
          this.responseId = 2;
        }
      }
      switch (method) {
        case 'updateOrderbook':
          if (callbacks.onOrderBook) {
            callbacks.onOrderBook(params);
          }
          break;
        case 'snapshotOrderbook':
          if (callbacks.onOrderBook) {
            callbacks.onOrderBook(params);
          }
          break;
        case 'snapshotTrades':
          if (callbacks.onTrades) {
            callbacks.onTrades(params);
          }
          break;
        case 'updateTrades':
          if (callbacks.onTrades) {
            callbacks.onTrades(params);
          }
          break;
        case 'ticker':
          if (callbacks.onTicker) {
            callbacks.onTicker(params);
          }
          break;
        case 'activeOrders':
          if (callbacks.onActiveOrders) {
            callbacks.onActiveOrders(params);
          }
          break;
        case 'report':
          if (callbacks.onOrder) {
            callbacks.onOrder(params);
          }
          break;
        default:
          break;
      }
    });
  }
  public subscribeMarkets(pairs: string[]) {
    pairs.map(symbol => {
      this.subscriptions.push(symbol);
      this.sendRequest('subscribeOrderbook', { symbol }); // deltas
      this.sendRequest('subscribeTrades', { symbol });
    });
    this.subscriptions = uniq(this.subscriptions);
  }
  public subscribeTicker(pairs: string[]) {
    pairs.map(symbol => this.sendRequest('subscribeTicker', { symbol }));
  }
  public unsubscribeMarkets(pairs: string[]) {
    pairs.map(symbol => this.sendRequest('unsubscribeOrderbook', { symbol }));
  }
  public subscribeOrders() {
    this.sendRequest('subscribeReports', {});
  }
}
