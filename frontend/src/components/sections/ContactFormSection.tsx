"use client";

import { FormEvent, useState } from "react";

const subjects = [
  "General Enquiry",
  "Get a Quote",
  "International Shipment",
  "Domestic Delivery",
  "Track a Shipment",
  "Partnership",
];

export function ContactFormSection() {
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    // TODO: wire to backend
    setTimeout(() => setSubmitting(false), 600);
  }

  return (
    <section className="bg-[var(--color-surface)] pb-20 lg:pb-24">
      <div className="container-content">
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-card)]">
          {/* Left — embedded map */}
          <div className="relative min-h-[420px] lg:min-h-[640px] bg-[var(--color-border)]">
            <iframe
              title="Nepex Cargo head office — Babarmahal, Kathmandu"
              src="https://www.google.com/maps?q=Babarmahal,Kathmandu,Nepal&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>

          {/* Right — form */}
          <form
            onSubmit={handleSubmit}
            className="bg-[var(--color-brand)] text-white p-8 lg:p-10 flex flex-col"
          >
            <h2 className="text-[1.75rem] lg:text-[2rem] font-extrabold leading-tight">
              Send us a message
            </h2>

            <div className="mt-7 space-y-5 flex-1">
              <Field id="fullName" label="Full Name">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="John Doe"
                  className={fieldClass}
                />
              </Field>

              <Field id="email" label="Email">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="johndoe@gmail.com"
                  className={fieldClass}
                />
              </Field>

              <Field id="subject" label="Subject">
                <div className="relative">
                  <select
                    id="subject"
                    name="subject"
                    required
                    defaultValue=""
                    className={`${fieldClass} appearance-none pr-10`}
                  >
                    <option value="" disabled>
                      select
                    </option>
                    {subjects.map((s) => (
                      <option key={s} value={s} className="text-[var(--color-text)]">
                        {s}
                      </option>
                    ))}
                  </select>
                  <svg
                    aria-hidden="true"
                    className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    width="14"
                    height="14"
                    viewBox="0 0 12 12"
                    fill="currentColor"
                  >
                    <path d="M6 8.5L1.5 4h9z" />
                  </svg>
                </div>
              </Field>

              <Field id="message" label="Message">
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Your Message"
                  className={`${fieldClass} resize-y min-h-[120px]`}
                />
              </Field>
            </div>

            <label className="mt-5 flex items-start gap-2.5 text-[13px] text-white/90 cursor-pointer select-none">
              <input
                type="checkbox"
                name="consent"
                required
                className="mt-[3px] h-4 w-4 rounded-[3px] border-white/60 bg-transparent accent-white"
              />
              <span>
                By sending this form, I agree to the{" "}
                <a href="/terms" className="underline hover:text-white">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="underline hover:text-white">
                  Privacy Policy.
                </a>
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 h-12 rounded-[var(--radius-md)] bg-white text-[var(--color-text)] font-bold text-[15px] hover:bg-white/95 transition-colors disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

const fieldClass =
  "w-full h-12 px-4 rounded-[var(--radius-md)] bg-transparent border border-white/55 text-white placeholder-white/65 focus:outline-none focus:border-white transition-colors";

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[14px] font-semibold mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
