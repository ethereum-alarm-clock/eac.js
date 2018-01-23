# Running an Execution client with eac.js

One of the things you can do with the eac.js commandline tool
is run an execution client. This client will scan the blockchain 
looking for upcoming transaction requests and attempt to claim and 
execute them. If the client successfully executes a transaction, it will
be rewarded with the `payment` that was set by the scheduler as well
as reimbursed for all the gas costs. 

_Note: Currenlty eac.js is only available for the Ropsten testnet and only
works on a parity local node._

## Setting up a Parity local node

To run the execution client while it is in beta requires the set up of a 
Parity local node on the Ropsten test network. This requirement is due to 
the fact that the client relies on a Parity-specific API for checking
the transaction pool for existing calls to contracts. Without this 
RPC call, the client will try to send transactions on top of other clients
which would invetibly lead to one of those calls being denied and thereby
losing the client some gas fees. You can download Parity by following the 
instructions on their [github](https://github.com/paritytech/parity).

For the sake of this tutorial, we will be using the Ropsten network, but all
the commands should work by specifying the Kovan network just as well.

We begin by creating a new account.

```
    $ parity --chain ropsten account new
```

The command will prompt you to enter a new password. As with any password,
make sure you keep it in a secure place and do not lose it. It will also
print the address of your new ethereum account to the console. The next
time you start the parity client, and every time thereafter you will have
to pass a command to make sure that this account is unlocked and able to
sign and send transaction. You will also want to create a text file and save
password in it since parity requires it to unlock the account. Try 
restarting parity again and unlocking the account:

```
    $ parity --geth --chain ropsten --unlock <YOUR ACCOUNT> --password <PASSWORD FILE>
```

Parity should continue syncing with your account unlocked. Your next
steps should be finding a source for some Kovan Ether, we recommend asking
on the Kovan Faucet Gitter chat, they're usually responsive! If that doesn't work 
trying pinging @lsaether on Gitter or asking in the Ethereum Alarm Clock room.

## Optional - Create and fund a light wallet

Eac.js includes the functionality to create and use a lightwallet 
for execution instead of the default unlocked account. Although it
is not strictly necessary, this is a recommended way to use the client,
as it mitigates the issue of a "stuck transaction" blocking the following
executions due to the transactions reliance on an in-order nonce. 

The lightwallet that is created via the eac.js wizard is of the same
type that Geth and Parity creates for you, it creates it on the client side
and saves an encrypted keyfile to your local directory. Begin by starting eac.js
with the `--createWallet` flag and answering the questions that the 
wizard asks. An example output is provided below:

```
    $ eac.js --createWallet
    How many accounts would you like in your wallet? [1 - 10]
    > 4
    Where would you like to save the encrypted keys? Please provide a valid filename or path.
    > ./keyz
    Please enter a password for the keyfile. Write this down!
    > password

    New wallet created!
    Accounts:
    0xf5F2DFA5A836704235C29db828Fca4bD857B272A
    0x3A7e857Ad0CDA3AD1C93E1bb05272a83AF2933Df
    0xFf48193f6370bE0094C3A235C726386fd39b7a67
    0x1C8E06924902A3a7cB641C33946E641F037B03E7
    Saving encrypted file to ./keyz. Don't forget your password!
```

You can make sure your keyfile exists encrypted on your local directory.

```
    $ cat ./keyz
    <prints yours encrypted keys to console>
```

After this is down you will want to fund your children account with
enough ether that they will be able to pay the claim deposits / execution
gas costs. They don't need much for all intents and purposes 1 ether should
be enough for each account on the testnets and on the mainnet potentially 
much less than this.

The eac.js tool also includes a utility to fund your children account
from the default account that you unlocked when starting parity.
Make sure your account has enough ether in it to cover each transaction
and run eac.js with the `--fundWallet` flag and providing the amount of
ether you would like to send to EACH account. (Note: your unlocked account
will need enough ether to cover the amount you pass in times the number
of accounts you created.)

```
    $ eac.js --fundWallet 0.4 --wallet ./keyz --password password
    ⠴ Sending the funding transactions...
    ✔ Accounts funded!
```

You can now check the balance of your lightwallet account by starting
eac.js in client mode and passing in your wallet parameters.

```
    $ eac.js --wallet ./keyz --password password -c
```

Lastly, I will show you how to use eac.js to drain this wallet of its
ether in the case that you decide you want it back. You can use the 
`--drainWallet <target>` flag and pass in a valid ethereum address
to send the funds to as `target`.

```
    $ eac.js --drainWallet 0x1cb960969f58a792551c4e8791d643b13025256d --wallet ./keyz --password password
    ⠹ Sending transactions...
    ✔ Wallet drained!
```

Now your wallet will need to be funded in the future if you ever want 
to start using it again.

## Running the client

You can run the client using just your default account by simply passing the
`-c` option to eac.js. The tool will automatically pickup which network you
are using. It will drop you into a REPL that has a few speciic commands to
help with interacting with the EAC.

```
    $ eac.js -c
    ⏰⏰⏰ Welcome to the Ethereum Alarm Clock client ⏰⏰⏰

    Wallet support: Disabled

    Executing from account:
    0x009f7EfeD908c05df5101DA1557b7CaaB38EE4Ce | Balance: 62.055242795864837678

    >>
```

If you want to run the client with wallet support enabled, you would simply
provide the `--wallet <keyfile>` and `--password <password>` flags.

```
    $ eac.js --wallet ./keyz --password password -c
```

The REPL is an important aspect of the eac.js tool and provides you
with a set of specific commands that will help you in interacting with
and executing on the Ethereum Alarm Clock contracts. The EAC-centric commands 
you can pass to this REPL are below:

```
.dumpCache    Dumps your cache storage.
.getBalance   Get the balance of your accounts.
.getBlock     Get the latest blockNum and timestamp.
.getStats     Get some interesting stats on your executing accounts.
.logLevel     Defines the level to log, 1 - debug/cache, 2 - info, 3 - error.
.start        Starts the execution client.
.stop         Stops the execution client.
.sweepCache   Sweeps your cache of expired txRequests.
.testTx       Send a test transaction to the network (requires unlocked local account).
```

The most important commands are probably `.start` and `.stop` which 
respectively begins and pauses the execution clients. When you begin
executing, you client will search the blockchain for upcoming transaction
requests registered with the Ethereum Alarm Clock contracts and store them
in your local cache. It will then periodically scan your cache for actionable
transaction requests and perform one of three actions on them: claim, execute, or
cleanup. If one of your accounts executes a transaction, it will earn money. You
can check on the stats of your executing accounts at any time by using the
`.getStats` command. Likewise, you can view the contents of your cache by
using the `.dumpCache` command and if you would like to clear away old requests,
use `.sweepCache` (although the client will do this automatically every 12 minutes).

If you notice that the blockchain is sparse of upcoming transactions, you can 
populate a test transaction by using the command `.testTx`. Note! This will use
your default unlocked account to send a transaction to the network so make sure
you have enough testnet ether in your account to do this.

And that's all there is to it. If you have any questions please join us on Gitter,
or raise an issue on Github. Thanks for using the tool! 🙂