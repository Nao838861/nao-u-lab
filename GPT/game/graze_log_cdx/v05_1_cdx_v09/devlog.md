# graze_log v05.2_cdx_v09 - devlog

## 対象

ユーザーフィードバック:

> 敵の出現パターンが単調。既存のゲームのザコ敵の編隊や中ボスを出すタイミング、それぞれの弾を撃つアルゴリズムやステージの展開など、想像ではなく実際のゲームのパターンを調べて再現する形で、散発的に敵が適当に出てくるのではなく、ステージの流れからボスまでの展開をちゃんと作りこんで欲しい。

## 実装方針

`research_stage_pattern_sources_20260520.md` のリサーチ結果をもとに、v08 を `v05_1_cdx_v09/` へコピーしてステージ構成を作り直した。参照した骨格は、Ikaruga の左右交互・編隊処理、Gradius のハッチ/火山/固定砲台、Touhou の横湧きと曲線弾、DonPachi のチェーン敵と重戦車系中ボス。

## 変更内容

- `STAGE_EVENTS` を 19 イベントの有限ステージに再構成。
- 新敵種を追加: `fanScout`, `columnScout`, `sinePair`, `rush`, `hatch`, `sFairy`, `bunker`, `smallTank`, `volcanoMid`, `heavyTankMid`, `bossPart`。
- 新弾種を追加: S 字弾、火山ロック弾、ボス部位弾。
- 中盤に火山サブボス、後半に DonPachi 風重戦車中ボスを配置。
- ボス前警告で弾消しと補給を入れ、ボス突入時に残敵/残弾が事故要因にならないようにした。
- ボス初段階を短い読み合いにして、最終形態の `FINAL PHASE - CHARGE` / `BOMB NOW` cue は維持。
- ヘッドレス検証を v09 向けに更新し、ステージ文法フラグと self-play クリアを確認するようにした。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v09_check.js
```

結果: pass。

主な確認:

- 19 イベントの有限ステージが中ボスとボスへ到達する。
- Ikaruga / Gradius / Touhou / DonPachi 由来のステージ要素が実際に起動する。
- ボム使用後に 5-way overdrive へ戻らず、cooldown / brake が残る。
- ボス警告ウェーブでボム在庫を作れるが、`spawnBoss()` による直接満タン化はない。
- simpleBot がボス最終形態の cue を見てクリアする。

## 残課題

simpleBot はクリアできるが、被弾でボム在庫を落とすことがあり、毎回「最終形態でボム使用」までは保証しない。次の改善では、手動プレイの感触を見ながら、ボス戦でボムを温存したくなる圧と被弾時の在庫喪失の厳しさを再調整する。
