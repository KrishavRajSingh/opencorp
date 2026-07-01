import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How OpenCorp collects, uses, and protects your information when you use the service.",
};

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <main className="flex-1 pt-20">
        <article className="mx-auto max-w-3xl px-6 pb-24 pt-12 sm:pt-20">
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
              Legal
            </p>
            <h1 className="mt-3 font-heading text-4xl leading-tight tracking-tight sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Last updated: June 30, 2026
            </p>
          </header>

          <div className="mt-12 space-y-10 text-[15px] leading-7 text-foreground/85">
            <Section number="1" title="What OpenCorp is">
              <p>
                OpenCorp is an autonomous research agent for early-stage builders.
                You give it a product URL or description, and it runs market
                research, identifies likely users, and produces a report of
                competitors and relevant conversations. This policy explains what
                we collect when you use that service.
              </p>
            </Section>

            <Section number="2" title="Information you give us">
              <p>
                When you create an account, we collect the information you
                provide through Supabase Auth:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-foreground/80">
                <li>
                  <span className="text-foreground">Email and password</span>{" "}
                  if you sign up with email.
                </li>
                <li>
                  <span className="text-foreground">Google profile</span> (name,
                  email, avatar URL) if you sign in with Google OAuth.
                </li>
              </ul>
              <p>
                When you run a research session, we collect the{" "}
                <span className="text-foreground">
                  product URL or description and any text
                </span>{" "}
                you submit, plus everything the agent produces: the product
                analysis, the competitor list, the Hacker News threads it
                surfaces, and the search queries it used.
              </p>
            </Section>

            <Section number="3" title="Information collected automatically">
              <ul className="list-disc space-y-2 pl-6 text-foreground/80">
                <li>
                  <span className="text-foreground">Auth cookies</span> issued
                  by Supabase to keep you signed in.
                </li>
                <li>
                  <span className="text-foreground">Server logs</span> (request
                  paths, status codes, timestamps) for reliability and security.
                </li>
                <li>
                  <span className="text-foreground">Vercel Analytics</span> —
                  aggregated page views and performance metrics. No personally
                  identifiable information is collected by Vercel on this site.
                </li>
                <li>
                  <span className="text-foreground">Umami</span> (optional, only
                  if configured for this deployment) — a privacy-friendly
                  analytics tool that does not set tracking cookies.
                </li>
                <li>
                  <span className="text-foreground">Mastra observability</span>{" "}
                  — agent run traces, token usage, and model cost data stored
                  in DuckDB on our infrastructure. Used to monitor reliability
                  and catch failures; not used to profile individual users.
                </li>
              </ul>
            </Section>

            <Section number="4" title="How we use your information">
              <p>We use the data above to:</p>
              <ul className="list-disc space-y-2 pl-6 text-foreground/80">
                <li>Authenticate you and keep your account secure.</li>
                <li>
                  Run the research pipeline and return the report to your
                  dashboard.
                </li>
                <li>
                  Send you operational emails (sign-in confirmations, security
                  alerts). We don&rsquo;t send marketing email.
                </li>
                <li>
                  Diagnose outages, prevent abuse, and improve the product.
                </li>
              </ul>
              <p className="text-foreground/90">
                <span className="text-foreground">We do not sell your data.</span>{" "}
                We do not share it with advertisers.
              </p>
            </Section>

            <Section number="5" title="AI processing">
              <p>
                To generate a report, OpenCorp sends the following to our
                model provider (OpenRouter, model{" "}
                <span className="font-mono text-foreground">google/gemini-2.5-flash-lite</span>):
              </p>
              <ul className="list-disc space-y-2 pl-6 text-foreground/80">
                <li>
                  The product URL or description you submitted, and the text
                  scraped from that URL server-side.
                </li>
                <li>The product analysis your agent has already produced.</li>
              </ul>
              <p>
                OpenRouter processes the request and returns the result. We
                additionally use{" "}
                <span className="text-foreground">Algolia</span> to search
                Hacker News for related discussions. OpenRouter and Algolia act
                as processors for the queries we send them.
              </p>
            </Section>

            <Section number="6" title="Public share links">
              <p>
                Any research session can be shared via a public URL of the
                form{" "}
                <span className="font-mono text-foreground">
                  /share/&lt;id&gt;
                </span>
                . The link itself is the only access control — anyone with the
                link can view the full report. Don&rsquo;t share a link if you
                don&rsquo;t want the report public. If you delete the
                underlying session, existing share links stop working.
              </p>
            </Section>

            <Section number="7" title="Storage and retention">
              <p>
                Research sessions and account data are stored in{" "}
                <span className="text-foreground">Supabase</span> (managed
                Postgres). We retain your account data for as long as your
                account is active. If you would like your data deleted, email{" "}
                <a
                  href="mailto:support@opencorp.live"
                  className="text-foreground underline decoration-brand/60 underline-offset-4 hover:decoration-brand"
                >
                  support@opencorp.live
                </a>{" "}
                and we will remove it within 30 days.
              </p>
            </Section>

            <Section number="8" title="Your rights">
              <p>You can:</p>
              <ul className="list-disc space-y-2 pl-6 text-foreground/80">
                <li>Access the data we hold about you.</li>
                <li>Request correction or deletion of your data.</li>
                <li>Export your research sessions.</li>
                <li>Close your account at any time.</li>
              </ul>
              <p>
                To exercise any of these, email{" "}
                <a
                  href="mailto:support@opencorp.live"
                  className="text-foreground underline decoration-brand/60 underline-offset-4 hover:decoration-brand"
                >
                  support@opencorp.live
                </a>
                .
              </p>
            </Section>

            <Section number="9" title="Third parties we use">
              <ul className="list-disc space-y-2 pl-6 text-foreground/80">
                <li>
                  <span className="text-foreground">Supabase</span> — auth and
                  database hosting.
                </li>
                <li>
                  <span className="text-foreground">Vercel</span> — application
                  hosting and analytics.
                </li>
                <li>
                  <span className="text-foreground">OpenRouter</span> — LLM
                  inference.
                </li>
                <li>
                  <span className="text-foreground">Algolia</span> — Hacker
                  News search (via the public HN/Algolia index).
                </li>
                <li>
                  <span className="text-foreground">Umami</span> — privacy
                  analytics (optional).
                </li>
              </ul>
            </Section>

            <Section number="10" title="Changes to this policy">
              <p>
                If we make material changes, we&rsquo;ll update the date at
                the top of this page. Continued use of OpenCorp after a change
                indicates acceptance of the updated policy.
              </p>
            </Section>

            <Section number="11" title="Contact">
              <p>
                Questions, concerns, or data requests:{" "}
                <a
                  href="mailto:support@opencorp.live"
                  className="text-foreground underline decoration-brand/60 underline-offset-4 hover:decoration-brand"
                >
                  support@opencorp.live
                </a>
                .
              </p>
            </Section>
          </div>
        </article>
      </main>
    </MarketingShell>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-brand">{number}</span>
        <h2 className="font-heading text-xl tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
