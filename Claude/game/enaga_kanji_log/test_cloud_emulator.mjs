// 公式Firebase Database Emulatorに本番用ルールを読み込んで実行する。
// FIREBASE_DATABASE_EMULATOR_HOST=127.0.0.1:9009 node --test test_cloud_emulator.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {SaveStore, newRoom, emptyDB} from './js/save-store.mjs';

const host = process.env.FIREBASE_DATABASE_EMULATOR_HOST;
const ns = process.env.FIREBASE_DATABASE_EMULATOR_NAMESPACE || 'demo-enaga-cloud-default-rtdb';
const root = `http://${host}`;
const url = path => `${root}${path}?ns=${ns}`;
const storage = () => { const m = new Map(); return {getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v)}; };
const fetcher = (u, o) => fetch(url(new URL(u).pathname), o);

test('実Firebaseプロトコルで作成・読取・条件更新・競合を確認', {skip: !host}, async () => {
  const config = {root: 'https://family-default-rtdb.firebaseio.com', room: newRoom()};
  const a = new SaveStore({config, storage: storage(), fetcher}); await a.open();
  a.data.players = ['家族']; a.data.P['家族'] = {grade: 1, s: {enaga: 40}, kanji: {}, parts: {}}; a.save(); await a.sync();
  assert.equal(a.status, 'saved', a.error);
  const b = new SaveStore({config, storage: storage(), fetcher}); await b.open(); assert.deepEqual(a.data, b.data);
  a.data.P['家族'].s.enaga = 80; a.save(); b.data.P['家族'].s.enaga = 90; b.save();
  await a.sync(); await b.sync(); assert.equal(b.status, 'conflict'); assert.equal(b.data.P['家族'].s.enaga, 90);
  const c = new SaveStore({config, storage: storage(), fetcher}); await c.open(); assert.equal(c.data.P['家族'].s.enaga, 80);
  a.close(); b.close(); c.close();
});

test('本番用ルールで一覧・短いキー・削除・不正形式・不正な更新番号を拒否', {skip: !host}, async () => {
  const denied = async (path, options) => { const r = await fetch(url(path), options); assert.ok([401, 403].includes(r.status), `${path}: ${r.status} ${await r.text()}`); };
  await denied('/enagaKanji.json'); await denied('/enagaKanji/short.json');
  const config = {root: 'https://family-default-rtdb.firebaseio.com', room: newRoom()};
  const a = new SaveStore({config, storage: storage(), fetcher}); await a.open();
  const path = `/enagaKanji/${config.room}.json`;
  const put = value => ({method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(value)});
  await denied(path, put({v: 1, revision: 2, updatedAt: {'.sv': 'timestamp'}, payload: JSON.stringify(emptyDB())}));
  await denied(path, put({v: 1, revision: 1, updatedAt: {'.sv': 'timestamp'}, payload: 123}));
  a.data.snd.muted = true; a.save(); await a.sync(); assert.equal(a.status, 'saved', a.error);
  await denied(path, {method: 'DELETE'});
  await denied(path, put({v: 1, revision: 1, updatedAt: {'.sv': 'timestamp'}, payload: JSON.stringify(emptyDB())}));
  a.close();
});
