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

const getAccounts = web3 => {
    return new Promise((resolve, reject) => {
        web3.eth.getAccounts((err, accounts) => {
            if (!err) resolve(accounts)
            else reject(err)
        })
    })
}

async function main() {
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
    const TransactionRequestCore= getArtifact('TransactionRequestCore')

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
        transactionRequestCore

    return new Promise((resolve, reject) => {
        let ___
        getAccounts(web3)
        .then(accounts => {
            web3.eth.defaultAccount = accounts[0]
            ___ = {from: web3.eth.defaultAccount, gas: 7000000}
            return ExecutionLib.new(___)
        })
        .then(instance => {
            executionLib = instance
            return GroveLib.new(___)
        })
        .then(instance => {
            groveLib = instance
            return IterTools.new(___)
        })
        .then(instance => {
            iterTools = instance
            return MathLib.new(___)
        })
        .then(instance => {
            mathLib = instance
            return RequestMetaLib.new(___)
        })
        .then(instance => {
            requestMetaLib = instance
            return SafeMath.new(___)
        })
        .then(instance => {
            safeMath = instance
            return ClaimLib.new(___)
        })
        .then(instance => {
            claimLib = instance
            return PaymentLib.new(___)
        })
        .then(instance => {
            paymentLib = instance
            return RequestScheduleLib.new(___)
        })
        .then(instance => {
            requestScheduleLib = instance
            linkLibrary(RequestLib, mathLib)
            linkLibrary(RequestLib, paymentLib)
            linkLibrary(RequestLib, requestScheduleLib)
            return RequestLib.new(___)
        })
        .then(instance => {
            requestLib = instance
            linkLibrary(SchedulerLib, mathLib)
            linkLibrary(SchedulerLib, paymentLib)
            linkLibrary(SchedulerLib, requestLib)
            linkLibrary(SchedulerLib, safeMath)
            return SchedulerLib.new(___)
        })
        .then(instance => {
            schedulerLib = instance
            linkLibrary(RequestTracker, groveLib)
            linkLibrary(RequestTracker, mathLib)
            return RequestTracker.new(___)
        })
        .then(instance => {
            requestTracker = instance
            linkLibrary(TransactionRequestCore, claimLib)
            linkLibrary(TransactionRequestCore, executionLib)
            linkLibrary(TransactionRequestCore, mathLib)
            linkLibrary(TransactionRequestCore, paymentLib)
            linkLibrary(TransactionRequestCore, requestMetaLib)
            linkLibrary(TransactionRequestCore, requestLib)
            linkLibrary(TransactionRequestCore, requestScheduleLib)
            linkLibrary(TransactionRequestCore, safeMath)
            return TransactionRequestCore.new(___)
        })
        .then(instance => {
            transactionRequestCore = instance
            linkLibrary(RequestFactory, claimLib)
            linkLibrary(RequestFactory, mathLib)
            linkLibrary(RequestFactory, requestScheduleLib)
            linkLibrary(RequestFactory, iterTools)
            linkLibrary(RequestFactory, paymentLib)
            linkLibrary(RequestFactory, requestLib)
            linkLibrary(RequestFactory, requestTracker)
            return RequestFactory.new(
                requestTracker.address,
                transactionRequestCore.address,
                ___
            )
        })
        .then(instance => {
            requestFactory = instance
            linkLibrary(BlockScheduler, paymentLib)
            linkLibrary(BlockScheduler, schedulerLib)
            linkLibrary(BlockScheduler, requestScheduleLib)
            linkLibrary(BlockScheduler, requestLib)
            linkLibrary(BlockScheduler, mathLib)
            return BlockScheduler.new(requestFactory.address, web3.eth.defaultAccount, ___)
        })
        .then(instance => {
            blockScheduler = instance
            linkLibrary(TimestampScheduler, paymentLib)
            linkLibrary(TimestampScheduler, schedulerLib)
            linkLibrary(TimestampScheduler, requestScheduleLib)
            linkLibrary(TimestampScheduler, requestLib)
            linkLibrary(TimestampScheduler, mathLib)
            return TimestampScheduler.new(requestFactory.address, web3.eth.defaultAccount, ___)
        })
        .then(instance => {
            timestampScheduler = instance
            return Promise.resolve()
        })
        .then(___ => {
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

main()

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
