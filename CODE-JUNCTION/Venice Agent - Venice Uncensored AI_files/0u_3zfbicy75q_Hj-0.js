;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="e238b0d3-3abf-d8b1-11d9-e02ed5a8c6c6")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,350248,e=>{"use strict";var t=e.i(474076),r=e.i(500932),o=e.i(825052),a=e.i(827806),n=e.i(377584),i=e.i(78890),s=e.i(953978),l=e.i(943380),c=e.i(497058),d=e.i(768834),u=e.i(107847),f=e.i(325960);try{var p=window;p._sentryModuleMetadata=p._sentryModuleMetadata||{},p._sentryModuleMetadata[new p.Error().stack]=Object.assign({},p._sentryModuleMetadata[new p.Error().stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}let h=(0,d.$)()(e=>({href:null,open:t=>e({href:t}),close:()=>e({href:null})})),g=e=>h.getState().open(e);function m(e){return e.settings.showExternalLinkWarning}function v(e){return e.href}function y(e){return e.close}e.s(["R",0,e=>{let o,a=(0,r.c)(4),{href:i,children:l}=e,c=(0,f.f)(m);return a[0]!==l||a[1]!==i||a[2]!==c?(o=c?(0,t.jsx)(s.Text,{as:"span",onClick:()=>{i&&g(i)},textDecoration:"underline",cursor:"pointer",children:l}):(0,t.jsx)(n.Link,{href:i,textDecoration:"underline",target:"_blank",rel:"noopener,noreferrer",children:l}),a[0]=l,a[1]=i,a[2]=c,a[3]=o):o=a[3],o},"G",0,()=>{let e,n,d,f,p,g,m,b,w,_=(0,r.c)(24),{t:E}=(0,l.useTranslate)(),M=h(v),S=h(y);_[0]!==S||_[1]!==M?(e=()=>{M&&window.open(M,"_blank","noopener,noreferrer"),S()},_[0]=S,_[1]=M,_[2]=e):e=_[2];let A=e;_[3]!==E?(n=E("Proceed"),_[3]=E,_[4]=n):n=_[4],_[5]===Symbol.for("react.memo_cache_sentinel")?(d=(0,t.jsx)(o.f,{color:"text.warning",children:(0,t.jsx)(c.TbAlertTriangleFilled,{size:"4rem"})}),_[5]=d):d=_[5];let T=null!==M;return _[6]!==E?(f=E("Visiting External Link"),_[6]=E,_[7]=f):f=_[7],_[8]!==E?(p=E("It is possible for LLMs to invent fake links. Please double check the following URL before proceeding."),_[8]=E,_[9]=p):p=_[9],_[10]!==p?(g=(0,t.jsx)(s.Text,{children:p}),_[10]=p,_[11]=g):g=_[11],_[12]!==M?(m=(0,t.jsx)(a.f,{lineHeight:"tall",px:4,py:3,size:"sm",textAlign:"center",variant:"muted",width:"full",wordBreak:"break-all",children:M}),_[12]=M,_[13]=m):m=_[13],_[14]!==g||_[15]!==m?(b=(0,t.jsxs)(i.Stack,{children:[g,m]}),_[14]=g,_[15]=m,_[16]=b):b=_[16],_[17]!==S||_[18]!==A||_[19]!==n||_[20]!==T||_[21]!==f||_[22]!==b?(w=(0,t.jsx)(u.f,{confirmLabel:n,icon:d,isOpen:T,modalSize:"sm",title:f,onClose:S,onConfirm:A,children:b}),_[17]=S,_[18]=A,_[19]=n,_[20]=T,_[21]=f,_[22]=b,_[23]=w):w=_[23],w},"C",0,g])},558959,538424,e=>{"use strict";var t=e.i(474076),r=e.i(500932),o=e.i(829825),a=e.i(943380),n=e.i(34188),i=e.i(148077),s=e.i(271645),l=e.i(920347),c=e.i(219835),d=e.i(173113),u=e.i(461476),f=e.i(455142),p=e.i(992531),h=e.i(453103),g=e.i(289102);try{var m=window;m._sentryModuleMetadata=m._sentryModuleMetadata||{},m._sentryModuleMetadata[new m.Error().stack]=Object.assign({},m._sentryModuleMetadata[new m.Error().stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}let v="venice-tts-v2",y="test",b=()=>{let e,t,o,a=(0,r.c)(12),n=(0,u.R)("ttsEnabled"),i=(0,d.f)(),{trackEvent:l}=(0,p.f)(),c=(0,f.i)(v,!!n);a[0]!==n||a[1]!==c?(e=!!n&&(0,f.X)(c,y),a[0]=n,a[1]=c,a[2]=e):e=a[2];let m=e,b=m?h.Q:h.u,w=(0,s.useRef)(!1);a[3]!==i||a[4]!==l||a[5]!==n?(t=()=>{if(!n||w.current)return;w.current=!0;let e=i.getFeatureFlag(v)===y;l({name:g.f.VeniceTtsExperimentExposure,data:{variant:e?"test":"control",modelId:e?h.Q:h.u}})},a[3]=i,a[4]=l,a[5]=n,a[6]=t):t=a[6];let _=t,E=n?c:void 0;return a[7]!==m||a[8]!==b||a[9]!==E||a[10]!==_?(o={isTestVariant:m,modelId:b,trackExposure:_,variant:E},a[7]=m,a[8]=b,a[9]=E,a[10]=_,a[11]=o):o=a[11],o};e.s(["f",0,b],538424);var w=e.i(325960);try{var _=window;_._sentryModuleMetadata=_._sentryModuleMetadata||{},_._sentryModuleMetadata[new _.Error().stack]=Object.assign({},_._sentryModuleMetadata[new _.Error().stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}let E=(0,l.e)({});function M(e){return e.settings.streamTts}e.s(["G",0,e=>{let l,d,u,f,p,h,g,m,v,y,_,S,A,T,x,k,P,R,C,O,L,F,I,D,j,N,H=(0,r.c)(64),{children:B}=e,G=(0,o.f)(),{t:z}=(0,a.useTranslate)(),[$,U]=(0,s.useState)(null),[W,q]=(0,s.useState)(!1),[X,J]=(0,s.useState)(void 0),[K,V]=(0,s.useState)(!1);H[0]===Symbol.for("react.memo_cache_sentinel")?(l=[],H[0]=l):l=H[0];let[Y,Q]=(0,s.useState)(l),Z=(0,s.useRef)(void 0),ee=(0,s.useRef)(null),et=(0,s.useRef)(!1),er=(0,s.useRef)(!1);H[1]!==$?(d=()=>{ee.current=$},u=[$],H[1]=$,H[2]=d,H[3]=u):(d=H[2],u=H[3]),(0,s.useEffect)(d,u);let eo=(0,n.useDefaultModel)("tts"),{modelId:ea,trackExposure:en}=b(),ei=(0,w.f)(M),es=ea||eo?.id;H[4]===Symbol.for("react.memo_cache_sentinel")?(f=()=>{let e=new c.n;return U(e),()=>e.cleanup()},p=[],H[4]=f,H[5]=p):(f=H[4],p=H[5]),(0,s.useEffect)(f,p),H[6]!==$||H[7]!==ei?(h=()=>{if(!$||!ei)return;let e=()=>$.unlock(),t={passive:!0};return document.addEventListener("pointerdown",e,t),document.addEventListener("touchend",e,t),document.addEventListener("keydown",e,t),()=>{document.removeEventListener("pointerdown",e,t),document.removeEventListener("touchend",e,t),document.removeEventListener("keydown",e,t)}},g=[$,ei],H[6]=$,H[7]=ei,H[8]=h,H[9]=g):(h=H[8],g=H[9]),(0,s.useEffect)(h,g),H[10]!==$?(m=()=>{if(!$)return;let e=$.addPlayingStateListener(e=>{q(e),et.current=e}),t=$.addDownloadableMessagesListener(Q);return()=>{e(),t()}},v=[$],H[10]=$,H[11]=m,H[12]=v):(m=H[11],v=H[12]),(0,s.useEffect)(m,v),H[13]!==X?(y=()=>{X&&(Z.current=X)},_=[X],H[13]=X,H[14]=y,H[15]=_):(y=H[14],_=H[15]),(0,s.useEffect)(y,_),H[16]!==$?(S=()=>{let e=e=>V(e);return $?.addPausedStateListener(e),()=>$?.removePausedStateListener(e)},A=[$],H[16]=$,H[17]=S,H[18]=A):(S=H[17],A=H[18]),(0,s.useEffect)(S,A),H[19]===Symbol.for("react.memo_cache_sentinel")?(T=e=>{et.current||(et.current=!0),ee.current?.addToPlaybackQueue(e.audio,e.messageId,!1)},H[19]=T):T=H[19],H[20]!==z||H[21]!==G?(x={maxConcurrentRequests:3,onAudioReady:T,onError:e=>{"ERR_CANCELED"===e.code?console.log("TTS generation canceled by user"):(console.error("TTS generation error:",e),G({title:z("Error generating audio"),description:z("An error occurred while generating the audio. Please try again."),status:"error",duration:1e4,isClosable:!0,position:"top-right"}))}},H[20]=z,H[21]=G,H[22]=x):x=H[22];let{cancel:el,generate:ec,getCachedMessage:ed,isGenerating:eu}=(0,n.useTTS)("blob",x);H[23]!==$||H[24]!==ed||H[25]!==eu?(k=()=>{let e=Z.current;er.current&&!eu&&e&&$&&(async()=>{try{await ed(e)&&$.markMessageDownloadable(e)}catch(e){console.error("Failed to check cache for audio player:",e)}})(),er.current=eu},P=[ed,eu,$],H[23]=$,H[24]=ed,H[25]=eu,H[26]=k,H[27]=P):(k=H[26],P=H[27]),(0,s.useEffect)(k,P),H[28]!==el||H[29]!==ec||H[30]!==en||H[31]!==es?(R=e=>{e.messageId&&e.messageId!==Z.current&&(el(),ee.current?.stop()),e.messageId&&(J(e.messageId),Z.current=e.messageId),en(),ec({...e,model:e.model??es})},H[28]=el,H[29]=ec,H[30]=en,H[31]=es,H[32]=R):R=H[32];let ef=R;H[33]!==$||H[34]!==el?(C=()=>{J(void 0),el(),$?.stop()},H[33]=$,H[34]=el,H[35]=C):C=H[35];let ep=C;H[36]!==$?(O=()=>{$?.pause()},H[36]=$,H[37]=O):O=H[37];let eh=O;H[38]!==$?(L=()=>{$?.resume()},H[38]=$,H[39]=L):L=H[39];let eg=L;H[40]!==ed||H[41]!==ep?(F=e=>{ep(),J(e),Z.current=e,(async()=>{try{let t=await ed(e);if(t){let e=ee.current;e&&e.addToPlaybackQueue(t,void 0,!0)}else console.error("No cached audio found for message:",e)}catch(e){console.error("Failed to play cached audio:",e)}})()},H[40]=ed,H[41]=ep,H[42]=F):F=H[42];let em=F;H[43]!==ed?(I=(e,t)=>{let r=t??`Venice-Voice-${(0,i.t)()}.wav`;(async()=>{try{let t=await ed(e);if(!t)return void console.error("Failed to download audio: No audio history to export");let o=URL.createObjectURL(t),a=document.createElement("a");a.href=o,a.download=r,a.click(),URL.revokeObjectURL(o)}catch(e){console.error("Failed to download audio:",e)}})()},H[43]=ed,H[44]=I):I=H[44];let ev=I;H[45]!==$||H[46]!==el?(D=e=>{Z.current===e&&(Z.current=void 0,el(),$?.stop()),J(t=>t===e?void 0:t),$?.removeMessageFromDownloadable(e)},H[45]=$,H[46]=el,H[47]=D):D=H[47];let ey=D;H[48]!==ey||H[49]!==X||H[50]!==ev||H[51]!==Y||H[52]!==ef||H[53]!==eu||H[54]!==K||H[55]!==W||H[56]!==eh||H[57]!==em||H[58]!==eg||H[59]!==ep?(j={clearMessageAudioState:ey,currentMessageId:X,downloadAudioHistory:ev,downloadableMessages:Y,generateAndPlay:ef,isAudioPlaying:W,isAudioPaused:K,isGenerating:eu,playDownloadableMessage:em,stopAudioPlayer:ep,pauseAudioPlayer:eh,resumeAudioPlayer:eg},H[48]=ey,H[49]=X,H[50]=ev,H[51]=Y,H[52]=ef,H[53]=eu,H[54]=K,H[55]=W,H[56]=eh,H[57]=em,H[58]=eg,H[59]=ep,H[60]=j):j=H[60];let eb=j;return H[61]!==B||H[62]!==eb?(N=(0,t.jsx)(E.Provider,{value:eb,children:B}),H[61]=B,H[62]=eb,H[63]=N):N=H[63],N},"I",0,e=>(0,l.B)(E,e)],558959)},164023,e=>{"use strict";var t=e.i(500932),r=e.i(461476),o=e.i(325960);try{var a=window;a._sentryModuleMetadata=a._sentryModuleMetadata||{},a._sentryModuleMetadata[new a.Error().stack]=Object.assign({},a._sentryModuleMetadata[new a.Error().stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}function n(e){return e.settings.workspacesEnabled}e.s(["f",0,()=>{let e,a=(0,t.c)(2),i=(0,r.N)(),s=(0,o.f)(n)??!1,l=i&&s;return a[0]!==l?(e={isEnabled:l},a[0]=l,a[1]=e):e=a[1],e}])},815345,e=>{"use strict";try{var t=window;t._sentryModuleMetadata=t._sentryModuleMetadata||{},t._sentryModuleMetadata[(new t.Error).stack]=Object.assign({},t._sentryModuleMetadata[(new t.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}e.s(["f",0,(e,t={})=>{let{approximate:r=!1,round:o=!1}=t,a=r?"~":"",n=(o?Math.round:Math.floor)(e/1e3);if(n<60)return`${a}${n}s`;let i=Math.floor(n/60),s=n%60;return 0===s||r?`${a}${i}m`:`${i}m ${s}s`}])},683558,e=>{"use strict";let t;try{var r=window;r._sentryModuleMetadata=r._sentryModuleMetadata||{},r._sentryModuleMetadata[(new r.Error).stack]=Object.assign({},r._sentryModuleMetadata[(new r.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}let o=()=>Promise.reject(Error("The workspace is not connected yet.")),a={copyFile:o,createFile:o,deleteFile:o,getOrigin:()=>null,listFiles:o,readFile:o,readFileBlob:o,replaceFile:o},n=({mindConversationId:e,path:t,userId:r})=>JSON.stringify([r,e,t]),i=a,s=Symbol("disconnected workspace transport"),l=new Set,c=new Map,d=new Map,u=()=>{l.forEach(e=>e())},f=e=>{let t=n(e);c.set(t,(c.get(t)??0)+1),d.get(t)?.forEach(e=>e())},p=()=>{if(0===c.size)return;let e=[...c.keys()];c.clear(),e.forEach(e=>d.get(e)?.forEach(e=>e()))},h=async(e,t)=>{let r=i,o=s;await e(r),s===o&&f(t)};e.s(["f",0,{connectTransport:e=>{let r=Symbol("workspace transport connection"),o=t;return s=r,i=e,t=void 0,o?.(),p(),t=e.subscribeExternalFileChanges?.(e=>{s===r&&f(e)}),u(),()=>{if(s!==r)return;let e=t;t=void 0,i=a,s=Symbol("disconnected workspace transport"),e?.(),p(),u()}},copyFile:e=>h(t=>t.copyFile(e),{mindConversationId:e.mindConversationId,path:e.destinationPath,userId:e.userId}),createFile:e=>h(t=>t.createFile(e),e),deleteFile:e=>h(t=>t.deleteFile(e),e),getFileRevision:e=>c.get(n(e))??0,getOrigin:e=>i.getOrigin(e),listFiles:e=>i.listFiles(e),readFile:e=>i.readFile(e),readFileBlob:e=>i.readFileBlob(e),replaceFile:e=>h(t=>t.replaceFile(e),e),subscribeConnection:e=>(l.add(e),()=>{l.delete(e)}),subscribeFile:(e,t)=>{let r=n(e),o=d.get(r)??new Set;return o.add(t),d.set(r,o),()=>{o.delete(t),0===o.size&&d.delete(r)}}}])},623194,74521,374056,e=>{"use strict";e.i(62168);var t=e.i(194334),r=e.i(512549);e.i(153454);var o=e.i(468566);e.i(750043);var a=e.i(944037);try{var n=window;n._sentryModuleMetadata=n._sentryModuleMetadata||{},n._sentryModuleMetadata[(new n.Error).stack]=Object.assign({},n._sentryModuleMetadata[(new n.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}let i="/sandbox/workspace/files/",s=[...t.P.split("; ").map(e=>e.startsWith("font-src ")?e.replace("font-src ","font-src 'self' "):e.startsWith("worker-src ")?"worker-src blob:":e),r.g].join("; "),l=`
const FILES_PATH = ${JSON.stringify(i)};
const SHELL_PATH = ${JSON.stringify(o.u)};
const SHELL_SOURCE = ${JSON.stringify((0,o.i)())};
const SHELL_TAG = '<script src="' + SHELL_PATH + '"></script>';
const CONTENT_TYPES = ${JSON.stringify({avif:"image/avif",css:"text/css; charset=utf-8",gif:"image/gif",ico:"image/x-icon",jpeg:"image/jpeg",jpg:"image/jpeg",js:"text/javascript; charset=utf-8",json:"application/json; charset=utf-8",mjs:"text/javascript; charset=utf-8",mp3:"audio/mpeg",mp4:"video/mp4",ogg:"audio/ogg",otf:"font/otf",png:"image/png",svg:"image/svg+xml",ttf:"font/ttf",wasm:"application/wasm",wav:"audio/wav",webm:"video/webm",webp:"image/webp",woff:"font/woff",woff2:"font/woff2"})};
const MAX_ARTIFACT_HTML_BYTES = 1048576;
const ARTIFACT_CSP = ${JSON.stringify(s)};
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
`,c=(0,a.f)(l);e.s(["f",0,1048576,"n",0,i,"b",0,"/sandbox/workspace/service-worker","z",0,"/sandbox/workspace/","q",0,c],74521);try{var d=window;d._sentryModuleMetadata=d._sentryModuleMetadata||{},d._sentryModuleMetadata[(new d.Error).stack]=Object.assign({},d._sentryModuleMetadata[(new d.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}let u="Use a workspace-relative file path without empty, dot, parent, backslash, or control-character segments.",f=/[\u0000-\u001f\u007f\\]/,p=e=>!("string"!=typeof e||0===e.length||e.length>1024||f.test(e))&&e.split("/").every(e=>""!==e&&"."!==e&&".."!==e);e.s(["m",0,u,"e",0,1e3,"k",0,1024,"I",0,p],374056);try{var h=window;h._sentryModuleMetadata=h._sentryModuleMetadata||{},h._sentryModuleMetadata[(new h.Error).stack]=Object.assign({},h._sentryModuleMetadata[(new h.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}e.s(["$",0,e=>{if(!p(e))throw Error(u);return e},"K",0,e=>new TextEncoder().encode(e).byteLength<=1048576],623194)},402935,e=>{"use strict";var t=e.i(474076),r=e.i(177225),o=e.i(583554),a=e.i(9160),n=e.i(872548),i=e.i(523093);try{var s="u">typeof window?window:e.g;s._sentryModuleMetadata=s._sentryModuleMetadata||{},s._sentryModuleMetadata[(new s.Error).stack]=Object.assign({},s._sentryModuleMetadata[(new s.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}let l=(0,a.f)(function(e,a){let{borderLeftWidth:s,borderBottomWidth:l,borderTopWidth:c,borderRightWidth:d,borderWidth:u,borderStyle:f,borderColor:p,...h}=(0,n.y)("Divider",e),{className:g,orientation:m="horizontal",__css:v,...y}=(0,r.f)(e);return(0,t.jsx)(i.f.hr,{ref:a,"aria-orientation":m,...y,__css:{...h,border:"0",borderColor:p,borderStyle:f,...{vertical:{borderLeftWidth:s||d||u||"1px",height:"100%"},horizontal:{borderBottomWidth:l||c||u||"1px",width:"100%"}}[m],...v},className:(0,o.f)("chakra-divider",g)})});l.displayName="Divider",e.s(["f",0,l])},933818,e=>{"use strict";try{var t=window;t._sentryModuleMetadata=t._sentryModuleMetadata||{},t._sentryModuleMetadata[(new t.Error).stack]=Object.assign({},t._sentryModuleMetadata[(new t.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}e.s(["f",0,function(e){return e}])},936556,e=>{"use strict";var t=e.i(582710);try{var r=window;r._sentryModuleMetadata=r._sentryModuleMetadata||{},r._sentryModuleMetadata[(new r.Error).stack]=Object.assign({},r._sentryModuleMetadata[(new r.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}function o(e,{pages:t,pageParams:r}){let a=t.length-1;return t.length>0?e.getNextPageParam(t[a],t,r[a],r):void 0}function a(e,{pages:t,pageParams:r}){return t.length>0?e.getPreviousPageParam?.(t[0],t,r[0],r):void 0}e.s(["B",0,function(e,t){return!!t&&null!=o(e,t)},"u",0,function(e,t){return!!t&&!!e.getPreviousPageParam&&null!=a(e,t)},"T",0,function(e){return{onFetch:(r,n)=>{let i=r.options,s=r.fetchOptions?.meta?.fetchMore?.direction,l=r.state.data?.pages||[],c=r.state.data?.pageParams||[],d={pages:[],pageParams:[]},u=0,f=async()=>{let n=!1,f=(0,t.W)(r.options,r.fetchOptions),p=async(e,o,a)=>{if(n)return Promise.reject();if(null==o&&e.pages.length)return Promise.resolve(e);let i={queryKey:r.queryKey,pageParam:o,direction:a?"backward":"forward",meta:r.options.meta};Object.defineProperty(i,"signal",{enumerable:!0,get:()=>(r.signal.aborted?n=!0:r.signal.addEventListener("abort",()=>{n=!0}),r.signal)});let s=await f(i),{maxPages:l}=r.options,c=a?t.R:t.E;return{pages:c(e.pages,s,l),pageParams:c(e.pageParams,o,l)}};if(s&&l.length){let e="backward"===s,t={pages:l,pageParams:c},r=(e?a:o)(i,t);d=await p(t,r,e)}else{let t=e??l.length;do{let e=0===u?c[0]??i.initialPageParam:o(i,d);if(u>0&&null==e)break;d=await p(d,e),u++}while(u<t)}return d};r.options.persister?r.fetchFn=()=>r.options.persister?.(f,{queryKey:r.queryKey,meta:r.options.meta,signal:r.signal},n):r.fetchFn=f}}}])},54513,e=>{"use strict";var t=e.i(271645);try{var r="u">typeof window?window:e.g;r._sentryModuleMetadata=r._sentryModuleMetadata||{},r._sentryModuleMetadata[(new r.Error).stack]=Object.assign({},r._sentryModuleMetadata[(new r.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}var o=Object.defineProperty,a=new Map,n=new WeakMap,i=0,s=void 0;t.Component,e.s(["f",0,function({threshold:e,delay:r,trackVisibility:o,rootMargin:l,root:c,triggerOnce:d,skip:u,initialInView:f,fallbackInView:p,onChange:h}={}){var g;let[m,v]=t.useState(null),y=t.useRef(h),[b,w]=t.useState({inView:!!f,entry:void 0});y.current=h,t.useEffect(()=>{let t;if(!u&&m)return t=function(e,t,r={},o=s){if(void 0===window.IntersectionObserver&&void 0!==o){let a=e.getBoundingClientRect();return t(o,{isIntersecting:o,target:e,intersectionRatio:"number"==typeof r.threshold?r.threshold:0,time:0,boundingClientRect:a,intersectionRect:a,rootBounds:a}),()=>{}}let{id:l,observer:c,elements:d}=function(e){let t=Object.keys(e).sort().filter(t=>void 0!==e[t]).map(t=>{var r;return`${t}_${"root"===t?!(r=e.root)?"0":(n.has(r)||(i+=1,n.set(r,i.toString())),n.get(r)):e[t]}`}).toString(),r=a.get(t);if(!r){let o,n=new Map,i=new IntersectionObserver(t=>{t.forEach(t=>{var r;let a=t.isIntersecting&&o.some(e=>t.intersectionRatio>=e);e.trackVisibility&&void 0===t.isVisible&&(t.isVisible=a),null==(r=n.get(t.target))||r.forEach(e=>{e(a,t)})})},e);o=i.thresholds||(Array.isArray(e.threshold)?e.threshold:[e.threshold||0]),r={id:t,observer:i,elements:n},a.set(t,r)}return r}(r),u=d.get(e)||[];return d.has(e)||d.set(e,u),u.push(t),c.observe(e),function(){u.splice(u.indexOf(t),1),0===u.length&&(d.delete(e),c.unobserve(e)),0===d.size&&(c.disconnect(),a.delete(l))}}(m,(e,r)=>{w({inView:e,entry:r}),y.current&&y.current(e,r),r.isIntersecting&&d&&t&&(t(),t=void 0)},{root:c,rootMargin:l,threshold:e,trackVisibility:o,delay:r},p),()=>{t&&t()}},[Array.isArray(e)?e.toString():e,m,c,l,d,u,o,p,r]);let _=null==(g=b.entry)?void 0:g.target,E=t.useRef(void 0);m||!_||d||u||E.current===_||(E.current=_,w({inView:!!f,entry:void 0}));let M=[v,b.inView,b.entry];return M.ref=M[0],M.inView=M[1],M.entry=M[2],M}])},194334,62168,153454,512549,e=>{"use strict";try{var t=window;t._sentryModuleMetadata=t._sentryModuleMetadata||{},t._sentryModuleMetadata[(new t.Error).stack]=Object.assign({},t._sentryModuleMetadata[(new t.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}let r={bg:"#050a0f",border:"rgba(255, 255, 255, 0.15)",borderHover:"rgba(255, 255, 255, 0.3)",card:"#1f2937",cardFg:"#f9fafb",error:"#ef4444",fg:"#f9fafb",fgMuted:"#9ca3af",input:"#374151",mode:"dark",muted:"rgba(107, 114, 128, 0.1)",primary:"#a855f7",secondary:"rgba(168, 85, 247, 0.12)",secondaryFg:"#f9fafb",success:"#22c55e"},o=String.raw`(?:(?:0|1)(?:\.\d+)?|0?\.\d+|\d{1,3}(?:\.\d+)?%)`,a=String.raw`\d{1,3}`,n=String.raw`-?\d+(?:\.\d+)?(?:deg|rad|turn)?`,i=String.raw`\d{1,3}(?:\.\d+)?%`,s=Object.freeze([String.raw`^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$`,String.raw`^rgba?\(\s*${a}\s*,\s*${a}\s*,\s*${a}\s*(?:,\s*${o})?\s*\)$`,String.raw`^rgba?\(\s*${a}\s+${a}\s+${a}\s*(?:/\s*${o})?\s*\)$`,String.raw`^hsla?\(\s*${n}\s*,\s*${i}\s*,\s*${i}\s*(?:,\s*${o})?\s*\)$`,String.raw`^hsla?\(\s*${n}\s+${i}\s+${i}\s*(?:/\s*${o})?\s*\)$`]),l=s.map(e=>new RegExp(e)),c=(e,t)=>{let r=e.trim();return l.some(e=>e.test(r))?r:t},d=e=>JSON.stringify({bg:c(e.bg,"#050a0f"),fg:c(e.fg,"#f9fafb"),fgMuted:c(e.fgMuted,"#9ca3af"),card:c(e.card,"#1f2937"),cardFg:c(e.cardFg,"#f9fafb"),input:c(e.input,"#374151"),muted:c(e.muted,"rgba(107, 114, 128, 0.1)"),border:c(e.border,"rgba(255, 255, 255, 0.15)"),borderHover:c(e.borderHover,"rgba(255, 255, 255, 0.3)"),primary:c(e.primary,"#a855f7"),secondary:c(e.secondary,"rgba(168, 85, 247, 0.12)"),secondaryFg:c(e.secondaryFg,"#f9fafb"),success:c(e.success,"#22c55e"),error:c(e.error,"#ef4444"),mode:e.mode}).replace(/</g,"\\u003c"),u=(e,t)=>(t.style.background=`var(${e})`,getComputedStyle(t).backgroundColor);e.s(["e",0,r,"T",0,s,"M",0,()=>{let e;if("u"<typeof document)return r;let t=document.createElement("div");document.body.appendChild(t);let o=u("--background",t)||r.bg,a=(e=o.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/))?[Number.parseInt(e[1],10),Number.parseInt(e[2],10),Number.parseInt(e[3],10)]:null,n={bg:o,border:u("--border",t)||r.border,borderHover:u("--border-hover",t)||r.borderHover,card:u("--card",t)||r.card,cardFg:u("--card-foreground",t)||r.cardFg,error:r.error,fg:u("--foreground",t)||r.fg,fgMuted:u("--muted-foreground",t)||r.fgMuted,input:u("--input",t)||r.input,mode:a&&((e,t,r)=>{let[o,a,n]=[e,t,r].map(e=>{let t=e/255;return t<=.03928?t/12.92:Math.pow((t+.055)/1.055,2.4)});return .2126*o+.7152*a+.0722*n})(...a)>=.5?"light":"dark",muted:u("--muted",t)||r.muted,primary:u("--primary",t)||r.primary,secondary:u("--secondary",t)||r.secondary,secondaryFg:u("--secondary-foreground",t)||r.secondaryFg,success:r.success};return t.remove(),n},"X",0,d],62168);try{var f=window;f._sentryModuleMetadata=f._sentryModuleMetadata||{},f._sentryModuleMetadata[(new f.Error).stack]=Object.assign({},f._sentryModuleMetadata[(new f.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}let p=`
<svg aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden;">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" 
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/>
    </marker>
    <marker id="arrow-filled" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/>
    </marker>
    <marker id="dot" viewBox="0 0 10 10" refX="5" refY="5"
            markerWidth="5" markerHeight="5">
      <circle cx="5" cy="5" r="4" fill="currentColor"/>
    </marker>
  </defs>
</svg>
`,h=`
/* Color classes - 9 ramps \xd7 7 stops */
.c-purple-50  { fill: #faf5ff; } .c-purple-100 { fill: #f3e8ff; } .c-purple-200 { fill: #e9d5ff; }
.c-purple-300 { fill: #d8b4fe; } .c-purple-400 { fill: #c084fc; } .c-purple-500 { fill: #a855f7; }
.c-purple-600 { fill: #9333ea; } .c-purple-700 { fill: #7c3aed; } .c-purple-800 { fill: #6b21a8; }
.c-purple-900 { fill: #581c87; }

.c-teal-50  { fill: #f0fdfa; } .c-teal-100 { fill: #ccfbf1; } .c-teal-200 { fill: #99f6e4; }
.c-teal-300 { fill: #5eead4; } .c-teal-400 { fill: #2dd4bf; } .c-teal-500 { fill: #14b8a6; }
.c-teal-600 { fill: #0d9488; } .c-teal-700 { fill: #0f766e; } .c-teal-800 { fill: #115e59; }
.c-teal-900 { fill: #134e4a; }

.c-coral-50  { fill: #fff7ed; } .c-coral-100 { fill: #ffedd5; } .c-coral-200 { fill: #fed7aa; }
.c-coral-300 { fill: #fdba74; } .c-coral-400 { fill: #fb923c; } .c-coral-500 { fill: #f97316; }
.c-coral-600 { fill: #ea580c; } .c-coral-700 { fill: #c2410c; } .c-coral-800 { fill: #9a3412; }
.c-coral-900 { fill: #7c2d12; }

.c-pink-50  { fill: #fdf2f8; } .c-pink-100 { fill: #fce7f3; } .c-pink-200 { fill: #fbcfe8; }
.c-pink-300 { fill: #f9a8d4; } .c-pink-400 { fill: #f472b6; } .c-pink-500 { fill: #ec4899; }
.c-pink-600 { fill: #db2777; } .c-pink-700 { fill: #be185d; } .c-pink-800 { fill: #9d174d; }
.c-pink-900 { fill: #831843; }

.c-gray-50  { fill: #f9fafb; } .c-gray-100 { fill: #f3f4f6; } .c-gray-200 { fill: #e5e7eb; }
.c-gray-300 { fill: #d1d5db; } .c-gray-400 { fill: #9ca3af; } .c-gray-500 { fill: #6b7280; }
.c-gray-600 { fill: #4b5563; } .c-gray-700 { fill: #374151; } .c-gray-800 { fill: #1f2937; }
.c-gray-900 { fill: #111827; }

.c-blue-50  { fill: #eff6ff; } .c-blue-100 { fill: #dbeafe; } .c-blue-200 { fill: #bfdbfe; }
.c-blue-300 { fill: #93c5fd; } .c-blue-400 { fill: #60a5fa; } .c-blue-500 { fill: #3b82f6; }
.c-blue-600 { fill: #2563eb; } .c-blue-700 { fill: #1d4ed8; } .c-blue-800 { fill: #1e40af; }
.c-blue-900 { fill: #1e3a8a; }

.c-green-50  { fill: #f0fdf4; } .c-green-100 { fill: #dcfce7; } .c-green-200 { fill: #bbf7d0; }
.c-green-300 { fill: #86efac; } .c-green-400 { fill: #4ade80; } .c-green-500 { fill: #22c55e; }
.c-green-600 { fill: #16a34a; } .c-green-700 { fill: #15803d; } .c-green-800 { fill: #166534; }
.c-green-900 { fill: #14532d; }

.c-amber-50  { fill: #fffbeb; } .c-amber-100 { fill: #fef3c7; } .c-amber-200 { fill: #fde68a; }
.c-amber-300 { fill: #fcd34d; } .c-amber-400 { fill: #fbbf24; } .c-amber-500 { fill: #f59e0b; }
.c-amber-600 { fill: #d97706; } .c-amber-700 { fill: #b45309; } .c-amber-800 { fill: #92400e; }
.c-amber-900 { fill: #78350f; }

.c-red-50  { fill: #fef2f2; } .c-red-100 { fill: #fee2e2; } .c-red-200 { fill: #fecaca; }
.c-red-300 { fill: #fca5a5; } .c-red-400 { fill: #f87171; } .c-red-500 { fill: #ef4444; }
.c-red-600 { fill: #dc2626; } .c-red-700 { fill: #b91c1c; } .c-red-800 { fill: #991b1b; }
.c-red-900 { fill: #7f1d1d; }

/* Text classes */
.th { font-size: 14px; font-weight: 500; }
.ts { font-size: 11px; }
.t  { font-size: 12px; }

/* Arrow class */
.arr { marker-end: url(#arrow); }
`;e.s(["Q",0,p,"m",0,h],153454);try{var g=window;g._sentryModuleMetadata=g._sentryModuleMetadata||{},g._sentryModuleMetadata[(new g.Error).stack]=Object.assign({},g._sentryModuleMetadata[(new g.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}let m="default-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: https://esm.sh https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com https://skypack.dev https://esm.run https://deno.land https://ga.jspm.io https://v8.js-dos.com https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://esm.sh https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com https://v8.js-dos.com https://cdn.tailwindcss.com; font-src https://fonts.gstatic.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com; img-src 'self' data: blob: https://unpkg.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://*.basemaps.cartocdn.com https://api.mapbox.com https://*.tiles.mapbox.com; frame-src 'self' blob:; connect-src 'self' https://esm.sh https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com https://skypack.dev https://esm.run https://deno.land https://ga.jspm.io https://*.basemaps.cartocdn.com https://api.mapbox.com https://*.tiles.mapbox.com https://api.venice.ai https://v8.js-dos.com; media-src 'self' blob: data:; worker-src 'self' blob:; object-src 'self' blob:";e.s(["P",0,m,"o",0,(e,t)=>{let r=d(t);return`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="${m}">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root, html, body { width: 100%; height: 100%; overflow: hidden; }
    #sandbox { border: none; width: 100%; height: 100%; }
    ${e?h:""}
  </style>
</head>
<body>
  ${e?p:""}
  <iframe id="sandbox" allow="fullscreen" sandbox="allow-scripts allow-forms allow-same-origin"></iframe>
  <script>
    (function() {
      var theme = ${r};
      var sandbox = document.getElementById('sandbox');
      document.documentElement.style.setProperty('background-color', theme.bg);
      document.body.style.setProperty('background-color', theme.bg);
      sandbox.style.setProperty('background-color', theme.bg);
      var lastContent = null;

      // Avoid infinite message loops when hosted as top frame (e.g., React Native)
      function postToHost(message) {
        var nativeBridge = window.ReactNativeWebView;
        if (nativeBridge && typeof nativeBridge.postMessage === 'function') {
          nativeBridge.postMessage(JSON.stringify(message));
          return;
        }
        if (window.parent !== window) {
          window.parent.postMessage(message, '*');
        }
      }
      
      function render(content, isSvg) {
        if (content === lastContent) return;
        lastContent = content;
        
        var hostVars = ':root { ' +
          '--host-bg: ' + theme.bg + '; ' +
          '--host-fg: ' + theme.fg + '; ' +
          '--host-fg-muted: ' + theme.fgMuted + '; ' +
          '--host-card: ' + theme.card + '; ' +
          '--host-card-fg: ' + theme.cardFg + '; ' +
          '--host-input: ' + theme.input + '; ' +
          '--host-muted: ' + theme.muted + '; ' +
          '--host-border: ' + theme.border + '; ' +
          '--host-border-hover: ' + theme.borderHover + '; ' +
          '--host-primary: ' + theme.primary + '; ' +
          '--host-secondary: ' + theme.secondary + '; ' +
          '--host-secondary-fg: ' + theme.secondaryFg + '; ' +
          '--host-success: ' + theme.success + '; ' +
          '--host-error: ' + theme.error + '; ' +
        '} ';
        
        var innerStyles = hostVars +
          '* { box-sizing: border-box; margin: 0; padding: 0; } ' +
          ':root, html, body { width: 100%; max-width: 100%; height: auto; overflow-x: hidden; overflow-y: visible; background: transparent; font-family: Inter, system-ui, -apple-system, sans-serif; } ' +
          '#sandbox-content { width: 100%; } ' +
          // On small screens, ensure images and SVGs don't overflow
          '@media (max-width: 640px) { :where(#sandbox-content svg, #sandbox-content img) { max-width: 100%; height: auto; } } ';
        var enforcedStyles =
          ':root, html, body { height: auto !important; max-height: 5000px !important; overflow-x: hidden !important; overflow-y: auto !important; background: transparent !important; } ' +
          // iOS text autosizing enlarges individual blocks of over-wide content, which overlaps lines and destabilizes the reported height
          'html { -webkit-text-size-adjust: 100% !important; text-size-adjust: 100% !important; } ';
        var styles = innerStyles;
        if (isSvg) {
          styles += \`${h.replaceAll("\\","\\\\").replaceAll("`","\\`")}\`;
        }
        
        var bodyContent = '';
        if (isSvg) {
          bodyContent = \`${p.replaceAll("\\","\\\\").replaceAll("`","\\`")}\` +
            '<div id="sandbox-content"><div class="vis-container">' + content + '</div></div>';
        } else {
          bodyContent = '<div id="sandbox-content">' + content + '</div>';
        }
        
        var cookieBlockScript = '<script>' +
          'Object.defineProperty(document, "cookie", {' +
            'get: function() { return ""; },' +
            'set: function() {},' +
            'configurable: false' +
          '});' +
          '<\\/script>';
        
        var opfsPolyfillScript = '<script type="module">' +
          '(async()=>{' +
            'if(typeof FileSystemFileHandle!=="undefined"&&"createWritable"in FileSystemFileHandle.prototype)return;' +
            'if(!navigator.storage?.getDirectory)return;' +
            'try{' +
              'const{createWorker}=await import("https://esm.sh/opfs-worker@1.3.1");' +
              'const w=await createWorker();' +
              'class W{constructor(p){this.p=p;this.c=[];this.x=false}' +
                'write(d){if(this.x)throw new DOMException("closed","InvalidStateError");' +
                  'if(typeof d==="object"&&"type"in d&&!(d instanceof Blob)&&!(d instanceof ArrayBuffer)){' +
                    'if(d.type==="write")this.c.push(d.data);else if(d.type==="truncate")this.c=[];return}' +
                  'this.c.push(d)}' +
                'async close(){if(this.x)return;const b=new Blob(this.c);' +
                  'await w.writeFile(this.p,new Uint8Array(await b.arrayBuffer()));this.x=true;this.c=[]}' +
                'abort(){this.x=true;this.c=[]}}' +
              'const pF=(h,p)=>new Proxy(h,{get:(t,k)=>k==="createWritable"?async()=>new W(p):typeof t[k]==="function"?t[k].bind(t):t[k]});' +
              'const pD=(h,p)=>new Proxy(h,{get:(t,k)=>{' +
                'if(k==="getFileHandle")return async(n,o)=>pF(await t.getFileHandle(n,o),(p+"/"+n).replace(/[/]+/g,"/"));' +
                'if(k==="getDirectoryHandle")return async(n,o)=>pD(await t.getDirectoryHandle(n,o),(p+"/"+n).replace(/[/]+/g,"/"));' +
                'return typeof t[k]==="function"?t[k].bind(t):t[k]}});' +
              'const og=navigator.storage.getDirectory.bind(navigator.storage);' +
              'navigator.storage.getDirectory=async function(){return pD(await og.call(this),"/")};' +
            '}catch(e){console.warn("[OPFS]",e)}' +
          '})();' +
          '<\\/script>';
        
        var readyScript = '<script>' +
          '(function() {' +
            'var lastHeight = 0;' +
            'var debounceTimer = null;' +
            'function reportHeight() {' +
              'var rect = document.body.getBoundingClientRect();' +
              'var h = Math.ceil(rect.height);' +
              'if (h !== lastHeight && h > 0) {' +
                'lastHeight = h;' +
                'window.parent.postMessage({ type: "html-sandbox-height", height: h }, "*");' +
              '}' +
            '}' +
            'new ResizeObserver(function() {' +
              'clearTimeout(debounceTimer);' +
              'debounceTimer = setTimeout(reportHeight, 100);' +
            '}).observe(document.body);' +
            'window.addEventListener("load", function() {' +
              'window.parent.postMessage({ type: "html-sandbox-ready" }, "*");' +
            '});' +
            'document.fonts && document.fonts.ready.then(function() {' +
              'reportHeight();' +
            '});' +
          '})();' +
          '<\\/script>';
        
        var fullHtml = '<!DOCTYPE html><html data-host-mode="' + theme.mode + '"><head>' +
          '<meta charset="utf-8">' +
          '<meta name="viewport" content="width=device-width, initial-scale=1">' +
          cookieBlockScript +
          opfsPolyfillScript +
          '<link rel="preconnect" href="https://fonts.googleapis.com">' +
          '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
          '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">' +
          '<style>' + styles + '</style>' +
          '</head><body>' + bodyContent + '<style>' + enforcedStyles + '</style>' + readyScript + '</body></html>';
        
        var blob = new Blob([fullHtml], { type: 'text/html' });
        var url = URL.createObjectURL(blob);
        
        if (sandbox._blobUrl) {
          URL.revokeObjectURL(sandbox._blobUrl);
        }
        sandbox._blobUrl = url;
        sandbox.src = url;
      }
      
      function normalizeMessage(data) {
        if (typeof data === 'string') {
          try {
            var parsed = JSON.parse(data);
            return parsed && typeof parsed === 'object' ? parsed : null;
          } catch (error) {
            return null;
          }
        }
        return data && typeof data === 'object' ? data : null;
      }
      
      function handleMessage(event) {
        var data = normalizeMessage(event.data);
        if (!data) return;
        
        if (data.type === 'html-sandbox-content') {
          render(data.content, data.isSvgMode);
        } else if (data.type === 'html-sandbox-height' || data.type === 'html-sandbox-ready') {
          postToHost(data);
        }
      }
      
      window.addEventListener('message', handleMessage);
      // Listen for messages from both window (iOS) and document (Android)
      document.addEventListener('message', handleMessage);
      
      postToHost({ type: 'html-sandbox-proxy-ready' });
    })();
  </script>
</body>
</html>
`}],194334);var v=e.i(247167);try{var y=window;y._sentryModuleMetadata=y._sentryModuleMetadata||{},y._sentryModuleMetadata[(new y.Error).stack]=Object.assign({},y._sentryModuleMetadata[(new y.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}let b=v.default.env.NEXT_PUBLIC_SANDBOX_DOMAIN||"prod.veniceaisandbox.com",w=e=>new URLSearchParams({bg:e.bg,fg:e.fg,fgMuted:e.fgMuted,card:e.card,cardFg:e.cardFg,input:e.input,muted:e.muted,border:e.border,borderHover:e.borderHover,primary:e.primary,secondary:e.secondary,secondaryFg:e.secondaryFg,success:e.success,error:e.error,hostMode:e.mode});e.s(["g",0,"frame-ancestors 'self' https://venice.ai https://*.venice.ai","$",0,!1,"i",0,200,"G",0,"camera=(), microphone=(), geolocation=(), display-capture=(), clipboard-read=(), payment=(), web-share=(), usb=(), serial=(), hid=(), bluetooth=(), midi=(), publickey-credentials-create=(), publickey-credentials-get=(), identity-credentials-get=(), otp-credentials=(), idle-detection=(), screen-wake-lock=(), xr-spatial-tracking=()","q",0,b,"r",0,["^https://venice\\.ai$","^https://[a-z0-9-]+\\.venice\\.ai$"],"Y",0,(e,t,r)=>{let o=w(r);return o.set("mode",t),`https://${e}.${b}/sandbox/html?${o.toString()}`},"t",0,w],512549)},7019,e=>{"use strict";var t=e.i(500932),r=e.i(534046),o=e.i(271645),a=e.i(54513);try{var n=window;n._sentryModuleMetadata=n._sentryModuleMetadata||{},n._sentryModuleMetadata[new n.Error().stack]=Object.assign({},n._sentryModuleMetadata[new n.Error().stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}let i="minds-chat-scroll-root";e.s(["F",0,i,"K",0,e=>{let n,s,l,c=(0,t.c)(8),[d,u]=(0,o.useState)(null);c[0]!==d?(n=d?.closest(`.${i}`)??null,c[0]=d,c[1]=n):n=c[1],c[2]!==e||c[3]!==n?(s={...e,root:n},c[2]=e,c[3]=n,c[4]=s):s=c[4];let{inView:f,ref:p}=(0,a.f)(s),h=(0,r._)(u,p);return c[5]!==f||c[6]!==h?(l={inView:f,ref:h},c[5]=f,c[6]=h,c[7]=l):l=c[7],l}])},485903,e=>{"use strict";var t=e.i(474076),r=e.i(271645),o=e.i(832257),a=e.i(7019);try{var n=window;n._sentryModuleMetadata=n._sentryModuleMetadata||{},n._sentryModuleMetadata[new n.Error().stack]=Object.assign({},n._sentryModuleMetadata[new n.Error().stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}let i="/images/icons/models/venice-keys.svg",s={assemble:!0,brightness:1,cloud:.8,cloudDrift:.095,cloudSize:.9,cloudWobble:.37,delay:0,dotSize:1.8,duration:.9,edgeFade:.08,entranceDur:.5,fill:!0,halo:0,logoGain:2.95,logoOnCard:!1,logoScale:.77,logoSizeBoost:.16,logoSteady:.9,markFillFloor:1,progressRamp:{wanderShare:[1,.14]},pulse:0,quiet:[.5,.5,.36,.317],quietGain:.86,releaseWhenOffscreen:!0,spacing:3.8,wander:.025,wanderShare:1},l={blend:"over",residue:[.11,.11,.13],sparkle:-.08,tint:0},c={blend:"add",residue:[.64,.65,.72],sparkle:.35,tint:.35},d={borderRadius:"inherit",display:"block",height:"100%",width:"100%"},u=(e,{color:t,maxFps:r=0,settledBackdrop:o=1,tone:a="dark"})=>{let n,i=t?(e.style.color=t,(n=getComputedStyle(e).color.match(/[\d.]+/g)?.map(Number))&&n.length>=3?[n[0]/255,n[1]/255,n[2]/255]:null):null;return{..."light"===a?l:c,...i?{residue:i,tint:0,sparkle:"light"===a?-.08:.2}:null,maxFps:r,progressRamp:{...s.progressRamp,backdrop:[1,o]}}};e.s(["f",0,({progress:e=null,playing:n=!0,radius:l="var(--chakra-radii-2xl, 1rem)",logo:c=i,cornerPx:f=16,tone:p="dark",color:h,maxFps:g,settledBackdrop:m})=>{let v=(0,r.useRef)(null),y=(0,r.useRef)(null),b=(0,r.useRef)(e);b.current=e;let w=(0,r.useRef)({color:h,maxFps:g,settledBackdrop:m,tone:p});w.current={color:h,maxFps:g,settledBackdrop:m,tone:p};let{ref:_,inView:E}=(0,a.K)({rootMargin:"400px"});return(0,r.useEffect)(()=>{let e=v.current;if(!e)return;let t=document.createElement("canvas");t.setAttribute("aria-hidden","true"),Object.assign(t.style,d),e.appendChild(t);let r=null;try{r=new o.f(t,{...s,...u(e,w.current),cornerPx:f,logo:c,progress:b.current})}catch(e){console.error("ParticleShimmer:",e),t.remove();return}if(r.unsupported){r.destroy({releaseContext:!0}),t.remove();return}return y.current=r,()=>{r.destroy({releaseContext:!0}),t.remove(),y.current=null}},[f,c]),(0,r.useEffect)(()=>{y.current&&(y.current.opts.progress=e)},[e]),(0,r.useEffect)(()=>{let e=v.current;y.current&&e&&Object.assign(y.current.opts,u(e,{color:h,maxFps:g,settledBackdrop:m,tone:p}))},[h,g,m,p]),(0,r.useEffect)(()=>{let e=y.current;e&&(e.setVisible(E),n?e.play():e.pause())},[E,n]),(0,t.jsx)("div",{"aria-hidden":!0,ref:e=>{v.current=e,_(e)},style:{position:"absolute",inset:0,borderRadius:l,pointerEvents:"none"}})}])},832257,e=>{"use strict";try{var t=window;t._sentryModuleMetadata=t._sentryModuleMetadata||{},t._sentryModuleMetadata[(new t.Error).stack]=Object.assign({},t._sentryModuleMetadata[(new t.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}let r=`
float hash1(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}
vec3 hash3(vec2 p) {
  vec3 q = vec3(dot(p, vec2(127.1, 311.7)),
                dot(p, vec2(269.5, 183.3)),
                dot(p, vec2(419.2, 371.9)));
  return fract(sin(q) * 43758.5453123);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash1(i);
  float b = hash1(i + vec2(1.0, 0.0));
  float c = hash1(i + vec2(0.0, 1.0));
  float d = hash1(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float dissolveThreshold(vec2 cuv, float wob, float grain) {
  float wave  = vnoise(cuv * vec2(3.0, 1.6));
  float fine  = hash1(floor(cuv * 512.0));
  return cuv.y * (1.0 - wob - grain) + wave * wob + fine * grain - 0.04;
}

vec2 wander(vec3 r, float t) {
  float s = 0.75 + r.y * 0.6;
  float a = r.z * 6.28318, b = r.x * 6.28318;
  return vec2(
    sin(t * 0.31 * s + a)       * 0.55 +
    sin(t * 0.74 * s + b * 1.7) * 0.30 +
    sin(t * 1.23 * s + a * 2.3) * 0.15,
    cos(t * 0.27 * s + b)       * 0.55 +
    cos(t * 0.63 * s + a * 1.3) * 0.30 +
    cos(t * 1.33 * s + b * 2.7) * 0.15
  );
}

float cloudMask(vec2 uv, float size, float wobble, float t) {
  vec2 p = (uv - 0.5) * 2.0;
  float r = length(p);
  float a = atan(p.y, p.x);
  vec2  c = vec2(cos(a), sin(a));
  float w = vnoise(c * 1.7 + vec2(11.3, 4.1) + t)
          + vnoise(c * 3.9 + vec2(2.7, 19.4) - t * 0.7) * 0.45;
  w = (w / 1.45 - 0.5) * 2.0;
  float edge = size * (1.0 + w * wobble);
  return 1.0 - smoothstep(edge * 0.62, edge, r);
}

float cardSdf(vec2 uv, float aspect, float r) {
  vec2 p = (uv - 0.5) * 2.0 * vec2(aspect, 1.0);
  vec2 b = vec2(aspect, 1.0) - r;
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
}
`,o=`#version 300 es
precision highp float;
uniform vec4 uRect;
out vec2 vUv;
const vec2 C[6] = vec2[6](
  vec2(0.0, 0.0), vec2(1.0, 0.0), vec2(0.0, 1.0),
  vec2(0.0, 1.0), vec2(1.0, 0.0), vec2(1.0, 1.0)
);
void main() {
  vec2 t = C[gl_VertexID];
  vUv = t;
  gl_Position = vec4(uRect.x + (t.x * 2.0 - 1.0) * uRect.z,
                     uRect.y + (1.0 - t.y * 2.0) * uRect.w, 0.0, 1.0);
}`,a=`#version 300 es
precision highp float;
uniform sampler2D uCard;
uniform vec2  uGrid;
uniform float uTime, uSweep, uDur, uAspect, uCorner, uWobble, uGrain, uFaceGain;
uniform float uCloud, uCloudSize, uCloudWobble, uCloudDrift;
in  vec2 vUv;
out vec4 frag;
${r}
void main() {
  float sdf  = cardSdf(vUv, uAspect, uCorner);
  float mask = 1.0 - smoothstep(-fwidth(sdf) * 1.2, 0.0, sdf);
  if (uCloud > 0.0) {
    mask = mix(mask, mask * cloudMask(vUv, uCloudSize, uCloudWobble, uTime * uCloudDrift), uCloud);
  }
  if (mask <= 0.001) discard;

  vec2  cuv  = (floor(vUv * uGrid) + 0.5) / uGrid;
  float life = uSweep - dissolveThreshold(cuv, uWobble, uGrain) * uDur;
  if (life > 0.0) discard;

  vec3 col = texture(uCard, vUv).rgb * uFaceGain;
  col *= 1.0 - 0.55 * smoothstep(-0.11, 0.0, life);
  frag = vec4(col * mask, mask);
}`,n=`#version 300 es
precision highp float;
uniform sampler2D uCard;
uniform vec2  uGrid;
uniform vec4  uRect;
uniform float uTime, uSweep, uDur, uAspect, uCorner, uWobble, uGrain;
uniform float uMode;
uniform float uDot;
uniform float uMaxPoint;
uniform float uEmberLife, uSettle, uSpread, uLift, uTint, uReduced, uGain;
uniform float uHalo, uHaloDensity, uHaloGain, uHaloBurst, uHaloDrift;
uniform float uWander, uWanderAspect;
uniform sampler2D uLogo;
uniform vec4  uLogoRect;
uniform float uLogoOn, uLogoGain, uLogoSteady, uLogoSize, uMarkFill, uBackdrop;
uniform float uPulse, uPulseGain;
uniform float uCloud, uCloudSize, uCloudWobble, uCloudDrift;
uniform float uAssemble, uDelay, uEntDur, uEntSpread, uEntStagger;
uniform float uWanderShare;
uniform vec4  uQuiet;
uniform float uQuietGain, uEdgeFade;
uniform vec3  uResidue;
uniform float uSparkle;
out vec4 vColor;
${r}

void cull() { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 0.0; }

float logoAt(vec2 uv) {
  if (uLogoOn < 0.5) return 0.0;
  vec2 luv = (uv - uLogoRect.xy) / (2.0 * uLogoRect.zw) + 0.5;
  if (luv.x < 0.0 || luv.x > 1.0 || luv.y < 0.0 || luv.y > 1.0) return 0.0;
  return texture(uLogo, luv).a;
}

void main() {
  int  cols = int(uGrid.x);
  vec2 cell = vec2(float(gl_VertexID % cols), float(gl_VertexID / cols));
  vec2 uv   = (cell + 0.5) / uGrid;
  vec3 r    = hash3(cell + 0.5);

  vec2  pos;
  vec3  col;
  float alpha, size;

  if (uMode > 1.5) {

    vec2  euv = (uv - 0.5) * (1.0 + 2.0 * uHalo) + 0.5;
    float sd  = cardSdf(euv, uAspect, uCorner);
    if (sd <= 0.0) { cull(); return; }
    float fall = 1.0 - clamp(sd / (2.0 * uHalo), 0.0, 1.0);
    if (fall <= 0.0 || r.x > fall * fall * uHaloDensity) { cull(); return; }

    float life = uSweep
               - dissolveThreshold(clamp(euv, 0.0, 1.0), uWobble, uGrain) * uDur;
    if (uAssemble < 0.5 && life <= 0.0) { cull(); return; }

    float sp;
    if (uReduced > 0.5) {
      sp = 0.22 + 0.35 * r.x;
    } else {
      sp = 0.5 + 0.5 * sin(uTime * (0.5 + r.y * 1.7) + r.z * 6.28318);
      sp = pow(sp, 2.0 + r.x * 4.5);
      euv += wander(r, uTime * 0.8) * uHaloDrift * vec2(1.0, uWanderAspect);
    }

    float burst = 1.0 + uHaloBurst * exp(-life * 2.6);

    pos   = euv;
    alpha = smoothstep(0.0, uSettle * 0.6, life)
          * (0.05 + 0.9 * sp) * fall * burst * uGain * uHaloGain;
    size  = uDot * (0.35 + 0.62 * sp);
    col   = uResidue + vec3(0.30) * sp;

    gl_Position  = vec4(uRect.x + (pos.x * 2.0 - 1.0) * uRect.z,
                        uRect.y + (1.0 - pos.y * 2.0) * uRect.w, 0.0, 1.0);
    gl_PointSize = clamp(size, 0.0, uMaxPoint);
    vColor       = vec4(col, alpha);
    return;
  }

  if (cardSdf(uv, uAspect, uCorner) > 0.0) { cull(); return; }

  float thr01 = dissolveThreshold(uv, uWobble, uGrain);
  float life  = uSweep - thr01 * uDur;

  if (uAssemble < 0.5 && life <= 0.0) { cull(); return; }

  vec4 card = texture(uCard, uv);
  pos = uv;

  if (uMode < 0.5) {

    if (life >= uEmberLife) { cull(); return; }
    float k = life / uEmberLife;
    vec2  vel = vec2((r.y - 0.5) * uSpread, -(0.35 + r.z * 1.0) * uLift);
    pos   = uv + vel * k + vec2(0.0, 0.30 * uLift) * k * k;
    alpha = pow(1.0 - k, 1.5);
    size  = uDot * (0.55 + r.z * 0.95) * (1.0 - 0.25 * k);
    col   = mix(card.rgb, vec3(1.0), 0.22 * (1.0 - k));
  } else {

    float appear;
    vec2  entOff = vec2(0.0);
    if (uAssemble > 0.5) {

      float ent = uEntDur <= 0.0 ? 1.0 : clamp((uTime - uDelay) / uEntDur, 0.0, 1.0);
      float k = clamp((ent - thr01 * uEntStagger) / max(1.0 - uEntStagger, 1e-4), 0.0, 1.0);
      k = 1.0 - pow(1.0 - k, 3.0);
      appear = k;
      vec2 dir = normalize(vec2(r.y, r.z) - 0.5 + 1e-5);
      entOff = dir * uEntSpread * (0.35 + r.x) * (1.0 - k) * vec2(1.0, uAspect);
    } else {
      appear = smoothstep(0.0, uSettle, life);
    }
    float sp;
    if (uReduced > 0.5) {
      sp = 0.18 + 0.5 * r.x;
    } else {
      sp = 0.5 + 0.5 * sin(uTime * (0.9 + r.y * 2.6) + r.z * 6.28318);
      sp = pow(sp, 2.5 + r.x * 6.0);

      float rm = hash1(cell + 17.3);
      float mob = rm < uWanderShare ? (0.35 + 1.3 * hash1(cell + 41.9)) : 0.0;
      pos = uv + wander(r, uTime) * uWander * mob * vec2(1.0, uWanderAspect);
    }
    pos += entOff;

    float lg  = logoAt(pos);

    if (uPulse > 0.0) {

      float axis = (pos.x + pos.y) * 0.5;
      float head = 1.35 - fract(uTime / uPulse) * 1.7;
      float band = 1.0 - clamp(abs(axis - head) / 0.22, 0.0, 1.0);
      sp = min(1.0, sp + band * band * uPulseGain);
    }
    float spL = mix(sp, 0.5 + 0.5 * sp, lg * uLogoSteady);
    float lum = dot(card.rgb, vec3(0.299, 0.587, 0.114));

    float lgF = lg * uMarkFill;
    alpha = appear * (0.04 + 0.85 * spL) * (0.5 + 0.55 * lum) * uGain
          * (1.0 + uLogoGain * lgF);
    size  = uDot * (0.42 + 0.78 * spL) * (1.0 + uLogoSize * lgF);
    col   = max(mix(uResidue, card.rgb, uTint) + vec3(uSparkle) * spL, 0.0);

    if (uLogoOn > 0.5) alpha *= mix(uBackdrop, 1.0, lg);

    if (uQuietGain > 0.0) {
      float qd = length((pos - uQuiet.xy) / max(uQuiet.zw, vec2(1e-4)));
      alpha *= 1.0 - smoothstep(1.0, 0.45, qd) * uQuietGain;
    }

    if (uCloud > 0.0) {
      alpha *= mix(1.0, cloudMask(pos, uCloudSize, uCloudWobble,
                                  uTime * uCloudDrift), uCloud);
    }

    if (uEdgeFade > 0.0) {
      vec2 e = min(pos, 1.0 - pos);
      alpha *= smoothstep(0.0, uEdgeFade, min(e.x * uAspect, e.y));
    }
  }

  gl_Position  = vec4(uRect.x + (pos.x * 2.0 - 1.0) * uRect.z,
                      uRect.y + (1.0 - pos.y * 2.0) * uRect.w, 0.0, 1.0);
  gl_PointSize = clamp(size, 0.0, uMaxPoint);
  vColor       = vec4(col, alpha);
}`,i=`#version 300 es
precision mediump float;
uniform float uOver;
in  vec4 vColor;
out vec4 frag;
void main() {
  vec2  c = gl_PointCoord - 0.5;
  float a = smoothstep(0.25, 0.02, dot(c, c)) * vColor.a;
  if (uOver > 0.5) a = min(a, 1.0);
  frag = vec4(vColor.rgb * a, a);
}`,s={src:null,aspect:1.586,fill:!1,cornerPx:null,cardWidth:.86,cardCenterY:.5,cornerRadius:.075,spacing:3.2,dotSize:3,progressRamp:{},progress:null,progressEase:.22,pulse:0,pulseGain:.55,quiet:[.5,.5,.34,.3],quietGain:0,edgeFade:0,cloud:0,cloudSize:.94,cloudWobble:.22,cloudDrift:.05,assemble:!1,entranceDur:1.2,entranceSpread:.07,entranceStagger:.55,delay:.35,duration:.62,emberLife:.55,settle:.45,spread:.3,lift:.55,tint:.35,brightness:.72,faceGain:1,maxParticles:26e3,wander:.08,wanderShare:.25,halo:.12,haloDensity:.55,haloGain:1.15,haloBurst:2.5,haloDrift:.045,residue:[.64,.65,.72],sparkle:.35,blend:"add",maxDpr:2,maxFps:0,autoPlay:!0,logo:null,logoScale:.7,logoGain:1.8,logoSteady:.85,logoSizeBoost:.15,logoOnCard:!0,logoOnCardAlpha:.9,loop:!1,loopDelay:3.2,respectReducedMotion:!0,releaseWhenOffscreen:!1,releaseDelay:4,markFillFloor:.3,backdrop:1,onDissolveStart:null,onDissolveComplete:null};e.s(["f",0,class{canvas;opts;reduced;unsupported=!1;gl=null;cardProg;ptProg;cardU={};ptU={};vao;tex;logoTex;_raf=0;_running=!1;_visible=!0;_elapsed=0;_prog=0;_last=0;_fired=!1;_destroyed=!1;_gone=!1;_logoReady=!1;_logoAspect=1;_maxPoint=64;_dpr=1;_count=0;_aspect=1;_grid=[1,1];_rect=[0,0,1,1];_logoRect=[.5,.5,.25,.25];_lose;_releaseTimer=0;_eff=null;_ro;_onLost;_onRestored;constructor(e,t={}){if(!e)throw Error("ParticleField: a canvas element is required");if(this.canvas=e,this.opts={...s,...t},this.reduced=this.opts.respectReducedMotion&&"function"==typeof matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches,this._onLost=e=>{e.preventDefault(),this._stopLoop(),this._gone=!0},this._onRestored=()=>{if(this._gone=!1,this._init()){if(this._loadTexture(),this._visible){this._running&&this._startLoop();return}this._scheduleOffscreenRelease()}},e.addEventListener("webglcontextlost",this._onLost),e.addEventListener("webglcontextrestored",this._onRestored),!this._init())return;this._ro=new ResizeObserver(()=>this.resize()),this._ro.observe(e.parentElement||e),this._loadTexture(),this.opts.autoPlay?this.play():this._renderOnce()}play(){return this._destroyed||!this.gl||(this._running=!0,this._last=performance.now(),this._visible&&this._startLoop()),this}setVisible(e){return this._destroyed||((this._visible=e,window.clearTimeout(this._releaseTimer),e)?(this._gone&&this.opts.releaseWhenOffscreen&&this._lose?.restoreContext(),this._running&&this._startLoop()):(this._stopLoop(),this._scheduleOffscreenRelease())),this}pause(){return this._running=!1,this._stopLoop(),this}restart(){return this._elapsed=0,this._prog=0,this._fired=!1,this.play()}finish(){return this._elapsed=this.opts.delay+this.opts.duration+this.opts.emberLife,this}resize(){if(this._destroyed||this._gone)return this;let e=this.canvas,t=this.gl,r=Math.min(window.devicePixelRatio||1,this.opts.maxDpr),o=e.parentElement||e,a=Math.max(1,Math.round((e.clientWidth||o.clientWidth)*r)),n=Math.max(1,Math.round((e.clientHeight||o.clientHeight)*r));return(e.width!==a||e.height!==n)&&(e.width=a,e.height=n),t.viewport(0,0,a,n),this._dpr=r,this._layout(),this}destroy({releaseContext:e=!1}={}){this._destroyed=!0,this._stopLoop(),window.clearTimeout(this._releaseTimer),this._ro?.disconnect(),this.canvas.removeEventListener("webglcontextlost",this._onLost),this.canvas.removeEventListener("webglcontextrestored",this._onRestored);let t=this.gl;t&&!this._gone&&(t.deleteProgram(this.cardProg),t.deleteProgram(this.ptProg),t.deleteVertexArray(this.vao),t.deleteTexture(this.tex),t.deleteTexture(this.logoTex),e&&t.getExtension("WEBGL_lose_context")?.loseContext()),this.gl=null}_scheduleOffscreenRelease(){window.clearTimeout(this._releaseTimer),this.opts.releaseWhenOffscreen&&(this._releaseTimer=window.setTimeout(()=>{this._visible||this._destroyed||this._gone||this._lose?.loseContext()},1e3*this.opts.releaseDelay))}_init(){let e=this.canvas.getContext("webgl2",{alpha:!0,antialias:!1,premultipliedAlpha:!0,depth:!1,stencil:!1,powerPreference:"low-power"});if(!e)return this.canvas.dispatchEvent(new CustomEvent("carddissolve:unsupported",{bubbles:!0})),this.unsupported=!0,!1;this.gl=e;let t=this._program(o,a),r=this._program(n,i);if(!t||!r)return e.getExtension("WEBGL_lose_context")?.loseContext(),this.gl=null,this.unsupported=!0,!1;this.cardProg=t,this.ptProg=r,this.cardU=this._uniforms(this.cardProg),this.ptU=this._uniforms(this.ptProg),this.vao=e.createVertexArray();let s=t=>{let r=e.createTexture();return e.bindTexture(e.TEXTURE_2D,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array(t)),r};return this.tex=s([40,40,44,255]),this.logoTex=s([0,0,0,0]),this._logoAspect=1,this._logoReady=!1,this._lose=e.getExtension("WEBGL_lose_context"),this._maxPoint=Math.max(16,e.getParameter(e.ALIASED_POINT_SIZE_RANGE)[1]||64),e.disable(e.DEPTH_TEST),e.enable(e.BLEND),e.clearColor(0,0,0,0),this.resize(),!0}_program(e,t){let r=this.gl,o=(e,t)=>{let o=r.createShader(e);return(r.shaderSource(o,t),r.compileShader(o),r.getShaderParameter(o,r.COMPILE_STATUS))?o:(console.error("ParticleField shader:",r.getShaderInfoLog(o)),r.deleteShader(o),null)},a=o(r.VERTEX_SHADER,e),n=o(r.FRAGMENT_SHADER,t);if(!a||!n)return null;let i=r.createProgram();return(r.attachShader(i,a),r.attachShader(i,n),r.linkProgram(i),r.deleteShader(a),r.deleteShader(n),r.getProgramParameter(i,r.LINK_STATUS))?i:(console.error("ParticleField link:",r.getProgramInfoLog(i)),r.deleteProgram(i),null)}_uniforms(e){let t=this.gl,r={},o=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let a=0;a<o;a++){let o=t.getActiveUniform(e,a).name.replace(/\[0\]$/,"");r[o]=t.getUniformLocation(e,o)}return r}_layout(){let e,t,{canvas:r,opts:o}=this;o.fill?(e=r.width,t=r.height,this._aspect=e/t):(t=(e=r.width*o.cardWidth)/o.aspect,this._aspect=o.aspect);let a=r.width/2,n=o.fill?r.height/2:r.height*o.cardCenterY;this._rect=[a/r.width*2-1,1-n/r.height*2,e/r.width,t/r.height];let i=this._aspect,s=o.logoScale*Math.min(i,1),l=this._logoAspect<=1?s*this._logoAspect:s,c=this._logoAspect<=1?s:s/this._logoAspect;this._logoRect=[.5,.5,l/(2*i),c/2];let d=Math.max(1.2,o.spacing)*this._dpr;if(o.maxParticles>0){let r=e/d*(t/d);r>o.maxParticles&&(d*=Math.sqrt(r/o.maxParticles))}let u=Math.max(8,Math.min(360,Math.round(e/d))),f=Math.max(8,Math.min(360,Math.round(t/d)));this._grid=[u,f],this._count=u*f}_upload(e,t){if(this._destroyed||this._gone)return;let r=this.gl;r.bindTexture(r.TEXTURE_2D,e),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,!1),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,r.RGBA,r.UNSIGNED_BYTE,t)}_load(e){return new Promise((t,r)=>{let o=new Image;/^https?:/i.test(e)&&!e.startsWith(location.origin)&&(o.crossOrigin="anonymous"),o.onload=()=>t(o),o.onerror=()=>r(Error("ParticleField: could not load "+e)),o.decoding="async",o.src=e})}async _loadTexture(){var e,t,r;let o,a,n,i,s,l,c,d,{opts:u}=this,f=u.logo?await this._load(u.logo).catch(()=>null):null;f&&(this._logoAspect=f.naturalWidth&&f.naturalHeight?f.naturalWidth/f.naturalHeight:1,this._logoReady=!0,this._upload(this.logoTex,f),this._layout());let p=(u.src?await this._load(u.src).catch(()=>null):null)||(u.fill?function(e=16/9,t=512,r="#2b2b2e"){let o=Math.max(2,Math.round(t/e)),a=document.createElement("canvas");a.width=t,a.height=o;let n=a.getContext("2d"),i=n.createLinearGradient(0,0,0,o);return i.addColorStop(0,r),i.addColorStop(1,"#232326"),n.fillStyle=i,n.fillRect(0,0,t,o),a}(this._aspect):function(e=1.586,t=1024){let r=Math.round(t/e),o=document.createElement("canvas");o.width=t,o.height=r;let a=o.getContext("2d"),n=a.createLinearGradient(0,0,0,r);n.addColorStop(0,"#3a3a3d"),n.addColorStop(.55,"#2a2a2d"),n.addColorStop(1,"#232326"),a.fillStyle=n,a.fillRect(0,0,t,r);let i=a.createLinearGradient(0,.17*r,0,.33*r);i.addColorStop(0,"#9a9aa0"),i.addColorStop(.5,"#8d8d94"),i.addColorStop(1,"#7d7d85"),a.fillStyle=i,a.fillRect(0,.17*r,t,.16*r);let s=a.createLinearGradient(0,r,t,0);s.addColorStop(0,"rgba(255,255,255,0)"),s.addColorStop(.5,"rgba(255,255,255,0.05)"),s.addColorStop(1,"rgba(255,255,255,0)"),a.fillStyle=s,a.fillRect(0,0,t,r);let l=.9*t,c=.78*r;a.strokeStyle="rgba(228,228,235,0.85)",a.lineCap="round";for(let e=0;e<4;e++)a.beginPath(),a.lineWidth=.011*t,a.arc(l,c,t*(.014+.021*e),-(.36*Math.PI),.36*Math.PI),a.stroke();return o}(u.aspect));this._upload(this.tex,f&&u.logoOnCard?(e=p,t=f,r=u,o=e.width||e.naturalWidth,a=e.height||e.naturalHeight,(n=document.createElement("canvas")).width=o,n.height=a,(i=n.getContext("2d")).drawImage(e,0,0,o,a),s=t.naturalWidth&&t.naturalHeight?t.naturalWidth/t.naturalHeight:1,l=r.logoScale*Math.min(o,a),c=s<=1?l*s:l,d=s<=1?l:l/s,i.globalAlpha=r.logoOnCardAlpha,i.drawImage(t,(o-c)/2,(a-d)/2,c,d),n):p),this._running||this._renderOnce()}_startLoop(){if(this._raf||this._destroyed||this._gone||!this.gl)return;this._last=performance.now();let e=t=>{if(this._raf=requestAnimationFrame(e),this.opts.maxFps>0&&t-this._last<1e3/this.opts.maxFps-1)return;let r=Math.min(.05,(t-this._last)/1e3);if(this._last=t,this._elapsed+=r,"number"==typeof this.opts.progress){let e=Math.max(0,Math.min(1,this.opts.progress)),t=this.opts.progressEase>0?Math.min(1,r/this.opts.progressEase):1;this._prog+=(e-this._prog)*t}this._draw()};this._raf=requestAnimationFrame(e)}_stopLoop(){this._raf&&cancelAnimationFrame(this._raf),this._raf=0}_renderOnce(){this._draw()}_resolved(){let e=this.opts,t=e.progressRamp;if(!t||"number"!=typeof e.progress)return e;let r=this._eff??={...e};for(let o of(Object.assign(r,e),Object.keys(t))){let e=t[o];e&&(r[o]=e[0]+(e[1]-e[0])*this._prog)}return r}_draw(){let e,t=this._resolved(),r=this.gl;if(!r||this._gone)return;let o="number"==typeof t.progress,a=this.reduced?t.delay+t.duration+t.emberLife+t.settle:this._elapsed;o?(e=this._prog*t.duration,!this._fired&&this._prog>=.999&&(this._fired=!0,t.onDissolveComplete?.())):(e=a-t.delay,!this._fired&&a>=t.delay+t.duration&&(this._fired=!0,t.onDissolveComplete?.()),t.loop&&!this.reduced&&a>t.delay+t.duration+t.emberLife+t.loopDelay&&(this._elapsed=0,this._fired=!1,t.onDissolveStart?.())),r.clear(r.COLOR_BUFFER_BIT),r.bindVertexArray(this.vao);let[n,i]=this._grid,s="number"==typeof t.cornerPx?t.cornerPx*this._dpr/(this._rect[3]*this.canvas.height):2*t.cornerRadius;r.blendFunc(r.ONE,r.ONE_MINUS_SRC_ALPHA);let l=this.cardU;t.assemble||(r.useProgram(this.cardProg),r.uniform1i(l.uCard,0),r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D,this.tex),r.uniform4fv(l.uRect,this._rect),r.uniform2f(l.uGrid,n,i),r.uniform1f(l.uTime,a),r.uniform1f(l.uSweep,e),r.uniform1f(l.uDur,t.duration),r.uniform1f(l.uAspect,this._aspect),r.uniform1f(l.uCorner,s),r.uniform1f(l.uWobble,.2),r.uniform1f(l.uGrain,.13),r.uniform1f(l.uFaceGain,t.faceGain),r.uniform1f(l.uCloud,t.cloud),r.uniform1f(l.uCloudSize,t.cloudSize),r.uniform1f(l.uCloudWobble,t.cloudWobble),r.uniform1f(l.uCloudDrift,t.cloudDrift),r.drawArrays(r.TRIANGLES,0,6)),r.blendFunc(r.ONE,"over"===t.blend?r.ONE_MINUS_SRC_ALPHA:r.ONE),r.useProgram(this.ptProg),l=this.ptU,r.uniform1i(l.uCard,0),r.uniform4fv(l.uRect,this._rect),r.uniform2f(l.uGrid,n,i),r.uniform1f(l.uTime,a),r.uniform1f(l.uSweep,e),r.uniform1f(l.uDur,t.duration),r.uniform1f(l.uAspect,this._aspect),r.uniform1f(l.uCorner,s),r.uniform1f(l.uWobble,.2),r.uniform1f(l.uGrain,.13),r.uniform1f(l.uDot,t.dotSize*this._dpr),r.uniform1f(l.uMaxPoint,this._maxPoint),r.uniform1f(l.uEmberLife,t.emberLife),r.uniform1f(l.uSettle,t.settle),r.uniform1f(l.uSpread,t.spread),r.uniform1f(l.uLift,t.lift),r.uniform1f(l.uTint,t.tint),r.uniform1f(l.uGain,t.brightness),r.uniform1f(l.uHalo,t.halo),r.uniform1f(l.uHaloDensity,t.haloDensity),r.uniform1f(l.uHaloGain,t.haloGain),r.uniform1f(l.uHaloBurst,t.haloBurst),r.uniform1f(l.uHaloDrift,t.haloDrift),r.uniform1f(l.uWander,t.wander),r.uniform1f(l.uWanderShare,Math.max(0,Math.min(1,t.wanderShare))),r.uniform1f(l.uWanderAspect,this._aspect),r.uniform1i(l.uLogo,1),r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,this.logoTex),r.activeTexture(r.TEXTURE0),r.uniform1f(l.uLogoOn,+!!this._logoReady),r.uniform4fv(l.uLogoRect,this._logoRect),r.uniform1f(l.uLogoGain,t.logoGain),r.uniform1f(l.uLogoSteady,t.logoSteady),r.uniform1f(l.uLogoSize,t.logoSizeBoost),r.uniform1f(l.uMarkFill,o?t.markFillFloor+(1-t.markFillFloor)*this._prog:1),r.uniform1f(l.uBackdrop,Math.max(0,Math.min(1,t.backdrop))),r.uniform1f(l.uPulse,t.pulse),r.uniform1f(l.uPulseGain,t.pulseGain),r.uniform1f(l.uCloud,t.cloud),r.uniform1f(l.uCloudSize,t.cloudSize),r.uniform1f(l.uCloudWobble,t.cloudWobble),r.uniform1f(l.uCloudDrift,t.cloudDrift),r.uniform4fv(l.uQuiet,t.quiet),r.uniform1f(l.uQuietGain,t.quietGain),r.uniform1f(l.uEdgeFade,t.edgeFade),r.uniform1f(l.uAssemble,+!!t.assemble),r.uniform1f(l.uDelay,t.delay),r.uniform1f(l.uEntDur,t.entranceDur),r.uniform1f(l.uEntSpread,t.entranceSpread),r.uniform1f(l.uEntStagger,t.entranceStagger),r.uniform1f(l.uReduced,+!!this.reduced),r.uniform3fv(l.uResidue,t.residue),r.uniform1f(l.uSparkle,t.sparkle),r.uniform1f(l.uOver,+("over"===t.blend)),t.assemble||(r.uniform1f(l.uMode,0),r.drawArrays(r.POINTS,0,this._count)),r.uniform1f(l.uMode,1),r.drawArrays(r.POINTS,0,this._count),t.halo>0&&t.haloGain>0&&(r.uniform1f(l.uMode,2),r.drawArrays(r.POINTS,0,this._count)),r.bindVertexArray(null)}}])},468566,750043,e=>{"use strict";var t=e.i(62168),r=e.i(194334);try{var o=window;o._sentryModuleMetadata=o._sentryModuleMetadata||{},o._sentryModuleMetadata[(new o.Error).stack]=Object.assign({},o._sentryModuleMetadata[(new o.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}let a=e=>{let t=r.P.split("; ").find(t=>t.startsWith(`${e} `));if(!t)throw Error(`Sandbox CSP is missing ${e}.`);return t};["default-src 'none'",a("script-src"),a("connect-src"),"worker-src 'none'","object-src 'none'","base-uri 'none'"].join("; "),e.s(["I",0,65536,"V",0,65536,"F",0,1024,"_",0,3e4,"e",0,"/sandbox/workspace/module-worker"],750043);try{var n=window;n._sentryModuleMetadata=n._sentryModuleMetadata||{},n._sentryModuleMetadata[(new n.Error).stack]=Object.assign({},n._sentryModuleMetadata[(new n.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}let i=/^[a-z][a-z0-9_-]{0,63}$/,s={bg:"--host-bg",border:"--host-border",borderHover:"--host-border-hover",card:"--host-card",cardFg:"--host-card-fg",error:"--host-error",fg:"--host-fg",fgMuted:"--host-fg-muted",input:"--host-input",muted:"--host-muted",primary:"--host-primary",secondary:"--host-secondary",secondaryFg:"--host-secondary-fg",success:"--host-success"},l=()=>`
  const ARTIFACT_CHANNEL = ${JSON.stringify("venice-workspace-artifacts-v1")};
  const ARTIFACT_DB_NAME = ${JSON.stringify("venice-workspace-artifacts-v1")};
  const ARTIFACT_STORE_NAME = ${JSON.stringify("state")};
  const MAX_ARTIFACT_JSON_BYTES = 65536;
  const MAX_ARTIFACT_ERROR_LENGTH = 1000;
  const MAX_ARTIFACT_DESCRIPTION_LENGTH = 200;
  const ARTIFACT_ACTION_NAME_PATTERN = ${i.toString()};
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
`;e.s(["u",0,"/sandbox/workspace/artifact-shell.js","c",0,l,"i",0,()=>`
(() => {
  const DEFAULT_THEME = ${JSON.stringify(t.e)};
  const COLOR_PATTERNS = ${JSON.stringify(t.T)}.map(source => new RegExp(source));
  const THEME_VARIABLES = ${JSON.stringify(s)};
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

  ${l()}

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
`],468566)},944037,e=>{"use strict";var t=e.i(512549);try{var r=window;r._sentryModuleMetadata=r._sentryModuleMetadata||{},r._sentryModuleMetadata[(new r.Error).stack]=Object.assign({},r._sentryModuleMetadata[(new r.Error).stack],{"_sentryBundlerPluginAppKey:venice-interface":!0})}catch(e){}let o=e=>{let t=0x811c9dc5,r=0x85ebca77;for(let o=0;o<e.length;o+=1){let a=e.charCodeAt(o);t=Math.imul(t^a,0x1000193),r=Math.imul(r^a,0xc2b2ae3d)}return`${(t>>>0).toString(16).padStart(8,"0")}${(r>>>0).toString(16).padStart(8,"0")}`};e.s(["F",0,"/sandbox/workspace","M",0,"/sandbox/workspace/pdf","N",0,(e,r=window.location)=>{let a=(({mindConversationId:e,userId:t})=>`workspace-${o(`${t}\0${e}`)}`)(e);if(t.$){let e=r.port?`:${r.port}`:"";return`${r.protocol}//${a}.sandbox.localhost${e}`}return`https://${a}.${t.q}`},"f",0,o])}]);

//# debugId=e238b0d3-3abf-d8b1-11d9-e02ed5a8c6c6
