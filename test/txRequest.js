const BigNumber = require("bignumber.js")
const expect = require("chai").expect
const Deployer = require("../deploy")

describe("TxRequest", () => {
	let eac
	let delpoyed
	let web3

	before(async () => {
		deployed = await Deployer()
		web3 = deployed.web3
		eac = require('../src')(web3)
	})

	it("Schedules a transaction and correctly captures all variables", async () => {
		const toAddress = "0xDacC9C61754a0C4616FC5323dC946e89Eb272302"
		const callData = "0x" + Buffer.from("callData").toString("hex")
		const callGas = 3000000
		const callValue = 123454321
		const windowSize = 255
		const windowStart = (await eac.Util.getBlockNumber()) + 25
		const gasPrice = web3.toWei("55", "gwei")
		const donation = web3.toWei("120", "finney")
		const payment = web3.toWei("250", "finney")
		const requiredDeposit = web3.toWei("50", "finney")

		const endowment = eac.Util.calcEndowment(
			new BigNumber(callGas),
			new BigNumber(callValue),
			new BigNumber(gasPrice),
			new BigNumber(donation),
			new BigNumber(payment)
		)

		const scheduler = await eac.scheduler()

		scheduler.initSender({
			from: web3.eth.defaultAccount,
			gas: 3000000,
			value: endowment,
		})

		const receipt = await scheduler.blockSchedule(
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

		const newRequestAddress = eac.Util.getTxRequestFromReceipt(receipt)

		const txRequest = await eac.transactionRequest(newRequestAddress)

		expect(txRequest.address).to.exist

		expect(txRequest.address).to.equal(newRequestAddress)

		expect(await txRequest.fillData()).to.be.true

		// Check that all of the variables in `txRequest` matches up to the ones
		// we set in `scheduler.blockSchedule`

		expect(txRequest.toAddress).to.equal(toAddress.toLowerCase())

		expect(await txRequest.callData()).to.equal(callData)

		expect(txRequest.callGas.toNumber()).to.equal(callGas)

		expect(txRequest.callValue.toNumber()).to.equal(callValue)

		expect(txRequest.windowSize.toNumber()).to.equal(windowSize)

		expect(txRequest.windowStart.toNumber()).to.equal(windowStart)

		expect(txRequest.gasPrice.toString()).to.equal(gasPrice)

		expect(txRequest.donation.toString()).to.equal(donation)

		expect(txRequest.payment.toString()).to.equal(payment)

		expect(txRequest.requiredDeposit.toString()).to.equal(requiredDeposit)
	})
})
