const Web3 = require("web3")
const provider = new Web3.providers.HttpProvider('http://localhost:8545')
const web3 = new Web3(provider)

const eac = require('../src')(web3)

const main = async () => {
    const requestFactory = await eac.requestFactory()
    const requests = await requestFactory.getRequests(5665000)
    console.log(requests)
}

main()
.catch(e => console.error(e))