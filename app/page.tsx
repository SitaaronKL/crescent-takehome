// Deliberately minimal. What you build and where it lives is in your brief;
// this page is only here so `npm run dev` shows something on a fresh clone.
export default function Home() {
  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <h1 className="text-2xl font-semibold tracking-tight">Crescent take-home</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-600">
        Read <code className="rounded bg-zinc-200 px-1">README.md</code> for setup and
        the data model, then the brief that was sent to you.
      </p>
      <p className="mt-6 text-xs leading-5 text-zinc-500">
        Nothing is wired up yet. If Convex is not connected, run{' '}
        <code className="rounded bg-zinc-200 px-1">npx convex dev</code> in a second
        terminal, then{' '}
        <code className="rounded bg-zinc-200 px-1">npx convex run seed:run</code>.
      </p>
    </main>
  );
}
