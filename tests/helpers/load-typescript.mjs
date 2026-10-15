import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInThisContext } from 'node:vm';
import ts from 'typescript';

const root = fileURLToPath(new URL('../../', import.meta.url));
const requirePackage = createRequire(new URL('../../package.json', import.meta.url));

// Execute the application's real TS/TSX with explicit boundary fixtures. Each
// load has its own module cache; no credential or network access is needed.
export function loadTypeScript(relativePath, { imports = {}, globals = {} } = {}) {
  const cache = new Map();
  const scope = {
    process: { env: {} },
    fetch: () => { throw new Error('Unexpected network request in fixture'); },
    ...globals,
  };

  function load(path) {
    const candidates = extname(path) ? [path] : [path + '.ts', path + '.tsx', path + '.js', resolve(path, 'index.ts')];
    const filename = candidates.find(existsSync);
    if (!filename) throw new Error(`Cannot resolve fixture module: ${path}`);
    if (cache.has(filename)) return cache.get(filename).exports;

    const fixtureModule = { exports: {} };
    cache.set(filename, fixtureModule);
    const code = ts.transpileModule(readFileSync(filename, 'utf8'), {
      fileName: filename,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;

    const requireModule = (name) => {
      if (Object.hasOwn(imports, name)) return imports[name];
      if (name.endsWith('.css')) return {};
      if (name.startsWith('@/')) return load(resolve(root, name.slice(2)));
      if (name.startsWith('.')) return load(resolve(dirname(filename), name));
      return requirePackage(name);
    };

    const keys = Object.keys(scope);
    const evaluate = runInThisContext(`(function(require, module, exports, ${keys.join(',')}) {\n${code}\n})`, { filename });
    evaluate(requireModule, fixtureModule, fixtureModule.exports, ...keys.map(key => scope[key]));
    return fixtureModule.exports;
  }

  return load(resolve(root, relativePath));
}
