module.exports=[18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},75601,e=>{"use strict";var t=e.i(93458),a=e.i(79832);async function r(){let e=await (0,t.cookies)(),r=e.get("invollve_token")?.value;return r?(0,a.verifyToken)(r):null}e.s(["getSession",0,r])},18520,e=>e.a(async(t,a)=>{try{let t=await e.y("@libsql/client-6da938047d5fc1cd");e.n(t),a()}catch(e){a(e)}},!0),43793,e=>e.a(async(t,a)=>{try{var r=e.i(18520),n=t([r]);[r]=n.then?(await n)():n;let s=process.env.TURSO_DATABASE_URL??"file:/tmp/invollve.db",T=process.env.TURSO_AUTH_TOKEN,l=null;function i(){return l||(l=T?(0,r.createClient)({url:s,authToken:T}):(0,r.createClient)({url:s})),l}let E=[`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff',
    avatar_url TEXT,
    birthday TEXT,
    phone TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,`CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    stage TEXT DEFAULT 'prospeccao',
    value REAL,
    notes TEXT,
    responsible_id INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  )`,`CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`,`CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    notes TEXT,
    status TEXT DEFAULT 'ativo',
    meta_account_id TEXT,
    meta_account_id2 TEXT,
    google_ads_id TEXT,
    instagram_id TEXT,
    logo_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo',
    priority TEXT DEFAULT 'media',
    assigned_to INTEGER,
    client_id INTEGER,
    due_date TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,`CREATE TABLE IF NOT EXISTS financial_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT,
    status TEXT DEFAULT 'pendente',
    due_date TEXT,
    paid_date TEXT,
    client_id INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  )`,`CREATE TABLE IF NOT EXISTS rh_people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT,
    birthday TEXT,
    email TEXT,
    phone TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,`CREATE TABLE IF NOT EXISTS drive_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT,
    client_id INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  )`,`CREATE TABLE IF NOT EXISTS meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    meet_link TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT,
    attendees TEXT,
    client_id INTEGER,
    created_by INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  )`,`CREATE TABLE IF NOT EXISTS client_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    metric TEXT NOT NULL,
    value TEXT,
    period TEXT,
    notes TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  )`],d=!1;async function o(){if(d)return;let e=i();for(let t of E)await e.execute(t);d=!0}e.s(["default",0,{get:async(e,t=[])=>(await o(),(await i().execute({sql:e,args:t})).rows[0]??null),all:async(e,t=[])=>(await o(),(await i().execute({sql:e,args:t})).rows),run:async(e,t=[])=>(await o(),{lastInsertRowid:(await i().execute({sql:e,args:t})).lastInsertRowid??0})}]),a()}catch(e){a(e)}},!1),76469,e=>e.a(async(t,a)=>{try{var r=e.i(89171),n=e.i(43793),i=e.i(75601),o=t([n]);async function s(){let e=await (0,i.getSession)();if(!e||"cliente"===e.role)return r.NextResponse.json({error:"Não autorizado"},{status:403});let t=await n.default.all("SELECT * FROM rh_people ORDER BY name");return r.NextResponse.json(t)}async function T(e){let t=await (0,i.getSession)();if(!t||"cliente"===t.role)return r.NextResponse.json({error:"Não autorizado"},{status:403});let{name:a,role:o,birthday:s,email:T,phone:l,notes:E}=await e.json(),d=await n.default.run("INSERT INTO rh_people (name, role, birthday, email, phone, notes) VALUES (?, ?, ?, ?, ?, ?)",[a,o,s,T,l,E]);return r.NextResponse.json({id:d.lastInsertRowid})}async function l(e){let t=await (0,i.getSession)();if(!t||"cliente"===t.role)return r.NextResponse.json({error:"Não autorizado"},{status:403});let{id:a,...o}=await e.json();return await n.default.run("UPDATE rh_people SET name=?, role=?, birthday=?, email=?, phone=?, notes=? WHERE id=?",[o.name,o.role,o.birthday,o.email,o.phone,o.notes,a]),r.NextResponse.json({ok:!0})}async function E(e){let t=await (0,i.getSession)();if(!t||!["socio"].includes(t.role))return r.NextResponse.json({error:"Não autorizado"},{status:403});let{id:a}=await e.json();return await n.default.run("DELETE FROM rh_people WHERE id = ?",[a]),r.NextResponse.json({ok:!0})}[n]=o.then?(await o)():o,e.s(["DELETE",0,E,"GET",0,s,"POST",0,T,"PUT",0,l]),a()}catch(e){a(e)}},!1),66366,e=>e.a(async(t,a)=>{try{var r=e.i(47909),n=e.i(74017),i=e.i(96250),o=e.i(59756),s=e.i(61916),T=e.i(74677),l=e.i(69741),E=e.i(16795),d=e.i(87718),u=e.i(95169),c=e.i(47587),p=e.i(66012),R=e.i(70101),N=e.i(26937),h=e.i(10372),A=e.i(93695);e.i(52474);var m=e.i(220),w=e.i(76469),I=t([w]);[w]=I.then?(await I)():I;let x=new r.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/rh/route",pathname:"/api/rh",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/rh/route.ts",nextConfigOutput:"",userland:w,...{}}),{workAsyncStorage:L,workUnitAsyncStorage:v,serverHooks:U}=x;async function X(e,t,a){a.requestMeta&&(0,o.setRequestMeta)(e,a.requestMeta),x.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/rh/route";r=r.replace(/\/index$/,"")||"/";let i=await x.prepare(e,t,{srcPage:r,multiZoneDraftMode:!1});if(!i)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:w,deploymentId:I,params:X,nextConfig:L,parsedUrl:v,isDraftMode:U,prerenderManifest:_,routerServerContext:f,isOnDemandRevalidate:O,revalidateOnlyGenerated:y,resolvedPathname:g,clientReferenceManifest:C,serverActionsManifest:S}=i,b=(0,l.normalizeAppPath)(r),M=!!(_.dynamicRoutes[b]||_.routes[g]),P=async()=>((null==f?void 0:f.render404)?await f.render404(e,t,v,!1):t.end("This page could not be found"),null);if(M&&!U){let e=!!_.routes[g],t=_.dynamicRoutes[b];if(t&&!1===t.fallback&&!e){if(L.adapterPath)return await P();throw new A.NoFallbackError}}let F=null;!M||x.isDev||U||(F=g,F="/index"===F?"/":F);let D=!0===x.isDev||!M,k=M&&!D;S&&C&&(0,T.setManifestsSingleton)({page:r,clientReferenceManifest:C,serverActionsManifest:S});let j=e.method||"GET",q=(0,s.getTracer)(),G=q.getActiveScopeSpan(),Y=!!(null==f?void 0:f.isWrappedByNextServer),H=!!(0,o.getRequestMeta)(e,"minimalMode"),K=(0,o.getRequestMeta)(e,"incrementalCache")||await x.getIncrementalCache(e,L,_,H);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let B={params:X,previewProps:_.preview,renderOpts:{experimental:{authInterrupts:!!L.experimental.authInterrupts},cacheComponents:!!L.cacheComponents,supportsDynamicResponse:D,incrementalCache:K,cacheLifeProfiles:L.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>x.onRequestError(e,t,r,n,f)},sharedContext:{buildId:w,deploymentId:I}},$=new E.NodeNextRequest(e),z=new E.NodeNextResponse(t),W=d.NextRequestAdapter.fromNodeNextRequest($,(0,d.signalFromNodeResponse)(t));try{let i,o=async e=>x.handle(W,B).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=q.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=a.get("next.route");if(n){let t=`${j} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t),i&&i!==e&&(i.setAttribute("http.route",n),i.updateName(t))}else e.updateName(`${j} ${r}`)}),T=async i=>{var s,T;let l=async({previousCacheEntry:n})=>{try{if(!H&&O&&y&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await o(i);e.fetchMetrics=B.renderOpts.fetchMetrics;let s=B.renderOpts.pendingWaitUntil;s&&a.waitUntil&&(a.waitUntil(s),s=void 0);let T=B.renderOpts.collectedTags;if(!M)return await (0,p.sendResponse)($,z,r,B.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,R.toNodeOutgoingHttpHeaders)(r.headers);T&&(t[h.NEXT_CACHE_TAGS_HEADER]=T),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==B.renderOpts.collectedRevalidate&&!(B.renderOpts.collectedRevalidate>=h.INFINITE_CACHE)&&B.renderOpts.collectedRevalidate,n=void 0===B.renderOpts.collectedExpire||B.renderOpts.collectedExpire>=h.INFINITE_CACHE?void 0:B.renderOpts.collectedExpire;return{value:{kind:m.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:n}}}}catch(t){throw(null==n?void 0:n.isStale)&&await x.onRequestError(e,t,{routerKind:"App Router",routePath:r,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:O})},!1,f),t}},E=await x.handleResponse({req:e,nextConfig:L,cacheKey:F,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:_,isRoutePPREnabled:!1,isOnDemandRevalidate:O,revalidateOnlyGenerated:y,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:H});if(!M)return null;if((null==E||null==(s=E.value)?void 0:s.kind)!==m.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==E||null==(T=E.value)?void 0:T.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});H||t.setHeader("x-nextjs-cache",O?"REVALIDATED":E.isMiss?"MISS":E.isStale?"STALE":"HIT"),U&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let d=(0,R.fromNodeOutgoingHttpHeaders)(E.value.headers);return H&&M||d.delete(h.NEXT_CACHE_TAGS_HEADER),!E.cacheControl||t.getHeader("Cache-Control")||d.get("Cache-Control")||d.set("Cache-Control",(0,N.getCacheControlHeader)(E.cacheControl)),await (0,p.sendResponse)($,z,new Response(E.value.body,{headers:d,status:E.value.status||200})),null};Y&&G?await T(G):(i=q.getActiveScopeSpan(),await q.withPropagatedContext(e.headers,()=>q.trace(u.BaseServerSpan.handleRequest,{spanName:`${j} ${r}`,kind:s.SpanKind.SERVER,attributes:{"http.method":j,"http.target":e.url}},T),void 0,!Y))}catch(t){if(t instanceof A.NoFallbackError||await x.onRequestError(e,t,{routerKind:"App Router",routePath:b,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:O})},!1,f),M)throw t;return await (0,p.sendResponse)($,z,new Response(null,{status:500})),null}}e.s(["handler",0,X,"patchFetch",0,function(){return(0,i.patchFetch)({workAsyncStorage:L,workUnitAsyncStorage:v})},"routeModule",0,x,"serverHooks",0,U,"workAsyncStorage",0,L,"workUnitAsyncStorage",0,v]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__1h7mnws._.js.map