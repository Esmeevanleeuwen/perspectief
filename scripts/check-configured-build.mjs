import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

// Local read-only fixture: no production database, users, or credentials.
const server = createServer((request, response) => {
  const path = new URL(request.url, 'http://localhost').pathname;
  let result = [];
  if (path.endsWith('/rpc/publishing_catalog')) {
    result = { items: [], total: 0, origin: 'https://meridiancollective.nl' };
  } else if (path.endsWith('/rpc/publishing_article') || path.endsWith('/rpc/publishing_public_report') || path.endsWith('/rpc/publishing_article_address')) {
    result = null;
  }
  response.writeHead(200, { 'Content-Type': 'application/json', 'Content-Range': '*/0' });
  response.end(JSON.stringify(result));
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const url = `http://127.0.0.1:${server.address().port}`;
const env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: url,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'local-fixture-not-a-real-api-key',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'local-fixture-not-a-real-api-key',
  DOSSIER_CORE_API_URL: `${url}/functions/v1/dossier-core`,
  NEXT_PUBLIC_SITE_URL: 'https://meridiancollective.nl',
  VERCEL_ENV: 'production',
  NEXT_TELEMETRY_DISABLED: '1',
};
try {
  const child = spawn('npm', ['run', 'build'], { env, stdio: 'inherit' });
  const [code, signal] = await once(child, 'exit');
  if (signal) console.error(`Build interrupted: ${signal}`);
  process.exitCode = code ?? 1;
} finally {
  server.closeAllConnections();
  server.close();
}
