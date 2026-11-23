import "../globals.css";
import { siteConfig } from "@/lib/content";
import { tokenStyle } from "@/lib/tokens";

export default function RootRedirectLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={siteConfig.defaultLanguage} style={tokenStyle(siteConfig.defaultLanguage) as React.CSSProperties}>
      <body className="min-h-dvh bg-royal-950 text-white">{children}</body>
    </html>
  );
}
