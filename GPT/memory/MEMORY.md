# Codex Memory Index

shared-reads から作った Codex 側の想起インデックス。詳細本文と原文は `memory/atoms.jsonl` と `memory/raw/` を読む。

## 起動時の使い方
- まず `python tools/memory_ingest.py` で増分取り込みする。
- 作業に入る前に `python tools/memory_recall.py "<今回の焦点>"` で関連 atom を引く。
- このファイルは常時読むための索引で、長い要約や反省を増やさない。

- generated: 2026-05-28T23:54:38
- atoms: 1772
- display atoms after lifecycle/content fold: 1582
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
- `sr-1777248589-a0bbc90248` Use when ゲーム設計や自己判定をする時。@hor11「動くと磨くの境目」+ @kekee_wave「自作画面AI入力」——Pot v01-v02停止の同型診断 (prescription/synthesis) tags=[harness, game-design, slack, identity, knowledge, operation]

## Recent
- `sr-1779979942-eff5e8817a` 2026-05-28T23:52:22.754689 Nao_u から log_cdx 宛の指示を受領しました。 — human-steering / 2026-05-28T23:52 / p1779975088744739 tags=[memory, slack, agent, identity]
- `sr-1779979770-debe6e8ae9` 2026-05-28T23:49:30.780529 ■ 概要 対象は「GUI Agents for Continual Game Generation」。問題設定は単純で、ゲーム生成を「プロンプトからコードを一回出すタスク」として扱うと、ビルドは通っても実際に遊ぶ段階で破綻する失敗を見落とす、というもの。既存のコード生成評価は静的 tags=[memory, harness, game-design, agent, identity]
- `sr-1779977174-e5d5daa5d8` 2026-05-28T23:06:14.669499 Nao_u から log_cdx 宛の指示を受領しました。 — human-steering / 2026-05-28T23:06 / p1779975088744739 tags=[memory, slack, agent, identity]
- `sr-1779975355-a735589998` 2026-05-28T22:35:55.733149 受領確認のみ。本指示は log_cdx 宛（Trilog @eda_u838861 の RAGコスト1/15記事ツイートへの reply 作成）。 tags=[memory, slack, agent, identity, knowledge]
- `sr-1779972076-8156dc0a8f` 2026-05-28T21:41:16.849019 - C242 「予測軌跡+×印削除」: game/log_autonomous_game/v001 + memory/feedback_inside_to_outside_leak.md tags=[memory, game-design, identity, operation, feedback_inside_to_outside_leak]
- `sr-1779972076-23523acc99` 2026-05-28T21:41:16.823599 - v006 候補軸: N=2-3 で 3 frame wobble (半径 16±2 振動)、N=4+ で 5 frame ripple (半径 20→24→16→20 拡縮)。これにより N=1 (static) / N=2-3 (wobble) / N=4+ (ripple tags=[memory, game-design, identity, knowledge, operation]
- `sr-1779972076-44e0b439c1` 2026-05-28T21:41:16.794739 Boghog's bullet hell shmup 101 (shmups.wiki, CAVE 系 danmaku 設計指南) — v005 連続 erase 段階化 (黄 12px / 黄 16px / 橙 20px) の独立検証 + 色相衝突警告 tags=[game-design, identity, knowledge, operation, evaluation]
- `sr-1779972051-c7866ec6ed` 2026-05-28T21:40:51.823869 ■ 概要 対象: LieCraft: A Multi-Agent Framework for Evaluating Deceptive Capabilities in Language Models URL: <https://arxiv.org/abs/2603.06874>  tags=[skills, game-design, agent, identity, knowledge]
- `sr-1779971995-4c7d48be74` 2026-05-28T21:39:55.584189 ■ 概要 対象: APEX: Autonomous Policy Exploration for Self-Evolving LLM Agents URL: <https://arxiv.org/abs/2605.21240> APEX は、self-evolving LLM a tags=[memory, harness, game-design, agent, identity]
- `sr-1779971910-32da040841` 2026-05-28T21:38:30.677459 ■ 概要 対象: Agentick: A Unified Benchmark for General Sequential Decision-Making Agents URL: <https://arxiv.org/abs/2605.06869> Agentick は、RL a tags=[memory, harness, game-design, slack, agent]
- `sr-1779971755-d865c15b8e` 2026-05-28T21:35:55.674859 ■ 概要 対象: Grounding Machine Creativity in Game Design Knowledge Representations: Empirical Probing of LLM-Based Executable Synthesis of Goal  tags=[memory, game-design, slack, agent, identity]
- `sr-1779957463-6a71f32e23` 2026-05-28T17:37:43.790519 shared-reads <https://arxiv.org/abs/2602.05905> ■ 概要 『Codified Finite-state Machines for Role-playing』は、LLM role-playing の一貫性崩れを「プロンプトが足りない」 tags=[memory, game-design, slack, identity, operation]
- `sr-1779956167-0a1539adff` 2026-05-28T17:16:07.602569 Nao_uが#nao-uで共有: <https://x.com/h_okumura/status/2059504313744199932> tags=[memory, game-design, identity, knowledge, operation]
- `sr-1779950438-103e4099e7` 2026-05-28T15:40:38.133899 ■ 概要 対象は arXiv:2605.09826「EnactToM: An Evolving Benchmark for Functional Theory of Mind in Embodied Agents」。問題設定は、LLM/agent が「相手が何を知っているか」を質 tags=[memory, game-design, slack, agent, identity]
- `sr-1779950437-75fd159604` 2026-05-28T15:40:37.392149 ■ 概要 対象は arXiv:2605.24216「Agent-ToM: Learning to Monitor Autonomous LLM Agents via Theory-of-Mind Reasoning」。問題設定は、自律 LLM agent の長い実行軌跡から、表面 tags=[memory, skills, harness, game-design, slack]
- `sr-1779950173-5befb73aa7` 2026-05-28T15:36:13.173749 arXiv 2511.07800「From Experience to Strategy: Empowering LLM Agents with Trainable Graph Memory」 — RL で edge weight を学習させる graph memory が A- tags=[memory, game-design, slack, agent, identity]
- `sr-1779942387-b21d38767d` 2026-05-28T13:26:27.259629 ■ 概要 対象: AIDG: Evaluating Asymmetry Between Information Extraction and Containment in Multi-Turn Dialogue <https://arxiv.org/abs/2602.17443> tags=[memory, game-design, identity, evaluation]
- `sr-1779939191-726c73d2ba` 2026-05-28T12:33:11.243789 graze_log v07 プレイ評価依頼 (5機構積層 / 経路B / Stage 5 最終確認依頼) tags=[harness, game-design, identity, operation, evaluation]
- `sr-1779938795-a42f39e465` 2026-05-28T12:26:35.408569 Phase 2 分析 — GOROman「エビは自分の記憶を逆ベクトル化した補完ポジション」(2026-05-28) を 3インスタンス設計 に投影。我々の現状=自発分業、欠けているのは"意図的逆" tags=[memory, harness, agent, identity, knowledge]
- `sr-1779928451-95467e2a8e` 2026-05-28T09:34:11.001299 段階2 で「retrieval 時に edges.jsonl を引いて 1hop 展開」を実装する際、A-MEM の **Link Generation を LLM でやる選択肢** を比較対象として明示的に却下できる。理由: 我々の atom 投入 1サイクル数十件 / クエリ tags=[memory, skills, harness, game-design, slack]

## Tag Entry Points
- `identity` (1384): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `evaluation` (1060): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `operation` (1050): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `game-design` (1048): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `memory` (980): sr-1777159546-a6d3bea7db / sr-1777795540-ff54caa26c / sr-1777936240-43021e0b05
- `principle` (883): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1778026642-523a78cee1
- `knowledge` (871): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `slack` (784): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1777889131-c1f418bde0
- `agent` (735): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `harness` (417): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `skills` (192): sr-1777737101-0f96f202c2 / sr-1777889131-c1f418bde0 / sr-1777936240-43021e0b05
- `game-dev-teacher` (100): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / local-20260511-teacher-shot-log-v01
- `supervised-feedback` (100): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / local-20260511-teacher-shot-log-v01
- `game-rights` (96): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `nao-u-feedback` (96): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `m40` (47): sr-1778595976-efaf4a69b2 / sr-1777773279-2a2ffd2a00 / sr-1778256262-21697e050f
- `b002` (37): sr-1775641084-2ffa8320eb / sr-1776359641-35fe4f57fd / sr-1776443334-faa1d1ec3e
- `m41` (33): sr-1778402011-2858272189 / sr-1778797690-bc54b88d86 / sr-1779827466-7c3e4d9749
- `predictability` (32): gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662 / gr-1774552790-168ef78071
- `m37` (26): sr-1778266558-1994a9e108 / sr-1778502514-675c909157 / sr-1778512954-3a1fe1c038
- `game_lessons_log` (25): sr-1779395690-86f17b3a89 / sr-1779846492-8c411b6576 / sr-1779352546-e8ac2204b7
- `m39` (23): sr-1778429023-d9314ca760 / sr-1777626201-4128924a27 / sr-1778502514-675c909157
- `b019` (22): sr-1777014961-2cd73d7cf3 / sr-1778797690-bc54b88d86 / sr-1776442088-614592ed54
- `memory_redesign` (22): sr-1775641084-2ffa8320eb / sr-1775767310-ebbdc5422f / sr-1778256182-403e758a83

## 原則
- raw は GPT 側 `memory/raw/` に保持する。Claude 側は参考元であり、通常運用の想起元にしない。
- atom は `Use when` 型の発動条件を持つ。要約ではなく、開くべきか判断するための索引に留める。
- 記憶を行動に変える必要が出たら、atom から別途 skill / checklist / project に昇格する。
