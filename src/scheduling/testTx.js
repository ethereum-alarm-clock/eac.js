const Scheduler = require("./index.js")
const BigNumber = require("bignumber.js")

const main = async (chain, web3) => {
  const eacScheduler = new Scheduler(web3, chain)
  const me = web3.eth.accounts[0]

  const windowStart = web3.eth.blockNumber + 30
  const gasPrice = web3.toWei("100", "gwei")
  const requiredDeposit = 1

  const callGas = 1212121
  const callValue = 123454321
  const fee = 50
  const bounty = web3.toWei("500", "finney")

  const endowment = eacScheduler.calcEndowment(
    new BigNumber(callGas),
    new BigNumber(callValue),
    new BigNumber(gasPrice),
    new BigNumber(fee),
    new BigNumber(bounty)
  )

  eacScheduler.initSender({
    from: me,
    gas: 3000000,
    value: endowment,
  })

  return eacScheduler.blockSchedule(
    "0x009f7EfeD908c05df5101DA1557b7CaaB38EE4Ce",
    web3.fromAscii("s0x".repeat(Math.floor(Math.random() * 10))),
    callGas,
    callValue,
    255, // windowSize
    windowStart,
    gasPrice,
    fee, // fee
    bounty, // bounty
    requiredDeposit
  )
}

module.exports = main
