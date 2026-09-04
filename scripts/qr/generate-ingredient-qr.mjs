/**
 * Generates the printable QR sticker assets for the ingredient pages.
 *
 * The QR is drawn in the Dip & Sprinkle "dot" style — round data modules in
 * cocoa on cream. Two things that look like styling choices are not:
 *
 *   - the finder and alignment patterns stay solid (rounded) squares. Drawn as
 *     loose dots they stop being recognisable as position markers and the code
 *     will not decode at all.
 *   - the data dots use r = 0.5 cells, so neighbouring dots touch. At r = 0.46
 *     the code decodes at low resolution but fails once a scanner sees it at
 *     high resolution and the gaps binarise as light.
 *
 * Both were found by rasterising the exact geometry below and decoding it with
 * jsQR, which this script re-runs on every generate: if a change would make the
 * sticker unscannable it throws instead of writing files.
 *
 * Run:  npm i --no-save qrcode jsqr && node scripts/qr/generate-ingredient-qr.mjs
 */

import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";
import jsQR from "jsqr";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(ROOT, "docs", "print");

const SITE = "https://dipsprinkle.com";
const COCOA = "#3A1F18";
const CREAM = "#FFF6E6";
const BUTTER = "#F8B84E";

/** Data-dot radius in cells. Do not drop below 0.5 — see the header note. */
const DOT_R = 0.5;
/** Quiet zone in modules. The spec minimum is 4. */
const QUIET = 4;

const targets = [
  {
    slug: "cake-pop",
    label: "Vanilla Birthday Cake Pop",
    ring: "SCAN FOR INGREDIENTS • DIP & SPRINKLE • SCAN FOR INGREDIENTS •",
  },
];

// ── QR matrix ──────────────────────────────────────────────────────────────

function matrixFor(text) {
  const qr = QRCode.create(text, { errorCorrectionLevel: "Q" });
  const n = qr.modules.size;
  const data = qr.modules.data;
  const version = (n - 17) / 4;

  const isDark = (r, c) => data[r * n + c] === 1;

  const finders = [
    { r: 0, c: 0 },
    { r: 0, c: n - 7 },
    { r: n - 7, c: 0 },
  ];
  // Versions 2-6 carry exactly one alignment pattern, bottom-right.
  const aligns = version >= 2 && version <= 6 ? [{ r: n - 9, c: n - 9 }] : [];

  const inBlock = (blocks, span) => (r, c) =>
    blocks.some((b) => r >= b.r && r < b.r + span && c >= b.c && c < b.c + span);

  return {
    n,
    version,
    isDark,
    finders,
    aligns,
    isStructural: (r, c) => inBlock(finders, 7)(r, c) || inBlock(aligns, 5)(r, c),
  };
}

// ── shared geometry: one description, rendered to both SVG and pixels ───────

/**
 * The sticker's marks in cell units: rounded rects for the position patterns,
 * circles for the data. Both renderers consume this, so what jsQR verifies is
 * exactly what the printer gets.
 */
function marks(m) {
  const out = [];
  const rect = (r, c, size, radius, dark) =>
    out.push({ kind: "rect", x: c, y: r, w: size, h: size, radius, dark });

  for (const f of m.finders) {
    rect(f.r, f.c, 7, 1.8, true);
    rect(f.r + 1, f.c + 1, 5, 1.2, false);
    rect(f.r + 2, f.c + 2, 3, 0.9, true);
  }
  for (const a of m.aligns) {
    rect(a.r, a.c, 5, 1.2, true);
    rect(a.r + 1, a.c + 1, 3, 0.8, false);
    rect(a.r + 2, a.c + 2, 1, 0.35, true);
  }
  for (let r = 0; r < m.n; r++) {
    for (let c = 0; c < m.n; c++) {
      if (!m.isDark(r, c) || m.isStructural(r, c)) continue;
      out.push({ kind: "dot", cx: c + 0.5, cy: r + 0.5, r: DOT_R, dark: true });
    }
  }
  return out;
}

// ── SVG ────────────────────────────────────────────────────────────────────

const num = (v) => Math.round(v * 1000) / 1000;

function marksSvg(m, cell, offset) {
  return marks(m)
    .map((mk) => {
      const fill = mk.dark ? COCOA : CREAM;
      if (mk.kind === "dot") {
        return `<circle cx="${num(offset + mk.cx * cell)}" cy="${num(offset + mk.cy * cell)}" r="${num(mk.r * cell)}" fill="${fill}"/>`;
      }
      return `<rect x="${num(offset + mk.x * cell)}" y="${num(offset + mk.y * cell)}" width="${num(mk.w * cell)}" height="${num(mk.h * cell)}" rx="${num(mk.radius * cell)}" fill="${fill}"/>`;
    })
    .join("");
}

