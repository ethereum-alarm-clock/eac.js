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

### eac.RequestFactory.validateRequestParams(addressArgs, uintArgs, callData, endowment)

Lowest level validation function and takes the full request params

* addressArgs [0] -  meta.owner
* addressArgs [1] -  paymentData.donationBenefactor
* addressArgs [2] -  txnData.toAddress
* uintArgs [0]    -  paymentData.donation
* uintArgs [1]    -  paymentData.payment
* uintArgs [2]    -  schedule.claimWindowSize
* uintArgs [3]    -  schedule.freezePeriod
* uintArgs [4]    -  schedule.reservedWindowSize
* uintArgs [5]    -  schedule.temporalUnit
* uintArgs [6]    -  schedule.windowSize
* uintArgs [7]    -  schedule.windowStart
* uintArgs [8]    -  txnData.callGas
* uintArgs [9]    -  txnData.callValue
* uintArgs [10]   -  txnData.gasPrice
* uintArgs [11]   -  claimData.requiredDeposit
* callData        -  The call data
* endowment       -  The value sent with the creation request.

where `addressArgs` is an array of length 3 containing valid Ethereum addresses, `uintArgs`
is an array of length 12 containing unsigned integers, the `callData` is hex 
encoded and the `endowment` is a wei value. Returns an `Array<boolean>` of length 6,
the booleans will be true if validation passed and false if an error was triggered.
Use `eac.RequestFactroy.parseIsValid()` to parse error messages from this array.

### eac.RequestFactory.parseIsValid(isValid)

Takes an `Array<boolean>` of length six containing the results of `.validateRequestParams()`
and returns an `Array<string>` containig the parsed error messages.

Error messages include:
 * InsufficientEndowment
 * ReservedWindowBiggerThanExecutionWindow
 * InvalidTemporalUnit
 * ExecutionWindowTooSoon
 * CallGasTooHigh
 * EmptyToAddress

```javascript
// Defines the variables addressArgs, uintArgs, callData and endowment earlier in the file
const isValid = await requestFactory.validateRequestParams(
    addressArgs,
    uintArgs,
    callData,
    endowment
)

if (isValid.indexOf(false) != -1) {
    const errorMsgs = requestFactory.parseIsValid(isValid)
    throw new Error(errorMsgs)
}
```