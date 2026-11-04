#!/usr/bin/env node
/**
 * drill-killswitch.mjs — prove each kill switch actually cuts.
 *
 * For every coarse flag it: flips the `kill_switches` row on, asserts the
 * dependent surface returns **503 with a bilingual body**, then flips it back
 * off. An alarm or a switch nobody has seen fire is a hypothesis.
 *
 *   SUPABASE_URL=… SUPABASE_ANON_KEY=… SUPABASE_SERVICE_ROLE_KEY=… \
 *     node scripts/drill-killswitch.mjs
 *
 * Required env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 *
 * Exit codes: 0 all switches verified · 1 an assertion failed · 2 preflight
 *
 * The alarm half of the week-17 gate ("push a synthetic metric over threshold")
 * is an operator step — the procedure is in docs/observability/runbooks.md and
 * linked from each budget in observability/alerts/budgets.yml. It is recorded in
 * the report as `manual` rather than silently claimed.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const EDGE = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const arg = (name, fallback = null) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? (process.argv[i + 1] ?? true) : fallback;
};
const DATE = new Date().toISOString().slice(0, 10);
const REPORT = String(arg('report', join('reports', 'drills', `killswitch-${DATE}.md`)));
const TIMEOUT_MS = 10_000;

const results = [];
const record = (id, en, hi, status, detail = '') => results.push({ id, en, hi, status, detail });
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

async function check(id, en, hi, fn) {
  try {
    record(id, en, hi, 'pass', (await fn()) ?? '');
  } catch (err) {
    record(id, en, hi, 'fail', err.message);
  }
}

if (!EDGE || !ANON || !SERVICE) {
  console.error('SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are required');
  console.error('SUPABASE_URL, SUPABASE_ANON_KEY और SUPABASE_SERVICE_ROLE_KEY आवश्यक हैं');
  process.exit(2);
}

const setFlag = async (flag, enabled) => {
  const res = await fetch(
    `${EDGE}/rest/v1/kill_switches?feature=eq.${encodeURIComponent(flag)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: SERVICE,
        Authorization: `Bearer ${SERVICE}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ enabled }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    },
  );
  assert(res.ok, `PATCH ${flag}=${enabled} failed: ${res.status}`);
};

const call = async (path, { method = 'GET', body, headers = {} } = {}) => {
  const res = await fetch(`${EDGE}/functions/v1/${path}`, {
    method,
    headers: {
      apikey: ANON,
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
  return { status: res.status, json, text };
};

const assertBilingual503 = (r, flag) => {
  assert(r.status === 503, `${flag}: expected 503, got ${r.status}`);
  assert(r.json?.error === 'service_unavailable', `${flag}: unexpected error body`);
  assert(typeof r.json?.message?.hi === 'string' && r.json.message.hi.length > 0, `${flag}: missing hi`);
  assert(typeof r.json?.message?.en === 'string' && r.json.message.en.length > 0, `${flag}: missing en`);
  return '503 with hi+en';
};

// flag → the surface it must cut, and the request that proves it.
const CASES = [
  {
    flag: 'killswitch.api',
    en: 'killswitch.api returns 503 (bilingual) on the public API surface',
    hi: 'killswitch.api सार्वजनिक API पर 503 (द्विभाषी) लौटाता है',
    probe: () => call('answer-cards?person=smoke'),
  },
  {
    flag: 'killswitch.edge',
    en: 'killswitch.edge short-circuits a different edge function',
    hi: 'killswitch.edge किसी अन्य एज फ़ंक्शन को रोकता है',
    probe: () => call('get-panchang', { method: 'POST', body: {} }),
  },
  {
    flag: 'killswitch.telemetry',
    en: 'killswitch.telemetry stops client log forwarding',
    hi: 'killswitch.telemetry क्लाइंट लॉग भेजना रोकता है',
    probe: () => call('ingest-logs', { method: 'POST', body: { level: 'warn' } }),
  },
];

console.log('\ndrill-killswitch — force each switch, assert it cuts, flip it back');
console.log('drill-killswitch — हर स्विच दबाएँ, कटौती जाँचें, वापस लगाएँ\n');

try {
  for (const c of CASES) {
    await check(c.flag, c.en, c.hi, async () => {
      await setFlag(c.flag, false);
      const before = await c.probe();
      assert(before.status !== 503, `${c.flag}: 503 before the switch was pulled`);

      await setFlag(c.flag, true);
      await new Promise(r => setTimeout(r, 300));
      const during = await c.probe();
      const detail = assertBilingual503(during, c.flag);

      await setFlag(c.flag, false);
      await new Promise(r => setTimeout(r, 300));
      const after = await c.probe();
      assert(after.status !== 503, `${c.flag}: still 503 after flipping back`);

      return detail;
    });
  }
} finally {
  // Never leave a switch pulled — a drill must not become an outage.
  for (const c of CASES) {
    try {
      await setFlag(c.flag, false);
    } catch {
      /* best effort */
    }
  }
}

record(
  'alarm-observation',
  'every budget alarm observed firing once',
  'हर बजट अलार्म एक बार बजता हुआ देखा गया',
  'manual',
  'operator step — docs/observability/runbooks.md, linked from observability/alerts/budgets.yml',
);

// ── Report ──────────────────────────────────────────────────────────────────

const pad = (s, n) => s + ' '.repeat(Math.max(0, n - s.length));
for (const r of results) {
  console.log(`${pad(r.status.toUpperCase(), 5)} ${pad(r.en, 58)} | ${r.hi}`);
  if (r.detail) console.log(`      ${r.detail}`);
}

const count = s => results.filter(r => r.status === s).length;
const summaryEn = `${count('pass')} passed, ${count('fail')} failed, ${count('manual')} manual, ${count('skip')} skipped`;
const summaryHi = `${count('pass')} सफल, ${count('fail')} विफल, ${count('manual')} मैन्युअल, ${count('skip')} छोड़े गए`;
console.log(`\n${summaryEn}\n${summaryHi}`);

mkdirSync(dirname(REPORT), { recursive: true });
writeFileSync(
  REPORT,
  `# Kill-switch drill — ${DATE}

## English

**${summaryEn}**

Each switch was pulled, the dependent surface asserted to return 503 with a
bilingual body, then flipped back off.

${results.map(r => `- **${r.status}** ${r.en}${r.detail ? ` — ${r.detail}` : ''}`).join('\n')}

## हिंदी

**${summaryHi}**

प्रत्येक स्विच दबाया गया, संबंधित सतह से द्विभाषी उत्तर के साथ 503 की अपेक्षा की
गई, फिर वापस बंद किया गया।

${results.map(r => `- **${r.status}** ${r.hi}`).join('\n')}

Source: \`${process.env.GITHUB_SHA ?? 'local'}\`
`,
  'utf8',
);
console.log(`report: ${REPORT}\n`);

process.exit(count('fail') > 0 ? 1 : 0);
