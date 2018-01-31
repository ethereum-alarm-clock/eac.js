const BigNumber = require("bignumber.js")
const Deployer = require("../deploy.js")
const expect = require("chai").expect

const eac = require("../src")()

describe("Request Factory", () => {
	let rfAddr
	let web3

	before(async () => {
		const deployed = await Deployer()
		web3 = deployed.web3
		rfAddr = deployed.requestFactory.address
	})

	it("Ensures that requestFactory is valid", () => {
		const requestFactory = new eac.RequestFactory(rfAddr, web3)
		expect(requestFactory.address).to.exist
	})

	it("tests RequestFactory.isKnownRequest()", async () => {
		// To test `isKnownRequest()` we have to use the scheduler to deploy a
		// new instance of a TxRequest.
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

		// This is to get around an issue with the deploy script. It deploys new instances
		// of the contracts in between each test so it messes up keeping the right
		// addresses. Need a better solution but for now this is a workaround.
		const rfAddr2 = await eacScheduler.getFactoryAddress()
		const requestFactory = new eac.RequestFactory(rfAddr2, web3)

		// Now that we've got the address of our new request, we can check it against
		// the request factory.
		const isKnown = await requestFactory.isKnownRequest(newRequestAddress)
		expect(isKnown).to.be.true
	})

	it("tests RequestFactory.validateRequestParams()", async () => {
        const requestFactory = new eac.RequestFactory(rfAddr, web3)
        expect(requestFactory.address).to.exist

        // First test that `.parseIsValid()` works.
        const testBools = [
            true,
            false,
            false,
            true,
            true,
            false
        ]

        const testBoolsTooLong = [...testBools, false]
        const testBoolsTooShort = [true]

        const validationErrors = await requestFactory.parseIsValid(testBools)

        expect(validationErrors.length)
        .to.equal(3)

        expect(validationErrors)
        .to.have.members([
            'ReservedWindowBiggerThanExecutionWindow',
            'InvalidTemporalUnit',
            'EmptyToAddress'
        ])

        expect(() => {
            requestFactory.parseIsValid(testBoolsTooLong)
        })
        .to.throw()

        expect(() => {
            requestFactory.parseIsValid(testBoolsTooShort)
        })
        .to.throw()
        // End test `.parseIsValid()`

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
        
        const addressArgs = [
            web3.eth.defaultAccount,    //owner
            "0xfffC9C61754a0C4616FC5323dC946e89Eb272302",   //donation benefactor
            toAddress
        ]

        const uintArgs = [
            donation,
            payment,
            255,        //claimWindowSize default
            10,         // freezePeriod default
            16,         // reservedWindowsize default
            1,          // temporalUnit = blocks
            windowSize,
            windowStart,
            callGas,
            callValue,
            gasPrice,
            requiredDeposit
        ]

        const endowment = eac.Scheduler.calcEndowment(
            new BigNumber(callGas),
			new BigNumber(callValue),
			new BigNumber(gasPrice),
			new BigNumber(donation),
			new BigNumber(payment)
        )

        const isValid = await requestFactory.validateRequestParams(
            addressArgs,
            uintArgs,
            callData,
            endowment
        )

        isValid.forEach(bool => {
            expect(bool).to.be.true
        })

        const test = requestFactory.parseIsValid(isValid)
        expect(test.length)
        .to.equal(0)

        // now that we are sure it produces a positive for good parameters, let's make it fail
        // first let's subtract from the minimum calculated endowment, in this case 
        // the client would be trying to send less ether value than required
        const isValidFail = await requestFactory.validateRequestParams(
            addressArgs,
            uintArgs,
            callData,
            endowment.sub('1000')
        )

        expect(isValidFail[0])
        .to.be.false

        isValidFail.slice(1).forEach(bool => {
            expect(bool).to.be.true
        })

        //TODO test all failure cases
    })
})
