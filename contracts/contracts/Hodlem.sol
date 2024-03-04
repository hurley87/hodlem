// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Hodlem is Ownable {
    struct Hand {
        address creator;
        address opponent;
        uint256 creatorBetTotal;
        uint256 opponentBetTotal;
        uint256 creatorAllowance;
        uint256 opponentAllowance;
        bool isActive;
        address winner;
    }

    IERC20 public token;
    mapping(uint256 => Hand) public hands;
    uint256 public handId;

    event HandCreated(uint256 handId, address creator, uint256 betAmount);
    event HandJoined(uint256 handId, address opponent, uint256 betAmount);
    event BetMade(uint256 handId, address player, uint256 betAmount);
    event HandCancelled(uint256 handId, address creator);
    event DrawSettled(uint256 handId, uint256 halfPot);
    event HandEnded(uint256 handId, address winner, uint256 totalPot);
    event TokensWithdrawn(uint256 amount, address by);

    constructor(address _tokenAddress, address ownerAddress) Ownable(address(ownerAddress)) {
        token = IERC20(_tokenAddress);
    }

    function createHand(uint256 _buyIn, address _opponent) external {
        require(token.allowance(msg.sender, address(this)) >= _buyIn, "Insufficient allowance");
        require(token.transferFrom(msg.sender, address(this), _buyIn), "Transfer failed");
        hands[handId] = Hand(msg.sender, _opponent, _buyIn, 0, token.allowance(msg.sender, address(this)), 0, true, address(0));
        emit HandCreated(handId, msg.sender, _buyIn);
        handId++;
    }

    function getHand(uint256 _handId) external view returns (Hand memory) {
        return hands[_handId];
    }

    function joinHand(uint256 _handId) external {
        uint256 _betAmount;
        _betAmount = hands[_handId].creatorBetTotal;
        require(hands[_handId].isActive, "Hand is not active");
        require(hands[_handId].opponent == msg.sender, "Only the opponent can join the hand");
        require(token.allowance(msg.sender, address(this)) >= _betAmount, "Insufficient allowance");
        require(token.transferFrom(msg.sender, address(this), _betAmount), "Transfer failed");
        
        hands[_handId].opponentBetTotal = _betAmount;
        hands[_handId].opponentAllowance = token.allowance(msg.sender, address(this));

        emit HandJoined(_handId, msg.sender, _betAmount);
    }

    function makeBet(uint256 _handId, address _player, uint256 _betAmount) external {
        require(hands[_handId].isActive, "Hand is not active");
        require(_player == hands[_handId].creator || _player == hands[_handId].opponent, "Player is not part of this hand");
        require(token.allowance(_player, address(this)) >= _betAmount, "Insufficient allowance");
        require(token.transferFrom(_player, address(this), _betAmount), "Transfer failed");

        if (_player == hands[_handId].creator) {
            hands[_handId].creatorBetTotal += _betAmount;
        } else {
            hands[_handId].opponentBetTotal += _betAmount;
        }

        emit BetMade(_handId, _player, _betAmount);
    }

    function cancelHand(uint256 _handId) external {
        require(hands[_handId].isActive, "Hand is not active");
        require(msg.sender == hands[_handId].creator, "Only the creator can cancel the hand");
        require(hands[_handId].opponent == address(0), "Cannot cancel after an opponent has joined");

        require(token.transfer(hands[_handId].creator, hands[_handId].creatorBetTotal), "Refund failed");
        hands[_handId].isActive = false;
        emit HandCancelled(_handId, msg.sender);
    }

    function settleDraw(uint256 _handId) external onlyOwner {
        require(hands[_handId].isActive, "Hand is not active");
        require(hands[_handId].opponent != address(0), "A draw can only be settled if both players have joined");

        uint256 halfPot = (hands[_handId].creatorBetTotal + hands[_handId].opponentBetTotal) / 2;
        require(token.transfer(hands[_handId].creator, halfPot), "Refund to creator failed");
        require(token.transfer(hands[_handId].opponent, halfPot), "Refund to opponent failed");

        hands[_handId].isActive = false;
        emit DrawSettled(_handId, halfPot);
    }

    function endHand(uint256 _handId, address _winner) external onlyOwner {
        require(hands[_handId].isActive, "Hand is not active");
        require(_winner == hands[_handId].creator || _winner == hands[_handId].opponent, "Invalid winner");

        uint256 totalPot = hands[_handId].creatorBetTotal + hands[_handId].opponentBetTotal;
        require(token.transfer(_winner, totalPot), "Transfer failed");

        hands[_handId].isActive = false;
        hands[_handId].winner = _winner;
        emit HandEnded(_handId, _winner, totalPot);
    }

    function withdrawTokens(uint256 _amount) external onlyOwner {
        require(token.balanceOf(address(this)) >= _amount, "Insufficient balance");
        require(token.transfer(msg.sender, _amount), "Transfer failed");
        emit TokensWithdrawn(_amount, msg.sender);
    }
}