const BigNumber = require("bignumber.js")
const Deployer = require("../deploy.js")
const expect = require("chai").expect

const eac = require("../src")

describe("Request Tracker", () => {
	let rtAddr
	let web3

	before(async () => {
		const deployed = await Deployer()
		web3 = deployed.web3
		rtAddr = deployed.requestTracker
	})

	it("Ensures the request tracker is valid", async () => {
		const requestTracker = new eac.RequestTracker(rtAddr, web3)
		expect(requestTracker.address).to.exist
	})

	it("tests requestTrackers methods", async () => {
		const eacScheduler = new eac.Scheduler(web3, "tester")

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

		const newRequestAddress = "0x".concat(receipt.logs[0].data.slice(-40))

		const rfAddr = await eacScheduler.getFactoryAddress()
		const requestFactory = new eac.RequestFactory(rfAddr, web3)
		const rtAddr2 = await requestFactory.getTrackerAddress()
		const requestTracker = new eac.RequestTracker(rtAddr2, web3)
		requestTracker.setFactory(requestFactory.address)

		const left = (await eac.Util.getBlockNumber(web3)) - 10
		const res = await requestTracker.nextFromLeft(left)
		const resWS = await requestTracker.windowStartFor(res)
		// The best way to test these is to make a txRequest instance out of them
		const txRequest = new eac.TxRequest(res, web3)
		await txRequest.fillData()
		expect(txRequest.address).to.exist
		expect(txRequest.windowStart.toNumber()).to.equal(resWS.toNumber())

		// Depending on the tests, further txRequests may be registered.
		const res2 = await requestTracker.nextRequest(res)
		const res2WS = await requestTracker.windowStartFor(res2)
		let txRequest2
		if (res2 !== eac.Constants.NULL_ADDRESS) {
			txRequest2 = new eac.TxRequest(res2, web3)
			await txRequest2.fillData()
			expect(txRequest2.address).to.exist
			// This txRequest2 should have a later start than txRequest
			expect(txRequest2.windowStart.toNumber()).to.be.at.least(
				txRequest.windowStart.toNumber()
			)
		}

		const res3 = await requestTracker.nextRequest(res2)
		const res3WS = await requestTracker.windowStartFor(res3)
		let txRequest3
		if (res3 !== eac.Constants.NULL_ADDRESS) {
			txRequest3 = new eac.TxRequest(res3, web3)
			await txRequest3.fillData()
			expect(txRequest3.address).to.exist
			// This txRequest3 should have a later start than txRequest2
			expect(txRequest3.windowStart.toNumber()).to.be.at.least(
				txRequest2.windowStart.toNumber()
			)
		}
	})
})
