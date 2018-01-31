# Running an Execution client with eac.js

One of the things you can do with the eac.js commandline tool
is run an execution client. This client will scan the blockchain 
looking for upcoming transaction requests and attempt to claim and 
execute them. If the client successfully executes a transaction, it will
be rewarded with the `payment` that was set by the scheduler as well
as reimbursed for all the gas costs. 

_Note: Currenlty eac.js is only available for the Ropsten or Kovan testnet and only
works on a parity local node. Geth support is not available on the stable branch
and is not recommended at this time._

## Setting up a Parity local node

To run the execution client on the commandline requires the set up of a 
Parity local node on the Ropsten or Kovan test networks. This requirement is due to 
the fact that the client relies on a Parity-specific API for checking
the transaction pool for existing calls to contracts. Without this 
RPC call, the client will try to send transactions on top of other clients
which would invetibly lead to one of those calls being denied and thereby
losing the client some gas fees. You can download Parity by following the 
instructions on their [github](https://github.com/paritytech/parity).

For the sake of this tutorial, we will be using the Ropsten network, but all
the commands should work by specifying the Kovan network instead.

We begin by creating a new account.

```bash
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

```bash
$ parity --geth --chain ropsten --unlock <YOUR ACCOUNT> --password <PASSWORD FILE>
```

Parity should continue syncing with your account unlocked. Your next
steps should be finding a source for some Ropsten Ether, try the [Metamask
faucet](faucet.metamask.io) or ask in the Ethereum Alarm Clock Gitter room.

## Running the client

You can run the client using just your default account by simply passing the
`-c` option to eac.js. The tool will automatically pickup which network you
are using. It will drop you into a REPL that has a few speciic commands to
help with interacting with the EAC.

```bash
$ eac.js -c
⏰⏰⏰ Welcome to the Ethereum Alarm Clock client ⏰⏰⏰

Wallet support: Disabled

Executing from account:
0x009f7EfeD908c05df5101DA1557b7CaaB38EE4Ce | Balance: 62.055242795864837678

>>
```

The REPL is an important aspect of the eac.js tool and provides you
with a set of specific commands that will help you in interacting with
and executing on the Ethereum Alarm Clock contracts. The EAC-centric commands 
you can pass to this REPL are below:

```rust
.dumpCache          Dumps your cache storage.
.getBalance         Get the balance of your accounts.
.getBlock           Get the latest blockNum and timestamp.
.getStats           Get some interesting stats on your executing accounts.
.logLevel <num>     Defines the level to log, 1 - debug/cache, 2 - info, 3 - error.
.requestInfo <addr> Retrieves some info about the transaction request at <addr>.
.start              Starts the execution client.
.stop               Stops the execution client.
.sweepCache         Sweeps your cache of expired txRequests.
.testTx             Send a test transaction to the network (requires unlocked local account).
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

One last note! The logs will be output to ~/.eac.log. You can follow the output
by opening a new terminal screen and running `tail -f ~/.eac.log`. Remember that
you can change the logging output inside the REPL using the `.logLevel <num>`
command.

And that's all there is to it. If you have any questions please join us on Gitter,
or raise an issue on Github. Thanks for using the tool! 🙂