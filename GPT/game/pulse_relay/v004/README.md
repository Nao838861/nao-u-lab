# Pulse Relay v004

近い敵弾を Space のパルスで白い反撃弾へ変換する、短編の縦スクロール 2D シューティングです。通常ショットで STG の基本形を保ちつつ、弾が詰まった時だけ「避ける」と「撃ち返す」が同時に起きるようにしています。

v004 は、v003 の型を維持した上で Pulse の存在意義を強めた復元版です。敵弾を変換した Relay は近い同一敵へ全員で吸い込まれるのではなく、硬い敵、ボス、射線外の敵、倒し切れる敵へ少しばらけて向かい、飛行中に少し加速します。敵弾供給も増やし、Pulseをうまく使うと敵を一気に倒せる方向へ寄せています。

## 起動

`index.html` をブラウザで開きます。

## 操作

- 移動: 矢印キー / WASD
- パルス: Space
- 開始 / パルス / リトライ: Space
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

復元時は `node verify.js` と `node timeline_eval.js` を通すことを必須にします。完成判定は、ヘッドレスの clear だけでなく、画面外射撃ゼロ、下部急加速退場なし、Pulseが意味のある状態を視覚的に示していることを含みます。
