const timetravel = (web3, seconds, targetBlock) => {
    const sendRPC = (web3, method, params) => {
        return new Promise((resolve) => {
            web3.currentProvider.sendAsync({
                jsonrpc: '2.0',
                method,
                params: params || [],
                id: new Date().getTime(),
            }, (err, res) => resolve(res))
        })
    }
    return new Promise((resolve) => {
        const asyncIterator = () => {
            return web3.eth.getBlock('latest', (err, { number }) => {
                if (number >= targetBlock - 1) {
                    return sendRPC(web3, 'evm_increaseTime', [seconds])
                    .then(() => sendRpc(web3, 'evm_mine')).then(resolve)
                }
                return sendRPC(web3, 'evm_mine').then(asyncIterator)
            })
        }
        asyncIterator()
    })
}

module.exports.timetravel = timetravel