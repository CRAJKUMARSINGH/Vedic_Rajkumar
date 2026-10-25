/**
 * agentMode.ts — "the app tells the AI it is being used by an AI".
 *
 * Two triggers, no guessing:
 *   /path?agent=1            → in-app AI mode (banner + copy button)
 *   /path?format=markdown    → serve the answer card as plain text
 *
 * The `Accept: text/markdown` variant of the spec is not implementable in the
 * browser (script cannot read request headers), so it is honored by the static
 * host instead. Everything an agent needs is also reachable directly at
 * /answers/index.json and /llms.txt.
 */

/** Kept local (not imported from resolveJatak) so the entry chunk does not
 *  pull the seed-bank JSON in just to build a URL. */
function slug(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function params(search: string): URLSearchParams {
  return new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
}

/** In-app AI mode badge (also used as the plain-text trigger). */
export function isAgentMode(search = window.location.search): boolean {
  const p = params(search);
  return p.get('agent') === '1' || p.get('format') === 'markdown';
}

export function agentPerson(search = window.location.search): string | null {
  const p = params(search);
  return p.get('person') || p.get('name') || null;
}

export function answerCardPath(person: string, topic = '_all'): string {
  return `/answers/${slug(person)}/${topic}.md`;
}

/**
 * When an agent hits a URL in agent mode, print the precomputed answer card
 * instead of mounting the React shell. Returns true when the caller must NOT
 * mount React.
 *
 * A missing card 404s through the SPA rewrite and comes back as index.html, so
 * an HTML body is treated as "not found" and the app mounts normally.
 */
export async function serveAgentText(search = window.location.search): Promise<boolean> {
  if (!isAgentMode(search)) return false;

  const person = agentPerson(search);
  const path = person ? answerCardPath(person) : '/answers/index.json';

  let text: string;
  try {
    const res = await fetch(path, { headers: { Accept: 'text/markdown, application/json, text/plain' } });
    const body = await res.text();
    const isHtml = (res.headers.get('content-type') ?? '').includes('text/html') ||
      body.trimStart().startsWith('<');
    if (!res.ok || isHtml) return false;
    text = person
      ? body
      : `# Vedic Rajkumar — answer index\n\nNo \`person\` given. Pass ?agent=1&person=<name>.\n\n\`\`\`json\n${body}\n\`\`\`\n`;
  } catch {
    return false;
  }

  const root = document.getElementById('root');
  if (!root) return false;
  root.innerHTML = '';
  const pre = document.createElement('pre');
  pre.style.cssText = 'white-space:pre-wrap;word-break:break-word;padding:16px;font:13px/1.5 ui-monospace,monospace;';
  pre.textContent = text;
  root.appendChild(pre);
  document.title = person ? `${person} — Direct Answer` : 'Vedic Rajkumar — Answer Index';
  return true;
}
