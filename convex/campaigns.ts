import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Two functions are implemented for you as a REFERENCE for the house style:
// validate on the boundary, never trust stored data, keep money in cents.
// Match this style in what you add.

// #rrggbb only. This value ends up inside CSS, so a loose string is a real
// injection surface. Rows written before this check existed may hold anything,
// which is why it is applied on READ and not only on write.
const HEX = /^#[0-9a-fA-F]{6}$/;
const safeColor = (c: string | undefined) => (c && HEX.test(c) ? c : undefined);

// Only http(s) URLs reach a donor's browser as an <img> src.
const safeUrl = (u: string | undefined) => {
  if (!u) return undefined;
  try {
    const p = new URL(u).protocol;
    return p === 'https:' || p === 'http:' ? u : undefined;
  } catch {
    return undefined;
  }
};

/**
 * PUBLIC: the donate page's loader. Active campaigns only.
 *
 * An unknown slug and a draft campaign return the SAME null, so a response can
 * never confirm that a campaign exists before the org has published it.
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const campaign = await ctx.db
      .query('campaigns')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .unique();

    if (!campaign || campaign.status !== 'active') return null;

    // Aggregate in the query, not in the browser: shipping every donation row
    // to the client to sum it there leaks donor PII to anyone who opens
    // devtools on a public page.
    const donations = await ctx.db
      .query('donations')
      .withIndex('by_campaign', (q) => q.eq('campaignId', campaign._id))
      .collect();
    const succeeded = donations.filter((d) => d.status === 'succeeded');

    return {
      _id: campaign._id,
      name: campaign.name,
      slug: campaign.slug,
      goalCents: campaign.goalCents,
      suggestedAmountsCents: campaign.suggestedAmountsCents,
      defaultAmountCents: campaign.defaultAmountCents,
      content: campaign.content
        ? {
            ...campaign.content,
            brandColor: safeColor(campaign.content.brandColor),
            logoUrl: safeUrl(campaign.content.logoUrl),
            assets: (campaign.content.assets ?? []).filter((a) => safeUrl(a.url)),
          }
        : undefined,
      settings: campaign.settings ?? {},
      totalRaisedCents: succeeded.reduce((sum, d) => sum + d.amountCents, 0),
      donationCount: succeeded.length,
    };
  },
});

/** INTERNAL: every campaign, any status. Powers the admin list. */
export const listAll = query({
  args: {},
  handler: async (ctx) => ctx.db.query('campaigns').collect(),
});

/**
 * Implement this if your brief covers the campaign builder.
 *
 * Save edits from a campaign editor.
 *
 * Think about, and write your reasoning in NOTES.md:
 *   - Partial updates. Saving only the headline must not blank the description.
 *   - Slug uniqueness. Two campaigns sharing a slug breaks the public page,
 *     and the failure is silent until a donor hits the wrong one.
 *   - Validation. What happens when brandColor is 'red', or the goal is
 *     negative, or a suggested amount is 1.5 cents?
 *   - Absent vs false. Clearing a toggle and never setting it are different
 *     states. See the note at the top of schema.ts.
 */
export const update = mutation({
  args: {
    id: v.id('campaigns'),
    // Define the rest of the arguments yourself. The shape you choose is part
    // of what we are looking at.
  },
  handler: async (_ctx, _args) => {
    throw new Error('Not implemented');
  },
});
