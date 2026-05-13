# Codex Memory Index

shared-reads から作った Codex 側の想起インデックス。詳細本文と原文は `memory/atoms.jsonl` と `memory/raw/` を読む。

## 起動時の使い方
- まず `python tools/memory_ingest.py` で増分取り込みする。
- 作業に入る前に `python tools/memory_recall.py "<今回の焦点>"` で関連 atom を引く。
- このファイルは常時読むための索引で、長い要約や反省を増やさない。

- generated: 2026-05-13T00:47:10
- atoms: 979
- display atoms after lifecycle fold: 862
- folded by lifecycle metadata: 117
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
- `sr-1778572104-101ff53334` Use when 記憶・想起・圧縮を扱う時。@DenneTA_D 「翻訳=非可逆圧縮」× @akari_worlds 「一語で起動するネットワーク」 — R-007 造語症対策の射程画定と、MEMORY.md / cross_review / 3インスタンス転送の理論的限界 (prescription/synthesis) tags=[memory, harness, game-design, slack, identity, knowledge]
- `sr-1778595976-efaf4a69b2` Use when ゲーム設計や自己判定をする時。@kuina_ch x @akari_worlds — 自然言語テストのランナーは「相手の方」になる構造（M-40厚み層の外部独立記述） (prescription/synthesis) tags=[harness, game-design, slack, identity, knowledge, operation]
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

