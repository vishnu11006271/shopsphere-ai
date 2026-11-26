"use client";
import { X } from "lucide-react";
import { formatINR } from "@/lib/utils";
import type { Product } from "@/types/product";
export function ProductComparison({
  products,
  onRemove,
  onClear,
}: {
  products: Product[];
  onRemove: (id: number) => void;
  onClear: () => void;
}) {
  if (!products.length) return null;
  return (
    <section
      className="fixed inset-x-3 bottom-3 z-30 mx-auto max-w-5xl rounded-2xl border border-black/10 bg-white p-4 shadow-xl"
      aria-label="Product comparison tray"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">
          Compare products <span className="ml-1 text-muted">({products.length}/4)</span>
        </p>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onClear} className="text-xs text-muted">
            Clear
          </button>
          {products.length >= 2 && (
            <a
              href="#comparison-table"
              className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white"
            >
              Compare now
            </a>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {products.map((p) => (
          <span
            key={p.id}
            className="inline-flex max-w-full items-center gap-2 rounded-full bg-canvas py-1 pl-2 pr-1 text-xs"
          >
            <span className="max-w-36 truncate">{p.title}</span>
            <button
              type="button"
              aria-label={`Remove ${p.title} from comparison`}
              onClick={() => onRemove(p.id)}
              className="rounded-full p-1 hover:bg-white"
            >
              <X size={13} />
            </button>
          </span>
        ))}
      </div>
      {products.length >= 2 && (
        <div id="comparison-table" className="mt-4 max-h-56 overflow-auto">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead>
              <tr>
                <th className="p-2 text-muted">Details</th>
                {products.map((p) => (
                  <th key={p.id} className="max-w-40 p-2 font-semibold">
                    {p.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Price", ...products.map((p) => formatINR(p.price * 85))],
                ["Rating", ...products.map((p) => `${p.rating.toFixed(1)} / 5`)],
                ["Brand", ...products.map((p) => p.brand || "—")],
                ["Category", ...products.map((p) => p.category)],
                [
                  "Availability",
                  ...products.map((p) => (p.stock > 0 ? "In stock" : "Out of stock")),
                ],
                [
                  "Discount",
                  ...products.map((p) => `${Math.round(p.discountPercentage)}%`),
                ],
              ].map((row, i) => (
                <tr key={i} className="border-t border-black/5">
                  <th className="p-2 font-medium text-muted">{row[0]}</th>
                  {row.slice(1).map((v, j) => (
                    <td key={j} className="p-2">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
