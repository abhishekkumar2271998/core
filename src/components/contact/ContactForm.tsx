"use client";

import { useId, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/utils";
import {
  CONTACT_BUDGETS,
  CONTACT_LIMITS,
  CONTACT_SUBJECTS,
  validateContact,
  validateContactField,
  type ContactErrors,
  type ContactPayload,
} from "@/lib/validation";

type Status = "idle" | "submitting" | "success" | "error";

type FormValues = Required<ContactPayload>;

const INITIAL: FormValues = {
  name: "",
  email: "",
  subject: CONTACT_SUBJECTS[0],
  budget: "",
  message: "",
  website: "",
};

interface ApiResponse {
  ok: boolean;
  message?: string;
  error?: string;
  errors?: ContactErrors;
}

const inputClasses =
  "block w-full rounded-xl border bg-bg px-4 py-3 text-sm text-fg shadow-sm transition placeholder:text-muted/70 hover:border-fg/20 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/15";

/* -------------------------------------------------------------- Field shell */

function Field({
  id,
  label,
  error,
  hint,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
          {optional ? <span className="ml-1.5 text-xs font-normal text-muted">(optional)</span> : null}
        </label>
        {hint}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-xs text-danger animate-fade-in">
          <Icon name="alert" className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------------- Component */

export function ContactForm() {
  const uid = useId();
  const ids = {
    name: `${uid}-name`,
    email: `${uid}-email`,
    subject: `${uid}-subject`,
    budget: `${uid}-budget`,
    message: `${uid}-message`,
    website: `${uid}-website`,
  };

  const [values, setValues] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactPayload, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const messageLength = values.message.trim().length;
  const nearLimit = messageLength > CONTACT_LIMITS.messageMax * 0.9;

  function update<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateContactField(field, value) }));
    }
  }

  function onChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const field = e.target.name as keyof FormValues;
    update(field, e.target.value);
  }

  function onBlur(field: keyof ContactPayload) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateContactField(field, values[field]) }));
  }

  function focusFirstError(errs: ContactErrors) {
    const order: (keyof ContactPayload)[] = ["name", "email", "subject", "budget", "message"];
    const first = order.find((f) => errs[f]);
    if (!first) return;
    const el = formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`);
    el?.focus();
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const result = validateContact(values);
    if (!result.ok) {
      setErrors(result.errors);
      setTouched({ name: true, email: true, subject: true, budget: true, message: true });
      focusFirstError(result.errors);
      return;
    }

    setStatus("submitting");
    setServerMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => ({ ok: false }))) as ApiResponse;

      if (res.ok && data.ok) {
        setStatus("success");
        setServerMessage(data.message ?? "Thanks! Your message is on its way.");
        setValues(INITIAL);
        setTouched({});
        setErrors({});
      } else {
        if (data.errors) {
          setErrors(data.errors);
          focusFirstError(data.errors);
        }
        setStatus("error");
        setServerMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setServerMessage("Network error — check your connection and try again.");
    } finally {
      requestAnimationFrame(() => statusRef.current?.focus());
    }
  }

  const describedBy = (field: keyof ContactPayload, extra?: string) =>
    [errors[field] ? `${ids[field]}-error` : null, extra].filter(Boolean).join(" ") || undefined;

  if (status === "success") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="flex flex-col items-center rounded-2xl border bg-surface px-6 py-14 text-center animate-scale-in focus:outline-none"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <Icon name="check" className="h-7 w-7" strokeWidth={2.25} />
        </span>
        <h3 className="mt-5 text-xl font-semibold tracking-tight">Message sent</h3>
        <p className="mt-2 max-w-sm text-sm text-muted">
          {serverMessage} I usually reply within one or two business days.
        </p>
        <Button variant="outline" className="mt-8" iconLeft="send" onClick={() => setStatus("idle")}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-6" aria-describedby={`${uid}-required`}>
      <p id={`${uid}-required`} className="sr-only">
        Name, email and message are required.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={ids.name} label="Name" error={errors.name}>
          <input
            id={ids.name}
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            required
            maxLength={CONTACT_LIMITS.nameMax}
            value={values.name}
            onChange={onChange}
            onBlur={() => onBlur("name")}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy("name")}
            className={inputClasses}
          />
        </Field>
        <Field id={ids.email} label="Email" error={errors.email}>
          <input
            id={ids.email}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="jane@company.com"
            required
            maxLength={CONTACT_LIMITS.emailMax}
            value={values.email}
            onChange={onChange}
            onBlur={() => onBlur("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("email")}
            className={inputClasses}
          />
        </Field>
      </div>

      <Field id={ids.subject} label="What's this about?" error={errors.subject}>
        <div className="relative">
          <select
            id={ids.subject}
            name="subject"
            value={values.subject}
            onChange={onChange}
            onBlur={() => onBlur("subject")}
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={describedBy("subject")}
            className={cn(inputClasses, "cursor-pointer appearance-none pr-10")}
          >
            {CONTACT_SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Icon
            name="chevron-down"
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          />
        </div>
      </Field>

      <fieldset aria-describedby={describedBy("budget")}>
        <legend className="mb-2 text-sm font-medium text-fg">
          Budget <span className="ml-1 text-xs font-normal text-muted">(optional)</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {CONTACT_BUDGETS.map((b) => {
            const checked = values.budget === b;
            return (
              <label
                key={b}
                className={cn(
                  "cursor-pointer select-none rounded-full border px-3.5 py-1.5 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-bg",
                  checked
                    ? "border-accent bg-accent/10 font-medium text-accent"
                    : "bg-surface text-muted hover:border-fg/20 hover:text-fg",
                )}
              >
                <input
                  type="radio"
                  name="budget"
                  value={b}
                  checked={checked}
                  onChange={onChange}
                  onClick={() => {
                    // Clicking a selected chip again clears the (optional) choice.
                    if (checked) update("budget", "");
                  }}
                  className="sr-only"
                />
                {checked ? <Icon name="check" className="-ml-0.5 mr-1 inline h-3.5 w-3.5" /> : null}
                {b}
              </label>
            );
          })}
        </div>
        {errors.budget ? (
          <p id={`${ids.budget}-error`} className="mt-2 text-xs text-danger">
            {errors.budget}
          </p>
        ) : null}
      </fieldset>

      <Field
        id={ids.message}
        label="Message"
        error={errors.message}
        hint={
          <span
            id={`${ids.message}-count`}
            aria-live="polite"
            className={cn(
              "font-mono text-xs tabular-nums",
              messageLength > CONTACT_LIMITS.messageMax ? "text-danger" : nearLimit ? "text-warning" : "text-muted",
            )}
          >
            {messageLength}/{CONTACT_LIMITS.messageMax}
          </span>
        }
      >
        <textarea
          id={ids.message}
          name="message"
          rows={6}
          required
          placeholder="Tell me a bit about your project, timeline and goals…"
          value={values.message}
          onChange={onChange}
          onBlur={() => onBlur("message")}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy("message", `${ids.message}-count`)}
          className={cn(inputClasses, "min-h-[9rem] resize-y leading-relaxed")}
        />
      </Field>

      {/* Honeypot: visually hidden and skipped by assistive tech; bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={ids.website}>Website</label>
        <input
          id={ids.website}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={onChange}
        />
      </div>

      {status === "error" ? (
        <div
          ref={statusRef}
          tabIndex={-1}
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger animate-fade-in focus:outline-none"
        >
          <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{serverMessage}</p>
        </div>
      ) : null}

      <div className="flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">
          Your details are only used to reply to you. No newsletters, ever.
        </p>
        <Button
          type="submit"
          size="lg"
          loading={status === "submitting"}
          iconRight={status === "submitting" ? undefined : "send"}
          className="w-full sm:w-auto"
        >
          {status === "submitting" ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
