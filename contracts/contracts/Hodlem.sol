//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Hodlem is Ownable {
    struct Hand {
        address bigBlind;
        address smallBlind;
        uint256 bigBlindBetTotal;
        uint256 smallBlindBetTotal;
        bool isActive;
        address winner;
    }

    IERC20 public DEGEN;
    mapping(uint256 => Hand) public hands;
    uint256 public handId;
    uint256 public RAKE = 100 * 10**18;

    event HandCreated(uint256 handId, address bigBlind, uint256 betAmount);
    event HandJoined(uint256 handId, address smallBlind, uint256 betAmount);
    event BetMade(uint256 handId, address player, uint256 betAmount);
    event HandCancelled(uint256 handId, address bigBlind);
    event DrawSettled(uint256 handId, uint256 halfPot);
    event HandEnded(uint256 handId, address winner, uint256 totalPot);
    event TokensWithdrawn(uint256 amount, address by);

    constructor(address _tokenAddress) {
        DEGEN = IERC20(_tokenAddress);
    }

    function createHand(uint256 _buyIn, address _smallBlind) external {
        uint256 pot = _buyIn - RAKE;
        require(_buyIn >= RAKE, "Bet amount must be greater than the rake");
        require(DEGEN.allowance(msg.sender, address(this)) >= _buyIn, "Insufficient allowance");
        require(DEGEN.transferFrom(msg.sender, owner(), RAKE), "Transfer failed");

        if (pot > 0) {
            require(DEGEN.transferFrom(msg.sender, address(this), pot), "Transfer failed");
        }

        Hand memory newHand = Hand({
            bigBlind: msg.sender,
            smallBlind: _smallBlind,
            bigBlindBetTotal: pot,
            smallBlindBetTotal: 0,
            isActive: true,
            winner: address(0)
        });

        hands[handId] = newHand;
        emit HandCreated(handId, msg.sender, pot);
        handId++;
    }

    function getHand(uint256 _handId) external view returns (Hand memory) {
        return hands[_handId];
    }

    function joinHand(uint256 _handId) external {
        uint256 _betAmount = hands[_handId].bigBlindBetTotal;
        require(hands[_handId].isActive, "Hand is not active");
        require(hands[_handId].smallBlind == msg.sender, "Only the smallBlind can join the hand");

        if(_betAmount > 0) {
            require(DEGEN.allowance(msg.sender, address(this)) >= _betAmount, "Insufficient allowance");
            require(DEGEN.transferFrom(msg.sender, address(this), _betAmount), "Transfer failed");
            hands[_handId].smallBlindBetTotal = _betAmount;
        }
        
        emit HandJoined(_handId, msg.sender, _betAmount);
    }

    function makeBet(uint256 _handId, uint256 _betAmount) external {
        require(_betAmount > 0, "Bet amount must be greater than 0");
        require(hands[_handId].isActive, "Hand is not active");
        require(msg.sender == hands[_handId].bigBlind || msg.sender == hands[_handId].smallBlind, "Player is not part of this hand");
        require(DEGEN.allowance(msg.sender, address(this)) >= _betAmount, "Insufficient allowance");
        require(DEGEN.transferFrom(msg.sender, address(this), _betAmount), "Transfer failed");

        if (msg.sender == hands[_handId].bigBlind) {
            hands[_handId].bigBlindBetTotal += _betAmount;
        } else {
            hands[_handId].smallBlindBetTotal += _betAmount;
        }

        emit BetMade(_handId, msg.sender, _betAmount);
    }

    function cancelHand(uint256 _handId) external {
        require(hands[_handId].isActive, "Hand is not active");
        require(msg.sender == hands[_handId].bigBlind, "Only the big blind can cancel the hand");
        require(hands[_handId].smallBlindBetTotal == 0, "Cannot cancel after an smallBlind has joined");
        require(DEGEN.transfer(hands[_handId].bigBlind, hands[_handId].bigBlindBetTotal), "Refund failed");
        hands[_handId].isActive = false;
        emit HandCancelled(_handId, msg.sender);
    }

    function settleDraw(uint256 _handId) external onlyOwner {
        require(hands[_handId].isActive, "Hand is not active");
        require(hands[_handId].smallBlind != address(0), "A draw can only be settled if both players have joined");

        uint256 halfPot = (hands[_handId].bigBlindBetTotal + hands[_handId].smallBlindBetTotal) / 2;
        require(DEGEN.transfer(hands[_handId].bigBlind, halfPot), "Refund to bigBlind failed");
        require(DEGEN.transfer(hands[_handId].smallBlind, halfPot), "Refund to smallBlind failed");

        hands[_handId].isActive = false;
        hands[_handId].bigBlindBetTotal = 0;
        hands[_handId].smallBlindBetTotal = 0;

        emit DrawSettled(_handId, halfPot);
    }

    function endHand(uint256 _handId, address _winner) external onlyOwner {
        require(hands[_handId].isActive, "Hand is not active");
        require(_winner == hands[_handId].bigBlind || _winner == hands[_handId].smallBlind, "Invalid winner");

        uint256 totalPot = hands[_handId].bigBlindBetTotal + hands[_handId].smallBlindBetTotal;
        require(DEGEN.transfer(_winner, totalPot), "Transfer failed");

        hands[_handId].isActive = false;
        hands[_handId].winner = _winner;
        hands[_handId].bigBlindBetTotal = 0;
        hands[_handId].smallBlindBetTotal = 0;
        
        emit HandEnded(_handId, _winner, totalPot);
    }

    function updateMaxRake(uint256 _newRake) external onlyOwner {
        RAKE = _newRake;
    }
}