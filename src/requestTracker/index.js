const { BigNumber } = require("bignumber.js")
const Constants = require("../constants")
const Util = require("../util")()

class RequestTracker {
	constructor(address, requestFactoryAddress, web3) {
		if (!Util.checkNotNullAddress(address)) {
			throw new Error(
				"Attempted to instantiate a RequestTracker class from a null address."
			)
		}
		this.web3 = web3
		this.instance = this.web3.eth
			.contract(Util.getABI("RequestTracker"))
			.at(address)
		this.setFactory(requestFactoryAddress)
	}

	get address() {
		return this.instance.address
	}

	setFactory(factoryAddress) {
		this.factory = factoryAddress
	}

	checkFactory() {
		if (!this.factory) {
			throw new Error("Must set the factory address first!")
		}
	}

	/**
	 * Convenience methods
	 */

	nextFromLeft(left) {
		this.checkFactory()
		return new Promise((resolve, reject) => {
			this.instance.query.call(
				this.factory,
				Constants.GTE_HEX,
				left,
				(err, next) => {
					if (!err) resolve(next)
					else reject(err)
				}
			)
		})
	}

	windowStartFor(txRequestAddress) {
		this.checkFactory()
		return new Promise((resolve, reject) => {
			this.instance.getWindowStart.call(
				this.factory,
				txRequestAddress,
				(err, windowStart) => {
					if (!err) resolve(windowStart)
					else reject(err)
				}
			)
		})
	}

	nextRequest(txRequestAddress) {
		this.checkFactory()
		return new Promise((resolve, reject) => {
			this.instance.getNextRequest.call(
				this.factory,
				txRequestAddress,
				(err, next) => {
					if (!err) resolve(next)
					else reject(err)
				}
			)
		})
	}

	/**
	 * Chain inits
	 */

	static initMainnet() {
		throw new Error("Not implemented.")
	}

	static initRopsten(web3) {
		const address = require("../assets/ropsten.json").requestTracker
		return new RequestTracker(address, web3)
	}

	static initRinkeby() {
		throw new Error("Not implemented.")
	}

	static initKovan(web3) {
		const address = require("../assets/kovan.json").requestTracker
		return new RequestTracker(address, web3)
	}
}

module.exports = RequestTracker
