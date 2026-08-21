import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * PUBLIC: record a gift. Reference implementation — read it before you write
 * yours.
 *
 * There is no payment processor in this exercise. A donation is created as
 * `pending`, exactly as it would be before a real charge settles. Nothing here
 * should ever create a row already marked `succeeded`.
 */
export const create = mutation({
  args: {
    campaignId: v.id('campaigns'),
    amountCents: v.number(),
    feeCoveredCents: v.optional(v.number()),
    frequency: v.union(v.literal('one_time'), v.literal('monthly')),
    donorEmail: v.string(),
    donorName: v.optional(v.string()),
    anonymous: v.optional(v.boolean()),
    note: v.optional(v.string()),
    dedication: v.optional(
      v.object({
        honoreeName: v.string(),
        honoreeEmail: v.optional(v.string()),
        kind: v.union(v.literal('honor'), v.literal('memory')),
      })
    ),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    // Refusing a gift to a draft or ended campaign is a server-side rule.
    // Hiding the button in the UI is not a rule, it is a suggestion.
    if (!campaign || campaign.status !== 'active') {
      throw new Error('Campaign is not accepting donations');
    }

    // Integers only, and a floor. Without the integer check a donor could
    // send 10.5 cents and every downstream total inherits a fraction.
    if (!Number.isInteger(args.amountCents) || args.amountCents < 100) {
      throw new Error('Amount must be a whole number of cents, minimum 100');
    }

    const email = args.donorEmail.trim().toLowerCase();
    if (!email.includes('@')) throw new Error('A valid email is required');

    return ctx.db.insert('donations', {
      campaignId: args.campaignId,
      amountCents: args.amountCents,
      feeCoveredCents: args.feeCoveredCents ?? 0,
      frequency: args.frequency,
      status: 'pending',
      donorEmail: email,
      donorName: args.donorName?.trim() || undefined,
      anonymous: args.anonymous,
      note: args.note?.trim() || undefined,
      dedication: args.dedication,
      createdAt: Date.now(),
    });
  },
});

/** INTERNAL: raw rows for one campaign. Deliberately unpaginated — see below. */
export const listByCampaign = query({
  args: { campaignId: v.id('campaigns') },
  handler: async (ctx, { campaignId }) =>
    ctx.db
      .query('donations')
      .withIndex('by_campaign', (q) => q.eq('campaignId', campaignId))
      .collect(),
});

/**
 * TRACK B — implement these.
 *
 * `listByCampaign` above collects every row. That is fine at 400 donations and
 * a genuine problem at 400,000: it is the shape of bug that passes review,
 * ships, and falls over on your largest customer. Decide what to do about it
 * and write your reasoning in NOTES.md.
 *
 * Things worth getting right, all of which we will check:
 *   - Only `succeeded` money counts as raised. `pending`, `failed` and
 *     `refunded` rows exist in the seed precisely to catch a naive sum.
 *   - `amountCents` is the net to the org. `feeCoveredCents` is extra the
 *     donor paid on top. Total charged is the sum; raised is not.
 *   - A donor is an EMAIL, not a row. The seed contains repeat givers, and
 *     "unique donors" must not equal "donation count".
 *   - Time buckets need a timezone. Say which one you picked and why.
 */
export const stats = query({
  args: {},
  handler: async (_ctx) => {
    throw new Error('Not implemented — Track B');
  },
});

export const timeseries = query({
  args: {},
  handler: async (_ctx) => {
    throw new Error('Not implemented — Track B');
  },
});
