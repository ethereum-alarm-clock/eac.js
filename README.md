_Note: `eac.js` is operational but still considered alpha software, released to the public for expirmentation and testing. We do not recommend using it on the mainnet as it will lose you money under certain situations._ 

# eac.js

Commandline tool to interact with the [Ethereum Alarm Clock](https://github.com/ethereum-alarm-clock/ethereum-alarm-clock). Includes options to run an execution client or schedule a transaction. Currenlty used for testing of the Ethereum Alarm Clock contracts while we hammer out all the bugs on the Ropsten and Rinkeby testnets.

## Installing

You will need node 8.0.0 installed. We recommend using [nvm](https://github.com/creationix/nvm) to easily manage your node versions. 

After following the instruction to install nvm on your machine:

```
    $ nvm use 8.0.0
```

Clone down this repository to your local computer and run these npm commands in the root of your directory to install the required packages from `package.json` and to link the binary to your node installation.

```
    $ npm install
    $ npm link
```

You now should have the `eac` executable available from any of your directories. (If you're using nvm like suggested be aware that sometimes you may be thrown into a different default installation when starting a new shell. In this case, you can use `nvm use 8.0.0` to switch back to the 8.0.0 installation where `eac` is available.)

## Running

You can run eac with the help flag to see the options for starting the client.

```
    $ eac --help

    Usage: eac [options]


    Options:
        -V, --version               output the version number
        -t, --test                  sends a test transaction to the network
        --createWallet              guides you through creating a new wallet.
        -c, --client                starts the executing client
        -m, --milliseconds <ms>     tells the client to scan every <ms> seconds (default: 4000)
        --logfile [path]            specifies the output logifle (default: default)
        --chain [ropsten, rinkeby]  selects the chain to use
        --provider <string>         set the HttpProvider to use (default: http://localhost:8545)
        -w, --wallet [path]         specify the path to the keyfile you would like to unlock (default: none)
        -p, --password [string]     the password to unlock your keystore file (default: password)
        -s, --schedule              schedules a transactions
        -h, --help                  output usage information
```

 Generally there are two major options, with a third that is helpful for testing the execution client on the live testnets. These options are to run a client, run the commandline scheduling wizard, or to send a quick test transaction to the network.

 For more information on setting up a local node to begin running a client please proceed to the `docs/` directory and follow the instrustions for either Parity or Geth, depending on your preference.

## Questions or Concerns?

Since this is alpha software, we highly encourage you to test it, use it and try to break it. We would love your feedback if you get stuck somewhere or you think something is not working the way it should be. Please open an issue if you need to report a bug or would like to leave a suggestion. Pull requests are welcome.