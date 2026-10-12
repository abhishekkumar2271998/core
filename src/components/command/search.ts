import { fuzzyScore } from "@/lib/utils";
import { COMMAND_GROUPS, type CommandItem, type ScoredGroup } from "./types";

/** Max items per group shown when there's no query, to keep the list scannable. */
const EMPTY_QUERY_LIMIT: Partial<Record<CommandItem["group"], number>> = {
  projects: 5,
  posts: 5,
};

/** Best fuzzy score across label (full weight), description and keywords (reduced weight). */
export function scoreItem(query: string, item: CommandItem): number {
  const label = fuzzyScore(query, item.label);
  let secondary = 0;
  if (item.description) secondary = Math.max(secondary, fuzzyScore(query, item.description));
  for (const kw of item.keywords ?? []) secondary = Math.max(secondary, fuzzyScore(query, kw));
  return Math.max(label, secondary * 0.75);
}

/**
 * Filters and ranks commands, returning non-empty groups in a stable order.
 * When querying, groups are ordered by their best match so the most relevant
 * result is always at the top.
 */
export function filterCommands(items: CommandItem[], query: string): ScoredGroup[] {
  const q = query.trim();

  const groups = COMMAND_GROUPS.map((group) => {
    const inGroup = items.filter((item) => item.group === group.id);
    if (!q) {
      const limit = EMPTY_QUERY_LIMIT[group.id];
      return { ...group, items: limit ? inGroup.slice(0, limit) : inGroup, best: 0 };
    }
    const scored = inGroup
      .map((item) => ({ item, score: scoreItem(q, item) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);
    return { ...group, items: scored.map((s) => s.item), best: scored[0]?.score ?? 0 };
  }).filter((group) => group.items.length > 0);

  if (q) groups.sort((a, b) => b.best - a.best);

  return groups.map(({ id, label, items: groupItems }) => ({ id, label, items: groupItems }));
}
