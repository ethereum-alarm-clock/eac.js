const { getABI } = require('../util.js')
const BlockSchedulerABI = getABI('BlockScheduler')

const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('http://localhost:8545')
const web3 = new Web3(provider)

const spamTx = async num => {

    // Load the Battery contracts
    const contracts = require('../assets/battery.json')

    const secondary = (await web3.eth.getAccounts())[1]

    // Now send a scheduling transaction from each account that 
    //  will be scheduled to executed in the same block.
    const blockScheduler = new web3.eth.Contract(
        BlockSchedulerABI, 
        contracts.blockScheduler
    )
    
    const gasPrice = web3.utils.toWei('100', 'gwei')
    const requiredDeposit = web3.utils.toWei('50', 'finney')
    const windowStart = await web3.eth.getBlockNumber() + 12

    let morePromises = []
    let morePromises2 = []
    let morePromises3 = []
    let counter = 0
    while (counter < num) {
        morePromises.push(
            blockScheduler.methods.schedule(
                '0x009f7EfeD908c05df5101DA1557b7CaaB38EE4Ce',
                web3.utils.utf8ToHex('s0x'.repeat(
                    Math.floor(Math.random() * 10)
                )),
                [
                    1212121,        //callGas
                    123454321,      //callValue
                    255,            //windowSize
                    windowStart,
                    gasPrice,
                    12,             //donation
                    24,             //payment
                    requiredDeposit
                ]
            ).send({
                from: secondary, 
                gas: 3000000, 
                value: web3.utils.toWei('500', 'finney'),
                gasPrice: gasPrice,
            })
        )
        counter++
    }
    counter = 0
    while (counter < num) {
        morePromises.push(
            blockScheduler.methods.schedule(
                '0x009f7EfeD908c05df5101DA1557b7CaaB38EE4Ce',
                web3.utils.utf8ToHex('s0x'.repeat(
                    Math.floor(Math.random() * 10)
                )),
                [
                    1212121,        //callGas
                    123454321,      //callValue
                    255,            //windowSize
                    windowStart +1,
                    gasPrice,
                    12,             //donation
                    24,             //payment
                    requiredDeposit
                ]
            ).send({
                from: secondary, 
                gas: 3000000, 
                value: web3.utils.toWei('500', 'finney'),
                gasPrice: gasPrice,
            })
        )
        counter++
    }
    counter = 0
    while (counter < num) {
        morePromises2.push(
            blockScheduler.methods.schedule(
                '0x009f7EfeD908c05df5101DA1557b7CaaB38EE4Ce',
                web3.utils.utf8ToHex('s0x'.repeat(
                    Math.floor(Math.random() * 10)
                )),
                [
                    1212121,        //callGas
                    123454321,      //callValue
                    255,            //windowSize
                    windowStart +2,
                    gasPrice,
                    12,             //donation
                    24,             //payment
                    requiredDeposit
                ]
            ).send({
                from: secondary, 
                gas: 3000000, 
                value: web3.utils.toWei('500', 'finney'),
                gasPrice: gasPrice,
            })
        )
        counter++
    }
    counter = 0
    while (counter < num) {
        morePromises2.push(
            blockScheduler.methods.schedule(
                '0x009f7EfeD908c05df5101DA1557b7CaaB38EE4Ce',
                web3.utils.utf8ToHex('s0x'.repeat(
                    Math.floor(Math.random() * 10)
                )),
                [
                    1212121,        //callGas
                    123454321,      //callValue
                    255,            //windowSize
                    windowStart +3,
                    gasPrice,
                    12,             //donation
                    24,             //payment
                    requiredDeposit
                ]
            ).send({
                from: secondary, 
                gas: 3000000, 
                value: web3.utils.toWei('500', 'finney'),
                gasPrice: gasPrice,
            })
        )
        counter++
    }
    counter = 0
    while (counter < num) {
        morePromises3.push(
            blockScheduler.methods.schedule(
                '0x009f7EfeD908c05df5101DA1557b7CaaB38EE4Ce',
                web3.utils.utf8ToHex('s0x'.repeat(
                    Math.floor(Math.random() * 10)
                )),
                [
                    1212121,        //callGas
                    123454321,      //callValue
                    255,            //windowSize
                    windowStart +4,
                    gasPrice,
                    12,             //donation
                    24,             //payment
                    requiredDeposit
                ]
            ).send({
                from: secondary, 
                gas: 3000000, 
                value: web3.utils.toWei('500', 'finney'),
                gasPrice: gasPrice,
            })
        )
        counter++
    }

    Promise.all(morePromises)
    .then(transactions => {
        processTransactions(transactions)
        console.log(transactions.length)
        Promise.all(morePromises2)
        .then(transactions => {
            // TODO process transactions
            console.log(transactions.length)
            Promise.all(morePromises3)
            .then(transactions => {
                // TODO process transactions
                console.log(transactions.length)
            })
        })
    })

}

const processTransactions = transactions => {
    console.log(transactions[0])
}

spamTx(5)
.catch(err => console.error(err))