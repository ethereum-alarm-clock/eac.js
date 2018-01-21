const Scheduler = require('./index.js')

const main = async (chain, web3) => {
    const eacScheduler = new Scheduler(web3, chain)
    const me = web3.eth.accounts[0]
    eacScheduler.initSender({
        from: me,
        gas: 3000000,
        value: web3.toWei('500', 'finney')
    })

    const windowStart = await web3.eth.getBlockNumber() + 120
    const gasPrice = web3.toWei('100', 'gwei')
    const requiredDeposit = 1//web3.toWei('50', 'finney')

    try {
        const receipt = await eacScheduler.blockSchedule(
            '0x009f7EfeD908c05df5101DA1557b7CaaB38EE4Ce',
            web3.fromAscii('s0x'.repeat(
                Math.floor(Math.random() * 10)
            )),
            1212121,        //callGas
            123454321,      //callValue
            255,            //windowSize
            windowStart,
            gasPrice,
            12,             //donation
            2400000000,             //payment
            requiredDeposit 
        )

        if (receipt.status != 1) {
            throw new Error(`Status Code ${receipt.status} ! Your transaction failed.`)
        } else {
            console.log(`Transaction mined! Hash: ${receipt.transactionHash}`)
        }
    } catch (err) {
        console.error(err)
    }
}

module.exports = main