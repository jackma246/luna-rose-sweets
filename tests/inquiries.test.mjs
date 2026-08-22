import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { createRequire } from "node:module";

const nativeRequire = createRequire(import.meta.url);

// A date comfortably beyond today's 3-day lead time so the availability gate lets it through.
const FUTURE_DATE = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
})();
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function resolveAlias(request) {
  if (!request.startsWith("@/")) return null;
  const base = path.join(root, "src", request.slice(2));
  for (const candidate of [`${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")]) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function loadTsModule(filename, mocks, cache = new Map()) {
  if (cache.has(filename)) return cache.get(filename).exports;

  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;

  const mod = new Module(filename);
  cache.set(filename, mod);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  mod.require = (request) => {
    if (Object.prototype.hasOwnProperty.call(mocks, request)) return mocks[request];
    const aliased = resolveAlias(request);
    if (aliased) return loadTsModule(aliased, mocks, cache);
    return nativeRequire(request);
  };
  mod._compile(output, filename);
  return mod.exports;
}

function loadInquiryRoute({ create, send, apiKey = "test_resend_key", availability = null }) {
  const previousApiKey = process.env.RESEND_API_KEY;
  if (apiKey) process.env.RESEND_API_KEY = apiKey;
  else delete process.env.RESEND_API_KEY;

  const route = loadTsModule(path.join(root, "src/app/api/inquiries/route.ts"), {
    "@/lib/prisma": {
      prisma: {
        inquiry: {
          create,
        },
        availabilityDate: {
          // availability === null means "no row for that day" (open)
          findUnique: async () => availability,
          findMany: async () => [],
        },
      },
    },
    "next/server": {
      NextResponse: {
        json(body, init = {}) {
          return {
            body,
            status: init.status || 200,
            async json() {
              return body;
            },
          };
        },
      },
    },
    resend: {
      Resend: class Resend {
        constructor(apiKeyValue) {
          this.apiKey = apiKeyValue;
          this.emails = { send };
        }
      },
    },
  });

  return {
    POST: route.POST,
    restoreEnv() {
      if (previousApiKey === undefined) delete process.env.RESEND_API_KEY;
      else process.env.RESEND_API_KEY = previousApiKey;
    },
  };
}

function requestJson(body) {
  return {
    async json() {
      return body;
    },
  };
}

test("valid inquiry submit persists and returns 200", async () => {
  const creates = [];
  const sends = [];
  const createdAt = new Date("2026-07-06T12:00:00");
  const { POST, restoreEnv } = loadInquiryRoute({
    create: async ({ data }) => {
      creates.push(data);
      return { id: "inq_1", createdAt, ...data };
    },
    send: async (payload) => {
      sends.push(payload);
      return { data: { id: "email_1" }, error: null };
    },
  });

  try {
    const res = await POST(requestJson({
      name: "Sam Rivera",
      email: "SAM@example.com",
      eventDate: FUTURE_DATE,
      guestCount: "40",
      message: "Birthday treats",
      source: "website_contact",
    }));

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { ok: true, id: "inq_1" });
    assert.equal(creates.length, 1);
    assert.equal(creates[0].name, "Sam Rivera");
    assert.equal(creates[0].email, "sam@example.com");
    assert.equal(creates[0].guestCount, "40");
    assert.equal(creates[0].message, "Birthday treats");
    assert.equal(creates[0].source, "website_contact");
    assert.equal(creates[0].eventDate.toISOString().slice(0, 10), FUTURE_DATE);
    assert.equal(sends.length, 1);
    assert.equal(sends[0].to, "supportdipsprinkle@gmail.com");
    assert.equal(sends[0].replyTo, "sam@example.com");
  } finally {
    restoreEnv();
  }
});

test("invalid inquiry submit returns 400 and does not persist", async () => {
  let createCalled = false;
  let sendCalled = false;
  const { POST, restoreEnv } = loadInquiryRoute({
    create: async () => {
      createCalled = true;
    },
    send: async () => {
      sendCalled = true;
    },
  });

  try {
    const res = await POST(requestJson({ name: "Sam", email: "not-an-email" }));

    assert.equal(res.status, 400);
    assert.equal(res.body.ok, false);
    assert.equal(createCalled, false);
    assert.equal(sendCalled, false);
  } finally {
    restoreEnv();
  }
});

test("email failure still persists and returns 200", async () => {
  const creates = [];
  const createdAt = new Date("2026-07-06T12:00:00");
  const originalConsoleError = console.error;
  const { POST, restoreEnv } = loadInquiryRoute({
    create: async ({ data }) => {
      creates.push(data);
      return { id: "inq_2", createdAt, ...data };
    },
    send: async () => {
      throw new Error("resend down");
    },
  });

  try {
    console.error = () => {};
    const res = await POST(requestJson({
      name: "Taylor",
      email: "taylor@example.com",
      message: "Wedding sweets",
      source: "website_contact",
    }));

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { ok: true, id: "inq_2" });
    assert.equal(creates.length, 1);
  } finally {
    console.error = originalConsoleError;
    restoreEnv();
  }
});

test("wrong support email spelling is absent from tracked text files", () => {
  const wrong = ["support", "dipsprinkle@gmail.com"].join(".");
  const skipDirs = new Set([".git", ".next", "node_modules", "src/generated"]);
  const textExts = new Set([
    ".cjs",
    ".css",
    ".example",
    ".js",
    ".json",
    ".md",
    ".mjs",
    ".prisma",
    ".py",
    ".sh",
    ".sql",
    ".ts",
    ".tsx",
  ]);
  const hits = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      const rel = path.relative(root, fullPath);
      if (entry.isDirectory()) {
        if (!skipDirs.has(rel) && !skipDirs.has(entry.name)) walk(fullPath);
        continue;
      }
      if (!textExts.has(path.extname(entry.name)) && !entry.name.endsWith(".env.example")) continue;
      if (fs.readFileSync(fullPath, "utf8").includes(wrong)) hits.push(rel);
    }
  }

  walk(root);
  assert.deepEqual(hits, []);
});

test("inquiry for a closed day returns 400 and does not persist", async () => {
  const creates = [];
  const { POST, restoreEnv } = loadInquiryRoute({
    create: async ({ data }) => {
      creates.push(data);
      return { id: "inq_2", createdAt: new Date(), ...data };
    },
    send: async () => ({ data: { id: "email_2" }, error: null }),
    availability: { status: "closed" },
  });

  try {
    const res = await POST(requestJson({
      name: "Sam Rivera",
      email: "sam@example.com",
      eventDate: FUTURE_DATE,
      source: "website_contact",
    }));

    assert.equal(res.status, 400);
    assert.match(res.body.error, /closed/i);
    assert.equal(creates.length, 0);
  } finally {
    restoreEnv();
  }
});
