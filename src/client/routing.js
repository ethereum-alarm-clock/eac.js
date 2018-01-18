const BigNumber = require('bignumber.js')
const hasPending = require('./pending.js')

/**
 * Takes in a txRequest object and routes it to the thread that will act on it,
 * or returns if no action can be taken.
 * @param {Config} conf 
 * @param {TxRequest} txRequest 
 */
const routeTxRequest = async (conf, txRequest) => {
    const log = conf.logger 
    const web3 = conf.web3 

    if (await hasPending(conf, txRequest)) {
        log.info(`Ignoring txRequest with pending transaction in the transaction pool.`)
        return
    }
    if (txRequest.isCancelled) {
        log.debug(`Ignorning already cancelled txRequest.`)
        // TODO Should route this to delete the cache
        return
    }
    if (await txRequest.beforeClaimWindow()) {
        log.debug(`Ignoring txRequest not in claim window.`)
        return
    }
    if (await txRequest.inClaimWindow()) {
        // The client set the txRequest to `attempted claim` and watch 
        // for the result and either marked successfully `claimed` or not.
        // Using the cache codes is a primitive way to accomplish this.
        if (conf.cache.get(txRequest.address) <= 102) {
            // Already set in cache as having a claim request.
            return
        }
        if (txRequest.isClaimed) {
            // Already claimed, do not attempt to claim it again.
            log.debug(`TxRequest in claimWindow but is already claimed!`)
            // Set it to the cache number so it won't do this again.
            conf.cache.set(txRequest.address, 103)
            return
        }

        claim(conf, txRequest)
        .then(receipt => {
            // If success set to claimed
            if (receipt.status == 1) {
                log.info(`TxRequest at ${txRequest.address} claimed!`)
                conf.cache.set(txRequest.address, 103)
                web3.eth.getTransaction(receipt.transactionHash)
                .then(txObj => {
                    conf.statsdb.updateClaimed(txObj.from)
                })
            }
            // Or find the reason why it failed TODO
            else return
        })
        .catch(err => log.error(err))
        return
    }

    if (await txRequest.inFreezePeriod()) {
        log.debug(`Ignoring frozen txRequest. Now ${await txRequest.now()} | Window start: ${txRequest.windowStart}`)
        return
    }

    if (txRequest.inExecutionWindow()) {
        log.debug(``)
        if (conf.cache.get(txRequest.address) <= 99) return // waiting to be cleaned
        if (txRequest.wasCalled) { log.debug(`Already called.`); cleanup(conf, txRequest); return }
        if (await txRequest.inReservedWindow() && txRequest.isClaimed) {
            if (conf.wallet.getAccounts().indexOf(txRequest.claimedBy) == -1
                && !txRequest.isClaimedBy(web3.eth.defaultAccount)) {
                    log.debug(`In reserve window and not claimed by our accounts.`)
                    return
                }
        }
        // This hacks the cache to set all executed requests to store the value
        // of -1 if it has been executed. 
        if (conf.cache.get(txRequest.address) <= 101) {
            log.debug(`Skipping already executed txRequest.`)
            return
        }
        execute(conf, txRequest)
        .then(receipt => {
            if (receipt.status == 1) {
                log.info(`TxRequest at ${txRequest.address} executed!`)
                conf.cache.set(txRequest.address, 100)
                web3.eth.getTransaction(receipt.transactionHash)
                .then(txObj => {
                    conf.statsdb.updateExecuted(txObj.from)
                })
            }
            // Or find the reason why it failed TODO
            else return
        })
        .catch(err => log.error(err))
        return
    }

    if (txRequest.afterExecutionWindow()) {
        log.debug(`Cleaning up expired txRequest and removing from cache.`)
        // TODO
        cleanup(conf, txRequest)
        // This request should handle returning funds if the transaction was not executed.
        return
    }
}

const claim = async (conf, txRequest) => {
    const log = conf.logger
    const web3 = conf.web3

    // All the checks have been done in routing, now we follow through on the actions.
    const claimPaymentModifier = (await txRequest.claimPaymentModifier()).dividedToIntegerBy(100)
    const paymentWhenClaimed = txRequest.payment.times(claimPaymentModifier).floor()
    const claimDeposit = txRequest.requiredDeposit
    const data = txRequest.claimData
    const sender = conf.wallet ? conf.wallet.getAccounts()[0] : web3.eth.defaultAccount
    const gasToClaim = await web3.eth.estimateGas({
        from: sender,
        to: txRequest.address,
        value: claimDeposit.toString(),
        data: data
    })
    const currentGasPrice = new BigNumber(await web3.eth.getGasPrice())
    const gasCostToClaim = currentGasPrice.times(gasToClaim)


    if (gasCostToClaim.greaterThan(paymentWhenClaimed)) {
        log.debug(`Not profitable to claim. Returning`)
        log.debug(`gasCostToClaim: ${web3.utils.fromWei(gasCostToClaim.toString())} | paymentWhenClaimed: ${web3.utils.fromWei(paymentWhenClaimed.toString())}`)
        return Promise.resolve({ status: '0x0' })
    }

    // The dice roll was originally implemented in the Python client, which I followed
    // for inspiration here.
    const diceroll = Math.floor(Math.random() * 100)
    
    if (diceroll >= await txRequest.claimPaymentModifier()) {
        log.debug(`Fate insists you wait until later.`)
        return Promise.resolve({ status: '0x0' })
    }

    log.info(`Attempting the claim of txRequest at address ${txRequest.address} | Payment: ${paymentWhenClaimed}`)
    conf.cache.set(txRequest.address, 102)
    if (conf.wallet) {
        // Wallet is enabled, claim from the next index.
        return conf.wallet.sendFromNext(
            txRequest.address,
            claimDeposit,
            gasToClaim + 21000,
            await web3.eth.getGasPrice(),
            data
        )
    } else {
        // Wallet disabled, claim from default account
        return txRequest.claim().send({
            from: web3.eth.defaultAccount,
            value: claimDeposit,
            gas: gasToClaim + 21000,
            gasPrice: await web3.eth.getGasPrice()
        })
    }

}

