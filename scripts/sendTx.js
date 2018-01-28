const eac = require("../src/index.js")
const BigNumber = require("bignumber.js")

const Web3 = require("web3")
const provider = new Web3.providers.HttpProvider('http://localhost:8545')
const web3 = new Web3(provider)

const main = async (chain, web3) => {
	const eacScheduler = new eac.Scheduler(web3, chain)
    const me = web3.eth.accounts[0]
    
	const windowStart = 5600850
	const gasPrice = web3.toWei("50", "gwei")
	const requiredDeposit = 1

	const callGas = 1212121
	const callValue = 1337
	const donation = 1
	const payment = 66

	const endowment = eacScheduler.calcEndowment(
		new BigNumber(callGas),
		new BigNumber(callValue),
		new BigNumber(gasPrice),
		new BigNumber(donation),
		new BigNumber(payment)
	)

	eacScheduler.initSender({
		from: me,
		gas: 3000000,
		value: endowment,
	})

	return eacScheduler.blockSchedule(
		"0xBADB01eeD908c05df5101DA1557b7CaaB38EE4Ce",
		web3.fromAscii("s0x".repeat(Math.floor(Math.random() * 10))),
		callGas,
		callValue,
		255, //windowSize
		windowStart,
		gasPrice,
		donation, //donation
		payment, //payment
		requiredDeposit
	)
}

const repeat = async (web3) => {
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
    await main('kovan', web3)
}

repeat(web3)
