## eac.Scheduler

The Scheduler API of eac.js is a wrapper over both the Timestamp and 
Block based scheduling APIS of the Ethereum Alarm Clock. It 
attempts to abstract most of the complexity away from the user
so that you will only have to feed it the variables it wants.

### Constructor

Returns a `Promise` that resolves a new instance of a `eac.Scheduler`
class. Uses the canonical Ethereum Alarm Clock contracts for the same
chain as the Web3 object was initiated on.

```javascript
const eacScheduler = await eac.scheduler()
```

### eac.Scheduler.getFactoryAddress()

Returns a `Promise` that resolves to the `address` of the 
Request Factory being used by the Scheduler.

```javascript
const factoryAddr = eacScheduler.getFactoryAddress()

const requestFactory = await eac.requestFactory()

console.log(factoryAddr == requestFactory.address)
// true
```

### eac.Scheduler.initSender(opts)

Sets the sender for the scheduling transaction. The `opts` arguments is 
a JSON that contains the `from`, `gas`, and `value` parameters of an 
Ethereum transaction. See the example at the bottom for more context.
Normally in web3 you would pass this object in as the lat argument
to a `web3.eth.sendTransaction()` call. eac.js requires you to pass
it in before instead.

See the example below.

### eac.Scheduler.blockSchedule(toAddress, callData, callGas, callValue, windowSize, windowStart, gasPrice, donation, payment, requiredDeposit, waitForMined = true)

 - `toAddress`     - an Ethereum address
 - `callData`      - hex encoded call data
 - `callGas` - `BigNumber` | String
 - `callValue` - `BigNumber` | String
 - `windowSize` - `BigNumber` | Stringn
 - `windowStart` - `BigNumber` | String
 - `gasPrice` - `BigNumber` | String
 - `donation` - `BigNumber` | String
 - `payment` - `BigNumber` | String
 - `requiredDeposit` - `BigNumber` | String
 - `waitForMined` - Boolean

Returns a `Promise` that will resolve to the `receipt` of the transaction if successful.

```javascript
const endowment = eac.Util.calcEndowment(
    new BigNumber(callGas),
    new BigNumber(callValue),
    new BigNumber(gasPrice),
    new BigNumber(donation),
    new BigNumber(payment)
)

eacScheduler.initSender({
    from: web3.eth.defaultAccount,
    gas: 3000000,
    value: endowment
})

const receipt = await eacScheduler.blockSchedule(
    toAddress,
    web3.fromAscii(callData),
    callGas,
    callValue,
    windowSize,
    windowStart,
    gasPrice,
    donation,
    payment,
    requiredDeposit
)
```

### eac.Scheduler.timestampSchedule(toAddress, callData, callGas, callValue, windowSize, windowStart, gasPrice, donation, payment, requiredDeposit, waitForMined = true)

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
 - `waitForMined` - Boolean

Returns a `Promise` that will resolve to the `receipt` of the transaction if successful.