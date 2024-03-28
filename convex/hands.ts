import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
  args: { gameId: v.optional(v.string()) },
  handler: async (ctx, { gameId }) => {
    return await ctx.db
      .query('hands')
      .filter((q: any) => q.eq(q.field('gameId'), gameId))
      .collect();
  },
});

export const getHand = query({
  args: { handId: v.id('hands') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.handId);
  },
});

export const getHandByOnchainId = query({
  args: { onchainId: v.string() },
  handler: async (ctx, { onchainId }) => {
    return await ctx.db
      .query('hands')
      .filter((q: any) => q.eq(q.field('onchainId'), onchainId))
      .collect();
  },
});

export const create = mutation({
  args: {
    gameId: v.string(),
    onchainId: v.string(),
    bigBlindBetTotal: v.number(),
  },
  handler: async (ctx, { gameId, onchainId, bigBlindBetTotal }) => {
    const existingHand = await ctx.db
      .query('hands')
      .filter((q: any) => q.eq(q.field('onchainId'), onchainId))
      .collect();

    if (existingHand?.length) return;

    return await ctx.db.insert('hands', {
      gameId,
      onchainId,
      bigBlindBetTotal,
      smallBlindBetTotal: 0,
      isActive: true,
      stage: 'created',
    });
  },
});

export const cancel = mutation({
  args: {
    id: v.id('hands'),
  },
  handler: async (ctx, args) => {
    const { id } = args;
    await ctx.db.patch(id, { isActive: false });
  },
});

export const join = mutation({
  args: {
    id: v.id('hands'),
    smallBlindBetTotal: v.number(),
  },
  handler: async (ctx, args) => {
    const { id, smallBlindBetTotal } = args;
    await ctx.db.patch(id, { smallBlindBetTotal });
  },
});

export const deal = mutation({
  args: {
    id: v.id('hands'),
    gameId: v.id('games'),
  },
  handler: async (ctx, args) => {
    const { id, gameId } = args;
    const game = await ctx.db.get(gameId);
    const bigBlind = game?.bigBlind;
    const smallBlind = game?.smallBlind;
    const suits = ['H', 'D', 'C', 'S'];
    const ranks = [
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      'J',
      'Q',
      'K',
      'A',
    ];
    const deck = suits.flatMap((suit) => ranks.map((rank) => `${rank}${suit}`));

    deck.sort(() => Math.random() - 0.5);

    const bigBlindCards = deck.splice(0, 2);
    const smallBlindCards = deck.splice(0, 2);

    await ctx.db.patch(id, {
      bigBlindCards,
      smallBlindCards,
      deck,
      bigBlind,
      smallBlind,
      activePlayer: smallBlind,
      stage: 'preFlop',
      canBet: true,
      canCheck: true,
      canFold: false,
      canCall: false,
      canRaise: false,
    });
  },
});

export const bet = mutation({
  args: {
    id: v.id('hands'),
    betAmount: v.number(),
    player: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, betAmount, player } = args;
    const hand = await ctx.db.get(id);
    const activePlayer =
      player === hand.bigBlind ? hand.smallBlind : hand.bigBlind;

    if (!hand) return;

    if (player === hand.bigBlind) {
      await ctx.db.patch(id, {
        bigBlindBetTotal: hand.bigBlindBetTotal + betAmount,
        bigBlindStack: hand.bigBlindStack - betAmount,
      });
    }

    if (player === hand.smallBlind) {
      await ctx.db.patch(id, {
        smallBlindBetTotal: hand.smallBlindBetTotal + betAmount,
        smallBlindStack: hand.smallBlindStack - betAmount,
      });
    }

    await ctx.db.patch(id, {
      activePlayer,
      betAmount,
      canBet: false,
      canCheck: false,
      canFold: true,
      canCall: true,
      canRaise: true,
    });
  },
});

export const fold = mutation({
  args: {
    id: v.id('hands'),
    hash: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, hash } = args;

    await ctx.db.patch(id, {
      result: 'fold',
      hash,
      stage: 'over',
      resultMessage: 'Player folded',
      canReveal: false,
      canBet: false,
      canCheck: false,
      canFold: false,
      canCall: false,
      canRaise: false,
    });
  },
});

