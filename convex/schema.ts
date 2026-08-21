import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// The data model is GIVEN to you, deliberately.
//
// You may ADD tables and add optional fields. Do not rename or remove what is
// here: the seed script depends on it.
//
// If you think something in here is modelled wrong, say so in NOTES.md. That
// is a better signal than silently working around it.

export default defineSchema({
  // ── Campaigns ────────────────────────────────────────────────────────────
  // A fundraising campaign. `content` is what an org edits in the builder;
  // `settings` are the show/hide toggles. Both are optional and absent means
  // "use the default", which for a boolean toggle means SHOWN. Only an
  // explicit false hides something. Keep that rule: it means a campaign
  // created before a toggle existed still renders correctly.
  campaigns: defineTable({
    name: v.string(),
    slug: v.string(),
    status: v.union(
      v.literal('draft'),
      v.literal('active'),
      v.literal('ended')
    ),

    goalCents: v.optional(v.number()),
    suggestedAmountsCents: v.array(v.number()),
    defaultAmountCents: v.optional(v.number()),

    content: v.optional(
      v.object({
        headline: v.optional(v.string()),
        description: v.optional(v.string()),
        logoUrl: v.optional(v.string()),
        // #rrggbb only. Anything else must be ignored on read: this value
        // lands inside CSS, so a loose string is an injection surface.
        brandColor: v.optional(v.string()),
        assets: v.optional(
          v.array(
            v.object({
              kind: v.union(v.literal('image'), v.literal('video')),
              url: v.string(),
              alt: v.optional(v.string()),
            })
          )
        ),
      })
    ),

    settings: v.optional(
      v.object({
        showName: v.optional(v.boolean()),
        showGoal: v.optional(v.boolean()),
        showDescription: v.optional(v.boolean()),
        noteEnabled: v.optional(v.boolean()),
        dedicationEnabled: v.optional(v.boolean()),
        anonymousEnabled: v.optional(v.boolean()),
        // 'one_time' | 'monthly' — which frequencies the donor may pick.
        frequencies: v.optional(v.array(v.string())),
      })
    ),

    createdAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_status', ['status']),

  // ── Donations ────────────────────────────────────────────────────────────
  // One gift. Money is ALWAYS integer cents, never floats — a float dollar
  // amount is a rounding bug waiting to be found by an auditor.
  //
  // `status` models the real lifecycle: a donation exists before it succeeds.
  // Dashboards must not count pending or failed money as raised.
  donations: defineTable({
    campaignId: v.id('campaigns'),

    amountCents: v.number(),
    // The processing fee the donor optionally covered. Net to the org is
    // amountCents; total charged is amountCents + feeCoveredCents.
    feeCoveredCents: v.number(),

    frequency: v.union(v.literal('one_time'), v.literal('monthly')),
    status: v.union(
      v.literal('pending'),
      v.literal('succeeded'),
      v.literal('failed'),
      v.literal('refunded')
    ),

    // Donor identity is keyed on EMAIL, lowercased. Not on a generated id:
    // the same human giving twice with the same email is one donor, and the
    // org needs to see that. There is no login on the public page.
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

    createdAt: v.number(),
  })
    .index('by_campaign', ['campaignId'])
    .index('by_email', ['donorEmail'])
    .index('by_status', ['status'])
    .index('by_created', ['createdAt']),

  // ── Chat ─────────────────────────────────────────────────────────────────
  // Persisted assistant conversations. Ignore these two tables unless your
  // brief covers an assistant.
  chatThreads: defineTable({
    title: v.string(),
    createdAt: v.number(),
  }),

  chatMessages: defineTable({
    threadId: v.id('chatThreads'),
    role: v.union(
      v.literal('user'),
      v.literal('assistant'),
      v.literal('tool')
    ),
    content: v.string(),
    // When the assistant calls a tool, record WHICH tool and with what
    // arguments. This is what makes an assistant debuggable instead of magic.
    toolName: v.optional(v.string()),
    toolArgs: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_thread', ['threadId']),
});
