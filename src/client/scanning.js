const { BigNumber } = require('bignumber.js');
const { GTE_HEX, NULL_ADDRESS } = require('../constants.js')
const { TxRequest } = require('../index.js')

const store = (conf, txRequest) => {
    const log = conf.logger

    if (conf.cache.has(txRequest.address)) {
        log.cache(`Cache already contains ${txRequest.address}`)
        return
    }
    log.info(`Storing found txRequest at address ${txRequest.address}`)
    conf.cache.set(txRequest.address, txRequest.windowStart)
}

const scanBlockchain = async conf => {
    const log = conf.logger 
    const web3 = conf.web3

    const left = web3.eth.blockNumber - 15
    const right = left + 75
    log.debug(`Scanning bounds from ${left} to ${right}`)

    const requestTracker = conf.tracker 
    const requestFactory = conf.factory

    requestTracker.setFactory(requestFactory.address)

    let nextRequestAddress = await requestTracker.nextFromLeft(left)

    if (nextRequestAddress === NULL_ADDRESS) {
        log.info(`No new requests.`)
        return
    }

    while (nextRequestAddress !== NULL_ADDRESS) {
        log.debug(`Found request - ${nextRequestAddress}`)

        // Verify that the request is known to the factory we are validating with.
        if (!await requestFactory.isKnownRequest(nextRequestAddress)) {
            log.error(`Encountered unknown request~ factory: ${requestFactory.address} | query: ">=" | value ${left} | address: ${nextRequestAddress}`)
            throw new Error(`Encountered unknown address! Please check that you are using the correct contracts JSON file.`)
        }

        const trackerWindowStart = await requestTracker.windowStartFor(nextRequestAddress)
        
        const txRequest = new TxRequest(nextRequestAddress, web3)
        await txRequest.fillData()

        if (!txRequest.windowStart.equals(trackerWindowStart)) {
            // The data between the txRequest we have and from the requestTracker do not match.
            log.error(`Data mismatch between txRequest and requestTracker. Double check contract addresses.`)
        } else if (txRequest.windowStart.lessThanOrEqualTo(right)) {
            // This request is within bounds, store it.
            store(conf, txRequest)
        } else {
            log.debug(`Scan exit condition hit! Next window start exceeds right bound.`)
            break
        }
        nextRequestAddress = requestTracker.nextRequest(txRequest.address)

        // Hearbeat
        if (nextRequestAddress === NULL_ADDRESS) { log.info('No new requests.') }
    }
}

const { routeTxRequest } = require('./routing.js')

const scanCache = async conf => {
    if (conf.cache.len() === 0) return //nothing stored in cache
    
    const allTxRequests = conf.cache.stored().map(address => new TxRequest(address, conf.web3))

    allTxRequests.forEach(txRequest => {
        // console.log(txRequest)
        txRequest.refreshData()
        .then(_ => routeTxRequest(conf, txRequest))
    })
}

module.exports = {
    scanBlockchain,
    scanCache
}
