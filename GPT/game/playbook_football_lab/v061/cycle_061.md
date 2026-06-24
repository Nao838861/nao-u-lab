# cycle_061

## 判断

v060 で mobile toolbar は詰まりにくくなった。次は試合状況の弱さで、weak threat urgency は down / distance と field position だけを見ており、残り時間のプレッシャーが出ていなかった。v061 では簡易 game clock を state に接続し、終盤や 2 minute 付近で weak threat line を少し強める。

## 実装

- `clockText` を JS に接続し、HTML 側に `driveText` を追加して topbar の不整合を直した。
- `quarter` / `clockSeconds` を state に追加した。
- snap 評価後に `advanceGameClock()` で clock を進めるようにした。
- `gameClockUrgency()` を追加し、`downDistanceUrgency()` に小さく加算した。
- debug snapshot に `gameClock`, `gameClockUrgency`, `quarter`, `clockSeconds` を追加した。
- storage key を v061 に更新し、v060 routes を legacy 読みにした。

## 検証

- `node --check game\playbook_football_lab\v061\game.js`
- `node --check game\playbook_football_lab\v061\verify.js`
- `node verify.js`
- v061 内に v060 固有タイトルや cycle 名が残っていないことを検索する。

## 次の候補

- replay marker window の範囲を UI に小さく示す。
- marker 同士が近い時の優先順位を snapshot に出す。
- 日本語化した文言の長さを field badge 幅に合わせてさらに短縮する。
