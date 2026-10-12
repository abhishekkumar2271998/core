"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { siteConfig } from "@/data/site";
import { skillGroups } from "@/data/skills";
import { experience, totalExperienceYears } from "@/data/experience";
import { projects } from "@/data/projects";
import { useTheme, type Theme } from "@/components/theme/ThemeProvider";
import { cn, formatMonth } from "@/lib/utils";

interface Entry {
  id: number;
  command?: string;
  output: ReactNode;
}

interface CommandContext {
  args: string[];
  setTheme: (t: Theme) => void;
  resolvedTheme: "light" | "dark";
  history: string[];
}

type CommandFn = (ctx: CommandContext) => ReactNode | "__clear__";

const PROMPT_USER = "guest";
const PROMPT_HOST = siteConfig.shortName.toLowerCase();

/* ------------------------------------------------------------- output bits */

function Muted({ children }: { children: ReactNode }) {
  return <span className="text-muted">{children}</span>;
}
function Accent({ children }: { children: ReactNode }) {
  return <span className="text-accent">{children}</span>;
}
function Good({ children }: { children: ReactNode }) {
  return <span className="text-success">{children}</span>;
}
function Bad({ children }: { children: ReactNode }) {
  return <span className="text-danger">{children}</span>;
}

const bar = (level: number) => "█".repeat(level * 2) + "░".repeat(10 - level * 2);

/* ---------------------------------------------------------------- commands */

const descriptions: Record<string, string> = {
  help: "List available commands",
  whoami: "A short introduction",
  skills: "Skills by category · try `skills frontend`",
  projects: "Featured projects",
  experience: "Career at a glance",
  contact: "Ways to reach me",
  theme: "Switch theme · `theme light|dark|system`",
  history: "Show command history",
  clear: "Clear the screen (or Ctrl+L)",
};

