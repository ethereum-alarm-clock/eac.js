const { BigNumber } = require('bignumber.js')

const RequestData = require('./requestData')

const Constants = require('../constants')
const Util = require('../util')

class TxRequest {
    constructor(address, web3) {
        if (!Util.checkNotNullAddress(address)) {
            throw new Error('Attempted to instantiate a TxRequest class from a null address.')
        }
        this.web3 = web3
        this.instance = this.web3.eth.contract(Util.getABI('TransactionRequest')).at(address)
    }

    get address () {
        return this.instance.address
    }

    /**
     * Window centric getters
     */

    get claimWindowSize () {
        return this.data.schedule.claimWindowSize
    }

    get claimWindowStart () {
        return this.windowStart.minus(this.freezePeriod).minus(this.claimWindowSize)
    }

    get claimWindowEnd () {
        return this.claimWindowStart.plus(this.claimWindowSize)
    }

    get freezePeriod () {
        return this.data.schedule.freezePeriod
    }

    get freezePeriodStart () {
        return this.windowStart.plus(this.claimWindowSize)
    }

    get freezePeriodEnd () {
        return this.claimWindowEnd.plus(this.freezePeriod)
    }

    get temporalUnit () {
        return this.data.schedule.temporalUnit
    }

    get windowSize () {
        return this.data.schedule.windowSize
    }

    get windowStart () {
        return this.data.schedule.windowStart
    }

    get reservedWindowSize () {
        return this.data.schedule.reservedWindowSize
    }

    get reservedWindowEnd () {
        return this.windowStart.plus(this.reservedWindowSize)
    }

    get executionWindowEnd () {
        return this.windowStart.plus(this.windowSize)
    }

    /**
     * Dynamic getters
     */

    now () {
        if (this.temporalUnit == 1) {
            return new BigNumber(this.web3.eth.blockNumber)
        } else if (this.temporalUnit == 2) {
            const block = this.web3.eth.getBlock('latest')
            return new BigNumber(block.timestamp)
        } else {
            throw new Error(`Unrecognized temporal unit: ${this.temporalUnit}`)
        }
    }

    beforeClaimWindow () {
        const now = this.now()
        return this.claimWindowStart.greaterThan(now)
    }

    inClaimWindow () {
        const now = this.now()
        return this.claimWindowStart.lessThanOrEqualTo(now) &&
                this.claimWindowEnd.greaterThan(now)
    }

    inFreezePeriod () {
        const now = this.now()
        return this.claimWindowEnd.lessThanOrEqualTo(now) &&
                this.freezePeriodEnd.greaterThan(now)
    }

    inExecutionWindow () {
        const now = this.now()
        return this.windowStart.lessThanOrEqualTo(now) &&
                this.executionWindowEnd.greaterThanOrEqualTo(now)
    }

    inReservedWindow () {
        const now = this.now()
        return this.windowStart.lessThanOrEqualTo(now) &&
                this.reservedWindowEnd.greaterThan(now)
    }

    afterExecutionWindow () {
        const now = this.now()
        return this.executionWindowEnd.lessThan(now)
    }

    /**
     * Claim props/methods
     */
    
    get claimedBy () {
        return this.data.claimData.claimedBy
    }

    get isClaimed () {
        return this.data.claimData.claimedBy !== Constants.NULL_ADDRESS
    }

    isClaimedBy (address) {
        return this.claimedBy === address
    }
 
    get requiredDeposit () {
        return this.data.claimData.requiredDeposit
    }

    claimPaymentModifier () {
        const now = this.now()
        const elapsed = now.minus(this.claimWindowStart)
        return elapsed.times(100).dividedToIntegerBy(this.claimWindowSize)
    }

    /**
     * Meta
     */

    get isCancelled () {
        return this.data.meta.isCancelled
    }

    get wasCalled () {
        return this.data.meta.wasCalled
    }

    get owner () {
        return this.data.meta.owner
    }

    /**
     * TxData
     */

    get toAddress () {
        return this.data.txData.toAddress
    }

    get callGas () {
        return this.data.txData.callGas
    }

    get gasPrice () {
        return this.data.txData.gasPrice
    }

    get donation () {
        return this.data.paymentData.donation
    }

    get payment () {
        return this.data.paymentData.payment
    }

    /**
     * Call Data
     */

    callData () {
        return this.instance.callData()
    }

    /**
     * Data management
     */

    fillData () {
        const requestData = RequestData.from(this.instance)
        this.data = requestData
        return true
    }

    async refreshData () {
        if (!this.data) {
            return this.fillData()
        }
        return this.data.refresh()
    }

    /**
     * ABI convenience functions
     */

    get claimData () {
        return this.instance.claim.getData()
    }

    get executeData () {
        return this.instance.execute.getData()
    }

    get cancelData () {
        return this.instance.cancel.getData()
    }

    /**
     * Action Wrappers
     */

    claim (params) {
        return new Promise((resolve, reject) => {
            const txHash = this.instance.claim(params)
            Util.waitForTransactionToBeMined(this.web3, txHash)
            .then(receipt => resolve(receipt))
            .catch(err => reject(err))
        })
    }

    execute (params) {
        return new Promise((resolve, reject) => {
            const txHash = this.instance.execute(params)
            Util.waitForTransactionToBeMined(this.web3, txHash)
            .then(receipt => resolve(receipt))
            .catch(err => reject(err))
        })
    }

    cancel (params) {
        return new Promise((resolve, reject) => {
            const txHash = this.instance.cancel(params)
            Util.waitForTransactionToBeMined(this.web3, txHash)
            .then(receipt => resolve(receipt))
            .catch(err => reject(err))
        })
    }

    /**
     * Misc.
     */

    getBalance () {
        const bal = this.web3.eth.getBalance(this.address)
        return new BigNumber(bal)
    }
}

module.exports = TxRequest