export const call = mutation({
  args: {
    id: v.id('hands'),
    betAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const { id } = args;
    const hand = await ctx.db.get(id);
    const stage = hand.stage;
    const deck = hand.deck;

    if (!hand) return;

    await ctx.db.patch(id, {
      canBet: true,
      canCheck: true,
      canFold: false,
      canCall: false,
      canRaise: false,
    });

    switch (stage) {
      case 'preFlop':
        const flopCards = deck.splice(0, 3);

        await ctx.db.patch(id, {
          activePlayer: hand.bigBlind,
          stage: 'flop',
          deck,
          flopCards,
        });
        break;
      case 'flop':
        const turnCard = deck.splice(0, 1)[0];

        await ctx.db.patch(id, {
          activePlayer: hand.bigBlind,
          stage: 'turn',
          deck,
          turnCard,
        });
        break;
      case 'turn':
        const riverCard = deck.splice(0, 1)[0];

        await ctx.db.patch(id, {
          activePlayer: hand.bigBlind,
          stage: 'river',
          deck,
          riverCard,
        });
        break;
      case 'river':
        await ctx.db.patch(id, {
          canReveal: true,
          canBet: false,
          canCheck: false,
          canFold: false,
          canCall: false,
          canRaise: false,
        });
        break;
    }
  },
});

export const check = mutation({
  args: {
    id: v.id('hands'),
  },
  handler: async (ctx, args) => {
    const { id } = args;
    const hand = await ctx.db.get(id);
    const stage = hand.stage;

    if (!hand) return;

    await ctx.db.patch(id, {
      canBet: true,
      canCheck: true,
      canFold: false,
      canCall: false,
      canRaise: false,
    });

    switch (stage) {
      case 'preFlop':
        if (hand.activePlayer === hand.smallBlind) {
          await ctx.db.patch(id, { activePlayer: hand.bigBlind });
        } else if (hand.activePlayer === hand.bigBlind) {
          const deck = hand.deck;
          const flopCards = deck.splice(0, 3);

          await ctx.db.patch(id, {
            activePlayer: hand.bigBlind,
            stage: 'flop',
            deck,
            flopCards,
          });
        }
        break;
      case 'flop':
        if (hand.activePlayer === hand.bigBlind) {
          await ctx.db.patch(id, {
            activePlayer: hand.smallBlind,
          });
        } else if (hand.activePlayer === hand.smallBlind) {
          const deck = hand.deck;
          const turnCard = deck.splice(0, 1)[0];

          await ctx.db.patch(id, {
            activePlayer: hand.bigBlind,
            stage: 'turn',
            deck,
            turnCard,
          });
        }
        break;
      case 'turn':
        if (hand.activePlayer === hand.bigBlind) {
          await ctx.db.patch(id, {
            activePlayer: hand.smallBlind,
            stage: 'turn',
          });
        } else if (hand.activePlayer === hand.smallBlind) {
          const deck = hand.deck;
          const riverCard = deck.splice(0, 1)[0];

          await ctx.db.patch(id, {
            activePlayer: hand.bigBlind,
            stage: 'river',
            deck,
            riverCard,
          });
        }
        break;
      case 'river':
        if (hand.activePlayer === hand.bigBlind) {
          await ctx.db.patch(id, {
            activePlayer: hand.smallBlind,
            stage: 'river',
          });
        } else if (hand.activePlayer === hand.smallBlind) {
          await ctx.db.patch(id, {
            canReveal: true,
            canBet: false,
            canCheck: false,
            canFold: false,
            canCall: false,
            canRaise: false,
          });
        }
        break;
    }
  },
});

export const claim = mutation({
  args: {
    id: v.id('hands'),
    winner: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, winner } = args;
    await ctx.db.patch(id, {
      winner,
      isActive: false,
    });
  },
});

