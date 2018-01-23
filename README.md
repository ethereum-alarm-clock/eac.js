_Note: `eac.js` is operational but still considered alpha software, released to the public for expirmentation and testing. We do not recommend using it on the mainnet as it will lose you money under certain situations._ 

[![Build Status](https://travis-ci.org/ethereum-alarm-clock/eac.js.svg?branch=stable)](https://travis-ci.org/ethereum-alarm-clock/eac.js)

# eac.js

A tool to interact with the [Ethereum Alarm Clock](https://github.com/ethereum-alarm-clock/ethereum-alarm-clock) protocol.
It is both a commandline tool for running an execution client or scheduling a transaction as well
as a Javascript library and an extension on the standard web3.js library facilitating an open API
for interacting with the Ethereum Alarm Clock contracts from Javascript.

## Documentation

Please see the full [documentation](https://ethereum-alarm-clock.github.io/eac.js/) for instructions on how 
to use `eac.js` commandline tool as well as a full reference of the API library.

## Testing

Run `npm test` at the root of the directory to run the test script on an isolated virtual blockchain using mocha. 

## Contributing

Pull requests are always welcome. Not all functionalities of the Ethereum Alarm Clock smart contracts are translated to this library, it was mostly just utilities needed to write the client and grew from there. If you need some functionality and are not finding it in the API docs, please open a issue or contribute a pull request.

## Questions or Concerns?

Since this is alpha software, we highly encourage you to test it, use it and try to break it. We would love your feedback if you get stuck somewhere or you think something is not working the way it should be. Please open an issue if you need to report a bug or would like to leave a suggestion. Pull requests are welcome.
