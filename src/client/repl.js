const repl = require("repl")
const eac = require("../index")

const start = (conf, ms) => {
	const web3 = conf.web3

	console.log(" ") //blank space
	const replServer = repl.start({ prompt: ">> " })
	replServer.context.web3 = web3
	replServer.defineCommand("getBalance", {
		help: "Get the balance of your accounts.",
		async action() {
			if (conf.wallet) {
				conf.wallet.getAccounts().forEach(async account => {
					console.log(
						`${account} | Balance: ${web3.fromWei(
							await eac.Util.getBalance(web3, account)
						)}`
					)
				})
			} else {
				const account = web3.eth.defaultAccount
				console.log(
					`${account} | Balance: ${web3.fromWei(
						await eac.Util.getBalance(web3, account)
					)}`
				)
			}
		},
	})
	replServer.defineCommand("getBlock", {
		help: "Get the latest blockNum and timestamp",
		async action() {
			const block = await web3.eth.getBlock("latest")
			console.log(
				`BlockNum: ${block.number} | Timestamp: ${block.timestamp}`
			)
		},
	})
	replServer.defineCommand("dumpCache", {
		help: "Dumps your cache storage.",
		action() {
			if (conf.cache.isEmpty()) {
				console.log("Cache empty")
			} else {
				conf.cache.stored().forEach(entry => {
					console.log(`${entry} | ${conf.cache.get(entry)}`)
				})
			}
		},
	})
	replServer.defineCommand("logLevel", {
		help: "Defines the level to log, 1 - debug/cache, 2 - info, 3- error.",
		action(level) {
			if (level < 0 || level > 3) {
				console.log(
					"Please define 1 for debug, 2 for info, 3 for error."
				)
				return
			}
			conf.logger.logLevel = level
		},
	})
	replServer.defineCommand("start", {
		help: "Starts the execution client.",
		action() {
			conf.scanning = true
		},
	})
	replServer.defineCommand("stop", {
		help: "Stops the execution client.",
		action() {
			conf.scanning = false
		},
	})
	replServer.defineCommand("sweepCache", {
		help: "Sweeps your cache of expired txRequests.",
		action() {
			conf.cache.sweepExpired()
		},
	})
	replServer.defineCommand("testTx", {
		help:
			"Send a test transaction to the network (requires unlocked local account).",
		action() {
			const ora = require("ora")
			const spinner = ora(
				"Sending test transaction to network..."
			).start()
			const testScheduler = require("../scheduling/testTx")
			testScheduler(conf.chain, web3)
				.then(receipt => {
					if (receipt.status != 1) {
						spinner.fail("Transaction failed.")
						return
					}
					spinner.succeed(
						`Transaction mined! Hash ${receipt.transactionHash}`
					)
				})
				.catch(err => spinner.fail(err))
		},
	})
	replServer.defineCommand("getStats", {
		help: "Get some interesting stats on your executing accounts.",
		action() {
			const stats = conf.statsdb.getStats()
			stats.forEach(accountStats => {
				let etherGain = accountStats.currentEther.minus(
					accountStats.startingEther
				)
				etherGain = web3.fromWei(etherGain.toString())
				console.log(
					`${accountStats.account} | Claimed: ${
						accountStats.claimed
					} | Executed: ${
						accountStats.executed
					} | Ether gain: ${etherGain}`
				)
			})
		},
	})
}

module.exports = {
	start,
}
