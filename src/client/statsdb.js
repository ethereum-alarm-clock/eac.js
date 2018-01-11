const BigNumber = require('bignumber.js')
const loki = require('lokijs')

/// Wrapper over a lokijs persistent storage to keep track of the stats of executing accounts.
class StatsDB {

    constructor (web3) {
        this.db = new loki('stats.json')
        this.stats = this.db.addCollection('stats')
        this.web3 = web3
    }

    /// Takes an arry of addresses and stores them as new stats objects.
    initialize (accounts) {
        accounts.forEach(account => {
            this.web3.eth.getBalance(account)
            .then(bal => {
                bal = new BigNumber(bal)
                this.stats.insert({
                    account: account,
                    claimed: 0,
                    executed: 0,
                    startingEther: bal,
                    currentEther: bal,
                })
            })
        })
    }

    /// Takes the account which has claimed a transaction.
    updateClaimed (account) {
        const found = this.stats.find({ account: account })[0]
        found.claimed++
        this.web3.eth.getBalance(account)
        .then(bal => {
            bal = new BigNumber(bal)
            const difference = bal.minus(found.currentEther)
            found.currentEther = found.currentEther.plus(difference)
            this.stats.update(found)
        })
    }

    /// Takes the account which has executed a transaction.
    updateExecuted (account) {
        const found = this.stats.find({ account: account })[0]
        found.executed++
        this.web3.eth.getBalance(account)
        .then(bal => {
            bal = new BigNumber(bal)
            const difference = bal.minus(found.currentEther)
            found.currentEther = found.currentEther.plus(difference)
            this.stats.update(found)
        })
    }

    /// Gets the stats
    // @returns an array of the DB objs
    getStats () {
        return this.stats.data
    }
}

module.exports = StatsDB
