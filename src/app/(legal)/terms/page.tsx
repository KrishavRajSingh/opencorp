import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing-shell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The rules and conditions for using OpenCorp, including acceptable use, AI-generated output, and public share links.",
};

export default function TermsPage() {
  return (
    <MarketingShell>
      <main className="flex-1 pt-20">
        <article className="mx-auto max-w-3xl px-6 pb-24 pt-12 sm:pt-20">
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
              Legal
            </p>
            <h1 className="mt-3 font-heading text-4xl leading-tight tracking-tight sm:text-5xl">
              Terms of Service
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Last updated: June 30, 2026
            </p>
          </header>

          <div className="mt-12 space-y-10 text-[15px] leading-7 text-foreground/85">
            <Section number="1" title="The service">
              <p>
                OpenCorp (&ldquo;we,&rdquo; &ldquo;us&rdquo;) provides an
                autonomous research agent that takes a product URL or
                description, identifies potential users and competitors, and
                produces a research report. By using the service at
                opencorp.live, signing in, or running a research session, you
                agree to these terms.
              </p>
            </Section>

            <Section number="2" title="Your account">
              <p>
                You must provide accurate information when you sign up and
                keep your credentials secure. You are responsible for all
                activity that occurs under your account. Tell us promptly at{" "}
                <a
                  href="mailto:krishavrajsingh@gmail.com"
                  className="text-foreground underline decoration-brand/60 underline-offset-4 hover:decoration-brand"
                >
                  krishavrajsingh@gmail.com
                </a>{" "}
                if you believe your account has been compromised.
              </p>
            </Section>

            <Section number="3" title="Acceptable use">
              <p>You agree not to:</p>
              <ul className="list-disc space-y-2 pl-6 text-foreground/80">
                <li>
                  Use OpenCorp to harass, defame, or target individuals,
                  including by submitting their personal information to the
                  research pipeline.
                </li>
                <li>
                  Submit content that is illegal, infringing, or that you
                  don&rsquo;t have the right to share.
                </li>
                <li>
                  Attempt to abuse, overload, scrape, or reverse-engineer the
                  research pipeline or its underlying models.
                </li>
                <li>
                  Use automated tooling to run an unreasonable number of
                  sessions or to bypass usage limits.
                </li>
                <li>
                  Use OpenCorp to generate spam, mass unsolicited outreach, or
                  content designed to deceive.
                </li>
              </ul>
            </Section>

            <Section number="4" title="Your content">
              <p>
                You own the inputs you submit to OpenCorp (your product URL,
                description, and any other text you provide). You grant us a
                limited, worldwide, non-exclusive license to process that
                content for the purpose of operating the service for you —
                running the agent, generating your report, caching it in your
                dashboard, and producing a public share link if you create
                one.
              </p>
              <p>
                You own the report that OpenCorp produces for your session.
                We retain a copy in our database to display it to you and to
                power the share link.
              </p>
            </Section>

            <Section number="5" title="AI-generated output">
              <p>
                Reports from OpenCorp are produced by an AI agent and may
                contain errors, omissions, or outdated information. They are
                provided for research and ideation. They are{" "}
                <span className="text-foreground">not</span> professional
                advice — legal, financial, medical, or otherwise. Don&rsquo;t
                rely on a report as a substitute for professional judgment,
                and verify anything important before acting on it.
              </p>
              <p>
                We don&rsquo;t warrant that the output is accurate, complete,
                or fit for any particular purpose.
              </p>
            </Section>

            <Section number="6" title="Public share links">
              <p>
                If you create a public share link for a research session,
                anyone who has that link can view the report. The link is the
                only access control. We may rate-limit or block share links
                that appear to be abused. Deleting the underlying session
                invalidates existing share links.
              </p>
            </Section>

            <Section number="7" title="Termination">
              <p>
                You can stop using OpenCorp at any time and close your account
                by emailing{" "}
                <a
                  href="mailto:krishavrajsingh@gmail.com"
                  className="text-foreground underline decoration-brand/60 underline-offset-4 hover:decoration-brand"
                >
                  krishavrajsingh@gmail.com
                </a>
                . We may suspend or terminate accounts that violate these
                terms or that abuse the service.
              </p>
            </Section>

            <Section number="8" title="No warranty; limitation of liability">
              <p>
                The service is provided{" "}
                <span className="text-foreground">&ldquo;as is&rdquo;</span>{" "}
                and{" "}
                <span className="text-foreground">
                  &ldquo;as available,&rdquo;
                </span>{" "}
                without warranties of any kind, express or implied, including
                the implied warranties of merchantability, fitness for a
                particular purpose, and non-infringement.
              </p>
              <p>
                To the maximum extent permitted by law, our total liability
                for any claim arising out of or relating to the service will
                not exceed the amount you paid us (if any) in the twelve
                months before the claim. We will not be liable for indirect,
                incidental, special, consequential, or punitive damages.
              </p>
            </Section>

            <Section number="9" title="Changes to these terms">
              <p>
                We may update these terms from time to time. We&rsquo;ll post
                the updated version here and revise the date at the top.
                Continued use of OpenCorp after a change indicates acceptance
                of the updated terms.
              </p>
            </Section>

            <Section number="10" title="Contact">
              <p>
                Questions about these terms:{" "}
                <a
                  href="mailto:krishavrajsingh@gmail.com"
                  className="text-foreground underline decoration-brand/60 underline-offset-4 hover:decoration-brand"
                >
                  krishavrajsingh@gmail.com
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
