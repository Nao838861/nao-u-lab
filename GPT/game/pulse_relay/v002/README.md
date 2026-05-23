# Pulse Relay v002

近い敵弾を Space のパルスで白い反撃弾へ変換する、短編の縦スクロール 2D シューティングです。通常ショットで STG の基本形を保ちつつ、弾が詰まった時だけ「避ける」と「撃ち返す」が同時に起きるようにしています。

## 起動

`index.html` をブラウザで開きます。

## 操作

- 移動: 矢印キー / WASD
- パルス: Space
- リスタート: R
- ショット: 自動

## 構成

- `game.js`: ゲーム本体、敵 wave、描画、CommonJS export
- `verify.js`: 固有メカニクスと route 方針の smoke test
- `timeline_eval.js`: 1 秒ごとの時系列評価と複数 bot policy 比較
- `wave_grammar_check.js`: 敵出現パターンの密度、レーン、役割、失敗パターン検査
- `enemy_rebuild_packet.md`: 実装前に作った敵 wave 設計表
- `completion_checklist.md`: 原意を圧縮しない完成チェックリスト
- `checklist_validation.md`: チェックリスト自体の検証ログ
- `design_log.md`: 設計判断と評価ログ
- `self_judgment.md`: 最終自己評価

## 評価コマンド

```powershell
node wave_grammar_check.js
node verify.js
node timeline_eval.js
```

2026-05-23 の最終検証では 3 コマンドすべて通過。route は 5 seed で `clearRate 1`、camper / lane-holder / blind-sweeper / noPulse は route より明確に弱い結果になりました。
