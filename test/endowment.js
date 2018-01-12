const expect = require('chai').expect
const BigNumber= require('bignumber.js')

// TODO extract this out to a common config file
const Web3 = require('web3')
const Ganache = require('ganache-core')
const web3 = new Web3(Ganache.provider())

const EAC_Scheduler = require('../src/scheduling/eacScheduler.js')

describe('EAC_Scheduler', () => {
    it('Calculates the correct endowment', () => {
        const eacScheduler = new EAC_Scheduler(web3, 'tester')

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
})