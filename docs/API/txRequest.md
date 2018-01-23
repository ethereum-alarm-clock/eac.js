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

### eac.TxRequest.refreshData()

Async function that will return a `Promise` that resolves to `true` if the
data is successfully refreshed/updated. Use this method after you have already filled
the data on a transaction request and want to update its values. For example, you
might use it if the transaction request was recently cancelled.

```javascript
console.log(txReqeuest.isCancelled) //false

await txRequest.cancel({
    from: web3.eth.defaultAccount,
    value: 0,
    gas: 3000000,
    gasPrice: web3.toWei('20', 'gwei')
})

// Outdated data
console.log(txReqeuest.isCancelled) //false

// Must refresh the data now.
await txRequest.refreshData()
console.log(txRequest.isCancelled) //true
```

### eac.TxRequest.now()

Returns a `Promise` that will resolve to the `blockNumber` or `timestamp`
of the latest ethereum block, depnding on the internal `temporalUnit` of
the transaction request.

### eac.TxRequest.beforeClaimWindow()

Returns a `Promise` that will resolve to `true` if the transaction request
is not yet in the claim window and `false` if is after the claim window start. You can check
the claim window start time by using the property `eac.TxRequest.claimWindowStart`.

### eac.TxRequest.inClaimWindow()

Returns a `Promise` that will resolve to `true` if the transaction request
is inside the claim window and `false` if not. You could also determine this yourself
using the property `eac.TxRequest.claimWindowEnd` which would return the claim window
end time.

### eac.TxRequest.inFreezePeriod()

Returns a `Promise` that will resolve to `true` if the transaction request
is currently in the freeze (aka lock-down) period and `false` if not.

### eac.TxRequest.inExecutionWindow()

Returns a `Promise` that will resolve to `true` if the transaction request is
currently in the execution window and `false` if not.

### eac.TxRequest.inReservedWindow()

Returns a `Promise` that will resolve to `true` if the transaction request is
currently in the reserved execution window and `false` if not. The reserved execution
window is the first portion of the execution window which is reserved to be executed
by the account that has claimed it in the previous claim window.

### eac.TxRequest.afterExecutionWindow()

Returns a `Promise` that will resolve to `true` if the transaction request is
currently after the execution window and `false` if not.

### eac.TxRequest.claimedBy

Property that returns the `account` that has claimed the transaction request.

### eac.TxRequest.isClaimed

Property that returns `true` if the transaction request is claimed.

### eac.TxRequest.isClaimedBy(account)

Method that returns `true` if the transaction request is claimed by
the passed in `account` argument.

### eac.TxRequest.requiredDeposit

Property that returns a `BigNumber` containing the required deposit
that must be sent with the `claim()` transaction in order for
an account to claim a transaction request.

### eac.TxRequest.claimPaymentModifier()

Method that returns a `Promise` that will resolve to a `BigNumber` containing
the payment modifier for the current time during the claim period. The claim
payment starts at 0% and increases to 100% during the claim window. This method
will return that number.

### eac.TxRequest.isCancelled

Property that returns `true` if the transaction request has been cancelled
by its owner.

### eac.TxRequest.wasCalled

Property that returns `true` if the transaction request has already
been executed.

### eac.TxRequest.owner

Property that returns the `address` of the owner/creator of the transaction request.

### eac.TxRequest.toAddress

Returns the `address` that the transaction request will be send to when it is executed.

### eac.TxRequest.callGas

Returns the a `BigNumber` containing the `callGas` in wei that the transaction request will
send when its executed.

### eac.TxRequest.callValue

Returns the a `BigNumber` containing the `callValue` in wei that the transaction request will
send when its executed.

### eac.TxRequest.gasPrice

Returns the a `BigNumber` containing the `gasPrice` in wei that the transaction request will
send when its executed.

### eac.TxRequest.donation

Returns the a `BigNumber` containing the `donation` in wei that the transaction request will
send when its executed.

### eac.TxRequest.payment

Returns the a `BigNumber` containing the `payment` in wei that the transaction request will
send when its executed.

### eac.TxRequest.callData()

Returns a `Promise` that will resolve to the `callData` that the transaction request
will send when its executed.

### eac.TxRequest.claim(params)

`Params` is a standard ethereum transaction object passed in as JSON and including the variables, `from`, `gas`, `gasPrice`, and `value`. Will attempt to claim a transaction request and returns a `Promise`
that will resolve to the `receipt` of the transaction if it's successful.

### eac.TxRequest.execute(params)

`Params` is a standard ethereum transaction object passed in as JSON and including the variables, `from`, `gas`, `gasPrice`, and `value`. Will attempt to execute a transaction request and returns a `Promise`
that will resolve to the `receipt` of the transaction if it's successful.

### eac.TxRequest.cancel(params)

`Params` is a standard ethereum transaction object passed in as JSON and including the variables, `from`, `gas`, `gasPrice`, and `value`. Will attempt to cancel a transaction request and returns a `Promise`
that will resolve to the `receipt` of the transaction if it's successful.