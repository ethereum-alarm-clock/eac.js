const Config = require('./config.js')
const Scanner = require('./scanning.js')
const StatsDB = require('./statsdb.js')

const ethUtil = require('ethereumjs-util')

const repl = require('repl')

const startScanning = (ms, conf) => {
    const log = conf.logger

    log.info(`Scanning request tracker at ${conf.tracker.options.address}`)
    log.info(`Validating results with factory at ${conf.factory.options.address}`)
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
 * @param {*} web3 An instantiate web3 instance.
 * @param {String} provider The supplied provider host for the web3 instance. (Ex. 'http://localhost:8545)
 * @param {Number} ms Milliseconds between each conduction of a blockchain scan.
 * @param {String} logfile The file that the logging utility will log to, or 'console' for logging to console.
 * @param {Number} logLevel The level of logging allowed.
 * @param {String} chain The name of the chain, accepted values are 'ropsten', 'rinkeby' and 'kovan'.
 * @param {String} walletFile Path to the encrypted wallet file.
 * @param {String} pw Password to decrypt wallet.
 */
const main = async (web3, provider, ms, logfile, logLevel, chain, walletFile, pw) => {

    // Parses the chain argument
    const contracts = require(`../assets/${chain}.json`)

    const { getABI } = require('../util.js')
    const RequestFactoryABI = getABI('RequestFactory')
    const RequestTrackerABI = getABI('RequestTracker')

    // Loads the contracts
    const requestFactory = new web3.eth.Contract(RequestFactoryABI, contracts.requestFactory)
    const requestTracker = new web3.eth.Contract(RequestTrackerABI, contracts.requestTracker)

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

    // Assigns the client variable
    if (chain == 'rinkeby') {
        conf.client = 'geth'
    } else { conf.client = 'parity' }
    conf.chain = chain

    // Creates StatsDB
    conf.statsdb = new StatsDB(conf.web3)

    // Determines wallet support
    if (conf.wallet) {
        console.log('Wallet support: Enabled')
        console.log('\nExecuting from accounts:')
        conf.wallet.getAccounts().forEach(async account => {
            console.log(`${account} | Balance: ${web3.utils.fromWei(await web3.eth.getBalance(account))}`)
        })
        conf.statsdb.initialize(conf.wallet.getAccounts())
    } else { 
        console.log('Wallet support: Disabled')
        console.log('\nExecuting from account:')
        // Loads the default account.
        const account = (await web3.eth.getAccounts())[0]
        web3.eth.defaultAccount = account
        if (!ethUtil.isValidAddress(web3.eth.defaultAccount)) {
            throw new Error('Wallet is disabled but you do not have a local account unlocked.')
        }
        console.log(`${account} | Balance: ${web3.utils.fromWei(await web3.eth.getBalance(account))}`)
        conf.statsdb.initialize(account)
    }

    // Begin
    conf.scanning = false
    startScanning(ms, conf)

    // For the records, we should keep the time it started scanning.
    // TODO this isn't used anywhere yet, but will be used in the `getStats` featur
    const started = new Date()

    // Waits a bit before starting the repl so that the accounts have time to print.
    setTimeout(() => startRepl(conf, ms), 1200)
}

const startRepl = (conf, ms) => {
    const web3 = conf.web3

    console.log(' ') //blank space
    const replServer = repl.start({ prompt: '>> '})
    replServer.context.web3 = web3
    replServer.defineCommand('getBalance', {
        help: 'Get the balance of your accounts.',
        async action () {
            if (conf.wallet) {
                conf.wallet.getAccounts().forEach(async account => {
                    console.log(`${account} | Balance: ${web3.utils.fromWei(await web3.eth.getBalance(account))}`)
                })
            } else {
                const account = web3.eth.defaultAccount
                console.log(`${account} | Balance: ${web3.utils.fromWei(await web3.eth.getBalance(account))}`)
            }
        }  
    })
    replServer.defineCommand('getBlock', {
        help: 'Get the latest blockNum and timestamp',
        async action () {
            const block = await web3.eth.getBlock('latest')
            console.log(`BlockNum: ${block.number} | Timestamp: ${block.timestamp}`)
        }
    })
    replServer.defineCommand('dumpCache', {
        help: 'Dumps your cache storage.',
        action () {
            if (conf.cache.isEmpty()) {
                console.log('Cache empty')
            } else {
                conf.cache.stored().forEach(entry => {
                    console.log(`${entry} | ${conf.cache.get(entry)}`)
                })
            }
        }
    })
    replServer.defineCommand('start', {
        help: 'Starts the execution client',
        action () {
            conf.scanning = true
        }
    })
    replServer.defineCommand('stop', {
        help: 'Stops the execution client',
        action () {
            conf.scanning = false
        }
    })
    replServer.defineCommand('sweepCache', {
        help: 'Sweeps your cache of expired txRequests',
        action () {
            conf.cache.sweepExpired()
        }
    })
    replServer.defineCommand('testTx', {
        help: 'Send a test transaction to the network (requires unlocked local account)',
        action () {
            const testScheduler = require('../testScheduler.js')
            testScheduler(conf.chain, web3)
        }
    })
    replServer.defineCommand('getStats', {
        help: 'Get some interesting stats on your executing accounts.',
        action () {
            const stats = conf.statsdb.getStats()
            stats.forEach(accountStats => {
                let etherGain = accountStats.currentEther.minus(accountStats.startingEther)
                etherGain = web3.utils.fromWei(etherGain.toString())
                console.log(`${accountStats.account} | Claimed: ${accountStats.claimed} | Executed: ${accountStats.executed} | Ether gain: ${etherGain}`)
            })
        }
    })
}

module.exports = main 