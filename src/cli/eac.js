#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')

const alarmClient = require('../client/main.js')
const EAC_Scheduler = require('../scheduling/index.js')
const Util = require('../util.js')

const BigNumber = require('bignumber.js')
const clear = require('clear')
const ora = require('ora')
const readlineSync = require('readline-sync')

const ethUtil = require('ethereumjs-util')

const log = {
    debug: msg => console.log(msg),
    info: msg => console.log(msg),
    warning: msg => console.log(msg),
    error: msg => console.log(msg),
    fatal: msg => console.log(`[FATAL] ${msg}`)
}

program
    .version('1.0.0')
    .option('-c, --client', 'starts the executing client')
    .option('-m, --milliseconds <ms>', 'tells the client to scan every <ms> seconds', 4000)
    .option('--logfile [path]', 'specifies the output logifle', 'default')
    .option('--logLevel [0,1,2,3]', 'sets the log level', 2)
    .option('--provider <string>', 'set the HttpProvider to use', 'http://localhost:8545')
    .option('-s, --schedule', 'schedules a transactions')
    .parse(process.argv)

const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider(`${program.provider}`)
const web3 = new Web3(provider)

const checkForUnlockedAccount = async web3 => {
    if (web3.eth.defaultAccount == null) {
        const accounts = web3.eth.accounts
        if (accounts.length < 1) {
            console.log('\n  error: must have an unlocked account in index 0\n')
            return false
        } else {
            web3.eth.defaultAccount = accounts[0]
            return true
        }
    }
}

const checkNetworkID = web3 => {
    const id = web3.version.network
    if (id == 1) return true      // mainnet
    else if (id == 3) return true // ropsten
    else if (id == 4) return true // rinkeby
    else return false
}

const main = async _ => {
    if (program.client) {
        clear()
        console.log('⏰ ⏰ ⏰ Welcome to the Ethereum Alarm Clock client ⏰ ⏰ ⏰\n')

        if (!await checkNetworkID(web3)) {
            console.log('  error: must be running a local node on the Ropsten or Rinkeby networks')
            process.exit(1)
        }
    
        alarmClient(
            web3,
            program.provider,
            program.milliseconds,
            program.logfile,
            program.logLevel, // 1 = debug, 2 = info, 3 = error
            program.wallet,
            program.password
        ).catch(err => {
            if (err.toString().indexOf('Invalid JSON RPC') !== -1) {
                log.error(`Received invalid RPC response, please make sure the blockchain is running.\n`)
            } else {
                log.fatal(err)
            }
            process.exit(1)
        })
    }
    
    else if (program.schedule) {
        if (!await checkNetworkID(web3)) {
            console.log('  error: must be running a localnode on the Ropsten or Rinkeby networks')
            process.exit(1)
        }
        if (!checkForUnlockedAccount(web3)) process.exit(1)

        const chain = await Util.getChainName(web3)

        const eacScheduler = new EAC_Scheduler(web3, program.chain)

        /// Starts the scheduling wizard.
        clear()
        log.info('🧙 🧙 🧙  Schedule a transaction  🧙 🧙 🧙\n')

        let toAddress = readlineSync.question(chalk.black.bgBlue('Enter the recipient address:\n'))

        /// Validate the address 
        toAddress = ethUtil.addHexPrefix(toAddress)
        if (!ethUtil.isValidAddress(toAddress)) {
            log.error('Not a valid address')
            log.fatal('exiting...')
            process.exit(1)
        }

        let callData = readlineSync.question(chalk.black.bgBlue('Enter call data: [press enter to skip]\n'))

        if (!callData) {
            callData = 'Sent from eac.js commandline client.'
        }
        // if (!web3.utils.isHex(callData)) {
            callData = web3.fromAscii(callData)
        // }

        let callGas = readlineSync.question(chalk.black.bgBlue(`Enter the call gas: [press enter for recommended]\n`))

        if (!callGas) {
            callGas = 3000000
        }

        let callValue = readlineSync.question(chalk.black.bgBlue('Enter call value:\n'))

        if (!callValue) {
            callValue = 123454321
        }

        let windowSize = readlineSync.question(chalk.black.bgBlue('Enter window size:\n'))

        if (!windowSize) {
            windowSize = 255
        }

        let windowStart = readlineSync.question(chalk.black.bgBlue(`Enter window start: [Current block number - ${await web3.eth.getBlockNumber()}\n`))

        if (windowStart < await web3.eth.getBlockNumber() + 25) {
            log.error('That window start time is too soon!')
            process.exit(1)
        }

        let gasPrice = readlineSync.question(chalk.black.bgBlue('Enter a gas price:\n'))

        if (!gasPrice) {
            gasPrice = web3.toWei('50', 'gwei')
        }

        let donation = readlineSync.question(chalk.black.bgBlue('Enter a donation amount:\n'))

        if (!donation) {
            donation = 33
        }

        let payment = readlineSync.question(chalk.black.bgBlue('Enter a payment amount:\n'))

        if (!payment) {
            payment = 10
        }

        let requiredDeposit = readlineSync.question(chalk.black.bgBlue('Enter required claim deposit:\n'))

        if (!requiredDeposit) {
            requiredDeposit = web3.toWei('20', 'finney')
        }

        clear()

        const endowment = eacScheduler.calcEndowment(
            new BigNumber(callGas),
            new BigNumber(callValue),
            new BigNumber(gasPrice),
            new BigNumber(donation),
            new BigNumber(payment)
        )

        log.debug(`
toAddress       - ${toAddress}
callData        - ${callData}
callGas         - ${callGas}
callValue       - ${callValue}
windowSize      - ${windowSize}
windowStart     - ${windowStart}
gasPrice        - ${gasPrice}
donation        - ${donation}
payment         - ${payment}
requiredDeposit - ${requiredDeposit}

Sending from ${web3.eth.defaultAccount}
Endowment: ${web3.fromWei(endowment.toString())}
`)

        const confirm = readlineSync.question('Are all of these variables correct? [Y/n]\n')
        if (confirm === '' || confirm.toLowerCase() === 'y') {
            /// Do nothing, just continue
        } else {
            log.error('quitting!')
            setTimeout(() => process.exit(1), 1500)
            return
        }

        eacScheduler.initSender({
            from: web3.eth.defaultAccount,
            gas: 3000000,
            value: endowment
        })

        console.log('\n')
        const spinner = ora('Sending transaction! Waiting for a response...').start()

        eacScheduler.blockSchedule(
            toAddress,
            callData,
            callGas,
            callValue,
            windowSize,
            windowStart,
            gasPrice,
            donation,
            payment,
            requiredDeposit
        ).then(receipt => {
            if (receipt.status != 1) {
                spinner.fail(`Transaction was mined but failed. No transaction scheduled.`)
                process.exit(1)
            }
            spinner.succeed(`Transaction successful! Hash: ${receipt.transactionHash}`)
        })
        .catch(err => {
            spinner.fail(err)
        })
    }
    
    else {
        console.log('\n  error: please start eac in either client `-c` or sheduling `-s` mode')
        process.exit(1)
    }
}

main()
.catch(e => {
    log.fatal(e)
    process.exit(1)
})