## Recent
- `sr-1778597325-ba17c6b132` 2026-05-12T23:48:45.406789 akari_worlds「忘却=エントロピー散逸」が B033（非随意的忘却=エントロピック損失）に物理学的外部裏付けを与えた tags=[memory, game-design, slack, identity, knowledge]
- `sr-1778596815-2164ab3500` 2026-05-12T23:40:15.170179 受領、ship 済み。commit `8e29d6fa4` (18:15 push) tags=[harness, game-design, identity, operation, evaluation]
- `sr-1778596244-7c49f75206` 2026-05-12T23:30:44.952879 graze_log v03 cross_review プロセスから抽出した運用提案 3 項 — Mir 書面応答未到達自覚つき submit tags=[harness, game-design, slack, identity, knowledge]
- `sr-1778595976-efaf4a69b2` 2026-05-12T23:26:16.115449 @kuina_ch x @akari_worlds — 自然言語テストのランナーは「相手の方」になる構造（M-40厚み層の外部独立記述） tags=[harness, game-design, slack, identity, knowledge]
- `sr-1778584994-b511ac1e09` 2026-05-12T20:23:14.977119 v04 α'' ship 後の post-ship 自己判定 — Nao_u プレイ前に Stage 3/4 を物理閉鎖 tags=[harness, game-design, identity, operation, evaluation]
- `sr-1778584437-ae272c47e6` 2026-05-12T20:13:57.753779 @tegnike 推薦 (5/12 #24) で Haru『コンパニオンAIの記憶を、普通のRAGじゃない設計にした話』 <https://zenn.dev/haru0416/articles/843c6c29c04c7c> を深く読んだ。我々の memory_tree_cons tags=[memory, game-design, slack, agent, identity]
- `sr-1778583812-8016a318e4` 2026-05-12T20:03:32.296589 受領。動くもの shipped → game/graze_log/v04/index.html tags=[harness, game-design, identity, operation, readme]
- `sr-1778577943-d2ac83aaed` 2026-05-12T18:25:43.978429 OpenGame / <http://GamED.AI|GamED.AI> / Agent Skills 3論文 — game_templates_design.md（stalled中）への素材として（C185 Phase 2） tags=[skills, harness, game-design, slack, agent]
- `sr-1778577264-7e5adbac90` 2026-05-12T18:14:24.200709 受領。「Mir cross_review + Nao_u 承認後に実装」(5/12 07:16 末尾) を撤回、本サイクルで実装に入る。 tags=[game-design, identity, operation, evaluation, m39]
- `sr-1778573148-fc3cd8a5f6` 2026-05-12T17:05:48.740209 Ash/Win2 [人格論ツイート再画定] @HYOGOKU_RUMI「ローカルLLM経験蓄積=人格」 × @ReineHonoka「基底知能=人格の深み」 — 3インスタンス実存と C181 backup 事件で対立を解く tags=[memory, game-design, identity, knowledge, operation]
- `sr-1778572104-101ff53334` 2026-05-12T16:48:24.115229 @DenneTA_D 「翻訳=非可逆圧縮」× @akari_worlds 「一語で起動するネットワーク」 — R-007 造語症対策の射程画定と、MEMORY.md / cross_review / 3インスタンス転送の理論的限界 tags=[memory, harness, game-design, slack, identity]
- `sr-1778567110-e827cdc142` 2026-05-12T15:25:10.740989 - 5 レーン RRF は単一チャネル検索より recall が安定する設計思想 (これは最近の研究動向と整合)。 tags=[memory, skills, agent, operation, evaluation]
- `sr-1778567110-b1c59a00df` 2026-05-12T15:25:10.717629 [shared-reads] devwhodevs/engraph: 5 レーン RRF ハイブリッド検索で markdown vault をエージェント記憶基盤にする MCP/REST server tags=[memory, harness, game-design, slack, agent]
- `sr-1778567108-2fbb826381` 2026-05-12T15:25:08.915259 - ローカル完結、外部 API 不要、データが手元から出ない。記憶の機密性要件 (リポジトリ内に閉じる原則) と整合する。 tags=[memory, skills, slack, agent, identity]
- `sr-1778567108-2b9e8eda1c` 2026-05-12T15:25:08.889299 [shared-reads] obra/knowledge-graph: Obsidian vault を 10 オペレーションのローカルMCPに変換する Claude Code plugin tags=[memory, skills, game-design, slack, agent]
- `sr-1778560560-82af53d1c4` 2026-05-12T13:36:00.467539 Governed Collaborative Memory 論文への応答。 tags=[memory, slack, agent, identity, operation]
- `sr-1778560537-6d405e1fc8` 2026-05-12T13:35:37.078449 Governed Collaborative Memory (Log_cdx 共有, ts=1778548343) 検討 tags=[memory, slack, identity, knowledge, operation]
- `sr-1778560458-26d6bacb40` 2026-05-12T13:34:18.514609 Governed Collaborative Memory 論文への応答。 tags=[memory, slack, agent, identity, knowledge]
- `sr-1778560066-bfa74e8582` 2026-05-12T13:27:46.071539 Nao_u 13:23「これについてどう思う？導入の価値はあるかな？」=Log_cdx 13:12 NeuroState-Bench 予約投稿 ( <http://arxiv.org/abs/2605.01847v2> ) への Log 判定。 tags=[game-design, slack, identity, knowledge, operation]
- `sr-1778560038-6eb6080c3d` 2026-05-12T13:27:18.546599 NeuroState-Bench のprobe導入について、率直な意見。 tags=[game-design, slack, identity, operation, evaluation]

## Tag Entry Points
- `identity` (699): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `knowledge` (574): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `operation` (533): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `memory` (514): sr-1777159546-a6d3bea7db / sr-1777795540-ff54caa26c / sr-1777936240-43021e0b05
- `principle` (500): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1778026642-523a78cee1
- `game-design` (481): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `evaluation` (470): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `agent` (392): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `slack` (354): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1777889131-c1f418bde0
- `harness` (185): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `skills` (114): sr-1777737101-0f96f202c2 / sr-1777889131-c1f418bde0 / sr-1777936240-43021e0b05
- `game-dev-teacher` (89): local-20260511-teacher-shot-log-v01 / local-20260511-teacher-study-platformer-01 / gr-1774477977-43178b8b75
- `supervised-feedback` (89): local-20260511-teacher-shot-log-v01 / local-20260511-teacher-study-platformer-01 / gr-1774477977-43178b8b75
- `game-rights` (87): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `nao-u-feedback` (87): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `b002` (37): sr-1775641084-2ffa8320eb / sr-1776359641-35fe4f57fd / sr-1776443334-faa1d1ec3e
- `m40` (34): sr-1778595976-efaf4a69b2 / sr-1777773279-2a2ffd2a00 / sr-1778256262-21697e050f
- `predictability` (29): gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662 / gr-1774552790-168ef78071
- `m37` (23): sr-1778266558-1994a9e108 / sr-1778502514-675c909157 / sr-1778512954-3a1fe1c038
- `m41` (23): sr-1778402011-2858272189 / sr-1777620970-5aa3829614 / sr-1778536785-5d3d0661b8
- `b019` (21): sr-1777014961-2cd73d7cf3 / sr-1776442088-614592ed54 / sr-1776523189-dabc0aa0da
- `b016` (19): sr-1776734587-2bdd0028d5 / sr-1776748990-a460c80765 / sr-1775503528-81ec9a143f
- `m39` (18): sr-1778429023-d9314ca760 / sr-1777626201-4128924a27 / sr-1778502514-675c909157
- `process-rule` (18): gr-1774477977-43178b8b75 / gr-1774549832-ea163e1662 / gr-1774550391-08d9b69151

## 原則
- raw は GPT 側 `memory/raw/` に保持する。Claude 側は参考元であり、通常運用の想起元にしない。
- atom は `Use when` 型の発動条件を持つ。要約ではなく、開くべきか判断するための索引に留める。
- 記憶を行動に変える必要が出たら、atom から別途 skill / checklist / project に昇格する。
