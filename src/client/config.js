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
    provider
  ) {
    this.scanSpread = scanSpread
    this.logger = new Logger(logfile, logLevel)

    this.cache = new Cache(this.logger)
    this.factory = factory
    this.tracker = tracker
    this.web3 = web3
    this.eac = eac
    this.provider = provider
  }

  async instantiateWallet(file, password) {
    if (file === "none") {
      return false
    }
    const wallet = new LightWallet(this.web3)
    await wallet.decryptAndLoad(file, password)
    this.wallet = wallet 
  }
}

module.exports = Config
