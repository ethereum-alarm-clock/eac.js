const { BigNumber } = require('bignumber.js')
const Constants = require("./constants.js")
const ethUtil = require("ethereumjs-util")

const calcEndowment = (callGas, callValue, gasPrice, donation, payment) => {
	callGas = new BigNumber(callGas)
	callValue = new BigNumber(callValue)
	gasPrice = new BigNumber(gasPrice)
	donation = new BigNumber(donation)
	payment = new BigNumber(payment)

	return payment
		.plus(donation.times(2))
		.plus(callGas.times(gasPrice))
		.plus(gasPrice.times(180000))
		.plus(callValue)
}

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

/**
 * Promise resolves to the amount of gas from web3.eth.estimateGas
 * @param {Web3} web3
 * @param {Object} opts Ethereum object options, including `from`, `to`, `value`, and `data`
 */
const estimateGas = (web3, opts) => {
	return new Promise((resolve, reject) => {
		web3.eth.estimateGas(opts, (err, gas) => {
			if (!err) resolve(gas)
			else reject(err)
		})
	})
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

const getTimestamp = web3 => {
	return new Promise((resolve, reject) => {
		web3.eth.getBlock("latest", (err, block) => {
			if (!err) resolve(block.timestamp)
			else reject(err)
		})
	})
}

const getTimestampForBlock = async (web3, blockNum) => {
	const curBlockNum = await getBlockNumber(web3)
	if (blockNum > curBlockNum) {
		throw new Error(
			`Must pass in a blocknumber at or lower than the current blocknumber. Now: ${curBlockNum} | Tried: ${blockNum}`
		)
	}
	return new Promise((resolve, reject) => {
		web3.eth.getBlock(blockNum, (err, block) => {
			if (!err) resolve(block.timestamp)
			else reject(err)
		})
	})
}

const getTxRequestFromReceipt = receipt => {
	const log = receipt.logs.find(log => {
		return log.topics[0] === Constants.NEWREQUESTLOG
	})
	return "0x".concat(log.data.slice(-40))
}

/**
 * Returns the string argument of the detected network to be
 * passed into eacScheduler.
 * @param {Web3} web3
 */
const getChainName = web3 => {
	return new Promise((resolve, reject) => {
		web3.version.getNetwork((err, netID) => {
			if (!err) {
				if (netID == 1) {
					// return 'mainnet'
					reject("Not implemented for mainnet")
				} else if (netID == 3) {
					 resolve("ropsten")
				} else if (netID == 4) {
					 resolve("rinkeby")
				} else if (netID == 42) {
					 resolve("kovan")
				} else if (netID > 1517361627) {
					resolve("tester")
				} else {
					reject(err)
				}
			}
		})
	})
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

module.exports = web3 => {
	if (!web3) {
		return new Object({
			calcEndowment,
			checkNotNullAddress,
			checkValidAddress,
			estimateGas,
			getABI,
			getBalance,
			getBlockNumber,
			getChainName,
			getGasPrice,
			getTimestamp,
			getTimestampForBlock,
			getTxRequestFromReceipt,
			waitForTransactionToBeMined,
		})
	}

	return new Object({
		calcEndowment,
		checkNotNullAddress,
		checkValidAddress,
		estimateGas: opts => estimateGas(web3, opts),
		getABI,
		getBalance: address => getBalance(web3, address),
		getBlockNumber: () => getBlockNumber(web3),
		getChainName: () => getChainName(web3),
		getGasPrice: () => getGasPrice(web3),
		getTimestamp: () => getTimestamp(web3),
		getTimestampForBlock: blockNum => getTimestampForBlock(web3, blockNum),
		getTxRequestFromReceipt,
		waitForTransactionToBeMined: txHash => waitForTransactionToBeMined(web3, txHash)
	})
}
