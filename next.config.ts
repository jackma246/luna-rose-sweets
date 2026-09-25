import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// No third-party scripts, frames, fonts or images are used: next/font
// self-hosts the Google fonts and every image is served from this origin.
// Next's hydration bootstrap is inline, so scripts need 'unsafe-inline'
// (static pages cannot carry per-request nonces). Dev additionally needs
// 'unsafe-eval' for React's debugging and ws: for hot reload.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

// Uploaded files are untrusted: even if one is opened directly as a document
// it gets no scripts, no same-origin access and cannot be framed.
const UPLOADED_IMAGE_CSP = "sandbox; frame-ancestors 'none'";

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    // The proxy buffers bodies of the routes it matches (/admin, /api/admin) and
    // truncates at 10MB by default, which would cut off multi-photo admin
    // uploads. 60MB covers a batch of phone photos while bounding what an
    // unauthenticated request can make the proxy hold in memory.
    proxyClientMaxBodySize: "60mb",
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Uploaded customer images: config headers take precedence over headers
      // set by the route handler, so the sandbox CSP has to be declared here
      // (a later entry overrides the site-wide CSP for these paths).
      {
        source: "/api/admin/orders/:id/images/:imageId",
        headers: [{ key: "Content-Security-Policy", value: UPLOADED_IMAGE_CSP }],
      },
    ];
  },
  async redirects() {
    // The classic storefront was retired; send old links to the current site.
    // "/classic" is listed separately: with zero segments "/:path*" would
    // produce an empty Location header.
    return [
      { source: "/classic", destination: "/", permanent: true },
      { source: "/classic/:path*", destination: "/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
