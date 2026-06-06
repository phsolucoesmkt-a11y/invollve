module.exports=[18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},75601,e=>{"use strict";var t=e.i(93458),a=e.i(79832);async function n(){let e=await (0,t.cookies)(),n=e.get("invollve_token")?.value;return n?(0,a.verifyToken)(n):null}e.s(["getSession",0,n])},18520,e=>e.a(async(t,a)=>{try{let t=await e.y("@libsql/client-6da938047d5fc1cd");e.n(t),a()}catch(e){a(e)}},!0),43793,e=>e.a(async(t,a)=>{try{var n=e.i(18520),r=t([n]);[n]=r.then?(await r)():r;let o=process.env.TURSO_DATABASE_URL??"file:/tmp/invollve.db",T=process.env.TURSO_AUTH_TOKEN,l=null;function i(){return l||(l=T?(0,n.createClient)({url:o,authToken:T}):(0,n.createClient)({url:o})),l}let E=[`CREATE TABLE IF NOT EXISTS users (
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
  )`],d=!1;async function s(){if(d)return;let e=i();for(let t of E)await e.execute(t);d=!0}e.s(["default",0,{get:async(e,t=[])=>(await s(),(await i().execute({sql:e,args:t})).rows[0]??null),all:async(e,t=[])=>(await s(),(await i().execute({sql:e,args:t})).rows),run:async(e,t=[])=>(await s(),{lastInsertRowid:(await i().execute({sql:e,args:t})).lastInsertRowid??0})}]),a()}catch(e){a(e)}},!1),36730,e=>e.a(async(t,a)=>{try{var n=e.i(89171),r=e.i(43793),i=e.i(75601),s=t([r]);async function o(){let e=await (0,i.getSession)();if(!e||"cliente"===e.role)return n.NextResponse.json({error:"Não autorizado"},{status:403});let t=await r.default.all(`
    SELECT m.*, c.name as client_name, u.name as creator_name FROM meetings m
    LEFT JOIN clients c ON m.client_id = c.id
    LEFT JOIN users u ON m.created_by = u.id
    ORDER BY m.start_time DESC
  `);return n.NextResponse.json(t)}async function T(e){let t=await (0,i.getSession)();if(!t||"cliente"===t.role)return n.NextResponse.json({error:"Não autorizado"},{status:403});let{title:a,description:s,meet_link:o,start_time:T,end_time:l,attendees:E,client_id:d}=await e.json(),c=await r.default.run("INSERT INTO meetings (title, description, meet_link, start_time, end_time, attendees, client_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",[a,s,o,T,l,E,d||null,t.id]);return n.NextResponse.json({id:c.lastInsertRowid})}async function l(e){let t=await (0,i.getSession)();if(!t||"cliente"===t.role)return n.NextResponse.json({error:"Não autorizado"},{status:403});let{id:a}=await e.json();return await r.default.run("DELETE FROM meetings WHERE id = ?",[a]),n.NextResponse.json({ok:!0})}[r]=s.then?(await s)():s,e.s(["DELETE",0,l,"GET",0,o,"POST",0,T]),a()}catch(e){a(e)}},!1),56832,e=>e.a(async(t,a)=>{try{var n=e.i(47909),r=e.i(74017),i=e.i(96250),s=e.i(59756),o=e.i(61916),T=e.i(74677),l=e.i(69741),E=e.i(16795),d=e.i(87718),c=e.i(95169),u=e.i(47587),p=e.i(66012),R=e.i(70101),N=e.i(26937),m=e.i(10372),A=e.i(93695);e.i(52474);var h=e.i(220),I=e.i(36730),w=t([I]);[I]=w.then?(await w)():w;let X=new n.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/meetings/route",pathname:"/api/meetings",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/meetings/route.ts",nextConfigOutput:"",userland:I,...{}}),{workAsyncStorage:_,workUnitAsyncStorage:x,serverHooks:v}=X;async function L(e,t,a){a.requestMeta&&(0,s.setRequestMeta)(e,a.requestMeta),X.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let n="/api/meetings/route";n=n.replace(/\/index$/,"")||"/";let i=await X.prepare(e,t,{srcPage:n,multiZoneDraftMode:!1});if(!i)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:I,deploymentId:w,params:L,nextConfig:_,parsedUrl:x,isDraftMode:v,prerenderManifest:O,routerServerContext:g,isOnDemandRevalidate:U,revalidateOnlyGenerated:f,resolvedPathname:y,clientReferenceManifest:C,serverActionsManifest:S}=i,F=(0,l.normalizeAppPath)(n),b=!!(O.dynamicRoutes[F]||O.routes[y]),M=async()=>((null==g?void 0:g.render404)?await g.render404(e,t,x,!1):t.end("This page could not be found"),null);if(b&&!v){let e=!!O.routes[y],t=O.dynamicRoutes[F];if(t&&!1===t.fallback&&!e){if(_.adapterPath)return await M();throw new A.NoFallbackError}}let P=null;!b||X.isDev||v||(P=y,P="/index"===P?"/":P);let D=!0===X.isDev||!b,k=b&&!D;S&&C&&(0,T.setManifestsSingleton)({page:n,clientReferenceManifest:C,serverActionsManifest:S});let j=e.method||"GET",q=(0,o.getTracer)(),G=q.getActiveScopeSpan(),Y=!!(null==g?void 0:g.isWrappedByNextServer),H=!!(0,s.getRequestMeta)(e,"minimalMode"),K=(0,s.getRequestMeta)(e,"incrementalCache")||await X.getIncrementalCache(e,_,O,H);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let B={params:L,previewProps:O.preview,renderOpts:{experimental:{authInterrupts:!!_.experimental.authInterrupts},cacheComponents:!!_.cacheComponents,supportsDynamicResponse:D,incrementalCache:K,cacheLifeProfiles:_.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,n,r)=>X.onRequestError(e,t,n,r,g)},sharedContext:{buildId:I,deploymentId:w}},$=new E.NodeNextRequest(e),z=new E.NodeNextResponse(t),V=d.NextRequestAdapter.fromNodeNextRequest($,(0,d.signalFromNodeResponse)(t));try{let i,s=async e=>X.handle(V,B).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=q.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${j} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t),i&&i!==e&&(i.setAttribute("http.route",r),i.updateName(t))}else e.updateName(`${j} ${n}`)}),T=async i=>{var o,T;let l=async({previousCacheEntry:r})=>{try{if(!H&&U&&f&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await s(i);e.fetchMetrics=B.renderOpts.fetchMetrics;let o=B.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let T=B.renderOpts.collectedTags;if(!b)return await (0,p.sendResponse)($,z,n,B.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,R.toNodeOutgoingHttpHeaders)(n.headers);T&&(t[m.NEXT_CACHE_TAGS_HEADER]=T),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==B.renderOpts.collectedRevalidate&&!(B.renderOpts.collectedRevalidate>=m.INFINITE_CACHE)&&B.renderOpts.collectedRevalidate,r=void 0===B.renderOpts.collectedExpire||B.renderOpts.collectedExpire>=m.INFINITE_CACHE?void 0:B.renderOpts.collectedExpire;return{value:{kind:h.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==r?void 0:r.isStale)&&await X.onRequestError(e,t,{routerKind:"App Router",routePath:n,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:U})},!1,g),t}},E=await X.handleResponse({req:e,nextConfig:_,cacheKey:P,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:O,isRoutePPREnabled:!1,isOnDemandRevalidate:U,revalidateOnlyGenerated:f,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:H});if(!b)return null;if((null==E||null==(o=E.value)?void 0:o.kind)!==h.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==E||null==(T=E.value)?void 0:T.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});H||t.setHeader("x-nextjs-cache",U?"REVALIDATED":E.isMiss?"MISS":E.isStale?"STALE":"HIT"),v&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let d=(0,R.fromNodeOutgoingHttpHeaders)(E.value.headers);return H&&b||d.delete(m.NEXT_CACHE_TAGS_HEADER),!E.cacheControl||t.getHeader("Cache-Control")||d.get("Cache-Control")||d.set("Cache-Control",(0,N.getCacheControlHeader)(E.cacheControl)),await (0,p.sendResponse)($,z,new Response(E.value.body,{headers:d,status:E.value.status||200})),null};Y&&G?await T(G):(i=q.getActiveScopeSpan(),await q.withPropagatedContext(e.headers,()=>q.trace(c.BaseServerSpan.handleRequest,{spanName:`${j} ${n}`,kind:o.SpanKind.SERVER,attributes:{"http.method":j,"http.target":e.url}},T),void 0,!Y))}catch(t){if(t instanceof A.NoFallbackError||await X.onRequestError(e,t,{routerKind:"App Router",routePath:F,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:U})},!1,g),b)throw t;return await (0,p.sendResponse)($,z,new Response(null,{status:500})),null}}e.s(["handler",0,L,"patchFetch",0,function(){return(0,i.patchFetch)({workAsyncStorage:_,workUnitAsyncStorage:x})},"routeModule",0,X,"serverHooks",0,v,"workAsyncStorage",0,_,"workUnitAsyncStorage",0,x]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__1hdk63p._.js.map