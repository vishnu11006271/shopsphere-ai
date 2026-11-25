"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      className="grid min-h-[60vh] place-items-center p-6"
      role="alert"
      aria-labelledby="error-title"
    >
      <div className="max-w-md rounded-3xl bg-white p-8 text-center">
        <h1 id="error-title" className="text-xl font-semibold">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted">
          Please try again. Your saved cart remains on this device.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-5 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
