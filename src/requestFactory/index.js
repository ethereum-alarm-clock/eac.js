const Constants = require("../constants")
const Util = require("../util")()

class RequestFactory {
	constructor(address, web3) {
		if (!Util.checkNotNullAddress(address)) {
			throw new Error(
				"Attempted to instantiate a RequestFactory class from a null address."
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
				}
			)
		})
	}

	validateRequestParams(addressArgs, uintArgs, callData, endowment) {
		return new Promise((resolve, reject) => {
			this.instance.validateRequestParams.call(
				addressArgs,
				uintArgs,
				callData,
				endowment,
				(err, isValid) => {
					if (!err) resolve(isValid)
					else reject(err)
				}
			)
		})
	}

	/**
	 * Parses the boolean returned by validateRequestParams() and returns the reason validation failed.
	 * @param {Array<boolean>} isValid The array returned by this.validateRequestParams()
	 * @return {Array<String>} An array of the strings of validation errors or an array of length 0 if no errors.
	 */
	parseIsValid(isValid) {
		if (isValid.length != 6) {
			throw new Error(
				"Must pass an array of booleans returned by validateRequestParams()"
			)
		}
		const Errors = [
			"InsufficientEndowment",
			"ReservedWindowBiggerThanExecutionWindow",
			"InvalidTemporalUnit",
			"ExecutionWindowTooSoon",
			"CallGasTooHigh",
			"EmptyToAddress",
		]
		let errors = new Array()
		isValid.forEach((boolIsTrue, index) => {
			if (!boolIsTrue) {
				errors.push(Errors[index])
			}
		})
		return errors
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

	static initKovan(web3) {
		const address = require("../assets/kovan.json").requestFactory
		return new RequestFactory(address, web3)
	}
}

module.exports = RequestFactory