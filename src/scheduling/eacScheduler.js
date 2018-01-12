const { getABI } = require('../util.js')
const BigNumber = require('bignumber.js')

class EAC_Scheduler {

    constructor(web3, chain) {
        this.web3 = web3
        try {
            const contracts = require(`../assets/${chain}.json`)
            const BlockSchedulerABI = getABI('BlockScheduler')
            const TimestampSchedulerABI = getABI('TimestampScheduler')
            this.blockScheduler = new web3.eth.Contract(BlockSchedulerABI, contracts.blockScheduler)
            this.timestampScheduler = new web3.eth.Contract(TimestampSchedulerABI, contracts.timestampScheduler)
        } catch (err) {
            console.log(err)
        }
    }

    initSender(opts) {
        this.sender = opts.from
        this.gasLimit = opts.gas 
        this.sendValue = opts.value
    }

    setGas(gasLimit) {
        this.gasLimit = gasLimit
    }

    setSender(address) {
        // TODO verfiy with ethUtil
        this.sender = address
    }

    setSendValue(value) {
        this.sendValue = value
    }

    blockSchedule(
        toAddress,
        callData,
        callGas,
        callValue,
        windowSize,
        windowStart,
        gasPrice,
        donation,
        payment,
        requiredDeposit) {

        return this.blockScheduler.methods.schedule(
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
            from: this.sender,
            gas: this.gasLimit,
            value: this.sendValue
        })
    }

    timestampSchedule(
        toAddress,
        callData,
        callGas,
        callValue,
        windowSize,
        windowStart,
        gasPrice,
        donation,
        payment,
        requiredDeposit) {
        
            /// TODO autmoatically calculate endowmnet
        return this.timestampScheduler.methods.schedule(
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
            from: this.sender,
            gas: this.gasLimit,
            value: this.sendValue
        })
    }

    /**
     * Calculates the required endowment for scheduling a transactions
     * with the following parameters
     * @param {BigNumber} callGas 
     * @param {BigNumber} callValue 
     * @param {BigNumber} gasPrice 
     * @param {BigNumber} donation 
     * @param {BigNumber} payment 
     */
    calcEndowment(
        callGas,
        callValue,
        gasPrice,
        donation,
        payment) {

        return payment
               .plus(donation.times(2))
               .plus(callGas.times(gasPrice))
               .plus(gasPrice.times(180000))
               .plus(callValue)
    }
}

module.exports = EAC_Scheduler