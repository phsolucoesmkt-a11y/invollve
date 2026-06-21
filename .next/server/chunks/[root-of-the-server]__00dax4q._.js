module.exports=[14747,(e,T,t)=>{T.exports=e.x("path",()=>require("path"))},24361,(e,T,t)=>{T.exports=e.x("util",()=>require("util"))},18622,(e,T,t)=>{T.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,T,t)=>{T.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,T,t)=>{T.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,T,t)=>{T.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,T,t)=>{T.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,T,t)=>{T.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},75601,e=>{"use strict";var T=e.i(93458),t=e.i(79832);async function E(){let e=await (0,T.cookies)(),E=e.get("invollve_token")?.value;return E?(0,t.verifyToken)(E):null}e.s(["getSession",0,E])},18520,e=>e.a(async(T,t)=>{try{let T=await e.y("@libsql/client-6da938047d5fc1cd");e.n(T),t()}catch(e){t(e)}},!0),43793,e=>e.a(async(T,t)=>{try{var E=e.i(18520),r=T([E]);[E]=r.then?(await r)():r;let s=process.env.TURSO_DATABASE_URL??"file:/tmp/invollve.db",n=process.env.TURSO_AUTH_TOKEN,o=null;function a(){return o||(o=n?(0,E.createClient)({url:s,authToken:n}):(0,E.createClient)({url:s})),o}let d=[`CREATE TABLE IF NOT EXISTS users (
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
  )`],N=!1;async function i(){if(N)return;let e=a();for(let T of d)await e.execute(T);N=!0}e.s(["default",0,{get:async(e,T=[])=>(await i(),(await a().execute({sql:e,args:T})).rows[0]??null),all:async(e,T=[])=>(await i(),(await a().execute({sql:e,args:T})).rows),run:async(e,T=[])=>(await i(),{lastInsertRowid:(await a().execute({sql:e,args:T})).lastInsertRowid??0})}]),t()}catch(e){t(e)}},!1),54799,(e,T,t)=>{T.exports=e.x("crypto",()=>require("crypto"))},27699,(e,T,t)=>{T.exports=e.x("events",()=>require("events"))},22734,(e,T,t)=>{T.exports=e.x("fs",()=>require("fs"))},88947,(e,T,t)=>{T.exports=e.x("stream",()=>require("stream"))},46786,(e,T,t)=>{T.exports=e.x("os",()=>require("os"))},33405,(e,T,t)=>{T.exports=e.x("child_process",()=>require("child_process"))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__00dax4q._.js.map