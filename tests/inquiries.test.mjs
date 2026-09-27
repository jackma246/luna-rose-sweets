import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { loadTsModule, root } from "./helpers/loadTs.mjs";

// A date comfortably beyond today's 3-day lead time so the availability gate lets it through.
const FUTURE_DATE = (() => {
  const d = new Date(Date.now() + 30 * 86_400_000);
  return d.toISOString().slice(0, 10);
})();

function loadInquiryRoute({ create, send, apiKey = "test_resend_key", availability = null }) {
  const previousApiKey = process.env.RESEND_API_KEY;
  if (apiKey) process.env.RESEND_API_KEY = apiKey;
  else delete process.env.RESEND_API_KEY;

  const route = loadTsModule("src/app/api/inquiries/route.ts", {
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
            headers: new Headers(init.headers),
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

function requestJson(body, headers = {}) {
  return new Request("http://localhost/api/inquiries", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7", ...headers },
    body: JSON.stringify(body),
  });
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
  const skipDirs = new Set([".git", ".next", "node_modules", "src/generated", ".localdb"]);
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

test("inquiry event date is stored as the same calendar day in every server time zone", async () => {
  const creates = [];
  const { POST, restoreEnv } = loadInquiryRoute({
    create: async ({ data }) => {
      creates.push(data);
      return { id: "inq_tz", createdAt: new Date(), ...data };
    },
    send: async () => ({ data: { id: "email_tz" }, error: null }),
  });
  try {
    const res = await POST(requestJson({ name: "Sam", email: "sam@example.com", eventDate: FUTURE_DATE }));
    assert.equal(res.status, 200);
    // UTC midnight of that day - what Prisma stores for a @db.Date - regardless of process TZ.
    assert.equal(creates[0].eventDate.toISOString(), `${FUTURE_DATE}T00:00:00.000Z`);
  } finally {
    restoreEnv();
  }
});

test("honeypot submissions look successful but are dropped", async () => {
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
    const res = await POST(requestJson({ name: "Bot", email: "bot@example.com", website: "http://spam.example" }));
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { ok: true });
    assert.equal(createCalled, false);
    assert.equal(sendCalled, false);
  } finally {
    restoreEnv();
  }
});

test("more than 5 accepted inquiries per hour from one IP are rate limited", async () => {
  let created = 0;
  const { POST, restoreEnv } = loadInquiryRoute({
    create: async ({ data }) => {
      created += 1;
      return { id: `inq_${created}`, createdAt: new Date(), ...data };
    },
    send: async () => ({ data: { id: "e" }, error: null }),
  });
  try {
    for (let i = 0; i < 5; i += 1) {
      const res = await POST(requestJson({ name: "Sam", email: "sam@example.com" }, { "x-real-ip": "198.51.100.9", "x-forwarded-for": "6.6.6.6" }));
      assert.equal(res.status, 200);
    }
    const limited = await POST(requestJson({ name: "Sam", email: "sam@example.com" }, { "x-real-ip": "198.51.100.9", "x-forwarded-for": "7.7.7.7" }));
    assert.equal(limited.status, 429);
    assert.equal(created, 5);
    // A different client is unaffected.
    const other = await POST(requestJson({ name: "Alex", email: "alex@example.com" }, { "x-real-ip": "198.51.100.10" }));
    assert.equal(other.status, 200);
  } finally {
    restoreEnv();
  }
});

test("oversized inquiry bodies are rejected before parsing", async () => {
  const { POST, restoreEnv } = loadInquiryRoute({
    create: async () => assert.fail("must not persist"),
    send: async () => assert.fail("must not send"),
  });
  try {
    const res = await POST(requestJson({ name: "Sam", email: "sam@example.com", message: "x".repeat(70_000) }));
    assert.equal(res.status, 413);
  } finally {
    restoreEnv();
  }
});

test("email addresses need a real top-level domain", async () => {
  const { POST, restoreEnv } = loadInquiryRoute({
    create: async () => assert.fail("must not persist"),
    send: async () => assert.fail("must not send"),
  });
  try {
    const res = await POST(requestJson({ name: "Sam", email: "sam@localhost" }));
    assert.equal(res.status, 400);
  } finally {
    restoreEnv();
  }
});
