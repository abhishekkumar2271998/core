import { Container } from "@/components/ui/primitives";

function Bar({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-surface-2 ${className}`} />;
}

export default function Loading() {
  return (
    <Container className="py-16 sm:py-24" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div aria-hidden className="max-w-2xl space-y-4">
        <Bar className="h-3 w-24" />
        <Bar className="h-10 w-4/5 sm:h-12" />
        <Bar className="h-10 w-3/5 sm:h-12" />
        <div className="space-y-2.5 pt-4">
          <Bar className="h-4 w-full" />
          <Bar className="h-4 w-11/12" />
          <Bar className="h-4 w-2/3" />
        </div>
      </div>
      <div aria-hidden className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="rounded-2xl border bg-surface p-5" style={{ animationDelay: `${i * 80}ms` }}>
            <Bar className="aspect-[16/10] w-full rounded-xl" />
            <Bar className="mt-5 h-5 w-2/3" />
            <Bar className="mt-3 h-3.5 w-full" />
            <Bar className="mt-2 h-3.5 w-4/5" />
            <div className="mt-5 flex gap-2">
              <Bar className="h-5 w-14 rounded-full" />
              <Bar className="h-5 w-16 rounded-full" />
              <Bar className="h-5 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
