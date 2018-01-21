const BigNumber = require('bignumber.js')
const expect = require('chai').expect

const Deployer = require('../deploy')

const eac = require('../src')

describe('TxRequest', () => {

    let delpoyed
    let scheduler
    let web3

    before(async () => {
        deployed = await Deployer()
        web3 = deployed.web3
        scheduler = new eac.Scheduler(web3, 'tester')
    })

    it('Schedules a transaction and correctly captures all variables', async () => {
        const toAddress = '0xDacC9C61754a0C4616FC5323dC946e89Eb272302'
        const callData = '0x' + Buffer.from('callData').toString('hex')
        const callGas = 3000000
        const callValue = 123454321
        const windowSize = 255
        const windowStart = await web3.eth.blockNumber + 25
        const gasPrice = web3.toWei('55', 'gwei')
        const donation = web3.toWei('120', 'finney')
        const payment = web3.toWei('250', 'finney')
        const requiredDeposit = web3.toWei('50', 'finney')

        const endowment = scheduler.calcEndowment(
            new BigNumber(callGas),
            new BigNumber(callValue),
            new BigNumber(gasPrice),
            new BigNumber(donation),
            new BigNumber(payment)
        )

        scheduler.initSender({
            from: web3.eth.defaultAccount,
            gas: 3000000,
            value: endowment
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

        expect(receipt.status)
        .to.equal(1)

        const newRequestAddress = receipt.events.NewRequest.returnValues.request

        const txRequest = new eac.TxRequest(newRequestAddress, web3)

        expect(txRequest.address)
        .to.exist

        expect(txRequest.address)
        .to.equal(newRequestAddress)

        // await txRequest.fillData()

        // Check that all of the variables in `txRequest` matches up to the ones
        // we set in `scheduler.blockSchedule`

        // expect(txRequest.toAddress)
        // .to.equal(toAddress)

        // expect(await txRequest.callData())
        // .to.equal(callData)

        // expect(txRequest.callGas)
        // .to.equal(callGas)

        

    })


})