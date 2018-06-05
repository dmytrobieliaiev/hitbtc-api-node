import { test } from "ava";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "chai/register-should";
chai.use(chaiAsPromised);

import HitBTCWebSocketClient from './websocketClient';
import * as ReconnectingWebSocket from "reconnecting-websocket";

test("uses the demo domain when isDemo", async () => {
  const client = new HitBTCWebSocketClient({ key: "", secret: "", isDemo: true });

  client.baseUrl.should.equal("wss://demo-api.hitbtc.com/api/2/ws");
});

test("uses the production domain when not isDemo", async () => {
  const client = new HitBTCWebSocketClient({ key: "", secret: "", isDemo: false });

  client.baseUrl.should.equal("wss://api.hitbtc.com/api/2/ws");
});

test("uses the passed baseUrl when provided", async () => {
  const client = new HitBTCWebSocketClient({ key: "", secret: "", baseUrl: "wss://localhost:4499/hitbtc/wss" });

  client.baseUrl.should.equal("wss://localhost:4499/hitbtc/wss");
});

test("ReconnectingWebsocket instance is created and available", async () => {
  const client = new HitBTCWebSocketClient({ key: "DFgdfg", secret: "sdfsdfsdf" });

  client.socket.should.be.instanceOf(ReconnectingWebSocket);
  client.socket.readyState.should.equal(0);
});
