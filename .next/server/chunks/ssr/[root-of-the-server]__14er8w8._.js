module.exports=[93695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18520,a=>a.a(async(b,c)=>{try{let b=await a.y("@libsql/client-6da938047d5fc1cd");a.n(b),c()}catch(a){c(a)}},!0),61469,a=>a.a(async(b,c)=>{try{var d=a.i(18520),e=b([d]);[d]=e.then?(await e)():e;let h=process.env.TURSO_DATABASE_URL??"file:/tmp/invollve.db",i=process.env.TURSO_AUTH_TOKEN,j=null;function f(){return j||(j=i?(0,d.createClient)({url:h,authToken:i}):(0,d.createClient)({url:h})),j}let k=[`CREATE TABLE IF NOT EXISTS users (
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
  )`],l=!1;async function g(){if(l)return;let a=f();for(let b of k)await a.execute(b);l=!0}a.s(["default",0,{get:async(a,b=[])=>(await g(),(await f().execute({sql:a,args:b})).rows[0]??null),all:async(a,b=[])=>(await g(),(await f().execute({sql:a,args:b})).rows),run:async(a,b=[])=>(await g(),{lastInsertRowid:(await f().execute({sql:a,args:b})).lastInsertRowid??0})}]),c()}catch(a){c(a)}},!1),10585,a=>{a.v("/_next/static/media/favicon.2vob68tjqpejf.ico"+(globalThis.NEXT_CLIENT_ASSET_SUFFIX||""))},68611,a=>{"use strict";let b={src:a.i(10585).default,width:256,height:256};a.s(["default",0,b])},99123,a=>a.a(async(b,c)=>{try{var d=a.i(7997),e=a.i(82241),f=a.i(61469),g=b([f]);async function h(){let a=await (0,e.getSession)(),b=await f.default.get("SELECT COUNT(*) as c FROM clients"),c=b?.c??0,g=await f.default.get("SELECT COUNT(*) as c FROM tasks WHERE status != 'done'"),h=g?.c??0,i=await f.default.all(`
    SELECT name, birthday FROM rh_people
    WHERE birthday IS NOT NULL AND birthday != ''
    AND strftime('%m-%d', birthday) >= strftime('%m-%d', 'now')
    AND strftime('%m-%d', birthday) <= strftime('%m-%d', 'now', '+30 days')
    ORDER BY strftime('%m-%d', birthday)
    LIMIT 5
  `),j=await f.default.all(`
    SELECT * FROM meetings WHERE start_time >= datetime('now') ORDER BY start_time LIMIT 3
  `),k=[{label:"Clientes Ativos",value:c,icon:"👥"},{label:"Tarefas Pendentes",value:h,icon:"✅"},{label:"Reuniões Agendadas",value:j.length,icon:"📅"}];return(0,d.jsxs)("div",{className:"max-w-5xl",children:[(0,d.jsxs)("div",{className:"mb-8",children:[(0,d.jsxs)("h1",{className:"text-[26px] font-black tracking-tight text-white",children:["Olá, ",(0,d.jsx)("span",{className:"gradient-text",children:a?.name?.split(" ")[0]}),"! 👋"]}),(0,d.jsx)("p",{className:"text-[var(--muted)] mt-1",children:"Aqui está o resumo da sua agência hoje."})]}),(0,d.jsx)("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4 mb-6",children:k.map(a=>(0,d.jsxs)("div",{className:"card card-hover p-5 relative overflow-hidden",children:[(0,d.jsxs)("div",{className:"flex items-center justify-between",children:[(0,d.jsx)("p",{className:"text-[var(--muted)] text-sm",children:a.label}),(0,d.jsx)("div",{className:"w-9 h-9 rounded-xl flex items-center justify-center text-lg",style:{background:"var(--grad-soft)"},children:a.icon})]}),(0,d.jsx)("p",{className:"text-4xl font-black text-white mt-3 tracking-tight",children:a.value}),(0,d.jsx)("span",{className:"absolute left-0 bottom-0 h-[3px] w-full opacity-70",style:{background:"var(--grad)"}})]},a.label))}),(0,d.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[i.length>0&&(0,d.jsxs)("div",{className:"card p-5",children:[(0,d.jsxs)("h2",{className:"font-bold text-white mb-4 flex items-center gap-2",children:[(0,d.jsx)("span",{children:"🎂"})," Aniversários nos próximos 30 dias"]}),(0,d.jsx)("div",{className:"space-y-1",children:i.map(a=>(0,d.jsxs)("div",{className:"flex items-center justify-between rounded-lg px-2 py-2 hover:bg-white/[0.04] transition-colors",children:[(0,d.jsx)("span",{className:"text-white text-sm",children:a.name}),(0,d.jsx)("span",{className:"text-[var(--muted)] text-xs",children:new Date(a.birthday+"T00:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"long"})})]},a.name))})]}),j.length>0&&(0,d.jsxs)("div",{className:"card p-5",children:[(0,d.jsxs)("h2",{className:"font-bold text-white mb-4 flex items-center gap-2",children:[(0,d.jsx)("span",{children:"📅"})," Próximas Reuniões"]}),(0,d.jsx)("div",{className:"space-y-1",children:j.map(a=>(0,d.jsxs)("div",{className:"flex items-center justify-between rounded-lg px-2 py-2 hover:bg-white/[0.04] transition-colors",children:[(0,d.jsx)("span",{className:"text-white text-sm",children:a.title}),(0,d.jsx)("span",{className:"text-[var(--muted)] text-xs",children:new Date(a.start_time).toLocaleDateString("pt-BR")})]},a.id))})]})]})]})}[f]=g.then?(await g)():g,a.s(["default",0,h]),c()}catch(a){c(a)}},!1),62514,a=>{a.n(a.i(99123))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__14er8w8._.js.map