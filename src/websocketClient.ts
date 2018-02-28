import { pipe, prop } from "ramda";
import * as WebSocket from "ws";

export type Listener = (data: IHitBTCWebsocketData) => void;
export type EventListener = (...args: any[]) => void;
export type MessageListener = (event: IWSMessageEvent) => void;

const withData = (listener: Listener): MessageListener =>
  pipe(prop("data"), (data: string) => JSON.parse(data), listener);

export interface IHitBTCWebsocketParams {
  key: string;
  secret: string;
  isDemo?: boolean;
}

export interface IHitBTCWebsocketData {
  jsonrpc: string;
  method?: string;
  params?: any;
  result?: any;
  error?: any;
  id: number | null;
}

export interface IWSMessageEvent {
  data: any;
  type: string;
  target: WebSocket;
}

export default class HitBTCWebsocketClient {
  public baseUrl: string;
  public socketUrl: string;
  public socket: WebSocket;
  private requestId: number;
  private hasCredentials: boolean;
  constructor({ key, secret, isDemo = false }: IHitBTCWebsocketParams) {
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
    this.socket.addEventListener(`message`, withData(listener))

  public removeListener = (listener: Listener) =>
    this.socket.removeEventListener(`message`, withData(listener))

  public addEventListener = (event: string, listener: EventListener) =>
    this.socket.addEventListener(event, listener)

  public removeEventListener = (event: string, listener: EventListener) =>
    this.socket.removeEventListener(event, listener)

  public addOnOpenListener = (listener: () => void) =>
    this.socket.addEventListener(`open`, listener)

  public removeOnOpenListener = (listener: () => void) =>
    this.socket.addEventListener(`open`, listener)

}
