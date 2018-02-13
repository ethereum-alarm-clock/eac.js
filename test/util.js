const BigNumber = require("bignumber.js")
const Deployer = require("../deploy.js")
const expect = require("chai").expect

describe("Util", () => {
    let eac
    let web3

	before(async () => {
		const deployed = await Deployer()
        web3 = deployed.web3
        eac = require('../src')(web3)
    })

    it('tests init without a parameter', () => {
        const util = require('../src')().Util
        expect(util)
        .to.exist
    })
})