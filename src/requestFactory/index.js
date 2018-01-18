const Constants = require('../constants')
const Util = require('../util')

class RequestFactory {
    constructor(address, web3) {
        if (!Util.checkNotNullAddress(address)) {
            throw new Error('Attempted to instantiate a RequestFactory class from a null address.')
        }
        this.web3 = web3
        this.instance = new this.web3.eth.Contract(
            Util.getABI('RequestFactory'),
            address
        )
    }

    get address () {
        return this.instance.options.address
    }

    /**
     * Conveinence methods
     */

    async isKnownRequest (requestAddress) {
        const isKnown = await this.instance.methods.isKnownRequest(requestAddress).call()
        return isKnown
    }

    /**
     * Chain inits
     */

    static initMainnet () {
        throw new Error('Not implemented.')
    }

    static initRopsten (web3) {
        const address = require('../assets/ropsten.json').requestFactory
        return new RequestFactory(address, web3)
    }

    static initRinkeby () {
        throw new Error('Not implemented.')
    }

    static initKovan () {
        throw new Error('Not implemented.')
    }
}

module.exports = RequestFactory