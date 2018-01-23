# API Documentation

The eac.js library provides utilies to interact with the Ethereum Alarm Clock contracts.
It exposes a few endpoints which mainly provide convenience wrappers over
the essiential functions of the contracts. 

In general you will simply `npm install` the `eac.js` package then `require` it in your source file like so:

```javascript
const eac = require('eac.js')
```

## eac.Constants

```javascript
console.log(eac.Constants)

{
    GT_HEX: '0x3e',
    LT_HEX: '0x3c',
    GTE_HEX: '0x3e3d',
    LTE_HEX: '0x3c3d',
    EQ_HEX: '0x3d3d',
    NULL_ADDRESS: '0x0000000000000000000000000000000000000000',
    EXECUTEDLOG: '0x3e504bb8b225ad41f613b0c3c4205cdd752d1615b4d77cd1773417282fcfb5d9',
    ABORTEDLOG: '0xc008bc849b42227c61d5063a1313ce509a6e99211bfd59e827e417be6c65c81b'
}
```

## eac.RequestFactory

Exposes utilities for interacting with the Request Factory contract.

### Constructor

Creates a new instance of a `eac.RequestFactory` and takes two arguments, the
first is the `address` of the request factory contract and the second is a `web3` object.

```javascript
const requestFactory = new eac.RequestFactory(address, web3)
```

You can also instantiate a new requestFactory using the convenience functions.

### eac.RequestFactory.initMainnet(web3)

Takes a `web3` object and returns the new instance of a `eac.RequestFactory` instantiated for 
the mainnet chain.

### eac.RequestFactory.initRopsten(web3)

Takes a `web3` object and returns the new instance of a `eac.RequestFactory` instatiated for the ropsten
chain.

```javascript
const requestFactory = eac.RequestFactory.initRopsten(web3)

// You now have a fully instantiated instance which will
// automatically use the canonical Ropsten contracts.
```

### eac.RequestFactory.getTrackerAddress()

Returns the `address` of the tracker that the request factory is using
to track new transaction requests. Can then pass the address to create a new instance of a `eac.RequestTracker`.

```javascript
const trackerAddr = requestFactory.getTrackerAddress()
const requestTracker = new eac.RequestTracker(trackerAddr, web3)
requestTracker.setFactory(requestFactory.address)

// You now have a requestTracker that is the one connected to the
// requestFactory.
```

### eac.RequestFactory.isKnownRequest(requestAddr)

Takes a `TxRequest` address and returns a `Promise` that will resolve `true` if the transaction request
is registed with the factory and `false` if it's not. This function is used
by clients to verify that the address was registered through the watched
contracts.

```javascript
// Verify that the request is known to the factory we are validating with.
if (!await requestFactory.isKnownRequest(nextRequestAddress)) {
    throw new Error(`Encountered unknown address! Please check that you are using the correct contracts JSON file.`)
}
```

## eac.RequestTracker

Exposes utilities for interacting with the Request Tracker contract.

### Constructor

Creates a new instance of a `eac.RequestTracker` and takes two arguments, the first is the `address` of the request tracker contract and the second is a `web3` object.

```javascript
const requestTracker = new eac.RequestTracker(address, web3)
```

Like the `eac.RequestFactory` there are convenience instantiation functions as well.

### eac.RequestTracker.initMainnet(web3)

Takes a `web3` object and returns the new instance of a `eac.RequestTracker` instantiated for 
the mainnet chain.

### eac.RequestTracker.initRopsten(web3)

Takes a `web3` object and returns the new instance of a `eac.RequestTracker` instatiated for the ropsten
chain.

```javascript
const requestTracker = eac.requestTracker.initRopsten(web3)

// You now have a fully instantiated instance which will
// automatically use the canonical Ropsten contracts.
```

### eac.RequestTracker.setFactory(factoryAddr)

Takes one argument, the `address` of the `eac.RequestFactory` that is associated
with this request tracker. You _must_ set the factory before using any of the methods
outlined below. This is because the `RequestTracker` internally uses the factory address
to verify inputs.

### eac.RequestTracker.nextFromLeft(blockNum)

Takes one argument, a `blocknumber` and queries the RequestTracker for the next
registered `TxRequest` at a windowstart greater than or equal to that block number. Returns a `Promise` which resolves to the the transaction request `address`.

```javascript
const left = await eac.Util.getBlockNumber(web3)
const nextRequestAddress = await requestTracker.nextFromLeft(left)

console.log(nextRequestAddress)
// 0x44Df...0Ba
```

### eac.RequestTracker.windowStartFor(txRequestAddress)

Takes one argument, the `address` of a `TxRequest` and returns
a `Promise` that will resolve to  the `windowStart` for that transaction request.

### eac.RequestTracker.nextRequest(txRequestAddress)

Takes one argument, the `address` of a `TxRequest` and returns
a `Promise` that resolves to the next
registered transaction request address, which can be used to create an instance
of a `eac.TxRequest`. Will resolve to a `NULL_ADDRESS` if there is not a next
registered transaction request.

```javascript
const nextRequestAddress = await requestTracker.nextRequest(txRequest.address)

if (nextRequestAddress === eac.Constants.NULL_ADDRESS) { 
    console.log('No new requests')
}
```

## eac.Scheduler

The Scheduler API of eac.js is a wrapper over both the Timestamp and 
Block based scheduling APIS of the Ethereum Alarm Clock. It 
attempts to abstract most of the complexity away from the user
so that you will only have to feed it the variables it wants.

### Constructor

## eac.TxRequest

The wrapper class over an instance of a future transaction scheduled
by the Ethereum Alarm Clock. Opens up getters to retrieve information
about the transaction request and methods for important actions.

### Constructor

The constructor for the `TxRequest` class requires two arguments,
the `address` of the transaction request and the `web3` object. It will 
return a new instance of a `TxRequest`.

```javascript
const txRequest = new eac.TxRequest(address, web3)

// You now have a new transaction request object, the first thing
// you will likely want to do it is fill its data.
```

### eac.TxRequest.fillData()

Async function which will return a `Promise` that resolves to `true` if the 
data is successfully fetched from the EAC contracts and stored in the 
`TxRequest` instance. You will need to call `.fillData()` before trying
to access any of the methods of the transaction request since
the data starts out as _empty_.

```javascript
console.log(txRequest.isClaimed)   // undefined, must call `.fillData() first
await txRequest.fillData()
console.log(txRequest.isClaimed)   // true
console.log(txRequest.windowStart) // 2300780
```

## eac.Util

A collection of utility functions. Only of interest to the most curious
developers who are best directed to the [source]().