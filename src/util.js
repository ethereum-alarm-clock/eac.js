const Constants = require('./constants.js')

const checkNotNullAddress = address => {
    if (address === Constants.NULL_ADDRESS) return false
    return true
}

/// Requires a case sensitive name of the contract and will return the ABI if found.
const getABI = name => {
    const json = require(`${__dirname}/build/contracts/${name}.json`)
    return json.abi
}

/**
 * Returns the string argument of the detected network to be 
 * passed into eacScheduler.
 * @param {Web3} web3 
 */
const getChainName = web3 => {
    const networkID = web3.version.network
    if (networkID == 1) {
        // return 'mainnet'
        throw new Error('Not implemented for mainnet')
    } else if (networkID == 3) {
        return 'ropsten'
    } else if (networkID == 4) {
        return 'rinkeby'
    } else {
        throw new Error('Invalid network.')
    }
}

const waitForTransactionToBeMined = (web3, txHash, interval) => {
    interval = interval ? interval : 500
    const txReceiptAsync = (txHash, resolve, reject) => {
        try {
            let receipt = web3.eth.getTransactionReceipt(txHash)
            if (receipt == null) {
                setTimeout(() => {
                    txReceiptAsync(txHash, resolve, reject)
                }, interval)
            } else {
                resolve(receipt)
            }
        } catch (err) {
            reject(err)
        }
    }
    return new Promise((resolve, reject) => {
        txReceiptAsync(txHash, resolve, reject)
    })
}

module.exports = {
    checkNotNullAddress,
    getABI,
    getChainName,
    waitForTransactionToBeMined
}