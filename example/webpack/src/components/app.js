'use strict'

const React = require('react')
const Eac = require('eac')
const Web3 = require('web3')
const BigNumber = require('bignumber.js')

class App extends React.Component {
  constructor (props) {
    	super(props)
    	this.state = {
			account: '',
			eac: {}
    	}
	}

	componentDidMount () {
		if (typeof web3 !== 'undefined') {
			// mist/metamask is active
			web3 = new Web3(web3.currentProvider)
			web3.eth.getAccounts((err, res) => {
				if (!err) {
					this.setState({account: res[0]})
					web3.eth.defaultAccount = res[0]
				}
			})
			window.eac = new Eac(web3, 'ropsten')
			this.setState({eac: window.eac})
		}
	}

	onSubmit () {
		const toAddress = document.getElementById('toAddress').value
		const callData = document.getElementById('callData').value
		const callGas = document.getElementById('callGas').value
		const callValue = document.getElementById('callValue').value
		const windowSize = document.getElementById('windowSize').value
		const windowStart = document.getElementById('windowStart').value
		const gasPrice = document.getElementById('gasPrice').value
		const donation = document.getElementById('donation').value
		const payment = document.getElementById('payment').value
		const requiredDeposit = document.getElementById('requiredDeposit').value
		console.log('submit pressed!')
		console.log(toAddress)

		const endowment = eac.calcEndowment(
			new BigNumber(callGas),
			new BigNumber(callValue),
			new BigNumber(gasPrice),
			new BigNumber(donation),
			new BigNumber(payment)
		)
		// console.log(endowment)
		eac.initSender({
			from: web3.eth.defaultAccount,
			gas: 3000000,
			value: endowment
		})

		console.log(toAddress,
			web3.fromAscii(callData),
			callGas,
			callValue,
			windowSize,
			windowStart,
			gasPrice,
			donation,
			payment,
			requiredDeposit)

		eac.blockSchedule(
			toAddress,
			web3.fromAscii(callData),
			callGas,
			callValue,
			windowSize,
			windowStart,
			gasPrice,
			donation,
			payment,
			requiredDeposit
		)
	}

  render () {
    return (
      <div className='container'>
				<section className="hero is-link">
					<div className="hero-body">
						<div className="container">
							<h1 className="title">
								Schedule a transaction!
							</h1>
							<h2 className="subtitle">
								Your account: {this.state.account}
							</h2>
						</div>
					</div>
				</section>
        <hr />
				<div className='field'>
				<label className='label' for='toAddress'>Recipient Address:</label>
				<input className='input' type='text' id='toAddress' />

				<label className='label' for='callData'>Call Data:</label>
				<input className='input' type='text' id='callData' />

				<label className='label' for='callGas'>Call Gas:</label>
				<input className='input' type='text' id='callGas' />

				<label className='label' for='callValue'>Call Value</label>
				<input className='input' type='text' id='callValue' />

				<label className='label' for='windowSize'>Window Size:</label>
				<input className='input' type='text' id='windowSize' />

				<label className='label' for='windowStart'>Window Start:</label>
				<input className='input' type='text' id='windowStart' />

				<label className='label' for='gasPrice'>Gas Price:</label>
				<input className='input' type='text' id='gasPrice' />

				<label className='label' for='donation'>Donation:</label>
				<input className='input' type='text' id='donation' />

				<label className='label' for='payment'>Payment:</label>
				<input className='input' type='text' id='payment' />

				<label className='label' for='requiredDeposit'>Required Deposit</label>
				<input className='input' type='text' id='requiredDeposit' />
				
				<hr />
				<div className="control">
					<div className="select">
						<select>
							<option>Blocks</option>
							<option>Timestamp</option>
						</select>
					</div>
					&nbsp;&nbsp;&nbsp;&nbsp;
					<button onClick={this.onSubmit} className="button is-link">Submit</button>
				</div>

				</div>
      </div>
    )
  }
}

module.exports = App