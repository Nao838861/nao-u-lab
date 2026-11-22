// 保存先を切り替える小さなUI。ゲーム本体の画面・入力とは独立させる。
import {SaveStore, databaseRoot, newRoom, sharedConfig, sharedLink, emptyDB} from './save-store.mjs';

const labels = {local: 'この端末に保存', loading: '共有を読み込み中', syncing: '共有に同期中',
  saved: '共有に保存済み', pending: '共有への送信待ち', offline: '通信待ち・端末に保存',
  remote: '別の端末に更新あり', conflict: '共有の更新を確認', error: '保存先を確認'};
const css = `
#saveBadge{position:absolute;left:14px;bottom:10px;z-index:10;max-width:400px;font-size:14px;background:#fff;border:2px solid #cfe0f2;border-radius:10px;padding:3px 10px;color:#526d87}
#saveBadge[data-state=conflict],#saveBadge[data-state=error]{border-color:#d35a67;color:#a12d41}
body.s-title .tfoot{padding-left:230px}
#saveOverlay{position:absolute;inset:0;z-index:60;background:#233c6080;display:flex;align-items:center;justify-content:center}
#saveOverlay[hidden]{display:none}
#saveOverlay .saveBox{background:#fff;border-radius:22px;padding:24px 30px;width:760px;max-height:660px;overflow:auto;box-shadow:0 8px 30px #0004;font-size:18px;line-height:1.7}
#saveOverlay h2{margin:0 0 12px;font-size:26px;color:#3b5f86}
#saveOverlay p{margin:10px 0}
#saveOverlay label{display:block;margin:12px 0}
#saveOverlay input[type=url],#saveOverlay textarea{width:100%;border:2px solid #cfe0f2;border-radius:10px;padding:10px;font:16px Meiryo,sans-serif;user-select:text;-webkit-user-select:text}
#saveOverlay textarea{height:105px;resize:none}
#saveOverlay .saveActions{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
#saveOverlay button{font-size:18px;padding:8px 16px;border:2px solid #b7cfe6;background:#edf5ff;border-radius:12px}
#saveOverlay button.primary{border-color:#4a90d9;background:#dfefff;font-weight:bold}
#saveOverlay button:disabled{opacity:.5;cursor:wait}
#saveOverlay .saveError{color:#a12d41;min-height:28px}
#saveOverlay a{color:#2868a1}
#saveOverlay .saveSmall{font-size:15px;color:#526d87}
`;
function el(tag, text, parent) { const e = document.createElement(tag); if (text) e.textContent = text; parent?.append(e); return e; }
function download(data) {
  const a = document.createElement('a'), url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'}));
  a.href = url; a.download = 'enaga-kanji-backup.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function openBrowserSave({key}) {
  let config = null, configError = '';
  try {
    const p = new URLSearchParams(location.hash.slice(1));
    let root = '';
    if (p.has('save') && !p.has('db')) {
      const r = await fetch('./cloud-config.json', {cache: 'no-store'});
      if (r.ok) root = (await r.json()).databaseURL || '';
    }
    config = sharedConfig(location.hash, root);
  } catch (e) { configError = e.message; }
  const store = new SaveStore({key, config});
  // 不完全な共有URLを通常のローカル保存として扱わない。
  if (configError) { store.canPlay = false; store.notify('error', configError); }
  else await store.open();
  mount(store, configError);
  return store;
}
function mount(store, configError) {
  el('style', css, document.head);
  const frame = document.querySelector('#frame'), badge = el('button', '', frame);
  badge.id = 'saveBadge'; badge.type = 'button';
  const overlay = el('div', '', frame); overlay.id = 'saveOverlay'; overlay.hidden = true;
  overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-labelledby', 'saveHeading');
  let savedFocus, previousStatus;
  const close = () => { if (!store.canPlay) return; overlay.hidden = true; savedFocus?.focus(); };
  const localURL = () => { const u = new URL(location.href); u.hash = ''; return u.href; };
  function panel(title) {
    if (overlay.hidden) savedFocus = document.activeElement;
    overlay.textContent = ''; overlay.hidden = false;
    const box = el('div', '', overlay); box.className = 'saveBox';
    const heading = el('h2', title, box); heading.id = 'saveHeading'; heading.tabIndex = -1; heading.focus();
    return box;
  }
  function buttons(box) { const e = el('div', '', box); e.className = 'saveActions'; return e; }
  function button(parent, label, fn, primary = false) {
    const b = el('button', label, parent); b.type = 'button'; if (primary) b.className = 'primary';
    b.addEventListener('click', fn); return b;
  }
  function showLink(box, href) {
    const t = el('textarea', href, box); t.readOnly = true; t.setAttribute('aria-label', '家族用リンク');
    el('p', '同じリンクをPC・iPadで開いて、ブックマークしてください。', box);
    const row = buttons(box);
    button(row, 'リンクをコピー', async e => {
      try { await navigator.clipboard.writeText(href); e.target.textContent = 'コピーしました'; }
      catch { t.focus(); t.select(); }
    });
    if (navigator.share) button(row, '家族に共有', () => navigator.share({title: 'エナガの かんじの森', url: href}).catch(() => {}));
  }
  function creation(box, source, defaultRoot = '') {
    const label = el('label', '保存先のURL', box), input = el('input', '', label);
    input.type = 'url'; input.placeholder = 'https://○○-default-rtdb.firebaseio.com'; input.value = defaultRoot;
    input.setAttribute('aria-label', 'Firebaseの保存先URL');
    const help = el('p', '', box); help.className = 'saveSmall';
    const a = el('a', '初回の保存先の作り方', help); a.href = './cloud-setup.html'; a.target = '_blank';
    const checkLabel = el('label', '', box), check = el('input', '', checkLabel); check.type = 'checkbox'; check.checked = true;
    checkLabel.append(document.createTextNode(' この端末で開いている記録をコピーする'));
    const error = el('p', '', box); error.className = 'saveError'; error.setAttribute('role', 'status');
    const row = buttons(box);
    button(row, '家族用リンクを作る', async e => {
      e.target.disabled = true; error.textContent = '保存先に接続しています…';
      try {
        const config = {root: databaseRoot(input.value), room: newRoom()};
        await store.create(config, check.checked ? source() : emptyDB());
        const href = sharedLink(location.href, config), ready = panel('家族用リンクができました');
        showLink(ready, href);
        button(buttons(ready), 'このリンクで はじめる', () => location.assign(href), true);
        button(buttons(ready), 'とじる', close);
      } catch (err) { error.textContent = err.message; e.target.disabled = false; }
    }, true);
    if (store.canPlay) button(row, 'とじる', close);
    else button(row, 'この端末の記録を使う', () => location.assign(localURL()));
    input.focus();
  }
  function settings() {
    if (store.status === 'conflict') { conflict(); return; }
    const box = panel(store.config ? '家族と共有する記録' : '家族と記録を共有');
    if (store.config) {
      el('p', labels[store.status] || store.status, box);
      if (store.error) el('p', store.error, box).className = 'saveError';
      showLink(box, sharedLink(location.href, store.config));
      const row = buttons(box);
      button(row, '今すぐ同期', async () => { await store.sync(); if (store.status !== 'conflict') settings(); });
      button(row, 'この端末の分を書き出す', () => download(store.data));
      button(row, '端末だけの記録へ', () => location.assign(localURL()));
      if (store.canPlay) button(row, 'とじる', close);
      else button(row, '接続し直す', () => location.reload(), true);
    } else {
      if (configError) el('p', configError + '。保存先を入力してリンクを作り直せます。', box).className = 'saveError';
      else el('p', '今の記録をオンラインへコピーし、家族の端末で同じ続きを遊べます。', box);
      creation(box, () => store.config ? store.data : store.localData());
      if (store.canPlay) button(buttons(box), '記録を書き出す', () => download(store.data));
    }
    box.querySelector('button')?.focus();
  }
  function conflict() {
    const box = panel('別の端末にも新しい記録があります');
    el('p', 'この端末の分は端末内に残しています。共有先は上書きしていません。', box);
    el('p', 'この端末の分を別の家族用リンクに残すか、書き出してから共有先の最新記録を開いてください。', box);
    const row = buttons(box);
    button(row, 'この端末の分を書き出す', () => download(store.data));
    button(row, '別のリンクに残す', () => {
      const b = panel('この端末の分を別のリンクに残す'); creation(b, () => store.data, store.config.root);
    });
    button(row, '書き出して最新を開く', () => {
      download(store.data);
      // ダウンロードに加え、元のキャッシュも別キーで残してから最新を読む。
      try {
        store.storage.setItem(`${store.cacheKey}:backup:${Date.now()}`, store.storage.getItem(store.cacheKey));
        store.storage.removeItem(store.cacheKey);
        location.reload();
      } catch { el('p', '端末内のバックアップに失敗しました。記録を書き出してから開き直してください。', box).className = 'saveError'; }
    }, true);
    button(row, 'この端末で続きを遊ぶ', close);
  }
  function update() {
    badge.textContent = labels[store.status] || store.status; badge.dataset.state = store.status;
    badge.title = store.error || badge.textContent;
    document.querySelector('#ui').inert = !store.canPlay;
    if (store.status === 'conflict' && previousStatus !== 'conflict') conflict();
    previousStatus = store.status;
  }
  store.onStatus = update; badge.addEventListener('click', settings);
  overlay.addEventListener('keydown', e => {
    e.stopPropagation();
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'Tab') {
      const list = [...overlay.querySelectorAll('button:not(:disabled),input,textarea,a')];
      const i = list.indexOf(document.activeElement);
      if ((e.shiftKey && i === 0) || (!e.shiftKey && i === list.length - 1)) {
        e.preventDefault(); list[e.shiftKey ? list.length - 1 : 0]?.focus();
      }
    }
  });
  update(); if (!store.canPlay) settings();
  // URLの保存モードを切り替えたら、ゲームの参照も起動し直す。
  globalThis.addEventListener('hashchange', () => location.reload());
}
