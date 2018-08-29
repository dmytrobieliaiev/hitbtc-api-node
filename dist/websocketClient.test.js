"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
require("chai/register-should");
chai.use(chaiAsPromised);
const websocketClient_1 = require("./websocketClient");
// import * as ReconnectingWebSocket from "reconnecting-websocket";
ava_1.test("uses the demo domain when isDemo", () => __awaiter(this, void 0, void 0, function* () {
    const client = new websocketClient_1.default({ key: "", secret: "", isDemo: true });
    client.baseUrl.should.equal("wss://demo-api.hitbtc.com/api/2/ws");
}));
ava_1.test("uses the production domain when not isDemo", () => __awaiter(this, void 0, void 0, function* () {
    const client = new websocketClient_1.default({ key: "", secret: "", isDemo: false });
    client.baseUrl.should.equal("wss://api.hitbtc.com/api/2/ws");
}));
ava_1.test("uses the passed baseUrl when provided", () => __awaiter(this, void 0, void 0, function* () {
    const client = new websocketClient_1.default({ key: "", secret: "", baseUrl: "wss://localhost:4499/hitbtc/wss" });
    client.baseUrl.should.equal("wss://localhost:4499/hitbtc/wss");
}));
// test("ReconnectingWebsocket instance is created and available", async () => {
//   const client = new HitBTCWebSocketClient({ key: "DFgdfg", secret: "sdfsdfsdf" });
//   client.socket.should.be.instanceOf(ReconnectingWebSocket);
//   client.socket.readyState.should.equal(0);
// });
//# sourceMappingURL=websocketClient.test.js.map