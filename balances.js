"use strict";
var BigNumber = require("bignumber.js");
const enumerable = require("linq");

module.exports.createBalances = async data => {
  const balances = new Map();
  const closingBalances = [];

  const setDeposits = event => {
    const wallet = event.to;

    let deposits = new BigNumber((balances.get(wallet) || {}).deposits || 0);
    let withdrawals = new BigNumber((balances.get(wallet) || {}).withdrawals || 0);

    if (event.value) {
      deposits = deposits.plus(new BigNumber(event.value));
      balances.set(wallet, { deposits, withdrawals });
    }
  };

  const setWithdrawals = event => {
    const wallet = event.from;

    let deposits =  new BigNumber((balances.get(wallet) || {}).deposits || 0);
    let withdrawals =  new BigNumber((balances.get(wallet) || {}).withdrawals || 0);

    if (event.value) {
      withdrawals = withdrawals.plus(new BigNumber(event.value));
      balances.set(wallet, { deposits, withdrawals });
    }
  };

  for (const event of data.events) {
    setDeposits(event);
    setWithdrawals(event);
  }

  for (const [key, value] of balances.entries()) {
    if (key === "0x0000000000000000000000000000000000000000") {
      continue;
    }

    const balance = value.deposits.minus(value.withdrawals);

    closingBalances.push({
      wallet: key,
      balance: balance.div(new BigNumber(10).times(parseInt(data.decimals))).toFixed()
    });
  }

  return enumerable
    .from(closingBalances)
    .orderByDescending(x => parseFloat(x.balance))
    .toArray();
};
