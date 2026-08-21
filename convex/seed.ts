import { internalMutation } from './_generated/server';

// Deterministic seed. Run it with:  npx convex run seed:run
//
// Deterministic on purpose: everyone gets the same numbers, so when you say
// "total raised is $12,340.50" we can check it. There is no randomness and no
// Date.now() in the generated data.
//
// Re-running wipes and rebuilds. Safe to do whenever you want a clean slate.

const DAY = 24 * 60 * 60 * 1000;
// Fixed epoch so seeded dates never move: 2026-01-01T00:00:00Z.
const T0 = 1767225600000;

const FIRST = [
  'Amina', 'Jordan', 'Priya', 'Marcus', 'Sofia', 'Wei', 'Noor', 'Diego',
  'Hana', 'Tomas', 'Leila', 'Andre', 'Yusuf', 'Clara', 'Ravi', 'Maya',
];
const LAST = [
  'Haddad', 'Okafor', 'Nguyen', 'Silva', 'Rahman', 'Kim', 'Torres', 'Ali',
];

// A tiny deterministic PRNG (mulberry32). Same seed, same sequence, forever.
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Wipe.
    for (const table of [
      'donations',
      'campaigns',
      'chatMessages',
      'chatThreads',
    ] as const) {
      const rows = await ctx.db.query(table).collect();
      for (const row of rows) await ctx.db.delete(row._id);
    }

    const campaigns = [
      {
        name: 'Legal Defense Fund',
        slug: 'legal-defense-fund',
        status: 'active' as const,
        goalCents: 25_000_00,
        suggestedAmountsCents: [2500, 5000, 10_000, 25_000, 50_000, 100_000],
        defaultAmountCents: 5000,
        content: {
          headline: 'Every family deserves a lawyer',
          description:
            'Your gift funds attorneys and paralegals who defend families facing detention, discrimination, and unlawful search. Last year we took 340 cases and won 71 percent of them.',
          brandColor: '#7c3aed',
          assets: [
            {
              kind: 'image' as const,
              url: 'https://images.unsplash.com/photo-1591189863430-ab87e120f312?w=1200&q=70',
              alt: 'Volunteers at a community legal clinic',
            },
            {
              kind: 'image' as const,
              url: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&q=70',
              alt: 'An attorney meeting a client',
            },
          ],
        },
        settings: { showGoal: true, noteEnabled: true, dedicationEnabled: true },
      },
      {
        name: 'Winter Meal Drive',
        slug: 'winter-meal-drive',
        status: 'active' as const,
        goalCents: 8_000_00,
        suggestedAmountsCents: [1000, 2500, 5000, 10_000],
        defaultAmountCents: 2500,
        content: {
          headline: 'Hot meals through the coldest months',
          description:
            'Twelve dollars puts a hot meal in front of someone tonight. We serve 900 meals a week from November through March.',
          brandColor: '#0f766e',
          assets: [
            {
              kind: 'image' as const,
              url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=70',
              alt: 'Volunteers serving meals',
            },
          ],
        },
        settings: { showGoal: true, dedicationEnabled: false },
      },
      {
        name: 'Scholarship Endowment',
        slug: 'scholarship-endowment',
        status: 'active' as const,
        // No goal set on purpose: the public page and the dashboards must
        // both handle a campaign with no goal without dividing by zero.
        goalCents: undefined,
        suggestedAmountsCents: [5000, 10_000, 25_000],
        content: {
          headline: 'Send a first-generation student to college',
          description:
            'A permanent fund. Only the interest is spent, so a gift today pays out every year from now on.',
          brandColor: '#b45309',
        },
        settings: { showGoal: false },
      },
      {
        name: 'Emergency Relief (ended)',
        slug: 'emergency-relief-2025',
        status: 'ended' as const,
        goalCents: 50_000_00,
        suggestedAmountsCents: [2500, 5000, 10_000],
        content: { description: 'Closed. Kept so you can test an ended campaign.' },
        settings: {},
      },
      {
        name: 'Untitled draft',
        slug: 'untitled-draft',
        status: 'draft' as const,
        suggestedAmountsCents: [2500, 5000],
        // No content at all: the builder and the public page must both cope
        // with a campaign that has never been edited.
        settings: {},
      },
    ];

    const ids = [];
    for (const c of campaigns) {
      ids.push(await ctx.db.insert('campaigns', { ...c, createdAt: T0 }));
    }

    // ── Donations ─────────────────────────────────────────────────────────
    // ~420 gifts over 180 days, weighted toward the two live campaigns, with
    // a realistic mix of statuses and a handful of repeat donors.
    const rand = rng(42);
    const amounts = [1000, 2500, 5000, 10_000, 25_000, 50_000, 100_000];
    // Repeat donors: the same email gives several times. Dashboards should
    // surface these; a naive "count donations" reads them as separate people.
    const repeat = [
      'amina.haddad@example.org',
      'marcus.silva@example.org',
      'wei.kim@example.org',
    ];

    let count = 0;
    for (let day = 0; day < 180; day++) {
      const perDay = Math.floor(rand() * 4);
      for (let n = 0; n < perDay; n++) {
        // Weight: campaign 0 gets most, 1 next, 2 a few, 3 (ended) only old.
        const r = rand();
        const ci = r < 0.55 ? 0 : r < 0.85 ? 1 : r < 0.95 ? 2 : 3;
        if (ci === 3 && day > 60) continue; // ended campaign stopped early

        const useRepeat = rand() < 0.12;
        const email = useRepeat
          ? repeat[Math.floor(rand() * repeat.length)]
          : `${FIRST[Math.floor(rand() * FIRST.length)]}.${
              LAST[Math.floor(rand() * LAST.length)]
            }${Math.floor(rand() * 900)}@example.org`.toLowerCase();

        const name = email
          .split('@')[0]
          .replace(/[0-9]/g, '')
          .split('.')
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
          .join(' ')
          .trim();

        const amountCents = amounts[Math.floor(rand() * amounts.length)];
        const s = rand();
        // Deliberate: ~6% fail and ~3% refund. Any dashboard that sums all
        // rows instead of filtering to succeeded will report too much money.
        const status =
          s < 0.06 ? 'failed' : s < 0.09 ? 'refunded' : s < 0.13 ? 'pending' : 'succeeded';

        await ctx.db.insert('donations', {
          campaignId: ids[ci],
          amountCents,
          feeCoveredCents: rand() < 0.6 ? Math.round(amountCents * 0.029) + 30 : 0,
          frequency: rand() < 0.18 ? 'monthly' : 'one_time',
          status: status as 'pending' | 'succeeded' | 'failed' | 'refunded',
          donorEmail: email,
          donorName: name,
          anonymous: rand() < 0.08,
          note: rand() < 0.15 ? 'Keep up the good work.' : undefined,
          dedication:
            rand() < 0.1
              ? {
                  honoreeName: `${FIRST[Math.floor(rand() * FIRST.length)]} ${
                    LAST[Math.floor(rand() * LAST.length)]
                  }`,
                  kind: rand() < 0.5 ? ('honor' as const) : ('memory' as const),
                }
              : undefined,
          createdAt: T0 + day * DAY + Math.floor(rand() * DAY),
        });
        count++;
      }
    }

    return { campaigns: ids.length, donations: count };
  },
});
