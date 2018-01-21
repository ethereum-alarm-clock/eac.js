const Constants = require('./constants.js')
const ethUtil = require('ethereumjs-util')

const checkNotNullAddress = address => {
    if (address === Constants.NULL_ADDRESS) return false
    return true
}

const checkValidAddress = address => {
    if (!ethUtil.isValidAddress(address)) {
        return false
    }
    return true
}

/// Requires a case sensitive name of the contract and will return the ABI if found.
const getABI = name => {
    const json = require(`${__dirname}/build/contracts/${name}.json`)
    return json.abi
}

const getBalance = (web3, address) => {
    return new Promise((resolve, reject) => {
        web3.eth.getBalance(address, (err, bal) => {
            if (!err) resolve(bal)
            else reject(err)
        })
    })
}

const getBlockNumber = web3 => {
    return new Promise((resolve, reject) => {
        web3.eth.getBlockNumber((err, blockNum) => {
            if (!err) resolve(blockNum)
            else reject(err)
        })
    })
}

const getGasPrice = web3 => {
    return new Promise((resolve, reject) => {
        web3.eth.getGasPrice((err, gasPrice) => {
            if (!err) resolve(gasPrice)
            else reject(err)
        })
    })
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
        web3.eth.getTransactionReceipt(txHash, (err, receipt) => {
            if (err) {
                reject(err)
            } else if (receipt == null) {
                setTimeout(() => {
                    txReceiptAsync(txHash, resolve, reject)
                }, interval)
            } else {
                resolve(receipt)
            }
        })
    }
    return new Promise((resolve, reject) => {
        txReceiptAsync(txHash, resolve, reject)
    })
}

module.exports = {
    checkNotNullAddress,
    checkValidAddress,
    getABI,
    getBalance,
    getBlockNumber,
    getGasPrice,
    getChainName,
    waitForTransactionToBeMined
}