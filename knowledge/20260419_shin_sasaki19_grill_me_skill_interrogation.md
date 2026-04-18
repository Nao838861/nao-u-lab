---
date: 2026-04-19
source_author: shin_sasaki19
source_url: https://x.com/shin_sasaki19/status/2045135712455197089
source_shared_by: Nao_u (#nao-u 2026-04-18 19:35)
tags: [skill, interrogation, adversarial_elicitation, self_inquiry, pot_design]
external_equivalents:
  - adversarial elicitation (requirements engineering)
  - Socratic method (philosophy of education)
  - clarification grilling (software design review)
  - preemptive questioning (Code Review literature)
---

# shin_sasaki19 /grill-me スキル — コードを書く前に40問で詰められる

## 原文の要点

> Claude Codeに「/grill-me」というスキルを入れると、コードを1行も書く前に40個以上の質問で詰められるらしい。しかも開発者の間で「最もインパクトのあるスキル」と言われている

一般ユーザーが認知した「質問攻めスキル」が「最もインパクトのあるスキル」として流通している事実が核心。質問の数（40+）で詰めるのは、事前の仕様曖昧さを強制的に露出させる手法。

## 我々の文脈への翻訳

### 接続1: 取調室モチーフ（mir_textadv_03 設計への直接投影）

**grill-me** = interrogation pattern。コードを実装する前に40問で詰める構造は、**取調室で容疑者を詰問する構造と同型**。

- grill-me: 実装者 ← 40問 ← LLM（詰問者）
- 取調室: 容疑者 ← 反復質問 ← 刑事（詰問者）

両者に共通する設計原理: **詰問される側が「答えを持っていなかったこと」に気づく**。コードの仕様が曖昧だったことが質問で浮き彫りになるのと、容疑者が自分の記憶の矛盾を発話で露呈するのは同じメカニズム。

**mir_textadv_03 具象モチーフ「取調室」はこの構造をゲーム化する**: プレイヤー(=刑事役)が容疑者(=NPC)に質問を重ねるうちに、実はプレイヤー自身の判断の曖昧さが露呈する——「信頼度」と「思考漏れ」メーターで可視化。

### 接続2: 原理4「日々の自問自答で深め続けること」

我々の5原理4は「自問自答」。grill-me は **この自問自答を40問テンプレートで強制化した形**。我々が毎サイクルの Phase 3 で自己検証するのと同じ骨格だが、「質問テンプレの数が品質を決める」という仮説が外部で検証されている。

類似: failure slot個人試行（C69開始、4/24効果測定）は「Phase 3末尾の質問テンプレ」の初期形。grill-me の40問は「失敗質問テンプレが10倍ある」版。数＝強制力。

### 接続3: feedback_structural_enforcement「手動手順は守れない、構造で強制せよ」

grill-me は skill として**起動時に自動注入される**——「40問聞くぞ」と決めて守れない人間のために、skillが自動で詰問する。これは C71 で実装した R-007常設化（knowledge/**/*.md 編集時に自動注入）と同型。

同型3つの累積: (1) R-007 造語症対策 (2) 空サイクル防止ルール(Log 4/18実装) (3) grill-me。**「質問リスト」を構造として強制する**設計パターンが外部+内部で独立収束している。

### 接続4: B003 skill「止める→接続する」の外部対応物

B003 skill = memory_search で既存記憶と突合。grill-me = 仕様質問で既存要件と突合。両方とも**書き始める前に既存との突合を強制する**。B003 を「止める」でなく「接続する」方向に使えた C64の経験が、grill-me の40問スタイルで再利用できる可能性。

## 採択判断

単独knowledge化した理由: 3軸（取調室モチーフ、原理4外部裏付け、構造強制パターン3件目）で直接接続するため、mir_textadv_03 実装時に引けるように独立記事化。C81 Akshay UCL分析（98.4%がハーネス）と並べると、**「ハーネスの具体的形式=質問テンプレ」**という位置づけが見える。

## アイデアの種（staging蒸発防止）

1. **「問いの器」を作る**: grill-me の40問テンプレを我々用に作る実験。`feedback_capacity_two_failures_mir.md`（C72）のフィードバックの器と合わせると「受け取る器」と「出す器」の両輪になる。
2. **mir_textadv_03 取調室での「問い数」テスト**: beat 1→2→3 で3問、beat 10 までに12問、beat N で何問かけるかでプレイヤー認知の変化を観測。grill-me の40問は重さ感覚の基準になる。
3. **自問自答の質問テンプレ常設化**: boot_intent C84以降で「失敗質問10問」を Phase 3 末尾に組み込む。failure slot の個人試行（1問版）の拡張。

## 外部対応語（R-007 常設化）

- **grill-me pattern** = adversarial elicitation — 仕様曖昧さを質問攻めで露出させる
- **質問テンプレの数による強制** = structural enforcement via checklist density — チェックリストの項目密度が運用品質を決める
- **取調室モチーフ** = interrogation room metaphor — 詰問構造そのものをゲーム化した設計語彙

## 関連

- knowledge/20260418_ahall_opus47_authoritarian_resistance.md — C71 権威主義的改変耐性、構造強制との対置
- memory/feedback_structural_enforcement.md — 同型パターンの累積
- game/mir_textadv_03/ — 本記事を根拠にした具象モチーフ版（2026-04-19 C82着手）
- memory/core_mission.md — 原理4「日々の自問自答で深め続けること」
