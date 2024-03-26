import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('profiles').collect();
  },
});

const getProfile = async (ctx: any, address: string) => {
  return ctx.db
    .query('profiles')
    .filter((q: any) => q.eq(q.field('address'), address))
    .first();
};

export const getProfileUsingAddress = query({
  args: { address: v.optional(v.string()) },
  handler: async (ctx, { address }) => {
    return await getProfile(ctx, address as string);
  },
});

export const create = mutation({
  args: {
    bio: v.string(),
    displayName: v.string(),
    fid: v.number(),
    ownerAddress: v.string(),
    pfp: v.string(),
    username: v.optional(v.string()),
    address: v.string(),
  },
  handler: async (
    ctx,
    { bio, displayName, fid, ownerAddress, pfp, username, address }
  ) => {
    const existingProfile = await getProfile(ctx, address);
    if (!existingProfile) {
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
