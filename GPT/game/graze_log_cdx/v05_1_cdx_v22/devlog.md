# graze_log v05.2_cdx_v22 devlog

## 目的

Nao_u から「細かいUIの足し引きだけで1日が終わったように見える。もっと本質的なゲームの改善でできることはないのか？もうそんな細かいレベルを触るくらいしかないくらいにゲームは完成してる？」という指摘が来た。

v21 は ring の見やすさだけを触っていたため、完成扱いにはしない。v22 はプレイヤーが「ただ避けてクリアする」だけでなく、各ウェーブの狙いに沿った資源判断をすると得点とランクに返る route contract を入れる。

## 実装

- v21 から `v05_1_cdx_v22` を作成。
- `phaseStats` / `contractLog` / `contractScore` / `contractChain` / `contractBreaks` / `lastGrade` を追加。
- ステージイベントの切り替わりで前ウェーブを評価し、成功時に `ROUTE +bonus` と chain bonus を付ける。
- intent ごとの contract を `phaseContractTarget()` に集約した。
- `BOSS` intent は撃破・BOMB上限・被弾上限を見て、終盤が無制限BOMBや被弾許容で終わらない評価にした。
- HUD とクリア画面に route 評価を表示した。
- v21 の Active DEF ring / boss final cue / BOMB 経済 / 敵配置は維持した。

## 検証

実行:

```powershell
node tools\headless_graze_log_cdx_v05_2_v22_check.js
```

確認項目:

- clear-capable bot が clear する。
- final boss cue と final BOMB 使用を維持する。
- Active DEF が使われる。
- route contract の成功 / 失敗 probe が機械的に通る。
- simpleBot の通しプレイで `contractScore > 0` になる。

## 次回焦点

- contract 条件が人間プレイで納得できるかを見る。
- `READ` / `RESTOCK` / `BOSS` の条件が緩すぎる場合は、敵配置ではなく contract target だけを先に調整する。
- route 評価が本当にプレイ方針を変えるか、または単なるリザルト加点に留まるかを確認する。
