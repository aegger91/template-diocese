"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Globe, HeartHandshake, Menu, X } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface HeaderNavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

interface Props {
  lang: string;
  dir: "ltr" | "rtl";
  languages: { code: string; label: string }[];
  nav: HeaderNavItem[];
  utilityLinks: { label: string; href: string }[];
  donateHref: string | null;
  homeHref: string;
  logo: React.ReactNode;
  labels: { menu: string; closeMenu: string; donate: string; language: string; home: string };
}

function swapLanguage(pathname: string, from: string, to: string) {
  const parts = pathname.split("/");
  if (parts[1] === from) parts[1] = to;
  else parts.splice(1, 0, to);
  const out = parts.join("/");
  return out.endsWith("/") ? out : `${out}/`;
}

function isActive(pathname: string, href: string) {
  const clean = href.split("?")[0];
  return clean.split("/").length > 3 ? pathname.startsWith(clean) : pathname === clean;
}

export function LanguageLinks({
  lang,
  languages,
  className,
  variant = "compact",
  onNavigate,
}: {
  lang: string;
  languages: Props["languages"];
  className?: string;
  variant?: "compact" | "full";
  onNavigate?: () => void;
}) {
  const pathname = usePathname() || `/${lang}/`;
  return (
    <ul className={cn("flex items-center gap-1", className)}>
      {languages.map((l) => {
        const active = l.code === lang;
        return (
          <li key={l.code}>
            <Link
              href={swapLanguage(pathname, lang, l.code)}
              hrefLang={l.code}
              lang={l.code}
              aria-current={active ? "true" : undefined}
              onClick={onNavigate}
              className={cn(
                "inline-flex min-h-8 items-center rounded px-2 text-xs font-semibold tracking-wide transition-colors",
                variant === "full" && "min-h-10 px-3 text-sm",
                active ? "bg-gold-500 text-royal-950" : "text-current opacity-85 hover:bg-white/10 hover:opacity-100",
                variant === "full" && !active && "border border-line hover:bg-royal-50",
              )}
            >
              {variant === "compact" ? l.code.toUpperCase() : l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function SiteHeader({ lang, dir, languages, nav, utilityLinks, donateHref, homeHref, logo, labels }: Props) {
  const [condensed, setCondensed] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "";

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setCondensed((prev) => (prev ? window.scrollY > 8 : window.scrollY > 48));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      data-condensed={condensed}
      className={cn(
        "group/header sticky top-0 z-40 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/90 transition-shadow duration-300",
        condensed ? "shadow-[0_6px_24px_-12px_rgba(14,27,66,0.35)]" : "shadow-none",
      )}
    >
      <div
        className={cn(
          "overflow-hidden bg-royal-900 text-royal-100 transition-[max-height,opacity] duration-300",
          condensed ? "max-h-0 opacity-0" : "max-h-12 opacity-100",
        )}
      >
        <div className="container-site flex h-10 items-center justify-between gap-4 text-xs">
          <nav aria-label="Utility" className="hidden min-w-0 md:block">
            <ul className="flex items-center gap-5">
              {utilityLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="whitespace-nowrap hover:text-white hover:underline underline-offset-4">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ms-auto flex items-center gap-2">
            <Globe className="size-3.5 opacity-70" aria-hidden />
            <span className="sr-only">{labels.language}</span>
            <LanguageLinks lang={lang} languages={languages} />
          </div>
        </div>
      </div>

      <div className="border-b border-line">
        <div
          className={cn(
            "container-site flex items-center justify-between gap-3 transition-[height] duration-300",
            "h-(--header-full) group-data-[condensed=true]/header:h-(--header-condensed)",
          )}
        >
          <Link href={homeHref} className="min-w-0 shrink rounded focus-visible:outline-2 focus-visible:outline-gold-500" aria-label={labels.home}>
            {logo}
          </Link>

          <NavigationMenu viewport={false} dir={dir} className="hidden xl:flex" aria-label="Main">
            <NavigationMenuList className="gap-0.5">
              {nav.map((item) =>
                item.children?.length ? (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuTrigger
                      className={cn(
                        "h-10 bg-transparent px-3 text-[0.95rem] font-semibold text-royal-900 hover:bg-royal-50 data-open:bg-royal-50",
                        isActive(pathname, item.href) && "text-royal-700 shadow-[inset_0_-2px_0_var(--color-gold-500)]",
                      )}
                    >
                      {item.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="min-w-64 p-2">
                      <ul className="grid gap-0.5">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link href={item.href} className="font-heading text-lg text-royal-800">
                              {item.label}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <li aria-hidden className="mx-2 my-1 h-px bg-line" />
                        {item.children.map((c) => (
                          <li key={c.href}>
                            <NavigationMenuLink asChild data-active={isActive(pathname, c.href) || undefined}>
                              <Link href={c.href} className="text-[0.95rem] text-ink">
                                {c.label}
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "h-10 px-3 text-[0.95rem] font-semibold text-royal-900 hover:bg-royal-50",
                          isActive(pathname, item.href) && "text-royal-700 shadow-[inset_0_-2px_0_var(--color-gold-500)]",
                        )}
                      >
                        {item.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ),
              )}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {donateHref ? (
              <Button
                asChild
                className="h-10 rounded-md bg-gold-500 px-3 text-[0.95rem] font-semibold text-royal-950 shadow-sm hover:bg-gold-400 sm:px-4"
              >
                <Link href={donateHref}>
                  <HeartHandshake className="size-4" aria-hidden />
                  <span className="max-[419px]:sr-only">{labels.donate}</span>
                </Link>
              </Button>
            ) : null}

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="size-10 rounded-md border-royal-200 p-0 text-royal-900 xl:hidden" aria-label={labels.menu}>
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={dir === "rtl" ? "left" : "right"} className="w-[min(22rem,88vw)] gap-0 overflow-y-auto p-0" showCloseButton={false}>
                <SheetHeader className="flex-row items-center justify-between gap-3 border-b border-line bg-royal-900 px-5 py-3 text-white">
                  <SheetTitle className="text-white">{labels.menu}</SheetTitle>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="size-10 text-white hover:bg-white/10 hover:text-white" aria-label={labels.closeMenu}>
                      <X className="size-5" aria-hidden />
                    </Button>
                  </SheetClose>
                </SheetHeader>
                <div className="border-b border-line px-5 py-4">
                  <p className="eyebrow mb-2">{labels.language}</p>
                  <LanguageLinks lang={lang} languages={languages} variant="full" className="flex-wrap gap-2" onNavigate={() => setOpen(false)} />
                </div>
                <nav aria-label={labels.menu} className="px-3 py-3">
                  <ul className="grid gap-0.5">
                    {nav.map((item) => (
                      <li key={item.href}>
                        {item.children?.length ? (
                          <details className="group/d" open={isActive(pathname, item.href) || undefined}>
                            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-md px-2 text-base font-semibold text-royal-900 hover:bg-royal-50 [&::-webkit-details-marker]:hidden">
                              {item.label}
                              <ChevronDown className="size-4 transition-transform group-open/d:rotate-180" aria-hidden />
                            </summary>
                            <ul className="mb-2 ms-2 grid gap-0.5 border-s-2 border-gold-500/50 ps-2">
                              {[{ label: item.label, href: item.href }, ...item.children].map((c, i) => (
                                <li key={`${c.href}-${i}`}>
                                  <Link
                                    href={c.href}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                      "flex min-h-10 items-center rounded-md px-2 text-[0.95rem] text-ink hover:bg-royal-50",
                                      isActive(pathname, c.href) && "font-semibold text-royal-700",
                                    )}
                                  >
                                    {c.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </details>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className="flex min-h-11 items-center rounded-md px-2 text-base font-semibold text-royal-900 hover:bg-royal-50"
                          >
                            {item.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
                {donateHref ? (
                  <div className="mt-auto border-t border-line p-5">
                    <Button asChild className="h-11 w-full rounded-md bg-gold-500 text-base font-semibold text-royal-950 hover:bg-gold-400">
                      <Link href={donateHref} onClick={() => setOpen(false)}>
                        <HeartHandshake className="size-4" aria-hidden />
                        {labels.donate}
                      </Link>
                    </Button>
                  </div>
                ) : null}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
