import { siteConfig } from "@/lib/content";

const oc = siteConfig.orthodoxConnect;

function fill(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => encodeURIComponent(values[key] ?? ""));
}

export const orthodoxConnectEnabled = oc.enabled && Boolean(oc.baseUrl);

/** Deep link to the OrthodoxConnect registration page for an event. Placeholder until the app's routes are final. */
export function eventRegistrationUrl(connectEventId: string, lang: string) {
  if (!orthodoxConnectEnabled) return null;
  const path = fill(oc.eventRegistrationPath, { organizationId: oc.organizationId, eventId: connectEventId });
  return `${oc.baseUrl}${path}?lang=${encodeURIComponent(lang)}`;
}

export type SubscribeResult = { ok: true; demo: boolean } | { ok: false; error: string };

/**
 * Newsletter signup through OrthodoxConnect.
 * TODO(orthodoxconnect): POST { email, lang } to `${baseUrl}${newsletterSignupPath}` once the public endpoint exists.
 * Until then the demo resolves without sending anything.
 */
export async function subscribeToNewsletter(email: string, lang: string): Promise<SubscribeResult> {
  if (!orthodoxConnectEnabled) return { ok: false, error: "disabled" };
  void fill(oc.newsletterSignupPath, { organizationId: oc.organizationId });
  void email;
  void lang;
  await new Promise((r) => setTimeout(r, 400));
  return { ok: true, demo: true };
}

/**
 * Contact form delivery.
 * TODO(orthodoxconnect): route to the OrthodoxConnect inbox for the organization, or to a form backend chosen by the client.
 */
export async function sendContactMessage(message: {
  name: string;
  email: string;
  topic: string;
  body: string;
}): Promise<SubscribeResult> {
  void message;
  await new Promise((r) => setTimeout(r, 400));
  return { ok: true, demo: true };
}