const commands: Record<string, CommandFn> = {
  help: () => (
    <div className="space-y-0.5">
      <p>Available commands:</p>
      {Object.entries(descriptions).map(([name, desc]) => (
        <p key={name}>
          <Accent>{name.padEnd(12, " ")}</Accent>
          <Muted>{desc}</Muted>
        </p>
      ))}
      <p className="pt-1">
        <Muted>Tip: use ↑/↓ for history and Tab to autocomplete.</Muted>
      </p>
    </div>
  ),

  whoami: () => (
    <div className="space-y-1">
      <p>
        <Accent>{siteConfig.name}</Accent> — {siteConfig.role}
      </p>
      <p>{siteConfig.tagline}</p>
      <p>
        <Muted>
          {totalExperienceYears()}+ years · {siteConfig.location} · {siteConfig.timezone}
        </Muted>
      </p>
    </div>
  ),

  skills: ({ args }) => {
    const query = args[0]?.toLowerCase();
    const groups = query
      ? skillGroups.filter((g) => g.id.startsWith(query) || g.title.toLowerCase().startsWith(query))
      : skillGroups;
    if (!groups.length) {
      return (
        <p>
          <Bad>skills: unknown category &quot;{args[0]}&quot;.</Bad>{" "}
          <Muted>Try one of: {skillGroups.map((g) => g.id).join(", ")}</Muted>
        </p>
      );
    }
    if (!query) {
      return (
        <div className="space-y-0.5">
          {groups.map((g) => (
            <p key={g.id}>
              <Accent>{g.title.padEnd(16, " ")}</Accent>
              <Muted>{g.skills.slice(0, 4).map((s) => s.name).join(", ")}…</Muted>
            </p>
          ))}
          <p className="pt-1">
            <Muted>Run `skills &lt;category&gt;` for details.</Muted>
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-0.5">
        {groups.map((g) => (
          <div key={g.id}>
            <p className="font-semibold">{g.title}</p>
            {g.skills.map((s) => (
              <p key={s.name}>
                {s.name.padEnd(28, " ")}
                <Accent>{bar(s.level)}</Accent> <Muted>{s.years}y</Muted>
              </p>
            ))}
          </div>
        ))}
      </div>
    );
  },

  projects: () => {
    const list = projects.filter((p) => p.featured).slice(0, 6);
    const shown = list.length ? list : projects.slice(0, 6);
    if (!shown.length) return <Muted>No projects published yet.</Muted>;
    return (
      <div className="space-y-0.5">
        {shown.map((p) => (
          <p key={p.slug}>
            <Muted>{String(p.year)} </Muted>
            <Link href={`/projects/${p.slug}`} className="text-accent underline-offset-2 hover:underline">
              {p.title}
            </Link>{" "}
            <Muted>— {p.summary}</Muted>
          </p>
        ))}
        <p className="pt-1">
          <Muted>
            See everything at{" "}
            <Link href="/projects" className="underline underline-offset-2">
              /projects
            </Link>
          </Muted>
        </p>
      </div>
    );
  },

  experience: () => (
    <div className="space-y-0.5">
      {experience.map((e) => (
        <p key={e.id}>
          <Muted>{`${formatMonth(e.start)} – ${formatMonth(e.end)}`.padEnd(22, " ")}</Muted>
          <Accent>{e.role}</Accent> @ {e.company}
        </p>
      ))}
    </div>
  ),

  contact: () => (
    <div className="space-y-0.5">
      {siteConfig.socials.map((s) => (
        <p key={s.platform}>
          <Accent>{s.label.padEnd(14, " ")}</Accent>
          <a href={s.href} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
            {s.handle ?? s.href}
          </a>
        </p>
      ))}
      <p className="pt-1">
        <Good>{siteConfig.availability.message}.</Good>
      </p>
    </div>
  ),

  theme: ({ args, setTheme, resolvedTheme }) => {
    const target = args[0]?.toLowerCase();
    if (!target) {
      const next: Theme = resolvedTheme === "dark" ? "light" : "dark";
      setTheme(next);
      return <Good>Theme switched to {next}.</Good>;
    }
    if (target === "light" || target === "dark" || target === "system") {
      setTheme(target);
      return <Good>Theme set to {target}.</Good>;
    }
    return <Bad>theme: expected light, dark or system.</Bad>;
  },

  history: ({ history }) =>
    history.length ? (
      <div>
        {history.map((h, i) => (
          <p key={i}>
            <Muted>{String(i + 1).padStart(3, " ")}</Muted> {h}
          </p>
        ))}
      </div>
    ) : (
      <Muted>No history yet.</Muted>
    ),

  clear: () => "__clear__",

  /* hidden easter eggs */
  ls: () => (
    <p>
      <Accent>about/</Accent> <Accent>projects/</Accent> <Accent>blog/</Accent> resume.pdf secrets.txt
    </p>
  ),
  "cat": ({ args }) =>
    args[0] === "secrets.txt" ? (
      <p>🍞 The secret ingredient is patience (and a 72-hour cold ferment).</p>
    ) : (
      <Bad>cat: {args[0] ?? "missing operand"}: No such file</Bad>
    ),
  sudo: () => <Bad>Nice try. This incident will be reported to the design team.</Bad>,
  echo: ({ args }) => <p>{args.join(" ")}</p>,
  date: () => <p>{new Date().toString()}</p>,
  hello: () => <p>👋 Hey there! Type `help` to look around.</p>,
};

const completable = Object.keys(descriptions);

function welcome(): Entry {
  return {
    id: 0,
    output: (
      <div className="space-y-1">
        <p>
          Welcome to <Accent>{PROMPT_HOST}.sh</Accent> v2.6.0 — an interactive résumé.
        </p>
        <p>
          <Muted>
            Type <span className="text-fg">help</span> to see what you can do.
          </Muted>
        </p>
      </div>
    ),
  };
}

/* --------------------------------------------------------------- component */

export function InteractiveTerminal({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [entries, setEntries] = useState<Entry[]>(() => [welcome()]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const nextId = useRef(1);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  const run = (raw: string) => {
    const trimmed = raw.trim();
    const id = nextId.current++;
    if (!trimmed) {
      setEntries((prev) => [...prev, { id, command: "", output: null }]);
      return;
    }
    const [name, ...args] = trimmed.split(/\s+/);
    const nextHistory = [...history, trimmed].slice(-50);
    setHistory(nextHistory);
    setCursor(null);

    const fn = commands[name.toLowerCase()];
    const output = fn ? (
      fn({ args, setTheme, resolvedTheme, history: nextHistory })
    ) : (
      <p>
        <Bad>command not found: {name}</Bad> <Muted>— type `help` for a list of commands.</Muted>
      </p>
    );

    if (output === "__clear__") {
      setEntries([]);
      return;
    }
    setEntries((prev) => [...prev, { id, command: trimmed, output }]);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    run(input);
    setInput("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      if (!history.length) return;
      e.preventDefault();
      const next = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setInput(history[next]);
    } else if (e.key === "ArrowDown") {
      if (cursor === null) return;
      e.preventDefault();
      const next = cursor + 1;
      if (next >= history.length) {
        setCursor(null);
        setInput("");
      } else {
        setCursor(next);
        setInput(history[next]);
      }
    } else if (e.key === "Tab") {
      const value = input.trim().toLowerCase();
      if (!value || value.includes(" ")) return;
      const matches = completable.filter((c) => c.startsWith(value));
      e.preventDefault();
      if (matches.length === 1) {
        setInput(matches[0] + " ");
      } else if (matches.length > 1) {
        setEntries((prev) => [
          ...prev,
          { id: nextId.current++, command: input, output: <Muted>{matches.join("   ")}</Muted> },
        ]);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
    } else if (e.key === "c" && e.ctrlKey && !window.getSelection()?.toString()) {
      e.preventDefault();
      setEntries((prev) => [...prev, { id: nextId.current++, command: `${input}^C`, output: null }]);
      setInput("");
    }
  };

  const focusInput = () => {
    // Don't steal focus when the user is selecting text or clicking a link.
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus({ preventScroll: true });
  };

  const quick = ["help", "whoami", "skills", "projects", "contact", "theme"];

  return (
    <div className={cn("relative", className)}>
      <div aria-hidden className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-accent/20 via-fuchsia-500/10 to-amber-400/10 blur-2xl" />
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/80 px-4 py-3">
          <span aria-hidden className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span aria-hidden className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span aria-hidden className="h-3 w-3 rounded-full bg-[#28c840]" />
          <p className="ml-3 font-mono text-xs text-zinc-400">
            {PROMPT_USER}@{PROMPT_HOST}: ~
          </p>
          <button
            type="button"
            onClick={() => setEntries([])}
            className="ml-auto rounded-md px-2 py-1 font-mono text-[11px] text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
          >
            clear
          </button>
        </div>

        {/* Screen */}
        <div
          ref={scrollRef}
          onClick={focusInput}
          className="h-[380px] cursor-text overflow-y-auto p-5 font-mono text-[13px] leading-6 sm:h-[420px] [&_.text-muted]:text-zinc-400 [&_.text-accent]:text-indigo-300 [&_.text-success]:text-emerald-400 [&_.text-danger]:text-rose-400 [&_.text-fg]:text-zinc-100"
        >
          <div role="log" aria-live="polite" aria-label="Terminal output" className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id}>
                {entry.command !== undefined ? <PromptLine command={entry.command} /> : null}
                {entry.output ? <div className="whitespace-pre-wrap break-words">{entry.output}</div> : null}
              </div>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-3 flex items-center gap-2">
            <PromptPrefix />
            <label htmlFor="terminal-input" className="sr-only">
              Terminal command
            </label>
            <input
              id="terminal-input"
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setCursor(null);
              }}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="send"
              className="min-w-0 flex-1 bg-transparent text-zinc-100 caret-indigo-400 outline-none placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="type a command…"
            />
          </form>
        </div>

        {/* Quick commands */}
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto border-t border-zinc-800 bg-zinc-900/60 px-4 py-3">
          <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-zinc-500">Try</span>
          {quick.map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => {
                run(cmd);
                inputRef.current?.focus({ preventScroll: true });
              }}
              className="shrink-0 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 font-mono text-xs text-zinc-300 transition-colors hover:border-indigo-400/50 hover:text-white"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PromptPrefix() {
  return (
    <span aria-hidden className="shrink-0 select-none">
      <span className="text-emerald-400">{PROMPT_USER}</span>
      <span className="text-zinc-500">@</span>
      <span className="text-indigo-300">{PROMPT_HOST}</span>
      <span className="text-zinc-500">:~$</span>
    </span>
  );
}

function PromptLine({ command }: { command: string }) {
  return (
    <p className="flex gap-2">
      <PromptPrefix />
      <span className="break-all text-zinc-100">{command}</span>
    </p>
  );
}
