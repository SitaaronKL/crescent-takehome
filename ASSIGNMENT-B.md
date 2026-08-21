# Track B — Internal dashboards and the AI agent

You own everything the **organization's staff** look at: the reporting surface,
and an AI assistant that can answer questions about their fundraising.

Track A owns the campaign builder and the public donate page. You share one
repo, one schema, and one Convex deployment. You will both be touching
`convex/`, so read the note about collaboration in `README.md` before your
first commit.

---

## The product, in one paragraph

A nonprofit is raising money across several campaigns. Their staff need to know
how it is going: what came in, from whom, whether it is growing, which
campaigns are working. Some of them will not open a dashboard at all and would
rather just ask a question in plain English and get a real answer.

You are building both.

---

## What to build

### 1. The dashboards

**An overview** at `/dashboard`:

- Total raised, donation count, unique donors, average gift
- Money over time, charted, with a switchable range
- Breakdown by campaign
- Recent donations

**A campaign detail view** at `/dashboard/campaigns/[id]` with the same shape
scoped to one campaign.

**A donors view** at `/dashboard/donors`: who gave, how much in total, how many
times, when they last gave. Sortable and searchable.

### 2. `convex/donations.ts` → `stats` and `timeseries`

Implement the aggregates. The stub documents the traps, and they are real
traps: the seed is built so that a naive implementation produces a number that
looks plausible and is wrong.

### 3. The AI agent

A chat interface at `/dashboard/assistant` that answers questions about this
org's fundraising data.

It must handle at least:

- "How much did we raise last month?"
- "Which campaign is doing best?"
- "Who are our top 10 donors?"
- "How many people gave more than once?"
- "Did the meal drive do better than the legal fund in March?"

**Requirements:**

- The model must reach the data through **tools you define**, not by having
  rows pasted into the prompt. Tool definitions with real schemas are most of
  what we are assessing here.
- Conversations persist. The `chatThreads` and `chatMessages` tables exist for
  this, including columns for which tool ran with what arguments.
- Tool calls must be **visible in the UI**. The user should be able to see that
  the assistant looked something up, and what it looked up.
- It must refuse gracefully. When a question cannot be answered from the data,
  say so. An assistant that invents a number is worse than one that declines,
  because a plausible invented number gets pasted into a board report.
- Streaming responses if you can. Not required, and not worth sacrificing
  correctness for.

Your API key is in `.env.local`. It is scoped and rate-limited. Do not commit
it, and do not put it in client-side code — if the key is reachable from the
browser, anyone can spend it.

---

## What we are actually assessing

**Are the numbers right?** This dominates everything else. The seed contains
failed, refunded, and pending donations; only `succeeded` money is raised. It
contains repeat donors, so unique donors is not donation count. It separates
`amountCents` from `feeCoveredCents`, so raised is not total charged. Every one
of those is a bug that ships silently because the wrong number still looks like
a number. If your dashboard and your agent disagree about total raised, that is
a worse failure than either being wrong alone.

**Where does the aggregation happen?** Summing in the browser means shipping
every donation row, with donor names and emails, to the client. Think about
where the work belongs and why.

**Are the tools well designed?** The interesting judgment in agent work is tool
boundaries. One `runQuery` tool that takes arbitrary input is not a design; a
tool per question is not either. We want to see where you drew the lines and
why.

**Can the agent be debugged?** When it returns a wrong answer, can you tell
whether the model reasoned badly or the tool returned bad data? Build so the
answer is obvious.

**Does the UI stay still?** A dashboard that reflows every time a number
arrives, or collapses to zero height while loading, is unpleasant in a way
users feel but do not report. Size containers for their content and keep
previous data visible while new data loads.

**Empty and edge states.** A campaign with no donations. A range with no
activity. A donor who gave once and got refunded. None of these may render as a
crash, a blank screen, or `NaN`.

---

## Explicitly not required

- Authentication. Assume anyone reaching `/dashboard` is authorized staff.
- Real payments, webhooks, or Stripe.
- Fine-tuning, embeddings, or a vector store. Tool-calling is the point.
- The campaign builder or the donate page. That is Track A.
- Voice, file upload, or multi-user chat.

---

## Where to start

1. Read `convex/schema.ts` and `convex/donations.ts` top to bottom.
2. `npx convex run seed:run`.
3. **Compute total raised by hand first.** Write the number down. Everything
   you build gets checked against it, and having a known-good figure before you
   start is the difference between finding a bug and shipping one.
4. Dashboards before the agent. The agent's tools should call the same
   aggregates the dashboard uses. If you build the agent first you will write
   the aggregation twice and they will disagree.

Write `NOTES.md` as you go, not at the end. See `README.md` for what goes in
it. It is read as carefully as the code.
