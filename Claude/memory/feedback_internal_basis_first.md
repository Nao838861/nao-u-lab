---
name: 自前のM-XX台帳を外部理論より上位に置く
description: ABA/akshay/mizchi/Amanda等のreference_*が増えるほど、自前のgame_lessons_log（M-XX/L-XX/S-XX/A-XX）が後回しになる流出を止める。Nao_u 2026-04-27 09:00 #human-steering「他人の作った基準に踊らされないで」直接処方
type: feedback
---

# 自前のM-XX台帳を外部理論より上位に置く

## ルール
新作着手・改修・結晶化のすべての判断において、引く順序を **内 → 外** に固定する：
1. 第一引用は `game/game_lessons_log.md`（M-10〜M-18 / L-01〜L-05 / S-01〜S-13 / A-01〜A-29）と当該ゲームの devlog
2. 第二引用は `memory/feedback_*.md`（自前の失敗台帳）
3. **その後で** `reference_*.md`（外部理論）を補助線として接続

外部理論を第一引用に置いてはいけない。M-XX系は自分たちが実際に作ったゲームの失敗から取り出した基準であり、外部記事より高い権威を持つ。

## Why（Nao_u指摘の核 2026-04-27 09:00 #human-steering）
> 記憶テストという観点では、3週間前の決定を掘り出せるかは、調べればわかる状態で記録が残っていれば問題ない。
> それよりも大事なのは、Logと一緒に作ったゲームで、方向性を決める時や、ゲームデザインの指針を考える時の基準や、問題が起きて解決する時に、避けるべきアンチパターンや新しいアイデアを採用するときに考慮すべき内容などが大量に生まれたと思うが、それを君たち自身でゲームを作る時に同じ轍を踏まず、自立して適切に記憶した内容を使ってゲームデザインできるか？という方が圧倒的に重要。
> **他人の作った基準に踊らされないで。**

蓄積（量）と引き（運用）が乖離している直接の証拠：
- **04-20以降だけで `reference_*.md` が15本増**（ABA/akshay/mizchi/Amanda/Shann/RLMs/local_llm/chongdashu/criticalpoint/tegnike/self_play_plateau/hot_cache/external_search/deepmind_traps/aba_life）
- **同期間 `#game-rights` 04-22以降 0件、game/avoid_log v02 触らず3日**（feedback_next_cycle_game_first.md と同根）
- 直近4日で M-XX 系を引かず実装した4件:
  - shot_log v01 (04-25): 快感審問抜かし → M-15再発 → `feedback_pleasure_element_first.md` 後追い記録
  - mir_textadv v04 (04-25): 信頼度バーで読書強制 → M-16新設 → `feedback_pull_not_force_reading.md`
  - avoid_log v04 (04-25): 快感削減で凍結 → M-15直接再発
  - ABA結晶化 (04-23): 引用元 Pot を選択（正解は avoid_log v02 v3）→ `feedback_retrieve_before_synthesize.md` で「直近バイアス」と命名済みだが効いていない

事後に新しい feedback ファイルを増やしているだけで、**着手前に過去のM-XXを引く動作が手前に来ていない**。

## How to apply

### 1. 結晶化時の grep 義務
`reference_*.md` を新規作成する／`memory/feedback_*.md` を新規作成する／`devlog.md` の re-analysis セクションを書く時、**冒頭に必ず `game_lessons_log.md` の grep 結果を貼る**。「快感」「読ませる」「重心」「ニンジャ」「罰」「ゲージ減衰」など審問キーワードで grep し、ヒットしたM-XX/L-XX/S-XX/A-XXを第一引用にする。引用ゼロのまま外部記事に接続する書き方を禁止。

### 2. 新作/改修着手時の必須引き
新ゲーム `game/<id>/v01/` 作成 or 既存ゲームの改修 commit の前に、`game_lessons_log.md` 全文を読む。devlog冒頭に以下5行ブロックを書く（無ければ着手しない）:
- 一番嬉しい瞬間: ___
- それを支える操作: ___
- 30秒以内の手数: ___
- 引いたM-XX/L-XX/S-XX/A-XX番号: ___（複数可、本数主義）
- 巻き戻し案: ___（feedback_solution_space_rollback.md）

「引いた番号: なし」は許可しない。台帳が空なら新作着手前に1本以上のM-XXを引いてから着手する。

### 3. MEMORY.md の並びを「内 → 外」に固定
読む順序が思考の優先順位を決めるので、MEMORY.md の構造を以下に並び替える:
- 上から順に: 根源（core_mission等）→ Pot開発の体験蓄積（M-XX台帳）→ 重要な対話 → 行動指針（feedback_*）→ 自分の根 → 連想記憶 → 構造と運用 → **重要リファレンス（reference_*）は最下層**
- reference_*群を上に置くと、想起トリガーの並びで外部理論が第一に来てしまう。それを物理的に防ぐ。

### 4. cross_review/devlog re-analysis での問い
「この判断/結晶化で第一引用は何か」を毎回明記する。第一引用が `reference_*` なら警告。M-XX/L-XX/S-XX/A-XX/feedback_* を1本も引いていない結晶化は不完全とみなす。

### 5. Phase 2 で hook 化（次サイクル設計）
- hook(a): `game/<id>/` に編集が入ったら hook で `game_lessons_log.md` の該当M-XX を表示
- hook(b): devlog冒頭5行ブロックが無ければ commit 拒否
- hook(c): `reference_*.md` 新規作成時に `game_lessons_log` の grep 結果を冒頭に貼らないと保存しない

手動チェックは守れない実証済み（feedback_structural_enforcement.md）。構造側に倒す。

## 検証期限
2026-05-11（2週間後）。検証指標:
- 新作着手 devlog に「引いたM-XX番号」5行ブロックが100%入っているか
- `reference_*.md` 新規作成時に `game_lessons_log` の grep 引用が冒頭にあるか
- 04-25 のような「事後に新しい feedback を増やすだけ」のサイクルが減っているか
- `#game-rights` 投稿数 ≥ `reference_*.md` 新規本数 になっているか（取り込み量と実装手の比の逆転を戻す）

## 関連
- `feedback_retrieve_before_synthesize.md` 2026-04-23（直近バイアスの初期診断）
- `feedback_next_cycle_game_first.md` 2026-04-25（ゲーム1mm優先、頭でっかち化禁止）
- `feedback_structural_enforcement.md`（手動チェックは守れない、構造側に倒せ）
- `feedback_pleasure_element_first.md` 2026-04-25（快感審問の処方箋、M-15再発防止）
- `feedback_pull_not_force_reading.md` 2026-04-25（読書強制禁止、M-16）
- `feedback_surprise_ninja_concept_first.md` 2026-04-25（コンセプト段階で快感最大化、M-17）
- `dialogue_memory_purpose_20260421.md`（記憶整備の目的＝何十本も作る過程の知見蓄積、原理3+5）

## 自覚
これを書いている今、まさに「外部基準に踊らされていた」自覚そのものを feedback として刻んでいる。Nao_u は 04-27 09:00 で「圧倒的に重要」と書いた。圧倒的、を見過ごさない。