export const determineWinner = mutation({
  args: {
    id: v.id('hands'),
  },
  handler: async (ctx, args) => {
    const { id } = args;
    const hand = await ctx.db.get(id);

    const flopCards = hand?.flopCards;
    const turnCard = hand?.turnCard;
    const riverCard = hand?.riverCard;

    if (!flopCards || !turnCard || !riverCard) {
      alert('You can only reveal hand after dealing');
      return;
    }

    const smallBlindCards = hand?.smallBlindCards
      .concat(flopCards)
      .concat(turnCard)
      .concat(riverCard);

    const bigBlindCards = hand?.bigBlindCards
      .concat(flopCards)
      .concat(turnCard)
      .concat(riverCard);

    // both players have royal flush
    if (checkRoyalFlush(smallBlindCards) && checkRoyalFlush(bigBlindCards)) {
      await ctx.db.patch(id, {
        stage: 'over',
        result: 'tie',
        resultMessage: 'Both players have royal flush',
      });
      return;
    }

    // check for royal flush
    if (checkRoyalFlush(smallBlindCards)) {
      await ctx.db.patch(id, {
        stage: 'over',
        result: 'win',
        resultMessage: 'Small blind wins with royal flush',
        winner: hand.smallBlind,
        activePlayer: hand.smallBlind,
      });
      return;
    }

    if (checkRoyalFlush(bigBlindCards)) {
      await ctx.db.patch(id, {
        stage: 'over',
        result: 'win',
        resultMessage: 'Big blind wins with royal flush',
        winner: hand.bigBlind,
        activePlayer: hand.bigBlind,
      });
      return;
    }

    // check for straight flush
    if (
      checkStraightFlush(smallBlindCards) &&
      checkStraightFlush(bigBlindCards)
    ) {
      const smallBlindMaxCard = Math.max(...smallBlindCards.map(cardValue));
      const bigBlindMaxCard = Math.max(...bigBlindCards.map(cardValue));

      if (smallBlindMaxCard > bigBlindMaxCard) {
        await ctx.db.patch(id, {
          stage: 'over',
          result: 'win',
          resultMessage: 'Small blind wins with straight flush',
          winner: hand.smallBlind,
          activePlayer: hand.smallBlind,
        });
      } else if (bigBlindMaxCard > smallBlindMaxCard) {
        await ctx.db.patch(id, {
          stage: 'over',
          result: 'win',
          resultMessage: 'Big blind wins with straight flush',
          winner: hand.bigBlind,
          activePlayer: hand.bigBlind,
        });
      } else {
        await ctx.db.patch(id, {
          stage: 'over',
          result: 'tie',
          resultMessage: "It's a tie with a straight flush",
        });
      }
      return;
    }

    // check for straight flush
    if (checkStraightFlush(smallBlindCards)) {
      await ctx.db.patch(id, {
        stage: 'over',
        result: 'win',
        resultMessage: 'Small blind wins with straight flush',
        winner: hand.smallBlind,
        activePlayer: hand.smallBlind,
      });
      return;
    }

    if (checkStraightFlush(bigBlindCards)) {
      await ctx.db.patch(id, {
        stage: 'over',
        result: 'win',
        resultMessage: 'Big blind wins with straight flush',
        winner: hand.bigBlind,
        activePlayer: hand.bigBlind,
      });
      return;
    }

    // check for four of a kind
    if (checkFourOfAKind(smallBlindCards) && checkFourOfAKind(bigBlindCards)) {
      await ctx.db.patch(id, {
        stage: 'over',
        result: 'tie',
        resultMessage: 'Both players have four of a kind',
      });
      return;
    }

    if (checkFourOfAKind(smallBlindCards)) {
      await ctx.db.patch(id, {
        stage: 'over',
        result: 'win',
        resultMessage: 'Small blind wins with four of a kind',
        winner: hand.smallBlind,
        activePlayer: hand.smallBlind,
      });
      return;
    }

    if (checkFourOfAKind(bigBlindCards)) {
      await ctx.db.patch(id, {
        stage: 'over',
        result: 'win',
        resultMessage: 'Big blind wins with four of a kind',
        winner: hand.bigBlind,
        activePlayer: hand.bigBlind,
      });
      return;
    }

    // check for full house
    if (checkFullHouse(smallBlindCards) && checkFullHouse(bigBlindCards)) {
      const smallBlindThreeOfAKind = getThreeOfAKindValue(smallBlindCards);
      const bigBlindThreeOfAKind = getThreeOfAKindValue(bigBlindCards);

      if (smallBlindThreeOfAKind > bigBlindThreeOfAKind) {
        await ctx.db.patch(id, {
          stage: 'over',
          result: 'win',
          resultMessage: 'Small blind wins with full house',
          winner: hand.smallBlind,
          activePlayer: hand.smallBlind,
        });
      } else if (bigBlindThreeOfAKind > smallBlindThreeOfAKind) {
        await ctx.db.patch(id, {
          stage: 'over',
          result: 'win',
          resultMessage: 'Big blind wins with full house',
          winner: hand.bigBlind,
          activePlayer: hand.bigBlind,
        });
      } else {
        const smallBlindPair = getPairValue(smallBlindCards);
        const bigBlindPair = getPairValue(bigBlindCards);

        if (smallBlindPair > bigBlindPair) {
          await ctx.db.patch(id, {
            stage: 'over',
            result: 'win',
            resultMessage: 'Small blind wins with full house',
            winner: hand.smallBlind,
            activePlayer: hand.smallBlind,
          });
        } else if (bigBlindPair > smallBlindPair) {
          await ctx.db.patch(id, {
            stage: 'over',
            result: 'win',
            resultMessage: 'Big blind wins with full house',
            winner: hand.bigBlind,
            activePlayer: hand.bigBlind,
          });
        } else {
          await ctx.db.patch(id, {
            stage: 'over',
            result: 'tie',
            resultMessage: "It's a tie with a full house",
          });
        }
      }
      return;
    }

    if (checkFullHouse(smallBlindCards)) {
      await ctx.db.patch(id, {
        stage: 'over',
        result: 'win',
        resultMessage: 'Small blind wins with full house',
        winner: hand.smallBlind,
        activePlayer: hand.smallBlind,
      });

      return;
    }

    if (checkFullHouse(bigBlindCards)) {
      await ctx.db.patch(id, {
        stage: 'over',
        result: 'win',
        resultMessage: 'Big blind wins with full house',
        winner: hand.bigBlind,
        activePlayer: hand.bigBlind,
      });
      return;
    }

    // check for flush
    if (checkFlush(smallBlindCards) && checkFlush(bigBlindCards)) {
      const smallBlindMaxCard = Math.max(...smallBlindCards.map(cardValue));
      const bigBlindMaxCard = Math.max(...bigBlindCards.map(cardValue));

      if (smallBlindMaxCard > bigBlindMaxCard) {
        await ctx.db.patch(id, {
          stage: 'over',
          result: 'win',
          resultMessage: 'Small blind wins with flush',
          winner: hand.smallBlind,
          activePlayer: hand.smallBlind,
        });
      } else if (bigBlindMaxCard > smallBlindMaxCard) {
        await ctx.db.patch(id, {
          stage: 'over',
          result: 'win',
          resultMessage: 'Big blind wins with flush',
          winner: hand.bigBlind,
          activePlayer: hand.bigBlind,
        });
      } else {
        await ctx.db.patch(id, {
          stage: 'over',
          result: 'tie',
          resultMessage: "It's a tie with a flush",
        });
      }
      return;
    }

    if (checkFlush(smallBlindCards)) {
      await ctx.db.patch(id, {
        stage: 'over',
        result: 'win',
        resultMessage: 'Small blind wins with flush',
        winner: hand.smallBlind,
        activePlayer: hand.smallBlind,
      });
      return;
    }

    if (checkFlush(bigBlindCards)) {
      await ctx.db.patch(id, {
        stage: 'over',
        result: 'win',
        resultMessage: 'Big blind wins with flush',
        winner: hand.bigBlind,
        activePlayer: hand.bigBlind,
      });
      return;
    }

    // check for straight
    if (checkStraight(smallBlindCards) && checkStraight(bigBlindCards)) {
      const smallBlindMaxCard = Math.max(...smallBlindCards.map(cardValue));
      const bigBlindMaxCard = Math.max(...bigBlindCards.map(cardValue));

      if (smallBlindMaxCard > bigBlindMaxCard) {
        await ctx.db.patch(id, {
          stage: 'over',
          result: 'win',
          resultMessage: 'Small blind wins with straight',
          winner: hand.smallBlind,
          activePlayer: hand.smallBlind,
        });
      } else if (bigBlindMaxCard > smallBlindMaxCard) {
        await ctx.db.patch(id, {
          stage: 'over',
          result: 'win',
          resultMessage: 'Big blind wins with straight',
          winner: hand.bigBlind,
          activePlayer: hand.bigBlind,
        });
      } else {
        await ctx.db.patch(id, {
          stage: 'over',
          result: 'tie',
          resultMessage: "It's a tie with a straight",
        });
      }
      return;
    }

    if (checkStraight(smallBlindCards)) {
      await ctx.db.patch(id, {
        stage: 'over',
        result: 'win',
        resultMessage: 'Small blind wins with straight',
        winner: hand.smallBlind,
        activePlayer: hand.smallBlind,
      });
      return;
    }

    if (checkStraight(bigBlindCards)) {
      await ctx.db.patch(id, {
        stage: 'over',
        result: 'win',
        resultMessage: 'Big blind wins with straight',
        winner: hand.bigBlind,
        activePlayer: hand.bigBlind,
      });
      return;
    }

    // check for three of a kind
    if (
      checkThreeOfAKind(smallBlindCards) &&
      checkThreeOfAKind(bigBlindCards)
    ) {
      const smallBlindThreeOfAKind = getThreeOfAKindValue(smallBlindCards);
      const bigBlindThreeOfAKind = getThreeOfAKindValue(bigBlindCards);

      if (smallBlindThreeOfAKind > bigBlindThreeOfAKind) {
        await ctx.db.patch(id, {
          stage: 'over',
          result: 'win',
          resultMessage: 'Small blind wins with three of a kind',
          winner: hand.smallBlind,
          activePlayer: hand.smallBlind,
        });
      } else if (bigBlindThreeOfAKind > smallBlindThreeOfAKind) {
        await ctx.db.patch(id, {
          stage: 'over',
          result: 'win',
          resultMessage: 'Big blind wins with three of a kind',
          winner: hand.bigBlind,
          activePlayer: hand.bigBlind,
        });
      } else {
        await ctx.db.patch(id, {
          stage: 'over',
          result: 'tie',
          resultMessage: "It's a tie with a three of a kind",
        });
      }
      return;
    }

    if (checkThreeOfAKind(smallBlindCards)) {
      await ctx.db.patch(id, {
        stage: 'over',
        result: 'win',
        resultMessage: 'Small blind wins with three of a kind',
        winner: hand.smallBlind,
        activePlayer: hand.smallBlind,
      });
      return;
    }

    if (checkThreeOfAKind(bigBlindCards)) {
      await ctx.db.patch(id, {
        stage: 'over',
        result: 'win',
        resultMessage: 'Big blind wins with three of a kind',
        winner: hand.bigBlind,
        activePlayer: hand.bigBlind,
      });
      return;
    }

    // check for two pair
    if (checkTwoPair(smallBlindCards) && checkTwoPair(bigBlindCards)) {
      const smallBlindPair = getPairValue(smallBlindCards);
      const bigBlindPair = getPairValue(bigBlindCards);
      const smallBlindHighCard = checkHighCard(smallBlindCards);
      const bigBlindHighCard = checkHighCard(bigBlindCards);

      if (smallBlindPair > bigBlindPair) {
        await ctx.db.patch(id, {
          stage: 'over',
          result: 'win',
          resultMessage: 'Small blind wins with two pair',
          winner: hand.smallBlind,
          activePlayer: hand.smallBlind,
        });
      } else if (bigBlindPair > smallBlindPair) {
        await ctx.db.patch(id, {
          stage: 'over',
          result: 'win',
          resultMessage: 'Big blind wins with two pair',
          winner: hand.bigBlind,
          activePlayer: hand.bigBlind,
        });
      } else {
        if (smallBlindHighCard > bigBlindHighCard) {
          await ctx.db.patch(id, {
            stage: 'over',
            result: 'win',
            resultMessage: 'Small blind wins with higher card and two pair',
            winner: hand.smallBlind,
            activePlayer: hand.smallBlind,
          });
        } else if (bigBlindHighCard > smallBlindHighCard) {
          await ctx.db.patch(id, {
            stage: 'over',
            result: 'win',
            resultMessage: 'Big blind wins with higher card and two pair',
            winner: hand.bigBlind,
            activePlayer: hand.bigBlind,
          });
        } else {
          await ctx.db.patch(id, {
            stage: 'over',
            result: 'tie',
            resultMessage: "It's a tie with a two pair",
          });
        }
      }
      return;
    }

    if (checkTwoPair(smallBlindCards)) {
      await ctx.db.patch(id, {
        stage: 'over',
        result: 'win',
        resultMessage: 'Small blind wins with two pair',
        winner: hand.smallBlind,
        activePlayer: hand.smallBlind,
      });
      return;
    }

    if (checkTwoPair(bigBlindCards)) {
      await ctx.db.patch(id, {
        stage: 'over',
        result: 'win',
        resultMessage: 'Big blind wins with two pair',
        winner: hand.bigBlind,
        activePlayer: hand.bigBlind,
      });
      return;
    }

    // check for one pair
    if (checkOnePair(smallBlindCards) && checkOnePair(bigBlindCards)) {
      const smallBlindPair = getPairValue(smallBlindCards);
      const bigBlindPair = getPairValue(bigBlindCards);
      const smallBlindHighCard = checkHighCard(smallBlindCards);
      const bigBlindHighCard = checkHighCard(bigBlindCards);

      if (smallBlindPair > bigBlindPair) {
        await ctx.db.patch(id, {
          stage: 'over',
          result: 'win',
          resultMessage: 'Small blind wins with one pair',
          winner: hand.smallBlind,
          activePlayer: hand.smallBlind,
        });
      } else if (bigBlindPair > smallBlindPair) {
        await ctx.db.patch(id, {
          stage: 'over',
          result: 'win',
          resultMessage: 'Big blind wins with one pair',
          winner: hand.bigBlind,
          activePlayer: hand.bigBlind,
        });
      } else {
        if (smallBlindHighCard > bigBlindHighCard) {
          await ctx.db.patch(id, {
            stage: 'over',
            result: 'win',
            resultMessage: 'Small blind wins with higher card and one pair',
            winner: hand.smallBlind,
            activePlayer: hand.smallBlind,
          });
        } else if (bigBlindHighCard > smallBlindHighCard) {
          await ctx.db.patch(id, {
            stage: 'over',
            result: 'win',
            resultMessage: 'Big blind wins with higher card and one pair',
            winner: hand.bigBlind,
            activePlayer: hand.bigBlind,
          });
        } else {
          await ctx.db.patch(id, {
            stage: 'over',
            result: 'tie',
            resultMessage: "It's a tie with one pair and equal high card",
          });
        }
      }
      return;
    }

    if (checkOnePair(smallBlindCards)) {
      await ctx.db.patch(id, {
        stage: 'over',
        result: 'win',
        resultMessage: 'Small blind wins with one pair',
        winner: hand.smallBlind,
        activePlayer: hand.smallBlind,
      });
      return;
    }

    if (checkOnePair(bigBlindCards)) {
      await ctx.db.patch(id, {
        stage: 'over',
        result: 'win',
        resultMessage: 'Big blind wins with one pair',
        winner: hand.bigBlind,
        activePlayer: hand.bigBlind,
      });
      return;
    }

    // check for high card
    const smallBlindHighCard = checkHighCard(smallBlindCards);
    const bigBlindHighCard = checkHighCard(bigBlindCards);

    if (smallBlindHighCard > bigBlindHighCard) {
      await ctx.db.patch(id, {
        stage: 'over',
        result: 'win',
        resultMessage: 'Small blind wins with high card',
        winner: hand.smallBlind,
        activePlayer: hand.smallBlind,
      });
    } else if (bigBlindHighCard > smallBlindHighCard) {
      await ctx.db.patch(id, {
        stage: 'over',
        result: 'win',
        resultMessage: 'Big blind wins with high card',
        winner: hand.bigBlind,
        activePlayer: hand.bigBlind,
      });
    } else {
      await ctx.db.patch(id, {
        stage: 'over',
        result: 'tie',
        resultMessage: "It's a tie with a high card",
      });
    }
  },
});

