// 保存境界の検証。端末2台、オフライン復旧、更新競合、送信中の変更を再現する。
// node --test test_cloud_save.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {SaveStore, databaseRoot, sharedConfig, sharedLink, emptyDB, newRoom} from './js/save-store.mjs';

class MemoryStorage {
  values = new Map();
  getItem(k) { return this.values.get(k) ?? null; }
  setItem(k, v) { this.values.set(k, String(v)); }
  removeItem(k) { this.values.delete(k); }
}
function server() {
  const rooms = new Map(); let requests = 0, offline = false, loseReply = false, gate;
  const fetcher = async (url, opts) => {
    requests++;
    if (offline) throw new Error('通信なし');
    if (gate) { const g = gate; gate = null; await g(opts); }
    const current = rooms.get(url), etag = `"${current?.revision || 0}"`;
    if (opts.method === 'PUT') {
      if (opts.headers['if-match'] !== etag) return new Response('null', {status: 412});
      const value = JSON.parse(opts.body); value.updatedAt = Date.now(); rooms.set(url, value);
      if (loseReply) { loseReply = false; throw new Error('応答だけ失われた'); }
      return new Response(JSON.stringify(value), {headers: {ETag: `"${value.revision}"`}});
    }
    return new Response(JSON.stringify(current || null), {headers: {ETag: etag}});
  };
  return {fetcher, rooms, get requests() { return requests; }, set offline(v) { offline = v; },
    set loseReply(v) { loseReply = v; }, set gate(v) { gate = v; }};
}
const config = {root: 'https://family-default-rtdb.firebaseio.com', room: '123456789012345678901234'};
async function client(srv, storage = new MemoryStorage(), shared = true) {
  const s = new SaveStore({config: shared ? config : null, fetcher: srv.fetcher, storage}); await s.open(); return s;
}
function add(s, name = '子ども.一', count = 1) {
  s.data.players = [name]; s.data.last = name; s.data.P[name] = {grade: 1, s: {enaga: count}, kanji: {}, parts: {}}; s.save();
}

test('通常URLは端末内だけ。共有キャッシュと別保存し、Firebaseへ通信しない', async () => {
  const srv = server(), storage = new MemoryStorage(), a = await client(srv, storage, false);
  add(a, 'ローカル', 12); assert.equal(srv.requests, 0);
  const b = await client(srv, storage); add(b, '共有', 30); await b.sync();
  assert.equal(JSON.parse(storage.getItem('enaga_kanji_v1')).P['ローカル'].s.enaga, 12);
  const local = await client(srv, storage, false); assert.equal(local.data.last, 'ローカル');
  a.close(); b.close(); local.close();
});

test('家族用リンクを2台で開くと同じ記録。名前・漢字・空配列も保持する', async () => {
  const srv = server(), a = await client(srv); add(a); a.data.P['子ども.一'].kanji = {'木': {strokes: []}}; a.save(); await a.sync();
  const b = await client(srv); assert.deepEqual(b.data, a.data); assert.equal(b.status, 'saved');
  const c = await client(srv); c.config = {...config, room: 'another123456789012345678'};
  await c.sync({acceptRemote: true}); assert.equal(c.status, 'conflict'); // 既存キャッシュを空の別保存先へ復活させない。
  a.close(); b.close(); c.close();
});

test('通信なしで初回アクセスした空画面を編集・アップロードしない', async () => {
  const srv = server(); srv.offline = true;
  const a = await client(srv); assert.equal(a.canPlay, false); assert.equal(a.status, 'error');
  a.data.players.push('誤操作'); a.save(); assert.equal(a.dirty, false); a.close();
});

test('壊れた共有URLで停止中は、音声操作でも元の端末記録を書き換えない', async () => {
  const srv = server(), storage = new MemoryStorage(), a = await client(srv, storage, false);
  add(a, '元の記録', 50); const before = storage.getItem(a.key);
  const b = new SaveStore({storage}); b.canPlay = false; b.save();
  assert.equal(storage.getItem(a.key), before); a.close(); b.close();
});

test('既読の共有記録は通信なしでも保存し、再起動・復旧後に再送する', async () => {
  const srv = server(), storage = new MemoryStorage(), a = await client(srv, storage);
  add(a, '家族', 10); await a.sync(); srv.offline = true;
  add(a, '家族', 20); await a.sync(); assert.equal(a.status, 'offline'); a.close();
  const b = await client(srv, storage); assert.equal(b.canPlay, true); assert.equal(b.data.P['家族'].s.enaga, 20);
  srv.offline = false; await b.sync(); assert.equal(b.status, 'saved');
  const c = await client(srv); assert.equal(c.data.P['家族'].s.enaga, 20); b.close(); c.close();
});

