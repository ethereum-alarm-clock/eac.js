const ethereumJsWallet = require('ethereumjs-wallet')
const Transaction = require("ethereumjs-tx")

class MyEtherWallet {
  constructor(web3, json, password) {
    this.web3 = web3
    this.wallet = ethereumJsWallet.fromV3(json, password, true)
    this.address = this.wallet.getAddressString()
    this.nonce = 0
  }

  // Cycles through accounts and sends the transaction from next up.
  async sendFromNext(recip, val, gasLimit, gasPrice, data) {
    const next = this.nonce++ % this.getAccounts().length
    return this.sendFromIndex(next, recip, val, gasLimit, gasPrice, data)
  }

  // Return a txHash
  async sendFromIndex(index, to, value, gasLimit, gasPrice, data) {
    if (index > this.wallet.length) {
      console.log("Index is outside of range of addresses in this wallet!")
      return
    }

    const sendRawTransaction = Promise.promisify(this.web3.eth.sendRawTransaction)
    const from = this.getAccounts()[index]
    const txCount = this.web3.eth.getTransactionCount(from)

    const txParameters = {
      nonce: txCount,
      from,
      to,
      gasPrice: this.web3.toHex(gasPrice),
      gasLimit: this.web3.toHex(gasLimit),
      value: this.web3.toHex(value),
      data
    }

    const tx = new Transaction(txParameters)
    const privateKey = this.wallet.getPrivateKeyString()

    tx.sign(new Buffer(privateKey, 'hex'))

    return sendRawTransaction('0x' + tx.serialize().toString('hex'))
  }

  getAccounts() {
    return [this.address]
  }
}

module.exports = MyEtherWallet
