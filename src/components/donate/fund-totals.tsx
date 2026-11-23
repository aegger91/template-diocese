"use client";

import { useEffect, useState } from "react";
import { getTotalsAdapter, type FundTotals } from "@/lib/donations/totals";

/** Optional (features.fundTotals). Shows provider-reported totals as text; renders nothing when no provider answers. */
export function FundTotalsNote({
  fundId,
  lang,
  currency,
  labels,
}: {
  fundId: string;
  lang: string;
  currency: string;
  labels: { raised: string; donors: string; updated: string; sample: string };
}) {
  const [totals, setTotals] = useState<FundTotals | null>(null);
  useEffect(() => {
    let live = true;
    const adapter = getTotalsAdapter();
    if (!adapter) return;
    adapter
      .getTotals(fundId)
      .then((t) => live && setTotals(t))
      .catch(() => live && setTotals(null));
    return () => {
      live = false;
    };
  }, [fundId]);

  if (!totals) return null;
  const money = new Intl.NumberFormat(lang, { style: "currency", currency, maximumFractionDigits: 0 });
  const date = new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(totals.updatedAt));
  return (
    <p className="mt-3 text-sm text-muted-ink">
      <strong className="text-royal-900">{money.format(totals.raised)}</strong> {labels.raised}, {totals.donors} {labels.donors}. {labels.updated} {date}.
      {totals.sample ? <span className="ms-2 rounded-sm bg-gold-300/40 px-1.5 py-0.5 text-xs font-semibold text-gold-700">{labels.sample}</span> : null}
    </p>
  );
}
