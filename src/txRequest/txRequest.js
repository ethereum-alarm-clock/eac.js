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
        this.instance = new this.web3.eth.Contract(
            Util.getABI('TransactionRequest'),
            address
        )
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
        return async () => {
            if (this.temporalUnit == 1) {
                return this.web3.eth.getBlockNumber()
            } else if (this.temporalUnit == 2) {
                const block = await this.web3.eth.getBlock('latest')
                return block.timestamp
            } else {
                throw new Error(`Unrecognized temporal unit: ${this.temporalUnit}`)
            }
        }
    }

    beforeClaimWindow () {
        return async () => {
            const now = await this.now()
            return this.claimWindowStart.greaterThan(now)
        }
    }

    inClaimWindow () {
        return async () => {
            const now = await this.now()
            return this.claimWindowStart.lessThanOrEqualTo(now) &&
                    this.claimWindowEnd.greaterThan(now)
        }
    }

    inFreezePeriod () {
        return async () => {
            const now = await this.now()
            return this.claimWindowEnd.lessThanOrEqualTo(now) &&
                    this.freezePeriodEnd.greaterThan(now)
        }
    }

    inExecutionWindow () {
        return async () => {
            const now = await this.now()
            return this.windowStart.lessThanOrEqualTo(now) &&
                    this.executionWindowEnd.greaterThanOrEqualTo(now)
        }
    }

    inReservedWindow () {
        return async () => {
            const now = await this.now()
            return this.windowStart.lessThanOrEqualTo(now) &&
                    this.reservedWindowEnd.greaterThan(now)
        }
    }

    afterExecutionWindow () {
        return async () => {
            const now = await this.now()
            return this.executionWindowEnd.lessThan(now)
        }
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
        return async () => {
            const now = await this.now()
            const elapsed = now.minus(this.claimWindowStart)
            return elapsed.times(100).divideToIntegerBy(this.claimWindowSize).toNumber()
        }
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

    get callGas () {
        return this.data.txData.callGas
    }

    get gasPrice () {
        return this.data.txData.gasPrice
    }

    get payment () {
        return this.data.paymentData.payment
    }

    /**
     * Data management
     */

    fillData () {
        return async () => {
            const requestData = await RequestData.from(this.instance)
            this.data = requestData
            return true
        }
    }

    refreshData () {
        return async () => {
            if (!this.data) {
                return this.fillData()
            }
            return this.data.refresh()
        }
    }
}

module.exports = TxRequest