# Orthodox Diocese Template

`orthodox-diocese-template` is a sample diocesan website for the Project Orthodox website builder. The brand is "Diocese of St. Example". All names, parishes, clergy, events and documents in it are fictional.

The template is layout only. Text fields hold very short neutral placeholders. Explainer and catechesis material (introductions to Orthodoxy, first visits, etiquette, how-to guides) is left out on purpose, because that is each client's own content.

## Run it

```bash
npm install
npm run dev        # http://localhost:4317/en/
npm run build      # validates content, then writes the static site to out/
npm run preview    # serves out/ on http://localhost:4318
```

The build in `out/` is plain static HTML, CSS and JS and runs on any static host. To serve it from a sub-folder, build with `BASE_PATH=/diocese npm run build`.

## Editing

Everything a client edits lives in `content/`. Each file has a JSON Schema in `schemas/`.

| File | What it holds |
| --- | --- |
| `site.config.json` | Site name, languages, logo, home sections, features, menu, contact, integrations |
| `tokens.json` | Colors, fonts, radius and sizes |
| `diocese.json` | Bishop, optional welcome block, history, structure, parent Church |
| `parishes.json`, `clergy.json` | Directories |
| `events.json`, `news.json`, `bishop-schedule.json` | Calendar, news and letters, the bishop's schedule |
| `ministries.json`, `documents.json`, `funds.json`, `careers.json`, `media.json` | Departments, document library, giving funds, open assignments, gallery |
| `pages.json` | Extra builder pages made of text, image and callout blocks, at any path |
| `i18n/*.json` | Interface text for each language |

- **Home sections:** `homeSections` lists the sections in order. Reorder them or set `enabled` to `false`. `welcome` is an optional short About/Welcome text block.
- **Features:** `features` turns Donate, careers, gallery, livestream and newsletter on or off. `fundTotals` is off by default.
- **Logo:** `logo.style` is `seal`, `kiot`, `square` (uses `logo.image`) or `wordmark`.
- **Languages:** add an entry to `languages` and a matching `content/i18n/<code>.json`. Missing fields fall back to the default language. `direction: "rtl"` is supported.
- **New pages:** add an entry to `pages.json` with any `path`, such as `about/archives`, and link it from `navigation`.

Run `npm run validate` after editing. It checks the schemas, cross references, missing files and house copy rules (no em dashes, no cross glyph, no QR codes).

## Integrations

These are placeholders with `TODO` notes in the code:

- **OrthodoxConnect** (`src/lib/integrations/orthodoxconnect.ts`): event registration deep links, newsletter signup and contact form.
- **Giving** (`src/lib/donations/payments.ts`): one handler each for Stripe, Authorize.net and Tithe.ly. With `paymentProvider: "none"` the form shows a demo notice.
- **Fund totals** (`src/lib/donations/totals.ts`): optional. Totals come only from the payment provider through an endpoint returning `{ raised, donors, updatedAt }`. They are never typed in by hand. If no provider answers, nothing is shown.

## Images and QA

Photos and icons are public domain from Wikimedia Commons, listed in `IMAGE-SOURCES.md`. Everything else is drawn SVG. `npm run make-pdfs` regenerates the sample PDFs. With `npm run preview` running, `npm run qa:fit` checks page fit and scrolling at 360, 390, 768, 1280 and 1440 px in every language, and `npm run qa:screenshots` takes desktop and mobile screenshots.
