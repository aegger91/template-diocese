"use client";

import { ExternalLink, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNow } from "@/components/site/upcoming";
import { parseLocal } from "@/lib/dates";

export function RegistrationPanel({
  end,
  registrationUrl,
  deadlineLabel,
  buildTime,
  labels,
}: {
  end: string;
  registrationUrl: string | null;
  deadlineLabel?: string;
  buildTime: string;
  labels: { register: string; deadline: string; closed: string; none: string; note: string };
}) {
  const now = useNow(buildTime);
  if (parseLocal(end).getTime() < now.getTime()) {
    return <p className="rounded-md bg-royal-50 px-4 py-3 text-sm font-semibold text-muted-ink">{labels.closed}</p>;
  }
  if (!registrationUrl) return <p className="text-sm text-muted-ink">{labels.none}</p>;
  return (
    <div className="space-y-3">
      <Button asChild className="h-auto min-h-12 w-full whitespace-normal rounded-md bg-gold-500 py-2.5 text-base font-semibold text-royal-950 hover:bg-gold-400">
        <a href={registrationUrl} rel="noopener">
          <Ticket className="size-4" aria-hidden />
          {labels.register}
          <ExternalLink className="size-3.5 opacity-70" aria-hidden />
        </a>
      </Button>
      {deadlineLabel ? (
        <p className="text-sm text-ink">
          {labels.deadline}: <strong>{deadlineLabel}</strong>
        </p>
      ) : null}
      <p className="text-xs leading-relaxed text-muted-ink">{labels.note}</p>
    </div>
  );
}
