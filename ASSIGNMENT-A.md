# Track A — The campaign builder and the public donate page

You own everything an **organization edits** and everything a **donor sees**.

Track B owns the internal dashboards and the AI agent. You share one repo, one
schema, and one Convex deployment. You will both be touching `convex/`, so read
the note about collaboration in `README.md` before your first commit.

---

## The product, in one paragraph

A nonprofit signs up, builds a fundraising campaign in an editor, and publishes
it. Donors land on a public page and give money. The org can change the copy,
the images, the suggested amounts, and which optional fields donors are asked
for. Whatever the org configures is what the donor sees, immediately.

You are building both halves of that loop.

---

## What to build

### 1. The campaign builder (internal)

A form at `/campaigns/[id]/edit` where an org edits a campaign.

It must be able to edit, at minimum:

- Campaign name and slug
- Headline and description
- Logo and at least one media asset (URL input is fine, no upload needed)
- Brand color
- Goal amount
- Suggested donation amounts (add, remove, reorder)
- The toggles in `settings`: show name, show goal, show description, and which
  optional donor fields are offered (note, dedication, anonymous)

**A live preview is required.** The org must see the donor's view update as
they type, without saving. This is the heart of the assignment: it is the
feature orgs care about most and it is where the interesting problems are.

### 2. The public donate page

At `/give/[slug]`. This is what a donor sees.

- Renders from the campaign's real content and settings
- Suggested amounts plus a custom amount
- One-time and monthly, if the campaign allows both
- Collects the donor's name and email
- Shows the optional fields the org enabled, and **only** those
- A goal progress bar when a goal is set, and a sane layout when one is not
- Submits through `donations.create`
- Confirms clearly when the gift is recorded

Draft and ended campaigns must not accept donations, and must not leak that
they exist.

### 3. `convex/campaigns.ts` → `update`

Implement the save mutation. The stub documents what to think about.

---

## What we are actually assessing

Not pixel-perfection. These, roughly in order:

**Does the toggle actually work, end to end?** A setting is real only if it is
in the schema, written by the mutation, read by the loader, and honored by the
donor page. Miss any one link and the switch flips in the UI and changes
nothing. This is the single most common failure in this assignment. Test each
toggle by flipping it and loading the real donor page.

**Absent, false, and true are three states.** A campaign created before a
toggle existed has no value for it. Decide what that means, apply it
consistently, and write it down. `settings.showGoal === false` hiding the bar
while `undefined` shows it is a defensible rule. Silently defaulting to hidden
is not, because it changes existing campaigns' behavior.

**Does the preview tell the truth?** A preview that renders through a different
code path than the donor page will drift, and the org will not find out until a
donor does. How you avoid that is a design decision we want to see you make.

**Do you trust stored data?** `brandColor` goes into CSS. Asset URLs become
`<img src>`. Rows can predate your validation. `campaigns.ts` shows the house
approach; carry it through.

**Money.** Integer cents everywhere. If you write a float dollar amount
anywhere, we will find it.

**Does it hold up when things are missing?** The seed has a campaign with no
goal, and one with no content at all. Neither may crash or render a broken
layout. Long copy and a 20-character campaign name should both look deliberate.

---

## Explicitly not required

- Real payments. There is no Stripe. `donations.create` is the whole flow.
- Authentication. Assume anyone reaching `/campaigns` is a logged-in org.
- File uploads. URL fields are fine.
- Mobile-perfect design, though it should not be actively broken on a phone.
- The dashboards or the chatbot. That is Track B.

---

## Where to start

1. Read `convex/schema.ts` top to bottom. Every comment is load-bearing.
2. `npx convex run seed:run`, then look at the seeded campaigns.
3. Build the donor page first, against seeded data, before the editor. It is
   much easier to build an editor once you know exactly what it must produce.

Write `NOTES.md` as you go, not at the end. See `README.md` for what goes in
it. It is read as carefully as the code.
