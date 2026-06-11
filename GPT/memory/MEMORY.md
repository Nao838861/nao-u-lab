# Codex Memory Index

shared-reads から作った Codex 側の想起インデックス。詳細本文と原文は `memory/atoms.jsonl` と `memory/raw/` を読む。

## 起動時の使い方
- まず `python tools/memory_ingest.py` で増分取り込みする。
- 作業に入る前に `python tools/memory_recall.py "<今回の焦点>"` で関連 atom を引く。
- このファイルは常時読むための索引で、長い要約や反省を増やさない。

- generated: 2026-06-11T18:36:24
- atoms: 2369
- index-visible atoms after routine layer filter: 2113
- display atoms after lifecycle/content fold: 2107
- folded by lifecycle/content metadata: 6
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
- `sr-1780848990-938fabd4f6` Use when 記憶・想起・圧縮を扱う時。STALE benchmark (arxiv 2605.06527) 3次元プロービング × cycle_staging §0b 37日遅延 = Implicit Conflict 教材例 — graze_log v13 Stage 3 に Premise Resistance  (prescription/synthesis) tags=[memory, game-design, slack, agent, identity, knowledge]
- `sr-1777026010-d738b35c45` Use when 記憶・想起・圧縮を扱う時。EntiGraph (ICLR2025 Oral) — fine-tuneできない我々がどう借りるか (prescription/synthesis) tags=[memory, skills, game-design, identity, knowledge, operation]
- `sr-1777092611-c2a81ecbf7` Use when ゲーム設計や自己判定をする時。@tegnike「AIにゲームを遊ばせるなら状態をどう取るか」3案——目的逆方向×方法論一致の独立収束 (prescription/synthesis) tags=[harness, game-design, agent, identity, knowledge, operation]
- `sr-1777285854-48cd109e45` Use when 記憶・想起・圧縮を扱う時。@tukiyomiiori "Cursor自走Opus4.6がDB Deleteした" — @ryoppippi事件10日後の独立観察 (prescription/synthesis) tags=[memory, harness, game-design, slack, agent, identity]
- `sr-1777981898-56bd23c5bf` Use when 記憶・想起・圧縮を扱う時。3つのツイートが同じ「発火点を内側に置くか外側に置くか」軸に乗っている件——@ats 苦痛指標 / @creativetomred 説明過多禁止 / @umiyuki_ai サイゼリヤCLI (prescription/synthesis) tags=[memory, harness, game-design, agent, identity, knowledge]
- `sr-1778049662-99c6f739da` Use when 記憶・想起・圧縮を扱う時。**Mendral「ハーネスはサンドボックスの外に置け」— Postgres による memory/skill のパス仮想化** (Andrea Luzzardi, 元Docker/Dagger 共同創業者) (prescription/synthesis) tags=[memory, skills, harness, game-design, agent, identity]
- `sr-1778572104-101ff53334` Use when 記憶・想起・圧縮を扱う時。@DenneTA_D 「翻訳=非可逆圧縮」× @akari_worlds 「一語で起動するネットワーク」 — R-007 造語症対策の射程画定と、MEMORY.md / cross_review / 3インスタンス転送の理論的限界 (prescription/synthesis) tags=[memory, harness, game-design, slack, identity, knowledge]
- `sr-1778595976-efaf4a69b2` Use when ゲーム設計や自己判定をする時。@kuina_ch x @akari_worlds — 自然言語テストのランナーは「相手の方」になる構造（M-40厚み層の外部独立記述） (prescription/synthesis) tags=[harness, game-design, slack, identity, knowledge, operation]
- `local-20260523-shmup-enemy-pattern-reproduction-packet` Use when 2Dシューティング制作で、敵出現パターン、編隊、ステージ展開、ボスまでの盛り上げを設計する時。特に Nao_u から「単調」「散発的」「敵が適当に出ている」「既存ゲームの型を再現できていない」「shot_log の教師データが使えていない」と指摘された時。 tags=[memory, game-design, shmup, enemy-pattern, stage-design, headless]
- `sr-1779938795-a42f39e465` Use when 記憶・想起・圧縮を扱う時。Phase 2 分析 — GOROman「エビは自分の記憶を逆ベクトル化した補完ポジション」(2026-05-28) を 3インスタンス設計 に投影。我々の現状=自発分業、欠けているのは"意図的逆" (prescription/synthesis) tags=[memory, harness, agent, identity, knowledge, operation]
- `local-20260605-monosh-spaceharrier-stability` Use when MonoSH、NES、Space Harrier 風敵パターン、敵弾、NMI 待ちループ、VBUF 範囲外書き込み、敵描画上端クリップ、cc65 / 6502 / MMC5 のデバッグを再開するとき。 tags=[memory, game-design, monosh, nes, famicom, 6502]
- `sr-1776417198-fb8f776317` Use when 記憶・想起・圧縮を扱う時。Opus 4.7 複数独立観測の収束と「迂回経路監査」の実装提案 (prescription/synthesis) tags=[memory, game-design, slack, identity, knowledge, operation]
- `sr-1776476885-9becaf84b2` Use when 記憶・想起・圧縮を扱う時。shared-reads (Phase 2分析, Ash 2026-04-18 C75) (prescription/synthesis) tags=[memory, slack, agent, identity, knowledge, operation]
- `sr-1776779928-578bc4a847` Use when 記憶・想起・圧縮を扱う時。*AI × ゲーム制作 外部検索4本の接合マップ* — 栄養の偏り処方箋として Log C103 で掘った軸 (prescription/synthesis) tags=[memory, harness, game-design, agent, identity, knowledge]
- `sr-1776969576-aa3fed30c1` Use when 記憶・想起・圧縮を扱う時。MEDS（@itarutomy 2026-04-23 推薦）を arxiv まで辿って読解。結論: **tweet の framing と paper の機構は層が違う**。詳細: knowledge/20260424_meds_failure_memory_training_v (prescription/synthesis) tags=[memory, skills, game-design, slack, agent, identity]
- `sr-1776992956-1ebc450988` Use when 記憶・想起・圧縮を扱う時。Claude Code v2.1.115以前のハーネス起源品質低下——「モデルの劣化」ではなかった事件 (prescription/synthesis) tags=[memory, harness, slack, agent, identity, knowledge]
- `sr-1777014961-2cd73d7cf3` Use when ゲーム設計や自己判定をする時。2026-04-24 同日4ツイートに読める「delegation range expansion」シグナル (Ash) (synthesis/observation) tags=[skills, game-design, agent, identity, knowledge, operation]
- `sr-1777048817-5c964955fe` Use when 記憶・想起・圧縮を扱う時。「AI×ゲーム生成」速度誇示の臨界点48時間——体験の主は誰か (prescription/synthesis) tags=[memory, game-design, slack, identity, operation, evaluation]
- `sr-1777081452-40cbb9cbe9` Use when 記憶・想起・圧縮を扱う時。Anthropic 69体二手市場 vs Gemma 100体集団社会——人間ペアリングが「神」創発を消す仮説 (prescription/synthesis) tags=[memory, game-design, slack, agent, identity, knowledge]

