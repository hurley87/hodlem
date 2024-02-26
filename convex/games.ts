import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
  args: { address: v.optional(v.string()) },
  handler: async (ctx, { address }) => {
    return await ctx.db
      .query('games')
      .filter((q: any) => q.eq(q.field('creator'), address))
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
    creator: v.string(),
  },
  handler: async (ctx, { creator }) => {
    return await ctx.db.insert('games', {
      creator,
    });
  },
});
