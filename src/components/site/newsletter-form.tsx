"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeToNewsletter } from "@/lib/integrations/orthodoxconnect";

export function NewsletterForm({
  lang,
  labels,
}: {
  lang: string;
  labels: { placeholder: string; subscribe: string; subscribed: string; invalidEmail: string };
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setState("error");
      return;
    }
    setState("sending");
    const res = await subscribeToNewsletter(email, lang);
    setState(res.ok ? "done" : "error");
  }

  if (state === "done") {
    return (
      <p role="status" className="rounded-md border border-gold-500/40 bg-white/5 p-3 text-sm text-royal-100">
        {labels.subscribed}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2 sm:flex-row">
      <label className="sr-only" htmlFor="newsletter-email">
        {labels.placeholder}
      </label>
      <div className="relative flex-1">
        <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-royal-200" aria-hidden />
        <Input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          placeholder={labels.placeholder}
          aria-invalid={state === "error" || undefined}
          aria-describedby={state === "error" ? "newsletter-error" : undefined}
          className="h-11 border-white/20 bg-white/10 ps-9 text-white placeholder:text-royal-200"
        />
      </div>
      <Button type="submit" disabled={state === "sending"} className="h-11 rounded-md bg-gold-500 px-5 font-semibold text-royal-950 hover:bg-gold-400">
        {state === "sending" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {labels.subscribe}
      </Button>
      {state === "error" ? (
        <p id="newsletter-error" role="alert" className="text-sm text-gold-300 sm:basis-full">
          {labels.invalidEmail}
        </p>
      ) : null}
    </form>
  );
}
