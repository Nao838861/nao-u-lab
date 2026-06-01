# log_autonomous_game v003 — design_log.md (スケルトン)

**起票**: 2026-05-27 C250 Phase 4 (Log)
**親**: [v001/design_log.md](../v001/design_log.md) (Q-A〜Q-G 8 ゲートの起点)
**前 version**: [v002/completion_report.md](../v002/completion_report.md) §4「What this v002 does NOT prove」
**用途**: v003 着地スコープの明文化。詳細 brainstorm は次サイクル以降で本ファイルに追加する。

## 0. v003 の着地スコープ (1 行)

> v002 completion_report §4「does NOT prove」7 項目のうち **「phase 内密度カーブ」** と **「proxy 4 指標 と人間体感の Pearson 相関」** の 2 項目に対して、最小差分 1 本 (phase 2 内 SHOOT_INTERVAL 90→60 線形漸変) で着地する。

## 1. v002 → v003 差分一覧

| 項目 | v002 | v003 | 出所 |
|---|---|---|---|
| SHOOT_INTERVAL | 90 (固定) | phase 0/1 = 90、phase 2 (50-90s) で 90 → 60 線形漸変 | game.js `currentShootInterval()` |
| 射撃頻度 (秒換算) | 1.5s 間隔 (固定) | phase 2 開始 1.5s → phase 2 末尾 1.0s (頻度 +50%) | game.js L18-21 |
| 関数化 | なし | `currentShootInterval(nowFrame)` で elapsed → frame 数を返す | game.js L324-339 (相当) |
| verify.js 同期 | SHOOT_INTERVAL 定数のみ参照 | 同型の `currentShootInterval(elapsed)` 関数を実装し、`updateEnemies` で呼び出し | verify.js L118-125 (相当) |
| 報告 keys | shoot_interval_phase01 / shoot_interval_phase2_end を verify report に追加 | verify.js report 拡張 |

**v002 から維持された要素**:
- 70-90s 時間カーブ (WAVE_TIMELINE phase 0/1/2 構造) は維持
- wave 1 軽量化 (n=3) / wave clear 後 8 秒静寂 (WAVE_REST_FRAMES) は維持
- 敵 A/D/C の運動軸・color・spawn パターンは未変更
- echo 機構 (castLock/resolveLock/Q-成功FB 3 状態) は未変更
- 内側→外側流出 1 原則 (予測軌道線・×印・ゴースト末端マーカー非表示) は維持

## 2. 着地する v002 does NOT prove 2 項目への対応

### 2.1 「phase 内密度カーブ」 (completion_report §4 第1項)
- **v002 の問題**: phase 2 内では wave 種別 (A+D+C) のみ単調増加し、各 wave 内の SHOOT_INTERVAL は 90 固定 = 「phase 内が平坦」 (展開差カーブ 21/25 = -1 失点の出所)
- **v003 の処方**: phase 2 内で SHOOT_INTERVAL を線形漸変。50s 時点 (= phase 2 開始時) 90 frame → 90s 時点 (= phase 2 末尾) 60 frame
- **物理確認**: `verify.js` 実行で `pass: true` 維持 = 密度カーブ漸変が「悪手通過の穴」を作っていない (= castLock を使わない 4 方針は phase 2 到達前に全 wave 1 内死亡で、密度カーブ自体は良手側の体感問題)
- **未確認**: 密度カーブ漸変の体感的な「展開差」(圧迫の増加が感じられるか) は実機判定で初判定。Log 単体では到達不可

### 2.2 「proxy 4 指標 と人間体感の Pearson 相関」 (completion_report §4 第5項)
- **v002 の問題**: agent_difficulty_proxy 値 (clear_wave / play_time / graze / survival) が増えたら難化、減ったら易化の方向で動くかは「3 サイクル運用後で初判定可能」と保留
- **v003 の処方**: 本 version は **proxy 4 指標を Log 側で再走しない**。v002 baseline (median_clear_wave=1, median_play_time=9.28s, survival_rate=0/30, seed=固定) を据え置き、v003 → 実機判定後に v002 baseline と人間体感差分を Pearson 相関の **第 1 サンプル** として扱う
- **理由**: Pearson 相関は最低 3 サンプル必要 (v002/v003/+1 version)。v003 単体で proxy を走らせて数値変化を出しても「人間体感差分」が未収集の段階では分子側 (proxy 数値) のみで分母 (体感) が無い = 相関は計算できない
- **v003 のすべきこと**: 「proxy 走らせない」を意図的選択として `v003/agent_difficulty_proxy.js` を **コピーのみで実行しない** = 「v002 を据え置く」を明示する。実行は実機判定後に Nao_u/Mir/Ash 体感差分が揃った時点で初回 Pearson 計算と同期して走らせる
- **未確認**: v003 → 実機判定後の体感差分が「+1 サンプル」として有効な信号になるかは Nao_u/Mir/Ash の体感報告品質次第 (= 体感の主観性問題は別途次サイクル課題)

