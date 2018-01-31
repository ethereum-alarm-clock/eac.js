const Constants = require("./constants")
const RequestFactory = require("./requestFactory")
const RequestTracker = require("./requestTracker")
const Scheduler = require("./scheduling")
const TxRequest = require("./txRequest")
const Util = require("./util")

module.exports = web3 => {

	if (!web3) {
		return new Object({
			Constants,
			RequestFactory,
			RequestTracker,
			Scheduler,
			TxRequest,
			Util: Util(),
		})
	}

	const util = Util(web3)
	return new Object({
		Constants,
		requestFactory: async () => {
			const chainName = await util.getChainName()
			const contracts = require(`./assets/${chainName}.json`)
			return new RequestFactory(contracts.requestFactory, web3)
		},
		requestTracker: async () => {
			const chainName = await util.getChainName()
			const contracts = require(`./assets/${chainName}.json`)
			return new RequestTracker(contracts.requestTracker, contracts.requestFactory, web3)
		},
		scheduler: async () => {
			const chainName = await util.getChainName()
			return new Scheduler(web3, chainName)
		},
		transactionRequest: (address) => {
			return new TxRequest(address, web3)
		},
		Util: util,
	})
}