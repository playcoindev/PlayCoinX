"use strict"

var PlayXCoin = artifacts.require("./PlayXCoin.sol");
const theBN = require("bn.js")

/**
 * PlayXCoin contract tests 2
 */
contract('PlayXCoin2', function(accounts) {
  const BIG = (v) => new theBN.BN(v)

  const owner = accounts[0];
  const admin = accounts[1];
  const vault = accounts[2];
  const minter = accounts[0];

  const user1 = accounts[4];
  const user2 = accounts[5];
  const user3 = accounts[6];
  const user4 = accounts[7];
  const user5 = accounts[8];

  let coin, OnePlayXCoinInDennis, NoOfTokens, NoOfTokensInDennis;

  const bnBalanceOf = async addr => await coin.balanceOf(addr);
  const bnReserveOf = async addr => await coin.reserveOf(addr);
  const bnAllowanceOf = async (owner, spender) => await coin.allowance(owner, spender);

  const balanceOf = async addr => (await coin.balanceOf(addr)).toString();
  const reserveOf = async addr => (await coin.reserveOf(addr)).toString();
  const allowanceOf = async (owner, spender) => (await coin.allowance(owner,spender)).toString();


  before(async () => {
    coin = await PlayXCoin.deployed();
    NoOfTokensInDennis = await coin.totalSupply();
    OnePlayXCoinInDennis = await coin.getOnePlayXCoin();
    NoOfTokens = NoOfTokensInDennis.div(OnePlayXCoinInDennis)
  });

  const clearUser = async user => {
    await coin.setReserve(user, 0, {from: admin});
    await coin.transfer(vault, await bnBalanceOf(user), {from: user});
  };

  beforeEach(async () => {
    await clearUser(user1);
    await clearUser(user2);
    await clearUser(user3);
    await clearUser(user4);
    await clearUser(user5);
  });

  it("only admin can recall", async () => {
      assert.equal(await balanceOf(user1), "0");
      await coin.transfer(user1, OnePlayXCoinInDennis, {from: vault});
      await coin.setReserve(user1, OnePlayXCoinInDennis, {from: admin});
      assert.equal(await balanceOf(user1), OnePlayXCoinInDennis.toString());
      assert.equal(await reserveOf(user1), OnePlayXCoinInDennis.toString());

      try {
          await coin.recall(user1, OnePlayXCoinInDennis, {from: user1});
          assert.fail();
      } catch (exception) {
          assert.isTrue(exception.message.includes("revert"));
      }

      try {
          await coin.recall(user1, OnePlayXCoinInDennis, {from: owner});
          assert.fail();
      } catch (exception) {
          assert.isTrue(exception.message.includes("revert"));
      }

      try {
          await coin.recall(user1, OnePlayXCoinInDennis, {from: vault});
          assert.fail();
      } catch (exception) {
          assert.isTrue(exception.message.includes("revert"));
      }

      try
      {
          await coin.recall(user1, OnePlayXCoinInDennis, {from: admin});
          assert.equal(await balanceOf(user1), "0");
          assert.equal(await reserveOf(user1), "0");
      } catch (exception) { assert.fail() }
  });

  it("recall fails", async () => {
    assert.equal(await bnBalanceOf(user2), 0);
    coin.transfer(user2, OnePlayXCoinInDennis, {from: vault});
    assert.equal(await balanceOf(user2), OnePlayXCoinInDennis.toString());
    assert.equal(await reserveOf(user2), "0");

    try {
      // require(currentReserve >= _amount);
      await coin.recall(user2, OnePlayXCoinInDennis, {from: admin});
      assert.fail();
    }
    catch(exception) {
      assert.isTrue(exception.message.includes("revert"));
    }

    coin.setReserve(user2, OnePlayXCoinInDennis.mul(BIG(3)), {from: admin});
    try {
      // require(currentBalance >= _amount);
      await coin.recall(user2, OnePlayXCoinInDennis.mul(BIG(2)), {from: admin});
      assert.fail()
    }
    catch(exception) {
      assert.equal(await balanceOf(user2), OnePlayXCoinInDennis.toString());
      assert.equal(await reserveOf(user2), OnePlayXCoinInDennis.mul(BIG(3)));
      assert.isTrue(exception.message.includes("revert"));
    }
  });

  it("after recall all coin", async () => {
    assert.equal(await bnBalanceOf(user3), 0);
    coin.transfer(user3, OnePlayXCoinInDennis, {from: vault});
    coin.setReserve(user3, OnePlayXCoinInDennis, {from: admin});
    assert.equal(await balanceOf(user3), OnePlayXCoinInDennis.toString());
    assert.equal(await reserveOf(user3), OnePlayXCoinInDennis.toString());

    const vaultBal = await bnBalanceOf(vault);

    coin.recall(user3, OnePlayXCoinInDennis, {from: admin});

    assert.equal(await balanceOf(user3), "0");
    assert.equal(await reserveOf(user3), "0");

    assert.equal(await balanceOf(vault), vaultBal.add(OnePlayXCoinInDennis).toString());
  });

  it("after recall half", async () => {
    assert.equal(await balanceOf(user4), "0");
    coin.transfer(user4, OnePlayXCoinInDennis, {from: vault});
    coin.setReserve(user4, OnePlayXCoinInDennis, {from: admin});
    assert.equal(await balanceOf(user4), OnePlayXCoinInDennis.toString());
    assert.equal(await reserveOf(user4), OnePlayXCoinInDennis.toString());

    const vaultBal = await bnBalanceOf(vault);
    const halfPlayXInDennis = OnePlayXCoinInDennis.div(BIG(2));

    coin.recall(user4, halfPlayXInDennis, {from: admin});

    assert.equal(await balanceOf(user4), halfPlayXInDennis.toString());
    assert.equal(await reserveOf(user4), halfPlayXInDennis.toString());

    assert.equal(await balanceOf(vault), vaultBal.add(halfPlayXInDennis).toString());
  });

  it("reserve and then approve", async() => {
    assert.equal(await balanceOf(user4), "0");

    const OnePlayXTimesTwoInDennis = OnePlayXCoinInDennis.mul(BIG(2))
    const OnePlayXTimesTwoInDennisStr = OnePlayXTimesTwoInDennis.toString()

    const OnePlayXTimesOneInDennis = OnePlayXCoinInDennis.mul(BIG(1))
    const OnePlayXTimesOneInDennisStr = OnePlayXTimesOneInDennis.toString()

    // send 2 PLX to user4 and set 1 PLX reserve
    coin.transfer(user4, OnePlayXTimesTwoInDennis, {from: vault});
    coin.setReserve(user4, OnePlayXCoinInDennis, {from: admin});
    assert.equal(await balanceOf(user4), OnePlayXTimesTwoInDennisStr);
    assert.equal(await reserveOf(user4), OnePlayXCoinInDennis.toString());

    // approve 2 PLX to user5
    await coin.approve(user5, OnePlayXTimesTwoInDennis, {from:user4});
    assert.equal(await allowanceOf(user4, user5), OnePlayXTimesTwoInDennisStr);

    // transfer 2 PLX from user4 to user5 SHOULD NOT BE POSSIBLE
    try {
      await coin.transferFrom(user4, user5, OnePlayXTimesTwoInDennis, {from: user5});
      assert.fail();
    } catch(exception) {
      assert.isTrue(exception.message.includes("revert"));
    }

    // transfer 1 PLX from user4 to user5 SHOULD BE POSSIBLE
    await coin.transferFrom(user4, user5, OnePlayXTimesOneInDennis, {from: user5});
    assert.equal(await balanceOf(user4), OnePlayXTimesOneInDennisStr);
    assert.equal(await reserveOf(user4), OnePlayXTimesOneInDennisStr); // reserve will not change
    assert.equal(await allowanceOf(user4, user5), OnePlayXTimesOneInDennisStr); // allowance will be reduced
    assert.equal(await balanceOf(user5), OnePlayXTimesOneInDennisStr);
    assert.equal(await reserveOf(user5), "0");

    // transfer .5 PLX from user4 to user5 SHOULD NOT BE POSSIBLE if balance <= reserve
    const halfPlayXInDennis = OnePlayXCoinInDennis.div(BIG(2));
    try {
      await coin.transferFrom(user4, user5, halfPlayXInDennis, {from: user5});
      assert.fail();
    } catch(exception) {
      assert.isTrue(exception.message.includes("revert"));
    }
  })

  it("only minter can call mint", async() => {
      const OnePlayXTimesTenInDennis = OnePlayXCoinInDennis.mul(BIG(10))
      const OnePlayXTimesTenInDennisStr = OnePlayXTimesTenInDennis.toString()

      assert.equal(await balanceOf(user4), "0");

      await coin.mint(user4, OnePlayXTimesTenInDennis, {from: minter})

      const totalSupplyAfterMintStr = (await coin.totalSupply()).toString()
      assert.equal(totalSupplyAfterMintStr, OnePlayXTimesTenInDennis.add(NoOfTokensInDennis).toString())
      assert.equal(await balanceOf(user4), OnePlayXTimesTenInDennisStr);

      try {
          await coin.mint(user4, OnePlayXTimesTenInDennis, {from: user4})
          assert.fail();
      } catch(exception) {
          assert.equal(totalSupplyAfterMintStr, OnePlayXTimesTenInDennis.add(NoOfTokensInDennis).toString())
          assert.isTrue(exception.message.includes("revert"));
      }
  })

  it("cannot mint above the mint cap", async() => {
      const OnePlayXTimes100BilInDennis = 
              OnePlayXCoinInDennis.mul(BIG(100000000000))

      assert.equal(await balanceOf(user4), "0");


      try {
          await coin.mint(user4, OnePlayXTimes100BilInDennis, {from: minter})
          assert.fail();
      } catch(exception) {
          assert.isTrue(exception.message.includes("revert"));
      }
  })
});
