# hitbtc-api
I've compared forks of hitbtc-api-node and found FluxCoin/hitbtc-api-node which was the best at the moment, as I needed few features to add I've decided to fork. Readme is fixed too.

## Installation

```
yarn add hitbtc-api
```

## Usage

Clients for both the [REST API](https://hitbtc.com/api#restful) and
[streaming WebSocket API](https://hitbtc.com/api#streaming) are included. Private
methods as indicated in the docs require authentication with an API key and
secret key.

## So how does it work?
```
const HitBTC = require('hitbtc-api').default;
const key = '';
const secret = '';

const client = new HitBTC({ key, secret });
const websocketClient = new HitBTC.WebsocketClient({ key, secret });

// Lets create a new delayed call
// If we call after .constructor than it won't work, because login has no callback in this implementation
// to be done: onReady event
setTimeout(() => {
    websocketClient.addListener((data) => {
        // Check here for event type like snapshot or something 
        // This is smartest part of your code
        console.log(data);
    });
    
    // Send requests and receive result at the top
    websocketClient.sendRequest('subscribeOrderbook', { symbol: "ETHBTC" });
    websocketClient.sendRequest('subscribeOrderbook', { symbol: "ETHADA" });
    websocketClient.sendRequest('getSymbol', { symbol: "ETHBTC" });
}, 3000);

```

### WebSocket
* .sendRequest
* .addListener ( json callback)
* .removeListener
* .addEventListener ( same as addListener but with raw socket response)
* .removeEventListener 
* .addOnOpenListener ( used by login)
* .removeOnOpenListener

## To Do
* new level of abstraction
* Tests
* Improved documentation
* More robust error handling

Feedback and pull requests welcome!
