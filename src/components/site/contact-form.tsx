"use client";

import { useId, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendContactMessage } from "@/lib/integrations/orthodoxconnect";

export function ContactForm({
  topics,
  labels,
}: {
  topics: { value: string; label: string }[];
  labels: { name: string; email: string; topic: string; message: string; send: string; sent: string; invalidEmail: string };
}) {
  const uid = useId();
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [emailError, setEmailError] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    setState("busy");
    await sendContactMessage({
      name: String(data.get("name") ?? ""),
      email,
      topic: String(data.get("topic") ?? ""),
      body: String(data.get("message") ?? ""),
    });
    setState("sent");
  };

  if (state === "sent") {
    return (
      <p role="status" className="flex items-start gap-3 rounded-lg border border-royal-200 bg-royal-50 p-5 text-royal-900">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-royal-700" aria-hidden />
        {labels.sent}
      </p>
    );
  }

  const field = "flex flex-col gap-1.5";
  const label = "text-sm font-semibold text-ink";
  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <div className={field}>
        <label htmlFor={`${uid}-name`} className={label}>{labels.name}</label>
        <Input id={`${uid}-name`} name="name" autoComplete="name" required className="h-11 bg-white text-base" />
      </div>
      <div className={field}>
        <label htmlFor={`${uid}-email`} className={label}>{labels.email}</label>
        <Input
          id={`${uid}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={emailError}
          aria-describedby={emailError ? `${uid}-email-err` : undefined}
          className="h-11 bg-white text-base"
        />
        {emailError ? <p id={`${uid}-email-err`} className="text-sm text-destructive">{labels.invalidEmail}</p> : null}
      </div>
      <div className={`${field} sm:col-span-2`}>
        <label htmlFor={`${uid}-topic`} className={label}>{labels.topic}</label>
        <select
          id={`${uid}-topic`}
          name="topic"
          className="h-11 rounded-md border border-input bg-white px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {topics.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div className={`${field} sm:col-span-2`}>
        <label htmlFor={`${uid}-msg`} className={label}>{labels.message}</label>
        <Textarea id={`${uid}-msg`} name="message" rows={6} required className="bg-white text-base" />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={state === "busy"} className="h-11 rounded-md bg-royal-700 px-6 hover:bg-royal-800">
          <Send className="size-4" aria-hidden />
          {labels.send}
        </Button>
      </div>
    </form>
  );
}
