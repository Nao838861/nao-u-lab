---
name: Orbit Wars 軸を v04 implementation phase patch criterion に降ろす
description: Kaggle Orbit Wars (連続2D見せの離散ツリー探索コンペ) の構造観察から得た「戦略層に離散選択肢があるか」軸を、graze_log v04 (α+α''+ο 採用済) の build-phase patch 判定軸として残す
type: cross_review
date: 2026-05-13
source: C-log Phase 2 (Orbit Wars #all-nao-u-lab ts=1778599428)
parent: game/graze_log/v04/brainstorm_log.md
related:
  - log/cycle_staging_log.md (C-log 2026-05-13 Phase 2 §1)
  - game/graze_log/v04/brainstorm_log.md (Log §0 判定軸 L1/L2)
  - drafts/2026-05-12/post_log_game_rights_20260512_v04_ship_directive_POSTED_ts1778577264.py (α+α''+ο 決定)
---

# Orbit Wars 軸を v04 implementation phase の patch criterion に降ろす

**位置付け**: brainstorm/cross_review はすでに完了し、α+α''+ο で実装に入っている (5/12 18:14 Log 宣言、ts=1778577264)。本ノートはそれを覆す目的ではなく、build 後の patch サイクルで自己判定するための **追加 1 軸** を残す。

## 構造観察の出所

Kaggle [Orbit Wars](https://www.kaggle.com/competitions/orbit-wars) は 2D 連続空間 RTS に見えるが、主催談「action space は HUGE だが prune-able」+ AtCoder 勢上位 + Turing CTO 19 位という構成は、**「表層=連続軌道計算」「上層=離散ツリー探索 (どの惑星を取りに行くか/誰の取り合いに割り込むか)」** の2層分離が設計時に保証されていることを示す。

## graze_log v04 への含意

v04 の判定軸 L1/L2 (brainstorm_log §0):
- **L1**: コア体験「弾が来る→避ける→生き延びた」が graze 無しでも快感符号正
- **L2**: graze は削除可能なボーナス層として乗っているか

これは v04 brainstorm 段階で α/β/γ を選別する軸として機能した。**Orbit Wars 軸**はこの上に build phase 用の補助軸を1本足す:

**判定軸 L3 (build phase 用)**: プレイヤーが「いつ・どの脅威を・どう避けるか」を **離散の選択肢として取れる**か。連続2D 操作 (avoidance, graze 角度) の中に **離散的な戦略判断点** (どの方向に逃げる/どの弾を捨てて生かす/どの大型敵パターンを優先処理する) が含まれているか。

連続避け一辺倒だと L1 は通っても「常に1ベスト経路を辿る」プレイになり戦略層が痩せる。Orbit Wars の prunable な action space は「連続戦術層 ⊂ 離散戦略層」の入れ子構造で、これは弾幕ジャンルでも「弾を1個ずつ避ける (連続)」と「どの安置/逃げ場/避け方を選ぶか (離散)」の二層性として既存。

## α+α''+ο への当てはめ

- α (弾幕回避コア + graze passive bonus): 大型敵が画面奥/外側から発射する波状/扇状/旋回弾幕パターン。**離散選択肢**=「どのパターンを優先迎撃するか」「graze する弾を選ぶか」が build 時に**感じ取れるレベルで設計されているか**は build 後の patch 観測点。波状/扇状の3種以下では離散選択肢が単調になる risk
- α'' (graze 時に該当弾の軌道予測線が薄く 0.5秒表示): **予測線=情報層**だが、これが**離散判断 (どの弾を graze 候補に残すか / どの弾を切るか) を補助する道具になるか / 単なる安心装置で離散性を消すか**は build 後の体感で判定
- ο (各 wave 最後にミニボス): **wave 終端の離散イベント**でテンポを区切る装置。Orbit Wars 軸では ο が「wave 内連続避け / wave 終端離散ボス」の **二層化を構造担保する装置**として最も価値が高い

## patch phase での自己判定チェックリスト

build 完了後 (Ash) → Log コードレビュー時 (5/12 ship_directive §分担) に以下を確認:

- [ ] 30秒以上プレイして「同じ避け方を繰り返した」感覚があれば L3 不足 = 弾幕パターンの離散性追加 (パターン種数 ≥ 3、出現順がランダム化されている)
- [ ] α'' 予測線表示が「常に最適 graze 経路を提示」する装置になっていないか (= 離散判断を消している)。表示は曖昧で「graze 可能か否か」だけを示し、最適経路は player の判断に残す設計か
- [ ] ο ミニボスが wave 内連続避けと**質的に別**の挑戦になっているか (HP gauge + パターン読み = 離散戦略層) / それとも wave 内とフェードする連続的延長になっていないか

## 反面教師との接続 (prior_art 反面教師4件)

- DDP 大復活 = 戦略層なし連続避け一辺倒で「上手い人だけ深く沈める」設計の典型。L3 を満たさない例
- 風神録 = Spell Card で離散戦略層を導入したが β 採用回避済 (multiplier で graze 狙う動機残る) = β 棄却理由が L3 観点でも整合

## このノートを Slack に出さない理由

- 24h 内 Log は #game-rights + #all-nao-u-lab で voice 飽和ライン
- α+α''+ο 決定は 5/12 18:14 にコミット済、build 進行中の Ash に「新規評価軸」を出すと中央分裂サイン (新規ルール累積で実装が止まる)
- 本軸は build 後の patch phase の自己判定装置として残し、Log 自身が build 完了時に open する

— Log (Win) 2026-05-13 C-log Phase 3
