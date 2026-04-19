"use client";

import { useState, FormEvent } from "react";
import V2Header from "../components/V2Header";
import V2Footer from "../components/V2Footer";

export default function V2Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
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
                <a href="mailto:support.dipsprinkle@gmail.com">
                  support.dipsprinkle@gmail.com
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
                Most orders need 3–5 days notice. Custom cakes and larger
                parties: please allow 1–2 weeks.
              </p>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            {submitted ? (
              <>
                <h3>
                  Thanks — we got it.
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
                  suggestion, and a firm quote. In the meantime — go treat
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
                    <input id="name" name="name" required placeholder="Sam Rivera" />
                  </div>
                  <div className="field">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="sam@hello.com"
                    />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="date">Event date</label>
                    <input id="date" name="date" type="date" />
                  </div>
                  <div className="field">
                    <label htmlFor="guests">Guest count</label>
                    <input id="guests" name="guests" placeholder="e.g. 40" />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="message">Tell us about it</label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Theme, colors, flavors, anything you're picturing…"
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  Send →
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