test('2台の同時更新では後発を止め、共有先と端末側の両方を残す', async () => {
  const srv = server(), a = await client(srv); add(a, '家族', 10); await a.sync();
  const b = await client(srv); add(a, '家族', 20); add(b, '家族', 30);
  await a.sync(); await b.sync(); assert.equal(b.status, 'conflict');
  assert.equal(b.data.P['家族'].s.enaga, 30);
  const c = await client(srv); assert.equal(c.data.P['家族'].s.enaga, 20);
  const b2 = await client(srv, b.storage); assert.equal(b2.status, 'conflict'); assert.equal(b2.data.P['家族'].s.enaga, 30);
  a.close(); b.close(); b2.close(); c.close();
});

test('GETとPUTの間に別端末が保存した場合もHTTP 412で上書きを止める', async () => {
  const srv = server(), a = await client(srv); add(a, '家族', 10); await a.sync();
  const b = await client(srv); add(b, '家族', 30);
  const original = b.request.bind(b);
  b.request = async (...args) => {
    if (args[0] === 'PUT') { add(a, '家族', 20); await a.sync(); }
    return original(...args);
  };
  await b.sync(); assert.equal(b.status, 'conflict');
  const c = await client(srv); assert.equal(c.data.P['家族'].s.enaga, 20);
  a.close(); b.close(); c.close();
});

test('保存済みの応答だけ失われても、再接続で重複更新しない', async () => {
  const srv = server(), a = await client(srv); add(a, '家族', 40); srv.loseReply = true;
  await a.sync(); assert.equal(a.status, 'offline'); const revision = [...srv.rooms.values()][0].revision;
  await a.sync(); assert.equal(a.status, 'saved'); assert.equal([...srv.rooms.values()][0].revision, revision); a.close();
});

test('送信中に次の正解があっても未送信分を消さない', async () => {
  const srv = server(), a = await client(srv); add(a, '家族', 1);
  const original = a.request.bind(a);
  a.request = async (...args) => {
    const r = await original(...args);
    if (args[0] === 'PUT') add(a, '家族', 2);
    return r;
  };
  await a.sync(); assert.equal(a.dirty, true); assert.equal(a.data.P['家族'].s.enaga, 2);
  a.request = original; await a.sync(); assert.equal(a.dirty, false);
  const b = await client(srv); assert.equal(b.data.P['家族'].s.enaga, 2); a.close(); b.close();
});

test('変更のない同期はプレイヤーへの参照を壊さず、更新は学習中に適用しない', async () => {
  const srv = server(), a = await client(srv); add(a, '家族', 10); await a.sync();
  const b = await client(srv), player = b.data.P['家族']; await b.sync(); assert.equal(b.data.P['家族'], player);
  add(a, '家族', 20); await a.sync(); await b.sync(); assert.equal(b.status, 'remote'); assert.equal(b.data.P['家族'], player);
  let updated = 0; b.onRemote = () => updated++;
  await b.sync({acceptRemote: true}); assert.equal(b.data.P['家族'].s.enaga, 20); assert.equal(updated, 1); a.close(); b.close();
});

test('既存セーブをコピーして新規リンクを作る。既存の保存先は上書きしない', async () => {
  const srv = server(), a = await client(srv, new MemoryStorage(), false); add(a, 'コピー', 100);
  const c = await a.create(config, a.data); assert.deepEqual(c.data, a.data);
  await assert.rejects(a.create(config, emptyDB()), /記録があります/); a.close(); c.close();
});

test('保存容量不足を保存済み表示で隠さず、壊れた共有記録も送信しない', async () => {
  const srv = server(), storage = new MemoryStorage(), a = await client(srv, storage, false);
  storage.setItem = () => { throw new Error('容量不足'); }; add(a); assert.equal(a.status, 'error');
  const b = await client(srv); add(b); await b.sync();
  [...srv.rooms.values()][0].payload = '{"v":1,"players":[],"P":null}';
  const c = await client(srv); assert.equal(c.canPlay, false); assert.equal(c.status, 'error'); a.close(); b.close(); c.close();
});

test('URLと共有キーの検証。Firebase以外へデータを送らない', () => {
  assert.equal(sharedConfig(''), null);
  for (const url of ['https://example.org', 'http://x.firebaseio.com', 'https://x.firebaseio.com.evil.org', 'https://x.firebaseio.com/a', 'https://x.firebaseio.com?x=1', 'https://user@x.firebaseio.com'])
    assert.throws(() => databaseRoot(url));
  assert.equal(databaseRoot('https://foo-default-rtdb.asia-southeast1.firebasedatabase.app/'), 'https://foo-default-rtdb.asia-southeast1.firebasedatabase.app');
  assert.throws(() => sharedConfig('#save=short&db=https://x.firebaseio.com'));
  const room = newRoom(); assert.equal(room.length, 48);
  const link = sharedLink('https://example.org/game/', {...config, room});
  assert.deepEqual(sharedConfig(new URL(link).hash), {...config, room});
});
