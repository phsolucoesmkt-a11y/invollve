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
  )`],E=!1;async function s(){if(E)return;let e=i();for(let t of d)await e.execute(t);E=!0}e.s(["default",0,{get:async(e,t=[])=>(await s(),(await i().execute({sql:e,args:t})).rows[0]??null),all:async(e,t=[])=>(await s(),(await i().execute({sql:e,args:t})).rows),run:async(e,t=[])=>(await s(),{lastInsertRowid:(await i().execute({sql:e,args:t})).lastInsertRowid??0})}]),a()}catch(e){a(e)}},!1),55288,e=>e.a(async(t,a)=>{try{var n=e.i(89171),r=e.i(43793),i=e.i(75601),s=t([r]);async function o(e){if(!await (0,i.getSession)())return n.NextResponse.json({error:"Não autorizado"},{status:401});let{searchParams:t}=new URL(e.url),a=t.get("client_id"),s=a?await r.default.all("SELECT * FROM client_data WHERE client_id = ? ORDER BY metric",[a]):await r.default.all("SELECT cd.*, c.name as client_name FROM client_data cd LEFT JOIN clients c ON cd.client_id = c.id ORDER BY c.name, cd.metric");return n.NextResponse.json(s)}async function T(e){let t=await (0,i.getSession)();if(!t||"cliente"===t.role)return n.NextResponse.json({error:"Não autorizado"},{status:403});let{client_id:a,metric:s,value:o,period:T,notes:l}=await e.json(),d=await r.default.run("INSERT INTO client_data (client_id, metric, value, period, notes) VALUES (?, ?, ?, ?, ?)",[a,s,o,T,l]);return n.NextResponse.json({id:d.lastInsertRowid})}async function l(e){let t=await (0,i.getSession)();if(!t||"cliente"===t.role)return n.NextResponse.json({error:"Não autorizado"},{status:403});let{id:a,...s}=await e.json();return await r.default.run("UPDATE client_data SET metric=?, value=?, period=?, notes=?, updated_at=datetime('now') WHERE id=?",[s.metric,s.value,s.period,s.notes,a]),n.NextResponse.json({ok:!0})}async function d(e){let t=await (0,i.getSession)();if(!t||"cliente"===t.role)return n.NextResponse.json({error:"Não autorizado"},{status:403});let{id:a}=await e.json();return await r.default.run("DELETE FROM client_data WHERE id = ?",[a]),n.NextResponse.json({ok:!0})}[r]=s.then?(await s)():s,e.s(["DELETE",0,d,"GET",0,o,"POST",0,T,"PUT",0,l]),a()}catch(e){a(e)}},!1),21504,e=>e.a(async(t,a)=>{try{var n=e.i(47909),r=e.i(74017),i=e.i(96250),s=e.i(59756),o=e.i(61916),T=e.i(74677),l=e.i(69741),d=e.i(16795),E=e.i(87718),c=e.i(95169),u=e.i(47587),p=e.i(66012),R=e.i(70101),N=e.i(26937),A=e.i(10372),m=e.i(93695);e.i(52474);var w=e.i(220),h=e.i(55288),I=t([h]);[h]=I.then?(await I)():I;let X=new n.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/client-data/route",pathname:"/api/client-data",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/client-data/route.ts",nextConfigOutput:"",userland:h,...{}}),{workAsyncStorage:v,workUnitAsyncStorage:x,serverHooks:_}=X;async function L(e,t,a){a.requestMeta&&(0,s.setRequestMeta)(e,a.requestMeta),X.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let n="/api/client-data/route";n=n.replace(/\/index$/,"")||"/";let i=await X.prepare(e,t,{srcPage:n,multiZoneDraftMode:!1});if(!i)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:h,deploymentId:I,params:L,nextConfig:v,parsedUrl:x,isDraftMode:_,prerenderManifest:O,routerServerContext:U,isOnDemandRevalidate:f,revalidateOnlyGenerated:g,resolvedPathname:y,clientReferenceManifest:C,serverActionsManifest:S}=i,F=(0,l.normalizeAppPath)(n),M=!!(O.dynamicRoutes[F]||O.routes[y]),P=async()=>((null==U?void 0:U.render404)?await U.render404(e,t,x,!1):t.end("This page could not be found"),null);if(M&&!_){let e=!!O.routes[y],t=O.dynamicRoutes[F];if(t&&!1===t.fallback&&!e){if(v.adapterPath)return await P();throw new m.NoFallbackError}}let b=null;!M||X.isDev||_||(b=y,b="/index"===b?"/":b);let D=!0===X.isDev||!M,k=M&&!D;S&&C&&(0,T.setManifestsSingleton)({page:n,clientReferenceManifest:C,serverActionsManifest:S});let j=e.method||"GET",q=(0,o.getTracer)(),G=q.getActiveScopeSpan(),Y=!!(null==U?void 0:U.isWrappedByNextServer),H=!!(0,s.getRequestMeta)(e,"minimalMode"),B=(0,s.getRequestMeta)(e,"incrementalCache")||await X.getIncrementalCache(e,v,O,H);null==B||B.resetRequestCache(),globalThis.__incrementalCache=B;let K={params:L,previewProps:O.preview,renderOpts:{experimental:{authInterrupts:!!v.experimental.authInterrupts},cacheComponents:!!v.cacheComponents,supportsDynamicResponse:D,incrementalCache:B,cacheLifeProfiles:v.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,n,r)=>X.onRequestError(e,t,n,r,U)},sharedContext:{buildId:h,deploymentId:I}},$=new d.NodeNextRequest(e),W=new d.NodeNextResponse(t),z=E.NextRequestAdapter.fromNodeNextRequest($,(0,E.signalFromNodeResponse)(t));try{let i,s=async e=>X.handle(z,K).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=q.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${j} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t),i&&i!==e&&(i.setAttribute("http.route",r),i.updateName(t))}else e.updateName(`${j} ${n}`)}),T=async i=>{var o,T;let l=async({previousCacheEntry:r})=>{try{if(!H&&f&&g&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await s(i);e.fetchMetrics=K.renderOpts.fetchMetrics;let o=K.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let T=K.renderOpts.collectedTags;if(!M)return await (0,p.sendResponse)($,W,n,K.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,R.toNodeOutgoingHttpHeaders)(n.headers);T&&(t[A.NEXT_CACHE_TAGS_HEADER]=T),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==K.renderOpts.collectedRevalidate&&!(K.renderOpts.collectedRevalidate>=A.INFINITE_CACHE)&&K.renderOpts.collectedRevalidate,r=void 0===K.renderOpts.collectedExpire||K.renderOpts.collectedExpire>=A.INFINITE_CACHE?void 0:K.renderOpts.collectedExpire;return{value:{kind:w.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==r?void 0:r.isStale)&&await X.onRequestError(e,t,{routerKind:"App Router",routePath:n,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:f})},!1,U),t}},d=await X.handleResponse({req:e,nextConfig:v,cacheKey:b,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:O,isRoutePPREnabled:!1,isOnDemandRevalidate:f,revalidateOnlyGenerated:g,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:H});if(!M)return null;if((null==d||null==(o=d.value)?void 0:o.kind)!==w.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(T=d.value)?void 0:T.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});H||t.setHeader("x-nextjs-cache",f?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),_&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let E=(0,R.fromNodeOutgoingHttpHeaders)(d.value.headers);return H&&M||E.delete(A.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||E.get("Cache-Control")||E.set("Cache-Control",(0,N.getCacheControlHeader)(d.cacheControl)),await (0,p.sendResponse)($,W,new Response(d.value.body,{headers:E,status:d.value.status||200})),null};Y&&G?await T(G):(i=q.getActiveScopeSpan(),await q.withPropagatedContext(e.headers,()=>q.trace(c.BaseServerSpan.handleRequest,{spanName:`${j} ${n}`,kind:o.SpanKind.SERVER,attributes:{"http.method":j,"http.target":e.url}},T),void 0,!Y))}catch(t){if(t instanceof m.NoFallbackError||await X.onRequestError(e,t,{routerKind:"App Router",routePath:F,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:f})},!1,U),M)throw t;return await (0,p.sendResponse)($,W,new Response(null,{status:500})),null}}e.s(["handler",0,L,"patchFetch",0,function(){return(0,i.patchFetch)({workAsyncStorage:v,workUnitAsyncStorage:x})},"routeModule",0,X,"serverHooks",0,_,"workAsyncStorage",0,v,"workUnitAsyncStorage",0,x]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__1vb5h29._.js.map