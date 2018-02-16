/* eslint class-methods-use-this: "off" */

const Util = require("../util")()

class RequestFactory {
  constructor(address, web3) {
    if (!Util.checkNotNullAddress(address)) {
      throw new Error("Attempted to instantiate a RequestFactory class from a null address.")
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
      this.instance.isKnownRequest.call(requestAddress, (err, isKnown) => {
        if (!err) resolve(isKnown)
        else reject(err)
      })
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
   * Parses the boolean returned by validateRequestParams() and returns the
   * reason validation failed.
   * @param {Array<boolean>} isValid The array returned by this.validateRequestParams()
   * @return {Array<String>} An array of the strings of validation errors or an
   * array of length 0 if no errors.
   */
  parseIsValid(isValid) {
    if (isValid.length != 6) {
      throw new Error("Must pass an array of booleans returned by validateRequestParams()")
    }
    const Errors = [
      "InsufficientEndowment",
      "ReservedWindowBiggerThanExecutionWindow",
      "InvalidTemporalUnit",
      "ExecutionWindowTooSoon",
      "CallGasTooHigh",
      "EmptyToAddress",
    ]
    const errors = []
    isValid.forEach((boolIsTrue, index) => {
      if (!boolIsTrue) {
        errors.push(Errors[index])
      }
    })
    return errors
  }

  async getRequestCreatedLogs(filter, startBlock, endBlock) {
    const f = filter || {}
    const curBlock = await Util.getBlockNumber(this.web3)
    const start = startBlock || (curBlock - 5000 > 0 ? curBlock - 5000 : 0)
    const end = endBlock || "latest"
    const event = this.instance.RequestCreated(
      f,
      { fromBlock: start, toBlock: end }
    )
    return new Promise((resolve, reject) => {
      event.get((err, logs) => {
        if (!err) {
          resolve(logs)
        } else reject(err)
      })
    })
  }

  async getRequests(startBlock, endBlock) {
    const logs = await this.getRequestCreatedLogs({}, startBlock, endBlock)
    const requests = []
    logs.forEach((log) => {
      requests.push(log.args.request)
    })
    return requests
  }

  async getRequestsByOwner(owner, startBlock, endBlock) {
    const logs = await this.getRequestCreatedLogs({
      owner: owner
    }, startBlock, endBlock)
    const requests = []
    logs.forEach((log) => {
      requests.push(log.args.request)
    })
    return requests
  }

  /**
   * Chain inits
   */

  // static initMainnet() {
  //   throw new Error("Not implemented.")
  // }

  // static initRopsten(web3) {
  //   const address = require("../assets/ropsten.json").requestFactory
  //   return new RequestFactory(address, web3)
  // }

  // static initRinkeby() {
  //   throw new Error("Not implemented.")
  // }

  // static initKovan(web3) {
  //   const address = require("../assets/kovan.json").requestFactory
  //   return new RequestFactory(address, web3)
  // }
}

module.exports = RequestFactory