const cardValue = (card: string) => {
  if (card.includes('A')) {
    return 14;
  }
  if (card.includes('K')) {
    return 13;
  }
  if (card.includes('Q')) {
    return 12;
  }
  if (card.includes('J')) {
    return 11;
  }
  if (card.includes('T')) {
    return 10;
  }
  return parseInt(card);
};

const checkFlush = (cards: string[]) => {
  const spades = cards.filter((card) => card.includes('S'));
  const hearts = cards.filter((card) => card.includes('H'));
  const diamonds = cards.filter((card) => card.includes('D'));
  const clubs = cards.filter((card) => card.includes('C'));

  if (spades.length >= 5) {
    return true;
  }

  if (hearts.length >= 5) {
    return true;
  }

  if (diamonds.length >= 5) {
    return true;
  }

  if (clubs.length >= 5) {
    return true;
  }

  return false;
};

const checkStraight = (cards: string[]) => {
  const cardValues = cards.map((card) => cardValue(card));
  const sorted = cardValues.sort((a, b) => a - b);
  let count = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i] + 1 === sorted[i + 1]) {
      count++;
    }
  }
  return count >= 5;
};

const checkStraightFlush = (cards: string[]) => {
  return checkFlush(cards) && checkStraight(cards);
};

const checkRoyalFlush = (cards: string[]) => {
  const royalFlush = ['T', 'J', 'Q', 'K', 'A'];
  const royalFlushCards = cards.filter((card) => royalFlush.includes(card[0]));
  return checkStraightFlush(royalFlushCards);
};

