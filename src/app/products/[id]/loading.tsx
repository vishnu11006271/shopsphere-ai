export default function ProductLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="h-5 w-32 animate-pulse rounded bg-stone-200" />
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-3xl bg-stone-200" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-stone-200" />
          <div className="h-5 w-1/3 animate-pulse rounded bg-stone-200" />
          <div className="h-32 animate-pulse rounded bg-stone-200" />
        </div>
      </div>
    </main>
  );
}
