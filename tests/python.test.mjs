// Runs the Python unit tests in scripts/ as part of `npm test`, so they cannot silently rot.
// Skips (with a visible message) when python3 is not installed, e.g. on a machine without Python.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const probe = spawnSync("python3", ["--version"], { encoding: "utf8" });
const havePython = !probe.error && probe.status === 0;

test("python tests in scripts/ pass", { skip: havePython ? false : "python3 not found - skipping scripts/test_*.py" }, () => {
  const run = spawnSync("python3", ["-m", "unittest", "discover", "-s", "scripts", "-p", "test_*.py"], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" },
    timeout: 120_000,
  });
  if (run.status !== 0) {
    process.stdout.write(run.stdout ?? "");
    process.stderr.write(run.stderr ?? "");
  }
  assert.equal(run.status, 0, "python3 -m unittest discover -s scripts failed (output above)");
});
