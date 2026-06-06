module.exports=[18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},75601,e=>{"use strict";var t=e.i(93458),a=e.i(79832);async function r(){let e=await (0,t.cookies)(),r=e.get("invollve_token")?.value;return r?(0,a.verifyToken)(r):null}e.s(["getSession",0,r])},18520,e=>e.a(async(t,a)=>{try{let t=await e.y("@libsql/client-6da938047d5fc1cd");e.n(t),a()}catch(e){a(e)}},!0),43793,e=>e.a(async(t,a)=>{try{var r=e.i(18520),n=t([r]);[r]=n.then?(await n)():n;let o=process.env.TURSO_DATABASE_URL??"file:/tmp/invollve.db",T=process.env.TURSO_AUTH_TOKEN,l=null;function i(){return l||(l=T?(0,r.createClient)({url:o,authToken:T}):(0,r.createClient)({url:o})),l}let E=[`CREATE TABLE IF NOT EXISTS users (
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
  )`],d=!1;async function s(){if(d)return;let e=i();for(let t of E)await e.execute(t);d=!0}e.s(["default",0,{get:async(e,t=[])=>(await s(),(await i().execute({sql:e,args:t})).rows[0]??null),all:async(e,t=[])=>(await s(),(await i().execute({sql:e,args:t})).rows),run:async(e,t=[])=>(await s(),{lastInsertRowid:(await i().execute({sql:e,args:t})).lastInsertRowid??0})}]),a()}catch(e){a(e)}},!1),5390,e=>e.a(async(t,a)=>{try{var r=e.i(89171),n=e.i(43793),i=e.i(75601),s=t([n]);[n]=s.then?(await s)():s;let T=["users","leads","chat_messages","clients","tasks","financial_entries","rh_people","drive_links","meetings","client_data"];async function o(){let e=await (0,i.getSession)();if(!e||"socio"!==e.role)return r.NextResponse.json({error:"Não autorizado"},{status:401});let t={};for(let e of T)try{t[e]=await n.default.all(`SELECT * FROM ${e}`)}catch(a){t[e]=[{__error:a.message}]}return r.NextResponse.json({exported_at:new Date().toISOString(),data:t})}e.s(["GET",0,o]),a()}catch(e){a(e)}},!1),51908,e=>e.a(async(t,a)=>{try{var r=e.i(47909),n=e.i(74017),i=e.i(96250),s=e.i(59756),o=e.i(61916),T=e.i(74677),l=e.i(69741),E=e.i(16795),d=e.i(87718),c=e.i(95169),u=e.i(47587),p=e.i(66012),R=e.i(70101),N=e.i(26937),A=e.i(10372),h=e.i(93695);e.i(52474);var m=e.i(220),I=e.i(5390),X=t([I]);[I]=X.then?(await X)():X;let v=new r.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/export/route",pathname:"/api/export",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/export/route.ts",nextConfigOutput:"",userland:I,...{}}),{workAsyncStorage:_,workUnitAsyncStorage:w,serverHooks:L}=v;async function x(e,t,a){a.requestMeta&&(0,s.setRequestMeta)(e,a.requestMeta),v.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/export/route";r=r.replace(/\/index$/,"")||"/";let i=await v.prepare(e,t,{srcPage:r,multiZoneDraftMode:!1});if(!i)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:I,deploymentId:X,params:x,nextConfig:_,parsedUrl:w,isDraftMode:L,prerenderManifest:U,routerServerContext:g,isOnDemandRevalidate:O,revalidateOnlyGenerated:f,resolvedPathname:y,clientReferenceManifest:C,serverActionsManifest:S}=i,M=(0,l.normalizeAppPath)(r),b=!!(U.dynamicRoutes[M]||U.routes[y]),F=async()=>((null==g?void 0:g.render404)?await g.render404(e,t,w,!1):t.end("This page could not be found"),null);if(b&&!L){let e=!!U.routes[y],t=U.dynamicRoutes[M];if(t&&!1===t.fallback&&!e){if(_.adapterPath)return await F();throw new h.NoFallbackError}}let P=null;!b||v.isDev||L||(P=y,P="/index"===P?"/":P);let D=!0===v.isDev||!b,k=b&&!D;S&&C&&(0,T.setManifestsSingleton)({page:r,clientReferenceManifest:C,serverActionsManifest:S});let q=e.method||"GET",G=(0,o.getTracer)(),Y=G.getActiveScopeSpan(),j=!!(null==g?void 0:g.isWrappedByNextServer),K=!!(0,s.getRequestMeta)(e,"minimalMode"),H=(0,s.getRequestMeta)(e,"incrementalCache")||await v.getIncrementalCache(e,_,U,K);null==H||H.resetRequestCache(),globalThis.__incrementalCache=H;let B={params:x,previewProps:U.preview,renderOpts:{experimental:{authInterrupts:!!_.experimental.authInterrupts},cacheComponents:!!_.cacheComponents,supportsDynamicResponse:D,incrementalCache:H,cacheLifeProfiles:_.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>v.onRequestError(e,t,r,n,g)},sharedContext:{buildId:I,deploymentId:X}},$=new E.NodeNextRequest(e),V=new E.NodeNextResponse(t),W=d.NextRequestAdapter.fromNodeNextRequest($,(0,d.signalFromNodeResponse)(t));try{let i,s=async e=>v.handle(W,B).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=G.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=a.get("next.route");if(n){let t=`${q} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t),i&&i!==e&&(i.setAttribute("http.route",n),i.updateName(t))}else e.updateName(`${q} ${r}`)}),T=async i=>{var o,T;let l=async({previousCacheEntry:n})=>{try{if(!K&&O&&f&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await s(i);e.fetchMetrics=B.renderOpts.fetchMetrics;let o=B.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let T=B.renderOpts.collectedTags;if(!b)return await (0,p.sendResponse)($,V,r,B.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,R.toNodeOutgoingHttpHeaders)(r.headers);T&&(t[A.NEXT_CACHE_TAGS_HEADER]=T),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==B.renderOpts.collectedRevalidate&&!(B.renderOpts.collectedRevalidate>=A.INFINITE_CACHE)&&B.renderOpts.collectedRevalidate,n=void 0===B.renderOpts.collectedExpire||B.renderOpts.collectedExpire>=A.INFINITE_CACHE?void 0:B.renderOpts.collectedExpire;return{value:{kind:m.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:n}}}}catch(t){throw(null==n?void 0:n.isStale)&&await v.onRequestError(e,t,{routerKind:"App Router",routePath:r,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:O})},!1,g),t}},E=await v.handleResponse({req:e,nextConfig:_,cacheKey:P,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:U,isRoutePPREnabled:!1,isOnDemandRevalidate:O,revalidateOnlyGenerated:f,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:K});if(!b)return null;if((null==E||null==(o=E.value)?void 0:o.kind)!==m.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==E||null==(T=E.value)?void 0:T.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});K||t.setHeader("x-nextjs-cache",O?"REVALIDATED":E.isMiss?"MISS":E.isStale?"STALE":"HIT"),L&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let d=(0,R.fromNodeOutgoingHttpHeaders)(E.value.headers);return K&&b||d.delete(A.NEXT_CACHE_TAGS_HEADER),!E.cacheControl||t.getHeader("Cache-Control")||d.get("Cache-Control")||d.set("Cache-Control",(0,N.getCacheControlHeader)(E.cacheControl)),await (0,p.sendResponse)($,V,new Response(E.value.body,{headers:d,status:E.value.status||200})),null};j&&Y?await T(Y):(i=G.getActiveScopeSpan(),await G.withPropagatedContext(e.headers,()=>G.trace(c.BaseServerSpan.handleRequest,{spanName:`${q} ${r}`,kind:o.SpanKind.SERVER,attributes:{"http.method":q,"http.target":e.url}},T),void 0,!j))}catch(t){if(t instanceof h.NoFallbackError||await v.onRequestError(e,t,{routerKind:"App Router",routePath:M,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:O})},!1,g),b)throw t;return await (0,p.sendResponse)($,V,new Response(null,{status:500})),null}}e.s(["handler",0,x,"patchFetch",0,function(){return(0,i.patchFetch)({workAsyncStorage:_,workUnitAsyncStorage:w})},"routeModule",0,v,"serverHooks",0,L,"workAsyncStorage",0,_,"workUnitAsyncStorage",0,w]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__0cj8mco._.js.map