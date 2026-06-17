module.exports=[18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},75601,e=>{"use strict";var t=e.i(93458),a=e.i(79832);async function n(){let e=await (0,t.cookies)(),n=e.get("invollve_token")?.value;return n?(0,a.verifyToken)(n):null}e.s(["getSession",0,n])},18520,e=>e.a(async(t,a)=>{try{let t=await e.y("@libsql/client-6da938047d5fc1cd");e.n(t),a()}catch(e){a(e)}},!0),43793,e=>e.a(async(t,a)=>{try{var n=e.i(18520),r=t([n]);[n]=r.then?(await r)():r;let o=process.env.TURSO_DATABASE_URL??"file:/tmp/invollve.db",l=process.env.TURSO_AUTH_TOKEN,T=null;function i(){return T||(T=l?(0,n.createClient)({url:o,authToken:l}):(0,n.createClient)({url:o})),T}let d=[`CREATE TABLE IF NOT EXISTS users (
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
  )`],E=!1;async function s(){if(E)return;let e=i();for(let t of d)await e.execute(t);E=!0}e.s(["default",0,{get:async(e,t=[])=>(await s(),(await i().execute({sql:e,args:t})).rows[0]??null),all:async(e,t=[])=>(await s(),(await i().execute({sql:e,args:t})).rows),run:async(e,t=[])=>(await s(),{lastInsertRowid:(await i().execute({sql:e,args:t})).lastInsertRowid??0})}]),a()}catch(e){a(e)}},!1),1618,e=>e.a(async(t,a)=>{try{var n=e.i(89171),r=e.i(43793),i=e.i(75601),s=t([r]);async function o(){if(!await (0,i.getSession)())return n.NextResponse.json({error:"Não autorizado"},{status:401});let e=await r.default.all("SELECT * FROM clients ORDER BY name");return n.NextResponse.json(e)}async function l(e){let t=await (0,i.getSession)();if(!t||"cliente"===t.role)return n.NextResponse.json({error:"Não autorizado"},{status:403});let{name:a,email:s,phone:o,company:l,notes:T,status:d,meta_account_id:E,meta_account_id2:u,google_ads_id:c,instagram_id:p,logo_url:R}=await e.json(),N=await r.default.run("INSERT INTO clients (name, email, phone, company, notes, status, meta_account_id, meta_account_id2, google_ads_id, instagram_id, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",[a,s,o,l,T,d||"ativo",E||null,u||null,c||null,p||null,R||null]);return n.NextResponse.json({id:N.lastInsertRowid})}async function T(e){let t=await (0,i.getSession)();if(!t||"cliente"===t.role)return n.NextResponse.json({error:"Não autorizado"},{status:403});let{id:a,...s}=await e.json();return await r.default.run("UPDATE clients SET name=?, email=?, phone=?, company=?, notes=?, status=?, meta_account_id=?, meta_account_id2=?, google_ads_id=?, instagram_id=?, logo_url=? WHERE id=?",[s.name,s.email,s.phone,s.company,s.notes,s.status,s.meta_account_id||null,s.meta_account_id2||null,s.google_ads_id||null,s.instagram_id||null,s.logo_url||null,a]),n.NextResponse.json({ok:!0})}async function d(e){let t=await (0,i.getSession)();if(!t||!["socio"].includes(t.role))return n.NextResponse.json({error:"Não autorizado"},{status:403});let{id:a}=await e.json();return await r.default.run("DELETE FROM clients WHERE id = ?",[a]),n.NextResponse.json({ok:!0})}[r]=s.then?(await s)():s,e.s(["DELETE",0,d,"GET",0,o,"POST",0,l,"PUT",0,T]),a()}catch(e){a(e)}},!1),56913,e=>e.a(async(t,a)=>{try{var n=e.i(47909),r=e.i(74017),i=e.i(96250),s=e.i(59756),o=e.i(61916),l=e.i(74677),T=e.i(69741),d=e.i(16795),E=e.i(87718),u=e.i(95169),c=e.i(47587),p=e.i(66012),R=e.i(70101),N=e.i(26937),m=e.i(10372),A=e.i(93695);e.i(52474);var _=e.i(220),h=e.i(1618),w=t([h]);[h]=w.then?(await w)():w;let X=new n.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/clients/route",pathname:"/api/clients",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/clients/route.ts",nextConfigOutput:"",userland:h,...{}}),{workAsyncStorage:g,workUnitAsyncStorage:x,serverHooks:L}=X;async function I(e,t,a){a.requestMeta&&(0,s.setRequestMeta)(e,a.requestMeta),X.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let n="/api/clients/route";n=n.replace(/\/index$/,"")||"/";let i=await X.prepare(e,t,{srcPage:n,multiZoneDraftMode:!1});if(!i)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:h,deploymentId:w,params:I,nextConfig:g,parsedUrl:x,isDraftMode:L,prerenderManifest:v,routerServerContext:U,isOnDemandRevalidate:f,revalidateOnlyGenerated:O,resolvedPathname:y,clientReferenceManifest:C,serverActionsManifest:S}=i,M=(0,T.normalizeAppPath)(n),P=!!(v.dynamicRoutes[M]||v.routes[y]),F=async()=>((null==U?void 0:U.render404)?await U.render404(e,t,x,!1):t.end("This page could not be found"),null);if(P&&!L){let e=!!v.routes[y],t=v.dynamicRoutes[M];if(t&&!1===t.fallback&&!e){if(g.adapterPath)return await F();throw new A.NoFallbackError}}let b=null;!P||X.isDev||L||(b=y,b="/index"===b?"/":b);let D=!0===X.isDev||!P,k=P&&!D;S&&C&&(0,l.setManifestsSingleton)({page:n,clientReferenceManifest:C,serverActionsManifest:S});let j=e.method||"GET",q=(0,o.getTracer)(),G=q.getActiveScopeSpan(),Y=!!(null==U?void 0:U.isWrappedByNextServer),H=!!(0,s.getRequestMeta)(e,"minimalMode"),K=(0,s.getRequestMeta)(e,"incrementalCache")||await X.getIncrementalCache(e,g,v,H);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let B={params:I,previewProps:v.preview,renderOpts:{experimental:{authInterrupts:!!g.experimental.authInterrupts},cacheComponents:!!g.cacheComponents,supportsDynamicResponse:D,incrementalCache:K,cacheLifeProfiles:g.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,n,r)=>X.onRequestError(e,t,n,r,U)},sharedContext:{buildId:h,deploymentId:w}},$=new d.NodeNextRequest(e),z=new d.NodeNextResponse(t),W=E.NextRequestAdapter.fromNodeNextRequest($,(0,E.signalFromNodeResponse)(t));try{let i,s=async e=>X.handle(W,B).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=q.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${j} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t),i&&i!==e&&(i.setAttribute("http.route",r),i.updateName(t))}else e.updateName(`${j} ${n}`)}),l=async i=>{var o,l;let T=async({previousCacheEntry:r})=>{try{if(!H&&f&&O&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await s(i);e.fetchMetrics=B.renderOpts.fetchMetrics;let o=B.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let l=B.renderOpts.collectedTags;if(!P)return await (0,p.sendResponse)($,z,n,B.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,R.toNodeOutgoingHttpHeaders)(n.headers);l&&(t[m.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==B.renderOpts.collectedRevalidate&&!(B.renderOpts.collectedRevalidate>=m.INFINITE_CACHE)&&B.renderOpts.collectedRevalidate,r=void 0===B.renderOpts.collectedExpire||B.renderOpts.collectedExpire>=m.INFINITE_CACHE?void 0:B.renderOpts.collectedExpire;return{value:{kind:_.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==r?void 0:r.isStale)&&await X.onRequestError(e,t,{routerKind:"App Router",routePath:n,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:f})},!1,U),t}},d=await X.handleResponse({req:e,nextConfig:g,cacheKey:b,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:v,isRoutePPREnabled:!1,isOnDemandRevalidate:f,revalidateOnlyGenerated:O,responseGenerator:T,waitUntil:a.waitUntil,isMinimalMode:H});if(!P)return null;if((null==d||null==(o=d.value)?void 0:o.kind)!==_.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(l=d.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});H||t.setHeader("x-nextjs-cache",f?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),L&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let E=(0,R.fromNodeOutgoingHttpHeaders)(d.value.headers);return H&&P||E.delete(m.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||E.get("Cache-Control")||E.set("Cache-Control",(0,N.getCacheControlHeader)(d.cacheControl)),await (0,p.sendResponse)($,z,new Response(d.value.body,{headers:E,status:d.value.status||200})),null};Y&&G?await l(G):(i=q.getActiveScopeSpan(),await q.withPropagatedContext(e.headers,()=>q.trace(u.BaseServerSpan.handleRequest,{spanName:`${j} ${n}`,kind:o.SpanKind.SERVER,attributes:{"http.method":j,"http.target":e.url}},l),void 0,!Y))}catch(t){if(t instanceof A.NoFallbackError||await X.onRequestError(e,t,{routerKind:"App Router",routePath:M,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:f})},!1,U),P)throw t;return await (0,p.sendResponse)($,z,new Response(null,{status:500})),null}}e.s(["handler",0,I,"patchFetch",0,function(){return(0,i.patchFetch)({workAsyncStorage:g,workUnitAsyncStorage:x})},"routeModule",0,X,"serverHooks",0,L,"workAsyncStorage",0,g,"workUnitAsyncStorage",0,x]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__092ztv0._.js.map