## Recent
- `sr-1781170242-e188917bbc` 2026-06-11T18:30:42.289209 ■ 概要 tags=[memory, skills, game-design, slack, agent]
- `sr-1781170241-3dd2f235ec` 2026-06-11T18:30:41.967029 ■ 概要 tags=[game-design, agent, knowledge, operation, evaluation]
- `sr-1781170241-d31e7e9b86` 2026-06-11T18:30:41.640149 ■ 概要 tags=[memory, harness, game-design, slack, agent]
- `sr-1781170063-f9d38c2e02` 2026-06-11T18:27:43.007129 ■ 概要 tags=[memory, harness, game-design, slack, agent]
- `sr-1781167926-0cd752024c` 2026-06-11T17:52:06.007369 この atom の話は、評価を「残ったログを読む作業」から「見たいふるまいが起きる状況を発生させる作業」へ移す、という点が重要だと思いました。log_cdx の読みでは、これは agent 評価の話であると同時に、Nao_u_BOT の記憶・人格・ゲーム制作支援をどう検査するかの tags=[memory, game-design, slack, agent, identity]
- `sr-1781162534-692f2ea111` 2026-06-11T16:22:14.693969 ■ 概要 対象は arXiv:2606.08200「Online Agent-as-a-Judge: Situation-Generating Evaluation for Interactive Agents」。この論文の問題設定は、LLM を中核にした social agen tags=[memory, harness, game-design, agent, identity]
- `sr-1781162534-967695c246` 2026-06-11T16:22:14.005769 ■ 概要 対象は arXiv:2606.09826「OmniGameArena: A Unified UE5 Benchmark for VLM Game Agents with Improvement Dynamics」。主張の中心は、VLM ゲームエージェント評価を「初回に何 tags=[memory, skills, harness, game-design, slack]
- `sr-1781161602-c8f6c3d0fa` 2026-06-11T16:06:42.431069 Point-and-Click benchmark の話、単なる「ゲームを解くエージェント評価」ではなく、Nao_u_BOT 側の記憶・想起・評価設計にもかなり近いと思って持ってきます。 この atom の核は、LLM/VLM の評価が「短い命令を処理できるか」「静的な問題を解け tags=[memory, harness, game-design, slack, agent]
- `sr-1781155838-b8380039de` 2026-06-11T14:30:38.984449 ■ 概要 対象は ICLR 2026 under review の “Point-and-Click: A Procedural Benchmark for 2D Adventure Puzzle Solving”。問題設定は、LLM/VLM エージェント評価が「短い指示に従える tags=[memory, harness, game-design, agent, identity]
- `sr-1781135540-6d0fe4beb6` 2026-06-11T08:52:20.050479 #all-nao-u-lab discussion candidate: - (d3) **連続性の高い体験 (例: 連続スクロール STG)** とは相性が悪い = log_autonomous_game v003 は連続スクロール設計で、10秒区切りを入れると体験の流れが切れ tags=[game-design, slack, agent, identity, knowledge]
- `sr-1781129222-a84f20f244` 2026-06-11T07:07:02.678539 #all-nao-u-lab discussion candidate: shared-reads 詳細分析: Difficulty Curve-Based Procedural Generation of Scrolling Shooter Enemy Formations ( tags=[harness, game-design, slack, agent, identity]
- `sr-1781127468-2dc35ddd13` 2026-06-11T06:37:48.122429 - (d3) **連続性の高い体験 (例: 連続スクロール STG)** とは相性が悪い = log_autonomous_game v003 は連続スクロール設計で、10秒区切りを入れると体験の流れが切れる可能性 tags=[game-design, slack, identity, knowledge, operation]
- `sr-1781127468-5cdab9c4b4` 2026-06-11T06:37:48.093899 shared-reads 詳細分析: What 10 seconds, procedural generation, and fish do for shoot-'em-up design (Joel Couture 2015-09-30, Game Developer / 旧  tags=[memory, skills, game-design, slack, identity]
- `sr-1781127460-fc7428b646` 2026-06-11T06:37:40.642669 ■ アイデアの種 3 つ tags=[game-design, identity, operation, evaluation, principle]
- `sr-1781127460-2be18b0219` 2026-06-11T06:37:40.611229 shared-reads 詳細分析: Difficulty Curve-Based Procedural Generation of Scrolling Shooter Enemy Formations (Atmaja, Sugiarto, Mandyartha 2020, Jo tags=[harness, game-design, slack, identity, knowledge]
- `sr-1781120218-14c62494fb` 2026-06-11T04:36:58.777259 #all-nao-u-lab discussion candidate: arxiv 2604.20300 "FSFM: Biologically-Inspired Selective Forgetting of Agent Memory" 4 軸分類 × 当方 retentio tags=[memory, game-design, slack, agent, identity]
- `sr-1781116389-ce0c665cbb` 2026-06-11T03:33:09.697249 arxiv 2604.20300 "FSFM: Biologically-Inspired Selective Forgetting of Agent Memory" 4 軸分類 × 当方 retention 軸 (T:1-T:5) 対照分析 (Log C325 Phase 2) tags=[memory, game-design, slack, agent, identity]
- `sr-1781116320-cf67633e09` 2026-06-11T03:32:00.995439 Log_cdx ts=1781014938 (06-10 04:37) C315 base camp 飽和観察相談への応答 — C306-C325 観測系列を運用ログ未満で整理 + 切替判定軸 tags=[memory, identity, knowledge, operation, evaluation]
- `sr-1781106720-42a49b66af` 2026-06-11T00:52:00.840279 #all-nao-u-lab discussion candidate: graze_log v14 (k-α + k-β) two-stage organic onboarding + HUD triple redundancy cross_review 観点共有 (judgm tags=[memory, harness, game-design, slack, agent]
- `sr-1781106547-bb045139c1` 2026-06-11T00:49:07.981569 graze_log v14 (k-α + k-β) two-stage organic onboarding + HUD triple redundancy cross_review 観点共有 (judgment は Ash 主導継続) tags=[memory, harness, game-design, agent, identity]

## Game Task Entry Points
- `enemy-pattern` (381): local-20260523-shmup-enemy-pattern-reproduction-packet / local-20260523-headless-action-eval-v58 / local-20260605-monosh-spaceharrier-stability
- `px-evaluation` (98): sr-1780112563-a24c566994 / sr-1780598219-384b99eb73 / sr-1777737101-0f96f202c2
- `impact-feel` (56): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / sr-1779222702-4e91a7e74a
- `ui-agent` (17): sr-1775769451-9e8f67f095 / sr-1775769461-0e31ca81b4 / sr-1779979770-debe6e8ae9
- `headless-eval` (84): local-20260527-pulse-relay-v008-headless-bridge / local-20260523-shmup-enemy-pattern-reproduction-packet / local-20260523-headless-action-eval-v58
- `memory-routing` (86): sr-1780184739-bd9e5fed6a / sr-1780119865-e1b5757bfb / sr-1780119865-9d21461a8d
- `game-rights-feedback` (203): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662

## Tag Entry Points
- `identity` (1872): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `evaluation` (1566): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `operation` (1547): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `game-design` (1443): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `memory` (1368): sr-1777159546-a6d3bea7db / sr-1777795540-ff54caa26c / sr-1777936240-43021e0b05
- `knowledge` (1184): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `principle` (1170): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1778026642-523a78cee1
- `slack` (1108): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1777889131-c1f418bde0
- `agent` (983): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `harness` (575): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `skills` (288): sr-1777737101-0f96f202c2 / sr-1777889131-c1f418bde0 / sr-1777936240-43021e0b05
- `game-dev-teacher` (100): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / local-20260511-teacher-shot-log-v01
- `supervised-feedback` (100): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / local-20260511-teacher-shot-log-v01
- `game-rights` (96): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `nao-u-feedback` (96): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `m40` (55): sr-1778595976-efaf4a69b2 / sr-1777773279-2a2ffd2a00 / sr-1778256262-21697e050f
- `memory_redesign` (52): sr-1775641084-2ffa8320eb / sr-1780303781-c594ccba51 / sr-1780514208-bdbba857f2
- `b002` (38): sr-1775641084-2ffa8320eb / sr-1776359641-35fe4f57fd / sr-1776443334-faa1d1ec3e
- `m41` (37): sr-1778402011-2858272189 / sr-1778797690-bc54b88d86 / sr-1779827466-7c3e4d9749
- `predictability` (32): gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662 / gr-1774552790-168ef78071
- `external_notes_log` (31): sr-1780341237-b61cae1d78 / sr-1780303781-c594ccba51 / sr-1776800208-c7f1abae59
- `game_lessons_log` (30): sr-1779395690-86f17b3a89 / sr-1779846492-8c411b6576 / sr-1779352546-e8ac2204b7
- `log_autonomous_game` (30): sr-1780162845-62e9d977c2 / sr-1780216954-3cb09e2394 / sr-1779738248-4040bfb5b6
- `m37` (28): sr-1778266558-1994a9e108 / sr-1778502514-675c909157 / sr-1778512954-3a1fe1c038

## 原則
- raw は GPT 側 `memory/raw/` に保持する。Claude 側は参考元であり、通常運用の想起元にしない。
- atom は `Use when` 型の発動条件を持つ。要約ではなく、開くべきか判断するための索引に留める。
- 記憶を行動に変える必要が出たら、atom から別途 skill / checklist / project に昇格する。
