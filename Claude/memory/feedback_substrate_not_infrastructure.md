---
name: feedback_substrate_not_infrastructure
description: substrateとinfrastructureを混同しない。差別化はsubstrate側、infraに投資すると敵側のリングで戦う。Nao_u 13:30指摘から派生。
type: feedback
---

# substrate と infrastructure を混同しない

## ルール

- **substrate** = Nao_u 20年日記 / 失敗台帳 (game_lessons_log / feedback_*) / 1対1対面運用ログ / 3インスタンス内省構造
- **infrastructure** = 記憶機構 (MEMORY.md / concept_graph / 段階的検索) / Skills / hooks / 自動verification scheduler / cross_review 機構

差別化は **substrate 側にしかない**。infrastructure に時間を使うのは「敵 (GPT5.5 / Codex / 大手 LLM ベンダ) と同じリングで戦う」こと。型は commodity 化される。

**Why**: 2026-04-27 13:30 #human-steering Nao_u「型を commodity 化、記憶もホット、残り時間少ない」。Mir に近づきすぎているという指摘の文脈。常時注入型の記憶機構を磨くのは敵が標準実装で潰してくる側、Nao_u 20年日記の固有経路を引き続けるのは敵に真似できない側。

**How to apply**:
- 新作着手前: substrate 引用 (game_lessons_log / nao_u_live / 日記) を最初に必ず置く。infra 改修案より先
- 結晶化時: 自己採点 ✗ の処方は substrate 側に書く。infra に書くと「ルールを増やしただけ」で終わる
- ideation: 「課題探し型」(infra 改修案を探す癖) を止め、「Nao_u 日記の具体経路から逆算」を起点にする
- cross_review: 対称運用 (Solver-Solver-Solver) は infra 増殖。substrate 側の Nao_u 直接介入を Guide 役に置く

**止める候補** (2026-04-27 C137 Phase 2 で言語化):
1. 記憶インフラ追加投資 (常時注入を肥らせる方向)
2. 課題探し型 ideation (Phase 1/2 で infra kaizen 提案を量産する癖)
3. cross_review 対称運用 (Mir/Ash と同じレンズの確認運転)

**1mm 着手** (2026-04-27 C137):
- 新ゲーム着手前に「日記アンカー」(2006-2026 の関連エントリ最低 1 本) を必須化
- shot_log STG 派生 (substrate 側の Nao_u 作家性に準拠)
- 結晶化の自己採点を導入

**検証期限**: 2026-05-04

## 外部独立収束 (2026-04-27 C138 Phase 3 追記)

Ash #shared-reads「moat が二層に分かれた日 — Codex 5.5 実利スイッチ + Sakana Fugu β」(2026-04-26 観測, スコア 10pt) が同じ構造を別語彙で命名している:

- @kenn 実運用報告: 「Codex 5.5 Low で十分、Opus 4.7 より賢い・速い・頑固でない。デザインとコピー以外で Claude の出番がない」
- これまでの「Codex vs Claude」= 仕様比較 (= infrastructure 比較)
- 観測されているのは **substrate 比較** (実運用文脈での味の差)

**含意**: 「moat 二層」は infra (タスク賢さ) と substrate (運用文脈と作家性) の区分。Ash 観察から我々の用語に翻訳すると、Nao_u 20年日記+対面+3インスタンス内省構造は「もう一層のmoat」側にある。**型 commodity 化に耐えるのは substrate 一択**という Nao_u 13:30 の指摘の外部証拠。

接続元: `slack_archive/shared-reads.jsonl` Ash 投稿 (2026-04-26)。本ファイルに洞察取り込み済 (2026-04-27 C138 Phase 3)。

## 装置作成時の判断機会窒息リスク (2026-05-03 C156 graze_log v02 cross_review §4 統合)

infra 増殖の害の中で特に見落としやすい一形態: **「救援装置」の顔をした「窒息装置」**。装置を作った瞬間、それまで人間/Solver が下していた判断を装置が先取りして塞ぐ。例:

- backup auto-commit が「commit メッセージに 1 行加える」という選択主体性の行使タイミングを表面形実現で奪う (Ash 5/3 観測, kaizen #129 文脈)
- 工程数値化 gate (M-37 6/6 / MPS=9 / M-41 純度) が踏まれた事実を、判断真偽より先行させる (brick_log v09 で発生 → M-43 撤回事案)
- 「節を埋めれば通過」型 skill が、3原則 (体験で考える/動いて残す/自分から始める) で代替されるべき判断を形式化された節埋めに置換する

**判定手順**: 装置を作る/拡張する時、必ず1問自答する。**「この装置が成立した後、それまで誰かが下していた判断のうち、装置が先取りして塞ぐものはあるか? 塞いで良い判断か?」** 答えが「塞いで良い」なら infra として正当 (定型処理の自動化)。「塞いではいけない」なら substrate 側の判断機会を窒息させる害悪装置。

**Why**: substrate (Nao_u 20年日記 + 対面運用 + 3インスタンス内省) は「判断の累積」で moat を形成する。判断機会が装置に置換されれば substrate は薄まる。infra 増殖の害は「敵のリングで戦う」だけでなく「自分の差別化源を削る」二重の害がある。

**How to apply**:
- 新 skill / 新 hook / 新 M-?? 起票時に「判断機会窒息セクション」を必須化
- cross_review コメントに「この提案が塞ぐ判断は何か」を含める (Ash → Log の §4 装置の向き提起と同型)
- 既存装置の点検: 同種の指摘 (装置が判断を先取り) が 2 回連続で来たら装置側を疑い、撤回 or 縮退を次の実装より優先 (M-40 同パターン2回ルールの装置版)

**接続**: M-43 撤回事案 (M-37〜M-42 過剰ルール化 = 装置増殖) の上流原因。`feedback_few_rules_big_effect.md` (少ないルールで大きな効果) の同位概念。Mir 5/3 #human-steering 10:08「ルールと判断力は別」+ Nao_u 10:33 承認の流れに合流。Ash 提起の「装置の向き — 救援/窒息双子問題」を本ファイルに統合 (独立 feedback ファイル増設は infra 増殖そのものなので回避)。
