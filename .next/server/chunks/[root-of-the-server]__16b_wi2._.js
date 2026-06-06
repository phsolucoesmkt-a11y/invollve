module.exports=[18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},75601,e=>{"use strict";var t=e.i(93458),a=e.i(79832);async function r(){let e=await (0,t.cookies)(),r=e.get("invollve_token")?.value;return r?(0,a.verifyToken)(r):null}e.s(["getSession",0,r])},18520,e=>e.a(async(t,a)=>{try{let t=await e.y("@libsql/client-6da938047d5fc1cd");e.n(t),a()}catch(e){a(e)}},!0),43793,e=>e.a(async(t,a)=>{try{var r=e.i(18520),n=t([r]);[r]=n.then?(await n)():n;let o=process.env.TURSO_DATABASE_URL??"file:/tmp/invollve.db",T=process.env.TURSO_AUTH_TOKEN,l=null;function s(){return l||(l=T?(0,r.createClient)({url:o,authToken:T}):(0,r.createClient)({url:o})),l}let E=[`CREATE TABLE IF NOT EXISTS users (
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
  )`],d=!1;async function i(){if(d)return;let e=s();for(let t of E)await e.execute(t);d=!0}e.s(["default",0,{get:async(e,t=[])=>(await i(),(await s().execute({sql:e,args:t})).rows[0]??null),all:async(e,t=[])=>(await i(),(await s().execute({sql:e,args:t})).rows),run:async(e,t=[])=>(await i(),{lastInsertRowid:(await s().execute({sql:e,args:t})).lastInsertRowid??0})}]),a()}catch(e){a(e)}},!1),54799,(e,t,a)=>{t.exports=e.x("crypto",()=>require("crypto"))},52427,e=>e.a(async(t,a)=>{try{var r=e.i(89171),n=e.i(43793),s=e.i(75601),i=e.i(49632),o=t([n]);async function T(){let e=await (0,s.getSession)();if(!e||"socio"!==e.role)return r.NextResponse.json({error:"Não autorizado"},{status:403});let t=await n.default.all("SELECT id, name, email, role, created_at FROM users ORDER BY name");return r.NextResponse.json(t)}async function l(e){let t=await (0,s.getSession)();if(!t||"socio"!==t.role)return r.NextResponse.json({error:"Não autorizado"},{status:403});let{name:a,email:o,password:T,role:l}=await e.json(),E=await i.default.hash(T,10);try{let e=await n.default.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",[a,o,E,l]);return r.NextResponse.json({id:e.lastInsertRowid})}catch{return r.NextResponse.json({error:"Email já cadastrado"},{status:400})}}async function E(e){let t=await (0,s.getSession)();if(!t||"socio"!==t.role)return r.NextResponse.json({error:"Não autorizado"},{status:403});let{id:a}=await e.json();return a===t.id?r.NextResponse.json({error:"Não é possível excluir a si mesmo"},{status:400}):(await n.default.run("DELETE FROM users WHERE id = ?",[a]),r.NextResponse.json({ok:!0}))}[n]=o.then?(await o)():o,e.s(["DELETE",0,E,"GET",0,T,"POST",0,l]),a()}catch(e){a(e)}},!1),75468,e=>e.a(async(t,a)=>{try{var r=e.i(47909),n=e.i(74017),s=e.i(96250),i=e.i(59756),o=e.i(61916),T=e.i(74677),l=e.i(69741),E=e.i(16795),d=e.i(87718),u=e.i(95169),c=e.i(47587),p=e.i(66012),R=e.i(70101),N=e.i(26937),A=e.i(10372),h=e.i(93695);e.i(52474);var m=e.i(220),w=e.i(52427),I=t([w]);[w]=I.then?(await I)():I;let X=new r.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/users/route",pathname:"/api/users",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/users/route.ts",nextConfigOutput:"",userland:w,...{}}),{workAsyncStorage:L,workUnitAsyncStorage:v,serverHooks:O}=X;async function x(e,t,a){a.requestMeta&&(0,i.setRequestMeta)(e,a.requestMeta),X.isDev&&(0,i.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/users/route";r=r.replace(/\/index$/,"")||"/";let s=await X.prepare(e,t,{srcPage:r,multiZoneDraftMode:!1});if(!s)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:w,deploymentId:I,params:x,nextConfig:L,parsedUrl:v,isDraftMode:O,prerenderManifest:U,routerServerContext:f,isOnDemandRevalidate:_,revalidateOnlyGenerated:y,resolvedPathname:g,clientReferenceManifest:C,serverActionsManifest:S}=s,M=(0,l.normalizeAppPath)(r),F=!!(U.dynamicRoutes[M]||U.routes[g]),b=async()=>((null==f?void 0:f.render404)?await f.render404(e,t,v,!1):t.end("This page could not be found"),null);if(F&&!O){let e=!!U.routes[g],t=U.dynamicRoutes[M];if(t&&!1===t.fallback&&!e){if(L.adapterPath)return await b();throw new h.NoFallbackError}}let P=null;!F||X.isDev||O||(P=g,P="/index"===P?"/":P);let D=!0===X.isDev||!F,j=F&&!D;S&&C&&(0,T.setManifestsSingleton)({page:r,clientReferenceManifest:C,serverActionsManifest:S});let k=e.method||"GET",q=(0,o.getTracer)(),G=q.getActiveScopeSpan(),Y=!!(null==f?void 0:f.isWrappedByNextServer),H=!!(0,i.getRequestMeta)(e,"minimalMode"),K=(0,i.getRequestMeta)(e,"incrementalCache")||await X.getIncrementalCache(e,L,U,H);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let B={params:x,previewProps:U.preview,renderOpts:{experimental:{authInterrupts:!!L.experimental.authInterrupts},cacheComponents:!!L.cacheComponents,supportsDynamicResponse:D,incrementalCache:K,cacheLifeProfiles:L.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>X.onRequestError(e,t,r,n,f)},sharedContext:{buildId:w,deploymentId:I}},$=new E.NodeNextRequest(e),z=new E.NodeNextResponse(t),V=d.NextRequestAdapter.fromNodeNextRequest($,(0,d.signalFromNodeResponse)(t));try{let s,i=async e=>X.handle(V,B).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=q.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=a.get("next.route");if(n){let t=`${k} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t),s&&s!==e&&(s.setAttribute("http.route",n),s.updateName(t))}else e.updateName(`${k} ${r}`)}),T=async s=>{var o,T;let l=async({previousCacheEntry:n})=>{try{if(!H&&_&&y&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await i(s);e.fetchMetrics=B.renderOpts.fetchMetrics;let o=B.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let T=B.renderOpts.collectedTags;if(!F)return await (0,p.sendResponse)($,z,r,B.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,R.toNodeOutgoingHttpHeaders)(r.headers);T&&(t[A.NEXT_CACHE_TAGS_HEADER]=T),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==B.renderOpts.collectedRevalidate&&!(B.renderOpts.collectedRevalidate>=A.INFINITE_CACHE)&&B.renderOpts.collectedRevalidate,n=void 0===B.renderOpts.collectedExpire||B.renderOpts.collectedExpire>=A.INFINITE_CACHE?void 0:B.renderOpts.collectedExpire;return{value:{kind:m.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:n}}}}catch(t){throw(null==n?void 0:n.isStale)&&await X.onRequestError(e,t,{routerKind:"App Router",routePath:r,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:j,isOnDemandRevalidate:_})},!1,f),t}},E=await X.handleResponse({req:e,nextConfig:L,cacheKey:P,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:U,isRoutePPREnabled:!1,isOnDemandRevalidate:_,revalidateOnlyGenerated:y,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:H});if(!F)return null;if((null==E||null==(o=E.value)?void 0:o.kind)!==m.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==E||null==(T=E.value)?void 0:T.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});H||t.setHeader("x-nextjs-cache",_?"REVALIDATED":E.isMiss?"MISS":E.isStale?"STALE":"HIT"),O&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let d=(0,R.fromNodeOutgoingHttpHeaders)(E.value.headers);return H&&F||d.delete(A.NEXT_CACHE_TAGS_HEADER),!E.cacheControl||t.getHeader("Cache-Control")||d.get("Cache-Control")||d.set("Cache-Control",(0,N.getCacheControlHeader)(E.cacheControl)),await (0,p.sendResponse)($,z,new Response(E.value.body,{headers:d,status:E.value.status||200})),null};Y&&G?await T(G):(s=q.getActiveScopeSpan(),await q.withPropagatedContext(e.headers,()=>q.trace(u.BaseServerSpan.handleRequest,{spanName:`${k} ${r}`,kind:o.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},T),void 0,!Y))}catch(t){if(t instanceof h.NoFallbackError||await X.onRequestError(e,t,{routerKind:"App Router",routePath:M,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:j,isOnDemandRevalidate:_})},!1,f),F)throw t;return await (0,p.sendResponse)($,z,new Response(null,{status:500})),null}}e.s(["handler",0,x,"patchFetch",0,function(){return(0,s.patchFetch)({workAsyncStorage:L,workUnitAsyncStorage:v})},"routeModule",0,X,"serverHooks",0,O,"workAsyncStorage",0,L,"workUnitAsyncStorage",0,v]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__16b_wi2._.js.map