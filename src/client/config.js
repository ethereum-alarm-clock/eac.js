const { Cache } = require("./cache.js")
const LightWallet = require("./lightWallet.js")
const { Logger } = require("./logger.js")

class Config {
  constructor(
    scanSpread,
    logfile,
    logLevel,
    factory,
    tracker,
    web3,
    eac,
    provider,
    walletFile,
    password
  ) {
    this.scanSpread = scanSpread
    this.logger = new Logger(logfile, logLevel)

    this.cache = new Cache(this.logger)
    this.factory = factory
    this.tracker = tracker
    this.web3 = web3
    this.eac = eac
    this.provider = provider
    if (walletFile) {
      this.wallet = this.instantiateWallet(walletFile, password)
    }
  }

  instantiateWallet(walletFile, password) {
    if (walletFile === "none") {
      return false
    }
    const wallet = new LightWallet(this.web3)
    wallet.decryptAndLoad(walletFile, password)
    return wallet
  }
}

module.exports = Config
