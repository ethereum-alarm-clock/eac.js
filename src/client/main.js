const Config = require('./config')
const Repl = require('./repl')
const Scanner = require('./scanning')
const StatsDB = require('./statsdb')
const eac = require('../index')

const startScanning = (ms, conf) => {
    const log = conf.logger

    log.info(`Scanning request tracker at ${conf.tracker.address}`)
    log.info(`Validating results with factory at ${conf.factory.address}`)
    log.info(`Scanning every ${ms / 1000} seconds.`)

    setInterval(_ => {
        if (conf.scanning) {
            Scanner.scanBlockchain(conf)
            .catch(err => log.error(err))
        }
    }, ms)

    setInterval(_ => {
        if (conf.scanning) {
            Scanner.scanCache(conf)
            .catch(err => log.error(err))
        }
    }, ms + 1000)

    setInterval(_ => {
        conf.cache.sweepExpired()
    }, 12 * 60 * 1000)
}

/**
 * The main driver function that begins the client operation.
 * @param {*} web3 An instantiated web3 instance.
 * @param {String} provider The supplied provider host for the web3 instance. (Ex. 'http://localhost:8545)
 * @param {Number} ms Milliseconds between each conduction of a blockchain scan.
 * @param {String} logfile The file that the logging utility will log to, or 'console' for logging to console.
 * @param {Number} logLevel The level of logging allowed.
 * @param {String} chain The name of the chain, accepted values are 'ropsten', 'rinkeby' and 'kovan'.
 * @param {String} walletFile Path to the encrypted wallet file.
 * @param {String} pw Password to decrypt wallet.
 */
const main = async (web3, provider, ms, logfile, logLevel, walletFile, pw) => {
    
    // Assigns chain to the name of the network ID
    const chain = eac.Util.getChainName(web3)

    // Loads the contracts
    const requestFactory = chain === 'ropsten' ? 
                            eac.RequestFactory.initRopsten(web3) : 
                            new Error(`Not implemented for chain ${chain}`)
    const requestTracker = chain === 'ropsten' ?
                            eac.RequestTracker.initRopsten(web3) :
                            new Error(`Not implemented for chain ${chain}`)

    // Parses the logfile
    if (logfile === 'console') {
        console.log('Logging to console')
    }
    if (logfile === 'default') {
        logfile = require('os').homedir() + '/.eac.log'
    }

    // Loads conf
    const conf = new Config(
        logfile,            //conf.logger.logfile
        logLevel,           //conf.logger.logLevel
        requestFactory,     //conf.factory
        requestTracker,     //conf.tracker
        web3,               //conf.web3
        provider,           //conf.provider
        walletFile,         //conf.wallet
        pw                  //wallet password
    )

    conf.wallet = false

    // Assigns the client variable
    if (chain == 'rinkeby') {
        conf.client = 'geth'
    } else { conf.client = 'parity' }
    conf.chain = chain

    // Creates StatsDB
    conf.statsdb = new StatsDB(conf.web3)

    console.log('Wallet support: Disabled')
    console.log('\nExecuting from account:')

    const account = web3.eth.accounts[0]
    web3.eth.defaultAccount = account
    if (!eac.Util.checkValidAddress(web3.eth.defaultAccount)) {
        throw new Error('Wallet is disabled but you do not have a local account unlocked.')
    }
    console.log(`${account} | Balance: ${web3.fromWei(web3.eth.getBalance(account))}`)
    conf.statsdb.initialize([account])

    // Begin
    conf.scanning = false
    startScanning(ms, conf)

    // Waits a bit before starting the repl so that the accounts have time to print.
    setTimeout(() => Repl.start(conf, ms), 1200)
}

module.exports = main 