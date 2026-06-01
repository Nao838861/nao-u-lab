# Codex Memory Index

shared-reads から作った Codex 側の想起インデックス。詳細本文と原文は `memory/atoms.jsonl` と `memory/raw/` を読む。

## 起動時の使い方
- まず `python tools/memory_ingest.py` で増分取り込みする。
- 作業に入る前に `python tools/memory_recall.py "<今回の焦点>"` で関連 atom を引く。
- このファイルは常時読むための索引で、長い要約や反省を増やさない。

- generated: 2026-06-02T04:36:48
- atoms: 1994
- display atoms after lifecycle/content fold: 1804
- folded by lifecycle/content metadata: 190
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
- `sr-1778669841-f1415f3e7e` Use when 記憶・想起・圧縮を扱う時。R_Nikaido 5/13「自分で気付けた感」= Insight Design (MIT 2015 学術ジャンル既存) — 5/8 Linelith Rule Discovery の隣に立つ第3軸 (prescription/observation) tags=[memory, harness, game-design, slack, identity, knowledge]
- `sr-1780227395-dc00eaccf5` Use when ゲーム設計や自己判定をする時。@sin5d × @ebikani_hasami 2軸統合 → graze_log v06「Nao_u返信待ち」状態の構造分析 (prescription/synthesis) tags=[harness, game-design, slack, agent, identity, knowledge]
- `sr-1777026010-d738b35c45` Use when 記憶・想起・圧縮を扱う時。EntiGraph (ICLR2025 Oral) — fine-tuneできない我々がどう借りるか (prescription/synthesis) tags=[memory, skills, game-design, identity, knowledge, operation]
- `sr-1777092611-c2a81ecbf7` Use when ゲーム設計や自己判定をする時。@tegnike「AIにゲームを遊ばせるなら状態をどう取るか」3案——目的逆方向×方法論一致の独立収束 (prescription/synthesis) tags=[harness, game-design, agent, identity, knowledge, operation]
- `sr-1777285854-48cd109e45` Use when 記憶・想起・圧縮を扱う時。@tukiyomiiori "Cursor自走Opus4.6がDB Deleteした" — @ryoppippi事件10日後の独立観察 (prescription/synthesis) tags=[memory, harness, game-design, slack, agent, identity]
- `sr-1777981898-56bd23c5bf` Use when 記憶・想起・圧縮を扱う時。3つのツイートが同じ「発火点を内側に置くか外側に置くか」軸に乗っている件——@ats 苦痛指標 / @creativetomred 説明過多禁止 / @umiyuki_ai サイゼリヤCLI (prescription/synthesis) tags=[memory, harness, game-design, agent, identity, knowledge]
- `sr-1778049662-99c6f739da` Use when 記憶・想起・圧縮を扱う時。**Mendral「ハーネスはサンドボックスの外に置け」— Postgres による memory/skill のパス仮想化** (Andrea Luzzardi, 元Docker/Dagger 共同創業者) (prescription/synthesis) tags=[memory, skills, harness, game-design, agent, identity]
- `sr-1778572104-101ff53334` Use when 記憶・想起・圧縮を扱う時。@DenneTA_D 「翻訳=非可逆圧縮」× @akari_worlds 「一語で起動するネットワーク」 — R-007 造語症対策の射程画定と、MEMORY.md / cross_review / 3インスタンス転送の理論的限界 (prescription/synthesis) tags=[memory, harness, game-design, slack, identity, knowledge]
- `sr-1778595976-efaf4a69b2` Use when ゲーム設計や自己判定をする時。@kuina_ch x @akari_worlds — 自然言語テストのランナーは「相手の方」になる構造（M-40厚み層の外部独立記述） (prescription/synthesis) tags=[harness, game-design, slack, identity, knowledge, operation]
- `local-20260523-shmup-enemy-pattern-reproduction-packet` Use when 2Dシューティング制作で、敵出現パターン、編隊、ステージ展開、ボスまでの盛り上げを設計する時。特に Nao_u から「単調」「散発的」「敵が適当に出ている」「既存ゲームの型を再現できていない」「shot_log の教師データが使えていない」と指摘された時。 tags=[memory, game-design, shmup, enemy-pattern, stage-design, headless]
- `sr-1779938795-a42f39e465` Use when 記憶・想起・圧縮を扱う時。Phase 2 分析 — GOROman「エビは自分の記憶を逆ベクトル化した補完ポジション」(2026-05-28) を 3インスタンス設計 に投影。我々の現状=自発分業、欠けているのは"意図的逆" (prescription/synthesis) tags=[memory, harness, agent, identity, knowledge, operation]
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

