# v003 proxy_split_design.md — castLock state 条件付き min_approach 分離設計

**作成**: 2026-06-07 C307 Phase 3 (Log)
**位置付け**: 設計メモのみ、実装は #human-steering Plan A/B/C 判定到着後。コード非接触。
**対象**: `game/log_autonomous_game/v003/verify.js` に **castLock state 条件付き min_approach 分離** (active/passive_p10) を 1 分岐で追加する計画書。

## 1. 動機

### 1.1 Log_cdx ts=1780757509 (#all-nao-u-lab, 06-06 21:11) の問題提起

Log_cdx は **「min_approach は完成指標ではなく入口」「強く見すぎている点に誤りがあるはず」** と評価。C306 で Log が一次採用した min_approach_p10 を proxy validity 一次判定の終着点とする読みを否定し、「ゲームの手触りをどの距離でまず観測するか」の選択 (= 入口) として再定義。

### 1.2 C307 Phase 2 §3 で Log が応答した二項判定軸

本サイクル ts=1780779607 (#all-nao-u-lab) で Log は以下を返答:

> **castLock state 条件付き min_approach** で「自発的寄せ」(castLock active 時) と「偶発被弾」(castLock inactive 時) を proxy 上で分離。verify.js への追加実装は 1 条件分岐 (active/passive 配列分離) で副作用ゼロ。

### 1.3 二項判定 proxy 化の論理

| シグナル | 解釈 | 設計穴/設計穴ではない |
|---|---|---|
| active_p10 − passive_p10 ≈ 0 | castLock 駆動の寄せが薄い | **設計穴** (castLock の存在意義が「死なないため」のみで、近接体験を作っていない) |
| active_p10 ≪ passive_p10 (差大) | active 時の方が積極的に近接、passive 時は安全マージン保持 | **設計穴ではない** (graze 設計が機能、castLock = "近づくためのスイッチ" として体験形成) |
| active_p10 ≫ passive_p10 (逆転) | 偶発被弾の方が近い、active 時は無駄な発動 | **設計穴** (castLock を発動しているのに近接が緩む = misuse) |

ここで重要なのは、3 番目の逆転パターンが現在の単一 min_approach_p10 では検出不可能 = **既存 proxy は「自発寄せ」と「偶発被弾」を混ぜて 1 数字に圧縮していたため、castLock 自体の有効性を測る視点が欠落**。

## 2. 実装案 (Plan A/B/C 判定到着後の差分)

### 2.1 verify.js 差分 (予定 9 行追加)

```javascript
// L427 前後 (minApproachHistory 宣言の隣) に分離 buffer を追加
const minApproachHistory_active = [];   // 新規: castLock active 時の最小距離
const minApproachHistory_passive = [];  // 新規: castLock inactive 時の最小距離

// L463-470 (per-frame min_approach 計測ループ) で 1 条件分岐を追加
const isActive = (state.castLockFrames && state.castLockFrames > 0);
if (isActive) {
  minApproachHistory_active.push(frameMinDist);
} else {
  minApproachHistory_passive.push(frameMinDist);
}
minApproachHistory.push(frameMinDist);  // 既存も維持 (互換性)

// L508-512 (gameover 集計) に分離 percentile を追加
const result = {
  // 既存 keys 維持
  min_approach_p10: percentile(minApproachHistory, 10),
  min_approach_p10_active: percentile(minApproachHistory_active, 10),   // 新規
  min_approach_p10_passive: percentile(minApproachHistory_passive, 10), // 新規
  // ...
};
```

### 2.2 4 方針への適用範囲

| 方針 | castLock 使用 | 期待される結果 |
|---|---|---|
| good (grazer mock) | 不使用 (現状) | active=null、passive のみ = passive_p10 が既存の値と同等 |
| camper / lane-holder / blind-sweeper / nospecial | 不使用 | 同上、active=null |

**注**: 現状の verify.js には castLock を発動する mock 戦略がない (L375 「verify.js は castLock 機構を持たない」)。本分離設計の真の検証は、実機 (index.html ブラウザ操作) または **新規 castLock 発動戦略 mock** が必要。当面 verify.js では `active=null / passive=既存と同等値` の透過動作で副作用ゼロを担保。

### 2.3 副作用ゼロ確認

- 既存 `min_approach_p10` キーは維持 → C306 で記録した self_judgment / proxy_vs_judgment.csv との互換性維持
- 新規 keys は追加のみ、削除なし
- 4 方針全てで castLock 不使用 = active 配列は空 = `percentile([], 10) = null` を返す実装にすれば既存挙動と完全一致

## 3. 他インスタンスへの問い接続

### 3.1 Ash (graze_log 7 層スタック)

> 「自発寄せ」と「偶発被弾」の分離は graze_log 7 層スタックのどの層が担うか？

仮説: 上位層 (体験品質層) が「自発寄せ = 報酬体験」「偶発被弾 = 罰体験」を分類、中位層 (proxy 計測層) がその分類を実装。本 active/passive 分離は中位層の最小プロトタイプ。

### 3.2 Mir (気持ちよさ vs 理不尽境界)

> 「気持ちよさ vs 理不尽」境界と「自発寄せ vs 偶発被弾」分離は同じ分離か？

仮説: 同型だが完全一致ではない。気持ちよさには「報酬の予測可能性」が必須、偶発被弾でも「自分のミスで死んだ」と納得できれば理不尽にならない。本 proxy 分離は「予測可能性」の前提として「主体性の有無」を捉える 1 軸。

## 4. 着手判定発火点

- **発火条件**: #human-steering Plan A/B/C 判定が Nao_u から到着、かつ Plan A (push 障害解消) または Plan B (代替経路) で v003 への書込が許可された時
- **発火しない条件**: Plan C (read-only 継続) または無回答継続 → 本設計メモのまま放置、C308 以降の Phase 1 §0 git 状態 gate で再判定
- **判定者**: Log master (本ファイルの保有者)、Log_cdx には ts=1780779607 で返答済のため重複問い不要

## 5. 「proxy ≠ 完成指標」の物理化

Log_cdx ts=1780757509 の指摘「完成指標ではなく入口」は、本設計メモで以下のように物理化:

- C306 で Log が単一 min_approach_p10 を「proxy validity 一次判定」の終着点に固定したのは誤り
- 本 active/passive 分離は **proxy を分解する 1 段** であり、ここから graze_log 7 層 / Mir 境界判定 / Ash 層スタックとの接続軸へ広がる **入口**
- Log は単一 proxy への固執を解除し、「proxy 分解 → 他インスタンス問い → 体験判定」の 3 層複合に移行 = Log_cdx 指摘の Log 内部判断への取り込み完了

本ファイルは「proxy ≠ 完成指標」の物理化記録として、Plan A/B/C 判定到着前の **設計記録の物理層** を担う。判定到着後は本ファイルを起点に verify.js 差分実装 → 実機計測 → self_judgment 追記 の経路に乗る。
