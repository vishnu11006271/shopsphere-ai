export default function Loading() {
  return (
    <main className="mx-auto grid min-h-screen max-w-7xl grid-cols-2 gap-4 p-6 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-72 animate-pulse rounded-3xl bg-white" />
      ))}
    </main>
  );
}
