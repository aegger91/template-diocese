import { siteConfig } from "@/lib/content";

export interface DonationRequest {
  fundId: string;
  amount: number;
  currency: string;
  frequency: "one-time" | "monthly";
  donor: { name: string; email: string };
  dedication?: string;
  lang: string;
}

export type DonationResult =
  | { status: "redirect"; url: string }
  | { status: "demo" }
  | { status: "not-configured" }
  | { status: "error"; message: string };

type PaymentHandler = (req: DonationRequest) => Promise<DonationResult>;

/**
 * Provider-agnostic giving. The page only ever calls submitDonation(); each provider plugs in here.
 * Card details must never be collected by this site: every handler hands off to the provider's hosted page.
 */
const handlers: Record<string, PaymentHandler> = {
  // TODO(stripe): call a small server function that creates a Checkout Session
  // (mode "payment" or "subscription"; metadata.fund_id = req.fundId) and return { status: "redirect", url }.
  stripe: async () => ({ status: "not-configured" }),

  // TODO(authorizenet): request an Accept Hosted form token server-side (with the fund id in the order
  // description or a user field) and return the hosted payment page URL.
  authorizenet: async () => ({ status: "not-configured" }),

  // TODO(tithely): link to the organization's Tithe.ly giving page with the fund preselected.
  tithely: async () => ({ status: "not-configured" }),

  none: async () => ({ status: "demo" }),
};

export async function submitDonation(req: DonationRequest): Promise<DonationResult> {
  const provider = siteConfig.donations.paymentProvider;
  const handler = handlers[provider] ?? handlers.none;
  try {
    return await handler(req);
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : String(err) };
  }
}
