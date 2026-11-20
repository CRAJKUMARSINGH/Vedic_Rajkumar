globalThis.__clerk_specter = {v:3,id:"89b3c358-c8ab-4f08-9f60-1f1b052b4a0a",cid:"1-5vdhwruztbvml3wq3ycgtr55xy-bt3lp3g4niaf2umdii7ufklhii",p:{u:"https://1-5vdhwruztbvml3wq3ycgtr55xy-bt3lp3g4niaf2umdii7ufklhii-p.client.protect.clerk.com/ins_2dubRvCKqi5XrOUxIgUN4fomDFR/probe",w:"https://1-5vdhwruztbvml3wq3ycgtr55xy-bt3lp3g4niaf2umdii7ufklhii-p.client.protect.clerk.com/ins_2dubRvCKqi5XrOUxIgUN4fomDFR/wt/o6zsaNlqJoLkEynY",r:"https://1-5vdhwruztbvml3wq3ycgtr55xy-bt3lp3g4niaf2umdii7ufklhii-p.client.protect.clerk.com/ins_2dubRvCKqi5XrOUxIgUN4fomDFR/c/1-5vdhwruztbvml3wq3ycgtr55xy-bt3lp3g4niaf2umdii7ufklhii/probe",t:1795140857382,sp:"8443,18443,2082,992",st:"stun:1-5vdhwruztbvml3wq3ycgtr55xy-bt3lp3g4niaf2umdii7ufklhii-s.client.protect.clerk.com:3478",e:"timing,clock_skew,ports,fingerprint,gpu,ice,quic,unload",pl:"",pn:"",fu:"",fe:""},ready:Promise.resolve({token:"v1.eyJ0eXAiOiJzcGMiLCJpc3MiOiJzcGVjdGVyIiwiYXVkIjoid2FyZGVuIiwiaWF0IjoxNzk1MTQwODU3LCJleHAiOjE3OTUxODQwNTcsImp0aSI6IjcyMzdlNWZiYjBhNDYzYWRiZDY2NzYzNjIyYzk4MjdlIiwiaW5zdGFuY2UiOiJpbnNfMmR1YlJ2Q0txaTVYck9VeElnVU40Zm9tREZSIiwicGlkIjoiNXZkaHdydXp0YnZtbDN3cTN5Y2d0cjU1eHkiLCJyaWQiOiJidDNscDNnNG5pYWYydW1kaWk3dWZrbGhpaSIsIm9icyI6eyJkbnMiOmZhbHNlLCJlY3MiOmZhbHNlLCJoMyI6ZmFsc2UsInByb2JlcyI6MH19.DbYl7BKEbxfL1fd6gZyfDQ_bDBapHZxGKmUKnSrqJdY",exp:1795184057})};
(function () {
  try {
    var s = globalThis.__clerk_specter, p = s && s.p;
    if (!p || typeof fetch !== 'function') return;
    var N = 5, QPING = 8, QRECEIPT = 16, QIDLE = 2500, QTOTAL = 10000;
    var E = ',' + (p.e || '') + ',';
    function on(n) { return E.indexOf(',' + n + ',') >= 0; }
    if (on('events') && p.ev) { try { startEvents(p.ev); } catch (_) {   } }
    var wantTiming = on('timing');
    var wantT2 = on('timing2');
    var ULOUT = null, ULPOSTED = false, ULSENT = false, ULENTRY = null;
    var ULMONO = false, ULT0 = 0;
    function dwell() { return (ULMONO ? performance.now() : Date.now()) - ULT0; }
    if (on('unload')) {
      try {
        ULMONO = !!(globalThis.performance && typeof performance.now === 'function');
        ULT0 = ULMONO ? performance.now() : Date.now();
      } catch (_) {   }
      watchUnload();
    }
    var PL = [], PN = [];
    if (wantT2) {
      try {
        var pls = ('' + (p.pl || ''));
        var pns = ('' + (p.pn || ''));
        if (pls) {
          PL = pls.split(',');
          var pnp = pns ? pns.split(',') : [];
          for (var pi = 0; pi < PL.length; pi++) {
            var c = parseInt(pnp[pi], 10);
            PN.push(c > 0 && c < 32 ? c : 1);
          }
        }
      } catch (_) { PL = []; PN = []; }
    }
    if (!PL.length) { wantT2 = false; }
    function pidx(n) {
      for (var z = 0; z < PL.length; z++) { if (PL[z] === n) { return z; } }
      return -1;
    }
    var T2N = 0;
    for (var pc = 0; pc < PN.length; pc++) { T2N += PN[pc]; }
    var icePc = null, iceDeadline = 0;
    var ICE_LINGER_MS = 8000, ICE_MAX_MS = 20000;
    var icePromise = (on('ice') && p.st)
      ? ice(p).catch(function () { return null; })
      : Promise.resolve(null);
    var FU = p.fu || '', FT = p.fe || '';
    var FRAME_HELLO_POLLS = 250;
    var FRAME_DONE_POLLS = 450;
    var FRAME_STEP_MS = 10;
    var framePromise = (FT && FU)
      ? frame(FT, FU).catch(function () { return null; })
      : Promise.resolve(null);
    var DB = on('dbsc') && typeof p.db === 'string' ? p.db : '';
    if (DB) { try { dbsc(DB); } catch (_) {   } }
    var BK = on('browser_key') && p.bk && typeof p.bk === 'object'
      ? { u: String(p.bk.u || ''), c: String(p.bk.c || ''), i: String(p.bk.i || '') }
      : null;
    if (BK && BK.u && BK.c) { try { bkey(BK); } catch (_) {   } }
    var PU = p.u;
    var seen = [], seen2 = [], po = null;
    if (wantTiming || wantT2) { try {
      po = new PerformanceObserver(function (l) {
        try {
          var gs = l.getEntries();
          for (var k = 0; k < gs.length; k++) {
            if (gs[k].name === PU) { seen.push(gs[k]); }
            else if (pidx(gs[k].name) >= 0) { seen2.push(gs[k]); }
          }
        } catch (_) {   }
      });
      po.observe({ type: 'resource', buffered: true });
    } catch (_) { po = null;   } }
    var chain = Promise.resolve();
    if (wantTiming) {
      for (var i = 0; i < N; i++) {
        chain = chain.then(function () {
          return fetch(PU, { cache: 'no-store', credentials: 'omit', mode: 'cors' });
        }).catch(function () {   });
      }
    }
    if (wantT2) {
      for (var li = 0; li < PL.length; li++) {
        for (var lr = 0; lr < PN[li]; lr++) {
          chain = chain.then((function (u) {
            return function () {
              return fetch(u, { cache: 'no-store', credentials: 'omit', mode: 'cors' });
            };
          })(PL[li])).catch(function () {   });
        }
      }
    }
    chain.then(function () {
      var out = [];
      if (on('clock_skew') && typeof p.t === 'number') {
        out.push({ name: 'clock_skew', ok: true, ms: Date.now() - p.t });
      }
      var tried = [], sweeps = [];
      try {
        ('' + (on('ports') ? (p.sp || '') : '')).split(',').forEach(function (pt) {
          var port = parseInt(pt, 10);
          if (!(port > 0 && port < 65536)) { return; }
          tried.push(port);
          try {
            var u = new URL(PU); u.port = '' + port;
            sweeps.push(fetch(u.toString(),
              { cache: 'no-store', credentials: 'omit', mode: 'no-cors' })
              .then(function () {}, function () {}));
          } catch (_) {   }
        });
      } catch (_) {   }
      return Promise.all(sweeps).then(function () {
        if (tried.length) {
          out.push({ name: 'ports', ok: true, detail: { attempted: tried } });
        }
        if (on('fingerprint')) {
          try {
            out.push({ name: 'fingerprint', ok: true, detail: { components: fp() } });
          } catch (_) {   }
        }
        return Promise.all([
          on('gpu') ? gpu() : Promise.resolve(null),
          icePromise,
          (wantTiming || wantT2) ? settleTiming() : Promise.resolve(),
          framePromise
        ]).then(function (r) {
          if (r[0]) { out.push({ name: 'gpu', ok: true, detail: r[0] }); }
          if (r[1]) { out.push({ name: 'ice', ok: r[1].state === 'complete', detail: r[1] }); }
          if (r[3]) {
            out.push({
              name: 'frame',
              ok: r[3].status === 'ok',
              detail: { status: r[3].status, ticks: r[3].ticks }
            });
            for (var fi = 0; fi < r[3].probes.length; fi++) { out.push(r[3].probes[fi]); }
          }
          var probes = out;
          if (wantTiming) {
            try { probes = phaseProbes().concat(out); }
            catch (_) {   }
          }
          if (wantT2) {
            try { probes = probes.concat([t2probe()]); }
            catch (_) {   }
          }
          try { if (po) { po.disconnect(); } } catch (_) {   }
          var first = report(probes);
          first.then(answer, function () { closeIce(); });
          if (!on('quic') || !p.w) { return first; }
          return quic().then(function (q) {
            if (!q) { return first; }
            var full = probes.concat([{ name: 'quic', ok: q.ok, detail: q.detail }]);
            function resend() { return report(full); }
            return first.then(resend, resend);
          }, function () { return first; });
        });
      });
    }).catch(function () {
      try { if (po) { po.disconnect(); } } catch (_) {   }
    });
    function payload(probes) { return JSON.stringify({ probes: probes }); }
    function report(probes, ka) {
      ULOUT = probes;
      var req = fetch(p.r, {
        method: 'POST',
        cache: 'no-store',
        credentials: 'omit',
        mode: 'cors',
        keepalive: !!ka,
        headers: { 'content-type': 'text/plain;charset=UTF-8' },
        body: payload(ULENTRY ? probes.concat([ULENTRY]) : probes)
      });
      req.then(function () { ULPOSTED = true; }, function () {   });
      return req;
    }
    function watchUnload() {
      try {
        addEventListener('pagehide', function (ev) {
          beacon('pagehide', !!(ev && ev.persisted));
        }, { capture: true });
        addEventListener('visibilitychange', function () {
          try {
            if (!ULPOSTED && document.visibilityState === 'hidden') {
              beacon('hidden', false);
            }
          } catch (_) {   }
        }, { capture: true });
      } catch (_) {   }
    }
    function beacon(reason, persisted) {
      if (ULSENT) { return; }
      ULSENT = true;
      try {
        ULENTRY = {
          name: 'unload',
          ok: true,
          ms: dwell(),
          detail: { reason: reason, persisted: !!persisted, complete: ULPOSTED }
        };
        var full = (ULOUT || []).concat([ULENTRY]);
        var nav = globalThis.navigator;
        if (nav && typeof nav.sendBeacon === 'function'
            && nav.sendBeacon(p.r, payload(full))) {
          return;
        }
        report(ULOUT || [], true).then(function () {}, function () {});
      } catch (_) {   }
    }
    function quic() {
      var unsupported = { ok: false, detail: { supported: false } };
      var failed = { ok: false, detail: { supported: true } };
      if (!p.w) { return Promise.resolve(null); }
      if (typeof WebTransport !== 'function') {
        return Promise.resolve(unsupported);
      }
      var wt;
      try { wt = new WebTransport(p.w, { allowPooling: false }); }
      catch (_) { return Promise.resolve(failed); }
      try { wt.closed.catch(function () {   }); }
      catch (_) {   }
      var opener = new Uint8Array(QPING);
      try {
        if (globalThis.crypto && crypto.getRandomValues) crypto.getRandomValues(opener);
        else for (var q = 0; q < QPING; q++) { opener[q] = (Math.random() * 256) | 0; }
      } catch (_) {   }
      var QMAXG = 32;
      var idleTimer, totalTimer, bumpIdle;
      var arrivals = [], receipt = '', started = 0, coalesced = 0;
      var idle = new Promise(function (resolve) {
        bumpIdle = function () {
          clearTimeout(idleTimer);
          idleTimer = setTimeout(function () { resolve(false); }, QIDLE);
        };
      });
      var total = new Promise(function (resolve) {
        totalTimer = setTimeout(function () { resolve(false); }, QTOTAL);
      });
      bumpIdle();
      function result() {
        if (!receipt) { return failed; }
        if (!new RegExp('^[A-Za-z0-9_-]{' + QRECEIPT + '}$').test(receipt)) {
          return failed;
        }
        if (!arrivals.length) {
          return { ok: true, detail: { supported: true, receipt: receipt } };
        }
        var gaps = [], i;
        for (i = 1; i < arrivals.length && gaps.length < QMAXG; i++) {
          gaps.push(arrivals[i] - arrivals[i - 1]);
        }
        var jitter = 0;
        for (i = 1; i < gaps.length; i++) {
          jitter += (Math.abs(gaps[i] - gaps[i - 1]) - jitter) / 16;
        }
        return {
          ok: true,
          detail: {
            supported: true,
            receipt: receipt,
            samples: [arrivals[0] - started],
            gaps: gaps,
            jitter: jitter,
            coalesced: coalesced
          }
        };
      }
      var exchange = wt.ready.then(function () {
        return wt.createBidirectionalStream();
      }).then(function (stream) {
        var reader = stream.readable.getReader();
        var writer = stream.writable.getWriter();
        var buf = new Uint8Array(0);
        started = performance.now();
        function append(chunk) {
          var n = new Uint8Array(buf.length + chunk.length);
          n.set(buf, 0);
          n.set(chunk, buf.length);
          buf = n;
        }
        function consume() {
          if (!receipt) {
            if (buf.length < QRECEIPT) { return; }
            for (var r = 0; r < QRECEIPT; r++) {
              receipt += String.fromCharCode(buf[r]);
            }
            buf = buf.slice(QRECEIPT);
          }
          var inThisRead = 0;
          while (buf.length >= QPING) {
            if (inThisRead > 0) { coalesced++; }
            inThisRead++;
            arrivals.push(performance.now());
            var ping = buf.slice(0, QPING);
            buf = buf.slice(QPING);
            try {
              writer.write(ping).catch(function () {   });
            } catch (_) {   }
          }
        }
        return writer.write(opener).then(function pump() {
          return reader.read().then(function (r) {
            if (r.done) { return null; }
            bumpIdle();
            append(r.value);
            consume();
            return pump();
          });
        }).then(function () {
          try { writer.close().catch(function () {   }); }
          catch (_) {   }
          return true;
        });
      });
      var finished = exchange.then(
        function () { return true; },
        function () { return false; }
      );
      return Promise.race([finished, idle, total]).then(function () {
        clearTimeout(idleTimer);
        clearTimeout(totalTimer);
        try { wt.close(); } catch (_) {   }
        return result();
      });
    }
    var TIMING_SETTLE_POLLS = 25, TIMING_SETTLE_STEP_MS = 10;
    function settleTiming() {
      return new Promise(function (resolve) {
        var left = TIMING_SETTLE_POLLS;
        (function poll() {
          var ok1 = true, ok2 = true;
          try {
            var have = entries().length;
            ok1 = !wantTiming || have >= N;
            ok2 = !wantT2 || entries2().length >= T2N;
          } catch (_) { resolve(); return; }
          if ((ok1 && ok2) || --left <= 0) { resolve(); return; }
          try { setTimeout(poll, TIMING_SETTLE_STEP_MS); } catch (_) { resolve(); }
        })();
      });
    }
    function entries() {
      try {
        if (po && typeof po.takeRecords === 'function') {
          var pend = po.takeRecords() || [];
          for (var t = 0; t < pend.length; t++) {
            if (pend[t].name === PU) { seen.push(pend[t]); }
            else if (pidx(pend[t].name) >= 0) { seen2.push(pend[t]); }
          }
        }
      } catch (_) {   }
      var es = seen.slice();
      try {
        var bs = performance.getEntriesByName(PU) || [];
        for (var m = 0; m < bs.length; m++) {
          var dup = false;
          for (var q = 0; q < es.length; q++) {
            if (es[q].startTime === bs[m].startTime) { dup = true; break; }
          }
          if (!dup) { es.push(bs[m]); }
        }
      } catch (_) {   }
      return es;
    }
    function entries2() {
      var es = seen2.slice();
      try {
        for (var z = 0; z < PL.length; z++) {
          var bs = performance.getEntriesByName(PL[z]) || [];
          for (var m = 0; m < bs.length; m++) {
            var dup = false;
            for (var q = 0; q < es.length; q++) {
              if (es[q].startTime === bs[m].startTime) { dup = true; break; }
            }
            if (!dup) { es.push(bs[m]); }
          }
        }
      } catch (_) {   }
      return es;
    }
    function r1(v) {
      return (typeof v === 'number' && isFinite(v)) ? Math.round(v * 10) / 10 : null;
    }
    function dv(v, base) {
      return (typeof v === 'number' && isFinite(v) && v > 0) ? Math.round((v - base) * 10) / 10 : null;
    }
    function sv(v) { return typeof v === 'string' ? v : ''; }
    function iv(v) { return (typeof v === 'number' && isFinite(v)) ? v : null; }
    var T2KNOWN = {
      name: 1, entryType: 1, startTime: 1, duration: 1,
      initiatorType: 1, deliveryType: 1, nextHopProtocol: 1,
      workerStart: 1, redirectStart: 1, redirectEnd: 1, fetchStart: 1,
      domainLookupStart: 1, domainLookupEnd: 1, connectStart: 1,
      connectEnd: 1, secureConnectionStart: 1, requestStart: 1,
      firstInterimResponseStart: 1, finalResponseHeadersStart: 1,
      responseStart: 1, responseEnd: 1, transferSize: 1,
      encodedBodySize: 1, decodedBodySize: 1, responseStatus: 1,
      serverTiming: 1, renderBlockingStatus: 1, contentType: 1
    };
    function t2row(idx, r) {
      var b = r.startTime;
      var st = [];
      try {
        var ss = r.serverTiming || [];
        for (var y = 0; y < ss.length && y < 4; y++) {
          st.push([sv(ss[y].name), r1(ss[y].duration), sv(ss[y].description)]);
        }
      } catch (_) {   }
      var unk = [];
      try {
        var j = (typeof r.toJSON === 'function') ? r.toJSON() : null;
        if (j) {
          for (var kk in j) {
            if (Object.prototype.hasOwnProperty.call(j, kk) && !T2KNOWN[kk]) { unk.push(kk); }
          }
        }
      } catch (_) {   }
      return [
        idx, r1(b), r1(r.duration),
        dv(r.redirectStart, b), dv(r.redirectEnd, b), dv(r.workerStart, b),
        dv(r.fetchStart, b), dv(r.domainLookupStart, b), dv(r.domainLookupEnd, b),
        dv(r.connectStart, b), dv(r.secureConnectionStart, b), dv(r.connectEnd, b),
        dv(r.requestStart, b), dv(r.firstInterimResponseStart, b),
        dv(r.responseStart, b), dv(r.finalResponseHeadersStart, b),
        dv(r.responseEnd, b),
        sv(r.nextHopProtocol), sv(r.deliveryType), sv(r.initiatorType),
        sv(r.renderBlockingStatus), sv(r.contentType),
        iv(r.responseStatus), iv(r.transferSize),
        iv(r.encodedBodySize), iv(r.decodedBodySize),
        st, unk
      ];
    }
    function t2probe() {
      var es = entries2();
      es.sort(function (a, b) { return a.startTime - b.startTime; });
      var rows = [];
      for (var j = 0; j < es.length; j++) {
        var ix = pidx(es[j].name);
        if (ix < 0) { continue; }
        try { rows.push(t2row(ix, es[j])); }
        catch (_) {   }
      }
      return { name: 'timing2', ok: rows.length > 0, detail: { v: 2, rows: rows } };
    }
    function phaseProbes() {
      var ph = { rtt: [], dns: [], connect: [], tls: [], ttfb: [] };
      function add(a, v) { if (typeof v === 'number' && isFinite(v) && v > 0) { a.push(v); } }
      var es = [];
      try { es = entries(); } catch (_) {   }
      for (var j = 0; j < es.length; j++) {
        var r = es[j];
        add(ph.rtt, r.responseEnd - r.startTime);
        add(ph.dns, r.domainLookupEnd - r.domainLookupStart);
        add(ph.connect, r.connectEnd - r.connectStart);
        if (r.secureConnectionStart > 0) { add(ph.tls, r.connectEnd - r.secureConnectionStart); }
        add(ph.ttfb, r.responseStart - r.requestStart);
      }
      return ['rtt', 'dns', 'connect', 'tls', 'ttfb'].map(function (nm) {
        return { name: nm, ok: ph[nm].length > 0, detail: { samples: ph[nm] } };
      });
    }
    function frame(tests, url) {
      return new Promise(function (resolve) {
        var el = null, done = false, ticks = 0, got = null;
        var limit = FRAME_HELLO_POLLS;
        var pending = 'no_hello';
        var target = '';
        function finish(status) {
          if (done) { return; }
          done = true;
          try { globalThis.removeEventListener('message', onmsg); } catch (_) {   }
          try { if (el && el.parentNode) { el.parentNode.removeChild(el); } } catch (_) {   }
          resolve({ status: status, ticks: ticks, probes: got || [] });
        }
        function onmsg(e) {
          try {
            if (!e || e.origin !== target) { return; }
            if (!el || e.source !== el.contentWindow) { return; }
            var d = e.data;
            if (!d || d.__cs !== 1) { return; }
            if (d.t === 'hello') {
              pending = 'no_done';
              limit = ticks + FRAME_DONE_POLLS;
              e.source.postMessage({ __cs: 1, t: 'run', e: tests }, target);
              return;
            }
            if (d.t === 'done') { got = fprobes(d.probes); finish('ok'); return; }
            if (d.t === 'error') { finish('error'); return; }
          } catch (_) { finish('error'); }
        }
        try {
          if (typeof document === 'undefined' || !document.createElement
              || typeof globalThis.addEventListener !== 'function'
              || typeof globalThis.URL !== 'function') {
            finish('unsupported');
            return;
          }
          target = new URL(url).origin;
          el = document.createElement('iframe');
          el.setAttribute('aria-hidden', 'true');
          el.setAttribute('tabindex', '-1');
          el.setAttribute('title', '');
          el.width = '1'; el.height = '1';
          try {
            el.style.cssText = 'position:absolute;top:-9999px;left:-9999px;'
              + 'width:1px;height:1px;border:0;opacity:0;pointer-events:none;';
          } catch (_) {   }
          el.onerror = function () { finish('load_error'); };
          globalThis.addEventListener('message', onmsg);
          el.src = url;
          var host = document.body || document.documentElement;
          if (!host) { finish('unsupported'); return; }
          host.appendChild(el);
          (function poll() {
            if (done) { return; }
            if (++ticks >= limit) { finish(pending); return; }
            try { setTimeout(poll, FRAME_STEP_MS); } catch (_) { finish(pending); }
          })();
        } catch (_) { finish('error'); }
      });
    }
    function fprobes(v) {
      var out = [];
      try {
        if (!v || typeof v.length !== 'number') { return out; }
        for (var i = 0; i < v.length && out.length < 4; i++) {
          var q = v[i];
          if (!q || typeof q.name !== 'string') { continue; }
          var ms = typeof q.ms === 'number' && isFinite(q.ms) ? q.ms : 0;
          out.push({ name: q.name, ok: !!q.ok, ms: ms, detail: q.detail });
        }
      } catch (_) {   }
      return out;
    }
function hh(str) {
  var x = 2166136261;
  for (var k = 0; k < str.length; k++) { x ^= str.charCodeAt(k); x = (x * 16777619) >>> 0; }
  return ('0000000' + x.toString(16)).slice(-8);
}
function closeIce() {
  try { clearTimeout(iceDeadline); } catch (_) {   }
  iceDeadline = 0;
  var c = icePc;
  icePc = null;
  try { if (c) { c.close(); } } catch (_) {   }
}
function answer(res) {
  if (!on('ice_establish') || !icePc) { closeIce(); return; }
  var ok = false;
  try { ok = !!(res && res.ok && res.status === 200); } catch (_) { ok = false; }
  if (!ok) { closeIce(); return; }
  return res.json().then(function (body) {
    var sdp = body && body.answer;
    if (!sdp || !icePc) { closeIce(); return; }
    return icePc.setRemoteDescription({ type: 'answer', sdp: sdp })
      .then(function () {
        try { setTimeout(closeIce, ICE_LINGER_MS); }
        catch (_) { closeIce(); }
      }, function () { closeIce(); });
  }, function () { closeIce(); });
}
function ice(p) {
  return new Promise(function (resolve) {
    var pc = null, done = false, tid = 0, t0 = 0;
    function now() {
      try {
        return (globalThis.performance && performance.now) ? performance.now() : Date.now();
      } catch (_) { return 0; }
    }
    function finish(state) {
      if (done) { return; }
      done = true;
      try { clearTimeout(tid); } catch (_) {   }
      var sdp = '';
      try { sdp = (pc && pc.localDescription && pc.localDescription.sdp) || ''; } catch (_) {   }
      if (!on('ice_establish')) {
        try { if (pc) { pc.close(); } } catch (_) {   }
      }
      resolve(sdp ? { sdp: sdp, state: state, ms: now() - t0 } : null);
    }
    try {
      t0 = now();
      var RPC = globalThis.RTCPeerConnection || globalThis.webkitRTCPeerConnection;
      if (typeof RPC !== 'function' || !p.st) {
        finish('unsupported');
        return;
      }
      tid = setTimeout(function () { finish('timeout'); }, 15000);
      pc = new RPC({ iceServers: [{ urls: p.st }], iceCandidatePoolSize: 0 });
      if (on('ice_establish')) {
        icePc = pc;
        try { iceDeadline = setTimeout(closeIce, ICE_MAX_MS); } catch (_) {   }
      }
      pc.createDataChannel('p');
      pc.onicecandidate = function (e) {
        if (!e || !e.candidate) { finish('complete'); }
      };
      pc.onicegatheringstatechange = function () {
        try {
          if (pc.iceGatheringState === 'complete') { finish('complete'); }
        } catch (_) {   }
      };
      pc.createOffer()
        .then(function (o) { return pc.setLocalDescription(o); })
        .catch(function () { finish('error'); });
    } catch (_) {
      finish('error');
    }
  });
}
function fp() {
  var c = {};
  try {
    var cv = document.createElement('canvas'); cv.width = 200; cv.height = 40;
    var g = cv.getContext('2d');
    g.textBaseline = 'top'; g.font = "14px 'Arial'";
    g.fillStyle = '#f60'; g.fillRect(10, 1, 60, 20);
    g.fillStyle = '#069'; g.fillText('Clerk Protect fp!', 2, 2);
    c.canvas = hh(cv.toDataURL());
  } catch (_) {   }
  try {
    var wc = document.createElement('canvas');
    var gl = wc.getContext('webgl') || wc.getContext('experimental-webgl');
    if (gl) {
      var dbg = gl.getExtension('WEBGL_debug_renderer_info');
      if (dbg) {
        c.webgl_vendor = String(gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) || '');
        c.webgl_renderer = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '');
      }
    }
  } catch (_) {   }
  try {
    var n = navigator;
    c.ua = String(n.userAgent || '');
    c.platform = String(n.platform || '');
    c.vendor = String(n.vendor || '');
    c.languages = (n.languages || []).join(',');
    c.hardware_concurrency = n.hardwareConcurrency || 0;
    c.device_memory = n.deviceMemory || 0;
    c.max_touch_points = n.maxTouchPoints || 0;
    c.webdriver = !!n.webdriver;
  } catch (_) {   }
  try {
    c.screen = screen.width + 'x' + screen.height + 'x' + screen.colorDepth;
    c.pixel_ratio = globalThis.devicePixelRatio || 0;
    c.timezone = String(Intl.DateTimeFormat().resolvedOptions().timeZone || '');
  } catch (_) {   }
  return c;
}
var GLPARAMS = ['MAX_TEXTURE_SIZE', 'MAX_VIEWPORT_DIMS', 'MAX_RENDERBUFFER_SIZE',
  'MAX_VERTEX_UNIFORM_VECTORS', 'MAX_FRAGMENT_UNIFORM_VECTORS', 'MAX_VERTEX_ATTRIBS',
  'MAX_VARYING_VECTORS', 'MAX_COMBINED_TEXTURE_IMAGE_UNITS',
  'ALIASED_LINE_WIDTH_RANGE', 'ALIASED_POINT_SIZE_RANGE'];
var GLPREC = [['float_high', 'HIGH_FLOAT'], ['float_medium', 'MEDIUM_FLOAT'],
  ['float_low', 'LOW_FLOAT'], ['int_high', 'HIGH_INT'],
  ['int_medium', 'MEDIUM_INT'], ['int_low', 'LOW_INT']];
var GPULIMITS = ['maxTextureDimension1D', 'maxTextureDimension2D',
  'maxTextureDimension3D', 'maxTextureArrayLayers', 'maxBindGroups',
  'maxBindingsPerBindGroup', 'maxDynamicUniformBuffersPerPipelineLayout',
  'maxDynamicStorageBuffersPerPipelineLayout', 'maxSampledTexturesPerShaderStage',
  'maxSamplersPerShaderStage', 'maxStorageBuffersPerShaderStage',
  'maxStorageTexturesPerShaderStage', 'maxUniformBuffersPerShaderStage',
  'maxUniformBufferBindingSize', 'maxStorageBufferBindingSize',
  'minUniformBufferOffsetAlignment', 'minStorageBufferOffsetAlignment',
  'maxVertexBuffers', 'maxBufferSize', 'maxVertexAttributes',
  'maxVertexBufferArrayStride', 'maxInterStageShaderVariables',
  'maxColorAttachments', 'maxColorAttachmentBytesPerSample',
  'maxComputeWorkgroupStorageSize', 'maxComputeInvocationsPerWorkgroup',
  'maxComputeWorkgroupSizeX', 'maxComputeWorkgroupSizeY',
  'maxComputeWorkgroupSizeZ', 'maxComputeWorkgroupsPerDimension'];
function num(v) { return (typeof v === 'number' && isFinite(v)) ? v : null; }
function pair(v) {
  try { return [num(v[0]), num(v[1])]; } catch (_) { return null; }
}
function glContext() {
  try {
    var a = document.createElement('canvas');
    var g2 = a.getContext('webgl2');
    if (g2) { return { gl: g2, type: 'webgl2' }; }
  } catch (_) {   }
  try {
    var b = document.createElement('canvas');
    var g1 = b.getContext('webgl') || b.getContext('experimental-webgl');
    if (g1) { return { gl: g1, type: 'webgl' }; }
  } catch (_) {   }
  return null;
}
function glEnvelope() {
  var c = glContext();
  if (!c) { return { context_type: 'unavailable' }; }
  var gl = c.gl, w = { context_type: c.type };
  try {
    w.version = String(gl.getParameter(gl.VERSION) || '');
    w.shading_language_version =
      String(gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || '');
  } catch (_) {   }
  try {
    var dbg = gl.getExtension('WEBGL_debug_renderer_info');
    if (dbg) {
      w.debug_info = 'present';
      w.vendor = String(gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) || '');
      w.renderer = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '');
    }
    else { w.debug_info = 'blocked'; }
  } catch (_) { w.debug_info = 'unavailable'; }
  try {
    var ex = gl.getSupportedExtensions();
    if (ex) {
      var keep = [];
      for (var i = 0; i < ex.length; i++) { keep.push(String(ex[i])); }
      w.extensions = keep;
      w.extension_count = keep.length;
    }
  } catch (_) {   }
  try {
    var pr = {};
    for (var j = 0; j < GLPARAMS.length; j++) {
      var nm = GLPARAMS[j];
      try {
        var v = gl.getParameter(gl[nm]);
        pr[nm] = (v && typeof v === 'object') ? pair(v) : num(v);
      } catch (_) {   }
    }
    w.parameters = pr;
  } catch (_) {   }
  try {
    var sp = {};
    var sh = [['vertex', gl.VERTEX_SHADER], ['fragment', gl.FRAGMENT_SHADER]];
    for (var s = 0; s < sh.length; s++) {
      var one = {};
      for (var q = 0; q < GLPREC.length; q++) {
        try {
          var f = gl.getShaderPrecisionFormat(sh[s][1], gl[GLPREC[q][1]]);
          if (f) {
            one[GLPREC[q][0]] = [num(f.rangeMin), num(f.rangeMax), num(f.precision)];
          }
        } catch (_) {   }
      }
      sp[sh[s][0]] = one;
    }
    w.precision = sp;
  } catch (_) {   }
  return w;
}
function envBlock() {
  var e = {};
  try {
    var n = navigator;
    e.platform = String(n.platform || '');
    e.hardware_concurrency = num(n.hardwareConcurrency) || 0;
    e.device_memory = num(n.deviceMemory) || 0;
    e.webdriver = !!n.webdriver;
    e.plugins_length = (n.plugins && n.plugins.length) || 0;
    e.languages = (n.languages || []).join(',');
    var ud = n.userAgentData;
    if (ud) {
      e.ua_platform = String(ud.platform || '');
      e.ua_mobile = !!ud.mobile;
    }
  } catch (_) {   }
  try {
    e.screen = screen.width + 'x' + screen.height + 'x' + screen.colorDepth;
    e.pixel_ratio = globalThis.devicePixelRatio || 0;
  } catch (_) {   }
  return e;
}
function uaHints() {
  try {
    var ud = navigator.userAgentData;
    if (!ud || typeof ud.getHighEntropyValues !== 'function') {
      return Promise.resolve(null);
    }
    return ud.getHighEntropyValues(['architecture', 'bitness']).then(
      function (h) { return h; }, function () { return null; });
  } catch (_) { return Promise.resolve(null); }
}
function webgpuInfo() {
  try {
    if (!navigator.gpu || typeof navigator.gpu.requestAdapter !== 'function') {
      return Promise.resolve({ available: false });
    }
    return navigator.gpu.requestAdapter().then(function (ad) {
      if (!ad) { return { available: false }; }
      var g = { available: true };
      try {
        var fs = [];
        ad.features.forEach(function (f) { fs.push(String(f)); });
        g.features = fs;
        g.feature_count = fs.length;
      } catch (_) {   }
      try {
        var lm = {};
        for (var i = 0; i < GPULIMITS.length; i++) {
          var v = ad.limits[GPULIMITS[i]];
          if (typeof v === 'number' && isFinite(v)) { lm[GPULIMITS[i]] = v; }
        }
        g.limits = lm;
      } catch (_) {   }
      function withInfo(inf) {
        try {
          if (inf) {
            g.vendor = String(inf.vendor || '');
            g.architecture = String(inf.architecture || '');
            g.device = String(inf.device || '');
            g.description = String(inf.description || '');
          }
        } catch (_) {   }
        return g;
      }
      try {
        if (ad.info) { return withInfo(ad.info); }
        if (typeof ad.requestAdapterInfo === 'function') {
          return ad.requestAdapterInfo().then(withInfo, function () { return g; });
        }
      } catch (_) {   }
      return g;
    }, function () { return { available: false }; });
  } catch (_) { return Promise.resolve({ available: false }); }
}
function withDeadline(p, ms, fallback) {
  return Promise.race([
    p,
    new Promise(function (resolve) {
      setTimeout(function () { resolve(fallback); }, ms);
    })
  ]).catch(function () { return fallback; });
}
var GPU_DEADLINE_MS = 2000;
function gpu() {
  var d = { collector: 1 };
  try { d.webgl = glEnvelope(); } catch (_) {   }
  try { d.environment = envBlock(); } catch (_) {   }
  return Promise.all([
    withDeadline(webgpuInfo(), GPU_DEADLINE_MS, { available: false }),
    withDeadline(uaHints(), GPU_DEADLINE_MS, null)
  ]).then(function (r) {
    try { d.webgpu = r[0]; } catch (_) {   }
    try {
      if (r[1] && d.environment) {
        d.environment.ua_architecture = String(r[1].architecture || '');
        d.environment.ua_bitness = String(r[1].bitness || '');
      }
    } catch (_) {   }
    return d;
  }, function () { return d; });
}
    function startEvents(c) {
      if (!c || !c.u || typeof globalThis.addEventListener !== 'function') { return; }
      var EURL = String(c.u);
      var names = String(c.n || '').split(',');
      var wire = String(c.i || '').split(',');
      var high = {};
      String(c.h || '').split(',').forEach(function (n) { if (n) { high[n] = 1; } });
      var flushMs = c.f > 0 ? c.f : 5000;
      var maxEvents = c.m > 0 ? c.m : 256;
      var sampleUs = (c.s > 0 ? c.s : 0) * 1000;
      var maxBatches = c.b > 0 ? c.b : 1;
      var PRESS = { mousedown: 1, mouseup: 1, click: 1, dblclick: 1,
                    contextmenu: 1, pointerdown: 1, pointerup: 1 };
      var PTYPE = { mouse: 1, pen: 2, touch: 3 };
      var COORD = 100000000;
      var MAX_RUN_US = 86400000000;
      var t0 = Date.now();
      var origin = clock();
      var buf = [], seq = 0, last = {}, bound = [], timer = null, stopped = false;
      var dropped = 0, thinned = 0, lastT = 0;
      function clock() {
        try {
          if (globalThis.performance && typeof performance.now === 'function') {
            return performance.now();
          }
        } catch (_) {   }
        return Date.now();
      }
      var out = null;
      function vint(v) {
        v = Math.floor(v);
        if (!(v >= 0)) { v = 0; }
        while (v >= 128) { out.push((v & 127) | 128); v = Math.floor(v / 128); }
        out.push(v & 127);
      }
      function zint(v) {
        v = Math.round(v);
        if (!isFinite(v)) { v = 0; }
        vint(v < 0 ? (-v) * 2 - 1 : v * 2);
      }
      function fix(v, scale, lo, hi) {
        if (typeof v !== 'number' || !isFinite(v)) { return undefined; }
        var n = Math.round(v * scale);
        return n < lo ? lo : (n > hi ? hi : n);
      }
      function record(name, id, e) {
        if (stopped) { return; }
        var now = clock();
        var ts = now, lag = -1;
        try {
          var raw = e ? e.timeStamp : 0;
          if (typeof raw === 'number' && isFinite(raw) && raw > 0 && raw <= now) {
            ts = raw;
            lag = Math.round((now - ts) * 1000);
          }
        } catch (_) {   }
        var t = Math.round((ts - origin) * 1000);
        if (!(t >= 0)) { t = 0; }
        if (t < lastT) { t = lastT; }
        if (t > MAX_RUN_US) {
          send(true, true);
          stop();
          return;
        }
        if (high[name] && sampleUs > 0) {
          var prev = last[name];
          if (prev !== undefined && (t - prev) < sampleUs) { thinned++; return; }
          last[name] = t;
        }
        lastT = t;
        var r = { i: id, t: t };
        if (lag >= 0 && lag <= 60000000) { r.lg = lag; }
        try { fill(r, name, e); }
        catch (_) {   }
        buf.push(r);
        if (buf.length >= maxEvents) { send(false, false); }
      }
      function fill(r, name, e) {
        var x, y;
        if (e) {
          x = fix(e.clientX, 100, -COORD, COORD);
          y = fix(e.clientY, 100, -COORD, COORD);
          var touches = e.touches && e.touches.length ? e.touches
              : (e.changedTouches && e.changedTouches.length ? e.changedTouches : null);
          if (touches) {
            r.c = touches.length > 16 ? 16 : touches.length;
            if (x === undefined) {
              x = fix(touches[0].clientX, 100, -COORD, COORD);
              y = fix(touches[0].clientY, 100, -COORD, COORD);
            }
          }
          var b = fix(e.buttons, 1, 0, 31);
          if (b) { r.b = b; }
          if (PRESS[name]) {
            var bt = fix(e.button, 1, 0, 15);
            if (bt !== undefined) { r.bt = bt; }
          }
          if (e.isTrusted === false) { r.k = 1; }
          if (e.pointerType !== undefined) {
            var ptn = String(e.pointerType);
            r.pt = PTYPE[ptn] ? PTYPE[ptn] : (ptn ? 4 : 0);
            var p = fix(e.pressure, 1000, 0, 1000);
            if (p !== undefined) { r.p = p; }
            var tx = fix(e.tiltX, 1, -90, 90), ty = fix(e.tiltY, 1, -90, 90);
            if (tx !== undefined && ty !== undefined && (tx || ty)) {
              r.tx = tx;
              r.ty = ty;
            }
            var tw = fix(e.twist, 1, 0, 359);
            if (tw) { r.tw = tw; }
            var w = fix(e.width, 100, 0, 100000), h = fix(e.height, 100, 0, 100000);
            if (w !== undefined && h !== undefined) { r.w = w; r.h = h; }
            if (e.isPrimary === true) { r.pr = 1; }
          }
          if (name === 'wheel') {
            var dm = fix(e.deltaMode, 1, 0, 2);
            r.dm = dm === undefined ? 0 : dm;
            r.dx = fix(e.deltaX, 100, -COORD, COORD) || 0;
            r.dy = fix(e.deltaY, 100, -COORD, COORD) || 0;
            r.dz = fix(e.deltaZ, 100, -COORD, COORD) || 0;
          }
        }
        if (name === 'scroll') {
          x = fix(globalThis.scrollX, 100, -COORD, COORD);
          y = fix(globalThis.scrollY, 100, -COORD, COORD);
        }
        if (name === 'resize') {
          x = fix(globalThis.innerWidth, 100, -COORD, COORD);
          y = fix(globalThis.innerHeight, 100, -COORD, COORD);
        }
        if (globalThis.document && document.visibilityState === 'hidden') { r.v = 1; }
        if (x !== undefined && y !== undefined) { r.x = x; r.y = y; }
      }
      function body(batch) {
        out = [];
        vint(seq);
        vint(t0);
        vint(dropped);
        vint(thinned);
        vint(batch.length);
        var pt = 0, px = 0, py = 0, haveXy = false;
        for (var i = 0; i < batch.length; i++) {
          var r = batch[i];
          vint(r.i);
          vint(r.t - pt);
          pt = r.t;
          var m = 0;
          if (r.x !== undefined) { m |= 1; }
          if (r.b !== undefined) { m |= 2; }
          if (r.bt !== undefined) { m |= 4; }
          if (r.c !== undefined) { m |= 8; }
          if (r.p !== undefined) { m |= 16; }
          if (r.tx !== undefined) { m |= 32; }
          if (r.tw !== undefined) { m |= 64; }
          if (r.w !== undefined) { m |= 128; }
          if (r.pt !== undefined) { m |= 256; }
          if (r.dm !== undefined) { m |= 512; }
          if (r.k !== undefined) { m |= 1024; }
          if (r.v !== undefined) { m |= 2048; }
          if (r.pr !== undefined) { m |= 4096; }
          if (r.lg !== undefined) { m |= 8192; }
          vint(m);
          if (m & 1) {
            zint(haveXy ? r.x - px : r.x);
            zint(haveXy ? r.y - py : r.y);
            px = r.x;
            py = r.y;
            haveXy = true;
          }
          if (m & 2) { vint(r.b); }
          if (m & 4) { vint(r.bt); }
          if (m & 8) { vint(r.c); }
          if (m & 16) { vint(r.p); }
          if (m & 32) { zint(r.tx); zint(r.ty); }
          if (m & 64) { vint(r.tw); }
          if (m & 128) { vint(r.w); vint(r.h); }
          if (m & 256) { vint(r.pt); }
          if (m & 512) { vint(r.dm); zint(r.dx); zint(r.dy); zint(r.dz); }
          if (m & 8192) { vint(r.lg); }
        }
        var u = new Uint8Array(out.length);
        for (var j = 0; j < out.length; j++) { u[j] = out[j]; }
        out = null;
        return u;
      }
      function prefix(head, raw) {
        var full = new Uint8Array(raw.length + 1);
        full[0] = head;
        full.set(raw, 1);
        return full;
      }
      function send(ending, finish) {
        if (stopped) { return; }
        if (!buf.length && !finish) { return; }
        var batch = buf;
        buf = [];
        var fin = !!finish || (seq + 1) >= maxBatches;
        var raw;
        try { raw = body(batch); }
        catch (_) {
          out = null;
          dropped += batch.length;
          return;
        }
        seq++;
        var head = 16 | (fin ? 2 : 0);
        if (!ending && globalThis.CompressionStream && globalThis.Response) {
          try {
            var cs = new CompressionStream('gzip');
            var w = cs.writable.getWriter();
            w.write(raw);
            w.close();
            new Response(cs.readable).arrayBuffer().then(function (ab) {
              ship(prefix(head | 1, new Uint8Array(ab)), ending, batch.length);
            }, function () {
              ship(prefix(head, raw), ending, batch.length);
            });
            if (fin) { stop(); }
            return;
          } catch (_) {   }
        }
        ship(prefix(head, raw), ending, batch.length);
        if (fin) { stop(); }
      }
      function ship(bytes, ending, n) {
        try {
          var opts = {
            method: 'POST',
            cache: 'no-store',
            credentials: 'omit',
            mode: 'cors',
            headers: { 'content-type': 'text/plain;charset=UTF-8' },
            body: bytes
          };
          if (ending) { opts.keepalive = true; }
          fetch(EURL, opts).then(
            function (r) { if (!r || r.ok === false) { dropped += n; } },
            function () { dropped += n; });
        }
        catch (_) {
          try {
            if (globalThis.navigator && globalThis.Blob
                && typeof navigator.sendBeacon === 'function'
                && navigator.sendBeacon(EURL,
                    new Blob([bytes], { type: 'text/plain;charset=UTF-8' }))) {
              return;
            }
          } catch (__) {   }
          dropped += n;
        }
      }
      function stop() {
        if (stopped) { return; }
        stopped = true;
        try { if (timer !== null) { clearInterval(timer); } } catch (_) {   }
        for (var si = 0; si < bound.length; si++) {
          try {
            bound[si][0].removeEventListener(bound[si][1], bound[si][2], true);
          } catch (_) {   }
        }
        bound = [];
      }
      function attach(target, name, fn) {
        if (!target || typeof target.addEventListener !== 'function') { return; }
        try {
          target.addEventListener(name, fn, { capture: true, passive: true });
          bound.push([target, name, fn]);
        } catch (_) {   }
      }
      var doc = globalThis.document;
      for (var ei = 0; ei < names.length; ei++) {
        (function (name, id) {
          if (!name || !(id >= 0)) { return; }
          var target = (name === 'focus' || name === 'blur' || name === 'pagehide'
              || name === 'resize' || name === 'scroll') ? globalThis : doc;
          attach(target, name, function (e) {
            try { record(name, id, e); } catch (_) {   }
          });
        })(names[ei], parseInt(wire[ei], 10));
      }
      if (!bound.length) { return; }
      attach(doc, 'visibilitychange', function () {
        try {
          if (doc && doc.visibilityState === 'hidden') { send(true, false); }
        } catch (_) {   }
      });
      attach(globalThis, 'pagehide', function () {
        try { send(true, true); } catch (_) {   }
      });
      try {
        timer = setInterval(function () {
          try { send(false, false); } catch (_) {   }
        }, flushMs);
      } catch (_) {   }
    }
    function dbsc(url) {
      var el = null, ticks = 0, POLLS = 60, STEP_MS = 250, started = false;
      function remove() {
        try { if (el && el.parentNode) { el.parentNode.removeChild(el); } } catch (_) {   }
      }
      function start() {
        if (started) { return; }
        started = true;
        try { globalThis.removeEventListener('load', start); } catch (_) {   }
        try {
          el = document.createElement('iframe');
          el.setAttribute('aria-hidden', 'true');
          el.setAttribute('tabindex', '-1');
          el.setAttribute('title', '');
          el.width = '1'; el.height = '1';
          try {
            el.style.cssText = 'position:absolute;top:-9999px;left:-9999px;'
              + 'width:1px;height:1px;border:0;opacity:0;pointer-events:none;';
          } catch (_) {   }
          el.src = url;
          var host = document.body || document.documentElement;
          if (!host) { return; }
          host.appendChild(el);
          (function poll() {
            if (++ticks >= POLLS) { remove(); return; }
            try { setTimeout(poll, STEP_MS); } catch (_) { remove(); }
          })();
        } catch (_) { remove(); }
      }
      try {
        if (typeof document === 'undefined' || !document.createElement) { return; }
        if (document.readyState === 'complete' || typeof globalThis.addEventListener !== 'function') {
          start();
        } else {
          globalThis.addEventListener('load', start);
        }
      } catch (_) {   }
    }
  } catch (_) {   }
})();
