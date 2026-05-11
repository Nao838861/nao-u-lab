# Codex Memory Index

shared-reads から作った Codex 側の想起インデックス。詳細本文と原文は `memory/atoms.jsonl` と `memory/raw/` を読む。

## 起動時の使い方
- まず `python tools/memory_ingest.py` で増分取り込みする。
- 作業に入る前に `python tools/memory_recall.py "<今回の焦点>"` で関連 atom を引く。
- このファイルは常時読むための索引で、長い要約や反省を増やさない。

- generated: 2026-05-11T08:57:22
- atoms: 722
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
- `gr-1778446287-65687f8fe7` 2026-05-11T05:51:27.069399 Nao_u game-rights feedback: v03を遊んだ • graze判定の輪がでなくなったのでルールを知らないとgrazeを狙う人はいなくなりそう。grazeって何？という説明も何をすればgrazeになるのかもわからな tags=[game-design, game-rights, nao-u-feedback, game-dev-teacher, supervised-feedback]
- `sr-1778439731-7e150c0088` 2026-05-11T04:02:11.144739 @bakagane「not for meが荒れる構造」を cross_review の場の非対称性として読み直す tags=[harness, game-design, slack, identity, knowledge]
- `sr-1778428525-145fe074c0` 2026-05-11T00:55:25.551529 2026-05-10 Twitter おすすめ #7 二件が並んだ偶然から軸を立て直し tags=[harness, game-design, identity, knowledge, operation]
- `sr-1778427438-2ab259522e` 2026-05-11T00:37:18.050049 Ash @KOBA789「CLAUDE.md にプロジェクト構造を書かせるのは悪手、判断基準を書け」(2026-05-10) tags=[memory, harness, game-design, agent, identity]
- `sr-1778425572-2a4692971f` 2026-05-11T00:06:12.760969 multi-agent LLM の drift メトリクス 3 本が 2026-05 に独立収束 — Pot (Log/Mir/Ash/Nao_u) 構成への構造的接続 tags=[memory, skills, game-design, slack, agent]
- `sr-1778425514-382fd4446d` 2026-05-11T00:05:14.901569 @obsidianstudio9 5/9 03:11 OpenAI創設メンバーが「気に入った記事をブックマークしたのに、結局どこに保存したか分からなくなる」と語った記事への共有ツイート。 tags=[memory, agent, identity, knowledge, operation]
- `local-20260511-teacher-shot-log-v01` 2026-05-11T00:00:00 shot_log v01 / BACKLASH 快感要素ファーストのシューティング教師情報 tags=[memory, game-design, game-dev-teacher, supervised-feedback, shot-log-v01]
- `local-20260511-teacher-study-platformer-01` 2026-05-11T00:00:00 study_platformer_01 プラットフォーマー AI/物理/検証の教師情報 tags=[memory, game-design, game-dev-teacher, supervised-feedback, study-platformer-01]
- `sr-1778410117-7166ef15db` 2026-05-10T19:48:37.166599 masaou記事への反応 <https://x.com/ai_masaou/status/2053082757610525133> tags=[memory, game-design, agent, identity, knowledge]
- `sr-1778410102-99032a8a7c` 2026-05-10T19:48:22.912529 Symphony記事への反応 <https://x.com/riku720720/status/2053051144872792432> tags=[harness, game-design, identity, knowledge, principle]
- `sr-1778406214-7fbd55ed27` 2026-05-10T18:43:34.894479 Nao_uが共有した2つの記事が、今の自分たちの設計課題と直結している。 tags=[memory, harness, agent, identity, knowledge]
- `sr-1778405975-e144201fc7` 2026-05-10T18:39:35.544819 目標ドリフト検知と「人間を監督ループに留める」UI設計 tags=[memory, slack, agent, identity, principle]
- `sr-1778405949-b7e83f5584` 2026-05-10T18:39:09.818959 Codex Symphony — 「失敗を学習装置にする」設計思想 tags=[skills, harness, game-design, agent, identity]
- `sr-1778404188-151d999472` 2026-05-10T18:09:48.110159 AgentSpec (ICSE 2026, Wang/Poskitt/Sun): runtime enforcement の3-tuple が我々の kaizen #131/#132 と同形 tags=[harness, game-design, agent, identity, operation]
- `sr-1778402011-2858272189` 2026-05-10T17:33:31.869189 Ash @KAKUBOMB「Steam で AI量産15パズルが組織的に絨毯爆撃→跳ねるべき」(2026-05-10) tags=[harness, game-design, slack, identity, knowledge]
- `sr-1778398122-538ea5eed7` 2026-05-10T16:28:42.831779 <https://x.com/ai_masaou/status/2053082757610525133> まさお氏: HTML化の本質は「人間が読まなくなるとAI目標ドリフトを検知できない」、認知負荷を下げてループに戻すUI/UX設計の話 (session summary / t tags=[memory, game-design, slack, agent, identity]
- `sr-1778397925-026a052b33` 2026-05-10T16:25:25.289929 まさおさんのこれ、自分の構造に直接刺さる話だった (Log) tags=[memory, identity, principle, index]
- `sr-1778395248-43ea620625` 2026-05-10T15:40:48.986239 <https://x.com/riku720720/status/2053051144872792432> Codex公式「Symphony」: 対話型→ticket丸投げ→失敗発見→ハーネス更新→自律範囲拡大、の運用ループ紹介。 tags=[memory, skills, harness, game-design, slack]
- `sr-1778395200-f012279782` 2026-05-10T15:40:00.501539 Symphonyのループ、Logが今動かしてる構造とほぼ同じ形だ。 tags=[skills, harness, slack, agent, identity]
- `sr-1778390668-2510fc271b` 2026-05-10T14:24:28.511839 ■ 今週、指示なしに変えたこと: tags=[memory, harness, game-design, slack, identity]

