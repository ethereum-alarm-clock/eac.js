
const fs = require('fs')
const net = require('net')

const Promise = require('bluebird')
const Tx = require('ethereumjs-tx');
const ethUtil = require('ethereumjs-util')
const Web3 = require('web3')

const GETH_IPC_PATH = '/home/logan/ethereum/privnets/battery/geth.ipc'

const verbose = true 
const log = msg => {
    if (verbose) console.log(msg)
}

const numAccounts = 5

let web3 = new Web3()
web3.setProvider(GETH_IPC_PATH, net)
log(`Web3.js version: ${web3.version}`)
log(`OS Platform: ${process.platform}`)
log(`Current Provider path: ${web3.currentProvider.path}`)

web3.eth.isMining().then(isMining => {
    log(`Geth is ${isMining ? '' : 'not'} mining`)
})

web3.eth.getAccounts().then(accounts => {
    log(`Accounts in private network: ${accounts.length}`)
})

// let promises = new Array()
// for (let i = 0; i < numAccounts; i++) {
//     promises.push(
//         web3.eth.personal.newAccount(GENERIC_PASSWORD)
//         .then(newAccountAddress => {
//             log(`New Account Created with address: ${newAccountAddress}`)
//             return Promise.resolve(newAccountAddress)
//         })
//     )
// }

const rawRead = fs.readFileSync('privKeys.txt', 'utf-8')
const privKeys = rawRead.split('\n').slice(0, numAccounts)

web3.eth.getAccounts()
.then(accounts => {
    web3.eth.defaultAccount = accounts[0]

    return Promise.map(privKeys, privKey => {
        const pkBuf = Buffer.from(privKey, 'hex')
        const addrBuf = ethUtil.privateToAddress(pkBuf)
        const addr = addrBuf.toString('hex')

        return web3.eth.sendTransaction({
            from: web3.eth.defaultAccount,
            to: addr,
            value: web3.utils.toWei('1.2', 'ether'),
            gas: 3000000,
        })
    }, {concurrency: 9})
})
.then(receipts => {
    const addresses = new Array()
    receipts.forEach(receipt => {
        addresses.push(receipt.to)
        fs.appendFileSync('receipts', JSON.stringify(receipt) + '\n')
    })

    return web3.eth.getBlockNumber()
})
.then(blockNum => {
    const windowStart = blockNum
    const gasPrice = web3.utils.toWei('55', 'gwei')
    const requiredDeposit = web3.utils.toWei('50', 'finney')

    const contracts = require(`../assets/battery.json`)
    const { getABI } = require('../util.js')
    const BlockSchedulerABI = getABI('BlockScheduler')

    const blockScheduler = new web3.eth.Contract(
        BlockSchedulerABI, 
        contracts.blockScheduler
    )

    const data = blockScheduler.methods.schedule(
        '0x7d38f4ad24794ee16455db765b290e6d651b88f6',
        web3.utils.utf8ToHex('this-is-call-data'),
        [
            1212121,    //callGas
            123454321,  //callValue
            255,        //windowSize
            windowStart,
            gasPrice,
            12,         //donation
            24,         //payment
            requiredDeposit
        ]
    ).encodeABI()

    return Promise.map(privKeys, async privKey => {
        const pkBuf = Buffer.from(privKey, 'hex')
        const addrBuf = ethUtil.privateToAddress(pkBuf)
        const addr = addrBuf.toString('hex')

        const nonce = await getNonce(addr)

        const rawTx = {
            nonce: nonce,
            gasPrice: '0x2540BE400',
            gasLimit: 3000000,
            to: blockScheduler.options.address,
            value: '0xDE0B6B3A7640000',
            data: data
        }

        const tx = new Tx(rawTx)
        tx.sign(pkBuf)

        const serializedTransaction = tx.serialize()
        return web3.eth.sendSignedTransaction('0x' + serializedTransaction.toString('hex'))
            .on('receipt', receipt => log(receipt))
            .on('error', log)
    }, {concurrency: 9})
    
})

const getNonce = addr => {
    return web3.eth.getTransactionCount(addr)
}


// Promise.all(promises)
// .then(async accounts => {
//     web3.eth.defaultAccount = (await web3.eth.getAccounts())[0]
//     log(`Funding new accounts from ${web3.eth.defaultAccount}`)

//     let promises = new Array()
//     for (let i =0; i < accounts.length; i++) {
//         promises.push(
//             web3.eth.sendTransaction({
//                 from: web3.eth.defaultAccount,
//                 to: accounts[i],
//                 value: web3.utils.toWei('1.2', 'ether'),
//                 gas: 3000000,
//             })
//             .then(txReceipt => {
//                 log(`Funding transaction sent!`)
//                 return Promise.resolve(txReceipt)
//             })
//         )
//     }

//     return Promise.all(promises)
// })
// .then(async txReceipts => {
//     let accounts = new Array()
//     txReceipts.forEach(receipt => {
//         if (receipt.status != '0x1') {
//             log(`Aborted benchmarking, a transaction was not successful.`)
//             process.exit(1)
//         }
//         accounts.push(receipt.to)
//     })

//     log('Successfully funded accounts.')
//     return Promise.resolve(accounts)
// })
// .then(async accounts => {

//     const windowStart = await web3.eth.getBlockNumber()
//     const gasPrice = web3.utils.toWei('55', 'gwei')
//     const requiredDeposit = web3.utils.toWei('50', 'finney')

//     const contracts = require(`../assets/battery.json`)
//     const { getABI } = require('../util.js')
//     const BlockSchedulerABI = getABI('BlockScheduler')

//     const blockScheduler = new web3.eth.Contract(
//         BlockSchedulerABI, 
//         contracts.blockScheduler
//     )
    
//     accounts.forEach(account => {
//         const isUnlocked = web3.eth.personal.unlockAccount(account, GENERIC_PASSWORD)
//         log(`Unlocked ${account}`)
//         return blockScheduler.methods.schedule(
//             '0x7d38f4ad24794ee16455db765b290e6d651b88f6',
//             web3.utils.utf8ToHex('this-is-call-data'),
//             [
//                 1212121,    //callGas
//                 123454321,  //callValue
//                 255,        //windowSize
//                 windowStart,
//                 gasPrice,
//                 12,         //donation
//                 24,         //payment
//                 requiredDeposit
//             ]
//         ).send({
//             from: account,
//             gas: 3000000,
//             value: web3.utils.toWei('500', 'finney'),
//             gasPrice: gasPrice
//         })
//         .then(log)
//     })
// })
