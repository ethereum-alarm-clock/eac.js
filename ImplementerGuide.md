# Ethereum Alarm Clock GUI Implementation Guide
This guide is an attempt to provide information to ease the process of an implementation of a graphical front-end on the Ethereum Alarm Clock service. It should be a document that you can consult to understand what parameters you need to include and the user cases to cover while building your interface.

## What will be implemented?
A graphical interface to the Ethereum Alarm Clock. User functionalities will include the ability to schedule a transaction in a cohesive flow. It may also include the ability to manually execute a transaction request (althought for the most past this will be done more efficiently by clients such as `eac.js`)

## Basics
The ethereum alarm clock consists of a collection of smart contracts that interoperate with each other on-chain. Whenever a user schedules a new transaction, it will use these contracts to deploy a new contract that contains all of the execution data set by the user. The contracts keep track of this `transaction request` in a database contract that exposes a public API to be queriable by off-chain code.

Servers that are running an execution client will be scanning the blockchain for scheduled `transaction requests` and sending claim or execution transactions to them. For the most part, clients will be doing most of the execution work "behind the scenes" for users and ideally, they will never have to worry about their transaction being executed on time.

In order to provide incentive to execution clients, when users schedule transactions they will include a `payment` variable.

_If you would like a complete introduction to the Ethereum Alarm Clock infrastructure, we recommend the official docs._

## Types of Schedulers
You will be working with the high-level APIs of the Scheduler contracts. There are two types of Scheduler, a `TimestampScheduler` and a `BlockScheduler`. The only difference between these two is the unit of time that each accepts for its scheduling paremeters. As you might guess, the `TimestampScheduler` requires all input to be as a [Unix timestamp](https://www.unixtimestamp.com/) while the `BlockScheduler` takes in input as Ethereum block numbers. Otherwise, both Schedulers have the same public function `schedule()` to accept input.

```
function schedule(address   _toAddress,
                  bytes     _callData,
                  uint[8]   _uintArgs)
    doReset
    public payable returns (address);
```