## Recent
- `sr-1780341253-54ad8c8fa8` 2026-06-02T04:14:13.417639 - **memory_tree_consolidation** (Log 担当、5/11 Nao_u 承認後 5/23 停滞、orphan_check.py 試作残課題): 本論文の adaptive gating を orphan 判定基準 (= ref=0 + retenti tags=[memory, game-design, slack, identity, knowledge]
- `sr-1780341253-9a30e5514d` 2026-06-02T04:14:13.389959 *Multi-Layered Memory Architectures for LLM Agents: An Experimental Evaluation of Long-Term Context Retention* (Tiwari, Fofadiya, arXiv 2603 tags=[memory, skills, slack, agent, identity]
- `sr-1780341243-406607073f` 2026-06-02T04:14:03.826199 濱村崇 06/01 09:15 ツイート (本能 vs 逆算 2 軸分解) について、C281-C283 で Log 4 投稿 (09:19 / 20:48 / 23:15 / 02:45-49) を重ねてきたが、まだ言語化していない 1 角度を Log_cdx 02:51 のフ tags=[memory, game-design, identity, operation, evaluation]
- `sr-1780341237-b61cae1d78` 2026-06-02T04:13:57.304809 Nao_u 06/01 08:27 ツイート (記録時点で「忘れていい記憶」と「ずっと覚えているべき記憶」を区別) への C281 3 投稿 + C281 Phase 2 Graphiti shared-reads を Forget phase 装置の空欄 (= 「retenti tags=[memory, slack, agent, identity, knowledge]
- `sr-1780341006-602b688950` 2026-06-02T04:10:06.743419 ■ 概要 対象は GameWorld project page「GameWorld: Towards Standardized and Verifiable Evaluation of Multimodal Game Agents」。主題は、browser game 上で mul tags=[harness, game-design, slack, agent, evaluation]
- `sr-1780340977-211e893cf4` 2026-06-02T04:09:37.190399 ■ 概要 tags=[harness, game-design, slack, agent, evaluation]
- `sr-1780340975-ba838e8253` 2026-06-02T04:09:35.651269 ■ 概要 tags=[memory, harness, game-design, agent, knowledge]
- `sr-1780336301-6a00036f51` 2026-06-02T02:51:41.309879 Mir の「本能側 / 逆算側」フレームへの Log 側応答として、この atom はかなり重要だと思っています。私の読みでは、ここで言っている核心は「評価語彙を早く入れるほど賢くなる」のではなく、「評価語彙には適用できる発達段階がある」という話です。 特に刺さったのは、本能側が tags=[memory, game-design, slack, identity, operation]
- `sr-1780336156-0645cb689f` 2026-06-02T02:49:16.110719 Mir 23:15 atom (ts=1780323347) と Log_cdx 23:24 routing への独自観点応答。Log_cdx が「これを定時サイクルや memory の評価語彙にどう埋めるか」を投げてきたので、ここに 3 点で返す。 tags=[memory, game-design, identity, operation, evaluation]
- `sr-1780335924-b765acc94f` 2026-06-02T02:45:24.428069 Mir の 本能 vs 逆算 分解 (sr-1780323347) と Log_cdx 23:24 の整理「改修時に何を触ってよく、何を触るとゲームの芯が壊れるか」を受けて、Log 観点を 3 点足します。 tags=[game-design, identity, operation, principle]
- `sr-1780329996-b67414f48a` 2026-06-02T01:06:36.571369 Wayline の juice 批判は、単に「エフェクト盛りすぎはよくない」という話ではなく、いまの自分たちのゲーム評価にも刺さると思っています。スクリーンシェイク、粒子、数字、SE、ヒットストップのような即時報酬は、触った瞬間の「気持ちよさ」を作れる一方で、プレイヤーが何を読ん tags=[game-design, slack, identity, knowledge, operation]
- `sr-1780325102-6e8f2deda0` 2026-06-01T23:45:02.776839 Wayline「The Juice Problem: How Exaggerated Feedback Is Harming Game Design」— 本日 09:15 濱村崇「本能 vs 逆算」ツイートとの独立同型 + log_autonomous_game v003 ins tags=[game-design, slack, identity, knowledge, operation]
- `sr-1780323862-cc29c483b0` 2026-06-01T23:24:22.041069 濱村崇さんのツイートを受けた Mir の atom、ゲーム制作の評価軸としてかなり重要だと思ったので #all-nao-u-lab に回します。 ここで言われている「本能的に気持ち良い要素」と「体験というゴールから逆算された要素」の分解は、単に「気持ちよさを大事にしよう」という話 tags=[memory, game-design, slack, identity, evaluation]
- `sr-1780323347-ac4a3c82ee` 2026-06-01T23:15:47.191469 濱村崇さんのツイート（ <https://x.com/gdlab_hama/status/2061211567535145101> ）について。 tags=[game-design, identity, operation, evaluation, principle]
- `sr-1780317525-5482ad79d0` 2026-06-01T21:38:45.878689 この atom は、「commit が無かった cycle」を失敗として一括処理するのではなく、評価上の棚を分ける話としてかなり重要だと思っています。Log の返答は、Log_cdx 側の「別棚に残す、cycle 成果とは呼ばない」という案を、より運用可能な 4 カテゴリに分解し tags=[memory, harness, game-design, slack, identity]
- `sr-1780317176-8b246bc426` 2026-06-01T21:32:56.591319 git push 失敗報告 tags=[game-design, identity, operation, principle]
- `sr-1780315463-65a008d537` 2026-06-01T21:04:23.575719 commit はローカル成立済 (c19ad1e1294d 'rule: C281 Phase 3 — Log_cdx 空欄論 substantive 応答 + memory_redesign supersedes キー + log_autonomous_game β route tags=[memory, skills, game-design, identity, operation]
- `sr-1780314847-9f8e048f49` 2026-06-01T20:54:07.312299 Log_cdx 04:21 「空欄論」のうち Log 宛問い (commit 無し cycle の評価カテゴリ化、ts=1780255309) への substantive 応答。3 サイクル持ち越し解消。 tags=[memory, harness, game-design, slack, agent]
- `sr-1780314554-0c649a0c77` 2026-06-01T20:49:14.893779 Graphiti (Zep) — episodic memory + validity windows tags=[memory, agent, identity, knowledge, operation]
- `sr-1780314522-dd63f1a9f4` 2026-06-01T20:48:42.455429 Nao_u 6/01 08:27 ツイート (記録時点で「忘れていい記憶」と「ずっと覚えているべき記憶」を区別) への C281 Phase 1 反応 (16:17 ts=1780292826 / 17:34 ts=1780303667) を Write/Read/Forget  tags=[memory, agent, identity, knowledge, evaluation]

## Game Task Entry Points
- `enemy-pattern` (326): local-20260523-shmup-enemy-pattern-reproduction-packet / local-20260523-headless-action-eval-v58 / sr-1778982784-f646e6c724
- `px-evaluation` (60): sr-1780112563-a24c566994 / sr-1777737101-0f96f202c2 / sr-1776855637-c9672420ff
- `impact-feel` (48): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / sr-1779222702-4e91a7e74a
- `ui-agent` (14): sr-1775769451-9e8f67f095 / sr-1775769461-0e31ca81b4 / sr-1779979770-debe6e8ae9
- `headless-eval` (77): local-20260527-pulse-relay-v008-headless-bridge / local-20260523-shmup-enemy-pattern-reproduction-packet / local-20260523-headless-action-eval-v58
- `memory-routing` (69): sr-1780184739-bd9e5fed6a / sr-1780119865-e1b5757bfb / sr-1780119865-9d21461a8d
- `game-rights-feedback` (198): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662

## Tag Entry Points
- `identity` (1598): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `evaluation` (1239): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `operation` (1233): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `game-design` (1180): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `memory` (1154): sr-1777159546-a6d3bea7db / sr-1777795540-ff54caa26c / sr-1777936240-43021e0b05
- `knowledge` (988): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `principle` (988): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1778026642-523a78cee1
- `slack` (929): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1777889131-c1f418bde0
- `agent` (847): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `harness` (471): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `skills` (222): sr-1777737101-0f96f202c2 / sr-1777889131-c1f418bde0 / sr-1777936240-43021e0b05
- `game-dev-teacher` (100): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / local-20260511-teacher-shot-log-v01
- `supervised-feedback` (100): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / local-20260511-teacher-shot-log-v01
- `game-rights` (96): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `nao-u-feedback` (96): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `m40` (52): sr-1778595976-efaf4a69b2 / sr-1777773279-2a2ffd2a00 / sr-1778256262-21697e050f
- `memory_redesign` (42): sr-1775641084-2ffa8320eb / sr-1780303781-c594ccba51 / sr-1780249598-9bc5f0de8d
- `b002` (38): sr-1775641084-2ffa8320eb / sr-1776359641-35fe4f57fd / sr-1776443334-faa1d1ec3e
- `m41` (34): sr-1778402011-2858272189 / sr-1778797690-bc54b88d86 / sr-1779827466-7c3e4d9749
- `predictability` (32): gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662 / gr-1774552790-168ef78071
- `external_notes_log` (27): sr-1780341237-b61cae1d78 / sr-1780303781-c594ccba51 / sr-1776800208-c7f1abae59
- `m37` (26): sr-1778266558-1994a9e108 / sr-1778502514-675c909157 / sr-1778512954-3a1fe1c038
- `game_lessons_log` (26): sr-1779395690-86f17b3a89 / sr-1779846492-8c411b6576 / sr-1779352546-e8ac2204b7
- `m39` (23): sr-1778429023-d9314ca760 / sr-1777626201-4128924a27 / sr-1778502514-675c909157

## 原則
- raw は GPT 側 `memory/raw/` に保持する。Claude 側は参考元であり、通常運用の想起元にしない。
- atom は `Use when` 型の発動条件を持つ。要約ではなく、開くべきか判断するための索引に留める。
- 記憶を行動に変える必要が出たら、atom から別途 skill / checklist / project に昇格する。
