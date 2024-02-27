// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Hodlem is Ownable {
    struct Game {
        address creator;
        address opponent;
        uint256 creatorBet;
        uint256 opponentBet;
        bool isActive;
        address winner;
    }

    IERC20 public token;
    mapping(uint256 => Game) public games;
    uint256 public gameId;

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
    }

    function createGame(uint256 _betAmount) external {
        require(token.allowance(msg.sender, address(this)) >= _betAmount, "Insufficient allowance");
        require(token.transferFrom(msg.sender, address(this), _betAmount), "Transfer failed");
        games[gameId] = Game(msg.sender, address(0), _betAmount, 0, true, address(0));
        gameId++;
    }

    function joinGame(uint256 _gameId, uint256 _betAmount) external {
        require(games[_gameId].isActive, "Game is not active");
        require(games[_gameId].opponent == address(0), "Game already has an opponent");
        require(token.allowance(msg.sender, address(this)) >= _betAmount, "Insufficient allowance");
        require(token.transferFrom(msg.sender, address(this), _betAmount), "Transfer failed");
        games[_gameId].opponent = msg.sender;
        games[_gameId].opponentBet = _betAmount;
    }

    function endGame(uint256 _gameId, address _winner) external onlyOwner {
        require(games[_gameId].isActive, "Game is not active");
        require(_winner == games[_gameId].creator || _winner == games[_gameId].opponent, "Invalid winner");

        uint256 totalPot = games[_gameId].creatorBet + games[_gameId].opponentBet;
        require(token.transfer(_winner, totalPot), "Transfer failed");

        games[_gameId].isActive = false;
        games[_gameId].winner = _winner;
    }
}