const execute = async (conf, txRequest) => {
    const log = conf.logger
    const web3 = conf.web3

    const executeGas = txRequest.callGas.add(180000)
    const gasLimit = (await web3.eth.getBlock('latest')).gasLimit 

    const gasPrice = txRequest.gasPrice

    if (executeGas > gasLimit) {
        // TODO
        // Set in cache to number `unable to execute`
        return Promise.reject(`Execution gas exceeds the network gas limit.`)
    }

    log.info(`Attempting the execution of txRequest at address ${txRequest.address}`)
    conf.cache.set(txRequest.address, -1)
    if (conf.wallet) {
        const executeData = txRequest.executeData
        const walletClaimIndex =  conf.wallet.getAccounts().indexOf(txRequest.claimedBy)
        
        if (walletClaimIndex !== -1) {
            return conf.wallet.sendFromIndex(
                walletClaimIndex,
                txRequest.address,
                0,
                executeGas,
                gasPrice,
                executeData
            )
        } else {
            return conf.wallet.sendFromNext(
                txRequest.address,
                0,
                executeGas,
                gasPrice,
                executeData
            )
        }
    } else {
        return txRequest.execute().send({
            from: web3.eth.defaultAccount,
            value: 0,
            gas: executeGas,
            gasPrice: gasPrice
        })
    }
}

const cleanup = async (conf, txRequest) => {
    const log = conf.logger
    const web3 = conf.web3

    const txRequestBalance = await txRequest.getBalance()

    // If a transaction request has been executed it will route into this option.
    if (txRequestBalance.equals(0)) {
        // set for removal from cache
        conf.cache.set(txRequest.address, 99)
        return
    }

    if (!txRequest.isCancelled) {
        const cancelData = txRequest.cancelData
        const sender = conf.wallet ? conf.wallet.getAccounts()[0] : web3.eth.defaultAccount
        const gasToCancel = await txRequest.cancel().estimateGas({
            from: sender,
            to: txRequest.address,
            value: '0',
            data: cancelData
        })
        const currentGasPrice = new BigNumber(await web3.eth.getGasPrice())
        const gasCostToCancel = currentGasPrice.times(gasToCancel)

        // If the transaction request is expired and still has money in it but is 
        // not cancelled, cancel it for the reward. The first step is to check if
        // any accounts are `owners` of the transactions -- as unlikely as this may
        // be it's a simple enough check.
        if (conf.wallet) {
            const ownerIndex = conf.wallet.getAccounts().indexOf(txRequest.getOwner())
            if (ownerIndex !== -1) {
                conf.wallet.sendFromIndex(
                    ownerIndex,
                    txRequest.address,
                    0,
                    gasToCancel + 21000,
                    await web3.eth.getGasPrice(),
                    cancelData
                )
            } else {
                // The more likely scenario is that one of our accounts is not the 
                // owner of the expired transaction in which case, we check to see
                // if we will not lost money for sending this transaction then send
                // it from any account.
                if (gasCostToCancel.greaterThan(txRequestBalance)) {
                    // The transaction request does not have enough money to compensate.
                    return
                }
                conf.wallet.sendFromNext(
                    txRequest.address,
                    0,
                    gasToCancel + 21000,
                    await web3.eth.getGasPrice(),
                    cancelData
                )
            }
        } else {
            // Wallet disabled try from the deafult account.
            if (txRequest.isClaimedBy(web3.eth.defaultAccount)) {
                txRequest.cancel().send({
                    from: web3.eth.defaultAccount,
                    value: 0,
                    gas: gasToCancel + 21000,
                    gasPrice: await web3.eth.getGasPrice()
                })
            } else {
                if (gasCostToCancel.greaterThan(txRequestBalance)) {
                    return
                }
                txRequest.cancel().send({
                    from: web3.eth.defaultAccount,
                    value: 0,
                    gas: gasToCancel + 21000,
                    gasPrice: await web3.eth.getGasPrice()
                })
            }
        }
    }
    // Set all requests that make it here ready for deletion.
    conf.cache.set(txRequest.address, 99)
}

module.exports.routeTxRequest = routeTxRequest