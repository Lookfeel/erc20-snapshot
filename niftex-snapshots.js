#!/usr/bin/env node
"use strict";

const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const readdirAsync = promisify(fs.readdir);
const readFileAsync = promisify(fs.readFile);

const start = async () => {
  const allTierUsers = await readAllTierUsers();
  const tierOneUsers = await readTierOneUsers();

  console.log('No of allTierUsers: ', allTierUsers.length);
  console.log('No of tierOneUsers: ', tierOneUsers.length);
};

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
