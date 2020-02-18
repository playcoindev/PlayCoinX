pragma solidity >=0.5.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./PlayXCoin.sol";

contract PlayXCoinBatchSender {
    using SafeMath for uint256;

    // this is the already deployed coin from the token sale
    PlayXCoin coin;

    address internal owner;

    event PlayXCoinBatchSent(uint256 addressCount, uint256 total);

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor(address _plxCoin) public {
        require(_plxCoin != address(0));

        coin = PlayXCoin(_plxCoin);
        owner = msg.sender;
    }

    function sendBatch(address[] memory _address, uint256[] memory  _values) public onlyOwner {
        uint256 total = 0;
        require(_address.length == _values.length);

        for (uint i = 0; i < _address.length; ++i) {
            total+=_values[i];
            coin.transfer(_address[i],_values[i]);
        }

        emit PlayXCoinBatchSent(_address.length, total);
    }
}
