"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const shortid = require('shortid');
const nodeReconnectWs = require('node-reconnect-ws');
function isTickerMessage(data) {
    return data.method === "ticker";
}
exports.isTickerMessage = isTickerMessage;
function isOrderbookMessage(data) {
    return (data.method === "snapshotOrderbook" || data.method === "updateOrderbook");
}
exports.isOrderbookMessage = isOrderbookMessage;
class HitBTCWebsocketClient {
    constructor({ key, secret, isDemo = false, baseUrl }) {
        this.createRequest = (method, params = {}) => {
            const id = this.requestId;
            this.requestId += 1;
            return JSON.stringify({
                method,
                params,
                id,
            });
        };
        this.sendRequest = (method, params) => this.socket.send(this.createRequest(method, params));
        this.addListener = (listener) => this.socket.on(`message`, (data) => listener(JSON.parse(data)));
        // public removeListener = (listener: Listener) =>
        //   this.socket.removeEventListener(`message`, withData(listener))
        this.addEventListener = (event, listener) => this.socket.on(event, listener);
        // public removeEventListener = (event: keyof WebSocketEventMap, listener: EventListener) =>
        // this.socket.removeEventListener(event, listener)
        this.addOnOpenListener = (listener) => this.socket.on(`open`, listener);
        // public removeOnOpenListener = (listener: () => void) =>
        //   this.socket.off(`open`, listener)
        // Custom code
        // Lets define some callbacks
        this.bindCallbacks = (callbacks) => {
            this.addListener((data) => {
                const isError = (data && data.error);
                const method = data && data.method;
                const params = data && data.params;
                if (isError && callbacks.onError) {
                    callbacks.onError(JSON.stringify(data.error));
                }
                if (callbacks.onReady) {
                    this.responseId += 1;
                    if (this.responseId === 1) {
                        callbacks.onReady();
                    }
                    if (this.responseId + 1 === Number.MAX_SAFE_INTEGER) {
                        this.responseId = 2;
                    }
                }
                switch (method) {
                    case 'updateOrderbook':
                        if (callbacks.onOrderBookUpdate) {
                            callbacks.onOrderBookUpdate(params);
                        }
                        break;
                    case 'snapshotOrderbook':
                        if (callbacks.onOrderBookSnapshot) {
                            callbacks.onOrderBookSnapshot(params);
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
                    case 'getOrders':
                        if (callbacks.onActiveOrders) {
                            callbacks.onActiveOrders(params);
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
        };
        this.subscriptions = [];
        this.responseId = 0;
        if (baseUrl) {
            this.baseUrl = baseUrl;
        }
        else {
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
    subscribeMarkets(pairs) {
        pairs.map(symbol => {
            if (this.subscriptions.indexOf(symbol) < 0) { // skip subscription when we have it 
                this.subscriptions.push(symbol);
                +this.sendRequest('subscribeOrderbook', { symbol }); // deltas
                this.sendRequest('subscribeTrades', { symbol });
            }
        });
        this.subscriptions = ramda_1.uniq(this.subscriptions);
    }
    subscribeTicker(pairs) {
        pairs.map(symbol => this.sendRequest('subscribeTicker', { symbol }));
    }
    unsubscribeMarkets(symbols) {
        symbols.map(symbol => {
            this.sendRequest('unsubscribeOrderbook', { symbol });
            this.sendRequest('unsubscribeTrades', { symbol });
        });
        this.subscriptions = this.subscriptions.filter(i => symbols.indexOf(i) < 0);
    }
    getActiveOrders() {
        this.sendRequest('getOrders', {});
    }
    subscribeOrders() {
        this.sendRequest('subscribeReports', {});
    }
    cancelOrder(clientOrderId) {
        this.sendRequest('cancelOrder', { clientOrderId });
    }
    createOrder(symbol, orderType, side, amount, price, extend) {
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
exports.default = HitBTCWebsocketClient;
//# sourceMappingURL=websocketClient.js.map