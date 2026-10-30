#!/usr/bin/env node
/**
 * smoke-edge.mjs — post-deploy assertions for the edge functions.
 *
 * Runs immediately after `supabase functions deploy`. If it fails, the deploy
 * workflow rolls back. So: read-only (no writes to prod), fast, and it FAILS
 * rather than skips when a secret is missing — a skipped check in a deploy gate
 * is a hole, not a pass.
 *
 * Every assertion carries an en and a hi label; the summary is printed in both.
 *
 *   node scripts/smoke-edge.mjs --require-all --report reports/deploys/edge.md
 *
 * Required env: SUPABASE_URL, SUPABASE_ANON_KEY, SMOKE_OWNER_JWT,
 *               SMOKE_NONOWNER_JWT
 * Optional:     SMOKE_SUBJECT (slug; defaults to the first emitted card)
 *               SUPABASE_SERVICE_ROLE_KEY (enables the metrics 200 assertion)
 *               SMOKE_BURST (default 120 — must exceed the 100/min anon cap)
 *
 * Endpoint names are taken from this repo, not the spec: the redacted public
 * surface is served statically (`public/answers/**`, `public/a/**`) and the
 * Hono app under `src/api/v1` is orphaned (tests only), so there is no
 * deployed `/v1/answer` to assert. The bilingual contract is therefore checked
 * on `/answer-cards?lang=`, which is the surface that actually exists:
 *   - `/answer-cards?lang=<not hi|en>` → 422 (language validated)
 *   - `/answer-cards?lang=hi|en`       → both 200 for the owner, equal birth_hash
 * `metrics` is service-role only here (401 anonymous), not public.
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const EDGE = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY;
const OWNER = process.env.SMOKE_OWNER_JWT;
const NONOWNER = process.env.SMOKE_NONOWNER_JWT;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const REQUIRE_ALL = process.argv.includes('--require-all');
const reportIdx = process.argv.indexOf('--report');
const REPORT = reportIdx > -1 ? process.argv[reportIdx + 1] : null;
const TIMEOUT_MS = 10_000;
const BURST = Number(process.env.SMOKE_BURST ?? 120);

const lf = s => s.replace(/\r\n/g, '\n');
const results = [];

function record(id, en, hi, status, detail = '') {
  results.push({ id, en, hi, status, detail });
}

async function check(id, en, hi, fn) {
  try {
    const detail = await fn();
    record(id, en, hi, 'pass', detail ?? '');
  } catch (err) {
    record(id, en, hi, 'fail', err.message);
  }
}

function skip(id, en, hi, why) {
  record(id, en, hi, REQUIRE_ALL ? 'fail' : 'skip', `skipped: ${why}`);
}

const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

async function call(path, { method = 'GET', auth, headers = {}, body } = {}) {
  const res = await fetch(`${EDGE}/functions/v1/${path}`, {
    method,
    headers: {
      apikey: ANON,
      ...(auth === 'owner' ? { Authorization: `Bearer ${OWNER}` } : {}),
      ...(auth === 'nonowner' ? { Authorization: `Bearer ${NONOWNER}` } : {}),
      ...(auth === 'service' ? { Authorization: `Bearer ${SERVICE}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* non-JSON is fine */
  }
  return { status: res.status, headers: res.headers, text, json };
}

// ── Fixtures ────────────────────────────────────────────────────────────────
if (!EDGE || !ANON) {
  console.error('SUPABASE_URL and SUPABASE_ANON_KEY are required');
  process.exit(2);
}

const ANSWERS = join(ROOT, 'public', 'answers');
const SUBJECT =
  process.env.SMOKE_SUBJECT ??
  (existsSync(ANSWERS)
    ? readdirSync(ANSWERS, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name)
        .sort()[0]
    : null);

// ── Checks ──────────────────────────────────────────────────────────────────

await check('health', 'health check returns 200', 'हेल्थ चेक 200 लौटाता है', async () => {
  const r = await call('health');
  assert(r.status === 200, `expected 200, got ${r.status}`);
});

await check(
  'cors',
  'preflight carries CORS and security headers',
  'प्रीफ़्लाइट CORS और सुरक्षा हेडर भेजता है',
  async () => {
    const r = await call('answer-cards', { method: 'OPTIONS' });
    assert(r.status < 300, `expected <300, got ${r.status}`);
    assert(r.headers.get('access-control-allow-origin'), 'missing access-control-allow-origin');
    assert(r.headers.get('x-content-type-options') === 'nosniff', 'missing nosniff');
    assert(r.headers.get('x-frame-options'), 'missing x-frame-options');
  },
);

await check(
  'ac-anon',
  'answer-cards rejects anonymous callers',
  'answer-cards अनाम कॉलर को अस्वीकार करता है',
  async () => {
    const r = await call('answer-cards?person=smoke');
    assert(r.status === 401, `expected 401, got ${r.status}`);
  },
);

