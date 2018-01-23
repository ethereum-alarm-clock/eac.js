## eac.Scheduler

The Scheduler API of eac.js is a wrapper over both the Timestamp and 
Block based scheduling APIS of the Ethereum Alarm Clock. It 
attempts to abstract most of the complexity away from the user
so that you will only have to feed it the variables it wants.

### Constructor

Takes two arguments, a `web3` object and a `string` of the chain name
to instantiate the contracts for.

```javascript
const eacScheduler = new eac.Scheduler(web3, 'ropsten')

// Now using the canonical Ropsten contracts for 
// scheduling transactions.
```

### eac.Scheduler.getFactoryAddress()

Returns a `Promise` that resolves to the `address` of the 
Request Factory being used by the Scheduler.

### eac.Scheduler.initSender(opts)

Sets the sender for the scheduling transaction. The `opts` arguments is 
a JSON that contains the `from`, `gas`, and `value` parameters of an 
Ethereum transaction. See the example at the bottom for more context.

### eac.Scheduler.calcEndowment(callGas, callValue, gasPrice, donation, payment)

Takes in `BigNumber` arguments for `callGas`, `callValue`, `gasPrice`, `donation` and
`payment` variables of a `eac.TxRequest` and returns the a `BigNumber` of the required
`endowment` that must be sent to execute the transaction request.

### eac.Scheduler.blockSchedule(toAddress, callData, callGas, callValue, windowSize, windowStart, gasPrice, donation, payment, requiredDeposit)

 - `toAddress`     - an Ethereum address
 - `callData`      - hex encoded call data
 - `callGas` - `BigNumber` | String
 - `callValue` - `BigNumber` | String
 - `windowSize` - `BigNumber` | String
 - `windowStart` - `BigNumber` | String
 - `gasPrice` - `BigNumber` | String
 - `donation` - `BigNumber` | String
 - `payment` - `BigNumber` | String
 - `requiredDeposit` - `BigNumber` | String

Returns a `Promise` that will resolve to the `receipt` of the transaction if successful.

### eac.Scheduler.timestampSchedule(toAddress, callData, callGas, callValue, windowSize, windowStart, gasPrice, donation, payment, requiredDeposit)

 - `toAddress`     - an Ethereum address
 - `callData`      - hex encoded call data
 - `callGas` - `BigNumber` | String
 - `callValue` - `BigNumber` | String
 - `windowSize` - `BigNumber` | String
 - `windowStart` - `BigNumber` | String
 - `gasPrice` - `BigNumber` | String
 - `donation` - `BigNumber` | String
 - `payment` - `BigNumber` | String
 - `requiredDeposit` - `BigNumber` | String

Returns a `Promise` that will resolve to the `receipt` of the transaction if successful.