module.exports=[18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},75601,e=>{"use strict";var t=e.i(93458),a=e.i(79832);async function n(){let e=await (0,t.cookies)(),n=e.get("invollve_token")?.value;return n?(0,a.verifyToken)(n):null}e.s(["getSession",0,n])},18520,e=>e.a(async(t,a)=>{try{let t=await e.y("@libsql/client-6da938047d5fc1cd");e.n(t),a()}catch(e){a(e)}},!0),43793,e=>e.a(async(t,a)=>{try{var n=e.i(18520),r=t([n]);[n]=r.then?(await r)():r;let o=process.env.TURSO_DATABASE_URL??"file:/tmp/invollve.db",T=process.env.TURSO_AUTH_TOKEN,l=null;function i(){return l||(l=T?(0,n.createClient)({url:o,authToken:T}):(0,n.createClient)({url:o})),l}let d=[`CREATE TABLE IF NOT EXISTS users (
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
  )`],E=!1;async function s(){if(E)return;let e=i();for(let t of d)await e.execute(t);E=!0}e.s(["default",0,{get:async(e,t=[])=>(await s(),(await i().execute({sql:e,args:t})).rows[0]??null),all:async(e,t=[])=>(await s(),(await i().execute({sql:e,args:t})).rows),run:async(e,t=[])=>(await s(),{lastInsertRowid:(await i().execute({sql:e,args:t})).lastInsertRowid??0})}]),a()}catch(e){a(e)}},!1),42417,e=>e.a(async(t,a)=>{try{var n=e.i(89171),r=e.i(43793),i=e.i(75601),s=t([r]);async function o(){let e=await (0,i.getSession)();if(!e||"socio"!==e.role)return n.NextResponse.json({error:"Não autorizado"},{status:403});let t=await r.default.all(`
    SELECT f.*, c.name as client_name FROM financial_entries f
    LEFT JOIN clients c ON f.client_id = c.id
    ORDER BY f.due_date DESC
  `);return n.NextResponse.json(t)}async function T(e){let t=await (0,i.getSession)();if(!t||"socio"!==t.role)return n.NextResponse.json({error:"Não autorizado"},{status:403});let{type:a,description:s,amount:o,category:T,status:l,due_date:d,paid_date:E,client_id:u}=await e.json(),c=await r.default.run("INSERT INTO financial_entries (type, description, amount, category, status, due_date, paid_date, client_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",[a,s,o,T,l||"pendente",d||null,E||null,u||null]);return n.NextResponse.json({id:Number(c.lastInsertRowid)})}async function l(e){let t=await (0,i.getSession)();if(!t||"socio"!==t.role)return n.NextResponse.json({error:"Não autorizado"},{status:403});let{id:a,...s}=await e.json();return await r.default.run("UPDATE financial_entries SET type=?, description=?, amount=?, category=?, status=?, due_date=?, paid_date=?, client_id=? WHERE id=?",[s.type,s.description,s.amount,s.category,s.status,s.due_date||null,s.paid_date||null,s.client_id||null,a]),n.NextResponse.json({ok:!0})}async function d(e){let t=await (0,i.getSession)();if(!t||"socio"!==t.role)return n.NextResponse.json({error:"Não autorizado"},{status:403});let{id:a}=await e.json();return await r.default.run("DELETE FROM financial_entries WHERE id = ?",[a]),n.NextResponse.json({ok:!0})}[r]=s.then?(await s)():s,e.s(["DELETE",0,d,"GET",0,o,"POST",0,T,"PUT",0,l]),a()}catch(e){a(e)}},!1),77957,e=>e.a(async(t,a)=>{try{var n=e.i(47909),r=e.i(74017),i=e.i(96250),s=e.i(59756),o=e.i(61916),T=e.i(74677),l=e.i(69741),d=e.i(16795),E=e.i(87718),u=e.i(95169),c=e.i(47587),p=e.i(66012),R=e.i(70101),N=e.i(26937),A=e.i(10372),h=e.i(93695);e.i(52474);var m=e.i(220),w=e.i(42417),I=t([w]);[w]=I.then?(await I)():I;let f=new n.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/financial/route",pathname:"/api/financial",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/financial/route.ts",nextConfigOutput:"",userland:w,...{}}),{workAsyncStorage:X,workUnitAsyncStorage:x,serverHooks:L}=f;async function _(e,t,a){a.requestMeta&&(0,s.setRequestMeta)(e,a.requestMeta),f.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let n="/api/financial/route";n=n.replace(/\/index$/,"")||"/";let i=await f.prepare(e,t,{srcPage:n,multiZoneDraftMode:!1});if(!i)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:w,deploymentId:I,params:_,nextConfig:X,parsedUrl:x,isDraftMode:L,prerenderManifest:v,routerServerContext:O,isOnDemandRevalidate:U,revalidateOnlyGenerated:y,resolvedPathname:g,clientReferenceManifest:C,serverActionsManifest:S}=i,F=(0,l.normalizeAppPath)(n),M=!!(v.dynamicRoutes[F]||v.routes[g]),P=async()=>((null==O?void 0:O.render404)?await O.render404(e,t,x,!1):t.end("This page could not be found"),null);if(M&&!L){let e=!!v.routes[g],t=v.dynamicRoutes[F];if(t&&!1===t.fallback&&!e){if(X.adapterPath)return await P();throw new h.NoFallbackError}}let b=null;!M||f.isDev||L||(b=g,b="/index"===b?"/":b);let D=!0===f.isDev||!M,k=M&&!D;S&&C&&(0,T.setManifestsSingleton)({page:n,clientReferenceManifest:C,serverActionsManifest:S});let j=e.method||"GET",q=(0,o.getTracer)(),G=q.getActiveScopeSpan(),Y=!!(null==O?void 0:O.isWrappedByNextServer),H=!!(0,s.getRequestMeta)(e,"minimalMode"),K=(0,s.getRequestMeta)(e,"incrementalCache")||await f.getIncrementalCache(e,X,v,H);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let B={params:_,previewProps:v.preview,renderOpts:{experimental:{authInterrupts:!!X.experimental.authInterrupts},cacheComponents:!!X.cacheComponents,supportsDynamicResponse:D,incrementalCache:K,cacheLifeProfiles:X.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,n,r)=>f.onRequestError(e,t,n,r,O)},sharedContext:{buildId:w,deploymentId:I}},$=new d.NodeNextRequest(e),z=new d.NodeNextResponse(t),W=E.NextRequestAdapter.fromNodeNextRequest($,(0,E.signalFromNodeResponse)(t));try{let i,s=async e=>f.handle(W,B).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=q.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${j} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t),i&&i!==e&&(i.setAttribute("http.route",r),i.updateName(t))}else e.updateName(`${j} ${n}`)}),T=async i=>{var o,T;let l=async({previousCacheEntry:r})=>{try{if(!H&&U&&y&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await s(i);e.fetchMetrics=B.renderOpts.fetchMetrics;let o=B.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let T=B.renderOpts.collectedTags;if(!M)return await (0,p.sendResponse)($,z,n,B.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,R.toNodeOutgoingHttpHeaders)(n.headers);T&&(t[A.NEXT_CACHE_TAGS_HEADER]=T),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==B.renderOpts.collectedRevalidate&&!(B.renderOpts.collectedRevalidate>=A.INFINITE_CACHE)&&B.renderOpts.collectedRevalidate,r=void 0===B.renderOpts.collectedExpire||B.renderOpts.collectedExpire>=A.INFINITE_CACHE?void 0:B.renderOpts.collectedExpire;return{value:{kind:m.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==r?void 0:r.isStale)&&await f.onRequestError(e,t,{routerKind:"App Router",routePath:n,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:U})},!1,O),t}},d=await f.handleResponse({req:e,nextConfig:X,cacheKey:b,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:v,isRoutePPREnabled:!1,isOnDemandRevalidate:U,revalidateOnlyGenerated:y,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:H});if(!M)return null;if((null==d||null==(o=d.value)?void 0:o.kind)!==m.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(T=d.value)?void 0:T.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});H||t.setHeader("x-nextjs-cache",U?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),L&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let E=(0,R.fromNodeOutgoingHttpHeaders)(d.value.headers);return H&&M||E.delete(A.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||E.get("Cache-Control")||E.set("Cache-Control",(0,N.getCacheControlHeader)(d.cacheControl)),await (0,p.sendResponse)($,z,new Response(d.value.body,{headers:E,status:d.value.status||200})),null};Y&&G?await T(G):(i=q.getActiveScopeSpan(),await q.withPropagatedContext(e.headers,()=>q.trace(u.BaseServerSpan.handleRequest,{spanName:`${j} ${n}`,kind:o.SpanKind.SERVER,attributes:{"http.method":j,"http.target":e.url}},T),void 0,!Y))}catch(t){if(t instanceof h.NoFallbackError||await f.onRequestError(e,t,{routerKind:"App Router",routePath:F,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:U})},!1,O),M)throw t;return await (0,p.sendResponse)($,z,new Response(null,{status:500})),null}}e.s(["handler",0,_,"patchFetch",0,function(){return(0,i.patchFetch)({workAsyncStorage:X,workUnitAsyncStorage:x})},"routeModule",0,f,"serverHooks",0,L,"workAsyncStorage",0,X,"workUnitAsyncStorage",0,x]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__16x43hq._.js.map