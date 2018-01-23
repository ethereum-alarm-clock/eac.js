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