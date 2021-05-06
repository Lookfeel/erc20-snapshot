#!/usr/bin/env node
"use strict";

const Web3 = require('web3');
const path = require("path");
const launchContract = require('./abis/launchContract');
const fileHelper = require('./file-helper');
const fs = require("fs");
const { promisify } = require("util");
const readdirAsync = promisify(fs.readdir);
const readFileAsync = promisify(fs.readFile);

const config = {
  web3Url: 'https://rpc-mainnet.maticvigil.com/v1/749c711c29a1bc4760bda531cf193fbe4ddcc124',
  fromBlock: 10341996,
  toBlock: 10341997,
  blocksPerBatch: 1000,
  offeringAddress: "0xDC3b44Ea47a03B25Bf81fD4c8c090Be501b2DAFB"
}

const web3 = new Web3(new Web3.providers.HttpProvider(config.web3Url));

const getLaunchContract = (offeringAddress) => {
  return new web3.eth.Contract(launchContract.abi, offeringAddress);
}

const start = async () => {
  // writeFile({
  //   data: {"coolStory": "blabla"},
  //   offeringAddress: 'y0m4m4'
  // });

  await getContributions();
};

const writeFile = async({
  data,
  offeringAddress
}) => {
  fileHelper.writeFile(path.join(process.cwd(), 'launches_txn', `${offeringAddress}.json`), data);
}

const getContributions = async () => {
  const LaunchContract = getLaunchContract(config.offeringAddress);

  let fromBlock = config.fromBlock;

  let allContributions = [];

  while (fromBlock < config.toBlock) {
    const start = fromBlock;
    const end = fromBlock + config.blocksPerBatch - 1;

    const pastEvents = await LaunchContract.getPastEvents('Contribution', {
      fromBlock: start,
      toBlock: end
    });

    console.log(`Start: ${start}, end: ${end}`);

    allContributions = allContributions.concat(
      pastEvents.map(e => Object.assign({
        wallet: e.returnValues['contributor'],
        weiAmount: e.returnValues['weiAmount'],
        blockNumber: e.blockNumber,
      }))
    );

    fromBlock = start + config.blocksPerBatch;
  }

  await writeFile({
    data: allContributions,
    offeringAddress: config.offeringAddress.toLowerCase()
  });
} 

// const readAllTierUsers = async () => {
//   const directory = path.join(process.cwd(), 'all_tier_users');
//   const files = await readdirAsync(directory);
  
//   let allBalances = [];
//   for await (const file of files) {
//     console.log("Parsing ", file);

//     const contents = await readFileAsync(path.join(directory, file));
//     const parsed = JSON.parse(contents.toString());
//     allBalances = allBalances.concat(parsed);
//   }

//   const allTierUsers = allBalances.filter(bal => bal.type !== 'contract').map(bal => bal.wallet.toLowerCase()).filter((x, i, a) => a.indexOf(x) == i);
//   console.log('All tier users');
//   console.log(JSON.stringify(allTierUsers));

//   return allTierUsers;
// }

(async () => {
  try {
    await start();
  } catch (e) {
    console.error(e);
  }
})();
