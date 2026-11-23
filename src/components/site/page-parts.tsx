import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BookOpen, Globe2, HandHeart, Music4, UsersRound } from "lucide-react";
import { Ornament } from "@/components/orthodox/cross";
import { getDictionary } from "@/lib/i18n";
import { localHref } from "@/lib/links";
import { cn } from "@/lib/utils";
import type { Ministry } from "@/lib/types";

export function PageHeader({
  lang,
  title,
  intro,
  eyebrow,
  crumbs = [],
  children,
}: {
  lang: string;
  title: string;
  intro?: string;
  eyebrow?: string;
  crumbs?: { label: string; href: string }[];
  children?: React.ReactNode;
}) {
  const t = getDictionary(lang);
  return (
    <div className="on-dark relative bg-royal-900 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 120% at 85% 0%, color-mix(in oklch, var(--color-royal-600) 70%, transparent), transparent 70%), radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--color-gold-400) 22%, transparent) 1px, transparent 0)",
            backgroundSize: "auto, 22px 22px",
          }}
        />
      </div>
      <div className="container-site relative py-10 sm:py-14">
        <nav aria-label={t.common.breadcrumb} className="mb-5 text-sm text-royal-200">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href={localHref(lang, "/")} className="hover:text-white hover:underline">
                {t.common.home}
              </Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.href} className="flex items-center gap-1.5">
                <ChevronRight className="size-3.5 opacity-60 rtl:rotate-180" aria-hidden />
                <Link href={localHref(lang, c.href)} className="hover:text-white hover:underline">
                  {c.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
        <h1 className="max-w-4xl text-4xl leading-snug sm:text-5xl lg:text-[3.4rem]">{title}</h1>
        {intro ? <p className="mt-4 max-w-3xl text-lg leading-relaxed text-royal-100">{intro}</p> : null}
        {children}
      </div>
      <div className="h-1.5 border-y border-gold-500/70 bg-royal-950" aria-hidden />
    </div>
  );
}

export function SectionHeading({
  title,
  eyebrow,
  action,
  className,
  center,
}: {
  title: string;
  eyebrow?: string;
  action?: { label: string; href: string };
  className?: string;
  center?: boolean;
}) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3", center && "flex-col items-center text-center", className)}>
      <div className={cn("min-w-0", center && "w-full")}>
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h2 className="text-3xl leading-tight text-royal-900 sm:text-4xl">{title}</h2>
        {center ? <Ornament className="mx-auto mt-4 max-w-56" /> : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-royal-700 underline-offset-4 hover:underline"
        >
          {action.label}
          <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}

export function Prose({ paragraphs, className }: { paragraphs: string[]; className?: string }) {
  return (
    <div className={cn("prose-diocese", className)}>
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

export function DateTile({ day, month, className }: { day: string; month: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex w-14 shrink-0 flex-col items-center justify-center rounded-md border border-gold-500/50 bg-white py-1.5 text-center shadow-[inset_0_0_0_3px_var(--color-parchment)]",
        className,
      )}
    >
      <span className="font-heading text-2xl leading-tight text-royal-900">{day}</span>
      <span className="mt-0.5 text-[0.68rem] font-bold uppercase leading-snug tracking-wider text-gold-700">{month}</span>
    </div>
  );
}

export function MinistryIcon({ icon, className }: { icon: Ministry["icon"]; className?: string }) {
  const Icon = { youth: UsersRound, education: BookOpen, missions: Globe2, music: Music4, charity: HandHeart }[icon];
  return <Icon className={className} aria-hidden />;
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-royal-200 bg-royal-50/60 px-6 py-10 text-center text-muted-ink">
      {children}
    </div>
  );
}