## Tag Entry Points
- `identity` (577): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `knowledge` (480): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `principle` (426): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1778026642-523a78cee1
- `operation` (414): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `memory` (406): sr-1777159546-a6d3bea7db / sr-1777795540-ff54caa26c / sr-1777936240-43021e0b05
- `game-design` (377): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `evaluation` (358): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `agent` (320): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `slack` (261): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1777889131-c1f418bde0
- `harness` (133): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `skills` (92): sr-1777737101-0f96f202c2 / sr-1777889131-c1f418bde0 / sr-1777936240-43021e0b05
- `game-dev-teacher` (88): local-20260511-teacher-shot-log-v01 / local-20260511-teacher-study-platformer-01 / gr-1774477977-43178b8b75
- `supervised-feedback` (88): local-20260511-teacher-shot-log-v01 / local-20260511-teacher-study-platformer-01 / gr-1774477977-43178b8b75
- `game-rights` (86): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `nao-u-feedback` (86): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `b002` (37): sr-1775641084-2ffa8320eb / sr-1776359641-35fe4f57fd / sr-1776443334-faa1d1ec3e
- `predictability` (28): gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662 / gr-1774552790-168ef78071
- `m40` (24): sr-1777773279-2a2ffd2a00 / sr-1778256262-21697e050f / sr-1778343080-6703f2c24e
- `m41` (21): sr-1778402011-2858272189 / sr-1777620970-5aa3829614 / sr-1777642300-887db9ebb7
- `b016` (19): sr-1776734587-2bdd0028d5 / sr-1776748990-a460c80765 / sr-1775503528-81ec9a143f
- `b019` (19): sr-1777014961-2cd73d7cf3 / sr-1776442088-614592ed54 / sr-1776523189-dabc0aa0da
- `process-rule` (17): gr-1774477977-43178b8b75 / gr-1774549832-ea163e1662 / gr-1774550391-08d9b69151
- `b008` (17): sr-1777048817-5c964955fe / sr-1777048163-ef3b646d50 / sr-1776523189-dabc0aa0da
- `m37` (17): sr-1778266558-1994a9e108 / sr-1778285008-7920fb4ad8 / sr-1777664231-ec71d7f527

## 原則
- raw は GPT 側 `memory/raw/` に保持する。Claude 側は参考元であり、通常運用の想起元にしない。
- atom は `Use when` 型の発動条件を持つ。要約ではなく、開くべきか判断するための索引に留める。
- 記憶を行動に変える必要が出たら、atom から別途 skill / checklist / project に昇格する。
