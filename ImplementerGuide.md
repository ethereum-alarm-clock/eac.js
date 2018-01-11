# Ethereum Alarm Clock GUI Implementation Guide
This guide is an attempt to provide information to ease the process of an implementation of a graphical front-end on the Ethereum Alarm Clock service. It should be a document that you can consult to understand what parameters you need to include and the user cases to cover while building your interface.

## What will be implemented?
A graphical interface to the Ethereum Alarm Clock. User functionalities will include the ability to schedule a transaction in a cohesive flow. It may also include the ability to manually execute a transaction request (althought for the most past this will be done more efficiently by clients such as `eac.js`)

## Basics
The ethereum alarm clock consists of a collection of smart contracts that interoperate with each other on-chain. Whenever a user schedules a new transaction, it will use these contracts to deploy a new contract that contains all of the execution data set by the user. The contracts keep track of this `transaction request` in a database contract that exposes a public API to be queriable by off-chain code.

Servers that are running an execution client will be scanning the blockchain for scheduled `transaction requests` and sending claim or execution transactions to them. Clients will be doing most of the execution work "behind the scenes" for users and ideally, they will never have to worry about their transaction being executed on time.

In order to provide incentive to execution clients, when users schedule transactions they will include a `payment` variable.

_If you would like a complete introduction to the Ethereum Alarm Clock infrastructure, we recommend the official docs._

## Schedulers
You will be working with the high-level APIs of the Scheduler contracts. There are two types of Scheduler, a `TimestampScheduler` and a `BlockScheduler`. The only difference between these two is the unit of time that each accepts for its scheduling paremeters. As you might guess, the `TimestampScheduler` requires all input to be as a [Unix timestamp](https://www.unixtimestamp.com/) while the `BlockScheduler` takes in input as Ethereum block numbers. Otherwise, both Schedulers have the same public function `schedule()` to accept input. Here is the Solidity interface:

```
function schedule(address   _toAddress,
                  bytes     _callData,
                  uint[8]   _uintArgs)
    doReset
    public payable returns (address);
```

### Schedule params
The schedule function takes three parameters, an Ethereum address, an array of bytes (a Javascript `Buffer`), and an array of eight unsigned integers. The eight unsigned integers are:

* _uintArgs [0] The __callGas__ to be sent with the scheduled transaction.
* _uintArgs [1] The __callValue__ to be sent with the scheduled transaction.
* _uintArgs [2] The execution __windowSize__.
* _uintArgs [3] The (block or timestamp) of the execution __windowStart__.
* _uintArgs [4] The __gasPrice__ which will be used to execute this transaction.
* _uintArgs [5] The __donation__ value attached to this transaction.
* _uintArgs [6] The __payment__ value attached to this transaction.
* _uintArgs [7] The __requiredDeposit__ to claim this transaction.

The scheduling party must also send enough value to cover the `endowment` of the transaction request. The `endowment` is calculated like so:
```
endowment = payment + donation * 2 + callGas * gasPrice + 180000 * gasPrice + callValue
```

The `endowment` is required because the scheduler of the transaction must pay all the gas costs, as well as cover the value and the `payment` and `donation` costs up front.  

### Validation
The Schedulers will use the `RequestFactory` contract to perform some verification checks on the input it recieves and bubble up a `ValidationError` event if one is encountered. The front-end GUI should be able to read these events if they happen and notify the use why their transaction was not able to go through. However, it may be better if the front-end code employed validation checks to prevent the error ever reaching the blockchain.

Some verification check you will need to be aware of include:

#### Insufficient Endowment
The amount sent in the transaction must be __at least__ the sum computed as the `endowment`. 
#### Call Gas too High
The maximum callGas sent with the transaction is the `current_network_gasLimit - 140000` where `140000` is the gas overhead of execution.
#### Empty To Address
The `toAddress` cannot be a null address `0x0000000000000000000000000000000000000000`

For a full list of `ValidationError` see [this page](https://ethereum-alarm-clock.readthedocs.io/en/latest/request_factory.html#validation) of the docs.

_To be continued..._