import "../globals.css";
import { siteConfig } from "@/lib/content";
import { asset } from "@/lib/links";
import { tokenStyle } from "@/lib/tokens";

export default function RootRedirectLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={siteConfig.defaultLanguage} style={tokenStyle(siteConfig.defaultLanguage) as React.CSSProperties}>
      <head>
        <noscript>
          <meta httpEquiv="refresh" content={`0; url=${asset(`/${siteConfig.defaultLanguage}/`)}`} />
        </noscript>
      </head>
      <body className="min-h-dvh bg-royal-950 text-white">{children}</body>
    </html>
  );
}
