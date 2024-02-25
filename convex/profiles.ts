import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('profiles').collect();
  },
});

export const getByAddress = query({
  args: { address: v.optional(v.string()) },
  handler: async (ctx, { address }) => {
    return await ctx.db
      .query('profiles')
      .filter((q) => q.eq(q.field('address'), address))
      .first();
  },
});

export const create = mutation({
  args: {
    bio: v.string(),
    displayName: v.string(),
    fid: v.number(),
    ownerAddress: v.string(),
    pfp: v.string(),
    username: v.string(),
    address: v.string(),
  },
  handler: async (
    ctx,
    { bio, displayName, fid, ownerAddress, pfp, username, address }
  ) => {
    const existing = await ctx.db
      .query('profiles')
      .filter((q) => q.eq(q.field('address'), address))
      .first();
    if (!existing) {
      await ctx.db.insert('profiles', {
        bio,
        displayName,
        fid,
        ownerAddress,
        pfp,
        username,
        address,
      });
    }
  },
});
