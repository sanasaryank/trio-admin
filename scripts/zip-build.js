/**
 * Zips the out/ folder for deployment.
 * Usage: node scripts/zip-build.js [dev|stage|prod]
 * Output: {env}-{version}.zip (e.g. dev-1.0.2.zip)
 */
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const root = resolve(__dirname, '..');
const pkg = require(resolve(root, 'package.json'));
const version = pkg.version || '0.0.0';
const env = process.argv[2] || 'prod';
const outDir = resolve(root, 'out');
const zipName = `${env}-${version}.zip`;
const zipPath = resolve(root, zipName);

if (!existsSync(outDir)) {
  console.error('out/ folder not found. Run a build first (e.g. npm run build:dev).');
  process.exit(1);
}

const isWindows = process.platform === 'win32';
try {
  if (isWindows) {
    execSync(
      `powershell Compress-Archive -Path "${outDir}" -DestinationPath "${zipPath}" -Force`,
      { stdio: 'inherit', cwd: root }
    );
  } else {
    execSync(`zip -r "${zipPath}" out`, { stdio: 'inherit', cwd: root });
  }
  console.log(`Created ${zipName}`);
} catch (err) {
  console.error('Zip failed:', err.message);
  process.exit(1);
}
