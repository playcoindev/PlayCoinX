var PlayXCoin = artifacts.require("./contracts/PlayXCoin.sol");
var PlayXCoinMultiSigWallet = artifacts.require("./contracts/PlayXCoinMultiSigWallet.sol");
var PlayXCoinMultiSigWalletWithMint = artifacts.require("./contracts/PlayXCoinMultiSigWalletWithMint.sol");
var PlayXCoinBatchSender = artifacts.require("./contracts/PlayXCoinBatchSender.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(PlayXCoin, 'PLX', 'PLXCoin', accounts[0], accounts[1], accounts[2]).then( () => {
    console.log(`PlayXCoin deployed: address = ${PlayXCoin.address}`);

    deployer.
      deploy(PlayXCoinMultiSigWallet, [accounts[0], accounts[1], accounts[2]], 2, PlayXCoin.address,
          "vault multisig wallet");

      deployer.
      deploy(PlayXCoinMultiSigWalletWithMint, [accounts[0], accounts[1], accounts[2]], 2, PlayXCoin.address,
          "vault multisig wallet with mint");

    deployer.
      deploy(PlayXCoinBatchSender, PlayXCoin.address).then( () => {
        console.log(`PlayXCoinBatchSender deployed: address = ${PlayXCoinBatchSender.address}`);
    });
  });
};
