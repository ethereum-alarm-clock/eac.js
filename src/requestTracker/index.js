const { BigNumber } = require('bignumber.js');
const Constants = require('../constants')
const Util = require('../util')

class RequestTracker {
    constructor(address, web3) {
        if (!Util.checkNotNullAddress(address)) {
            throw new Error('Attempted to instantiate a RequestTracker class from a null address.')
        }
        this.web3 = web3
        this.instance = new this.web3.eth.Contract(
            Util.getABI('RequestTracker'),
            address
        )
    }

    get address () {
        return this.instance.options.address
    }

    setFactory (factoryAddress) {
        this.factory = factoryAddress
    }

    checkFactory () {
        if (!this.factory) {
            throw new Error('Must set the factory address first!')
        }
    }

    /**
     * Convenience methods
     */

    async nextFromLeft (left) {
        this.checkFactory()
        const next = await this.instance.methods.query(
            this.factory,
            Constants.GTE_HEX,
            left
        ).call()
        return next
    }

    async windowStartFor (txRequestAddress) {
        this.checkFactory()
        const windowStart = await this.instance.methods.getWindowStart(
            this.factory,
            txRequestAddress
        ).call()
        return new BigNumber(windowStart)
    }

    async nextRequest (txRequestAddress) {
        this.checkFactory()
        const next = await this.instance.methods.getNextRequest(
            this.factory,
            txRequestAddress
        ).call()
        return next
    }

    /**
     * Chain inits
     */

    static initMainnet () {
        throw new Error('Not implemented.')
    }

    static initRopsten (web3) {
        const address = require('../assets/ropsten.json').requestTracker
        return new RequestTracker(address, web3)
    }

    static initRinkeby () {
        throw new Error('Not implemented.')
    }

    static initKovan () {
        throw new Error('Not implemented.')
    }
}

module.exports = RequestTracker