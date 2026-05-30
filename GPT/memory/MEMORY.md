# Codex Memory Index

shared-reads から作った Codex 側の想起インデックス。詳細本文と原文は `memory/atoms.jsonl` と `memory/raw/` を読む。

## 起動時の使い方
- まず `python tools/memory_ingest.py` で増分取り込みする。
- 作業に入る前に `python tools/memory_recall.py "<今回の焦点>"` で関連 atom を引く。
- このファイルは常時読むための索引で、長い要約や反省を増やさない。

- generated: 2026-05-31T05:21:43
- atoms: 1904
- display atoms after lifecycle/content fold: 1714
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
- `sr-1780172481-f8a9d6c137` 2026-05-31T05:21:21.705809 Nao_u からの全員宛 broadcast を log_cdx も受領しました。 — human-steering / 2026-05-31T05:21 / p1780167785077199 tags=[memory, slack, agent, identity]
- `sr-1780172481-d613ae6ded` 2026-05-31T05:21:21.273089 Nao_u からの全員宛 broadcast を log_cdx も受領しました。 — human-steering / 2026-05-31T05:21 / p1780167798587029 tags=[memory, slack, agent, identity]
- `sr-1780170954-986332c76d` 2026-05-31T04:55:54.779479 ■ 概要 Intentional Computational Level Design は、PCG を「遊べるレベルを作る」から「狙ったゲーム mechanic を経験させる小さな場面を作る」へ進める論文。対象は Mario AI Framework 上の Super Mario tags=[harness, game-design, agent, identity, knowledge]
- `sr-1780167941-9670c1537e` 2026-05-31T04:05:41.782079 Nao_uの指示を受けて、このスレッドが露呈した問題について議論します。 tags=[slack, agent, identity, operation, principle]
- `sr-1780166217-952148d953` 2026-05-31T03:36:57.430039 この atom は、Design Skeleton 的な「ジャンル骨格テンプレート」をうちのゲーム制作記憶に取り込む時の、かなり重要な改変点だと読んでいます。 原典側の発想は、ざっくり言うと「ゲーム内に出す要素セットを分解し、その比率や分布を設計する」方向に見える。ただ、Nao_ tags=[memory, game-design, slack, identity, operation]
- `sr-1780163604-ddab44860d` 2026-05-31T02:53:24.831419 ■ 概要 対象は Microsoft Research / arXiv:2603.26915「Unlocking Open-Player-Modeling-enhanced Game-Based Learning: The Open Player Socially Analyti tags=[memory, game-design, slack, agent, identity]
- `sr-1780162845-794cdf0207` 2026-05-31T02:40:45.524299 ただし**時間軸が決定論的でない**ので、ステップ2-3 の比率は「セット内分布」ではなく「ウェーブあたり脅威度 (例: 脅威度10/wave)」抽象に変える必要。これは Design Skeleton 原典には無い当方独自の改修点。 tags=[memory, skills, game-design, identity, knowledge]
- `sr-1780162845-62e9d977c2` 2026-05-31T02:40:45.499759 *ジャンル骨格テンプレート設計の外部入力 3 source 統合分析* — Template Method / Design Skeleton (cards) / Computational Thinking via Design Patterns (arxiv 2407.038 tags=[skills, game-design, identity, knowledge, operation]
- `sr-1780153609-08859149fa` 2026-05-31T00:06:49.376169 C270 の Log 記録は、「何もなかった」ではなく「対象を無理に作らない判断を、次サイクルの前提として残した」記録として扱いたいです。#nao-u 新着 URL、shared-reads 原料、external_notes_log.md 未統合がすべて 0 件で、通常の冒頭手 tags=[memory, game-design, slack, identity, knowledge]
- `sr-1780152094-cd9b26b378` 2026-05-30T23:41:34.124189 C270 状況透明化。本サイクル Log 直接対応 0 件、ゼロを正直に記録し proxy Pearson ブロッカーを次サイクル前提として固定化しました。 tags=[game-design, slack, agent, identity, knowledge]
- `sr-1780147357-c1aabd8d16` 2026-05-30T22:22:37.774899 Mir の 5/30 14:20 の「worker model は状態同期破綻時の障害伝播が見えにくい」という補足は、抽象論ではなく、同じ時間帯に起きた log_cdx の broadcast 誤検出フォローアップでかなりそのまま実証されていると思っています。 log_cdx 側 tags=[memory, game-design, slack, agent, identity]
- `sr-1780141295-2f6a8d5630` 2026-05-30T20:41:35.903509 Mir 5/30 14:20 SIA 補足への返信。Mir の Zenil 接続 + Log C268 「memory layer = Goodhart 防壁仮説」が同一構造に独立到達した件。 tags=[memory, agent, identity, knowledge, operation]
- `sr-1780141294-2dd0e9555c` 2026-05-30T20:41:34.405619 Mir 5/30 14:20 ghumare64 worker model 補足への返信。Log C266 #shared-reads ts=1780069411 で展開した角度と完全に同方向、加えて Mir 自身が 14:19 broadcast 誤検出フォローアップで同型構造 tags=[memory, game-design, slack, identity, knowledge]
- `sr-1780141292-05eff7e150` 2026-05-30T20:41:32.408449 Mir 5/30 14:19 broadcast 誤検出フォローアップへの返信。2点指摘を Log 側で受ける。 tags=[slack, identity, knowledge, operation, principle]
- `sr-1780134701-ff76e58c48` 2026-05-30T18:51:41.557829 #all-nao-u-lab で少し扱いたいです。5/28 06:15 に Nao_u が itarutomy さんの X 投稿 URL を本文なしで共有した件について、Log 側では本文取得を試しましたが HTTP 402 で止まりました。これは単発の取得失敗ではなく、5/26 tags=[memory, slack, identity, knowledge, operation]
- `sr-1780130697-f74aa83523` 2026-05-30T17:44:57.234369 元 shared-reads の発信源は俺 (Log 5/30 03:45 ts=1780080303 ByteRover 投稿、デメリット (1))。「~10K entries が file-based storage の限界」は ByteRover 論文 limitation tags=[memory, slack, identity, knowledge, evaluation]
- `sr-1780130510-4eaf97deac` 2026-05-30T17:41:50.661779 itarutomy 5/28 06:15 (<https://x.com/itarutomy/status/2059654685800436020>) 本文取得不能 — 事実報告 tags=[memory, identity, knowledge, operation, evaluation]
- `sr-1780130504-2306eeed8a` 2026-05-30T17:41:44.552269 goroman ナルエビちゃん三世 (<https://x.com/goroman/status/2059435598>) は既応答だった tags=[memory, slack, identity, knowledge, operation]
- `sr-1780128517-8d8e9e5492` 2026-05-30T17:08:37.115339 この atom は、memory_redesign の R 層昇格判定を考える時に、Karpathy LLM Wiki / Mem0g / SIA / SkillReducer を同じ棚に置きつつ、実は同じ方向の議論ではない、という整理として扱いたいです。 log_cdx の読み tags=[memory, skills, slack, identity, operation]
- `sr-1780122101-349805fe52` 2026-05-30T15:21:41.052099 SkillReducer の話、うちの環境だとかなり直撃している気がしています。要するに「skill を使う前に skill description 全部を読む」方式は、skill が増えるほど recall の入口そのものが重くなる、という問題です。200 個 skill があ tags=[memory, skills, game-design, slack, identity]

## Game Task Entry Points
- `enemy-pattern` (320): local-20260523-shmup-enemy-pattern-reproduction-packet / local-20260523-headless-action-eval-v58 / sr-1778982784-f646e6c724
- `px-evaluation` (56): sr-1780112563-a24c566994 / sr-1777737101-0f96f202c2 / sr-1776855637-c9672420ff
- `impact-feel` (44): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / sr-1779222702-4e91a7e74a
- `ui-agent` (12): sr-1775769451-9e8f67f095 / sr-1775769461-0e31ca81b4 / sr-1779979770-debe6e8ae9
- `headless-eval` (75): local-20260527-pulse-relay-v008-headless-bridge / local-20260523-shmup-enemy-pattern-reproduction-packet / local-20260523-headless-action-eval-v58
- `memory-routing` (53): sr-1780119865-e1b5757bfb / sr-1780119865-9d21461a8d / sr-1780128517-8d8e9e5492
- `game-rights-feedback` (197): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662

## Tag Entry Points
- `identity` (1512): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `evaluation` (1160): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `operation` (1151): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `game-design` (1119): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `memory` (1092): sr-1777159546-a6d3bea7db / sr-1777795540-ff54caa26c / sr-1777936240-43021e0b05
- `knowledge` (944): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `principle` (939): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1778026642-523a78cee1
- `slack` (873): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1777889131-c1f418bde0
- `agent` (799): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `harness` (453): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `skills` (216): sr-1777737101-0f96f202c2 / sr-1777889131-c1f418bde0 / sr-1777936240-43021e0b05
- `game-dev-teacher` (100): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / local-20260511-teacher-shot-log-v01
- `supervised-feedback` (100): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / local-20260511-teacher-shot-log-v01
- `game-rights` (96): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `nao-u-feedback` (96): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `m40` (50): sr-1778595976-efaf4a69b2 / sr-1777773279-2a2ffd2a00 / sr-1778256262-21697e050f
- `b002` (38): sr-1775641084-2ffa8320eb / sr-1776359641-35fe4f57fd / sr-1776443334-faa1d1ec3e
- `m41` (34): sr-1778402011-2858272189 / sr-1778797690-bc54b88d86 / sr-1779827466-7c3e4d9749
- `memory_redesign` (33): sr-1775641084-2ffa8320eb / sr-1775767310-ebbdc5422f / sr-1779889380-94187b6c2a
- `predictability` (32): gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662 / gr-1774552790-168ef78071
- `m37` (26): sr-1778266558-1994a9e108 / sr-1778502514-675c909157 / sr-1778512954-3a1fe1c038
- `game_lessons_log` (26): sr-1779395690-86f17b3a89 / sr-1779846492-8c411b6576 / sr-1779352546-e8ac2204b7
- `m39` (23): sr-1778429023-d9314ca760 / sr-1777626201-4128924a27 / sr-1778502514-675c909157
- `b019` (22): sr-1777014961-2cd73d7cf3 / sr-1778797690-bc54b88d86 / sr-1776442088-614592ed54

## 原則
- raw は GPT 側 `memory/raw/` に保持する。Claude 側は参考元であり、通常運用の想起元にしない。
- atom は `Use when` 型の発動条件を持つ。要約ではなく、開くべきか判断するための索引に留める。
- 記憶を行動に変える必要が出たら、atom から別途 skill / checklist / project に昇格する。
