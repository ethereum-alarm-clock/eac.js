const schedule = (
    web3,
    chain,
    toAddress,
    callData,
    callGas,
    callValue,
    windowSize,
    windowStart,
    gasPrice,
    donation,
    payment,
    requiredDeposit) => {

    const contracts = require(`./assets/${chain}.json`)
    const { getABI } = require('./util.js')
    const BlockSchedulerABI = getABI('BlockScheduler')

    const blockScheduler = new web3.eth.Contract(
        BlockSchedulerABI,
        contracts.blockScheduler
    )

    return blockScheduler.methods.schedule(
        toAddress,
        callData,
        [
            callGas,
            callValue,
            windowSize,
            windowStart,
            gasPrice,
            donation,
            payment,
            requiredDeposit
        ]
    ).send({
        from: web3.eth.defaultAccount,
        gas: 3000000,
        value: web3.utils.toWei('300', 'finney')
    })
}

module.exports = schedule