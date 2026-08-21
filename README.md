# Crescent take-home

A small fundraising product, split into two tracks. One repo, one schema, one
Convex deployment, two people.

- **Track A** — the campaign builder and the public donate page → `ASSIGNMENT-A.md`
- **Track B** — internal dashboards and an AI agent → `ASSIGNMENT-B.md`

Read your track's brief. Read the other one too; you are building against each
other's assumptions.

---

## Setup

You need Node 20 or newer.

```bash
npm install
npx convex dev          # first run: log in, create your own dev deployment
npx convex run seed:run # deterministic seed data
npm run dev             # http://localhost:3000
```

`npx convex dev` must keep running in its own terminal. It pushes your Convex
functions on save and generates the types in `convex/_generated`.

> **Expect type errors before that first `npx convex dev`.** `convex/_generated`
> does not exist in a fresh clone, so your editor and `npm run typecheck` will
> report roughly twenty "Cannot find module './_generated/server'" errors. They
> all disappear once Convex has connected once. Nothing is broken.

**Each of you gets your own Convex dev deployment.** That is how Convex works
by default, and it is what keeps you from overwriting each other's data. Your
schema changes are yours until they are merged.

Track B: your Anthropic API key is in `.env.local`, which is gitignored. If it
is missing, ask.

Re-seed whenever you want a clean slate:

```bash
npx convex run seed:run
```

---

## Ground rules

**Use whatever tools you normally use, including AI.** We do not care whether
Claude or Cursor wrote a line. We care whether you can explain why it is there,
what it does when the input is empty, and what you would change with more time.
Expect to be asked, about any part of it.

**Commit as you go.** A single squashed commit at the end tells us nothing. We
read the history to see how you work, and a messy honest history reads better
than a clean fake one.

**Do not rewrite `convex/schema.ts`.** Add tables and add optional fields
freely. Renaming or removing what is there breaks the seed and the other
track. If something is modelled wrong, say so in `NOTES.md` — noticing is worth
more than silently working around it.

**Scope is yours to cut.** The briefs ask for more than is strictly necessary.
Finishing three things properly beats half-finishing six. If you cut something,
say what and why in `NOTES.md`. Cutting deliberately reads as judgment; running
out of time silently reads as not finishing.

---

## `NOTES.md` — required

Create one at the repo root. Keep it as you work, not the night before you
submit. It is read as carefully as the code. Include:

- **What you built** and what you did not, and why.
- **Decisions you made and the alternative you rejected.** Especially anywhere
  the brief was ambiguous. Naming the tradeoff matters more than which side you
  landed on.
- **What is wrong with it.** Every codebase has known problems. Listing yours
  is a strong signal, not a weak one. We will find them anyway, and finding one
  you already flagged reads completely differently from finding one you did not.
- **What you would do with another week.**
- **Anything that surprised you** about Convex, the schema, or the data.

A good `NOTES.md` has rescued a mediocre submission more than once. A missing
one has sunk a good one.

---

## Working in one repo

You will both touch `convex/`. Two things keep that from hurting:

- **Branch.** `track-a/...` and `track-b/...`. Do not commit to `main`.
- **Stay on your side.** Track A owns `campaigns.update` and everything under
  the builder and donate page. Track B owns the aggregates, the chat tables,
  and everything under `/dashboard`. Shared files are `schema.ts` and this
  README. If you need something from the other side, ask rather than reaching
  in — that is the actual job.

---

## Submitting

Push your branch and send the link. Include in `NOTES.md` anything we need in
order to run it (a required env var, a seed step, a known-broken route).

We will then walk through it together for about 45 minutes: you demo it, we ask
why you made specific decisions, and we change a requirement to see how the
design holds. Nothing is memorized and nothing is a trick. Bring the code you
actually wrote.

---

## A note on what "done" means

Nothing here is timed and there is no hidden test suite. We are not looking for
the most features. We are looking for work that is correct where correctness
matters — money, permissions, empty states — and honest about where it is not.

If you find yourself choosing between one more feature and making the existing
ones actually right, choose the second one. Every time.
