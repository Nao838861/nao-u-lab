// 家族用URLの保存層。FirebaseのETag付き条件更新で、古い端末による上書きを止める。
export const emptyDB = () => ({v: 1, players: [], last: null, P: {}, snd: {muted: false}});
const plain = v => v && typeof v === 'object' && !Array.isArray(v);
export function parseDB(text) {
  const d = JSON.parse(text);
  if (!plain(d) || d.v !== 1 || !Array.isArray(d.players) || !plain(d.P) ||
      !d.players.every(n => typeof n === 'string' && plain(d.P[n]))) throw new Error('記録の形式が違います');
  return d;
}
export function databaseRoot(value) {
  let u; try { u = new URL(value.trim()); } catch { throw new Error('FirebaseのデータベースURLを入力してください'); }
  if (u.protocol !== 'https:' || u.username || u.password || u.port ||
      !/^[a-z0-9-]+(?:\.[a-z0-9-]+)?\.(?:firebaseio\.com|firebasedatabase\.app)$/.test(u.hostname) ||
      !['', '/'].includes(u.pathname) || u.search || u.hash) throw new Error('FirebaseのデータベースURLを入力してください');
  return u.origin;
}
export function sharedConfig(hash, defaultRoot = '') {
  const p = new URLSearchParams(hash.replace(/^#/, ''));
  if (!p.has('save')) return null;
  if (!/^[A-Za-z0-9_-]{24,128}$/.test(p.get('save'))) throw new Error('共有リンクが不完全です');
  if (!(p.get('db') || defaultRoot)) throw new Error('共有リンクに保存先がありません');
  return {root: databaseRoot(p.get('db') || defaultRoot), room: p.get('save')};
}
export function newRoom(crypto = globalThis.crypto) {
  return Array.from(crypto.getRandomValues(new Uint8Array(24)), n => n.toString(16).padStart(2, '0')).join('');
}
export function sharedLink(url, config) {
  const u = new URL(url); u.hash = new URLSearchParams({save: config.room, db: config.root}).toString();
  return u.href;
}
const replace = (target, value) => { for (const k of Object.keys(target)) delete target[k]; Object.assign(target, value); };

export class SaveStore {
  constructor({key = 'enaga_kanji_v1', config = null, storage = globalThis.localStorage, fetcher = (...args) => globalThis.fetch(...args),
    timeout = 10000, onStatus = () => {}} = {}) {
    Object.assign(this, {key, config, storage, fetcher, timeout, onStatus});
    this.cacheKey = config ? `${key}:shared:${config.root}:${config.room}` : key;
    this.data = emptyDB(); this.base = null; this.payload = JSON.stringify(this.data);
    this.revision = 0; this.etag = null; this.dirty = false; this.canPlay = !config;
    this.status = config ? 'loading' : 'local'; this.error = ''; this.busy = null;
    this.onRemote = () => {}; this.isIdle = () => false; this.timer = null; this.poll = null;
    this.hasCache = false; this.cacheFailed = false; this.remotePending = false;
  }
  notify(status, error = '') { this.status = status; this.error = error; this.onStatus(this); }
  localData() {
    try { return parseDB(this.storage.getItem(this.key)); } catch { return emptyDB(); }
  }
  persist() {
    try {
      this.storage.setItem(this.cacheKey, this.config ? JSON.stringify({v: 1, base: this.base, payload: this.payload,
        revision: this.revision, etag: this.etag, dirty: this.dirty}) : this.payload);
      this.cacheFailed = false; return true;
    } catch { this.cacheFailed = true; return false; }
  }
  loadCache() {
    try {
      const c = JSON.parse(this.storage.getItem(this.cacheKey));
      if (!c || c.v !== 1 || typeof c.payload !== 'string' ||
          (c.base !== null && typeof c.base !== 'string') || !Number.isSafeInteger(c.revision) || c.revision < 0) return;
      const data = parseDB(c.payload); if (c.base !== null) parseDB(c.base);
      Object.assign(this, {payload: c.payload, base: c.base, revision: c.revision, etag: c.etag,
        dirty: c.payload !== c.base, hasCache: true, canPlay: true});
      replace(this.data, data);
    } catch { /* 壊れたキャッシュをオンライン記録へ送らない。 */ }
  }
  async request(method, body, etag) {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), this.timeout);
    try {
      const headers = {'X-Firebase-ETag': 'true'};
      if (body !== undefined) { headers['Content-Type'] = 'application/json'; headers['if-match'] = etag; }
      const r = await this.fetcher(`${this.config.root}/enagaKanji/${this.config.room}.json`, {
        method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: ctl.signal, cache: 'no-store'});
      if (r.status === 412) return {conflict: true};
      if (!r.ok) throw new Error(r.status === 401 || r.status === 403 ? '保存先のルールを確認してください' : `接続できませんでした（${r.status}）`);
      const tag = r.headers.get('ETag');
      if (!tag) throw new Error('保存先から更新確認番号を取得できません');
      const value = await r.json();
      if (value !== null && (!plain(value) || value.v !== 1 || !Number.isSafeInteger(value.revision) || value.revision < 1 ||
          typeof value.payload !== 'string')) throw new Error('共有記録の形式が違います');
      if (value) parseDB(value.payload);
      return {value, etag: tag};
    } finally { clearTimeout(t); }
  }
  async open() {
    if (!this.config) {
      replace(this.data, this.localData()); this.payload = JSON.stringify(this.data); return this;
    }
    this.loadCache();
    await this.sync({acceptRemote: true});
    return this;
  }
  adopt(remote, notifyRemote = false) {
    const payload = remote.value?.payload ?? JSON.stringify(emptyDB());
    if (JSON.stringify(this.data) !== payload) replace(this.data, parseDB(payload));
    Object.assign(this, {base: payload, payload, revision: remote.value?.revision || 0, etag: remote.etag,
      dirty: false, canPlay: true, hasCache: true, remotePending: false});
    this.persist(); this.notify('saved');
    if (notifyRemote) this.onRemote();
  }
  save() {
    if (!this.canPlay) return;
    const payload = JSON.stringify(this.data);
    if (!this.config) {
      this.payload = payload; this.notify(this.persist() ? 'local' : 'error', this.cacheFailed ? '端末に保存できません' : ''); return;
    }
    if (payload === this.payload) return;
    this.payload = payload; this.dirty = payload !== this.base; this.persist();
    if (this.status === 'conflict') { this.notify('conflict'); return; }
    this.notify(this.cacheFailed ? 'error' : 'pending', this.cacheFailed ? '端末にも保存できていません。記録を書き出してください' : '');
    // 最初の変更から1秒で送る。連続操作で送信が無期限に延期されない。
    if (!this.timer) this.timer = setTimeout(() => { this.timer = null; void this.sync(); }, 1000);
  }
  sync({acceptRemote = this.isIdle()} = {}) {
    if (!this.config || this.status === 'conflict') return Promise.resolve();
    if (this.busy) return this.busy;
    this.busy = this.performSync(acceptRemote).catch(e => {
      const message = e.name === 'AbortError' ? '接続がタイムアウトしました' : e.message;
      this.notify(this.canPlay && !this.cacheFailed ? 'offline' : 'error', this.cacheFailed ? '端末にも保存できていません。記録を書き出してください。' + message : message);
    }).finally(() => { this.busy = null; });
    return this.busy;
  }
  async performSync(acceptRemote) {
    this.notify('syncing');
    const remote = await this.request('GET');
    const rp = remote.value?.payload ?? null;
    if (!this.dirty) {
      if (rp === null && this.hasCache && this.revision > 0) { this.notify('conflict', '共有記録が見つかりません'); return; }
      const changed = rp !== null && this.base !== null && rp !== this.base;
      if (changed && !acceptRemote) { this.remotePending = true; this.notify('remote'); return; }
      if (rp === this.base && this.hasCache) { this.etag = remote.etag; this.notify('saved'); return; }
      // open()後のsave()と読み取りが競合した場合は、下の条件更新へ進む。
      if (!this.dirty) { this.adopt(remote, changed); return; }
    }
    if (rp === this.payload) { this.adopt(remote); return; } // 送信成功後に応答だけ失われた場合。
    if (rp !== this.base && !(rp === null && this.revision === 0 && this.base === JSON.stringify(emptyDB()))) {
      this.notify('conflict', '別の端末にも新しい記録があります。両方の記録を残しています'); return;
    }
    const sent = this.payload, revision = (remote.value?.revision || 0) + 1;
    const result = await this.request('PUT', {v: 1, revision, updatedAt: {'.sv': 'timestamp'}, payload: sent}, remote.etag);
    if (result.conflict) { this.notify('conflict', '別の端末が先に保存しました。両方の記録を残しています'); return; }
    this.base = sent; this.revision = revision; this.etag = result.etag;
    this.dirty = this.payload !== sent; this.canPlay = true; this.hasCache = true; this.persist();
    this.notify(this.dirty ? 'pending' : 'saved');
    if (this.dirty && !this.timer) this.timer = setTimeout(() => { this.timer = null; void this.sync(); }, 1000);
  }
  async create(config, data) {
    const candidate = new SaveStore({key: this.key, config, storage: this.storage, fetcher: this.fetcher, timeout: this.timeout});
    const current = await candidate.request('GET');
    if (current.value !== null) throw new Error('この共有先には記録があります。新しいリンクを作り直してください');
    const payload = JSON.stringify(data); parseDB(payload);
    const result = await candidate.request('PUT', {v: 1, revision: 1, updatedAt: {'.sv': 'timestamp'}, payload}, current.etag);
    if (result.conflict) throw new Error('保存先が更新されました。もう一度作成してください');
    candidate.adopt(result); return candidate;
  }
  start({isIdle, onRemote, interval = 15000}) {
    this.isIdle = isIdle; this.onRemote = onRemote;
    if (!this.config) return;
    this.poll = setInterval(() => { if (globalThis.document?.visibilityState !== 'hidden') void this.sync(); }, interval);
    this.wake = () => void this.sync();
    globalThis.addEventListener?.('online', this.wake);
    globalThis.addEventListener?.('focus', this.wake);
    this.visibility = () => { if (globalThis.document?.visibilityState === 'visible') void this.sync(); };
    globalThis.document?.addEventListener('visibilitychange', this.visibility);
  }
  close() {
    clearTimeout(this.timer); clearInterval(this.poll);
    globalThis.removeEventListener?.('online', this.wake); globalThis.removeEventListener?.('focus', this.wake);
    globalThis.document?.removeEventListener('visibilitychange', this.visibility);
  }
}
