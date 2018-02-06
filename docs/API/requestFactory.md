## eac.RequestFactory

Exposes utilities for interacting with the Request Factory contract.

### Constructor

Returns a `Promise` that resolves a new instance of a `eac.RequestFactory`
class. Uses the canonical Ethereum Alarm Clock contracts for the same 
chain as the Web3 object was initiated on.

```javascript
// Inside of an async function:
const requestFactory = await eac.requestFactory()
```

### eac.RequestFactory.getTrackerAddress()

Returns the `address` of the tracker that the request factory is using
to track new transaction requests. 

```javascript
const trackerAddr = requestFactory.getTrackerAddress()
```

### eac.RequestFactory.isKnownRequest(requestAddr)

Takes a `TxRequest` address and returns a `Promise` that will resolve `true` if the 
transaction request is registed with the factory and `false` if it's not. 
This function is used by clients to verify that the address was registered through
the watched contracts.

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

### eac.RequestFactory.getRequestCreatedLogs(filter[,startBlock[, endBlock]])

Takes a `number` `startBlock` and optional `number` `endBlock` and returns
the raw logs for the requests created through the request factory between
these block times. If `endBlock` is not provided it will return all logs 
up until the `latest` block. Returns a `Promise` that resolves to an array
of the logs.

```javascript
const logs = await requestFactory.getRequestCreatedLogs(5665000)
console.log(logs)

// [ { address: '0x209270d49a3673e8d6163849fa0539800cfeeb9c',
//     blockHash: '0x94c1a6f26a765e47e72e77ce60d8c7ac4cb9dc5858e54bd04fffbc7ec4ce838e',
//     blockNumber: 5665267,
//     logIndex: 1,
//     transactionHash: '0x1dfbd5f4e249fb211e9d4a0b47de54ea0380fc703773b0c393342de123be3d31',
//     transactionIndex: 1,
//     transactionLogIndex: '0x0',
//     type: 'mined',
//     event: 'RequestCreated',
//     args: { request: '0x720704a706d8d6b01167d3a5723c1fa50b1aec28',
//             owner: '0x92cb33fe17a75f0088a14c7718a29321fba026cd' } 
// } ]
```

### eac.RequestFactory.getRequests(startBlock[, endBlock])

Similar to the previous function but returns an array of only the
addresses of each transaction request. If not `starBlock` or `endBlock`
is provided,  will use `current block - 5000` for startBlock and `latest`
for endBlock.

```javascript
const txRequests = await requestFactory.getRequests(5665000)
console.log(txRequests)

// [ '0x720704a706d8d6b01167d3a5723c1fa50b1aec28' ]
```

### eac.RequestFactory.getRequestsByOwner(owner[, startBlock[, endBlock])
Takes required argument `owner` which is a valid ethereum address
and optional parameters `startBlock` and `endBlock`. If `startBlock` or
`endBlock` are not provided uses the same defaults as `this.getRequests()`. Returns a `Promise` which resolves to an array of transaction requests
addresses which are "owned" (created by) the passed in address. If the 
`owner` address has not created any transaction requests then it will
return an empty array.

```javascript
const owner = "0x92cb33fe17a75f0088a14c7718a29321fba026cd"
const txRequests = await requestFactory.getRequestsByOwner(owner)

console.log(txRequests)
// [ '0xe8cf252bed6c94d7119d0154d9318aa03c6ff38c' ]

// Then you can use it
const myRequest = await eac.transactionRequest(txRequests[0])
```