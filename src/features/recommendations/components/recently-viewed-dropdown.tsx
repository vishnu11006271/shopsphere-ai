"use client";
import Image from "next/image";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { useRecentlyViewedStore } from "../store/recently-viewed-store";

export function RecentlyViewedDropdown() {
  const entries = useRecentlyViewedStore((state) => state.entries);
  return (
    <details className="group relative">
      <summary
        aria-label="Recently viewed products"
        className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-ink shadow-sm hover:text-brand [&::-webkit-details-marker]:hidden"
      >
        <Clock3 size={15} />
        <span className="hidden sm:inline">Recently viewed</span>
        <span className="rounded-full bg-canvas px-2 py-0.5 tabular-nums">
          {entries.length}
        </span>
      </summary>
      <div className="absolute right-0 z-50 mt-3 w-[min(90vw,360px)] rounded-2xl border border-black/5 bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recently viewed</h2>
          <span className="text-[10px] text-muted">This browser</span>
        </div>
        {entries.length === 0 ? (
          <p className="mt-4 rounded-xl bg-canvas p-4 text-xs leading-5 text-muted">
            Products you open will appear here for quick access.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {entries.slice(0, 5).map((entry) => (
              <li key={entry.product.id}>
                <Link
                  href={"/products/" + entry.product.id}
                  className="flex items-center gap-3 rounded-xl p-2 hover:bg-canvas"
                >
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-canvas">
                    <Image
                      src={entry.product.thumbnail}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-contain p-1"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block line-clamp-1 text-xs font-semibold">
                      {entry.product.title}
                    </span>
                    <span className="mt-1 block text-[10px] capitalize text-muted">
                      {entry.product.category}
                    </span>
                  </span>
                  <span className="text-xs font-semibold">
                    {formatINR(entry.product.price * 85)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
