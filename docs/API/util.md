## eac.Util

Provides convenience and utility functions for working with web3
and the Ethereum Alarm Clock contracts. The nice part about this module 
is that it uses the same web3 object provided during the initiation
of `eac.js` and provides Promise wrappers over Web3 callbacks.

### eac.Util.calcEndowment(callGas, callValue, gasPrice, donation, payment)

Takes in `String|Number|BigNumber` arguments for `callGas`, `callValue`,
`gasPrice`, `donation` and `payment` variables of a to-be scheduled
transaction and returns a `BigNumber` of the required endowment to be
sent to successful send the scheduling transaction.

_See [here](./scheduler) under `eac.Scheduler.blockSchedule()` for an example_

### eac.Util.checkNotNullAddress(address)

Returns `true` if the address is not equal to the NULL_ADDRESS (0x0...0)
and `false` if the address is the NULL_ADDRESS.

### eac.Util.checkValidAddress(address)

Similar to `.checkNotNullAddress()` but performs a checksum validation 
as well to make the address is valid. Returns `true` if it passes and
`false` if validation fails.

### eac.Util.estimateGas(opts)

Takes `opts` variable being the options to an Ethereum transaction in JSON
form. EX.

```
{
    from: web3.eth.defaultAccount,
    to: requestFactory.address,
    data: 0xF620Abcc...
}
```

and returns a `Promise` that will resolve to the estimated gas cost of
the transaction or reject with an error.

### eac.Util.getBalance(address)

Takes a valid Ethereum `address` and returns a `Promise` that will resolve
to a `BigNumber` of the balance of that address in wei.

### eac.Util.getBlockNumber()

Returns a `Promise` that resolves to the latest block number.

### eac.Util.getGasPrice()

Returns a `Promise` that resolves to the latest average estimated
gas price.

### eac.Util.getTimestamp()

Returns a `Promise` that resolves to the timestamp of the latest
block.

### eac.Util.getTimestampForBlock(blockNum)

Takes a block number `blockNum` and returns a `Promise` that will resolve
to the timestamp of that block or reject the error.

### eac.Util.getTxRequestFromReceipt(receipt)

Takes the `receipt` from a `eac.Scheduler.schedule()` transaction and
pulls out the address of the transaction request that was scheduled in
that scheduling transaction.