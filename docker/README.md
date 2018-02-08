[<img src="https://s3.amazonaws.com/chronologic.network/ChronoLogic_logo.svg" width="128px">](https://github.com/chronologic)

# Docker

Sample `Dockerfile` for running the `eac.js` node with remote web3 provider

## Instructions

To create a docker image from the Dockerfile you need to generate the `wallet.json` file by running

`eac.js --createWallet` and completing the wizard

Next step is to run docker build command

`docker build -t eac.js-client .`

Next running docker image

`docker run -it -e PASSWORD={PASSWORD} -e PROVIDER={PROVIDER} eac.js-client`

where

+ `{PASSWORD}` is a password used during wizard to encrypt `wallet.json`
+ `{PROVIDER}` is an url address of web3 provider *note: `eac.js` relies on web3 node that exposes txpool API, currently the recommender client is **parity 1.8.9*** 