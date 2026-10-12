"use client";

import { useEffect } from "react";
import { Icon } from "@/components/icons/Icon";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/primitives";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Report to your error tracker (Sentry, LogRocket, ...) here.
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="animate-fade-up">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-danger/30 bg-danger/10 text-danger">
          <Icon name="alert" className="h-6 w-6" />
        </span>
        <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">Something went wrong</h1>
        <p className="mx-auto mt-4 max-w-md text-pretty text-muted">
          An unexpected error occurred while loading this page. It&apos;s not you — it&apos;s me. Try again, and if it
          keeps happening, let me know.
        </p>
        {error.digest ? (
          <p className="mt-4 font-mono text-xs text-muted">
            Error ID: <code className="rounded bg-surface-2 px-1.5 py-0.5">{error.digest}</code>
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset} iconLeft="zap">
            Try again
          </Button>
          <ButtonLink href="/" variant="outline" iconLeft="arrow-left">
            Back home
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
