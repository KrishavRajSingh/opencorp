import { SignInForm } from "./form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/dashboard";
  const error =
    params.error === "oauth"
      ? "Google sign-in didn't complete. Try again or use email + password."
      : null;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="font-mono text-sm text-brand/70">
          &gt; Sign in
        </p>
        <h1 className="font-heading text-xl tracking-tight text-foreground">
          Welcome back<span className="ml-1 inline-block w-[0.55em] -mb-0.5 h-[1em] translate-y-0.5 bg-brand animate-blink align-baseline" />
        </h1>
        <p className="text-sm text-muted-foreground">
          Pick up where you left off.
        </p>
      </div>

      <SignInForm next={next} initialError={error} />
    </div>
  );
}
