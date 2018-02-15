const BigNumber = require("bignumber.js")
const Deployer = require("../deploy.js")
const expect = require("chai").expect

describe("Request Factory", () => {
	let eac
	let web3

	before(async () => {
		const deployed = await Deployer()
		web3 = deployed.web3
		eac = require('../src')(web3)
	})

	it("Ensures that requestFactory is valid", async () => {
		const requestFactory = await eac.requestFactory()
		expect(requestFactory.address).to.exist
	})

	it("tests RequestFactory.isKnownRequest()", async () => {
		// To test `isKnownRequest()` we have to use the scheduler to deploy a
		// new instance of a TxRequest.
		const eacScheduler = await eac.scheduler()

		const toAddress = "0xDacC9C61754a0C4616FC5323dC946e89Eb272302"
		const callData = "0x" + Buffer.from("callData").toString("hex")
		const callGas = 3000000
		const callValue = 123454321
		const windowSize = 255
		const windowStart = (await eac.Util.getBlockNumber(web3)) + 25
		const gasPrice = web3.toWei("55", "gwei")
		const fee = web3.toWei("120", "finney")
		const bounty = web3.toWei("250", "finney")
		const requiredDeposit = web3.toWei("50", "finney")

		const endowment = eacScheduler.calcEndowment(
			new BigNumber(callGas),
			new BigNumber(callValue),
			new BigNumber(gasPrice),
			new BigNumber(fee),
			new BigNumber(bounty)
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
			fee,
			bounty,
			requiredDeposit
		)

		expect(receipt.status).to.equal(1)


		const newRequestAddress = eac.Util.getTxRequestFromReceipt(receipt)

        const requestFactory = await eac.requestFactory()

		// Now that we've got the address of our new request, we can check it against
		// the request factory.
		const isKnown = await requestFactory.isKnownRequest(newRequestAddress)
		expect(isKnown).to.be.true
	})

	it("tests RequestFactory.validateRequestParams()", async () => {
        const requestFactory = await eac.requestFactory()
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
		const fee = web3.toWei("120", "finney")
		const bounty = web3.toWei("250", "finney")
        const requiredDeposit = web3.toWei("50", "finney")
        
        const addressArgs = [
            web3.eth.defaultAccount,    //owner
            "0xfffC9C61754a0C4616FC5323dC946e89Eb272302",   //fee benefactor
            toAddress
        ]

        const uintArgs = [
            fee,
            bounty,
            255,        // claimWindowSize default
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

        const endowment = eac.Util.calcEndowment(
            new BigNumber(callGas),
			new BigNumber(callValue),
			new BigNumber(gasPrice),
			new BigNumber(fee),
			new BigNumber(bounty)
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
            endowment.mul(64).div(65).sub('1000') //for now just a client check smart contract calulation update needed
        )

        expect(isValidFail[0])
        .to.be.false

        isValidFail.slice(1).forEach(bool => {
            expect(bool).to.be.true
        })

        //TODO test all failure cases
    })

    it("Tests getting logs", async () => {
        const requestFactory = await eac.requestFactory()
        expect(requestFactory.address).to.exist

        // Test getRequestCreatedLogs with no args
        const logs = await requestFactory.getRequestCreatedLogs()
        expect(logs).to.exist

        const owner = logs[0].args.owner

        const requests = await requestFactory.getRequests()
        // Length of an address
        expect(requests[0].length).to.equal(42)
        

        const test1 = await requestFactory.getRequestsByOwner(owner)
        expect(test1[0])
        .to.equal(requests[0])

        const test2 = await requestFactory.getRequestsByOwner("0x92cb33fe17a75f0088a14c7718a29321fba026cd")
        expect(test2.length).to.equal(0)
    })
})
