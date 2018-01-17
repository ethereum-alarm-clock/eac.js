/// Requires a case sensitive name of the contract and will return the ABI if found.
const getABI = name => {
    const json = require(`${__dirname}/build/contracts/${name}.json`)
    return json.abi
}

/**
 * Returns the string argument of the detected network to be 
 * passed into eacScheduler.
 * @param {Web3} web3 
 */
const getChainName = async web3 => {
    const networkID = await web3.eth.net.getId()
    if (networkID == 1) {
        // return 'mainnet'
        throw new Error('Not implemented for mainnet')
    } else if (networkID == 3) {
        return 'ropsten'
    } else if (networkID == 4) {
        return 'rinkeby'
    } else {
        throw new Error('Invalid network.')
    }
}

module.exports = {
    getABI,
    getChainName

}