"use client";

import { Button } from "@/components/ui/Button";
import { openCommandPalette } from "@/components/layout/Header";

/** Button that opens the command palette — usable from server components. */
export function SearchHintButton({ label = "Search the site" }: { label?: string }) {
  return (
    <Button variant="outline" iconLeft="search" onClick={openCommandPalette}>
      {label}
    </Button>
  );
}
