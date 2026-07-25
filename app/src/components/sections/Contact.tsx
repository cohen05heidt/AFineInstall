import { useState } from "react";
import type { FormEvent } from "react";
import { SITE } from "../../lib/site";
import { FormSlab, FacebookMark } from "../cta";
import { SERVICE_OPTIONS, submitQuote } from "../../lib/api/quote.functions";

type Errors = Partial<Record<"name" | "phone" | "service" | "form", string>>;

const field =
  "w-full border border-[var(--afi-hair)] bg-[var(--afi-ink)] px-4 py-3 text-base text-[var(--afi-bone)] placeholder:text-[var(--afi-bone-faint)] focus:border-[var(--afi-signal)] focus:outline-none";
const labelCls =
  "afi-mono block text-[0.625rem] uppercase tracking-[0.2em] text-[var(--afi-bone-dim)]";

export function Contact() {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const values = {
      name: String(fd.get("name") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      town: String(fd.get("town") ?? "").trim(),
      service: String(fd.get("service") ?? "").trim(),
      message: String(fd.get("message") ?? "").trim(),
    };

    const next: Errors = {};
    if (values.name.length < 2) next.name = "Please give us a name to ask for.";
    if (values.phone.replace(/\D/g, "").length < 7)
      next.phone = "A phone number we can actually reach you on.";
    if (!values.service) next.service = "Pick the closest match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setPending(true);
    try {
      const res = await submitQuote({ data: values });
      if (res.ok) {
        setDone(true);
        form.reset();
      } else {
        setErrors({
          form: `We could not save that. Please call ${SITE.phone} instead.`,
        });
      }
    } catch {
      setErrors({
        form: `Something went wrong sending that. Please call ${SITE.phone} instead.`,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      id="quote"
      aria-labelledby="quote-heading"
      className="border-t border-[var(--afi-hair-soft)] lg:grid lg:grid-cols-2"
    >
      {/* left block: the details, on the raised colour */}
      <div className="bg-[var(--afi-raised)] px-5 py-16 sm:px-6 md:px-12 md:py-24">
        <h2
          id="quote-heading"
          className="afi-display max-w-[16ch] text-[2rem] sm:text-5xl md:text-[3.4rem]"
        >
          Tell us what you need done.
        </h2>
        <p className="afi-body mt-6 text-base">
          {SITE.owner} answers the phone. If it rings out, leave a message with
          your town and we will call back the same day.
        </p>

        <dl className="mt-12 space-y-8">
          <div>
            <dt className={labelCls}>Phone</dt>
            <dd className="mt-2">
              <a
                href={SITE.phoneHref}
                className="afi-mono text-2xl text-[var(--afi-bone)] underline decoration-[var(--afi-signal)] decoration-2 underline-offset-[6px] transition-colors hover:text-[var(--afi-signal-lit)] md:text-3xl"
              >
                {SITE.phone}
              </a>
            </dd>
          </div>
          <div>
            <dt className={labelCls}>Email</dt>
            <dd className="mt-2">
              <a
                href={SITE.emailHref}
                className="text-base text-[var(--afi-bone)] transition-colors hover:text-[var(--afi-signal-lit)]"
              >
                {SITE.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className={labelCls}>Based in</dt>
            <dd className="mt-2 text-base text-[var(--afi-bone-dim)]">
              {SITE.base}. Covering {SITE.driveHours} hours in any direction.
            </dd>
          </div>
          <div>
            <dt className={labelCls}>Install photos</dt>
            <dd className="mt-4">
              <FacebookMark />
            </dd>
          </div>
        </dl>
      </div>

      {/* right block: the form, back on the deep ground */}
      <div className="bg-[var(--afi-ink)] px-5 py-16 sm:px-6 md:px-12 md:py-24">
        {done ? (
          <div className="flex h-full flex-col justify-center">
            <span className="afi-mono text-xs uppercase tracking-[0.22em] text-[var(--afi-signal)]">
              Sent
            </span>
            <h3 className="afi-display mt-5 text-3xl md:text-4xl">
              Got it. We will call you back.
            </h3>
            <p className="afi-body mt-4 text-base">
              If it is urgent, {SITE.phone} rings straight through.
            </p>
            <button
              type="button"
              onClick={() => setDone(false)}
              className="afi-mono mt-9 w-fit border border-[var(--afi-hair)] px-5 py-3 text-[0.625rem] uppercase tracking-[0.2em] text-[var(--afi-bone-dim)] transition-colors hover:border-[var(--afi-signal)] hover:text-[var(--afi-bone)]"
            >
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="q-name" className={labelCls}>
                  Name
                </label>
                <input
                  id="q-name"
                  name="name"
                  autoComplete="name"
                  className={`${field} mt-2`}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name ? (
                  <p className="mt-2 text-sm text-[var(--afi-signal-lit)]">
                    {errors.name}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="q-phone" className={labelCls}>
                  Phone
                </label>
                <input
                  id="q-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className={`${field} mt-2`}
                  aria-invalid={Boolean(errors.phone)}
                />
                {errors.phone ? (
                  <p className="mt-2 text-sm text-[var(--afi-signal-lit)]">
                    {errors.phone}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="q-email" className={labelCls}>
                  Email (optional)
                </label>
                <input
                  id="q-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`${field} mt-2`}
                />
              </div>
              <div>
                <label htmlFor="q-town" className={labelCls}>
                  Town
                </label>
                <input
                  id="q-town"
                  name="town"
                  autoComplete="address-level2"
                  className={`${field} mt-2`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="q-service" className={labelCls}>
                What do you need
              </label>
              <select
                id="q-service"
                name="service"
                defaultValue=""
                className={`${field} mt-2`}
                aria-invalid={Boolean(errors.service)}
              >
                <option value="" disabled>
                  Choose one
                </option>
                {SERVICE_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              {errors.service ? (
                <p className="mt-2 text-sm text-[var(--afi-signal-lit)]">
                  {errors.service}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="q-message" className={labelCls}>
                Anything else
              </label>
              <textarea
                id="q-message"
                name="message"
                rows={4}
                className={`${field} mt-2 resize-y`}
              />
            </div>

            {errors.form ? (
              <p className="border border-[var(--afi-signal-deep)] bg-[var(--afi-signal-deep)]/20 px-4 py-3 text-sm text-[var(--afi-bone)]">
                {errors.form}
              </p>
            ) : null}

            <FormSlab pending={pending} />
            <p className="afi-mono text-[0.625rem] uppercase leading-relaxed tracking-[0.16em] text-[var(--afi-bone-faint)]">
              Goes straight to {SITE.owner}. No list, no newsletter.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
