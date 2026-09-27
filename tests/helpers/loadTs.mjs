// Minimal TypeScript module loader for node:test suites: transpiles src/ files on the fly, resolves the
// "@/..." alias, and lets a test substitute modules (prisma, next/server, resend, ...) with mocks.
import fs from "node:fs";
import Module, { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const nativeRequire = createRequire(import.meta.url);
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function resolveAlias(request) {
  if (!request.startsWith("@/")) return null;
  const base = path.join(root, "src", request.slice(2));
  for (const candidate of [`${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")]) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

export function loadTsModule(filename, mocks = {}, cache = new Map()) {
  const absolute = path.isAbsolute(filename) ? filename : path.join(root, filename);
  if (cache.has(absolute)) return cache.get(absolute).exports;

  const source = fs.readFileSync(absolute, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: absolute,
  }).outputText;

  const mod = new Module(absolute);
  cache.set(absolute, mod);
  mod.filename = absolute;
  mod.paths = Module._nodeModulePaths(path.dirname(absolute));
  mod.require = (request) => {
    if (Object.prototype.hasOwnProperty.call(mocks, request)) return mocks[request];
    const aliased = resolveAlias(request);
    if (aliased) return loadTsModule(aliased, mocks, cache);
    return nativeRequire(request);
  };
  mod._compile(output, absolute);
  return mod.exports;
}
