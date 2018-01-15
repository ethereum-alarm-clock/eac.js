const Scheduler = require('./eacScheduler.js')
const BigNumber = require('bignumber.js')

const main = async (chain, web3) => {
    const eacScheduler = new Scheduler(web3, chain)
    const me = (await web3.eth.getAccounts())[0]

    const windowStart = await web3.eth.getBlockNumber() + 50
    const gasPrice = web3.utils.toWei('100', 'gwei')
    const requiredDeposit = 1

    const callGas = 1212121
    const callValue = 123454321
    const donation = 50
    const payment = web3.utils.toWei('500', 'finney')

    const endowment = eacScheduler.calcEndowment(
        new BigNumber(callGas),
        new BigNumber(callValue),
        new BigNumber(gasPrice),
        new BigNumber(donation),
        new BigNumber(payment)
    )

    eacScheduler.initSender({
        from: me,
        gas: 3000000,
        value: endowment
    })

    return eacScheduler.blockSchedule(
        '0x009f7EfeD908c05df5101DA1557b7CaaB38EE4Ce',
        web3.utils.utf8ToHex('s0x'.repeat(
            Math.floor(Math.random() * 10)
        )),
        callGas,
        callValue,
        255,            //windowSize
        windowStart,
        gasPrice,
        donation,             //donation
        payment,             //payment
        requiredDeposit 
    )
}

module.exports = main