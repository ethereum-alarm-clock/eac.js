_Note: `eac.js` is operational but still considered alpha software, released to the public for expirmentation and testing. We do not recommend using it on the mainnet as it will lose you money under certain situations._ 

# Ethereum Alarm Clock CLI

The Ethereum Alarm Clock CLI, otherwise known as eac.js, is a tool to help
users of the [Ethereum Alarm Clock](https://github.com/ethereum-alarm-clock/ethereum-alarm-clock) protocol. It allows you to either run
an execution server or schedule a transaction with the terminal wizard. It may
seem daunting at first but its actually a very simple tool to learn how to use.

## How to install

For now, you must install from source. Begin by cloning this repository to your 
local directory and downloading [nvm](https://github.com/creationix/nvm). Nvm is
an awesome tool to help manage your node.js versions. We use it since the eac.js
codebase runs best on node v8.0.0. You can tell your environment to use node v8.0.0
like so:

```
    $ nvm install 8.0.0
    $ nvm use 8.0.0
```

Next you will use npm to install the dependencies (should take just a minute or two).
Then you will tell npm to link your global environment to this repository so that
you have access to the `eac` executable whenever you are inside your nvm node v8.0.0
environment.

```
    $ npm install
    $ npm link
```

You now will have the `eac` executable available.

```
    $ eac

      error: please start eac in either client `-c` or sheduling `-s` mode
```

## Running

You can run eac with the help flag to see the options for starting the client.

```
    $ eac --help

    Usage: eac [options]

    Options:

        -V, --version               output the version number
        --createWallet              guides you through creating a new wallet.
        --fundWallet <eth>          funds the accounts in wallet with amount "eth"
        --drainWallet <target>      sends the target address all ether in the wallet
        -c, --client                starts the executing client
        -m, --milliseconds <ms>     tells the client to scan every <ms> seconds (default: 4000)
        --logfile [path]            specifies the output logifle (default: default)
        --logLevel [0,1,2,3]        sets the log level (default: 2)
        --chain [ropsten, rinkeby]  selects the chain to use
        --provider <string>         set the HttpProvider to use (default: http://localhost:8545)
        -w, --wallet [path]         specify the path to the keyfile you would like to unlock
        -p, --password [string]     the password to unlock your keystore file
        -s, --schedule              schedules a transactions
```

Please see the [docs](docs/) directory for detailed guides on how to run an execution server
or to schedule a transaction.

## Questions or Concerns?

Since this is alpha software, we highly encourage you to test it, use it and try to break it. We would love your feedback if you get stuck somewhere or you think something is not working the way it should be. Please open an issue if you need to report a bug or would like to leave a suggestion. Pull requests are welcome.