import WebsocketClient from './websocketClient';
import axios from 'axios';
import get from 'lodash/fp/get';
import { stringify } from 'qs';

export default class HitBTC {
  static WebsocketClient = WebsocketClient;

  constructor({ key, secret, isDemo = false } = { isDemo: false }) {
    this.key = key;
    this.secret = secret;
    const subdomain = isDemo ? `demo-api` : `api`;
    this.baseUrl = `http://${subdomain}.hitbtc.com`;
    this.url = `${this.baseUrl}/api/2`;
  }

  requestPublic = (endpoint, params = {}) =>
    axios.get(`${this.url}/public${endpoint}`, { params })
      .then(get(`data`))
      .catch(err => {
        throw get(`response.data`, err);
      });
  requestPrivate = (endpoint, params = {}, method = `post`) => {
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

    const args =
      method === `get` || method === `delete` ?
        [config] :
        [stringify(params), config];

    return axios[method](`${this.url}${endpoint}`, ...args)
      .then(get(`data`))
      .catch(err => {
        throw get(`response.data`, err);
      });
  }

  currencies = () =>
    this.requestPublic(`/currency`);

  currency = curr =>
    this.requestPublic(`/currency/${curr}`);

  symbols = () =>
    this.requestPublic(`/symbol`);

  symbol = sym =>
    this.requestPublic(`/symbol/${sym}`);

  tickers = () =>
    this.requestPublic(`/ticker`);

  ticker = symbol =>
    this.requestPublic(`/ticker/${symbol}`);

  trades = (symbol, params) =>
    this.requestPublic(`/trades/${symbol}`, params);

  orderbook = (symbol, { limit } = {}) =>
    this.requestPublic(`/orderbook/${symbol}`, { limit });

  candles = (symbol, { limit, period } = {}) =>
    this.requestPublic(`/candles/${symbol}`, { limit, period });

  tradingBalance = () =>
    this.requestPrivate(`/trading/balance`, {}, `get`);

  getOrders = () =>
    this.requestPrivate(`/order`, {}, `get`);

  getOrder = clientOrderId =>
    this.requestPrivate(`/order/${clientOrderId}`, {}, `get`);

  newOrder = params =>
    this.requestPrivate(`/order`, params);

  editOrder = (clientOrderId, params) =>
    this.requestPrivate(`/order/${clientOrderId}`, params, `put`);

  cancelOrders = ({ symbol } = {}) =>
    this.requestPrivate(`/order`, { symbol }, `delete`);

  cancelOrder = clientOrderId =>
    this.requestPrivate(`/order/${clientOrderId}`, {}, `delete`);

  fee = symbol =>
    this.requestPrivate(`/trading/fee/${symbol}`, {}, `get`);

  orderHistory = params =>
    this.requestPrivate(`/history/order`, params, `get`);

  tradesHistory = params =>
    this.requestPrivate(`/history/trades`, params, `get`);

  tradesByOrder = orderId =>
    this.requestPrivate(`/history/order/${orderId}/trades`, {}, `get`);

  accountBalance = () =>
    this.requestPrivate(`/account/balance`, {}, `get`);

  getCryptoAddress = currency =>
    this.requestPrivate(`/account/crypto/address/${currency}`, {}, `get`);

  newCryptoAddress = currency =>
    this.requestPrivate(`/account/crypto/address/${currency}`);

  withdraw = params =>
    this.requestPrivate(`/account/crypto/withdraw`, params);

  transfer = ({ currency, amount, type }) =>
    this.requestPrivate(`/account/transfer`, { currency, amount, type });

  transactions = params =>
    this.requestPrivate(`/account/transactions`, params, `get`);

  transaction = (id, params) =>
    this.requestPrivate(`/account/transactions/${id}`, params, `get`)
}