if (!OWNER || !NONOWNER || !SUBJECT) {
  skip(
    'ac-nonowner',
    'answer-cards returns 404 (not 403) for a non-owner',
    'गैर-मालिक के लिए 404 (403 नहीं)',
    'SMOKE_OWNER_JWT / SMOKE_NONOWNER_JWT / subject missing',
  );
  skip(
    'ac-owner',
    'answer-cards serves the full card to the owner',
    'मालिक को पूरा कार्ड मिलता है',
    'SMOKE_OWNER_JWT / subject missing',
  );
  skip(
    'ac-indistinguishable',
    'absent and not-yours answer identically (no enumeration)',
    'अनुपस्थित और गैर-मालिक का उत्तर समान (गणना संभव नहीं)',
    'SMOKE_NONOWNER_JWT / subject missing',
  );
  skip(
    'ac-langs',
    'both languages serve, birth_hash matches across them',
    'दोनों भाषाएँ उपलब्ध, birth_hash समान',
    'SMOKE_OWNER_JWT / subject missing',
  );
  skip(
    'ac-badlang',
    'an unsupported language is rejected with 422',
    'असमर्थित भाषा 422 के साथ अस्वीकृत',
    'SMOKE_OWNER_JWT / subject missing',
  );
  skip(
    'ac-no-pii-on-404',
    'the 404 body carries no birth data',
    '404 उत्तर में जन्म डेटा नहीं',
    'SMOKE_NONOWNER_JWT / subject missing',
  );
} else {
  await check(
    'ac-nonowner',
    'answer-cards returns 404 (not 403) for a non-owner',
    'गैर-मालिक के लिए 404 (403 नहीं)',
    async () => {
      const r = await call(`answer-cards?person=${SUBJECT}`, { auth: 'nonowner' });
      assert(r.status === 404, `expected 404, got ${r.status}`);
      assert(r.status !== 403, 'must not leak existence via 403');
    },
  );

  await check(
    'ac-owner',
    'answer-cards serves the full card to the owner',
    'मालिक को पूरा कार्ड मिलता है',
    async () => {
      const r = await call(`answer-cards?person=${SUBJECT}`, { auth: 'owner' });
      assert(r.status === 200, `expected 200, got ${r.status}`);
      const s = r.json?.data?.subject;
      assert(s, 'no subject in response');
      for (const k of ['dob', 'tob', 'place']) assert(s[k] !== undefined, `owner missing ${k}`);
      assert(['owner', 'admin'].includes(r.json.viewer), `unexpected viewer ${r.json.viewer}`);
    },
  );

  await check(
    'ac-indistinguishable',
    'absent and not-yours answer identically (no enumeration)',
    'अनुपस्थित और गैर-मालिक का उत्तर समान (गणना संभव नहीं)',
    async () => {
      const absent = await call('answer-cards?person=definitely-not-a-real-person-xyz', {
        auth: 'nonowner',
      });
      const notYours = await call(`answer-cards?person=${SUBJECT}`, { auth: 'nonowner' });
      assert(
        absent.status === notYours.status,
        `status differs: ${absent.status} vs ${notYours.status}`,
      );
      assert(lf(absent.text).trim() === lf(notYours.text).trim(), 'body differs — leaks existence');
    },
  );

  await check(
    'ac-langs',
    'both languages serve, birth_hash matches across them',
    'दोनों भाषाएँ उपलब्ध, birth_hash समान',
    async () => {
      const hi = await call(`answer-cards?person=${SUBJECT}&lang=hi`, { auth: 'owner' });
      const en = await call(`answer-cards?person=${SUBJECT}&lang=en`, { auth: 'owner' });
      assert(hi.status === 200 && en.status === 200, `statuses ${hi.status}/${en.status}`);
      assert(
        hi.json.data.subject.birth_hash === en.json.data.subject.birth_hash,
        'birth_hash differs across languages',
      );
      assert(hi.text !== en.text, 'identical bodies — language not applied');
    },
  );

  await check(
    'ac-badlang',
    'an unsupported language is rejected with 422',
    'असमर्थित भाषा 422 के साथ अस्वीकृत',
    async () => {
      const r = await call(`answer-cards?person=${SUBJECT}&lang=fr`, { auth: 'owner' });
      assert(r.status === 422, `expected 422, got ${r.status}`);
    },
  );

  await check(
    'ac-no-pii-on-404',
    'the 404 body carries no birth data',
    '404 उत्तर में जन्म डेटा नहीं',
    async () => {
      const r = await call(`answer-cards?person=${SUBJECT}`, { auth: 'nonowner' });
      assert(!/\d{4}-\d{2}-\d{2}/.test(r.text), 'ISO date leaked into a 404 body');
    },
  );
}

