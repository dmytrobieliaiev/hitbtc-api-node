'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _websocketClient = require('./websocketClient');

var _websocketClient2 = _interopRequireDefault(_websocketClient);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _get = require('lodash/fp/get');

var _get2 = _interopRequireDefault(_get);

var _qs = require('qs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class HitBTC {

  constructor({ key, secret, isDemo = false } = { isDemo: false }) {
    this.requestPublic = (endpoint, params = {}) => _axios2.default.get(`${this.url}/public${endpoint}`, { params }).then((0, _get2.default)(`data`)).catch((0, _get2.default)(`response.data`));

    this.requestPrivate = (endpoint, params = {}, method = `post`) => {
      if (!this.key || !this.secret) {
        throw new Error(`API key and secret key required to use authenticated methods`);
      }

      const config = {
        auth: {
          username: this.key,
          password: this.secret
        }
      };

      const args = method === `get` || method === `delete` ? [config] : [(0, _qs.stringify)(params), config];

      return _axios2.default[method](`${this.url}${endpoint}`, ...args).then((0, _get2.default)(`data`)).catch((0, _get2.default)(`response.data`));
    };

    this.currencies = () => this.requestPublic(`/currency`);

    this.currency = curr => this.requestPublic(`/currency/${curr}`);

    this.symbols = () => this.requestPublic(`/symbol`);

    this.symbol = sym => this.requestPublic(`/symbol/${sym}`);

    this.tickers = () => this.requestPublic(`/ticker`);

    this.ticker = symbol => this.requestPublic(`/ticker/${symbol}`);

    this.trades = (symbol, params) => this.requestPublic(`/trades/${symbol}`, params);

    this.orderbook = (symbol, { limit } = {}) => this.requestPublic(`/orderbook/${symbol}`, { limit });

    this.candles = (symbol, { limit, period } = {}) => this.requestPublic(`/candles/${symbol}`, { limit, period });

    this.tradingBalance = () => this.requestPrivate(`/trading/balance`, {}, `get`);

    this.getOrders = () => this.requestPrivate(`/order`, {}, `get`);

    this.getOrder = clientOrderId => this.requestPrivate(`/order/${clientOrderId}`, {}, `get`);

    this.newOrder = params => this.requestPrivate(`/order`, params);

    this.editOrder = (clientOrderId, params) => this.requestPrivate(`/order/${clientOrderId}`, params, `put`);

    this.cancelOrders = ({ symbol } = {}) => this.requestPrivate(`/order`, { symbol }, `delete`);

    this.cancelOrder = clientOrderId => this.requestPrivate(`/order/${clientOrderId}`, {}, `delete`);

    this.fee = symbol => this.requestPrivate(`/trading/fee/${symbol}`, {}, `get`);

    this.orderHistory = params => this.requestPrivate(`/history/order`, params, `get`);

    this.tradesHistory = params => this.requestPrivate(`/history/trades`, params, `get`);

    this.tradesByOrder = orderId => this.requestPrivate(`/history/order/${orderId}/trades`, {}, `get`);

    this.accountBalance = () => this.requestPrivate(`/account/balance`, {}, `get`);

    this.getCryptoAddress = currency => this.requestPrivate(`/account/crypto/address/${currency}`, {}, `get`);

    this.newCryptoAddress = currency => this.requestPrivate(`/account/crypto/address/${currency}`);

    this.withdraw = params => this.requestPrivate(`/account/crypto/withdraw`, params);

    this.transfer = ({ currency, amount, type }) => this.requestPrivate(`/account/transfer`, { currency, amount, type });

    this.transactions = params => this.requestPrivate(`/account/transactions`, params, `get`);

    this.transaction = (id, params) => this.requestPrivate(`/account/transactions/${id}`, params, `get`);

    this.key = key;
    this.secret = secret;
    const subdomain = isDemo ? `demo-api` : `api`;
    this.baseUrl = `http://${subdomain}.hitbtc.com`;
    this.url = `${this.baseUrl}/api/2`;
  }

}
exports.default = HitBTC;
HitBTC.WebsocketClient = _websocketClient2.default;