;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="5a81c5e4-30be-7f8b-c9ef-9489af452fa2")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,683558,e=>{"use strict";let t;try{var r=window;r._sentryModuleMetadata=r._sentryModuleMetadata||{},r._sentryModuleMetadata[(new r.Error).stack]=Object.assign({},r._sentryModuleMetadata[(new r.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}let n=()=>Promise.reject(Error("The workspace is not connected yet.")),o={copyFile:n,createFile:n,deleteFile:n,getOrigin:()=>null,listFiles:n,readFile:n,readFileBlob:n,replaceFile:n},s=({mindConversationId:e,path:t,userId:r})=>JSON.stringify([r,e,t]),a=o,i=Symbol("disconnected workspace transport"),c=new Set,l=new Map,d=new Map,u=()=>{c.forEach(e=>e())},p=e=>{let t=s(e);l.set(t,(l.get(t)??0)+1),d.get(t)?.forEach(e=>e())},f=()=>{if(0===l.size)return;let e=[...l.keys()];l.clear(),e.forEach(e=>d.get(e)?.forEach(e=>e()))},h=async(e,t)=>{let r=a,n=i;await e(r),i===n&&p(t)};e.s(["f",0,{connectTransport:e=>{let r=Symbol("workspace transport connection"),n=t;return i=r,a=e,t=void 0,n?.(),f(),t=e.subscribeExternalFileChanges?.(e=>{i===r&&p(e)}),u(),()=>{if(i!==r)return;let e=t;t=void 0,a=o,i=Symbol("disconnected workspace transport"),e?.(),f(),u()}},copyFile:e=>h(t=>t.copyFile(e),{mindConversationId:e.mindConversationId,path:e.destinationPath,userId:e.userId}),createFile:e=>h(t=>t.createFile(e),e),deleteFile:e=>h(t=>t.deleteFile(e),e),getFileRevision:e=>l.get(s(e))??0,getOrigin:e=>a.getOrigin(e),listFiles:e=>a.listFiles(e),readFile:e=>a.readFile(e),readFileBlob:e=>a.readFileBlob(e),replaceFile:e=>h(t=>t.replaceFile(e),e),subscribeConnection:e=>(c.add(e),()=>{c.delete(e)}),subscribeFile:(e,t)=>{let r=s(e),n=d.get(r)??new Set;return n.add(t),d.set(r,n),()=>{n.delete(t),0===n.size&&d.delete(r)}}}])},623194,74521,374056,e=>{"use strict";e.i(62168);var t=e.i(194334),r=e.i(512549);e.i(153454);var n=e.i(468566);e.i(750043);var o=e.i(944037);try{var s=window;s._sentryModuleMetadata=s._sentryModuleMetadata||{},s._sentryModuleMetadata[(new s.Error).stack]=Object.assign({},s._sentryModuleMetadata[(new s.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}let a="/sandbox/workspace/files/",i=[...t.P.split("; ").map(e=>e.startsWith("font-src ")?e.replace("font-src ","font-src 'self' "):e.startsWith("worker-src ")?"worker-src blob:":e),r.g].join("; "),c=`
const FILES_PATH = ${JSON.stringify(a)};
const SHELL_PATH = ${JSON.stringify(n.u)};
const SHELL_SOURCE = ${JSON.stringify((0,n.i)())};
const SHELL_TAG = '<script src="' + SHELL_PATH + '"></script>';
const CONTENT_TYPES = ${JSON.stringify({avif:"image/avif",css:"text/css; charset=utf-8",gif:"image/gif",ico:"image/x-icon",jpeg:"image/jpeg",jpg:"image/jpeg",js:"text/javascript; charset=utf-8",json:"application/json; charset=utf-8",mjs:"text/javascript; charset=utf-8",mp3:"audio/mpeg",mp4:"video/mp4",ogg:"audio/ogg",otf:"font/otf",png:"image/png",svg:"image/svg+xml",ttf:"font/ttf",wasm:"application/wasm",wav:"audio/wav",webm:"video/webm",webp:"image/webp",woff:"font/woff",woff2:"font/woff2"})};
const MAX_ARTIFACT_HTML_BYTES = 1048576;
const ARTIFACT_CSP = ${JSON.stringify(i)};
const PERMISSIONS_POLICY = ${JSON.stringify(r.G)};
// A script before the doctype would switch the document into quirks mode, so the shell goes after any leading doctype.
const LEADING_DOCTYPE = /^(?:\\s|<!--[\\s\\S]*?-->)*<!doctype[^>]*>/i;

const getWorkspacePath = url => {
  const segments = url.pathname.slice(FILES_PATH.length).split('/').map(decodeURIComponent);
  if (segments.some(segment => segment === '' || segment === '.' || segment === '..' || segment.includes('/') || segment.includes('\\\\'))) {
    throw new Error('Invalid workspace file URL.');
  }
  return segments;
};

const getFile = async segments => {
  const name = segments[segments.length - 1];
  let directory = await navigator.storage.getDirectory();
  for (const segment of segments.slice(0, -1)) directory = await directory.getDirectoryHandle(segment);
  return (await directory.getFileHandle(name)).getFile();
};

const injectShell = html => {
  const doctype = html.match(LEADING_DOCTYPE);
  return doctype ? doctype[0] + SHELL_TAG + html.slice(doctype[0].length) : '<!DOCTYPE html>' + SHELL_TAG + html;
};

const isArtifactNavigation = (request, extension) =>
  (extension === 'html' || extension === 'htm') && request.mode === 'navigate' && request.destination === 'iframe';

const handleFileRequest = async request => {
  let segments;
  try {
    segments = getWorkspacePath(new URL(request.url));
  } catch {
    return new Response(null, { status: 400 });
  }
  try {
    const file = await getFile(segments);
    const extension = segments[segments.length - 1].split('.').pop().toLowerCase();
    if (isArtifactNavigation(request, extension)) {
      if (file.size > MAX_ARTIFACT_HTML_BYTES) return new Response(null, { status: 413 });
      return new Response(request.method === 'HEAD' ? null : injectShell(await file.text()), {
        headers: {
          'Cache-Control': 'no-store',
          'Content-Security-Policy': ARTIFACT_CSP,
          'Content-Type': 'text/html; charset=utf-8',
          'Permissions-Policy': PERMISSIONS_POLICY,
          'Referrer-Policy': 'no-referrer',
          'X-Content-Type-Options': 'nosniff'
        },
        status: 200
      });
    }
    return new Response(request.method === 'HEAD' ? null : file, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Security-Policy': "default-src 'none'; sandbox",
        'Content-Type': CONTENT_TYPES[extension] || 'application/octet-stream',
        'Cross-Origin-Resource-Policy': 'same-origin',
        'X-Content-Type-Options': 'nosniff'
      },
      status: 200
    });
  } catch (error) {
    const isMissing = error && (error.name === 'NotFoundError' || error.name === 'TypeMismatchError');
    return new Response(null, { status: isMissing ? 404 : 500 });
  }
};

const handleShellRequest = request =>
  new Response(request.method === 'HEAD' ? null : SHELL_SOURCE, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/javascript; charset=utf-8',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'X-Content-Type-Options': 'nosniff'
    },
    status: 200
  });

self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'workspace-sw-version' && event.ports[0]) {
    event.ports[0].postMessage({ type: 'workspace-sw-version', version: VERSION });
  }
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if ((request.method !== 'GET' && request.method !== 'HEAD') || url.origin !== self.location.origin) return;
  if (url.pathname === SHELL_PATH) event.respondWith(handleShellRequest(request));
  else if (url.pathname.startsWith(FILES_PATH)) event.respondWith(handleFileRequest(request));
});
`,l=(0,o.f)(c);e.s(["f",0,1048576,"n",0,a,"b",0,"/sandbox/workspace/service-worker","z",0,"/sandbox/workspace/","q",0,l],74521);try{var d=window;d._sentryModuleMetadata=d._sentryModuleMetadata||{},d._sentryModuleMetadata[(new d.Error).stack]=Object.assign({},d._sentryModuleMetadata[(new d.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}let u="Use a workspace-relative file path without empty, dot, parent, backslash, or control-character segments.",p=/[\u0000-\u001f\u007f\\]/,f=e=>!("string"!=typeof e||0===e.length||e.length>1024||p.test(e))&&e.split("/").every(e=>""!==e&&"."!==e&&".."!==e);e.s(["m",0,u,"e",0,1e3,"k",0,1024,"I",0,f],374056);try{var h=window;h._sentryModuleMetadata=h._sentryModuleMetadata||{},h._sentryModuleMetadata[(new h.Error).stack]=Object.assign({},h._sentryModuleMetadata[(new h.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}e.s(["$",0,e=>{if(!f(e))throw Error(u);return e},"K",0,e=>new TextEncoder().encode(e).byteLength<=1048576],623194)},468566,750043,e=>{"use strict";var t=e.i(62168),r=e.i(194334);try{var n=window;n._sentryModuleMetadata=n._sentryModuleMetadata||{},n._sentryModuleMetadata[(new n.Error).stack]=Object.assign({},n._sentryModuleMetadata[(new n.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}let o=e=>{let t=r.P.split("; ").find(t=>t.startsWith(`${e} `));if(!t)throw Error(`Sandbox CSP is missing ${e}.`);return t};["default-src 'none'",o("script-src"),o("connect-src"),"worker-src 'none'","object-src 'none'","base-uri 'none'"].join("; "),e.s(["I",0,65536,"V",0,65536,"F",0,1024,"_",0,3e4,"e",0,"/sandbox/workspace/module-worker"],750043);try{var s=window;s._sentryModuleMetadata=s._sentryModuleMetadata||{},s._sentryModuleMetadata[(new s.Error).stack]=Object.assign({},s._sentryModuleMetadata[(new s.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}let a=/^[a-z][a-z0-9_-]{0,63}$/,i={bg:"--host-bg",border:"--host-border",borderHover:"--host-border-hover",card:"--host-card",cardFg:"--host-card-fg",error:"--host-error",fg:"--host-fg",fgMuted:"--host-fg-muted",input:"--host-input",muted:"--host-muted",primary:"--host-primary",secondary:"--host-secondary",secondaryFg:"--host-secondary-fg",success:"--host-success"},c=()=>`
  const ARTIFACT_CHANNEL = ${JSON.stringify("venice-workspace-artifacts-v1")};
  const ARTIFACT_DB_NAME = ${JSON.stringify("venice-workspace-artifacts-v1")};
  const ARTIFACT_STORE_NAME = ${JSON.stringify("state")};
  const MAX_ARTIFACT_JSON_BYTES = 65536;
  const MAX_ARTIFACT_ERROR_LENGTH = 1000;
  const MAX_ARTIFACT_DESCRIPTION_LENGTH = 200;
  const ARTIFACT_ACTION_NAME_PATTERN = ${a.toString()};
  const ARTIFACT_ACTION_TIMEOUT_MS = 10000;
  const EMPTY_ARTIFACT_STATE = Object.freeze({ revision: 0, value: null });

  const createArtifactError = (code, message) => Object.assign(new Error(String(message).slice(0, MAX_ARTIFACT_ERROR_LENGTH)), { code });

  const isPlainObject = value => {
    const proto = Object.getPrototypeOf(value);
    return proto === null || proto === Object.prototype || (typeof proto === 'object' && Object.getPrototypeOf(proto) === null);
  };

  const isArtifactJson = (value, ancestors = new Set()) => {
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
    if (typeof value === 'number') return Number.isFinite(value);
    if (typeof value !== 'object' || ancestors.has(value)) return false;
    if (!Array.isArray(value) && !isPlainObject(value)) return false;
    ancestors.add(value);
    const isValid = Array.isArray(value)
      ? value.every(item => isArtifactJson(item, ancestors))
      : Object.keys(value).every(key => value[key] === undefined || isArtifactJson(value[key], ancestors));
    ancestors.delete(value);
    return isValid;
  };

  const toArtifactJson = (value, label) => {
    if (!isArtifactJson(value)) {
      throw createArtifactError('invalid_json', label + ' must be JSON: no cycles, functions, class instances, or non-finite numbers.');
    }
    const serialized = JSON.stringify(value);
    if (serialized === undefined) throw createArtifactError('invalid_json', label + ' must be JSON.');
    if (new TextEncoder().encode(serialized).byteLength > MAX_ARTIFACT_JSON_BYTES) {
      throw createArtifactError('too_large', label + ' exceeds ' + MAX_ARTIFACT_JSON_BYTES / 1024 + ' KiB of JSON.');
    }
    return JSON.parse(serialized);
  };

  const isArtifactRevision = revision => typeof revision === 'number' && Number.isSafeInteger(revision) && revision >= 0;

  let stateDbPromise = null;
  const openStateDb = () => {
    if (typeof indexedDB === 'undefined') return Promise.reject(createArtifactError('unsupported', 'This browser does not support artifact state.'));
    if (!stateDbPromise) {
      stateDbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(ARTIFACT_DB_NAME, 1);
        req.onupgradeneeded = () => {
          if (!req.result.objectStoreNames.contains(ARTIFACT_STORE_NAME)) req.result.createObjectStore(ARTIFACT_STORE_NAME);
        };
        req.onsuccess = () => {
          req.result.onversionchange = () => { req.result.close(); stateDbPromise = null; };
          resolve(req.result);
        };
        req.onerror = () => {
          stateDbPromise = null;
          reject(req.error || createArtifactError('unsupported', 'Failed to open artifact state storage.'));
        };
      });
    }
    return stateDbPromise;
  };

  const withStateTx = async (mode, run) => {
    const db = await openStateDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(ARTIFACT_STORE_NAME, mode);
      let result;
      let abortError = null;
      run(tx.objectStore(ARTIFACT_STORE_NAME), v => { result = v; }, err => { abortError = err; tx.abort(); });
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => { if (!abortError) reject(tx.error || createArtifactError('unsupported', 'Artifact state transaction failed.')); };
      tx.onabort = () => reject(abortError || tx.error || createArtifactError('unsupported', 'Artifact state transaction aborted.'));
    });
  };

  const parseStoredState = raw => {
    if (!raw || typeof raw !== 'object' || !isArtifactRevision(raw.revision) || raw.revision === 0) return EMPTY_ARTIFACT_STATE;
    try { return { revision: raw.revision, value: toArtifactJson(raw.value, 'Stored artifact state') }; }
    catch { return EMPTY_ARTIFACT_STATE; }
  };

  const broadcastArtifactState = (channel, path, state, source) => {
    if (channel) channel.postMessage({ path, revision: state.revision, source, type: 'state-changed', value: state.value });
  };

  const readArtifactState = path =>
    withStateTx('readonly', (store, done) => {
      const req = store.get(path);
      req.onsuccess = () => done(parseStoredState(req.result));
    });

  const writeArtifactState = async (channel, path, value, ifRevision, source) => {
    const json = toArtifactJson(value, 'Artifact state');
    if (ifRevision !== undefined && !isArtifactRevision(ifRevision)) {
      throw createArtifactError('invalid_revision', 'ifRevision must be a non-negative integer.');
    }
    const next = await withStateTx('readwrite', (store, done, abort) => {
      const req = store.get(path);
      req.onsuccess = () => {
        const current = parseStoredState(req.result);
        if (ifRevision !== undefined && ifRevision !== current.revision) {
          abort(createArtifactError('conflict', 'Artifact state is at revision ' + current.revision + ', not ' + ifRevision + '.'));
          return;
        }
        const updated = { revision: current.revision + 1, value: json };
        store.put(updated, path);
        done(updated);
      };
    });
    broadcastArtifactState(channel, path, next, source);
    return { revision: next.revision };
  };

  const deleteArtifactState = async (channel, path, source) => {
    await withStateTx('readwrite', (store, done) => { store.delete(path); done(); });
    broadcastArtifactState(channel, path, EMPTY_ARTIFACT_STATE, source);
  };

  const copyArtifactState = async (channel, fromPath, toPath, source) => {
    const copied = await withStateTx('readwrite', (store, done) => {
      const req = store.get(fromPath);
      req.onsuccess = () => {
        const state = parseStoredState(req.result);
        if (state.revision === 0) store.delete(toPath);
        else store.put(state, toPath);
        done(state);
      };
    });
    broadcastArtifactState(channel, toPath, copied, source);
  };
`;e.s(["u",0,"/sandbox/workspace/artifact-shell.js","c",0,c,"i",0,()=>`
(() => {
  const DEFAULT_THEME = ${JSON.stringify(t.e)};
  const COLOR_PATTERNS = ${JSON.stringify(t.T)}.map(source => new RegExp(source));
  const THEME_VARIABLES = ${JSON.stringify(i)};
  const FILES_PATH = ${JSON.stringify("/sandbox/workspace/files/")};
  const hostTheme = (() => {
    try { return (window.parent !== window && window.parent.workspaceHostTheme) || {}; }
    catch { return {}; }
  })();
  const readColor = key => {
    const value = String(hostTheme[key] || '').trim();
    return COLOR_PATTERNS.some(pattern => pattern.test(value)) ? value : DEFAULT_THEME[key];
  };
  const mode = hostTheme.mode === 'light' ? 'light' : 'dark';
  const root = document.documentElement;
  const head = document.head || root;

  Object.defineProperty(document, 'cookie', { configurable: false, get: () => '', set: () => {} });
  root.setAttribute('data-host-mode', mode);

  const viewport = document.createElement('meta');
  viewport.name = 'viewport';
  viewport.content = 'width=device-width, initial-scale=1';
  head.appendChild(viewport);

  const hostVariables = Object.entries(THEME_VARIABLES).map(([key, name]) => name + ': ' + readColor(key) + ';').join(' ');
  const style = document.createElement('style');
  style.textContent = ':root { color-scheme: ' + mode + '; ' + hostVariables + ' } ' + ${JSON.stringify("*, *::before, *::after { box-sizing: border-box; } :root, html, body { width: 100%; max-width: 100%; min-height: 100%; margin: 0; padding: 0; overflow-x: hidden; background-color: var(--host-bg); color: var(--host-fg); font-family: Inter, system-ui, -apple-system, sans-serif; -webkit-text-size-adjust: 100%; text-size-adjust: 100%; } @media (max-width: 640px) { :where(svg, img) { max-width: 100%; height: auto; } } ")};
  head.appendChild(style);

  const fonts = document.createElement('link');
  fonts.rel = 'stylesheet';
  fonts.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  head.appendChild(fonts);

  ${c()}

  if (location.pathname.startsWith(FILES_PATH)) {
    const path = location.pathname.slice(FILES_PATH.length).split('/').map(decodeURIComponent).join('/');
    const writerId = crypto.randomUUID();
    const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(ARTIFACT_CHANNEL);
    const actions = new Map();
    const listeners = new Set();
    const inFlightPorts = new Set();
    let isClosed = false;
    const loaded = document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise(resolve => window.addEventListener('load', resolve, { once: true }));

    const replyPort = (port, payload) => {
      if (!inFlightPorts.delete(port)) return;
      port.postMessage(payload);
      if (typeof port.close === 'function') port.close();
    };

    if (channel) {
      channel.onmessage = event => {
        const msg = event.data;
        if (!msg || typeof msg !== 'object' || msg.type !== 'state-changed' || msg.path !== path) return;
        if (msg.source === writerId || !isArtifactRevision(msg.revision) || !isArtifactJson(msg.value)) return;
        const state = { revision: msg.revision, value: msg.value };
        listeners.forEach(listener => { try { listener(state); } catch (error) { console.error(error); } });
      };
    }

    window.addEventListener('message', async event => {
      const port = event.ports && event.ports[0];
      const msg = event.data;
      if (isClosed || !port || event.source !== window.parent || event.origin !== location.origin || !msg || typeof msg !== 'object') return;
      inFlightPorts.add(port);
      await loaded;
      if (isClosed || msg.path !== path) {
        replyPort(port, { code: 'not_open', error: 'The artifact is not open.' });
        return;
      }
      if (msg.type === 'workspace-artifact-list-actions') {
        replyPort(port, { actions: Array.from(actions, ([name, a]) => ({ description: a.description, name })) });
      } else if (msg.type === 'workspace-artifact-invoke-action') {
        const action = actions.get(msg.name);
        if (!action) {
          replyPort(port, { code: 'unknown_action', error: 'This artifact has no action named ' + JSON.stringify(String(msg.name)) + '.' });
          return;
        }
        try {
          const output = await action.handler(toArtifactJson(msg.input === undefined ? null : msg.input, 'Action input'));
          replyPort(port, { result: toArtifactJson(output === undefined ? null : output, 'Action result') });
        } catch (error) {
          replyPort(port, {
            code: (error && typeof error.code === 'string' && error.code) || 'action_failed',
            error: String((error && error.message) || error || 'The action failed.').slice(0, MAX_ARTIFACT_ERROR_LENGTH),
          });
        }
      } else {
        replyPort(port, { code: 'invalid_action', error: 'Unsupported artifact request.' });
      }
    });

    window.addEventListener('pagehide', () => {
      isClosed = true;
      listeners.clear();
      actions.clear();
      inFlightPorts.forEach(port => replyPort(port, { code: 'not_open', error: 'The artifact is not open.' }));
      if (channel) channel.close();
    }, { once: true });

    const veniceArtifact = Object.freeze({
      path,
      getState: () => readArtifactState(path),
      setState: (value, options) => writeArtifactState(channel, path, value, options ? options.ifRevision : undefined, writerId),
      subscribe: listener => {
        if (typeof listener !== 'function') throw createArtifactError('invalid_listener', 'subscribe() needs a function.');
        listeners.add(listener);
        return () => { listeners.delete(listener); };
      },
      onAction: (name, handler, options) => {
        if (typeof name !== 'string' || !ARTIFACT_ACTION_NAME_PATTERN.test(name)) {
          throw createArtifactError('invalid_action', 'Action names must match ' + ARTIFACT_ACTION_NAME_PATTERN + '.');
        }
        if (typeof handler !== 'function') throw createArtifactError('invalid_action', 'onAction() needs a handler function.');
        const description = options && typeof options.description === 'string' ? options.description.trim() : '';
        if (!description || description.length > MAX_ARTIFACT_DESCRIPTION_LENGTH) {
          throw createArtifactError('invalid_action', 'Actions need a description of 1 to ' + MAX_ARTIFACT_DESCRIPTION_LENGTH + ' characters.');
        }
        if (actions.has(name)) throw createArtifactError('duplicate_action', 'An action named ' + JSON.stringify(name) + ' is already registered.');
        const action = { description, handler };
        actions.set(name, action);
        return () => { if (actions.get(name) === action) actions.delete(name); };
      },
    });

    Object.defineProperty(window, 'veniceArtifact', { configurable: false, enumerable: true, value: veniceArtifact, writable: false });
    if (window.parent !== window) {
      let navigation = null;
      try { navigation = window.parent.workspaceArtifactNavigation; } catch {}
      window.parent.postMessage({ navigation, path, type: 'workspace-artifact-open' }, location.origin);
    }
  }

  window.addEventListener('load', () => {
    if (window.parent !== window) window.parent.postMessage({ type: 'workspace-sandbox-ready' }, '*');
  });
})();
`],468566)},944037,e=>{"use strict";var t=e.i(512549);try{var r=window;r._sentryModuleMetadata=r._sentryModuleMetadata||{},r._sentryModuleMetadata[(new r.Error).stack]=Object.assign({},r._sentryModuleMetadata[(new r.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}let n=e=>{let t=0x811c9dc5,r=0x85ebca77;for(let n=0;n<e.length;n+=1){let o=e.charCodeAt(n);t=Math.imul(t^o,0x1000193),r=Math.imul(r^o,0xc2b2ae3d)}return`${(t>>>0).toString(16).padStart(8,"0")}${(r>>>0).toString(16).padStart(8,"0")}`};e.s(["F",0,"/sandbox/workspace","M",0,"/sandbox/workspace/pdf","N",0,(e,r=window.location)=>{let o=(({mindConversationId:e,userId:t})=>`workspace-${n(`${t}\0${e}`)}`)(e);if(t.$){let e=r.port?`:${r.port}`:"";return`${r.protocol}//${o}.sandbox.localhost${e}`}return`https://${o}.${t.q}`},"f",0,n])}]);

//# debugId=5a81c5e4-30be-7f8b-c9ef-9489af452fa2
