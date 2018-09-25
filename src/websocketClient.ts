import { uniq } from "ramda";
const shortid = require('shortid');
const nodeReconnectWs = require('node-reconnect-ws');

export type Listener = (data: IWebsocketData) => void;
export type EventListener = (...args: any[]) => void;
export type MessageListener = (event: MessageEvent) => void;

// const withData = (listener: Listener): MessageListener => 
//   pipe(prop("data"), (data: string) => JSON.parse(data), listener);
  

interface ICallbacks {
  [key:string]: any;
  onOrderBookSnapshot: Function;
  onOrderBookUpdate: Function;
  onOrder: Function;
  onTicker: Function;
  onTrades: Function;
  onTradingBalance: Function;
  onActiveOrders: Function;
  onError: Function;
  onReady: Function;
}
export const responseCallbackMatch: Hash<string> = {
  updateOrderbook: 'onOrderBookUpdate',
  snapshotOrderbook: 'onOrderBookSnapshot',
  snapshotTrades: 'onTrades',
  updateTrades: 'onTrades',
  ticker: 'onTicker',
  getOrders:  'onActiveOrders',
  getTradingBalance: 'onTradingBalance',
  activeOrders: 'onActiveOrders',
  report: 'onOrder'
};
interface ISocket {
  on: Function;
  send: Function;
  readyState: number;
  ws: WebSocket;
}

interface Hash<T> {
  [key: string]: T;
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
  public isReconnecting: boolean;
  public reconnectQueue: Function[];
  public responseQueue: Hash<string>;

  constructor({ key, secret, isDemo = false, baseUrl }: IWebsocketParams) {
    this.subscriptions = [];
    this.reconnectQueue = [];
    this.isReconnecting = false;
    this.responseQueue = {};
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

  public syncMethods: string[] = ['getTradingBalance', 'getOrders', 'newOrder', 'cancelOrder'];
  
  public createRequest = (method: string, params = {}) => {
    const id = this.requestId;
    this.requestId += 1;
    if (this.syncMethods.indexOf(method) > -1) {
      this.responseQueue[id] = method;
    } 
    return JSON.stringify({
      method,
      params,
      id,
    });
  }

  /*
  * If socket is offline, than add query to queue
  * Push queue when socket is online
  */
  public sendRequest = (method: string, params: any) => {
    if (this.socket.ws.readyState === this.socket.ws.OPEN) {
      this.socket.send(this.createRequest(method, params));
      // Reconnect behavior
      if (this.isReconnecting) {
        this.isReconnecting = false;
        this.reconnectQueue.forEach(fn => fn(this));
        this.reconnectQueue = [];
      }
    } else {
      if (!this.isReconnecting) {
        this.isReconnecting = true;
      }
      const fn = (ctx: HitBTCWebsocketClient) => ctx.socket.send(ctx.createRequest(method, params));
      this.reconnectQueue.push(fn);
    }
  }

  public addListener = (listener: Listener) =>
    this.socket.on(`message`, (data: string) => {
      try {
        if (data) {
          const obj = JSON.parse(data);
          listener(obj);
        }
      } catch (e) {
        console.log(e);
      }
    })

  public addEventListener = (event: keyof WebSocketEventMap, listener: EventListener) =>
    this.socket.on(event, listener)

  public addOnOpenListener = (listener: () => void) =>
    this.socket.on(`open`, listener)

  // Custom code
  // Lets define some callbacks
  public bindCallbacks = (callbacks: ICallbacks) => {
    this.addListener((data) => {
      const isError = data && data.error;
      let method = data && data.method;
      const params = data && (data.params || data.result);
      if (isError && callbacks.onError) {
        callbacks.onError(JSON.stringify(data.error));
        return;
      }
      // Rebound response
      const messageId = data.id;
      if (messageId) {
        const boundMethod = this.responseQueue[messageId];
        if (boundMethod) {
          method = boundMethod;
          delete this.responseQueue[messageId];
        }
      }
      // .onReady callback
      if (callbacks.onReady) {
        this.responseId += 1;
        if (this.responseId === 1){
          callbacks.onReady();
        }
        if (this.responseId + 1 === Number.MAX_SAFE_INTEGER) {
          this.responseId = 2;
        }
      }
  
      // Process methods
      if (method && responseCallbackMatch.hasOwnProperty(method)) {
        const callbackName: string = responseCallbackMatch[method];
        if (callbacks.hasOwnProperty(callbackName)){
          callbacks[callbackName](params);
        };
      }
    });
  }

  public subscribeMarkets(pairs: string[]) {
    pairs.map(symbol => {
      if (this.subscriptions.indexOf(symbol) < 0) { // skip subscription when we have it 
        this.subscriptions.push(symbol);+
        this.sendRequest('subscribeOrderbook', { symbol }); // deltas
        this.sendRequest('subscribeTrades', { symbol });
      }
    });
    this.subscriptions = uniq(this.subscriptions);
  }

  public subscribeTicker(pairs: string[]) {
    pairs.map(symbol => this.sendRequest('subscribeTicker', { symbol }));
  }

  public unsubscribeMarkets(symbols: string[]) {
    symbols.map(symbol => {
      this.sendRequest('unsubscribeOrderbook', { symbol });
      this.sendRequest('unsubscribeTrades', { symbol });
    });
    this.subscriptions = this.subscriptions.filter(i => symbols.indexOf(i) < 0);
  }

  public getActiveOrders() {
    this.sendRequest('getOrders', {});
  }
  public getTradingBalance() {
    this.sendRequest('getTradingBalance', {});
  }
  public subscribeOrders() {
    this.sendRequest('subscribeReports', {});
  }

  public cancelOrder(clientOrderId: string) {
    this.sendRequest('cancelOrder', { clientOrderId });
  }
  public createOrder(symbol: string, orderType: string, side: string, amount: string, price: string, extend?: object) { 
    const extendOptions = extend || {};
    const params = Object.assign({
      clientOrderId: shortid.generate(),
      type: orderType,
      symbol,
      side,
      price,
      quantity: amount
    }, extendOptions);
    this.sendRequest('newOrder', params);
  }
}
