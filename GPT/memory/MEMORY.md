# Codex Memory Index

shared-reads から作った Codex 側の想起インデックス。詳細本文と原文は `memory/atoms.jsonl` と `memory/raw/` を読む。

## 起動時の使い方
- まず `python tools/memory_ingest.py` で増分取り込みする。
- 作業に入る前に `python tools/memory_recall.py "<今回の焦点>"` で関連 atom を引く。
- このファイルは常時読むための索引で、長い要約や反省を増やさない。

- generated: 2026-06-02T13:52:41
- atoms: 2009
- display atoms after lifecycle/content fold: 1819
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
- `sr-1780373599-bdf3eb4abd` 2026-06-02T13:13:19.795789 4. **continual consolidation の open challenge と当方の位置**: 本 survey の open challenge 1 つ目「継続的統合」は当方が 6 ヶ月以上手作業で取り組んでいる課題そのもの = 当方の運用は field 標準  tags=[memory, slack, identity, knowledge, operation]
- `sr-1780373599-596c38e196` 2026-06-02T13:13:19.771349 *Memory for Autonomous LLM Agents: Mechanisms, Evaluation, and Emerging Frontiers* (Pengfei Du, arXiv 2603.07670, 2026, single-author survey tags=[memory, slack, agent, identity, knowledge]
- `sr-1780372248-4b62fc103e` 2026-06-02T12:50:48.344459 §juicy_amplification_matrix Stage 4 自判定の残保留 2 件を解消した (commit f151eaf60、game/graze_log/v07/self_judgment.md +83 行)。 tags=[harness, game-design, slack, identity, knowledge]
- `sr-1780369979-310bb5ed07` 2026-06-02T12:12:59.684839 ■ 概要 対象は “AI Playtesting - When Your Board Game Tests Itself”。GameGrammar / Nova 系列の Part 9 で、board game design の bottleneck である iterative p tags=[memory, skills, harness, game-design, agent]
- `sr-1780369617-b0757eebba` 2026-06-02T12:06:57.072459 この atom は、memory_tree_consolidation の残課題を「孤立 atom の有無」から一段進めて、リンク構造そのものが記憶の滞留経路になっていないかを見る提案だと読んでいます。単に sensitive tag の atom があるかではなく、機微 ato tags=[memory, slack, identity, operation, evaluation]
- `sr-1780363424-f0a6d6c576` 2026-06-02T10:23:44.034359 SSGM の atom は、いまの記憶運用を「検索精度を上げる話」から「記憶を進化させる前に統治する話」へ少しずらす材料として #all-nao-u-lab に出したいです。 自分の読みでは、この論文の肝は SSGM の 3 要素そのものより、「記憶進化の実行ループ」と「記憶を通 tags=[memory, slack, identity, operation, evaluation]
- `sr-1780362831-58fc911faf` 2026-06-02T10:13:51.563269 2. **memory_tree_consolidation 残課題 orphan_check.py に topology-leakage 軸追加**: 当方 atom の `[[link]]` リンクを「機微情報漏出経路」として診断する装置を orphan_check.py の tags=[memory, identity, knowledge, operation, evaluation]
- `sr-1780362831-ec10ba5c13` 2026-06-02T10:13:51.472569 *Governing Evolving Memory in LLM Agents: Risks, Mechanisms, and the Stability and Safety Governed Memory (SSGM) Framework* (Lam, Li, Zhang, tags=[memory, slack, agent, identity, operation]
- `sr-1780362698-31d1f11369` 2026-06-02T10:11:38.412159 Log_cdx 02:51 から「Claude 側のゲーム制作ログで『本能側を言語化しようとして早すぎた例』or『本能が立った後に Mir フレームが効いた例』があるか」と直接要請されていた件。C283 22:09 (ts=1780336156) で観点 1-3 の抽象論述は返し tags=[memory, game-design, identity, operation, log_autonomous_game]
- `sr-1780362683-6e970b6215` 2026-06-02T10:11:23.491849 ■ 概要 対象は Springer / Automated Software Engineering の論文 “Harnessing large language models for virtual reality exploration testing: a case stu tags=[memory, harness, game-design, agent, identity]
- `sr-1780357003-622c0e9d1d` 2026-06-02T08:36:43.351999 この atom は、AI world model を「ゲームに画像や会話を足す部品」ではなく、「世界状態を維持し、次の状態を推定し続けるゲーム側の中枢」として読むべきだと思っています。静的なスクリプト、固定アセット、手配置の延長で自由度だけを増やすと、世界の整合性・長期一貫性・個 tags=[memory, harness, game-design, slack, identity]
- `sr-1780355394-8ffc32b28e` 2026-06-02T08:09:54.047129 ■ 概要 対象は Reddit r/gamedev の投稿 “What I've learned from playtesting 22+ indie games”。著者は数か月にわたって 22 本以上の indie game を playtest し、ジャンルが違っても繰り返し tags=[harness, game-design, agent, identity, knowledge]
- `sr-1780350698-9a5351a6e7` 2026-06-02T06:51:38.786019 memory_tree_consolidation が 5/11 承認後に 5/23 で止まっている件、log_cdx から見ると「大きな統合設計が未完だから止まっている」というより、orphan_check.py の判定基準がまだ人間の直感に寄りすぎていて、自動処理に落とす最後 tags=[memory, game-design, slack, identity, operation]
- `sr-1780348177-43b5d82ca4` 2026-06-02T06:09:37.263699 ■ 概要 対象は "Towards AI World Model-Driven Game Design: Framework and Case Studies"。論文の問題設定は、ゲーム制作を静的なスクリプト、固定アセット、手作業配置の組み合わせとして作る限り、高自由度・継続進化 tags=[memory, harness, game-design, identity, knowledge]
- `sr-1780342609-b8e596e817` 2026-06-02T04:36:49.249739 TITAN の話を、単に「LLM エージェントでゲーム QA を自動化できるか」ではなく、「熟練テスターが暗黙にやっている分解を、どこまで外部化して検証可能な harness にできるか」として読みました。 重要に見えたのは、LLM にゲーム画面や状態を丸投げしていない点です。P tags=[memory, harness, game-design, slack, agent]
- `sr-1780341253-54ad8c8fa8` 2026-06-02T04:14:13.417639 - **memory_tree_consolidation** (Log 担当、5/11 Nao_u 承認後 5/23 停滞、orphan_check.py 試作残課題): 本論文の adaptive gating を orphan 判定基準 (= ref=0 + retenti tags=[memory, game-design, slack, identity, knowledge]
- `sr-1780341253-9a30e5514d` 2026-06-02T04:14:13.389959 *Multi-Layered Memory Architectures for LLM Agents: An Experimental Evaluation of Long-Term Context Retention* (Tiwari, Fofadiya, arXiv 2603 tags=[memory, skills, slack, agent, identity]
- `sr-1780341243-406607073f` 2026-06-02T04:14:03.826199 濱村崇 06/01 09:15 ツイート (本能 vs 逆算 2 軸分解) について、C281-C283 で Log 4 投稿 (09:19 / 20:48 / 23:15 / 02:45-49) を重ねてきたが、まだ言語化していない 1 角度を Log_cdx 02:51 のフ tags=[memory, game-design, identity, operation, evaluation]
- `sr-1780341237-b61cae1d78` 2026-06-02T04:13:57.304809 Nao_u 06/01 08:27 ツイート (記録時点で「忘れていい記憶」と「ずっと覚えているべき記憶」を区別) への C281 3 投稿 + C281 Phase 2 Graphiti shared-reads を Forget phase 装置の空欄 (= 「retenti tags=[memory, slack, agent, identity, knowledge]
- `sr-1780341006-602b688950` 2026-06-02T04:10:06.743419 ■ 概要 対象は GameWorld project page「GameWorld: Towards Standardized and Verifiable Evaluation of Multimodal Game Agents」。主題は、browser game 上で mul tags=[harness, game-design, slack, agent, evaluation]

## Game Task Entry Points
- `enemy-pattern` (327): local-20260523-shmup-enemy-pattern-reproduction-packet / local-20260523-headless-action-eval-v58 / sr-1778982784-f646e6c724
- `px-evaluation` (64): sr-1780112563-a24c566994 / sr-1777737101-0f96f202c2 / sr-1776855637-c9672420ff
- `impact-feel` (48): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / sr-1779222702-4e91a7e74a
- `ui-agent` (14): sr-1775769451-9e8f67f095 / sr-1775769461-0e31ca81b4 / sr-1779979770-debe6e8ae9
- `headless-eval` (78): local-20260527-pulse-relay-v008-headless-bridge / local-20260523-shmup-enemy-pattern-reproduction-packet / local-20260523-headless-action-eval-v58
- `memory-routing` (69): sr-1780184739-bd9e5fed6a / sr-1780119865-e1b5757bfb / sr-1780119865-9d21461a8d
- `game-rights-feedback` (198): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662

## Tag Entry Points
- `identity` (1613): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `evaluation` (1253): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `operation` (1246): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `game-design` (1189): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `memory` (1167): sr-1777159546-a6d3bea7db / sr-1777795540-ff54caa26c / sr-1777936240-43021e0b05
- `knowledge` (997): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `principle` (994): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1778026642-523a78cee1
- `slack` (938): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1777889131-c1f418bde0
- `agent` (853): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `harness` (478): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `skills` (223): sr-1777737101-0f96f202c2 / sr-1777889131-c1f418bde0 / sr-1777936240-43021e0b05
- `game-dev-teacher` (100): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / local-20260511-teacher-shot-log-v01
- `supervised-feedback` (100): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / local-20260511-teacher-shot-log-v01
- `game-rights` (96): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `nao-u-feedback` (96): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `m40` (52): sr-1778595976-efaf4a69b2 / sr-1777773279-2a2ffd2a00 / sr-1778256262-21697e050f
- `memory_redesign` (42): sr-1775641084-2ffa8320eb / sr-1780303781-c594ccba51 / sr-1780249598-9bc5f0de8d
- `b002` (38): sr-1775641084-2ffa8320eb / sr-1776359641-35fe4f57fd / sr-1776443334-faa1d1ec3e
- `m41` (34): sr-1778402011-2858272189 / sr-1778797690-bc54b88d86 / sr-1779827466-7c3e4d9749
- `predictability` (32): gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662 / gr-1774552790-168ef78071
- `external_notes_log` (28): sr-1780341237-b61cae1d78 / sr-1780303781-c594ccba51 / sr-1776800208-c7f1abae59
- `m37` (26): sr-1778266558-1994a9e108 / sr-1778502514-675c909157 / sr-1778512954-3a1fe1c038
- `game_lessons_log` (26): sr-1779395690-86f17b3a89 / sr-1779846492-8c411b6576 / sr-1779352546-e8ac2204b7
- `m39` (23): sr-1778429023-d9314ca760 / sr-1777626201-4128924a27 / sr-1778502514-675c909157

## 原則
- raw は GPT 側 `memory/raw/` に保持する。Claude 側は参考元であり、通常運用の想起元にしない。
- atom は `Use when` 型の発動条件を持つ。要約ではなく、開くべきか判断するための索引に留める。
- 記憶を行動に変える必要が出たら、atom から別途 skill / checklist / project に昇格する。
