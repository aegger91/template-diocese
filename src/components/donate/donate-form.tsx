"use client";

import { useEffect, useId, useState } from "react";
import { Check, Info, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readQuery } from "@/components/site/filter-select";
import { FundTotalsNote } from "@/components/donate/fund-totals";
import { submitDonation, type DonationResult } from "@/lib/donations/payments";
import { cn } from "@/lib/utils";

interface FundOption {
  id: string;
  name: string;
  description: string;
}

interface Labels {
  chooseFund: string;
  frequency: string;
  oneTime: string;
  monthly: string;
  amount: string;
  otherAmount: string;
  yourDetails: string;
  name: string;
  email: string;
  inMemory: string;
  give: string;
  demoNotice: string;
  notConfigured: string;
  secure: string;
  summary: string;
  perMonth: string;
  invalidEmail: string;
  raised: string;
  donors: string;
  updated: string;
  sample: string;
}

export function DonateForm({
  funds,
  defaultFund,
  amounts,
  currency,
  lang,
  showTotals,
  labels,
}: {
  funds: FundOption[];
  defaultFund: string;
  amounts: number[];
  currency: string;
  lang: string;
  showTotals: boolean;
  labels: Labels;
}) {
  const uid = useId();
  const [fund, setFund] = useState(defaultFund);
  const [frequency, setFrequency] = useState<"one-time" | "monthly">("one-time");
  const [preset, setPreset] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dedication, setDedication] = useState("");
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<DonationResult | null>(null);

  useEffect(() => {
    const q = readQuery(["fund"]).fund;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (q && funds.some((f) => f.id === q)) setFund(q);
  }, [funds]);

  const money = new Intl.NumberFormat(lang, { style: "currency", currency, maximumFractionDigits: 2, minimumFractionDigits: 0 });
  const parsedCustom = custom ? Number(custom.replace(",", ".")) : NaN;
  const amount = custom ? (Number.isFinite(parsedCustom) ? parsedCustom : 0) : (preset ?? 0);
  const fundName = funds.find((f) => f.id === fund)?.name ?? "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = labels.invalidEmail;
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    const res = await submitDonation({ fundId: fund, amount, currency, frequency, donor: { name, email }, dedication: dedication || undefined, lang });
    setBusy(false);
    if (res.status === "redirect") window.location.assign(res.url);
    else setResult(res);
  };

  const legend = "mb-3 text-xs font-bold uppercase tracking-wider text-muted-ink";

  return (
    <form onSubmit={submit} noValidate className="space-y-8">
      <fieldset>
        <legend className={legend}>{labels.chooseFund}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {funds.map((f) => (
            <label
              key={f.id}
              className={cn(
                "relative flex cursor-pointer gap-3 rounded-lg border bg-white p-4 transition has-focus-visible:ring-3 has-focus-visible:ring-gold-500/50",
                fund === f.id ? "border-royal-700 shadow-[inset_0_0_0_1px_var(--color-royal-700)]" : "border-line hover:border-royal-200",
              )}
            >
              <input type="radio" name={`${uid}-fund`} value={f.id} checked={fund === f.id} onChange={() => setFund(f.id)} className="sr-only" />
              <span
                className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border",
                  fund === f.id ? "border-royal-700 bg-royal-700 text-white" : "border-royal-200",
                )}
                aria-hidden
              >
                {fund === f.id ? <Check className="size-3" /> : null}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-royal-900">{f.name}</span>
                <span className="text-sm text-muted-ink">{f.description}</span>
              </span>
            </label>
          ))}
        </div>
        {showTotals ? <FundTotalsNote fundId={fund} lang={lang} currency={currency} labels={labels} /> : null}
      </fieldset>

      <fieldset>
        <legend className={legend}>{labels.frequency}</legend>
        <div className="inline-flex w-full rounded-md border border-royal-200 bg-white p-1 sm:w-auto">
          {(["one-time", "monthly"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={frequency === v}
              onClick={() => setFrequency(v)}
              className="h-10 flex-1 rounded-sm px-5 text-sm font-semibold text-royal-800 aria-pressed:bg-royal-800 aria-pressed:text-white sm:flex-none"
            >
              {v === "one-time" ? labels.oneTime : labels.monthly}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={legend}>{labels.amount}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {amounts.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={!custom && preset === a}
              onClick={() => {
                setPreset(a);
                setCustom("");
              }}
              className="h-12 rounded-md border border-royal-200 bg-white text-lg font-semibold text-royal-900 transition hover:border-royal-600 aria-pressed:border-royal-800 aria-pressed:bg-royal-800 aria-pressed:text-white"
            >
              {money.format(a)}
            </button>
          ))}
        </div>
        <div className="mt-3 flex max-w-xs flex-col gap-1.5">
          <label htmlFor={`${uid}-other`} className="text-sm font-semibold text-ink">
            {labels.otherAmount}
          </label>
          <Input
            id={`${uid}-other`}
            inputMode="decimal"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value.replace(/[^\d.,]/g, ""));
              setPreset(null);
            }}
            placeholder={money.format(0)}
            className="h-11 bg-white text-base"
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className={legend}>{labels.yourDetails}</legend>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${uid}-name`} className="text-sm font-semibold text-ink">
            {labels.name}
          </label>
          <Input id={`${uid}-name`} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="h-11 bg-white text-base" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${uid}-email`} className="text-sm font-semibold text-ink">
            {labels.email}
          </label>
          <Input
            id={`${uid}-email`}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${uid}-email-err` : undefined}
            className="h-11 bg-white text-base"
          />
          {errors.email ? (
            <p id={`${uid}-email-err`} className="text-sm text-destructive">
              {errors.email}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor={`${uid}-ded`} className="text-sm font-semibold text-ink">
            {labels.inMemory}
          </label>
          <Input id={`${uid}-ded`} value={dedication} onChange={(e) => setDedication(e.target.value)} className="h-11 bg-white text-base" />
        </div>
      </fieldset>

      <div className="rounded-lg border border-gold-500/50 bg-parchment p-5">
        <p className="text-sm text-muted-ink">{labels.summary}</p>
        <p className="mt-1 font-heading text-2xl text-royal-900">
          {money.format(amount)}
          {frequency === "monthly" ? ` ${labels.perMonth}` : ""}
          <span className="text-muted-ink">, </span>
          {fundName}
        </p>
        <Button type="submit" disabled={busy} className="mt-4 h-12 w-full rounded-md bg-gold-500 text-base font-semibold text-royal-950 hover:bg-gold-400 sm:w-auto sm:px-8">
          <Lock className="size-4" aria-hidden />
          {labels.give}
        </Button>
        <p className="mt-3 text-xs text-muted-ink">{labels.secure}</p>
        <div aria-live="polite">
          {result && result.status !== "redirect" ? (
            <p className="mt-4 flex items-start gap-2 rounded-md bg-royal-50 p-3 text-sm text-royal-900">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              {result.status === "demo" ? labels.demoNotice : labels.notConfigured}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
