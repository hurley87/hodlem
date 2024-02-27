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

    constructor(address _tokenAddress, address ownerAddress) Ownable(address(ownerAddress)) {
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
        require(_betAmount == games[_gameId].creatorBet, "Bet amount must match the creator's bet");
        require(token.allowance(msg.sender, address(this)) >= _betAmount, "Insufficient allowance");
        require(token.transferFrom(msg.sender, address(this), _betAmount), "Transfer failed");
        games[_gameId].opponent = msg.sender;
        games[_gameId].opponentBet = _betAmount;
    }

    function makeBet(uint256 _gameId, address _player, uint256 _betAmount) external {
        require(games[_gameId].isActive, "Game is not active");
        require(_player == games[_gameId].creator || _player == games[_gameId].opponent, "Player is not part of this game");
        require(token.allowance(_player, address(this)) >= _betAmount, "Insufficient allowance");
        require(token.transferFrom(_player, address(this), _betAmount), "Transfer failed");

        if (_player == games[_gameId].creator) {
            games[_gameId].creatorBet += _betAmount;
        } else {
            games[_gameId].opponentBet += _betAmount;
        }
    }

    function cancelGame(uint256 _gameId) external {
        require(games[_gameId].isActive, "Game is not active");
        require(msg.sender == games[_gameId].creator, "Only the creator can cancel the game");
        require(games[_gameId].opponent == address(0), "Cannot cancel after an opponent has joined");

        require(token.transfer(games[_gameId].creator, games[_gameId].creatorBet), "Refund failed");
        games[_gameId].isActive = false;
    }

    function settleDraw(uint256 _gameId) external onlyOwner {
        require(games[_gameId].isActive, "Game is not active");
        require(games[_gameId].opponent != address(0), "A draw can only be settled if both players have joined");

        uint256 halfPot = (games[_gameId].creatorBet + games[_gameId].opponentBet) / 2;
        require(token.transfer(games[_gameId].creator, halfPot), "Refund to creator failed");
        require(token.transfer(games[_gameId].opponent, halfPot), "Refund to opponent failed");

        games[_gameId].isActive = false;
    }

    function endGame(uint256 _gameId, address _winner) external onlyOwner {
        require(games[_gameId].isActive, "Game is not active");
        require(_winner == games[_gameId].creator || _winner == games[_gameId].opponent, "Invalid winner");

        uint256 totalPot = games[_gameId].creatorBet + games[_gameId].opponentBet;
        require(token.transfer(_winner, totalPot), "Transfer failed");

        games[_gameId].isActive = false;
        games[_gameId].winner = _winner;
    }

    function withdrawTokens(uint256 _amount) external onlyOwner {
        require(token.balanceOf(address(this)) >= _amount, "Insufficient balance");
        require(token.transfer(msg.sender, _amount), "Transfer failed");
    }
}