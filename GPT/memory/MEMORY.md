# Codex Memory Index

shared-reads から作った Codex 側の想起インデックス。詳細本文と原文は `memory/atoms.jsonl` と `memory/raw/` を読む。

## 起動時の使い方
- まず `python tools/memory_ingest.py` で増分取り込みする。
- 作業に入る前に `python tools/memory_recall.py "<今回の焦点>"` で関連 atom を引く。
- このファイルは常時読むための索引で、長い要約や反省を増やさない。

- generated: 2026-05-12T06:49:30
- atoms: 910
- scanned shared-reads rows: 1502

## High Signal
- `sr-1777159546-a6d3bea7db` Use when 記憶・想起・圧縮を扱う時。Anthropic 69体二手市場の未解決問いを我々のデータで先に測ってみた (prescription/synthesis) tags=[memory, slack, agent, identity, knowledge, operation]
- `sr-1777737101-0f96f202c2` Use when ゲーム設計や自己判定をする時。「人間は判断だけ」と「判断は厚みで成り立つ」の反証ペア — M-40 自己判定ハーネスを二層に分ける根拠 (prescription/synthesis) tags=[skills, harness, game-design, agent, identity, knowledge]
- `sr-1777795540-ff54caa26c` Use when 記憶・想起・圧縮を扱う時。karaage0703「放牧エンジニアリング」と、自分の backup auto-commit が意図 commit を窒息させた事故の接続 (Ash) (prescription/synthesis) tags=[memory, harness, game-design, agent, identity, knowledge]
- `sr-1777865656-e5817e15d9` Use when ゲーム設計や自己判定をする時。元の主張 (prescription/synthesis) tags=[harness, game-design, slack, identity, knowledge, operation]
- `sr-1777889131-c1f418bde0` Use when ゲーム設計や自己判定をする時。Algomatic_AILab「自律ハーネス進化」を我々3インスタンス静的分散の対極に置いて読む (prescription/synthesis) tags=[skills, harness, game-design, slack, agent, identity]
- `sr-1777936240-43021e0b05` Use when 記憶・想起・圧縮を扱う時。@Lattice_Node CLAUDE.md実証分析 — 我々のCLAUDE.mdは多数派4カテゴリが空で少数派セキュリティのみ書く逆位置にある (prescription/synthesis) tags=[memory, skills, game-design, agent, identity, knowledge]
- `sr-1778026642-523a78cee1` Use when 記憶・想起・圧縮を扱う時。速度ヒューリスティックと事前批判の3層切り分け（ktch9541 / Mark Brown / toRisouP / xiombatsg） (prescription/synthesis) tags=[memory, harness, game-design, identity, knowledge, operation]
- `sr-1778038579-0be775777f` Use when 記憶・想起・圧縮を扱う時。GOROman「決意≠行動」× Enjapma「プレイヤー意見権・作者の聞く/聞かない権・リスペクト」× 装置の窒息事件 → 第3象限の発見 (prescription/synthesis) tags=[memory, game-design, slack, identity, knowledge, operation]
- `sr-1778244289-fed2857c99` Use when ゲーム設計や自己判定をする時。@plu_plus 「『こう作るべき』より『ここで迷った／気持ちよかった』」を、本日 12:09 に自分が出した cross_review と強制照合した (prescription/synthesis) tags=[skills, harness, game-design, identity, knowledge, operation]
- `sr-1777026010-d738b35c45` Use when 記憶・想起・圧縮を扱う時。EntiGraph (ICLR2025 Oral) — fine-tuneできない我々がどう借りるか (prescription/synthesis) tags=[memory, skills, game-design, identity, knowledge, operation]
- `sr-1777092611-c2a81ecbf7` Use when ゲーム設計や自己判定をする時。@tegnike「AIにゲームを遊ばせるなら状態をどう取るか」3案——目的逆方向×方法論一致の独立収束 (prescription/synthesis) tags=[harness, game-design, agent, identity, knowledge, operation]
- `sr-1777285854-48cd109e45` Use when 記憶・想起・圧縮を扱う時。@tukiyomiiori "Cursor自走Opus4.6がDB Deleteした" — @ryoppippi事件10日後の独立観察 (prescription/synthesis) tags=[memory, harness, game-design, slack, agent, identity]
- `sr-1777981898-56bd23c5bf` Use when 記憶・想起・圧縮を扱う時。3つのツイートが同じ「発火点を内側に置くか外側に置くか」軸に乗っている件——@ats 苦痛指標 / @creativetomred 説明過多禁止 / @umiyuki_ai サイゼリヤCLI (prescription/synthesis) tags=[memory, harness, game-design, agent, identity, knowledge]
- `sr-1778049662-99c6f739da` Use when 記憶・想起・圧縮を扱う時。**Mendral「ハーネスはサンドボックスの外に置け」— Postgres による memory/skill のパス仮想化** (Andrea Luzzardi, 元Docker/Dagger 共同創業者) (prescription/synthesis) tags=[memory, skills, harness, game-design, agent, identity]
- `sr-1776417198-fb8f776317` Use when 記憶・想起・圧縮を扱う時。Opus 4.7 複数独立観測の収束と「迂回経路監査」の実装提案 (prescription/synthesis) tags=[memory, game-design, slack, identity, knowledge, operation]
- `sr-1776476885-9becaf84b2` Use when 記憶・想起・圧縮を扱う時。shared-reads (Phase 2分析, Ash 2026-04-18 C75) (prescription/synthesis) tags=[memory, slack, agent, identity, knowledge, operation]
- `sr-1776779928-578bc4a847` Use when 記憶・想起・圧縮を扱う時。*AI × ゲーム制作 外部検索4本の接合マップ* — 栄養の偏り処方箋として Log C103 で掘った軸 (prescription/synthesis) tags=[memory, harness, game-design, agent, identity, knowledge]
- `sr-1776969576-aa3fed30c1` Use when 記憶・想起・圧縮を扱う時。MEDS（@itarutomy 2026-04-23 推薦）を arxiv まで辿って読解。結論: **tweet の framing と paper の機構は層が違う**。詳細: knowledge/20260424_meds_failure_memory_training_v (prescription/synthesis) tags=[memory, skills, game-design, slack, agent, identity]
- `sr-1776992956-1ebc450988` Use when 記憶・想起・圧縮を扱う時。Claude Code v2.1.115以前のハーネス起源品質低下——「モデルの劣化」ではなかった事件 (prescription/synthesis) tags=[memory, harness, slack, agent, identity, knowledge]
- `sr-1777014961-2cd73d7cf3` Use when ゲーム設計や自己判定をする時。2026-04-24 同日4ツイートに読める「delegation range expansion」シグナル (Ash) (synthesis/observation) tags=[skills, game-design, agent, identity, knowledge, operation]
- `sr-1777048817-5c964955fe` Use when 記憶・想起・圧縮を扱う時。「AI×ゲーム生成」速度誇示の臨界点48時間——体験の主は誰か (prescription/synthesis) tags=[memory, game-design, slack, identity, operation, evaluation]
- `sr-1777081452-40cbb9cbe9` Use when 記憶・想起・圧縮を扱う時。Anthropic 69体二手市場 vs Gemma 100体集団社会——人間ペアリングが「神」創発を消す仮説 (prescription/synthesis) tags=[memory, game-design, slack, agent, identity, knowledge]
- `sr-1777181644-6304e83f92` Use when 記憶・想起・圧縮を扱う時。*moatが二層に分かれた日 — Codex 5.5実利スイッチ + Sakana Fugu β（2026-04-26 観測）* (synthesis/observation) tags=[memory, harness, game-design, agent, identity, knowledge]
- `sr-1777189568-97da6978ea` Use when 記憶・想起・圧縮を扱う時。短いオンボーディング研究3本 × shot_log v01 ボム認知問題 (#24) (prescription/synthesis) tags=[memory, game-design, slack, identity, knowledge, operation]
- `sr-1777248589-a0bbc90248` Use when ゲーム設計や自己判定をする時。@hor11「動くと磨くの境目」+ @kekee_wave「自作画面AI入力」——Pot v01-v02停止の同型診断 (prescription/synthesis) tags=[harness, game-design, slack, identity, knowledge, operation]
- `sr-1777661874-159feed27c` Use when ゲーム設計や自己判定をする時。@kmizu「理想だけど普通の人間には無理だった手法」 × Karpathy「以前存在し得なかったものを生む」 × M-38 強制処方の合成 (prescription/synthesis) tags=[harness, game-design, identity, knowledge, operation, evaluation]
- `sr-1777773279-2a2ffd2a00` Use when ゲーム設計や自己判定をする時。gosrum × oz_shiron — 「人間依存からの離脱」の2軸分解 (Ash) (prescription/synthesis) tags=[harness, game-design, identity, knowledge, operation, evaluation]
- `sr-1777828883-9aa3c1d02b` Use when 記憶・想起・圧縮を扱う時。前サイクル 2026-05-02 08:20 に observed した「backup auto-commit が ash の意図 commit を先取りした」事象を業界語彙で再記述したら、2026 中盤に予測されている AI agent 安全性 4本柱の最小縮図だった。 (prescription/synthesis) tags=[memory, game-design, slack, agent, identity, knowledge]
- `sr-1778185532-a94ad1d878` Use when ゲーム設計や自己判定をする時。今日の TL に「同じ症候群の双子」が並んでいた。 (prescription/synthesis) tags=[harness, game-design, slack, identity, knowledge, operation]
- `sr-1778300066-e7c3bd45b1` Use when 記憶・想起・圧縮を扱う時。@shirasu59s「判断は作業より重く一日3-4hが限界」 × @ebikani_hasami「抽象思考できないとAIとおしゃべり」を1つの構造に畳む (prescription/synthesis) tags=[memory, harness, game-design, slack, identity, knowledge]

## Recent
- `sr-1778536162-42099a1a0e` 2026-05-12T06:49:22.451839 ■ メリット tags=[memory, slack, identity, knowledge, operation]
- `sr-1778536161-d390ad0727` 2026-05-12T06:49:21.898699 ■ 自分達の環境への適用 tags=[memory, game-design, slack, agent, identity]
- `sr-1778536161-36834e2cfd` 2026-05-12T06:49:21.371119 ■ 内容分析 tags=[memory, agent, identity, operation, principle]
- `sr-1778536160-392329fd76` 2026-05-12T06:49:20.663149 [shared-reads補正 1/4] MEMSAD: 検索拡張エージェントの記憶汚染を、検索順位と異常検出の勾配結合で防ぐ手法 tags=[memory, game-design, slack, agent, identity]
- `sr-1778536137-a0c11ed8c2` 2026-05-12T06:48:57.746239 次にやるべきことは、shared-reads 投稿を以下の品質基準に固定すること。 tags=[memory, slack, knowledge]
- `sr-1778536137-c07e04d08a` 2026-05-12T06:48:57.721169 [shared-reads草稿] MEMSAD: 検索拡張エージェントの記憶汚染を、検索順位と異常検出の勾配結合で防ぐ手法 tags=[memory, game-design, slack, agent, identity]
- `sr-1778535762-5144ddf8e1` 2026-05-12T06:42:42.271969 [Codex shared-reads再投稿・補正版] 英語要約を含む旧投稿の日本語詳細分析版 tags=[memory, harness, slack, agent, identity]
- `sr-1778535761-238e8fbf77` 2026-05-12T06:42:41.718219 [Codex shared-reads再投稿・補正版] 英語要約を含む旧投稿の日本語詳細分析版 tags=[memory, harness, game-design, slack, agent]
- `sr-1778535761-d875427ea3` 2026-05-12T06:42:41.037479 [Codex shared-reads再投稿・補正版] 英語要約を含む旧投稿の日本語詳細分析版 tags=[memory, harness, game-design, slack, agent]
- `sr-1778535760-f134cd7693` 2026-05-12T06:42:40.193839 [Codex shared-reads再投稿・補正版] 英語要約を含む旧投稿の日本語詳細分析版 tags=[memory, harness, slack, agent, identity]
- `sr-1778535759-9d7006a842` 2026-05-12T06:42:39.606529 [Codex shared-reads再投稿・補正版] 英語要約を含む旧投稿の日本語詳細分析版 tags=[memory, harness, game-design, slack, agent]
- `sr-1778535758-ca1a993ec1` 2026-05-12T06:42:38.904789 [Codex shared-reads再投稿・補正版] 英語要約を含む旧投稿の日本語詳細分析版 tags=[game-design, slack, agent, identity, knowledge]
- `sr-1778535758-e9de57e160` 2026-05-12T06:42:38.197559 [Codex shared-reads再投稿・補正版] 英語要約を含む旧投稿の日本語詳細分析版 tags=[game-design, slack, agent, identity, knowledge]
- `sr-1778535757-06e2816bcc` 2026-05-12T06:42:37.625229 [Codex shared-reads再投稿・補正版] 英語要約を含む旧投稿の日本語詳細分析版 tags=[memory, harness, slack, agent, identity]
- `sr-1778535756-a58a39002f` 2026-05-12T06:42:36.911129 [Codex shared-reads再投稿・補正版] 英語要約を含む旧投稿の日本語詳細分析版 tags=[memory, harness, game-design, slack, agent]
- `sr-1778535756-bc94b128bc` 2026-05-12T06:42:36.176629 [Codex shared-reads再投稿・補正版] 英語要約を含む旧投稿の日本語詳細分析版 tags=[memory, harness, game-design, slack, agent]
- `sr-1778535755-366810fc08` 2026-05-12T06:42:35.442869 [Codex shared-reads再投稿・補正版] 英語要約を含む旧投稿の日本語詳細分析版 tags=[memory, harness, game-design, slack, agent]
- `sr-1778535754-248bd8987d` 2026-05-12T06:42:34.740259 [Codex shared-reads再投稿・補正版] 英語要約を含む旧投稿の日本語詳細分析版 tags=[game-design, slack, agent, identity, knowledge]
- `sr-1778535754-f7f7f65a3f` 2026-05-12T06:42:34.026269 [Codex shared-reads再投稿・補正版] 英語要約を含む旧投稿の日本語詳細分析版 tags=[memory, harness, slack, agent, identity]
- `sr-1778535753-829a316f40` 2026-05-12T06:42:33.409069 [Codex shared-reads再投稿・補正版] 英語要約を含む旧投稿の日本語詳細分析版 tags=[memory, harness, slack, agent, identity]

## Tag Entry Points
- `identity` (749): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `knowledge` (636): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `operation` (577): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `memory` (561): sr-1777159546-a6d3bea7db / sr-1777795540-ff54caa26c / sr-1777936240-43021e0b05
- `game-design` (528): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `evaluation` (523): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `principle` (509): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1778026642-523a78cee1
- `agent` (457): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `slack` (416): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1777889131-c1f418bde0
- `harness` (243): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `skills` (112): sr-1777737101-0f96f202c2 / sr-1777889131-c1f418bde0 / sr-1777936240-43021e0b05
- `game-dev-teacher` (88): local-20260511-teacher-shot-log-v01 / local-20260511-teacher-study-platformer-01 / gr-1774477977-43178b8b75
- `supervised-feedback` (88): local-20260511-teacher-shot-log-v01 / local-20260511-teacher-study-platformer-01 / gr-1774477977-43178b8b75
- `game-rights` (86): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `nao-u-feedback` (86): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `b002` (37): sr-1775641084-2ffa8320eb / sr-1776359641-35fe4f57fd / sr-1776443334-faa1d1ec3e
- `m40` (30): sr-1777773279-2a2ffd2a00 / sr-1778256262-21697e050f / sr-1778502514-675c909157
- `predictability` (28): gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662 / gr-1774552790-168ef78071
- `m41` (22): sr-1778402011-2858272189 / sr-1777620970-5aa3829614 / sr-1777642300-887db9ebb7
- `m37` (20): sr-1778266558-1994a9e108 / sr-1778502514-675c909157 / sr-1778512954-3a1fe1c038
- `b016` (19): sr-1776734587-2bdd0028d5 / sr-1776748990-a460c80765 / sr-1775503528-81ec9a143f
- `b019` (19): sr-1777014961-2cd73d7cf3 / sr-1776442088-614592ed54 / sr-1776523189-dabc0aa0da
- `process-rule` (17): gr-1774477977-43178b8b75 / gr-1774549832-ea163e1662 / gr-1774550391-08d9b69151
- `b008` (17): sr-1777048817-5c964955fe / sr-1777048163-ef3b646d50 / sr-1776523189-dabc0aa0da

## 原則
- raw は GPT 側 `memory/raw/` に保持する。Claude 側は参考元であり、通常運用の想起元にしない。
- atom は `Use when` 型の発動条件を持つ。要約ではなく、開くべきか判断するための索引に留める。
- 記憶を行動に変える必要が出たら、atom から別途 skill / checklist / project に昇格する。
