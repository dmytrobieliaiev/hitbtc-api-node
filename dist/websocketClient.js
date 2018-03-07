"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const WebSocket = require("ws");
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
    constructor({ key, secret, isDemo = false }) {
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
        this.baseUrl = `${isDemo ? `demo-api` : `api`}.hitbtc.com`;
        this.socketUrl = `ws://${this.baseUrl}/api/2/ws`;
        this.hasCredentials = !!(key && secret);
        this.socket = new WebSocket(this.socketUrl);
        this.requestId = 0;
        if (this.hasCredentials) {
            this.addOnOpenListener(() => {
                this.sendRequest(`login`, {
                    algo: `BASIC`,
                    pKey: key,
                    sKey: secret,
                });
            });
        }
    }
}
exports.default = HitBTCWebsocketClient;
//# sourceMappingURL=websocketClient.js.map