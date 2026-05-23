# Pulse Relay v001

近い敵弾を Space のパルスで白い反撃弾へ変換する、短編の縦スクロール 2D シューティングです。通常ショットで STG の基本形を保ちつつ、敵弾が近付いた時だけ「避ける」と「撃ち返す」が同時に起きるようにしています。

## 起動

`index.html` をブラウザで開きます。

## 操作

- 移動: 矢印キー / WASD
- パルス: Space
- リスタート: R
- ショット: 自動

## 構成

- `game.js`: ゲーム本体、固定 wave、描画、CommonJS export
- `verify.js`: 基本メカニクスと route 方針の smoke test
- `timeline_eval.js`: 1 秒ごとの時系列評価と複数方針の比較
- `wave_grammar_check.js`: 敵出現パターンの密度、レーン、ボス燃料の検査
- `design_log.md`: 設計判断と評価ログ
- `self_judgment.md`: 自己評価

## 評価コマンド

```powershell
node verify.js
node timeline_eval.js
node wave_grammar_check.js
```

2026-05-23 時点では、route 方針は 5 seed でクリアします。noPulse もクリア可能なので、パルスは必須解ではなく、スコア、被弾リカバリ、反撃演出を厚くするメカとして評価しています。
