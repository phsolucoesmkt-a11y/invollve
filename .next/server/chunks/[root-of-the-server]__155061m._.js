module.exports=[93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18520,e=>e.a(async(t,a)=>{try{let t=await e.y("@libsql/client-6da938047d5fc1cd");e.n(t),a()}catch(e){a(e)}},!0),43793,e=>e.a(async(t,a)=>{try{var r=e.i(18520),n=t([r]);[r]=n.then?(await n)():n;let o=process.env.TURSO_DATABASE_URL??"file:/tmp/invollve.db",T=process.env.TURSO_AUTH_TOKEN,l=null;function i(){return l||(l=T?(0,r.createClient)({url:o,authToken:T}):(0,r.createClient)({url:o})),l}let d=[`CREATE TABLE IF NOT EXISTS users (
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
  )`],E=!1;async function s(){if(E)return;let e=i();for(let t of d)await e.execute(t);E=!0}e.s(["default",0,{get:async(e,t=[])=>(await s(),(await i().execute({sql:e,args:t})).rows[0]??null),all:async(e,t=[])=>(await s(),(await i().execute({sql:e,args:t})).rows),run:async(e,t=[])=>(await s(),{lastInsertRowid:(await i().execute({sql:e,args:t})).lastInsertRowid??0})}]),a()}catch(e){a(e)}},!1),54799,(e,t,a)=>{t.exports=e.x("crypto",()=>require("crypto"))},67299,e=>e.a(async(t,a)=>{try{var r=e.i(89171),n=e.i(43793),i=e.i(49632),s=t([n]);async function o(){let e=await n.default.get("SELECT COUNT(*) as c FROM users"),t=e?.c??0;if(t>0)return r.NextResponse.json({message:"Banco já inicializado",users:t});let a=await i.default.hash("invollve2024",10);return await n.default.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",["Alexandre","admin@invollve.com.br",a,"socio"]),r.NextResponse.json({ok:!0,message:"Usuário admin criado!",email:"admin@invollve.com.br",senha:"invollve2024"})}[n]=s.then?(await s)():s,e.s(["GET",0,o]),a()}catch(e){a(e)}},!1),44766,e=>e.a(async(t,a)=>{try{var r=e.i(47909),n=e.i(74017),i=e.i(96250),s=e.i(59756),o=e.i(61916),T=e.i(74677),l=e.i(69741),d=e.i(16795),E=e.i(87718),c=e.i(95169),u=e.i(47587),p=e.i(66012),R=e.i(70101),N=e.i(26937),A=e.i(10372),h=e.i(93695);e.i(52474);var m=e.i(220),I=e.i(67299),X=t([I]);[I]=X.then?(await X)():X;let x=new r.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/seed/route",pathname:"/api/seed",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/seed/route.ts",nextConfigOutput:"",userland:I,...{}}),{workAsyncStorage:L,workUnitAsyncStorage:w,serverHooks:U}=x;async function v(e,t,a){a.requestMeta&&(0,s.setRequestMeta)(e,a.requestMeta),x.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/seed/route";r=r.replace(/\/index$/,"")||"/";let i=await x.prepare(e,t,{srcPage:r,multiZoneDraftMode:!1});if(!i)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:I,deploymentId:X,params:v,nextConfig:L,parsedUrl:w,isDraftMode:U,prerenderManifest:O,routerServerContext:_,isOnDemandRevalidate:g,revalidateOnlyGenerated:C,resolvedPathname:f,clientReferenceManifest:y,serverActionsManifest:S}=i,b=(0,l.normalizeAppPath)(r),M=!!(O.dynamicRoutes[b]||O.routes[f]),F=async()=>((null==_?void 0:_.render404)?await _.render404(e,t,w,!1):t.end("This page could not be found"),null);if(M&&!U){let e=!!O.routes[f],t=O.dynamicRoutes[b];if(t&&!1===t.fallback&&!e){if(L.adapterPath)return await F();throw new h.NoFallbackError}}let P=null;!M||x.isDev||U||(P=f,P="/index"===P?"/":P);let D=!0===x.isDev||!M,q=M&&!D;S&&y&&(0,T.setManifestsSingleton)({page:r,clientReferenceManifest:y,serverActionsManifest:S});let k=e.method||"GET",G=(0,o.getTracer)(),j=G.getActiveScopeSpan(),Y=!!(null==_?void 0:_.isWrappedByNextServer),K=!!(0,s.getRequestMeta)(e,"minimalMode"),B=(0,s.getRequestMeta)(e,"incrementalCache")||await x.getIncrementalCache(e,L,O,K);null==B||B.resetRequestCache(),globalThis.__incrementalCache=B;let H={params:v,previewProps:O.preview,renderOpts:{experimental:{authInterrupts:!!L.experimental.authInterrupts},cacheComponents:!!L.cacheComponents,supportsDynamicResponse:D,incrementalCache:B,cacheLifeProfiles:L.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>x.onRequestError(e,t,r,n,_)},sharedContext:{buildId:I,deploymentId:X}},$=new d.NodeNextRequest(e),V=new d.NodeNextResponse(t),W=E.NextRequestAdapter.fromNodeNextRequest($,(0,E.signalFromNodeResponse)(t));try{let i,s=async e=>x.handle(W,H).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=G.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=a.get("next.route");if(n){let t=`${k} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t),i&&i!==e&&(i.setAttribute("http.route",n),i.updateName(t))}else e.updateName(`${k} ${r}`)}),T=async i=>{var o,T;let l=async({previousCacheEntry:n})=>{try{if(!K&&g&&C&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await s(i);e.fetchMetrics=H.renderOpts.fetchMetrics;let o=H.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let T=H.renderOpts.collectedTags;if(!M)return await (0,p.sendResponse)($,V,r,H.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,R.toNodeOutgoingHttpHeaders)(r.headers);T&&(t[A.NEXT_CACHE_TAGS_HEADER]=T),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==H.renderOpts.collectedRevalidate&&!(H.renderOpts.collectedRevalidate>=A.INFINITE_CACHE)&&H.renderOpts.collectedRevalidate,n=void 0===H.renderOpts.collectedExpire||H.renderOpts.collectedExpire>=A.INFINITE_CACHE?void 0:H.renderOpts.collectedExpire;return{value:{kind:m.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:n}}}}catch(t){throw(null==n?void 0:n.isStale)&&await x.onRequestError(e,t,{routerKind:"App Router",routePath:r,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:g})},!1,_),t}},d=await x.handleResponse({req:e,nextConfig:L,cacheKey:P,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:O,isRoutePPREnabled:!1,isOnDemandRevalidate:g,revalidateOnlyGenerated:C,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:K});if(!M)return null;if((null==d||null==(o=d.value)?void 0:o.kind)!==m.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(T=d.value)?void 0:T.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});K||t.setHeader("x-nextjs-cache",g?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),U&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let E=(0,R.fromNodeOutgoingHttpHeaders)(d.value.headers);return K&&M||E.delete(A.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||E.get("Cache-Control")||E.set("Cache-Control",(0,N.getCacheControlHeader)(d.cacheControl)),await (0,p.sendResponse)($,V,new Response(d.value.body,{headers:E,status:d.value.status||200})),null};Y&&j?await T(j):(i=G.getActiveScopeSpan(),await G.withPropagatedContext(e.headers,()=>G.trace(c.BaseServerSpan.handleRequest,{spanName:`${k} ${r}`,kind:o.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},T),void 0,!Y))}catch(t){if(t instanceof h.NoFallbackError||await x.onRequestError(e,t,{routerKind:"App Router",routePath:b,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:g})},!1,_),M)throw t;return await (0,p.sendResponse)($,V,new Response(null,{status:500})),null}}e.s(["handler",0,v,"patchFetch",0,function(){return(0,i.patchFetch)({workAsyncStorage:L,workUnitAsyncStorage:w})},"routeModule",0,x,"serverHooks",0,U,"workAsyncStorage",0,L,"workUnitAsyncStorage",0,w]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__155061m._.js.map