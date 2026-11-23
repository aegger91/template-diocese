import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { DonateForm } from "@/components/donate/donate-form";
import { Ornament } from "@/components/orthodox/cross";
import { PageHeader } from "@/components/site/page-parts";
import { fundsData, siteConfig } from "@/lib/content";
import { getDictionary, loc } from "@/lib/i18n";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDictionary(lang).donate.title };
}

export default async function DonatePage({ params }: Props) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const d = t.donate;
  const { contact, donations } = siteConfig;
  const funds = fundsData.funds.map((f) => ({ id: f.id, name: loc(f.name, lang), description: loc(f.description, lang) }));

  return (
    <>
      <PageHeader lang={lang} title={d.title} intro={d.intro} crumbs={[{ label: d.title, href: "/donate/" }]} />
      <div className="container-site grid gap-12 py-10 sm:py-14 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <section className="mb-10 max-w-3xl">
            <h2 className="text-3xl text-royal-900">{loc(fundsData.appeal.title, lang)}</h2>
            <p className="mt-3 text-lg leading-relaxed text-ink">{loc(fundsData.appeal.text, lang)}</p>
            <Ornament className="mt-6 max-w-56" />
          </section>
          <DonateForm
            funds={funds}
            defaultFund={fundsData.funds.find((f) => f.isDefault)?.id ?? funds[0].id}
            amounts={donations.suggestedAmounts}
            currency={donations.currency}
            lang={lang}
            showTotals={siteConfig.features.fundTotals}
            labels={{
              chooseFund: d.chooseFund,
              frequency: d.frequency,
              oneTime: d.oneTime,
              monthly: d.monthly,
              amount: d.amount,
              otherAmount: d.otherAmount,
              yourDetails: d.yourDetails,
              name: d.name,
              email: d.email,
              inMemory: d.inMemory,
              give: d.give,
              demoNotice: d.demoNotice,
              notConfigured: d.notConfigured,
              secure: d.secure,
              summary: d.summary,
              perMonth: d.perMonth,
              invalidEmail: d.invalidEmail,
              raised: d.raised,
              donors: d.donors,
              updated: d.totalsUpdated,
              sample: d.sampleTotals,
            }}
          />
        </div>
        <aside className="h-fit space-y-5">
          <div className="frame-official bg-white p-6">
            <p className="flex items-center gap-2 font-heading text-2xl text-royal-900">
              <Mail className="size-5 text-gold-700" aria-hidden />
              {d.byMail}
            </p>
            <p className="mt-2 text-sm text-muted-ink">{d.byMailText}</p>
            <address className="mt-4 not-italic leading-relaxed text-ink">
              {loc(contact.officeName, lang)}
              <br />
              {contact.street}
              <br />
              {contact.city}, {contact.region} {contact.postalCode}
            </address>
          </div>
        </aside>
      </div>
    </>
  );
}
