"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type ActionState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowRight } from "lucide-react";
import { OAuthButtons } from "../oauth-buttons";

export function SignInForm({ next, initialError }: { next: string; initialError?: string | null }) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    signIn,
    undefined,
  );

  const errorMessage = state?.error ?? initialError ?? null;

  return (
    <div className="space-y-6">
      <OAuthButtons next={next} />

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="next" value={next} />

        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="you@startup.com"
          autoComplete="email"
          required
        />
        <Field
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        {errorMessage && (
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
            <AlertDescription className="text-xs text-red-400">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="group w-full"
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <>
              Sign in
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Need an account?{" "}
        <Link
          href="/auth/sign-up"
          className="text-foreground/80 underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  ...rest
}: {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70"
      >
        {label}
      </label>
      <Input
        id={name}
        name={name}
        {...rest}
        className="font-mono text-sm"
      />
    </div>
  );
}