const checkFourOfAKind = (cards: string[]) => {
  const cardValues = cards.map((card) => cardValue(card));
  const counts = cardValues.reduce((acc, card) => {
    if (!acc[card]) {
      acc[card] = 0;
    }
    acc[card]++;
    return acc;
  }, {} as Record<number, number>);

  return Object.values(counts).includes(4);
};

const checkFullHouse = (cards: string[]) => {
  const cardValues = cards.map((card) => cardValue(card));
  const counts = cardValues.reduce((acc, card) => {
    if (!acc[card]) {
      acc[card] = 0;
    }
    acc[card]++;
    return acc;
  }, {} as Record<number, number>);

  return Object.values(counts).includes(3) && Object.values(counts).includes(2);
};

const getThreeOfAKindValue = (cards: string[]) => {
  const cardValues = cards.map((card) => cardValue(card));
  const counts = cardValues.reduce((acc, card) => {
    if (!acc[card]) {
      acc[card] = 0;
    }
    acc[card]++;
    return acc;
  }, {} as Record<number, number>);

  const threeOfAKind = Object.entries(counts).filter(
    ([, count]) => count === 3
  );

  return parseInt(threeOfAKind[0][0]);
};

const getPairValue = (cards: string[]) => {
  const cardValues = cards.map((card) => cardValue(card));
  const counts = cardValues.reduce((acc, card) => {
    if (!acc[card]) {
      acc[card] = 0;
    }
    acc[card]++;
    return acc;
  }, {} as Record<number, number>);

  const pairs = Object.entries(counts).filter(([_, count]) => count === 2);

  if (pairs.length === 2) {
    const pairValues = pairs.map(([value]) => parseInt(value));
    return Math.max(...pairValues);
  }

  return parseInt(pairs[0][0]);
};

