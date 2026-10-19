import type { IconName } from "@/types";

export type CommandGroupId = "navigation" | "projects" | "posts" | "actions";

export const COMMAND_GROUPS: { id: CommandGroupId; label: string }[] = [
  { id: "navigation", label: "Navigation" },
  { id: "projects", label: "Projects" },
  { id: "posts", label: "Blog posts" },
  { id: "actions", label: "Actions" },
];

export interface CommandItem {
  id: string;
  group: CommandGroupId;
  label: string;
  /** Secondary text shown under/next to the label. */
  description?: string;
  /** Extra search terms that aren't displayed. */
  keywords?: string[];
  icon: IconName;
  /** Right-aligned hint, e.g. "↗" for external or a shortcut. */
  hint?: string;
  /** Shows a checkmark (e.g. the active theme). */
  active?: boolean;
  /** Return "keep-open" to leave the palette open after running. */
  perform: () => void | "keep-open";
}

export interface ScoredGroup {
  id: CommandGroupId;
  label: string;
  items: CommandItem[];
}
