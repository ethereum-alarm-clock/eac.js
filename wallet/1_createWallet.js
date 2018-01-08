const { LightWallet } = require('../src/client/lightWallet.js')

const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('http://localhost:8545')
const web3 = new Web3(provider)

const createWallet = async (web3, num, file, password) => {

    const wallet = new LightWallet(web3)
    wallet.create(num)

    console.log(`
New wallet created!

Accounts:
${wallet.getAccounts().join('\n')}

Saving encrypted file to ${file}. Don't forget your password!`)

    wallet.encryptAndStore(file, password)

}

// module.exports.createWallet = createWallet
createWallet(web3, 4, '.keys', 'pw')
