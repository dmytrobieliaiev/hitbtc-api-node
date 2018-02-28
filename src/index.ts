import axios from "axios";
import { stringify } from "qs";
import { prop } from "ramda";
import {
  HitBTCCandlePeriod,
  HitBTCRESTMethod,
  IHitBTCOrder,
  IHitBTCRESTParams,
} from "./interfaces";
import WebsocketClient from "./websocketClient";

export default class HitBTC {
  public static WebsocketClient = WebsocketClient;
  public key: any;
  public secret: any;
  public baseUrl: string;
  public url: string;

  constructor({ key, secret, isDemo = false }: IHitBTCRESTParams) {
    this.key = key;
    this.secret = secret;
    const subdomain = isDemo ? `demo-api` : `api`;
    this.baseUrl = `http://${subdomain}.hitbtc.com`;
    this.url = `${this.baseUrl}/api/2`;
  }

  public requestPublic = (endpoint: string, params = {}) =>
    axios
      .get(`${this.url}/public${endpoint}`, { params })
      .then(prop(`data`))
      .catch(err => {
        throw prop(`response.data`, err);
      })

  public requestPrivate = (
    endpoint: string,
    params = {},
    method = `post` as HitBTCRESTMethod,
  ) => {
    if (!this.key || !this.secret) {
      throw new Error(
        `API key and secret key required to use authenticated methods`,
      );
    }

    const config = {
      auth: {
        username: this.key,
        password: this.secret,
      },
      params,
    };

    const url = `${this.url}${endpoint}`;

    const result =
      method === "get" || method === "delete"
        ? axios[method](url, config)
        : axios[method](url, stringify(params), config);

    return result.then(prop(`data`)).catch(err => {
      throw prop(`response.data`, err);
    });
  }

  public currencies = () => this.requestPublic(`/currency`);

  public currency = (curr: string) => this.requestPublic(`/currency/${curr}`);

  public symbols = () => this.requestPublic(`/symbol`);

  public symbol = (sym: string) => this.requestPublic(`/symbol/${sym}`);

  public tickers = () => this.requestPublic(`/ticker`);

  public ticker = (symbol: string) => this.requestPublic(`/ticker/${symbol}`);

  public trades = (symbol: string, params: any) =>
    this.requestPublic(`/trades/${symbol}`, params)

  public orderbook = (symbol: string, { limit }: { limit: number }) =>
    this.requestPublic(`/orderbook/${symbol}`, { limit })

  public candles = (
    symbol: string,
    { limit, period }: { limit: number; period: HitBTCCandlePeriod },
  ) => this.requestPublic(`/candles/${symbol}`, { limit, period })

  public tradingBalance = () =>
    this.requestPrivate(`/trading/balance`, {}, `get`)

  public getOrders = (): Promise<IHitBTCOrder[]> =>
    this.requestPrivate(`/order`, {}, `get`)

  public getOrder = (clientOrderId: string): Promise<IHitBTCOrder> =>
    this.requestPrivate(`/order/${clientOrderId}`, {}, `get`)

  public newOrder = (params: any): Promise<IHitBTCOrder> =>
    this.requestPrivate(`/order`, params)

  public editOrder = (
    clientOrderId: string,
    params: any,
  ): Promise<IHitBTCOrder> =>
    this.requestPrivate(`/order/${clientOrderId}`, params, `put`)

  public cancelOrders = (params: {
    symbol?: string;
  }): Promise<IHitBTCOrder[]> =>
    this.requestPrivate(`/order`, params, `delete`)

  public cancelOrder = (clientOrderId: string): Promise<IHitBTCOrder> =>
    this.requestPrivate(`/order/${clientOrderId}`, {}, `delete`)

  public fee = (symbol: string) =>
    this.requestPrivate(`/trading/fee/${symbol}`, {}, `get`)

  public orderHistory = (params: any) =>
    this.requestPrivate(`/history/order`, params, `get`)

  public tradesHistory = (params: any) =>
    this.requestPrivate(`/history/trades`, params, `get`)

  public tradesByOrder = (orderId: string) =>
    this.requestPrivate(`/history/order/${orderId}/trades`, {}, `get`)

  public accountBalance = () =>
    this.requestPrivate(`/account/balance`, {}, `get`)

  public getCryptoAddress = (currency: string) =>
    this.requestPrivate(`/account/crypto/address/${currency}`, {}, `get`)

  public newCryptoAddress = (currency: string) =>
    this.requestPrivate(`/account/crypto/address/${currency}`)

  public withdraw = (params: any) =>
    this.requestPrivate(`/account/crypto/withdraw`, params)

  public transfer = (params: {
    currency: string;
    amount: number;
    type: string;
  }) => this.requestPrivate(`/account/transfer`, params)

  public transactions = (params: any) =>
    this.requestPrivate(`/account/transactions`, params, `get`)

  public transaction = (id: string, params: any) =>
    this.requestPrivate(`/account/transactions/${id}`, params, `get`)
}