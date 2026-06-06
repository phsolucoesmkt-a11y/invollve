module.exports=[18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},75601,e=>{"use strict";var t=e.i(93458),a=e.i(79832);async function n(){let e=await (0,t.cookies)(),n=e.get("invollve_token")?.value;return n?(0,a.verifyToken)(n):null}e.s(["getSession",0,n])},18520,e=>e.a(async(t,a)=>{try{let t=await e.y("@libsql/client-6da938047d5fc1cd");e.n(t),a()}catch(e){a(e)}},!0),43793,e=>e.a(async(t,a)=>{try{var n=e.i(18520),r=t([n]);[n]=r.then?(await r)():r;let o=process.env.TURSO_DATABASE_URL??"file:/tmp/invollve.db",l=process.env.TURSO_AUTH_TOKEN,T=null;function i(){return T||(T=l?(0,n.createClient)({url:o,authToken:l}):(0,n.createClient)({url:o})),T}let E=[`CREATE TABLE IF NOT EXISTS users (
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
  )`],d=!1;async function s(){if(d)return;let e=i();for(let t of E)await e.execute(t);d=!0}e.s(["default",0,{get:async(e,t=[])=>(await s(),(await i().execute({sql:e,args:t})).rows[0]??null),all:async(e,t=[])=>(await s(),(await i().execute({sql:e,args:t})).rows),run:async(e,t=[])=>(await s(),{lastInsertRowid:(await i().execute({sql:e,args:t})).lastInsertRowid??0})}]),a()}catch(e){a(e)}},!1),33323,e=>e.a(async(t,a)=>{try{var n=e.i(89171),r=e.i(43793),i=e.i(75601),s=t([r]);async function o(){let e=await (0,i.getSession)();if(!e||"cliente"===e.role)return n.NextResponse.json({error:"Não autorizado"},{status:403});let t=await r.default.all(`
    SELECT l.*, u.name as responsible_name FROM leads l
    LEFT JOIN users u ON l.responsible_id = u.id
    ORDER BY l.created_at DESC
  `);return n.NextResponse.json(t)}async function l(e){let t=await (0,i.getSession)();if(!t||"cliente"===t.role)return n.NextResponse.json({error:"Não autorizado"},{status:403});let{name:a,company:s,email:o,phone:l,stage:T,value:E,notes:d,responsible_id:u}=await e.json(),c=await r.default.run("INSERT INTO leads (name, company, email, phone, stage, value, notes, responsible_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",[a,s,o,l,T||"prospeccao",E||null,d,u||null]);return n.NextResponse.json({id:c.lastInsertRowid})}async function T(e){let t=await (0,i.getSession)();if(!t||"cliente"===t.role)return n.NextResponse.json({error:"Não autorizado"},{status:403});let{id:a,...s}=await e.json();return await r.default.run("UPDATE leads SET name=?, company=?, email=?, phone=?, stage=?, value=?, notes=?, responsible_id=? WHERE id=?",[s.name,s.company,s.email,s.phone,s.stage,s.value||null,s.notes,s.responsible_id||null,a]),n.NextResponse.json({ok:!0})}async function E(e){let t=await (0,i.getSession)();if(!t||"cliente"===t.role)return n.NextResponse.json({error:"Não autorizado"},{status:403});let{id:a}=await e.json();return await r.default.run("DELETE FROM leads WHERE id = ?",[a]),n.NextResponse.json({ok:!0})}[r]=s.then?(await s)():s,e.s(["DELETE",0,E,"GET",0,o,"POST",0,l,"PUT",0,T]),a()}catch(e){a(e)}},!1),98487,e=>e.a(async(t,a)=>{try{var n=e.i(47909),r=e.i(74017),i=e.i(96250),s=e.i(59756),o=e.i(61916),l=e.i(74677),T=e.i(69741),E=e.i(16795),d=e.i(87718),u=e.i(95169),c=e.i(47587),p=e.i(66012),R=e.i(70101),N=e.i(26937),A=e.i(10372),m=e.i(93695);e.i(52474);var h=e.i(220),w=e.i(33323),I=t([w]);[w]=I.then?(await I)():I;let v=new n.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/comercial/route",pathname:"/api/comercial",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/comercial/route.ts",nextConfigOutput:"",userland:w,...{}}),{workAsyncStorage:x,workUnitAsyncStorage:L,serverHooks:_}=v;async function X(e,t,a){a.requestMeta&&(0,s.setRequestMeta)(e,a.requestMeta),v.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let n="/api/comercial/route";n=n.replace(/\/index$/,"")||"/";let i=await v.prepare(e,t,{srcPage:n,multiZoneDraftMode:!1});if(!i)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:w,deploymentId:I,params:X,nextConfig:x,parsedUrl:L,isDraftMode:_,prerenderManifest:O,routerServerContext:U,isOnDemandRevalidate:f,revalidateOnlyGenerated:g,resolvedPathname:y,clientReferenceManifest:C,serverActionsManifest:S}=i,b=(0,T.normalizeAppPath)(n),F=!!(O.dynamicRoutes[b]||O.routes[y]),M=async()=>((null==U?void 0:U.render404)?await U.render404(e,t,L,!1):t.end("This page could not be found"),null);if(F&&!_){let e=!!O.routes[y],t=O.dynamicRoutes[b];if(t&&!1===t.fallback&&!e){if(x.adapterPath)return await M();throw new m.NoFallbackError}}let P=null;!F||v.isDev||_||(P=y,P="/index"===P?"/":P);let D=!0===v.isDev||!F,k=F&&!D;S&&C&&(0,l.setManifestsSingleton)({page:n,clientReferenceManifest:C,serverActionsManifest:S});let j=e.method||"GET",q=(0,o.getTracer)(),G=q.getActiveScopeSpan(),Y=!!(null==U?void 0:U.isWrappedByNextServer),H=!!(0,s.getRequestMeta)(e,"minimalMode"),K=(0,s.getRequestMeta)(e,"incrementalCache")||await v.getIncrementalCache(e,x,O,H);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let B={params:X,previewProps:O.preview,renderOpts:{experimental:{authInterrupts:!!x.experimental.authInterrupts},cacheComponents:!!x.cacheComponents,supportsDynamicResponse:D,incrementalCache:K,cacheLifeProfiles:x.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,n,r)=>v.onRequestError(e,t,n,r,U)},sharedContext:{buildId:w,deploymentId:I}},$=new E.NodeNextRequest(e),z=new E.NodeNextResponse(t),W=d.NextRequestAdapter.fromNodeNextRequest($,(0,d.signalFromNodeResponse)(t));try{let i,s=async e=>v.handle(W,B).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=q.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${j} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t),i&&i!==e&&(i.setAttribute("http.route",r),i.updateName(t))}else e.updateName(`${j} ${n}`)}),l=async i=>{var o,l;let T=async({previousCacheEntry:r})=>{try{if(!H&&f&&g&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await s(i);e.fetchMetrics=B.renderOpts.fetchMetrics;let o=B.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let l=B.renderOpts.collectedTags;if(!F)return await (0,p.sendResponse)($,z,n,B.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,R.toNodeOutgoingHttpHeaders)(n.headers);l&&(t[A.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==B.renderOpts.collectedRevalidate&&!(B.renderOpts.collectedRevalidate>=A.INFINITE_CACHE)&&B.renderOpts.collectedRevalidate,r=void 0===B.renderOpts.collectedExpire||B.renderOpts.collectedExpire>=A.INFINITE_CACHE?void 0:B.renderOpts.collectedExpire;return{value:{kind:h.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==r?void 0:r.isStale)&&await v.onRequestError(e,t,{routerKind:"App Router",routePath:n,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:f})},!1,U),t}},E=await v.handleResponse({req:e,nextConfig:x,cacheKey:P,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:O,isRoutePPREnabled:!1,isOnDemandRevalidate:f,revalidateOnlyGenerated:g,responseGenerator:T,waitUntil:a.waitUntil,isMinimalMode:H});if(!F)return null;if((null==E||null==(o=E.value)?void 0:o.kind)!==h.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==E||null==(l=E.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});H||t.setHeader("x-nextjs-cache",f?"REVALIDATED":E.isMiss?"MISS":E.isStale?"STALE":"HIT"),_&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let d=(0,R.fromNodeOutgoingHttpHeaders)(E.value.headers);return H&&F||d.delete(A.NEXT_CACHE_TAGS_HEADER),!E.cacheControl||t.getHeader("Cache-Control")||d.get("Cache-Control")||d.set("Cache-Control",(0,N.getCacheControlHeader)(E.cacheControl)),await (0,p.sendResponse)($,z,new Response(E.value.body,{headers:d,status:E.value.status||200})),null};Y&&G?await l(G):(i=q.getActiveScopeSpan(),await q.withPropagatedContext(e.headers,()=>q.trace(u.BaseServerSpan.handleRequest,{spanName:`${j} ${n}`,kind:o.SpanKind.SERVER,attributes:{"http.method":j,"http.target":e.url}},l),void 0,!Y))}catch(t){if(t instanceof m.NoFallbackError||await v.onRequestError(e,t,{routerKind:"App Router",routePath:b,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:f})},!1,U),F)throw t;return await (0,p.sendResponse)($,z,new Response(null,{status:500})),null}}e.s(["handler",0,X,"patchFetch",0,function(){return(0,i.patchFetch)({workAsyncStorage:x,workUnitAsyncStorage:L})},"routeModule",0,v,"serverHooks",0,_,"workAsyncStorage",0,x,"workUnitAsyncStorage",0,L]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__0vwiwjr._.js.map