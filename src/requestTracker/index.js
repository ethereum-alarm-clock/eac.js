const { BigNumber } = require('bignumber.js');
const Constants = require('../constants')
const Util = require('../util')

class RequestTracker {
    constructor(address, web3) {
        if (!Util.checkNotNullAddress(address)) {
            throw new Error('Attempted to instantiate a RequestTracker class from a null address.')
        }
        this.web3 = web3
        this.instance = this.web3.eth.contract(Util.getABI('RequestTracker')).at(address)
    }

    get address () {
        return this.instance.address
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

    nextFromLeft (left) {
        this.checkFactory()
        const next = this.instance.query.call(
            this.factory,
            Constants.GTE_HEX,
            left
        )
        return next
    }

    windowStartFor (txRequestAddress) {
        this.checkFactory()
        const windowStart = this.instance.getWindowStart.call(
            this.factory,
            txRequestAddress
        )
        return windowStart
    }

    nextRequest (txRequestAddress) {
        this.checkFactory()
        const next = this.instance.getNextRequest.call(
            this.factory,
            txRequestAddress
        )
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