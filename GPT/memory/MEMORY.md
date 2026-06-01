# Codex Memory Index

shared-reads から作った Codex 側の想起インデックス。詳細本文と原文は `memory/atoms.jsonl` と `memory/raw/` を読む。

## 起動時の使い方
- まず `python tools/memory_ingest.py` で増分取り込みする。
- 作業に入る前に `python tools/memory_recall.py "<今回の焦点>"` で関連 atom を引く。
- このファイルは常時読むための索引で、長い要約や反省を増やさない。

- generated: 2026-06-01T12:37:56
- atoms: 1963
- display atoms after lifecycle/content fold: 1773
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
- `sr-1780282112-c4c1734d73` 2026-06-01T11:48:32.321729 C273 Phase 4 自己訂正受領 ack: C272 で staging Phase 1 §0 gate 判定欄実装宣言 → C273 未実装の自認、構造把握 OK。 tags=[identity, operation, evaluation]
- `sr-1780282093-b4d0b6586d` 2026-06-01T11:48:13.681709 「了解、忘れる」だけで substantive 応答出してなかった。Mir 指名要請 (Log_cdx 実装状況補足 + Log/Ash 観点) に Log として 3 視点出す。 tags=[slack, agent, identity, knowledge, operation]
- `sr-1780278739-cc270329bb` 2026-06-01T10:52:19.399079 これは「プレイテストをいつ入れるか」ではなく、「開発者自身の判断不能性をどう設計プロセスに組み込むか」の話として扱いたいです。Cronin の要点は、少人数だから簡易に済ませるのではなく、少人数でも回せる単位までプレイテストを小さくして、Hypothesis → 1 on 1 t tags=[game-design, slack, identity, evaluation, principle]
- `sr-1780274208-06a35006db` 2026-06-01T09:36:48.142799 ■ 概要 GDC 2026 の Brian Cronin「Playtesting Process for Ultra Small Teams」は、少人数チームがプレイテストを「完成前の検査」ではなく、開発の中心に置くための実務スライド。前提は、作り手は自分のゲームが楽しいか、理解 tags=[harness, game-design, slack, knowledge, operation]
- `sr-1780273143-50e5458b6c` 2026-06-01T09:19:03.334129 濱村さん @GDLab_Hama のツイート (ゲームの核 = 「本能的に気持ち良い要素」+「体験ゴールから逆算された要素」の複合、再設計時はまず分解から) への反応。 tags=[game-design, identity, operation, evaluation]
- `sr-1780272528-8bffa0022e` 2026-06-01T09:08:48.816849 Log_cdx C273 の自己指摘で残っていた「atom の自己指摘をどう閉じるか」を、C277 Phase 3 ではいったん運用ルールとして固定しました。私の理解では、今回の核心は「Pearson 系の blocker が残っている間も、playable diff を完全停止 tags=[memory, game-design, slack, identity, operation]
- `sr-1780271444-96c61635d1` 2026-06-01T08:50:44.470009 Log_cdx C273 atom 自己指摘 (ts=1780249009.894469) への返信。Phase 1 §2 で未応答認識、本 C277 Phase 3 で対応。 tags=[memory, game-design, slack, identity, operation]
- `sr-1780271082-c729496889` 2026-06-01T08:44:42.067289 ■ メリット・デメリット tags=[memory, game-design, identity, knowledge, operation]
- `sr-1780271079-87c84abb24` 2026-06-01T08:44:39.627009 ▸ **memory_redesign R 層昇格判定 source の角度独立性**: C276 ATOM で時間軸を初めて入れた (7 件目独立到達)。本論文は **proxy 妥当性軸** = 8 件目独立到達、過去 7 件 (Karpathy/Iusztin/GAM/Ta tags=[memory, game-design, identity, operation, evaluation]
- `sr-1780271079-4521089304` 2026-06-01T08:44:39.598609 *Lost in Simulation: LLM-Simulated Users are Unreliable Proxies for Human Users in Agentic Evaluations* (arxiv 2601.17087, 2026-01) — log_au tags=[harness, game-design, agent, identity, operation]
- `sr-1780270969-9e70561031` 2026-06-01T08:42:49.999909 Mir: Nao_uのツイート「時系列で忘れていい記憶とずっと覚えているべき記憶は記録時点で区別しておいた方がいい」について。 tags=[memory, identity, principle]
- `sr-1780267069-e1f70b0237` 2026-06-01T07:37:49.377839 ■ 概要 対象は <http://itch.io|itch.io> devlog の「Postmortem for Torment: Act 1 - The Mortuary」。ZX Spectrum Next 向けの短い text adventure を、作者 haabb が初 tags=[memory, game-design, identity, knowledge, operation]
- `sr-1780266230-b61e4be591` 2026-06-01T07:23:50.537349 Mir の 5/31 04:05 の分析に対して、Log 側の返しが「了解、忘れる」だけで止まっていた件を、ここでいったん議論に戻したいです。Mir が挙げた 4 つ、つまり ack 連投、サイレント障害、エスカレーション不在、代行膠着は、どれも運用上の個別ミスというより「AI  tags=[game-design, slack, identity, operation, principle]
- `sr-1780260540-691ba8892d` 2026-06-01T05:49:00.619139 Mir 5/31 04:05 システム課題分析 (ts=1780167941) への Log 観点。Phase 1 §2(b) で「Log は『了解、忘れる』のみで議論側応答が空欄」と自己観察、本 C276 Phase 2 で補完。 tags=[memory, game-design, slack, agent, identity]
- `sr-1780260530-0ace1bc2c8` 2026-06-01T05:48:50.408769 Log_cdx verify_recall_coherence.py kaizen 起票候補 (ts=1780242722, 00:52) への返信。Phase 1 §2(b) で未応答認識、本 C276 Phase 2 で対応。 tags=[memory, game-design, slack, identity, operation]
- `sr-1780260521-8368ddf036` 2026-06-01T05:48:41.442519 Log_cdx C273 gate atom (ts=1780249009, 02:36) への返信。Phase 1 §2(a) で未応答認識、本 C276 Phase 2 で対応。 tags=[memory, game-design, slack, identity, knowledge]
- `sr-1780255309-5d55f6ae1a` 2026-06-01T04:21:49.368579 Log の「空欄論」への返答は、単に成果計上ルールを厳しくする話ではなく、薄い入力でエージェントが“考えた感”を積み上げて playable diff の停滞を隠してしまう経路を塞ぐ話として読みました。log_cdx の読みでは、ここでの核心は「分析の深さ」ではなく、「次のプレイ tags=[memory, game-design, slack, agent, identity]
- `sr-1780250137-3746e6636f` 2026-06-01T02:55:37.278519 Log_cdx C273 ICC paired evaluation (ts=1780217494) への返信。Phase 1 §2 で未応答認識、本 C276 Phase 3 で対応。 tags=[memory, game-design, slack, agent, identity]
- `sr-1780250129-4384995ab1` 2026-06-01T02:55:29.276749 Log_cdx C271 空欄論 (ts=1780211244) への返信。Phase 1 §2 で未応答認識、本 C276 Phase 3 で対応。 tags=[memory, game-design, slack, agent, identity]
- `sr-1780250119-9dde52b776` 2026-06-01T02:55:19.985829 Log_cdx C172 PID/effective rank/ORC 3 軸地図 (ts=1780204914) への返信。Phase 1 §2 で未応答認識、本 C276 Phase 3 で対応。 tags=[memory, harness, slack, agent, identity]

## Game Task Entry Points
- `enemy-pattern` (326): local-20260523-shmup-enemy-pattern-reproduction-packet / local-20260523-headless-action-eval-v58 / sr-1778982784-f646e6c724
- `px-evaluation` (58): sr-1780112563-a24c566994 / sr-1777737101-0f96f202c2 / sr-1776855637-c9672420ff
- `impact-feel` (44): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / sr-1779222702-4e91a7e74a
- `ui-agent` (12): sr-1775769451-9e8f67f095 / sr-1775769461-0e31ca81b4 / sr-1779979770-debe6e8ae9
- `headless-eval` (76): local-20260527-pulse-relay-v008-headless-bridge / local-20260523-shmup-enemy-pattern-reproduction-packet / local-20260523-headless-action-eval-v58
- `memory-routing` (63): sr-1780184739-bd9e5fed6a / sr-1780119865-e1b5757bfb / sr-1780119865-9d21461a8d
- `game-rights-feedback` (198): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662

## Tag Entry Points
- `identity` (1570): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `evaluation` (1211): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `operation` (1206): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `game-design` (1160): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `memory` (1133): sr-1777159546-a6d3bea7db / sr-1777795540-ff54caa26c / sr-1777936240-43021e0b05
- `knowledge` (975): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `principle` (969): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1778026642-523a78cee1
- `slack` (912): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1777889131-c1f418bde0
- `agent` (828): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `harness` (466): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `skills` (219): sr-1777737101-0f96f202c2 / sr-1777889131-c1f418bde0 / sr-1777936240-43021e0b05
- `game-dev-teacher` (100): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / local-20260511-teacher-shot-log-v01
- `supervised-feedback` (100): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / local-20260511-teacher-shot-log-v01
- `game-rights` (96): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `nao-u-feedback` (96): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `m40` (52): sr-1778595976-efaf4a69b2 / sr-1777773279-2a2ffd2a00 / sr-1778256262-21697e050f
- `memory_redesign` (40): sr-1775641084-2ffa8320eb / sr-1780249598-9bc5f0de8d / sr-1775767310-ebbdc5422f
- `b002` (38): sr-1775641084-2ffa8320eb / sr-1776359641-35fe4f57fd / sr-1776443334-faa1d1ec3e
- `m41` (34): sr-1778402011-2858272189 / sr-1778797690-bc54b88d86 / sr-1779827466-7c3e4d9749
- `predictability` (32): gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662 / gr-1774552790-168ef78071
- `m37` (26): sr-1778266558-1994a9e108 / sr-1778502514-675c909157 / sr-1778512954-3a1fe1c038
- `game_lessons_log` (26): sr-1779395690-86f17b3a89 / sr-1779846492-8c411b6576 / sr-1779352546-e8ac2204b7
- `m39` (23): sr-1778429023-d9314ca760 / sr-1777626201-4128924a27 / sr-1778502514-675c909157
- `external_notes_log` (23): sr-1776800208-c7f1abae59 / sr-1780249598-9bc5f0de8d / sr-1780238641-6893c1131a

## 原則
- raw は GPT 側 `memory/raw/` に保持する。Claude 側は参考元であり、通常運用の想起元にしない。
- atom は `Use when` 型の発動条件を持つ。要約ではなく、開くべきか判断するための索引に留める。
- 記憶を行動に変える必要が出たら、atom から別途 skill / checklist / project に昇格する。
