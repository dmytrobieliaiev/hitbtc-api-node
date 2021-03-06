"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const shortid = require('shortid');
const nodeReconnectWs = require('node-reconnect-ws');
exports.responseCallbackMatch = {
    updateOrderbook: 'onOrderBookUpdate',
    snapshotOrderbook: 'onOrderBookSnapshot',
    snapshotTrades: 'onTrades',
    updateTrades: 'onTrades',
    ticker: 'onTicker',
    getOrders: 'onActiveOrders',
    getTradingBalance: 'onTradingBalance',
    activeOrders: 'onActiveOrders',
    report: 'onOrder'
};
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
        this.syncMethods = ['getTradingBalance', 'getOrders', 'newOrder', 'cancelOrder'];
        this.createRequest = (method, params = {}) => {
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
        };
        /*
        * If socket is offline, than add query to queue
        * Push queue when socket is online
        */
        this.sendRequest = (method, params) => {
            if (this.socket.ws.readyState === this.socket.ws.OPEN) {
                this.socket.send(this.createRequest(method, params));
                // Reconnect behavior
                if (this.isReconnecting) {
                    this.isReconnecting = false;
                    this.reconnectQueue.forEach(fn => fn(this));
                    this.reconnectQueue = [];
                }
            }
            else {
                if (!this.isReconnecting) {
                    this.isReconnecting = true;
                }
                const fn = (ctx) => ctx.socket.send(ctx.createRequest(method, params));
                this.reconnectQueue.push(fn);
            }
        };
        this.addListener = (listener) => this.socket.on(`message`, (data) => {
            try {
                if (data) {
                    const obj = JSON.parse(data);
                    listener(obj);
                }
            }
            catch (e) {
                console.log(e);
            }
        });
        this.addEventListener = (event, listener) => this.socket.on(event, listener);
        this.addOnOpenListener = (listener) => this.socket.on(`open`, listener);
        // Custom code
        // Lets define some callbacks
        this.bindCallbacks = (callbacks) => {
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
                    if (this.responseId === 1) {
                        callbacks.onReady();
                    }
                    if (this.responseId + 1 === Number.MAX_SAFE_INTEGER) {
                        this.responseId = 2;
                    }
                }
                // Process methods
                if (method && exports.responseCallbackMatch.hasOwnProperty(method)) {
                    const callbackName = exports.responseCallbackMatch[method];
                    if (callbacks.hasOwnProperty(callbackName)) {
                        callbacks[callbackName](params);
                    }
                    ;
                }
            });
        };
        this.subscriptions = [];
        this.reconnectQueue = [];
        this.isReconnecting = false;
        this.responseQueue = {};
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
    getTradingBalance() {
        this.sendRequest('getTradingBalance', {});
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