/** Standalone QR on its cream field, quiet zone included. */
function qrSvg(m, px) {
  const cell = px / (m.n + QUIET * 2);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${px} ${px}" shape-rendering="geometricPrecision">` +
    `<rect width="${px}" height="${px}" fill="${CREAM}"/>` +
    marksSvg(m, cell, QUIET * cell) +
    `</svg>`
  );
}

/** Radius of the cream disc inside the cocoa ring, in the 320-unit sticker space. */
const DISC_R = 113;

/**
 * The 3in circular sticker: cocoa ring, curved brand text, QR in the middle.
 *
 * The QR is square and the cream field is round, so the binding constraint is
 * the corners — where the finder patterns live. Size the code so even a corner
 * keeps the full 4-module quiet zone before the cocoa ring starts:
 *
 *   (box/2)·√2 + QUIET·(box/n) <= DISC_R
 */
function stickerSvg(m, ringText, px = 288) {
  const maxBox = DISC_R / (Math.SQRT1_2 + QUIET / m.n);
  const box = Math.floor(maxBox);
  const cell = box / m.n;
  const cornerQuiet = (DISC_R - (box / 2) * Math.SQRT2) / cell;
  if (cornerQuiet < QUIET) {
    throw new Error(`sticker corner quiet zone is ${cornerQuiet.toFixed(1)} modules, need ${QUIET}`);
  }
  const inset = (320 - box) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 320 320" shape-rendering="geometricPrecision">
<circle cx="160" cy="160" r="158" fill="${COCOA}"/>
<circle cx="160" cy="160" r="113" fill="${CREAM}"/>
<defs><path id="ring" d="M160,160 m-134,0 a134,134 0 1,1 268,0 a134,134 0 1,1 -268,0"/></defs>
<text font-family="'DM Sans',Nunito,sans-serif" font-size="17.5" font-weight="800" fill="${BUTTER}" letter-spacing="3.5"><textPath href="#ring">${escapeXml(ringText)}</textPath></text>
<g transform="translate(${num(inset)} ${num(inset)})">${marksSvg(m, cell, 0)}</g>
</svg>`;
}

const escapeXml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ── raster (hand-rolled PNG: no native image deps) ─────────────────────────

function rasterize(m, scale) {
  const dim = (m.n + QUIET * 2) * scale;
  const px = new Uint8Array(dim * dim).fill(255); // 8-bit grey, cream reads white
  const off = QUIET * scale;

  const paint = (x, y, dark) => {
    if (x < 0 || y < 0 || x >= dim || y >= dim) return;
    px[y * dim + x] = dark ? 0 : 255;
  };

  for (const mk of marks(m)) {
    if (mk.kind === "dot") {
      const cx = off + mk.cx * scale;
      const cy = off + mk.cy * scale;
      const r = mk.r * scale;
      for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
        for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
          const dx = x + 0.5 - cx;
          const dy = y + 0.5 - cy;
          if (dx * dx + dy * dy <= r * r) paint(x, y, mk.dark);
        }
      }
      continue;
    }
    // rounded rect
    const x0 = off + mk.x * scale;
    const y0 = off + mk.y * scale;
    const w = mk.w * scale;
    const h = mk.h * scale;
    const rad = Math.min(mk.radius * scale, w / 2, h / 2);
    for (let y = Math.floor(y0); y < Math.ceil(y0 + h); y++) {
      for (let x = Math.floor(x0); x < Math.ceil(x0 + w); x++) {
        const px_ = x + 0.5;
        const py_ = y + 0.5;
        if (px_ < x0 || px_ > x0 + w || py_ < y0 || py_ > y0 + h) continue;
        const qx = Math.max(x0 + rad - px_, px_ - (x0 + w - rad), 0);
        const qy = Math.max(y0 + rad - py_, py_ - (y0 + h - rad), 0);
        if (qx * qx + qy * qy <= rad * rad) paint(x, y, mk.dark);
      }
    }
  }
  return { dim, px };
}

function grayPng({ dim, px }) {
  const raw = Buffer.alloc((dim + 1) * dim);
  for (let y = 0; y < dim; y++) {
    raw[y * (dim + 1)] = 0; // filter: none
    Buffer.from(px.subarray(y * dim, (y + 1) * dim)).copy(raw, y * (dim + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(dim, 0);
  ihdr.writeUInt32BE(dim, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 0; // grayscale
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body) >>> 0, 0);
  return Buffer.concat([len, body, crc]);
}

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return c ^ -1;
}

// ── verification ───────────────────────────────────────────────────────────

function decode({ dim, px }) {
  const rgba = new Uint8ClampedArray(dim * dim * 4);
  for (let i = 0; i < px.length; i++) {
    rgba[i * 4] = rgba[i * 4 + 1] = rgba[i * 4 + 2] = px[i];
    rgba[i * 4 + 3] = 255;
  }
  return jsQR(rgba, dim, dim)?.data ?? null;
}

/**
 * Decode the sticker across the range of resolutions a scanner might see —
 * a coarse phone frame of a 1.5in code through to press resolution.
 */
function verify(m, url) {
  const scales = [4, 6, 9, 12, 18, 24, 36];
  for (const scale of scales) {
    const got = decode(rasterize(m, scale));
    if (got !== url) {
      throw new Error(
        `QR failed verification at ${scale}px/module: decoded ${got === null ? "nothing" : `"${got}"`}, expected "${url}"`,
      );
    }
  }
  return scales;
}


// ── print sheet ────────────────────────────────────────────────────────────

/**
 * A self-contained print page: one sticker at exact size plus a 6-up sheet on
 * US Letter. The SVG is inlined, so it prints identically with no network.
 */
function printHtml(m, { ring, url, label }) {
  const sticker = stickerSvg(m, ring, 288);
  const cell = `<div class="cell"><div class="sticker">${sticker}</div></div>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dip &amp; Sprinkle - ${escapeXml(label)} QR sticker (3in, print)</title>
<style>
  @page { size: letter; margin: 0.5in; }
  :root { --cocoa: ${COCOA}; --cream: ${CREAM}; --butter: ${BUTTER}; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #FBF6EE; color: var(--cocoa);
         font: 400 14px/1.6 "DM Sans", -apple-system, system-ui, sans-serif; }
  .doc { max-width: 8.5in; margin: 0 auto; padding: 32px 24px 64px; }
  h1 { font-size: 20px; margin: 0 0 4px; font-weight: 600; }
  .meta { color: #6B4A3A; font-size: 13px; margin: 0 0 4px; }
  .meta code { background: #F7EEDE; padding: 2px 6px; border-radius: 5px; font-size: 12.5px; }
  .note { color: #6B4A3A; font-size: 12.5px; margin: 16px 0 28px; max-width: 62ch; }
  .sheet { display: grid; grid-template-columns: repeat(2, 3in); grid-auto-rows: 3in;
           justify-content: center; }
  .cell { display: flex; align-items: center; justify-content: center; }
  .sticker { width: 2.9in; height: 2.9in; }
  .sticker svg { width: 100%; height: 100%; display: block; }
  .single .sticker { filter: drop-shadow(0 10px 22px rgba(58,31,24,.28)); }
  @media print {
    body { background: #fff; }
    .doc { padding: 0; max-width: none; }
    .screen-only { display: none !important; }
    .sheet { page-break-inside: avoid; }
    .cell { break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="doc">
  <div class="screen-only">
    <h1>${escapeXml(label)} - ingredients QR sticker</h1>
    <p class="meta">Links to <code>${escapeXml(url)}</code></p>
    <p class="meta">3 in circle - 6 per US Letter sheet - QR is version ${m.version}, ECC level Q</p>
    <p class="note">Print at 100% scale (no "fit to page") or the code shrinks below the size
      it was verified at. Cut on the outside of the cocoa ring. The cream centre must stay
      light and matte - a glossy or dark laminate over the code is the usual reason a sticker
      stops scanning.</p>
  </div>
  <div class="sheet">${cell.repeat(6)}</div>
</div>
</body>
</html>
`;
}

// ── run ────────────────────────────────────────────────────────────────────

for (const target of targets) {
  const { slug, ring } = target;
  const url = `${SITE}/ingredients/${slug}`;
  const m = matrixFor(url);
  const scales = verify(m, url);

  writeFileSync(join(OUT, `qr-${slug}-ingredients.svg`), qrSvg(m, 600));
  writeFileSync(join(OUT, `qr-${slug}-ingredients.png`), grayPng(rasterize(m, 24)));
  writeFileSync(join(OUT, `sticker-${slug}.svg`), stickerSvg(m, ring));
  writeFileSync(join(OUT, `sticker-${slug}-print.html`), printHtml(m, { ...target, url }));

  console.log(
    `${slug} -> ${url}\n  version ${m.version} (${m.n}x${m.n} modules), ECC Q, quiet zone ${QUIET}` +
      `\n  decoded OK at ${scales.join(", ")} px/module`,
  );
}
