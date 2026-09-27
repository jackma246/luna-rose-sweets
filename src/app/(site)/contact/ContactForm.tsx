"use client";

import { useState, FormEvent } from "react";
import V2Header from "../components/V2Header";
import V2Footer from "../components/V2Footer";
import RequestDatePicker from "../components/RequestDatePicker";
import { productLeadDays } from "@/data/products";
import { MIN_LEAD_DAYS } from "@/lib/availabilityShared";
import { HONEYPOT_FIELD } from "@/lib/honeypot";

// Lead-time copy comes from the same per-product data the date picker and the order API enforce.
const CUSTOM_CAKE_LEAD_DAYS = productLeadDays("party-layer-cake");
const TWO_TIER_LEAD_DAYS = productLeadDays("party-two-tier-cake");
const TOWER_LEAD_DAYS = productLeadDays("macaron-tower");

/** Contact / custom order form. `initialDate` comes from the calendar's "Request <date>" link (?date=). */
export default function ContactForm({ initialDate = "" }: { initialDate?: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [eventDate, setEventDate] = useState(initialDate);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          eventDate: data.get("date"),
          guestCount: data.get("guests"),
          message: data.get("message"),
          source: "website_contact",
          [HONEYPOT_FIELD]: data.get(HONEYPOT_FIELD) ?? "",
        }),
      });

      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(payload?.error || "We could not send your inquiry. Please try again or email us directly.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("We could not send your inquiry. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <V2Header current="contact" />

      <section className="contact-wrap">
        <div className="contact-head">
          <h1>
            Let&rsquo;s make something <em>sweet</em>.
          </h1>
          <p>
            Weddings, showers, corporate events, or a Tuesday that needs sprinkles — tell us about it.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-cards">
            <div className="contact-card">
              <div className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h4>Email us</h4>
              <p>
                <a href="mailto:supportdipsprinkle@gmail.com">
                  supportdipsprinkle@gmail.com
                </a>
                <br />
                Reply within 48 hours.
              </p>
            </div>
            <div className="contact-card">
              <div className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </div>
              <h4>Follow along</h4>
              <p>
                <a href="https://www.instagram.com/dipsprinkle" target="_blank" rel="noopener noreferrer">
                  @dipsprinkle
                </a>
                <br />
                New treats, behind-the-scenes, and seasonal specials.
              </p>
            </div>
            <div className="contact-card">
              <div className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h4>Lead time</h4>
              <p>
                Most treats need at least {MIN_LEAD_DAYS} days notice. Custom cakes
                need {CUSTOM_CAKE_LEAD_DAYS} days, towers {TOWER_LEAD_DAYS} days, and two-tier cakes
                {" "}{TWO_TIER_LEAD_DAYS} days. For larger parties, earlier is better.
              </p>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            {submitted ? (
              <>
                <h3>
                  Thanks, we got it.
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-fraunces), serif",
                    fontSize: 16,
                    color: "var(--ink-soft)",
                    marginTop: 8,
                  }}
                >
                  We&rsquo;ll reply within 48 hours with a sketch, flavour
                  suggestion, and a firm quote. In the meantime, go treat
                  yourself.
                </p>
              </>
            ) : (
              <>
                <h3>
                  Start a <em>custom order</em>
                </h3>
                <div className="sub">
                  All fields optional except name &amp; email.
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="name">Your name</label>
                    <input id="name" name="name" required maxLength={120} placeholder="Sam Rivera" />
                  </div>
                  <div className="field">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      maxLength={254}
                      placeholder="sam@hello.com"
                    />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="date">Event date</label>
                    <RequestDatePicker id="date" name="date" value={eventDate} onChange={setEventDate} theme="contact" />
                  </div>
                  <div className="field">
                    <label htmlFor="guests">Guest count</label>
                    <input id="guests" name="guests" maxLength={80} placeholder="e.g. 40" />
                  </div>
                </div>
                <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
                  <label htmlFor={HONEYPOT_FIELD}>Website</label>
                  <input id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
                </div>
                <div className="field">
                  <label htmlFor="message">Tell us about it</label>
                  <textarea
                    id="message"
                    name="message"
                    maxLength={4000}
                    placeholder="Theme, colors, flavors, anything you're picturing…"
                  />
                </div>
                {error && (
                  <p
                    role="alert"
                    style={{
                      color: "var(--rose-deep)",
                      fontSize: 14,
                      lineHeight: 1.5,
                      margin: "-4px 0 16px",
                    }}
                  >
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ width: "100%", justifyContent: "center", opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? "Sending..." : "Send →"}
                </button>
              </>
            )}
          </form>
        </div>
      </section>

      <V2Footer />
    </>
  );
}
