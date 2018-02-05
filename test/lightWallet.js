const LightWallet = require("../src/client/lightWallet")
const Promise = require('bluebird')
const expect = require("chai").expect
const Web3 = require("web3")
const provider = new Web3.providers.HttpProvider()
const web3 = new Web3(provider)
const eth = Promise.promisifyAll(web3.eth)

describe("Light Wallet", () => {
	it("Ensures that can create a wallet with 5 accounts", async () => {
    const lightWallet = new LightWallet(web3)
    await lightWallet.create("test", 5)

    expect(lightWallet.getAccounts().length).to.be.equal(5)
  })

  it("Ensures that can send transction from 1st account", async () => {
    const lightWallet = new LightWallet(web3)
    await lightWallet.create("test", 5)

    const to = lightWallet.getAccounts()[0]
    const from = web3.eth.accounts[0]

    await eth.sendTransaction({
      to,
      from,
      value: web3.toWei(1, 'ether')
    })

    const senderBalanceBefore = web3.eth.getBalance(from)
    const sendBackAmount = web3.toWei(0.5, 'ether')

    await lightWallet.sendFromIndex(0, from, sendBackAmount, 21000, web3.toWei(100, 'gwei'), '')
    
    const senderBalanceAfter = web3.eth.getBalance(from)
    const expectedBalanceAfter = senderBalanceBefore.add(sendBackAmount)
    
    expect(senderBalanceAfter.equals(expectedBalanceAfter)).to.be.true
  })

  it("Ensures that cannot send transction from not funded account", async () => {
    const lightWallet = new LightWallet(web3)
    await lightWallet.create("test", 5)

    const to = lightWallet.getAccounts()[0]
    const from = web3.eth.accounts[0]
    
    it('should throw an error', async () => {
      await expect(lightWallet.sendFromIndex(0, from, 1, 21000, web3.toWei(100, 'gwei'), '')).to.be.rejected
    })
  })
})