/**
 * Patches @wdio/logger/build/index.js to remove top-level await.
 *
 * The original file uses `await import(...)` at the top level to pick between
 * web.js and node.js. This prevents Node's CJS loader from require()-ing the
 * ESM module chain (ERR_REQUIRE_ASYNC_MODULE). Since WDIO always runs in Node,
 * we replace it with a direct static re-export from node.js.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const loggerPkg = require.resolve('@wdio/logger/package.json');
const indexPath = loggerPkg.replace('package.json', 'build/index.js');

const patched = `/* patched by scripts/patch-logger.mjs — removes top-level await */\nexport { default } from './node.js';\n`;

const current = readFileSync(indexPath, 'utf8');
if (current.includes('await import')) {
  writeFileSync(indexPath, patched);
  console.log('Patched @wdio/logger/build/index.js (removed top-level await)');
} else {
  console.log('@wdio/logger/build/index.js already patched, skipping');
}
