const BigNumber = require('bignumber.js')
const LightWallet = require('../client/lightWallet.js')

// @returns Promise<[txObjs]>
const drainWallet = (web3, gasPrice, target, file, password) => {
    const wallet = new LightWallet(web3)
    wallet.decryptAndLoad(file, password)

    const gas = '21000'
    const gasCost = new BigNumber(gas).times(gasPrice)

    return Promise.all(
        wallet.getAccounts().map(account => {
            return new Promise((resolve, reject) => {
                web3.eth.getBalance(account)
                .then(bal => {
                    bal = new BigNumber(bal)
                    const amt = bal.minus(gasCost)
                    web3.eth.sendTransaction({
                        from: account,
                        to: target,
                        value: amt.toString(),
                        gas: gas,
                        gasPrice: gasPrice,
                    })
                    .then(txObj => {
                        resolve(txObj)
                    })
                    .catch(err => reject(err))
                })
                .catch(err => reject(err))
            })
        })
    )
}

module.exports = drainWallet