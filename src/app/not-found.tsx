import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[60vh] place-items-center px-6 py-16 text-center">
      <div className="max-w-lg">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
          Error 404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          The page may have moved, or the link may be out of date. Head back to the
          storefront to continue exploring.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4"
        >
          Return to ShopSphere
        </Link>
      </div>
    </main>
  );
}
