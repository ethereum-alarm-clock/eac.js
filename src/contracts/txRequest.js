const { BigNumber } = require('bignumber.js');
const { getABI } = require('../util.js')
const { RequestData } = require('./requestData.js')
const { NULL_ADDRESS } = require('../constants.js')

class TxRequest {

    constructor(address, web3) {
        this.address = address 
        this.web3 = web3
        this.instance = new this.web3.eth.Contract(
            getABI('TransactionRequest'),
            this.address
        )
    }

    async now () {
        return await this.web3.eth.getBlockNumber()
    }

    getWindowStart () {
        return this.data.schedule.windowStart
    }

    windowStart () {
        return this.data.schedule.windowStart
    }

    getWindowSize () {
        return this.data.schedule.windowSize
    }

    wasCalled () {
        return this.data.meta.wasCalled
    }

    claimWindowStart () {
        return this.windowStart().minus(this.data.schedule.freezePeriod).minus(this.data.schedule.claimWindowSize)
    }

    claimWindowEnd() {
        return this.claimWindowStart().plus(this.data.schedule.claimWindowSize)
    }

    async beforeClaimWindow () {
        return this.claimWindowStart().greaterThan(await this.now())
    }

    async inClaimWindow () {
        const now = await this.now()
        return this.claimWindowStart().lessThanOrEqualTo(now) && this.claimWindowEnd().greaterThan(now)
    }

    freezePeriodEnd () {
        return this.claimWindowEnd().plus(this.data.schedule.freezePeriod)
    }

    async inFreezePeriod () {
        const now = await this.now()
        return this.claimWindowEnd().lessThanOrEqualTo(now) && this.freezePeriodEnd().greaterThan(now)
    }

    isClaimed () {
        return this.data.claimData.claimedBy !== NULL_ADDRESS
    }

    isClaimedBy (addr) {
        return this.data.claimData.claimedBy === addr
    }

    claimedBy () {
        return this.data.claimData.claimedBy
    }

    isCancelled() {
        return this.data.meta.isCancelled
    }

    executionWindowEnd () {
        return this.data.schedule.windowStart.plus(this.data.schedule.windowSize)
    }

    async inExecutionWindow() {
        const now = await this.now()
        return this.windowStart().lessThanOrEqualTo(now) && afterExecutionWindow.greaterThanOrEqualTo(now)
    }

    async afterExecutionWindow () {
        return this.executionWindowEnd().lessThanOrEqualTo(await this.now())
    }

    reservedExecutionWindowEnd() {
        return this.windowStart().plus(this.data.schedule.reservedWindowSize)
    }

    async inReservedWindow() {
        return this.windowStart().lessThanOrEqualTo(now) && this.reservedExecutionWindowEnd().greaterThan(now)
    }

    callGas () {
        return this.data.txData.callGas
    }

    gasPrice () {
        return this.data.txData.gasPrice
    }

    getOwner () {
        return this.data.meta.owner
    }

    getPayment () {
        return this.data.paymentData.payment
    }

    async fillData () {
        const requestData = await RequestData.from(this.instance)
        this.data = requestData
    }

    async refreshData() {
        if (!this.data) {
            return await this.fillData()
        } 
        return await this.data.refresh()
    }

    async claimPaymentModifier () {
        const now = new BigNumber(await this.now())
        return now.minus(this.claimWindowStart()).times(100).dividedToIntegerBy(this.data.schedule.claimWindowSize).toNumber()
    }

    getRequiredDeposit () {
        return this.data.claimData.requiredDeposit
    }

}

module.exports.TxRequest = TxRequest