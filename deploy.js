// Deploy script used for testing
const Web3 = require('web3')
const Ganache = require('ganache-core')
const provider = Ganache.provider({
    "gasLimit": 7000000,
    "locked" : false
})
const web3 = new Web3(provider)

const TruffleContract = require('truffle-contract')

const getArtifact = name => {
    const contract = TruffleContract(require(`./src/build/contracts/${name}.json`))
    contract.setProvider(provider)
    contract.detectNetwork()
    return contract
}

async function main() {
    web3.eth.defaultAccount = web3.eth.accounts[0]

    // const BaseScheduler = getArtifact('BaseScheduler')
    const BlockScheduler        = getArtifact('BlockScheduler')
    const ClaimLib              = getArtifact('ClaimLib')
    const ExecutionLib          = getArtifact('ExecutionLib')
    const GroveLib              = getArtifact('GroveLib')
    const IterTools             = getArtifact('IterTools')
    const MathLib               = getArtifact('MathLib')
    const PaymentLib            = getArtifact('PaymentLib')
    const RequestFactory        = getArtifact('RequestFactory')
    const RequestLib            = getArtifact('RequestLib')
    const RequestMetaLib        = getArtifact('RequestMetaLib')
    const RequestScheduleLib    = getArtifact('RequestScheduleLib')
    const RequestTracker        = getArtifact('RequestTracker')
    const SafeMath              = getArtifact('SafeMath')
    const SchedulerLib          = getArtifact('SchedulerLib')
    const TimestampScheduler    = getArtifact('TimestampScheduler')
    const TransactionRequest    = getArtifact('TransactionRequest')

    let blockScheduler,
        claimLib,
        executionLib,
        groveLib,
        iterTools,
        mathLib,
        paymentLib,
        requestFactory,
        requestLib,
        requestMetaLib,
        requestScheduleLib,
        requestTracker,
        safeMath,
        schedulerLib,
        timestampScheduler,
        transactionRequest

    const _ = {from: web3.eth.defaultAccount, gas: 7000000}

    return new Promise((resolve, reject) => {
        ExecutionLib.new(_)
        .then(instance => {
            executionLib = instance 
            return GroveLib.new(_)
        })
        .then(instance => {
            groveLib = instance 
            return IterTools.new(_)
        })
        .then(instance => {
            iterTools = instance
            return MathLib.new(_)
        })
        .then(instance => {
            mathLib = instance
            return RequestMetaLib.new(_)
        })
        .then(instance => {
            requestMetaLib = instance
            return SafeMath.new(_)
        })
        .then(instance => {
            safeMath = instance
            return ClaimLib.new(_)
        })
        .then(instance => {
            claimLib = instance
            return PaymentLib.new(_)
        })
        .then(instance => {
            paymentLib = instance
            return RequestScheduleLib.new(_)
        })
        .then(instance => {
            requestScheduleLib = instance
            linkLibrary(RequestLib, mathLib)
            linkLibrary(RequestLib, paymentLib)
            linkLibrary(RequestLib, requestScheduleLib)
            return RequestLib.new(_)
        })
        .then(instance => {
            requestLib = instance
            linkLibrary(SchedulerLib, mathLib)
            linkLibrary(SchedulerLib, paymentLib)
            linkLibrary(SchedulerLib, requestLib)
            linkLibrary(SchedulerLib, safeMath)
            return SchedulerLib.new(_)
        })
        .then(instance => {
            schedulerLib = instance
            linkLibrary(RequestTracker, groveLib)
            linkLibrary(RequestTracker, mathLib)
            return RequestTracker.new(_)
        })
        .then(instance => {
            requestTracker = instance
            linkLibrary(RequestFactory, claimLib)
            linkLibrary(RequestFactory, mathLib)
            linkLibrary(RequestFactory, requestScheduleLib)
            linkLibrary(RequestFactory, iterTools)
            linkLibrary(RequestFactory, paymentLib)
            linkLibrary(RequestFactory, requestLib)
            linkLibrary(RequestFactory, requestTracker)
            return RequestFactory.new(requestTracker.address, _)
        })
        .then(instance => {
            requestFactory = instance
            linkLibrary(BlockScheduler, paymentLib)
            linkLibrary(BlockScheduler, schedulerLib)
            linkLibrary(BlockScheduler, requestScheduleLib)
            linkLibrary(BlockScheduler, requestLib)
            linkLibrary(BlockScheduler, mathLib)
            return BlockScheduler.new(requestFactory.address, _)
        })
        .then(instance => {
            blockScheduler = instance
            linkLibrary(TimestampScheduler, paymentLib)
            linkLibrary(TimestampScheduler, schedulerLib)
            linkLibrary(TimestampScheduler, requestScheduleLib)
            linkLibrary(TimestampScheduler, requestLib)
            linkLibrary(TimestampScheduler, mathLib)
            return TimestampScheduler.new(requestFactory.address, _)
        })
        .then(instance => {
            timestampScheduler = instance
            return Promise.resolve()
        })
        .then(_ => {
            const contracts = {
                requestTracker: requestTracker.address,
                requestFactory: requestFactory.address,
                blockScheduler: blockScheduler.address,
                timestampScheduler: timestampScheduler.address
            }
            const fs = require('fs')
            fs.writeFileSync('./src/assets/tester.json', JSON.stringify(contracts))
            resolve({
                // Ganache attached web3
                web3: web3,
                // Truffle contracts with methods attached
                requestTracker: requestTracker,
                requestFactory: requestFactory,
                blockScheduler: blockScheduler,
                timestampScheduler: timestampScheduler
            })
        })
        .catch(err => reject(err))
    })
}

module.exports = main

// Some Utils that can be abstracted to another module later
const linkLibrary = (contract, lib) => {
    const bytecode = contract.bytecode
    const libAddr = lib.address.slice(2) // takes off the '0x'
    const libName = lib.constructor._json.contractName
    const stringToReplace = `__${libName}`.padEnd(40, '_')
    assert(libAddr.length === stringToReplace.length, 'Search string must match the length of library address.')
    const newBytecode = replaceBytecode(bytecode, stringToReplace, libAddr)
    contract.bytecode = newBytecode
    return contract
}

const replaceBytecode = (bytecode, stringToReplace, newString) => {
    if (bytecode.indexOf(stringToReplace) != -1) {
        bytecode = bytecode.replace(stringToReplace, newString)
        return replaceBytecode(bytecode, stringToReplace, newString)
    }
    return bytecode
}

const assert = (condition, errMsg) => {
    if (!condition) throw new Error(errMsg)
}