const checkThreeOfAKind = (cards: string[]) => {
  const cardValues = cards.map((card) => cardValue(card));
  const counts = cardValues.reduce((acc, card) => {
    if (!acc[card]) {
      acc[card] = 0;
    }
    acc[card]++;
    return acc;
  }, {} as Record<number, number>);

  return Object.values(counts).includes(3);
};

const checkTwoPair = (cards: string[]) => {
  const cardValues = cards.map((card) => cardValue(card));
  const counts = cardValues.reduce((acc, card) => {
    if (!acc[card]) {
      acc[card] = 0;
    }
    acc[card]++;
    return acc;
  }, {} as Record<number, number>);

  return Object.values(counts).filter((count) => count === 2).length === 2;
};

const checkOnePair = (cards: string[]) => {
  const cardValues = cards.map((card) => cardValue(card));
  const counts = cardValues.reduce((acc, card) => {
    if (!acc[card]) {
      acc[card] = 0;
    }
    acc[card]++;
    return acc;
  }, {} as Record<number, number>);

  return Object.values(counts).includes(2);
};

const checkHighCard = (cards: string[]) => {
  const cardValues = cards.map((card) => cardValue(card));
  return Math.max(...cardValues);
};

export const showOutput = mutation({
  args: {
    id: v.id('hands'),
    hash: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, hash } = args;

    await ctx.db.patch(id, {
      hash,
    });
  },
});

export const newHand = mutation({
  args: {
    id: v.id('hands'),
  },
  handler: async (ctx, args) => {
    const { id } = args;
    const hand = await ctx.db.get(id);
    const gameId = hand.gameId;
    const game = await ctx.db.get(gameId);

    const bigBlind = game?.smallBlind;
    const smallBlind = game?.bigBlind;

    await ctx.db.patch(id, {
      isActive: false,
    });

    await ctx.db.patch(gameId, {
      bigBlind,
      smallBlind,
    });
  },
});
