#!/usr/bin/env node
"use strict";

const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const readdirAsync = promisify(fs.readdir);
const readFileAsync = promisify(fs.readFile);

const start = async () => {
  const allTierTraders = await readAllTierUsers();
  const tierOneTraders = await readTierOneUsers();
  const allContributors = await readAllContributors();

  let allTierUsers = allContributors.concat(allTierTraders);
  let tierOneUsers = allContributors.concat(tierOneTraders);

  allTierUsers = allTierUsers.filter((x, i, a) => a.indexOf(x) == i);
  tierOneUsers = tierOneUsers.filter((x, i, a) => a.indexOf(x) == i);

  console.log('No of tier one users: ', allTierUsers.length);
  console.log('no of all tier users: ', tierOneUsers.length);

  console.log('ALL TIER USERS BELOW:');
  console.log(JSON.stringify(allTierUsers));

  console.log('TIER ONE USERS BELOW:');
  console.log(JSON.stringify(tierOneUsers));
};

// all contributors interacted with NIFTEX before block 10639000 (Feb 9 2021 0000 +00)
const readAllContributors = async () => {
  const directory = path.join(process.cwd());
  const files = await readdirAsync(directory);
  
  let allBalances = [];
  const contents = await readFileAsync(path.join(directory, 'contributors.json'));
  const parsed = JSON.parse(contents.toString());
  allBalances = allBalances.concat(parsed);

  const allContributors = allBalances.filter(bal => bal.type !== 'contract').map(bal => bal.wallet.toLowerCase()).filter((x, i, a) => a.indexOf(x) == i);
  console.log('All tier contributors');
  console.log(JSON.stringify(allContributors));

  return allContributors;
}

const readAllTierUsers = async () => {
  const directory = path.join(process.cwd(), 'all_tier_users');
  const files = await readdirAsync(directory);
  
  let allBalances = [];
  for await (const file of files) {
    console.log("Parsing ", file);

    const contents = await readFileAsync(path.join(directory, file));
    const parsed = JSON.parse(contents.toString());
    allBalances = allBalances.concat(parsed);
  }

  const allTierUsers = allBalances.filter(bal => bal.type !== 'contract').map(bal => bal.wallet.toLowerCase()).filter((x, i, a) => a.indexOf(x) == i);
  console.log('All tier users');
  console.log(JSON.stringify(allTierUsers));

  return allTierUsers;
}

const readTierOneUsers = async () => {
  const directory = path.join(process.cwd(), 'tier_one_users');
  const files = await readdirAsync(directory);
  
  let allBalances = [];
  for await (const file of files) {
    console.log("Parsing ", file);

    const contents = await readFileAsync(path.join(directory, file));
    const parsed = JSON.parse(contents.toString());
    allBalances = allBalances.concat(parsed);
  }

  const tierOneUsers = allBalances.filter(bal => bal.type !== 'contract').map(bal => bal.wallet.toLowerCase()).filter((x, i, a) => a.indexOf(x) == i);
  console.log('Tier 1 users');
  console.log(JSON.stringify(tierOneUsers));

  return tierOneUsers;
}

(async () => {
  try {
    await start();
  } catch (e) {
    console.error(e);
  }
})();