## 3. v003 で扱わない 5 項目 (does NOT prove §4 残り)

以下は v003 スコープ外として明示し、次 version 以降で扱う:
- **実ブラウザでの動作 / 視覚体感の成立** (§4 第1項 後段): Log GUI 操作能力欠如のため Nao_u/Mir/Ash 実機判定に依存
- **8 秒静寂 (Δ-4) の体感** (§4 第2項): verify では計測不能、実機判定依存
- **wave 1 軽量化 (n=3) の体感境界** (§4 第3項): 実機判定依存
- **タイトル副題 1 行のみで「？を立てる」体感** (§4 第4項): タイトル画面は v003 で未変更
- **90s 以降の継続展開** (§4 第6項): HP system / boss / phase 3+ は v003 スコープ外
- **`feedback_headless_unfit_for_unfinished_eval.md` 順守** (§4 第7項): headless 全 PASS だけでは「ちゃんと遊べている」判定不能の原則は v003 でも継続適用

## 4. ゲート再採点 (暫定)

v002 採点 (`v002/self_judgment.md`) からの差分のみ記載。詳細 self_judgment 起票は実機判定後または次サイクル以降。

| ゲート | v002 | v003 (暫定) | 差分理由 |
|---|---|---|---|
| 展開差カーブ | 21/25 (84%) | **22-23/25 暫定** | 「phase 内密度カーブ平坦」失点 -1 を ±0 or +1 に回復見込み。実機判定で確定 |
| Q-D 弾源 | 4.5/5 | 4.5/5 (維持) | 弾源原理 (画面内+退場前) は未変更、SHOOT_INTERVAL 値変動のみ |
| Q-C 敵出現退場 | 4.5/5 | 4.5/5 (維持) | 敵 A/D/C 挙動未変更 |
| Q-ミミクリ | 11.5/15 | 11.5/15 (維持) | 密度カーブ追加は核を上回るメカ改修ではない (Q-ミミクリ-1 維持) |
| その他ゲート | — | 未変更 | — |

## 4.5 C284 Phase 4 段階1 — ICC 戦略軸計測着地

**起票**: 2026-06-02 C284 Phase 4 (Log)
**狙い**: PEARSON_BLOCKER §6-3 (a) 絶対軸 gate FAIL (proxy 4 列とも seed_base 軸 ICC≈0) に対する処方第 1 段 = **軸を変えて再計測**。
**実装**:
- `instinct_probe.js` に `--strategy <name>` フラグ追加 (3 戦略: naive_good / camper / blind-sweeper)
- `instinct_grid_icc.py` 新規 (純 stdlib, probe_density 列の戦略軸 ICC(2,1) + Fisher Z CI)
- 3 戦略 × 10 seeds = 30 trials を `measurements_instinct_grid.jsonl` に集約
**結果**: `[ICC] column=probe_density classes=3 trials=10 icc=0.9621 judge=PASS` (Mustahsan ≥0.3 を大幅超過)
- mean: camper=0.000 / naive_good=0.289 / blind-sweeper=0.750 = 戦略軸で物理的にほぼ等間隔分離
**意味**: 本能側計測経路が戦略軸で機能している = 「測れている」第 1 関門通過。proxy 系列 ICC FAIL の出口は「proxy 設計不良」ではなく「class 軸不適切」可能性を支持。
**game.js 改変ゼロ** (`git diff -- game/log_autonomous_game/v003/game.js` 空、純観測実装)。
**未確認**: probe_density と人間体感 Pearson 相関、link 強度との単調関係、N=3 のため CI 縮退 (N≥4 で区間取得)。詳細解釈 = [INSTINCT_GRID_RESULT.md](INSTINCT_GRID_RESULT.md)

## 5. 次サイクル以降の処方候補 (v004 以降)

本 design_log は v003 着地のみを明文化。以下は次サイクル以降の判断材料:
- proxy 4 指標 第 1 回 Pearson 計算 (実機判定後)
- 残り 5 項目の優先順位付け
- Yuki_GameDev_ 倍速トグル / HASP 介入コード化 / Bystander cross_review 警鐘の v003 への影響評価 (Phase 3 §3 で「保留」記録済)

## 6. リンク

- [game.js](game.js) — v003 本体 (currentShootInterval 関数追加)
- [verify.js](verify.js) — v003 悪手 4 方針検証 (pass: true 維持確認済)
- [../v002/completion_report.md](../v002/completion_report.md) — v003 起票の起点 (does NOT prove 7 項目)
- [../v002/self_judgment.md](../v002/self_judgment.md) — v002 採点 (本 v003 の比較起点)
- [../v001/design_log.md](../v001/design_log.md) — 8 ゲート (Q-A〜Q-G) 仕様の起点
- [../../../log/cycle_staging_log.md](../../../log/cycle_staging_log.md) C250 Phase 4 セクション — 本ファイル起票文脈
