pragma solidity >=0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

/**
 * @title PlayXCoin contract 
 */
contract PlayXCoinBare is ERC20Mintable, ERC20Detailed {
    constructor (string memory _symbol, string memory _name) ERC20Detailed(_name, _symbol, 9)
    public {
        // mint coins to the vault
        //_mint(msg.sender, 10000000000000000000);
        _addMinter(msg.sender);
    }
}
