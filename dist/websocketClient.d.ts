/// <reference types="ws" />
import * as WebSocket from "ws";
export declare type Listener = (data: IHitBTCWebsocketData) => void;
export declare type EventListener = (...args: any[]) => void;
export declare type MessageListener = (event: IWSMessageEvent) => void;
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
    baseUrl: string;
    socketUrl: string;
    socket: WebSocket;
    private requestId;
    private hasCredentials;
    constructor({key, secret, isDemo}: IHitBTCWebsocketParams);
    createRequest: (method: string, params?: {}) => string;
    sendRequest: (method: string, params: any) => void;
    addListener: (listener: Listener) => void;
    removeListener: (listener: Listener) => void;
    addEventListener: (event: string, listener: EventListener) => void;
    removeEventListener: (event: string, listener: EventListener) => void;
    addOnOpenListener: (listener: () => void) => void;
    removeOnOpenListener: (listener: () => void) => void;
}
