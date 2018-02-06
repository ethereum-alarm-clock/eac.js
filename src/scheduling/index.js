/* eslint class-methods-use-this: "off" */

const BigNumber = require("bignumber.js")
const Util = require("../util")()

class Scheduler {
  constructor(bSchedulerAddress, tSchedulerAddress, web3) {
    this.web3 = web3
    try {
      const BlockSchedulerABI = Util.getABI("BlockScheduler")
      const TimestampSchedulerABI = Util.getABI("TimestampScheduler")
      this.blockScheduler = web3.eth
        .contract(BlockSchedulerABI)
        .at(bSchedulerAddress)
      this.timestampScheduler = web3.eth
        .contract(TimestampSchedulerABI)
        .at(tSchedulerAddress)
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
    fee,
    bounty,
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
          fee,
          bounty,
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
              .catch(e => reject(e))
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
    fee,
    bounty,
    requiredDeposit
  ) {
    return new Promise((resolve, reject) => {
      this.timestampScheduler.schedule(
        toAddress,
        callData,
        [
          callGas,
          callValue,
          windowSize,
          windowStart,
          gasPrice,
          fee,
          bounty,
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
              .catch(e => reject(e))
          }
        }
      )
    })
  }

  /**
   * Calculates the required endowment for scheduling a transactions
   * with the following parameters
   * @param {Number|String|BigNumber} callGas
   * @param {Number|String|BigNumber} callValue
   * @param {Number|String|BigNumber} gasPrice
   * @param {Number|String|BigNumber} fee
   * @param {Number|String|BigNumber} bounty
   */
  calcEndowment(callGas, callValue, gasPrice, fee, bounty) {
    // Convert the value to a bignumber works even if it's already one.
    const callGasBN = new BigNumber(callGas)
    const callValueBN = new BigNumber(callValue)
    const gasPriceBN = new BigNumber(gasPrice)
    const feeBN = new BigNumber(fee)
    const bountyBN = new BigNumber(bounty)

    return bountyBN
      .plus(feeBN.times(2))
      .plus(callGasBN.times(gasPrice))
      .plus(gasPriceBN.times(180000))
      .plus(callValueBN)
  }

  /**
   * Calculates the required endowment for scheduling a transactions
   * with the following parameters
   * @param {Number|String|BigNumber} callGas
   * @param {Number|String|BigNumber} callValue
   * @param {Number|String|BigNumber} gasPrice
   * @param {Number|String|BigNumber} fee
   * @param {Number|String|BigNumber} bount
   */
  static calcEndowment(callGas, callValue, gasPrice, fee, bounty) {
    // Convert the value to a bignumber works even if it's already one.
    const callGasBN = new BigNumber(callGas)
    const callValueBN = new BigNumber(callValue)
    const gasPriceBN = new BigNumber(gasPrice)
    const feeBN = new BigNumber(fee)
    const bountyBN = new BigNumber(bounty)

    return bountyBN
      .plus(feeBN.times(2))
      .plus(callGasBN.times(gasPrice))
      .plus(gasPriceBN.times(180000))
      .plus(callValueBN)
  }

  /**
   * Chain inits
   */

  // static initMainnet() {
  //   throw new Error("Not implemented.")
  // }

  // static initRopsten(web3) {
  //   return new Scheduler(web3, "ropsten")
  // }

  // static initRinkeby() {
  //   throw new Error("Not implemented.")
  // }

  // static initKovan(web3) {
  //   return new Scheduler(web3, "kovan")
  // }
}

module.exports = Scheduler
