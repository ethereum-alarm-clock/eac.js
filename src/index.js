/* eslint global-require: "off", import/no-dynamic-require: "off" */

const Constants = require("./constants")
const RequestFactory = require("./requestFactory")
const RequestTracker = require("./requestTracker")
const Scheduler = require("./scheduling")
const TxRequest = require("./txRequest")
const Util = require("./util")
const alarmClient = require("./client/main")

module.exports = (web3) => {
  if (!web3) {
    return {
      Constants,
      RequestFactory,
      RequestTracker,
      Scheduler,
      TxRequest,
      Util: Util(),
      AlarmClient
    }
  }

  const util = Util(web3)

  return {
    Constants,
    requestFactory: async () => {
      const chainName = await util.getChainName()
      const contracts = require(`./assets/${chainName}.json`)
      return new RequestFactory(contracts.requestFactory, web3)
    },
    requestTracker: async () => {
      const chainName = await util.getChainName()
      const contracts = require(`./assets/${chainName}.json`)
      return new RequestTracker(
        contracts.requestTracker,
        contracts.requestFactory,
        web3
      )
    },
    scheduler: async () => {
      const chainName = await util.getChainName()
      const contracts = require(`./assets/${chainName}.json`)
      return new Scheduler(
        contracts.blockScheduler,
        contracts.timestampScheduler,
        web3
      )
    },
    transactionRequest: address => new TxRequest(address, web3),
    Util: util,
    AlarmClient
  }
}
