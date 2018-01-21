// const Scheduler = require('./index.js')

// const main = (chain, web3) => {
//     const eacScheduler = new Scheduler(web3, chain)
//     web3.eth.getAccounts()
//     .then(accounts => {
//         const me = accounts[0]
//         eacScheduler.initSender({
//             from: me,
//             gas: 3000000,
//             value: web3.toWei('500', 'finney')
//         })
//         return web3.eth.getBlockNumber()
//     })
//     .then(blockNum => {
//         const windowStart = blockNum + 12
//         const gasPrice = web3.toWei('100', 'gwei')
//         const requiredDeposit = web3.toWei('50', 'finney')

//         return eacScheduler.blockSchedule(
//             '0x009f7EfeD908c05df5101DA1557b7CaaB38EE4Ce',
//             web3.fromAscii('s0x'.repeat(
//                 Math.floor(Math.random() * 10)
//             )),
//             1212121,        //callGas
//             123454321,      //callValue
//             255,            //windowSize
//             windowStart,
//             gasPrice,
//             12,             //donation
//             24,             //payment
//             requiredDeposit
//         )
//     })
//     .then(receipt => {
//         // Gives a transaction receipt
//         if (receipt.status != 1) {
//             throw new Error(`Status Code ${receipt.status} ! Your transaction failed.`)
//         } else {
//             console.log(`Transaction mined! Hash: ${receipt.transactionHash}`)
//         }
//     })
//     .catch(err => {
//         console.error(err)
//     })

// }

// module.exports = main