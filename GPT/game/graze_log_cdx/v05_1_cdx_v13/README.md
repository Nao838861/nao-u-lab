# graze_log v05.2_cdx_v13

v12 実装後に `D:\AI\Nao_u_BOT\Claude\game\shot_log\dialogue_archive` を読み直し、当時の shot_log 成立要因を追加反映した版。

取り入れた要点:

- 配置は v12 の shot_log 文法を維持する。
- MAX 到達が見落とされる問題に対して `CORE CHARGED`、金色リング、短い画面フラッシュを追加。
- 中ボスとボスの存在感が薄いという当時の指摘に合わせ、volcano / heavy tank / boss の画面上サイズを拡大。
- 被弾後にリカバーできるカジュアルさを残すため、シールド在庫を v13 では 6 に調整。
- `auto_verify.html` をダブルクリックすると `index.html?seed=12345&bot=1` が開き、画面上で自動検証プレイを見られる。

検証:

```powershell
node tools\headless_graze_log_cdx_v05_2_v13_check.js
```
