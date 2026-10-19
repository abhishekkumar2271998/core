"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TypingRoleProps {
  words: string[];
  className?: string;
  /** ms per typed character */
  typeSpeed?: number;
  /** ms per deleted character */
  deleteSpeed?: number;
  /** ms to hold a fully typed word */
  hold?: number;
}

/**
 * Types and deletes a rotating list of words. Screen readers get the full,
 * static list via a visually hidden span so they aren't spammed with updates.
 */
export function TypingRole({ words, className, typeSpeed = 70, deleteSpeed = 35, hold = 1800 }: TypingRoleProps) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(words[0] ?? "");
  const [deleting, setDeleting] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (words.length < 2) return;
    const current = words[index % words.length];

    if (reduced) {
      const id = setTimeout(() => {
        const next = (index + 1) % words.length;
        setIndex(next);
        setText(words[next]);
      }, hold + 1200);
      return () => clearTimeout(id);
    }

    let delay = deleting ? deleteSpeed : typeSpeed;
    if (!deleting && text === current) delay = hold;
    if (deleting && text === "") delay = 300;

    const id = setTimeout(() => {
      if (!deleting && text === current) {
        setDeleting(true);
      } else if (deleting && text === "") {
        setDeleting(false);
        setIndex((i) => (i + 1) % words.length);
      } else if (deleting) {
        setText(current.slice(0, text.length - 1));
      } else {
        setText(current.slice(0, text.length + 1));
      }
    }, delay);
    return () => clearTimeout(id);
  }, [text, deleting, index, words, reduced, typeSpeed, deleteSpeed, hold]);

  return (
    <span className={cn("inline-flex items-baseline", className)}>
      <span className="sr-only">{words.join(", ")}</span>
      <span aria-hidden className="text-gradient">
        {text}
        {/* keeps line height stable when the word is empty */}
        <span className="inline-block w-0">&#8203;</span>
      </span>
      <span
        aria-hidden
        className="ml-1 inline-block h-[0.9em] w-[3px] translate-y-[0.1em] animate-blink rounded-full bg-accent"
      />
    </span>
  );
}
