const BigNumber = require("bignumber.js")
const Util = require("../util")

class Scheduler {
	constructor(web3, chain) {
		this.web3 = web3
		try {
			const contracts = require(`../assets/${chain}.json`)
			const BlockSchedulerABI = Util.getABI("BlockScheduler")
			const TimestampSchedulerABI = Util.getABI("TimestampScheduler")
			this.blockScheduler = web3.eth
				.contract(BlockSchedulerABI)
				.at(contracts.blockScheduler)
			this.timestampScheduler = web3.eth
				.contract(TimestampSchedulerABI)
				.at(contracts.timestampScheduler)
		} catch (err) {
			throw new Error(err)
		}
	}

	getFactoryAddress() {
		return new Promise((resolve, reject) => {
			this.blockScheduler.factoryAddress.call((err, address) => {
				if (!err) resolve(address)
				else reject(err)
			})
		})
	}

	initSender(opts) {
		this.sender = opts.from
		this.gasLimit = opts.gas
		this.sendValue = opts.value
	}

	setGas(gasLimit) {
		this.gasLimit = gasLimit
	}

	setSender(address) {
		// TODO verfiy with ethUtil
		this.sender = address
	}

	setSendValue(value) {
		this.sendValue = value
	}

	blockSchedule(
		toAddress,
		callData,
		callGas,
		callValue,
		windowSize,
		windowStart,
		gasPrice,
		donation,
		payment,
		requiredDeposit
	) {
		return new Promise((resolve, reject) => {
			this.blockScheduler.schedule.sendTransaction(
				toAddress,
				callData,
				[
					callGas,
					callValue,
					windowSize,
					windowStart,
					gasPrice,
					donation,
					payment,
					requiredDeposit,
				],
				{
					from: this.sender,
					gas: this.gasLimit,
					value: this.sendValue,
				},
				(err, txHash) => {
					if (err) reject(err)
					else {
						Util.waitForTransactionToBeMined(this.web3, txHash)
							.then(receipt => resolve(receipt))
							.catch(err => reject(err))
					}
				}
			)
		})
	}

	timestampSchedule(
		toAddress,
		callData,
		callGas,
		callValue,
		windowSize,
		windowStart,
		gasPrice,
		donation,
		payment,
		requiredDeposit
	) {
		return new Promise((resolve, reject) => {
			const txHash = this.timestampScheduler.schedule(
				toAddress,
				callData,
				[
					callGas,
					callValue,
					windowSize,
					windowStart,
					gasPrice,
					donation,
					payment,
					requiredDeposit,
				],
				{
					from: this.sender,
					gas: this.gasLimit,
					value: this.sendValue,
				},
				(err, txHash) => {
					if (err) reject(err)
					else
						Util.waitForTransactionToBeMined(this.web3, txHash)
							.then(receipt => resolve(receipt))
							.catch(err => reject(err))
				}
			)
		})
	}

	/**
	 * Calculates the required endowment for scheduling a transactions
	 * with the following parameters
	 * @param {BigNumber} callGas
	 * @param {BigNumber} callValue
	 * @param {BigNumber} gasPrice
	 * @param {BigNumber} donation
	 * @param {BigNumber} payment
	 */
	calcEndowment(callGas, callValue, gasPrice, donation, payment) {
		return payment
			.plus(donation.times(2))
			.plus(callGas.times(gasPrice))
			.plus(gasPrice.times(180000))
			.plus(callValue)
	}

	/**
	 * Chain inits
	 */

	static initMainnet() {
		throw new Error("Not implemented.")
	}

	static initRopsten(web3) {
		return new Scheduler(web3, "ropsten")
	}

	static initRinkeby() {
		throw new Error("Not implemented.")
	}

	static initKovan(web3) {
		return new Scheduler(web3, "kovan")
	}
}

module.exports = Scheduler
