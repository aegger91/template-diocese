import { EpiscopalSeal, KiotFrame } from "@/components/orthodox/emblems";
import { siteConfig } from "@/lib/content";
import { loc } from "@/lib/i18n";
import { asset } from "@/lib/links";
import { cn } from "@/lib/utils";

/**
 * Logo, chosen by logo.style in site.config.json: "seal" | "kiot" | "square" | "wordmark".
 * Sizes follow the header's condensed state through the `header` group.
 */
export function Logo({
  lang,
  variant = "header",
  idPrefix,
}: {
  lang: string;
  variant?: "header" | "footer";
  idPrefix: string;
}) {
  const { logo } = siteConfig;
  const name = loc(siteConfig.siteName, lang);
  const tagline = loc(siteConfig.siteTagline, lang);
  const onDark = variant === "footer";
  const markSize =
    variant === "header"
      ? "size-11 shrink-0 sm:size-12 xl:size-14 group-data-[condensed=true]/header:size-10"
      : "size-20";

  let mark: React.ReactNode = null;
  if (logo.style === "seal") {
    mark = <EpiscopalSeal text={loc(logo.sealText, lang)} year={logo.sealYear} idPrefix={idPrefix} className={cn(markSize, "shrink-0")} title={name} />;
  } else if (logo.style === "kiot") {
    mark = <KiotFrame className={cn(markSize, "w-auto shrink-0")} />;
  } else if (logo.style === "square" && logo.image) {
    // eslint-disable-next-line @next/next/no-img-element
    mark = <img src={asset(logo.image)} alt="" className={cn(markSize, "shrink-0 rounded-sm object-contain")} />;
  }

  return (
    <span className="flex min-w-0 items-center gap-2.5 sm:gap-3">
      {mark}
      <span className={cn("flex min-w-0 flex-col", logo.style === "wordmark" && "border-s-2 border-gold-500 ps-3")}>
        <span
          className={cn(
            "display-text leading-snug text-balance",
            onDark ? "text-xl text-white" : "text-[0.95rem] text-royal-900 sm:text-lg lg:text-xl",
            logo.style === "wordmark" && !onDark && "text-lg sm:text-xl lg:text-2xl",
          )}
        >
          {name}
        </span>
        <span
          className={cn(
            "mt-0.5 hidden text-xs leading-snug tracking-wide text-pretty sm:block",
            onDark ? "text-royal-200" : "text-muted-ink group-data-[condensed=true]/header:hidden",
          )}
        >
          {tagline}
        </span>
      </span>
    </span>
  );
}
