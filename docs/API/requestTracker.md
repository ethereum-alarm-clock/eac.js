## eac.RequestTracker

Exposes utilities for interacting with the Request Tracker contract.

### Constructor

Returns a `Promise` that resolves a new instance of a `eac.RequestTracker`
class. Uses the canonical Ethereum Alarm Clock contracts for the same
chain as the Web3 object was initiated on.

```javascript
// Inside of an async function:
const requestTracker = await eac.requestTracker()
```

### eac.RequestTracker.nextFromLeft(blockNum)

Takes one argument, a `blocknumber` and queries the RequestTracker for 
the next registered `TxRequest` at a windowstart greater than or equal 
to that block number. Returns a `Promise` which resolves to the the
transaction request `address`.

```javascript
const left = await eac.Util.getBlockNumber()
const nextRequestAddress = await requestTracker.nextFromLeft(left)

console.log(nextRequestAddress)
// 0x44Df...0Ba
```

### eac.RequestTracker.windowStartFor(txRequestAddress)

Takes one argument, the `address` of a `TxRequest` and returns
a `Promise` that will resolve to  the `windowStart` for that 
transaction request.

```javascript
const windowStart = await requestTracker.windowStartFor(nextRequestAddress)
console.log(windowStart)

// 5665000
```

### eac.RequestTracker.nextRequest(txRequestAddress)

Takes one argument, the `address` of a `TxRequest` and returns
a `Promise` that resolves to the next registered transaction request 
address, which can be used to create an instance of a `eac.TxRequest`. 
Will resolve to a `NULL_ADDRESS` if there is not a next registered 
transaction request.

```javascript
const nextRequestAddress = await requestTracker.nextRequest(txRequest.address)

if (nextRequestAddress === eac.Constants.NULL_ADDRESS) { 
    console.log('No new requests')
}
```