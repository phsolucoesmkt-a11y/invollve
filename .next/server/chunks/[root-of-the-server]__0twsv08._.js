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
  )`],d=!1;async function s(){if(d)return;let e=i();for(let t of E)await e.execute(t);d=!0}e.s(["default",0,{get:async(e,t=[])=>(await s(),(await i().execute({sql:e,args:t})).rows[0]??null),all:async(e,t=[])=>(await s(),(await i().execute({sql:e,args:t})).rows),run:async(e,t=[])=>(await s(),{lastInsertRowid:(await i().execute({sql:e,args:t})).lastInsertRowid??0})}]),a()}catch(e){a(e)}},!1),54799,(e,t,a)=>{t.exports=e.x("crypto",()=>require("crypto"))},89839,e=>e.a(async(t,a)=>{try{var r=e.i(89171),n=e.i(43793),i=e.i(75601),s=e.i(49632),o=t([n]);async function T(e){let t=await (0,i.getSession)();if(!t)return r.NextResponse.json({error:"Não autorizado"},{status:401});let{name:a,phone:o,birthday:T,avatar_url:l,current_password:E,new_password:d}=await e.json();if(await n.default.run("UPDATE users SET name=?, phone=?, birthday=?, avatar_url=? WHERE id=?",[a,o||null,T||null,l||null,t.id]),T&&(await n.default.get("SELECT id FROM rh_people WHERE email = ?",[t.email])?await n.default.run("UPDATE rh_people SET birthday=?, name=? WHERE email=?",[T,a,t.email]):await n.default.run("INSERT INTO rh_people (name, role, birthday, email) VALUES (?, ?, ?, ?)",[a,"Equipe",T,t.email])),E&&d){let e=await n.default.get("SELECT password FROM users WHERE id=?",[t.id]);if(!await s.default.compare(E,e.password))return r.NextResponse.json({error:"Senha atual incorreta"},{status:400});let a=await s.default.hash(d,10);await n.default.run("UPDATE users SET password=? WHERE id=?",[a,t.id])}return r.NextResponse.json({ok:!0})}async function l(){let e=await (0,i.getSession)();if(!e)return r.NextResponse.json({error:"Não autorizado"},{status:401});let t=await n.default.get("SELECT id, name, email, role, phone, birthday, avatar_url FROM users WHERE id=?",[e.id]);return r.NextResponse.json(t)}[n]=o.then?(await o)():o,e.s(["GET",0,l,"PUT",0,T]),a()}catch(e){a(e)}},!1),54273,e=>e.a(async(t,a)=>{try{var r=e.i(47909),n=e.i(74017),i=e.i(96250),s=e.i(59756),o=e.i(61916),T=e.i(74677),l=e.i(69741),E=e.i(16795),d=e.i(87718),u=e.i(95169),c=e.i(47587),p=e.i(66012),R=e.i(70101),N=e.i(26937),A=e.i(10372),h=e.i(93695);e.i(52474);var m=e.i(220),w=e.i(89839),I=t([w]);[w]=I.then?(await I)():I;let f=new r.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/profile/route",pathname:"/api/profile",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/profile/route.ts",nextConfigOutput:"",userland:w,...{}}),{workAsyncStorage:v,workUnitAsyncStorage:x,serverHooks:L}=f;async function X(e,t,a){a.requestMeta&&(0,s.setRequestMeta)(e,a.requestMeta),f.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/profile/route";r=r.replace(/\/index$/,"")||"/";let i=await f.prepare(e,t,{srcPage:r,multiZoneDraftMode:!1});if(!i)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:w,deploymentId:I,params:X,nextConfig:v,parsedUrl:x,isDraftMode:L,prerenderManifest:U,routerServerContext:_,isOnDemandRevalidate:y,revalidateOnlyGenerated:O,resolvedPathname:g,clientReferenceManifest:C,serverActionsManifest:S}=i,b=(0,l.normalizeAppPath)(r),M=!!(U.dynamicRoutes[b]||U.routes[g]),P=async()=>((null==_?void 0:_.render404)?await _.render404(e,t,x,!1):t.end("This page could not be found"),null);if(M&&!L){let e=!!U.routes[g],t=U.dynamicRoutes[b];if(t&&!1===t.fallback&&!e){if(v.adapterPath)return await P();throw new h.NoFallbackError}}let F=null;!M||f.isDev||L||(F=g,F="/index"===F?"/":F);let D=!0===f.isDev||!M,k=M&&!D;S&&C&&(0,T.setManifestsSingleton)({page:r,clientReferenceManifest:C,serverActionsManifest:S});let q=e.method||"GET",H=(0,o.getTracer)(),j=H.getActiveScopeSpan(),G=!!(null==_?void 0:_.isWrappedByNextServer),Y=!!(0,s.getRequestMeta)(e,"minimalMode"),K=(0,s.getRequestMeta)(e,"incrementalCache")||await f.getIncrementalCache(e,v,U,Y);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let B={params:X,previewProps:U.preview,renderOpts:{experimental:{authInterrupts:!!v.experimental.authInterrupts},cacheComponents:!!v.cacheComponents,supportsDynamicResponse:D,incrementalCache:K,cacheLifeProfiles:v.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>f.onRequestError(e,t,r,n,_)},sharedContext:{buildId:w,deploymentId:I}},W=new E.NodeNextRequest(e),$=new E.NodeNextResponse(t),V=d.NextRequestAdapter.fromNodeNextRequest(W,(0,d.signalFromNodeResponse)(t));try{let i,s=async e=>f.handle(V,B).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=H.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=a.get("next.route");if(n){let t=`${q} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t),i&&i!==e&&(i.setAttribute("http.route",n),i.updateName(t))}else e.updateName(`${q} ${r}`)}),T=async i=>{var o,T;let l=async({previousCacheEntry:n})=>{try{if(!Y&&y&&O&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await s(i);e.fetchMetrics=B.renderOpts.fetchMetrics;let o=B.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let T=B.renderOpts.collectedTags;if(!M)return await (0,p.sendResponse)(W,$,r,B.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,R.toNodeOutgoingHttpHeaders)(r.headers);T&&(t[A.NEXT_CACHE_TAGS_HEADER]=T),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==B.renderOpts.collectedRevalidate&&!(B.renderOpts.collectedRevalidate>=A.INFINITE_CACHE)&&B.renderOpts.collectedRevalidate,n=void 0===B.renderOpts.collectedExpire||B.renderOpts.collectedExpire>=A.INFINITE_CACHE?void 0:B.renderOpts.collectedExpire;return{value:{kind:m.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:n}}}}catch(t){throw(null==n?void 0:n.isStale)&&await f.onRequestError(e,t,{routerKind:"App Router",routePath:r,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:y})},!1,_),t}},E=await f.handleResponse({req:e,nextConfig:v,cacheKey:F,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:U,isRoutePPREnabled:!1,isOnDemandRevalidate:y,revalidateOnlyGenerated:O,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:Y});if(!M)return null;if((null==E||null==(o=E.value)?void 0:o.kind)!==m.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==E||null==(T=E.value)?void 0:T.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});Y||t.setHeader("x-nextjs-cache",y?"REVALIDATED":E.isMiss?"MISS":E.isStale?"STALE":"HIT"),L&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let d=(0,R.fromNodeOutgoingHttpHeaders)(E.value.headers);return Y&&M||d.delete(A.NEXT_CACHE_TAGS_HEADER),!E.cacheControl||t.getHeader("Cache-Control")||d.get("Cache-Control")||d.set("Cache-Control",(0,N.getCacheControlHeader)(E.cacheControl)),await (0,p.sendResponse)(W,$,new Response(E.value.body,{headers:d,status:E.value.status||200})),null};G&&j?await T(j):(i=H.getActiveScopeSpan(),await H.withPropagatedContext(e.headers,()=>H.trace(u.BaseServerSpan.handleRequest,{spanName:`${q} ${r}`,kind:o.SpanKind.SERVER,attributes:{"http.method":q,"http.target":e.url}},T),void 0,!G))}catch(t){if(t instanceof h.NoFallbackError||await f.onRequestError(e,t,{routerKind:"App Router",routePath:b,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:y})},!1,_),M)throw t;return await (0,p.sendResponse)(W,$,new Response(null,{status:500})),null}}e.s(["handler",0,X,"patchFetch",0,function(){return(0,i.patchFetch)({workAsyncStorage:v,workUnitAsyncStorage:x})},"routeModule",0,f,"serverHooks",0,L,"workAsyncStorage",0,v,"workUnitAsyncStorage",0,x]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__0twsv08._.js.map