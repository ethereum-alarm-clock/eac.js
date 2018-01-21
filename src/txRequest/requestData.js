const { BigNumber } = require('bignumber.js')

class RequestData {
    constructor(data, txRequest) {
        if (typeof data === 'undefined' || typeof txRequest === 'undefined') {
            throw new Error('Cannot call the constructor directly.')
        }
        this.txRequest = txRequest
        this.fill(data)
    }

    fill (data) {
        this.claimData = {
            "claimedBy": data[0][0],
            "claimDeposit": new BigNumber(data[2][0]),
            "paymentModifier": parseInt(data[3][0]),
            "requiredDeposit": new BigNumber(data[2][14]),
        }

        this.meta = {
            "createdBy": data[0][1],
            "owner": data[0][2],
            "isCancelled": data[1][0],
            "wasCalled": data[1][1],
            "wasSuccessful": data[1][2],
        }

        this.paymentData = {
            "donationBenefactor": data[0][3],
            "paymentBenefactor": data[0][4],
            "donation": new BigNumber(data[2][1]),
            "donationOwed": new BigNumber(data[2][2]),
            "payment": new BigNumber(data[2][3]),
            "paymentOwed": new BigNumber(data[2][4]),
        }

        this.schedule = {
            "claimWindowSize": new BigNumber(data[2][5]),
            "freezePeriod": new BigNumber(data[2][6]),
            "reservedWindowSize": new BigNumber(data[2][7]),
            "temporalUnit": parseInt(data[2][8]),
            "windowSize": new BigNumber(data[2][9]),
            "windowStart": new BigNumber(data[2][10]),
        }

        this.txData = {
            "callGas": new BigNumber(data[2][11]),
            "callValue": new BigNumber(data[2][12]),
            "gasPrice": new BigNumber(data[2][13]),
            "toAddress": data[0][5],
        }
    }

    static from(txRequest) {
        return new Promise((resolve, reject) => {
            console.log('here')
            txRequest.requestData.call((err, data) => {
                if (err) reject(err)
                else {
                    resolve(new RequestData(data, txRequest))
                }
            })
        })
    }

    refresh () {
        return new Promise((resolve, reject) => {
            this.txRequest.requestData.call((err, data) => {
                if (err) reject(err)
                else {
                    this.fill(data)
                    resolve(true)
                }
            })
        })
    }
}

module.exports = RequestData