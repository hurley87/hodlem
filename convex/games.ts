import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
  args: { address: v.optional(v.string()) },
  handler: async (ctx, { address }) => {
    return await ctx.db
      .query('games')
      .filter((q: any) =>
        q.or(
          q.eq(q.field('bigBlind'), address),
          q.eq(q.field('smallBlind'), address)
        )
      )
      .collect();
  },
});

export const getGame = query({
  args: { gameId: v.id('games') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.gameId);
  },
});

export const create = mutation({
  args: {
    bigBlind: v.string(),
  },
  handler: async (ctx, { bigBlind }) => {
    return await ctx.db.insert('games', {
      bigBlind,
      smallBlind: '',
      challengers: [],
    });
  },
});

export const challenge = mutation({
  args: {
    id: v.id('games'),
    challengers: v.array(v.string()),
  },
  handler: async (ctx, { id, challengers }) => {
    await ctx.db.patch(id, { challengers });
  },
});

export const addSmallBlind = mutation({
  args: {
    id: v.id('games'),
    smallBlind: v.string(),
  },
  handler: async (ctx, { id, smallBlind }) => {
    const game = await ctx.db.get(id);
    const bigBlind =
      game.bigBlind === smallBlind ? game.smallBlind : game.bigBlind;
    await ctx.db.patch(id, {
      smallBlind,
      bigBlind,
    });
  },
});

export const swap = mutation({
  args: {
    id: v.id('games'),
    currentBigBlind: v.string(),
  },
  handler: async (ctx, { id, currentBigBlind }) => {
    const game = await ctx.db.get(id);

    const bigBlind =
      game.bigBlind === currentBigBlind ? game.smallBlind : game.bigBlind;
    const smallBlind =
      game.bigBlind === currentBigBlind ? game.bigBlind : game.smallBlind;

    await ctx.db.patch(id, { bigBlind, smallBlind });
  },
});

export const deleteGame = mutation({
  args: { id: v.id('games') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
