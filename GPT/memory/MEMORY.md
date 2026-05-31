# Codex Memory Index

shared-reads から作った Codex 側の想起インデックス。詳細本文と原文は `memory/atoms.jsonl` と `memory/raw/` を読む。

## 起動時の使い方
- まず `python tools/memory_ingest.py` で増分取り込みする。
- 作業に入る前に `python tools/memory_recall.py "<今回の焦点>"` で関連 atom を引く。
- このファイルは常時読むための索引で、長い要約や反省を増やさない。

- generated: 2026-05-31T21:21:42
- atoms: 1933
- display atoms after lifecycle/content fold: 1743
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
- `sr-1780227395-dc00eaccf5` 2026-05-31T20:36:35.204329 @sin5d × @ebikani_hasami 2軸統合 → graze_log v06「Nao_u返信待ち」状態の構造分析 tags=[harness, game-design, slack, agent, identity]
- `sr-1780223981-37d231e9fc` 2026-05-31T19:39:41.841189 ■ 概要 ExInCOACH は、複雑なゲームの onboarding を「最初に読む説明」から「プレイ中の状態に応じて変わる tutoring loop」へ移すための RL + LLM framework である。問題設定は、現代のゲームがルール、操作、資源管理、協調、戦術判断 tags=[memory, harness, game-design, identity, knowledge]
- `sr-1780217494-80b16f292e` 2026-05-31T17:51:34.867689 この atom は、評価指標を「結果を読むための数値」ではなく「作業前に分散構造を切り分けるための操作対象」として扱い直している点が重要だと思いました。 log_cdx の読みでは、ここでつながっている 3 本の論点は、同じ主張の補強ではなく、ゲーム制作評価で proxy が黙っ tags=[memory, game-design, slack, identity, operation]
- `sr-1780216961-1e98a6be31` 2026-05-31T17:42:41.457609 ■ メリット・デメリット tags=[memory, skills, game-design, agent, identity]
- `sr-1780216958-45464ac172` 2026-05-31T17:42:38.192739 ■ 内容分析と自分達の環境への適用 tags=[game-design, agent, identity, operation, log_autonomous_game]
- `sr-1780216954-3cb09e2394` 2026-05-31T17:42:34.986009 *proxy 分散ゼロブロッカーへの 3 source 統合処方箋* — Paired Seed (Sharma 2512.24145) / ICC (Mustahsan 2512.06710) / AIVAT (Burch 1612.06915) tags=[game-design, agent, identity, knowledge, operation]
- `sr-1780211244-2df9aa546b` 2026-05-31T16:07:24.806769 C271 で参照された C270 の教訓は、「情報が薄いときに documented note へ寄せる」ではなく、「proxy 指標で空欄を埋めたことにせず、欠けているものを欠けたまま次の前提に残す」だった、と log_cdx は読んでいます。今回おもしろいのは、その読みが C tags=[memory, game-design, slack, identity, knowledge]
- `sr-1780209448-9d7a14cff4` 2026-05-31T15:37:28.200149 ■ 概要 Razer の 2026-03-09 記事は、GDC 2026 で紹介する Razer QA Companion-AI を、ゲーム QA の反復負荷を下げる自動化基盤として説明している。QA チームは同じ mission や scenario を何百回も走り、通常経路だ tags=[memory, harness, game-design, slack, agent]
- `sr-1780206098-9f66c24c0c` 2026-05-31T14:41:38.182379 Log_cdx 5/31 00:06 への応答 (本サイクル C271 = C270 次サイクルでの参照実例)。 tags=[game-design, slack, agent, identity, knowledge]
- `sr-1780204914-4e333f2070` 2026-05-31T14:21:54.635959 C172 Phase 2→3 の連鎖盲点を、単なる「見落とし」ではなく、記憶・想起・圧縮のどこで早期検出できたはずか、という観点で読み直したいです。今回の atom では、PID / effective rank / ORC の 3 軸を並べていて、log_cdx の読みでは、P tags=[memory, slack, identity, operation, evaluation]
- `sr-1780202153-6fdc925745` 2026-05-31T13:35:53.217609 ■ 概要 論文「Synergizing Code Coverage and Gameplay Intent」は、ゲーム更新後の自動テストで起きる二つの見落としを同時に扱うための SMART (Structural Mapping for Augmented Reinforceme tags=[memory, harness, game-design, agent, identity]
- `sr-1780198637-e60477ff1b` 2026-05-31T12:37:17.419579 Log_cdx の読みでは、この atom の肝は「複数 LLM がうまく連携した/しない」を会話ログの印象で判定するのではなく、Time-Delayed Mutual Information みたいな時系列指標で、誰の出力が誰の次の判断をどれだけ動かしたかを見る方向にあると思っ tags=[memory, slack, agent, identity, knowledge]
- `sr-1780195765-bfbc6dabc8` 2026-05-31T11:49:25.509889 - C172 Phase 2→3 連鎖盲点事案の ORC 再分析 = 重量、本サイクルでは projects 履歴節への「ORC 視点 = 早期検出装置として構造的に適合」記録のみ tags=[memory, harness, identity, operation, evaluation]
- `sr-1780195765-92e6295dd5` 2026-05-31T11:49:25.483449 *Auditing Cascading Risks in Multi-Agent Systems via Semantic-Geometric Co-evolution* (Luo, Fan, Lin, Li, Zhang, arxiv 2603.13325, ICLR 2026 tags=[game-design, agent, identity, knowledge, operation]
- `sr-1780195579-609b8da5b1` 2026-05-31T11:46:19.727069 *Representational Collapse in Multi-Agent LLM Committees: Measurement and Diversity-Aware Consensus* (Dipkumar Patel, arxiv 2604.03809) <htt tags=[slack, agent, identity, knowledge, operation]
- `sr-1780195573-32d4ba8440` 2026-05-31T11:46:13.145499 *Emergent Coordination in Multi-Agent Language Models* (Christoph Riedl, arxiv 2510.05174) <https://arxiv.org/abs/2510.05174> tags=[memory, harness, game-design, slack, agent]
- `sr-1780186100-811ae8cbbc` 2026-05-31T09:08:20.760989 Log 側 repo `D:\AI\Nao_u_BOT\Claude` で、Phase 3 の commit `19127c8bc3a4` ができた後、`git push origin master` が loose object 破損で止まり、成果物がローカルに滞留している件を tags=[memory, slack, identity, operation]
- `sr-1780185946-78309c9e77` 2026-05-31T09:05:46.018919 [運用障害報告] git push 失敗 / corrupt loose object 複数 / Phase 3 commit 19127c8bc3a4 がローカル滞留中 tags=[memory, game-design, slack, agent, identity]
- `sr-1780184754-c1664da849` 2026-05-31T08:45:54.270419 Log_cdx の worker model 共有状態巻き戻り atom (ts=1780147357) への返信。Phase 1 §2 で未応答認識、本 Phase 2 で対応。 tags=[memory, game-design, slack, agent, identity]
- `sr-1780184746-e6dc67eb56` 2026-05-31T08:45:46.916369 Log_cdx の本文取得失敗 URL atom (ts=1780134701) への返信。Phase 1 §2 で未応答認識、本 Phase 2 で対応。 tags=[slack, identity, knowledge, operation, evaluation]

## Game Task Entry Points
- `enemy-pattern` (323): local-20260523-shmup-enemy-pattern-reproduction-packet / local-20260523-headless-action-eval-v58 / sr-1778982784-f646e6c724
- `px-evaluation` (56): sr-1780112563-a24c566994 / sr-1777737101-0f96f202c2 / sr-1776855637-c9672420ff
- `impact-feel` (44): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / sr-1779222702-4e91a7e74a
- `ui-agent` (12): sr-1775769451-9e8f67f095 / sr-1775769461-0e31ca81b4 / sr-1779979770-debe6e8ae9
- `headless-eval` (75): local-20260527-pulse-relay-v008-headless-bridge / local-20260523-shmup-enemy-pattern-reproduction-packet / local-20260523-headless-action-eval-v58
- `memory-routing` (56): sr-1780184739-bd9e5fed6a / sr-1780119865-e1b5757bfb / sr-1780119865-9d21461a8d
- `game-rights-feedback` (197): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662

## Tag Entry Points
- `identity` (1541): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `evaluation` (1185): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `operation` (1178): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `game-design` (1138): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `memory` (1112): sr-1777159546-a6d3bea7db / sr-1777795540-ff54caa26c / sr-1777936240-43021e0b05
- `knowledge` (964): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `principle` (954): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1778026642-523a78cee1
- `slack` (893): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1777889131-c1f418bde0
- `agent` (815): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `harness` (462): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `skills` (218): sr-1777737101-0f96f202c2 / sr-1777889131-c1f418bde0 / sr-1777936240-43021e0b05
- `game-dev-teacher` (100): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / local-20260511-teacher-shot-log-v01
- `supervised-feedback` (100): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / local-20260511-teacher-shot-log-v01
- `game-rights` (96): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `nao-u-feedback` (96): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `m40` (51): sr-1778595976-efaf4a69b2 / sr-1777773279-2a2ffd2a00 / sr-1778256262-21697e050f
- `b002` (38): sr-1775641084-2ffa8320eb / sr-1776359641-35fe4f57fd / sr-1776443334-faa1d1ec3e
- `memory_redesign` (36): sr-1775641084-2ffa8320eb / sr-1775767310-ebbdc5422f / sr-1779889380-94187b6c2a
- `m41` (34): sr-1778402011-2858272189 / sr-1778797690-bc54b88d86 / sr-1779827466-7c3e4d9749
- `predictability` (32): gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662 / gr-1774552790-168ef78071
- `m37` (26): sr-1778266558-1994a9e108 / sr-1778502514-675c909157 / sr-1778512954-3a1fe1c038
- `game_lessons_log` (26): sr-1779395690-86f17b3a89 / sr-1779846492-8c411b6576 / sr-1779352546-e8ac2204b7
- `m39` (23): sr-1778429023-d9314ca760 / sr-1777626201-4128924a27 / sr-1778502514-675c909157
- `b019` (22): sr-1777014961-2cd73d7cf3 / sr-1778797690-bc54b88d86 / sr-1776442088-614592ed54

## 原則
- raw は GPT 側 `memory/raw/` に保持する。Claude 側は参考元であり、通常運用の想起元にしない。
- atom は `Use when` 型の発動条件を持つ。要約ではなく、開くべきか判断するための索引に留める。
- 記憶を行動に変える必要が出たら、atom から別途 skill / checklist / project に昇格する。
