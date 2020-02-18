#!/bin/zsh


truffle-flattener contracts/PlayXCoinBare.sol > PlayXCoinBare.flatten.sol
truffle-flattener contracts/PlayXCoin.sol > PlayXCoin.flatten.sol
truffle-flattener contracts/PlayXCoinMultiSigWallet.sol > PlayXCoinMultiSigWallet.flatten.sol
truffle-flattener contracts/PlayXBatchSender.sol > PlayXBatchSender.flatten.sol
