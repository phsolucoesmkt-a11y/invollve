module.exports=[18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18520,e=>e.a(async(t,a)=>{try{let t=await e.y("@libsql/client-6da938047d5fc1cd");e.n(t),a()}catch(e){a(e)}},!0),43793,e=>e.a(async(t,a)=>{try{var r=e.i(18520),n=t([r]);[r]=n.then?(await n)():n;let s=process.env.TURSO_DATABASE_URL??"file:/tmp/invollve.db",T=process.env.TURSO_AUTH_TOKEN,l=null;function i(){return l||(l=T?(0,r.createClient)({url:s,authToken:T}):(0,r.createClient)({url:s})),l}let d=[`CREATE TABLE IF NOT EXISTS users (
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
  )`],E=!1;async function o(){if(E)return;let e=i();for(let t of d)await e.execute(t);E=!0}e.s(["default",0,{get:async(e,t=[])=>(await o(),(await i().execute({sql:e,args:t})).rows[0]??null),all:async(e,t=[])=>(await o(),(await i().execute({sql:e,args:t})).rows),run:async(e,t=[])=>(await o(),{lastInsertRowid:(await i().execute({sql:e,args:t})).lastInsertRowid??0})}]),a()}catch(e){a(e)}},!1),54799,(e,t,a)=>{t.exports=e.x("crypto",()=>require("crypto"))},92099,e=>e.a(async(t,a)=>{try{var r=e.i(43793),n=e.i(49632),i=t([r]);async function o(){if(await r.default.get("SELECT id FROM users WHERE email = ?",["admin@invollve.com"]))return;let e=await n.default.hash("invollve2024",10);await r.default.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",["Administrador","admin@invollve.com",e,"socio"]),console.log("Admin criado: admin@invollve.com / invollve2024")}[r]=i.then?(await i)():i,e.s(["seedAdmin",0,o]),a()}catch(e){a(e)}},!1),11615,e=>e.a(async(t,a)=>{try{var r=e.i(89171),n=e.i(43793),i=e.i(92099),o=e.i(49632),s=e.i(79832),T=e.i(93458),l=t([n,i]);async function d(e){await (0,i.seedAdmin)();let{email:t,password:a}=await e.json(),l=await n.default.get("SELECT * FROM users WHERE email = ?",[t]);if(!l||!await o.default.compare(a,l.password))return r.NextResponse.json({error:"Email ou senha inválidos"},{status:401});let d={id:l.id,name:l.name,email:l.email,role:l.role},E=await (0,s.createToken)(d);return(await (0,T.cookies)()).set("invollve_token",E,{httpOnly:!0,secure:!0,sameSite:"lax",maxAge:604800,path:"/"}),r.NextResponse.json({role:l.role,name:l.name})}[n,i]=l.then?(await l)():l,e.s(["POST",0,d]),a()}catch(e){a(e)}},!1),30450,e=>e.a(async(t,a)=>{try{var r=e.i(47909),n=e.i(74017),i=e.i(96250),o=e.i(59756),s=e.i(61916),T=e.i(74677),l=e.i(69741),d=e.i(16795),E=e.i(87718),c=e.i(95169),u=e.i(47587),p=e.i(66012),R=e.i(70101),N=e.i(26937),m=e.i(10372),A=e.i(93695);e.i(52474);var h=e.i(220),v=e.i(11615),w=t([v]);[v]=w.then?(await w)():w;let X=new r.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/auth/login/route",pathname:"/api/auth/login",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/auth/login/route.ts",nextConfigOutput:"",userland:v,...{}}),{workAsyncStorage:x,workUnitAsyncStorage:L,serverHooks:O}=X;async function I(e,t,a){a.requestMeta&&(0,o.setRequestMeta)(e,a.requestMeta),X.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/auth/login/route";r=r.replace(/\/index$/,"")||"/";let i=await X.prepare(e,t,{srcPage:r,multiZoneDraftMode:!1});if(!i)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:v,deploymentId:w,params:I,nextConfig:x,parsedUrl:L,isDraftMode:O,prerenderManifest:U,routerServerContext:g,isOnDemandRevalidate:_,revalidateOnlyGenerated:f,resolvedPathname:y,clientReferenceManifest:C,serverActionsManifest:S}=i,M=(0,l.normalizeAppPath)(r),F=!!(U.dynamicRoutes[M]||U.routes[y]),b=async()=>((null==g?void 0:g.render404)?await g.render404(e,t,L,!1):t.end("This page could not be found"),null);if(F&&!O){let e=!!U.routes[y],t=U.dynamicRoutes[M];if(t&&!1===t.fallback&&!e){if(x.adapterPath)return await b();throw new A.NoFallbackError}}let P=null;!F||X.isDev||O||(P=y,P="/index"===P?"/":P);let D=!0===X.isDev||!F,k=F&&!D;S&&C&&(0,T.setManifestsSingleton)({page:r,clientReferenceManifest:C,serverActionsManifest:S});let q=e.method||"GET",G=(0,s.getTracer)(),j=G.getActiveScopeSpan(),H=!!(null==g?void 0:g.isWrappedByNextServer),Y=!!(0,o.getRequestMeta)(e,"minimalMode"),K=(0,o.getRequestMeta)(e,"incrementalCache")||await X.getIncrementalCache(e,x,U,Y);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let B={params:I,previewProps:U.preview,renderOpts:{experimental:{authInterrupts:!!x.experimental.authInterrupts},cacheComponents:!!x.cacheComponents,supportsDynamicResponse:D,incrementalCache:K,cacheLifeProfiles:x.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>X.onRequestError(e,t,r,n,g)},sharedContext:{buildId:v,deploymentId:w}},$=new d.NodeNextRequest(e),W=new d.NodeNextResponse(t),V=E.NextRequestAdapter.fromNodeNextRequest($,(0,E.signalFromNodeResponse)(t));try{let i,o=async e=>X.handle(V,B).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=G.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=a.get("next.route");if(n){let t=`${q} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t),i&&i!==e&&(i.setAttribute("http.route",n),i.updateName(t))}else e.updateName(`${q} ${r}`)}),T=async i=>{var s,T;let l=async({previousCacheEntry:n})=>{try{if(!Y&&_&&f&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await o(i);e.fetchMetrics=B.renderOpts.fetchMetrics;let s=B.renderOpts.pendingWaitUntil;s&&a.waitUntil&&(a.waitUntil(s),s=void 0);let T=B.renderOpts.collectedTags;if(!F)return await (0,p.sendResponse)($,W,r,B.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,R.toNodeOutgoingHttpHeaders)(r.headers);T&&(t[m.NEXT_CACHE_TAGS_HEADER]=T),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==B.renderOpts.collectedRevalidate&&!(B.renderOpts.collectedRevalidate>=m.INFINITE_CACHE)&&B.renderOpts.collectedRevalidate,n=void 0===B.renderOpts.collectedExpire||B.renderOpts.collectedExpire>=m.INFINITE_CACHE?void 0:B.renderOpts.collectedExpire;return{value:{kind:h.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:n}}}}catch(t){throw(null==n?void 0:n.isStale)&&await X.onRequestError(e,t,{routerKind:"App Router",routePath:r,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:_})},!1,g),t}},d=await X.handleResponse({req:e,nextConfig:x,cacheKey:P,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:U,isRoutePPREnabled:!1,isOnDemandRevalidate:_,revalidateOnlyGenerated:f,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:Y});if(!F)return null;if((null==d||null==(s=d.value)?void 0:s.kind)!==h.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(T=d.value)?void 0:T.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});Y||t.setHeader("x-nextjs-cache",_?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),O&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let E=(0,R.fromNodeOutgoingHttpHeaders)(d.value.headers);return Y&&F||E.delete(m.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||E.get("Cache-Control")||E.set("Cache-Control",(0,N.getCacheControlHeader)(d.cacheControl)),await (0,p.sendResponse)($,W,new Response(d.value.body,{headers:E,status:d.value.status||200})),null};H&&j?await T(j):(i=G.getActiveScopeSpan(),await G.withPropagatedContext(e.headers,()=>G.trace(c.BaseServerSpan.handleRequest,{spanName:`${q} ${r}`,kind:s.SpanKind.SERVER,attributes:{"http.method":q,"http.target":e.url}},T),void 0,!H))}catch(t){if(t instanceof A.NoFallbackError||await X.onRequestError(e,t,{routerKind:"App Router",routePath:M,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:_})},!1,g),F)throw t;return await (0,p.sendResponse)($,W,new Response(null,{status:500})),null}}e.s(["handler",0,I,"patchFetch",0,function(){return(0,i.patchFetch)({workAsyncStorage:x,workUnitAsyncStorage:L})},"routeModule",0,X,"serverHooks",0,O,"workAsyncStorage",0,x,"workUnitAsyncStorage",0,L]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__05tl9vi._.js.map