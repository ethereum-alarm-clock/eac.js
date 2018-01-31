const BigNumber = require("bignumber.js")
const Deployer = require("../deploy.js")
const expect = require("chai").expect

const eac = require("../src")()

describe("Scheduler", () => {
	let eacScheduler
	let web3

	before(async () => {
		const deployed = await Deployer()
		web3 = deployed.web3
		eacScheduler = new eac.Scheduler(web3, "tester")
	})

	it("Calculates the expected endowment", () => {
		const callGas = new BigNumber(3000000)
		const callValue = new BigNumber(123454321)
		const gasPrice = new BigNumber(web3.toWei("55", "gwei"))
		const donation = new BigNumber(web3.toWei("120", "finney"))
		const payment = new BigNumber(web3.toWei("250", "finney"))

		const expectedEndowment = payment
			.plus(donation.mul(2))
			.plus(callGas.mul(gasPrice))
			.plus(gasPrice.mul(180000))
			.plus(callValue)

		const endowment = eacScheduler.calcEndowment(
			callGas,
			callValue,
			gasPrice,
			donation,
			payment
		)

		expect(endowment.toString()).to.equal(expectedEndowment.toString())
	})

	it("Schedules a transaction using calculated endowment", async () => {
		const toAddress = "0xDacC9C61754a0C4616FC5323dC946e89Eb272302"
		const callData = "0x" + Buffer.from("callData").toString("hex")
		const callGas = 3000000
		const callValue = 123454321
		const windowSize = 255
		const windowStart = (await eac.Util.getBlockNumber(web3)) + 25
		const gasPrice = web3.toWei("55", "gwei")
		const donation = web3.toWei("120", "finney")
		const payment = web3.toWei("250", "finney")
		const requiredDeposit = web3.toWei("50", "finney")

		const endowment = eacScheduler.calcEndowment(
			new BigNumber(callGas),
			new BigNumber(callValue),
			new BigNumber(gasPrice),
			new BigNumber(donation),
			new BigNumber(payment)
		)

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
			donation,
			payment,
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
		const windowStart = (await eac.Util.getTimestamp(web3)) + 25 * 15
		const gasPrice = web3.toWei("55", "gwei")
		const donation = web3.toWei("120", "finney")
		const payment = web3.toWei("250", "finney")
		const requiredDeposit = web3.toWei("50", "finney")

		const endowment = eacScheduler.calcEndowment(
			new BigNumber(callGas),
			new BigNumber(callValue),
			new BigNumber(gasPrice),
			new BigNumber(donation),
			new BigNumber(payment)
		)

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
			donation,
			payment,
			requiredDeposit
		)

		expect(receipt.status).to.equal(1)

		const txRequestAddr = eac.Util.getTxRequestFromReceipt(receipt)

		expect(txRequestAddr).to.exist

		const txRequest = new eac.TxRequest(txRequestAddr, web3)
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
