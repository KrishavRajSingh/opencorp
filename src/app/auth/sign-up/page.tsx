import { SignUpForm } from "./form";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/dashboard";

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="font-mono text-sm text-brand/70">
          &gt; Create account
        </p>
        <h1 className="font-heading text-xl tracking-tight text-foreground">
          Open an account<span className="ml-1 inline-block w-[0.55em] -mb-0.5 h-[1em] translate-y-0.5 bg-brand animate-blink align-baseline" />
        </h1>
        <p className="text-sm text-muted-foreground">
          Free. No team size, no pricing tier.
        </p>
      </div>

      <SignUpForm next={next} />
    </div>
  );
}
