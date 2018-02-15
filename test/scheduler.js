const BigNumber = require("bignumber.js")
const Deployer = require("../deploy.js")
const expect = require("chai").expect

describe("Scheduler", () => {
	let eac
	let web3

	before(async () => {
		const deployed = await Deployer()
		web3 = deployed.web3
		eac = require('../src')(web3)
	})

	it("Calculates the expected endowment", () => {
		const callGas = new BigNumber(3000000)
		const callValue = new BigNumber(123454321)
		const gasPrice = new BigNumber(web3.toWei("55", "gwei"))
		const fee = new BigNumber(web3.toWei("120", "finney"))
		const bounty = new BigNumber(web3.toWei("250", "finney"))
		const executionGasOverhead = new BigNumber(180000).div(64).times(65).round()

		const expectedEndowment = bounty
			.plus(fee.mul(2))
			.plus(callGas.mul(gasPrice))
			.plus(gasPrice.mul(executionGasOverhead))
			.plus(callValue)

		const endowment = eac.Util.calcEndowment(
			callGas,
			callValue,
			gasPrice,
			fee,
			bounty
		)

		expect(endowment.toString()).to.equal(expectedEndowment.toString())
	})

	it("Schedules a transaction using calculated endowment", async () => {
		const toAddress = "0xDacC9C61754a0C4616FC5323dC946e89Eb272302"
		const callData = "0x" + Buffer.from("callData").toString("hex")
		const callGas = 3000000
		const callValue = 123454321
		const windowSize = 255
		const windowStart = (await eac.Util.getBlockNumber()) + 25
		const gasPrice = web3.toWei("55", "gwei")
		const fee = web3.toWei("120", "finney")
		const bounty = web3.toWei("250", "finney")
		const requiredDeposit = web3.toWei("50", "finney")

		const endowment = eac.Util.calcEndowment(
			new BigNumber(callGas),
			new BigNumber(callValue),
			new BigNumber(gasPrice),
			new BigNumber(fee),
			new BigNumber(bounty)
		)

		const eacScheduler = await eac.scheduler()

		eacScheduler.initSender({
			from: web3.eth.defaultAccount,
			gas: 3000000,
			value: endowment,
		})

		const receipt = await eacScheduler.blockSchedule(
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
		)

		expect(receipt.status).to.equal(1)
	})

	it("Schedules a transaction using timestamp scheduling", async () => {
		// Uses the same variables as blockScheduling but multiplies them by 15,
		// which is a rough estimate of an average block time. THIS IS NOT
		// WHAT YOU SHOULD DO IN PRODUCTION
		const toAddress = "0xDacC9C61754a0C4616FC5323dC946e89Eb272302"
		const callData = "0x" + Buffer.from("callData").toString("hex")
		const callGas = 3000000
		const callValue = 123454321
		const windowSize = 255 * 15
		const windowStart = (await eac.Util.getTimestamp()) + 25 * 15
		const gasPrice = web3.toWei("55", "gwei")
		const fee = web3.toWei("120", "finney")
		const bounty = web3.toWei("250", "finney")
		const requiredDeposit = web3.toWei("50", "finney")

		const endowment = eac.Util.calcEndowment(
			new BigNumber(callGas),
			new BigNumber(callValue),
			new BigNumber(gasPrice),
			new BigNumber(fee),
			new BigNumber(bounty)
		)

		const eacScheduler = await eac.scheduler()

		eacScheduler.initSender({
			from: web3.eth.defaultAccount,
			gas: 3000000,
			value: endowment,
		})

		const receipt = await eacScheduler.timestampSchedule(
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
		)

		expect(receipt.status).to.equal(1)

		const txRequestAddr = eac.Util.getTxRequestFromReceipt(receipt)

		expect(txRequestAddr).to.exist

		const txRequest = await eac.transactionRequest(txRequestAddr)
		await txRequest.fillData()

		const winStart = txRequest.windowStart
		const now = await txRequest.now()

		expect(winStart.toNumber()).to.be.above(now.toNumber())

		const secsToWait = winStart.minus(now)
		const { wait, waitUntilBlock } = require("@digix/tempo")(web3)
		await wait(secsToWait.toNumber(), 1)

		expect(await txRequest.inExecutionWindow()).to.be.true

		const executeGas = txRequest.callGas.add(180000)

		const executeReceipt = await txRequest.execute({
			from: web3.eth.defaultAccount,
			value: 0,
			gas: executeGas,
			gasPrice: txRequest.gasPrice,
		})

		expect(executeReceipt.status).to.equal(1)
	})
})
