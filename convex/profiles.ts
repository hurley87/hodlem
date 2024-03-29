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
    address: v.string(),
  },
  handler: async (ctx, { address }) => {
    const existingProfile = await getProfile(ctx, address);
    if (!existingProfile) {
      await ctx.db.insert('profiles', {
        address,
      });
    }
  },
});

export const update = mutation({
  args: {
    address: v.string(),
    bio: v.optional(v.string()),
    displayName: v.optional(v.string()),
    fid: v.optional(v.number()),
    ownerAddress: v.optional(v.string()),
    pfp: v.optional(v.string()),
    username: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { address, bio, displayName, fid, ownerAddress, pfp, username }
  ) => {
    const existingProfile = await getProfile(ctx, address);
    console.log('existingProfile', existingProfile);
    if (!existingProfile) {
      return;
    }
    await ctx.db.patch(existingProfile._id, {
      bio,
      displayName,
      fid,
      ownerAddress,
      pfp,
      username,
    });
  },
});
