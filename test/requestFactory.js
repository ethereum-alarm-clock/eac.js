const BigNumber= require('bignumber.js')
const Deployer = require('../deploy.js')
const expect = require('chai').expect

const eac = require('../src')

describe('Request Factory', () => {

    let rfAddr
    let web3

    before(async () => {
        const deployed = await Deployer()
        web3 = deployed.web3
        rfAddr = deployed.requestFactory.address
    })

    it('Ensures that requestFactory is valid', () => {
        const requestFactory = new eac.RequestFactory(rfAddr, web3)
        expect(requestFactory.address)
        .to.exist
    })

    it('tests RequestFactory.isKnownRequest()', async () => {
        // To test `isKnownRequest()` we have to use the scheduler to deploy a
        // new instance of a TxRequest.
        const eacScheduler = new eac.Scheduler(web3, 'tester')

        const toAddress = '0xDacC9C61754a0C4616FC5323dC946e89Eb272302'
        const callData = '0x' + Buffer.from('callData').toString('hex')
        const callGas = 3000000
        const callValue = 123454321
        const windowSize = 255
        const windowStart = await eac.Util.getBlockNumber(web3) + 25
        const gasPrice = web3.toWei('55', 'gwei')
        const donation = web3.toWei('120', 'finney')
        const payment = web3.toWei('250', 'finney')
        const requiredDeposit = web3.toWei('50', 'finney')

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
            value: endowment
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

        expect(receipt.status)
        .to.equal(1)

        const newRequestAddress = '0x'.concat(receipt.logs[0].data.slice(-40))

        // This is to get around an issue with the deploy script. It deploys new instances
        // of the contracts in between each test so it messes up keeping the right
        // addresses. Need a better solution but for now this is a workaround.
        const rfAddr2 = await eacScheduler.getFactoryAddr()
        const requestFactory = new eac.RequestFactory(rfAddr2, web3)

        // Now that we've got the address of our new request, we can check it against
        // the request factory.
        const isKnown = await requestFactory.isKnownRequest(newRequestAddress)
        expect(isKnown)
        .to.be.true
    })

})