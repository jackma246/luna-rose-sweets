"use client";

import { useState, FormEvent } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: Hook up to an email service or API
    setSubmitted(true);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="bg-section-banner text-nav-text text-center py-8 rounded-lg mb-10">
        <h1 className="font-serif text-4xl font-bold">Contact Us</h1>
      </div>

      {/* Delivery Info */}
      <div className="bg-card-bg rounded-lg p-6 mb-8 border border-accent/15">
        <h2 className="font-serif text-xl font-bold text-heading mb-4">Delivery Information</h2>
        <div className="space-y-3 text-sm text-foreground/70">
          <div className="flex items-start gap-3">
            <span className="text-accent font-bold mt-0.5">📍</span>
            <div>
              <p className="font-semibold text-heading">San Jose</p>
              <p>Free delivery or $5 depending on location</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-accent font-bold mt-0.5">🚗</span>
            <div>
              <p className="font-semibold text-heading">Nearby Cities</p>
              <p>$10–$20 depending on distance</p>
            </div>
          </div>
          <p className="text-xs text-foreground/50 pt-1">For delivery outside these areas, please contact us for a custom quote.</p>
        </div>
      </div>

      {submitted ? (
        <div className="bg-card-bg rounded-lg p-8 text-center">
          <div className="text-5xl mb-4">💌</div>
          <h2 className="font-serif text-2xl font-bold text-heading mb-3">
            Message Sent!
          </h2>
          <p className="text-foreground/70">
            Thank you for reaching out! We&apos;ll get back to you as soon as possible.
          </p>
        </div>
      ) : (
        <div className="bg-card-bg rounded-lg p-8">
          <p className="text-foreground/70 mb-4">
            Have a question about our products or want to place a custom order? Fill
            out the form below and we&apos;ll get back to you shortly!
          </p>
          <p className="text-foreground/70 mb-6 text-sm">
            Or email us directly at{" "}
            <a
              href="mailto:support.dipsprinkle@gmail.com"
              className="text-accent font-medium hover:underline"
            >
              support.dipsprinkle@gmail.com
            </a>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-heading mb-1.5"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full border border-accent/30 rounded-lg px-4 py-2.5 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-heading mb-1.5"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full border border-accent/30 rounded-lg px-4 py-2.5 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-heading mb-1.5"
              >
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                className="w-full border border-accent/30 rounded-lg px-4 py-2.5 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option>General Enquiry</option>
                <option>Custom Order</option>
                <option>Pricing Question</option>
                <option>Feedback</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-heading mb-1.5"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full border border-accent/30 rounded-lg px-4 py-2.5 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-vertical"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-mint text-white font-medium py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              Send Message
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
