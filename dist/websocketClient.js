"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RWSocket = require('reconnecting-websocket');
const ramda_1 = require("ramda");
const WS = require("ws");
const withData = (listener) => ramda_1.pipe(ramda_1.prop("data"), (data) => JSON.parse(data), listener);
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
        this.addListener = (listener) => this.socket.addEventListener(`message`, withData(listener));
        this.removeListener = (listener) => this.socket.removeEventListener(`message`, withData(listener));
        this.addEventListener = (event, listener) => this.socket.addEventListener(event, listener);
        this.removeEventListener = (event, listener) => this.socket.removeEventListener(event, listener);
        this.addOnOpenListener = (listener) => this.socket.addEventListener(`open`, listener);
        this.removeOnOpenListener = (listener) => this.socket.addEventListener(`open`, listener);
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
            this.socket = new RWSocket(this.baseUrl, undefined, {
                WebSocket: WS,
            });
            this.addOnOpenListener(() => {
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
            this.subscriptions.push(symbol);
            this.sendRequest('subscribeOrderbook', { symbol }); // deltas
            this.sendRequest('subscribeTrades', { symbol });
        });
        this.subscriptions = ramda_1.uniq(this.subscriptions);
    }
    subscribeTicker(pairs) {
        pairs.map(symbol => this.sendRequest('subscribeTicker', { symbol }));
    }
    unsubscribeMarkets(pairs) {
        pairs.map(symbol => this.sendRequest('unsubscribeOrderbook', { symbol }));
    }
    subscribeOrders() {
        this.sendRequest('subscribeReports', {});
    }
}
exports.default = HitBTCWebsocketClient;
//# sourceMappingURL=websocketClient.js.map