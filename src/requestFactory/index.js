const Constants = require("../constants")
const Util = require("../util")

class RequestFactory {
	constructor(address, web3) {
		if (!Util.checkNotNullAddress(address)) {
			throw new Error(
				"Attempted to instantiate a RequestFactory class from a null address.",
			)
		}
		this.web3 = web3
		this.instance = this.web3.eth
			.contract(Util.getABI("RequestFactory"))
			.at(address)
	}

	get address() {
		return this.instance.address
	}

	getTrackerAddress() {
		return new Promise((resolve, reject) => {
			this.instance.requestTracker.call((err, trackerAddress) => {
				if (!err) resolve(trackerAddress)
				else reject(err)
			})
		})
	}

	/**
	 * Conveinence methods
	 */

	isKnownRequest(requestAddress) {
		return new Promise((resolve, reject) => {
			this.instance.isKnownRequest.call(
				requestAddress,
				(err, isKnown) => {
					if (!err) resolve(isKnown)
					else reject(err)
				},
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
		const address = require("../assets/ropsten.json").requestFactory
		return new RequestFactory(address, web3)
	}

	static initRinkeby() {
		throw new Error("Not implemented.")
	}

	static initKovan() {
		throw new Error("Not implemented.")
	}
}

module.exports = RequestFactory
