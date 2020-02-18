"use strict";

var PlayXCoin = artifacts.require("./PlayXCoin.sol");
var PlayXCoinBatchSender = artifacts.require("./PlayXCoinBatchSender.sol");
const theBN = require("bn.js")


const deployBatchSender = (coin, owner) => {
  return PlayXCoinBatchSender.new(coin, {from:owner});
};

const deployPlayXCoin = (owner,admin,vault) => {
  return PlayXCoin.new("PLX", "PlayXCoin", owner, admin, vault);
};

/**
 * PlayXCoin contract learning test
 *   deploy in before, and no deploy between it()
 */
contract("PlayXCoinBatchSender", (accounts) => {
  const BIG = (v) => new theBN.BN(v)

  const owner = accounts[0];
  const admin = owner;
  const vault = owner;
  const minter = accounts[1];

  const users = [];
  let NoOfTokensInDennis, OnePlayXCoinInDennis, NoOfTokens;
  let coin;
  let sender;

  const bnBalanceOf = async addr => await coin.balanceOf(addr);
  const bnReserveOf = async addr => await coin.reserveOf(addr);
  const bnAllowanceOf = async (owner, spender) => await coin.allowance(owner, spender);

  const balanceOf = async addr => (await coin.balanceOf(addr)).toString();
  const reserveOf = async addr => (await coin.reserveOf(addr)).toString();
  const allowanceOf = async (owner, spender) => (await coin.allowance(owner,spender)).toString();

  const assertRevert = async (msg, ft) => {
    try {
      await ft();
      console.log(`AssetionFail: Exception not occurred while runing ${msg} ${ft}`);
      assert.fail();
    } catch(exception) {
      try {
        assert.isTrue(exception.message.includes("revert"));
      } catch(exception2) {
        console.log(`Assert fail while runing ${msg} ${ft}: ${exception.message}`);
        throw exception2;
      }
    }
  }

  const assertNotRevert = async (msg, ft) => {
    try {
      const x = await ft();
      return x;
    } catch(exception) {
      console.log(`Assert fail while running ${msg} ${ft}: ${exception.message}`);
      assert.fail();
    }
  }

  before(async () => {
    coin = await deployPlayXCoin(owner, admin, vault);
    sender = await deployBatchSender(coin.address, vault);
    NoOfTokensInDennis = await coin.totalSupply();
    OnePlayXCoinInDennis = await coin.getOnePlayXCoin();
    NoOfTokens = NoOfTokensInDennis.div(OnePlayXCoinInDennis);

    // generate 100 addresses
    const keythereum = require("keythereum")
    for(let i=0; i<100; ++i) {
      const key = keythereum.create();
      const addr = keythereum.privateKeyToAddress(key.privateKey);
      users.push(addr);
    }

    // change vault to the contract
    await coin.setVault(sender.address, {from: owner})
  });

  it("length check", async () => {
    assertNotRevert("[],[]", () => sender.sendBatch([],[], {from: vault}));
    assertNotRevert("[users[0]],[0]", () => sender.sendBatch([users[0]],[0], {from: vault}));

    const zeros = [];
    for(let i=0; i<100; ++i) zeros.push(0);

    assertNotRevert("length 100", () => sender.sendBatch(users,zeros, {from: vault}));

    assertRevert("[users[0]],[]", () => sender.sendBatch([users[0]],[], {from: vault}));
  });

  it("nomal list size 1", async () => {
    const amount = OnePlayXCoinInDennis.mul(BIG(1));
    await assertNotRevert("[accounts[1]],[1PLX]", () => sender.sendBatch([accounts[0]],[amount], {from: vault}));
    assert.equal(await balanceOf(accounts[0]), amount.toString());
  });

  it("nomal list size 5", async () => {
    const amount = OnePlayXCoinInDennis.mul(BIG(2));
    const array = [];
    const varray = [];

    for(let i=1; i<6; ++i) {
      array.push(accounts[i]);
      varray.push(amount);
    }

    await assertNotRevert("5 person 2 PLX each", () => sender.sendBatch(array,varray, {from: vault}));
    for(let i=1; i<6; ++i) {
      assert.equal(await balanceOf(accounts[i]), amount.toString());
    }
  });

  it("normal list size 100", async () => {
    const array = [];
    const varray = [];

    for (let i = 0; i < 100; ++i) {
      array.push(users[i]);
      varray.push(BIG(i).mul(OnePlayXCoinInDennis).add(BIG(i + 1)));
    }

    await assertNotRevert("5 person 2 PLX each", () => sender.sendBatch(array, varray, {from: vault}));
    for (let i = 1; i < 6; ++i) {
      assert.equal(await balanceOf(users[i]), varray[i].toString());
    }
  });

  it("only owner can run the sendBatch", async () => {
    await assertRevert("[users[0]],[0] from accounts[5]", () => sender.sendBatch([users[0]],[0], {from: accounts[5]}));
  })
});
