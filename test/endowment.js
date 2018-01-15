const expect = require('chai').expect
const BigNumber= require('bignumber.js')

const Deployer = require('../deploy.js')

const EAC_Scheduler = require('../src/scheduling/index.js')

describe('EAC_Scheduler', () => {

    let eacScheduler 
    let web3

    before(async () => {
        const deployed = await Deployer()
        web3 = deployed.web3
        eacScheduler = new EAC_Scheduler(web3, 'tester')
    })

    it('Calculates the expected endowment', () => {
        const callGas = new BigNumber(3000000)
        const callValue = new BigNumber(123454321)
        const gasPrice = new BigNumber(web3.utils.toWei('55', 'gwei'))
        const donation = new BigNumber(web3.utils.toWei('120', 'finney'))
        const payment = new BigNumber(web3.utils.toWei('250', 'finney'))

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

        expect(endowment.toString())
        .to.equal(expectedEndowment.toString())
    })

    it('Schedules a transaction using calculated endowment', async () => {
        const toAddress = '0xDacC9C61754a0C4616FC5323dC946e89Eb272302'
        const callData = '0x' + Buffer.from('callData').toString('hex')
        const callGas = 3000000
        const callValue = 123454321
        const windowSize = 255
        const windowStart = await web3.eth.getBlockNumber() + 25
        const gasPrice = web3.utils.toWei('55', 'gwei')
        const donation = web3.utils.toWei('120', 'finney')
        const payment = web3.utils.toWei('250', 'finney')
        const requiredDeposit = web3.utils.toWei('50', 'finney')

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
    })
})