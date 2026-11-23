import { siteConfig } from "@/lib/content";

/**
 * Optional fund totals (features.fundTotals, off by default).
 *
 * Raised amounts are never typed in by hand. A provider adapter sums the payments tagged with a fund id,
 * either from provider webhooks stored by the backend or from a periodic API sync, and the backend serves:
 *
 *   GET {fundTotalsEndpoint}  ->  { "raised": number, "donors": number, "updatedAt": ISO string }
 *
 * When no provider is connected, or the request fails, the totals UI hides itself.
 */
export interface FundTotals {
  raised: number;
  donors: number;
  updatedAt: string;
  sample?: boolean;
}

export interface TotalsAdapter {
  id: string;
  getTotals(fundId: string): Promise<FundTotals | null>;
}

function endpointFor(fundId: string) {
  return siteConfig.donations.fundTotalsEndpoint.replace("{fundId}", encodeURIComponent(fundId));
}

async function fromEndpoint(fundId: string): Promise<FundTotals | null> {
  const res = await fetch(endpointFor(fundId), { headers: { accept: "application/json" } });
  if (!res.ok) return null;
  const data = (await res.json()) as Partial<FundTotals>;
  if (typeof data.raised !== "number" || typeof data.donors !== "number" || !data.updatedAt) return null;
  return { raised: data.raised, donors: data.donors, updatedAt: data.updatedAt };
}

// Each live adapter reads the same endpoint. What differs is how the backend fills it:
const stripeAdapter: TotalsAdapter = {
  id: "stripe",
  // TODO(stripe): backend sums succeeded PaymentIntents / invoice payments where metadata.fund_id matches,
  // kept current by the payment_intent.succeeded and invoice.paid webhooks.
  getTotals: fromEndpoint,
};

const authorizeNetAdapter: TotalsAdapter = {
  id: "authorizenet",
  // TODO(authorizenet): backend sums settled transactions tagged with the fund id, from the
  // net.authorize.payment.authcapture.created webhook or a nightly getSettledBatchList sync.
  getTotals: fromEndpoint,
};

const tithelyAdapter: TotalsAdapter = {
  id: "tithely",
  // TODO(tithely): backend sums gifts for the matching Tithe.ly fund from its transaction API or webhook.
  getTotals: fromEndpoint,
};

/** Demo only. Clearly sample numbers, never shown unless features.fundTotals is on and the provider is "mock". */
const mockAdapter: TotalsAdapter = {
  id: "mock",
  async getTotals(fundId) {
    const seed = [...fundId].reduce((n, ch) => n + ch.charCodeAt(0), 0);
    return {
      raised: 1000 + (seed % 40) * 250,
      donors: 10 + (seed % 25),
      updatedAt: "2026-11-01T00:00:00Z",
      sample: true,
    };
  },
};

const adapters: Record<string, TotalsAdapter> = {
  stripe: stripeAdapter,
  authorizenet: authorizeNetAdapter,
  tithely: tithelyAdapter,
  mock: mockAdapter,
};

export function getTotalsAdapter(): TotalsAdapter | null {
  if (!siteConfig.features.fundTotals) return null;
  return adapters[siteConfig.donations.fundTotalsProvider] ?? null;
}
