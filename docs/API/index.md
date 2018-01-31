# API Documentation

The eac.js library provides utilies to interact with the Ethereum Alarm Clock contracts.
It exposes a few endpoints which mainly provide convenience wrappers over
the essiential functions of the contracts. 

In general you will simply `npm install` the `eac.js` package then `require` it in your 
source file. The module exports a function that accepts a Web3 object as its 
only argument and returns the eac object. For backwards compability with pre-1.1.0
API simply pass no argument into this function.


```javascript
const Web3 = require("web3")
const provider = new Web3.providers.HttpProvider('http://localhost:8545')
const web3 = new Web3(provider)

// Initializes EAC for the contracts on the same chain as Web3 object.
const eac = require('eac.js')(web3)
```

For pre-1.1.0 API:
```javascript
const eac = require('eac.js')()
```

Note: The rest of this guide uses the latest API and assumes you instatiated
`eac` by passing in a web3 object.