await check(
  'api-keys-auth',
  'api-keys rejects anonymous callers',
  'api-keys अनाम कॉलर को अस्वीकार करता है',
  async () => {
    const r = await call('api-keys', { method: 'POST', body: { action: 'list' } });
    assert(r.status === 401, `expected 401, got ${r.status}`);
  },
);

await check(
  'metrics-auth',
  'metrics rejects anonymous callers (service-role only)',
  'metrics अनाम कॉलर को अस्वीकार करता है (केवल service-role)',
  async () => {
    const r = await call('metrics');
    assert(r.status === 401, `expected 401, got ${r.status}`);
  },
);

if (SERVICE) {
  await check(
    'metrics-ok',
    'metrics serves the scraper and leaks no service-role key',
    'metrics स्क्रैपर को उपलब्ध, service-role कुंजी उजागर नहीं',
    async () => {
      const r = await call('metrics', { auth: 'service' });
      assert(r.status === 200, `expected 200, got ${r.status}`);
      if (SERVICE.length > 40) {
        assert(!r.text.includes(SERVICE), 'service-role key appears in the metrics body');
      }
    },
  );
} else {
  skip(
    'metrics-ok',
    'metrics serves the scraper and leaks no service-role key',
    'metrics स्क्रैपर को उपलब्ध, service-role कुंजी उजागर नहीं',
    'SUPABASE_SERVICE_ROLE_KEY missing',
  );
}

if (!OWNER) {
  skip(
    'ssrf',
    'a link-local URL is rejected by the SSRF guard',
    'लिंक-लोकल URL SSRF सुरक्षा द्वारा अस्वीकृत',
    'SMOKE_OWNER_JWT missing (the guard runs after auth)',
  );
} else {
  await check(
    'ssrf',
    'a link-local URL is rejected by the SSRF guard',
    'लिंक-लोकल URL SSRF सुरक्षा द्वारा अस्वीकृत',
    async () => {
      const r = await call('knowledge/ingest-url', {
        method: 'POST',
        auth: 'owner',
        body: { url: 'http://169.254.169.254/latest/meta-data/' },
      });
      assert(r.status < 500, `expected <500, got ${r.status} — guard may be bypassed`);
      assert(r.status !== 200, `expected a rejection, got 200 — SSRF guard did not engage`);
    },
  );
}

// Runs LAST: the burst consumes the per-IP budget for everything after it.
await check(
  'rate-limit',
  'a burst produces 429 with Retry-After, then recovers',
  'बर्स्ट पर 429 और Retry-After, फिर सामान्य',
  async () => {
    let limited = null;
    for (let i = 0; i < BURST && !limited; i++) {
      const r = await call('get-panchang', {
        method: 'POST',
        body: { date: '2026-01-01', latitude: 28.6139, longitude: 77.209 },
      });
      if (r.status === 429) limited = r;
    }
    assert(limited, `never rate limited after ${BURST} calls`);
    assert(limited.headers.get('retry-after'), 'missing Retry-After on 429');
    await new Promise(res => setTimeout(res, 1500));
    const after = await call('get-panchang', {
      method: 'POST',
      body: { date: '2026-01-01', latitude: 28.6139, longitude: 77.209 },
    });
    assert(after.status < 500, `still failing after backoff: ${after.status}`);
  },
);

// ── Report ──────────────────────────────────────────────────────────────────

const pad = (s, n) => s + ' '.repeat(Math.max(0, n - s.length));
for (const r of results) {
  console.log(`${pad(r.status.toUpperCase(), 5)} ${pad(r.en, 58)} | ${r.hi}`);
  if (r.detail) console.log(`      ${r.detail}`);
}

const count = s => results.filter(r => r.status === s).length;
const summaryEn = `${count('pass')} passed, ${count('fail')} failed, ${count('skip')} skipped`;
const summaryHi = `${count('pass')} सफल, ${count('fail')} विफल, ${count('skip')} छोड़े गए`;
console.log(`\n${summaryEn}\n${summaryHi}`);

if (REPORT) {
  mkdirSync(dirname(REPORT), { recursive: true });
  const md = [
    `# Edge smoke — ${new Date().toISOString()}`,
    '',
    '## English',
    '',
    summaryEn,
    '',
    ...results.map(r => `- **${r.status}** ${r.en}${r.detail ? ` — ${r.detail}` : ''}`),
    '',
    '## हिंदी',
    '',
    summaryHi,
    '',
    ...results.map(r => `- **${r.status}** ${r.hi}`),
    '',
    `Source: \`${process.env.GITHUB_SHA ?? 'local'}\``,
  ].join('\n');
  writeFileSync(REPORT, `${md}\n`, 'utf8');
  console.log(`report: ${REPORT}`);
}

process.exit(count('fail') > 0 ? 1 : 0);
