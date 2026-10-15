const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { createRequire } = require('node:module');
const root = path.resolve(__dirname, '..');
const rosRequire = createRequire(path.join(root, 'packages/ros/package.json'));
const coreRequire = createRequire(path.join(root, 'packages/mpa-ssr/package.json'));
const serialize = rosRequire('serialize-javascript');
const webpack = coreRequire('webpack');
const middleware = coreRequire('webpack-dev-middleware');

async function main() {
  const original = { text: '</script><script>alert(1)</script>\u2028\u2029', nested: [null, 42, 'hello'] };
  const encoded = serialize(original, { isJSON: true });
  assert(!encoded.includes('</script>'));
  assert.deepEqual(JSON.parse(encoded), original);

  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'h5-security-'));
  fs.writeFileSync(path.join(temp, 'entry.js'), 'globalThis.h5SmokeTest = true;');
  const compiler = webpack({ mode: 'development', context: temp, entry: './entry.js', output: { path: path.join(temp, 'dist'), filename: 'bundle.js', publicPath: '/assets/' } });
  const dev = middleware(compiler, { publicPath: '/assets', stats: false });
  const server = http.createServer((req, res) => dev(req, res, () => { res.statusCode = 404; res.end('not found'); }));
  try {
    await new Promise(resolve => dev.waitUntilValid(resolve));
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    async function request(route) {
      return new Promise((resolve, reject) => http.get({ hostname: '127.0.0.1', port, path: route }, res => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, body }));
      }).on('error', reject));
    }
    const good = await request('/assets/bundle.js');
    assert.equal(good.status, 200);
    assert(good.body.includes('h5SmokeTest'));
    for (const route of ['/assets../entry.js', '/assets..%2fentry.js', '/assets/../entry.js']) {
      const blocked = await request(route);
      assert.notEqual(blocked.status, 200, route);
      assert(!blocked.body.includes('globalThis.h5SmokeTest = true;'), route);
    }
    console.log('PASS: JSON serialization escapes script markup and round-trips data; webpack middleware serves bundles and rejects traversal paths.');
  } finally {
    await new Promise(resolve => server.close(resolve));
    await new Promise(resolve => dev.close(resolve));
    await new Promise(resolve => compiler.close(resolve));
    fs.rmSync(temp, { recursive: true, force: true });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
