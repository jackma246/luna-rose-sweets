import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const { checkSeedTarget } = require(path.join(root, "seed-demo.cjs"));

test("seed-demo allows only local databases by default", () => {
  assert.equal(checkSeedTarget("postgresql://postgres@localhost:5432/dip", []).ok, true);
  assert.equal(checkSeedTarget("postgresql://u:p@127.0.0.1:5432/dip", []).ok, true);
  assert.equal(checkSeedTarget("postgresql://u:p@[::1]:5432/dip", []).ok, true);
  assert.equal(checkSeedTarget("postgresql://u:p@postgres.railway.internal:5432/railway", []).ok, false);
  assert.equal(checkSeedTarget("postgresql://u:p@localhost.evil.com:5432/x", []).ok, false);
  assert.equal(checkSeedTarget("not a url", []).ok, false);
  assert.equal(checkSeedTarget(undefined, []).ok, false);
});

test("seed-demo override flag permits a remote database", () => {
  assert.equal(
    checkSeedTarget("postgresql://u:p@db.example.com:5432/x", ["--i-know-this-wipes-data"]).ok,
    true,
  );
});

test("running seed-demo against a remote DATABASE_URL exits before touching it", () => {
  const result = spawnSync(process.execPath, [path.join(root, "seed-demo.cjs")], {
    cwd: root,
    env: { ...process.env, DATABASE_URL: "postgresql://u:p@db.example.invalid:5432/prod" },
    encoding: "utf8",
    timeout: 30_000,
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Refusing to seed/);
  assert.doesNotMatch(result.stdout, /seeded:/);
});
