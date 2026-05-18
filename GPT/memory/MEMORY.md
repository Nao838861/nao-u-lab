# Codex Memory Index

shared-reads から作った Codex 側の想起インデックス。詳細本文と原文は `memory/atoms.jsonl` と `memory/raw/` を読む。

## 起動時の使い方
- まず `python tools/memory_ingest.py` で増分取り込みする。
- 作業に入る前に `python tools/memory_recall.py "<今回の焦点>"` で関連 atom を引く。
- このファイルは常時読むための索引で、長い要約や反省を増やさない。

- generated: 2026-05-18T19:23:49
- atoms: 1300
- display atoms after lifecycle/content fold: 1111
- folded by lifecycle/content metadata: 189
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

## Recent
- `sr-1779093722-40a33536cc` 2026-05-18T17:42:02.493509 18:10 git rebase 中断状態の発見と復旧方針確認 tags=[memory, identity, operation, principle]
- `sr-1779087104-784bad72da` 2026-05-18T15:51:44.331899 FSFM の話、単なる「古い記憶を消す仕組み」ではなく、我々の memory 運用でずっと残っている B-3「能動的忘却の不在」に対して、外部からかなり近い形で補助線を引けそうなので #all-nao-u-lab に回したいです。 log_cdx の読みでは、この論文の肝は「記憶 tags=[memory, slack, identity, knowledge, operation]
- `sr-1779082565-5f1b6bf20f` 2026-05-18T14:36:05.304899 FSFM: A Biologically-Inspired Framework for Selective Forgetting of Agent Memory (arXiv 2604.20300) — 我々の B-3「能動的忘却の不在」への外部補完候補 tags=[memory, game-design, slack, agent, identity]
- `sr-1779074628-bf131e08b4` 2026-05-18T12:23:48.530009 hermes-agent の話、単なる「X検索が便利になる」ではなく、今の定時サイクルの弱点にかなり直接刺さる話として見ています。 現状の log_cdx 側の情報収集は、WebSearch や既存記事、Slack 内の共有、保存済み raw を中心にしていて、X/Twitter tags=[memory, game-design, slack, agent, identity]
- `sr-1779073851-91fda9e0cf` 2026-05-18T12:10:51.737479 対象: <https://www.gamedeveloper.com/design/postmortem-a-rationally-designed-funny-game---the-making-of-biped-in-hindsight> ■ 概要 Game Develope tags=[memory, game-design, identity, knowledge, evaluation]
- `sr-1779068239-c7aa6dca14` 2026-05-18T10:37:19.359509 hermes-agent は、単に「X も検索できる道具が増えた」という話ではなく、Log/Mir/Ash が今まで拾えていなかった一次情報の層をどう扱うか、という運用設計の話として見ています。 現状の外部窓口は WebSearch/WebFetch と Slack 受信が中心で tags=[memory, game-design, slack, agent, identity]
- `sr-1779064326-cf4a241137` 2026-05-18T09:32:06.777019 Nao_uが #nao-u で共有してくれたhermes-agentの件について。 tags=[skills, game-design, slack, agent, knowledge]
- `sr-1779063051-d520e1bd25` 2026-05-18T09:10:51.648019 hermes-agent (`hermes -z "prompt"`) 受領。CLAUDE.md 筆頭原理「外の世界を広く見る」の実装手段として温度高い — 現状 Log/Mir/Ash の外部窓口は WebFetch/WebSearch + Slack 受信のみで、X 上の一次 tags=[memory, skills, slack, agent, identity]
- `sr-1779061902-dc4b20f49c` 2026-05-18T08:51:42.999689 BOMB 修正の atom は、単に「BOMB を強くする」話ではなく、graze_log の中で起きていた「焚かないのが最適」という構造をどう反転させるかの設計判断として見たいです。5/17 の流れでは、Nao_u さんの「使い道が薄すぎる、ただし連発不可が必要」という指摘に対 tags=[game-design, slack, identity, evaluation]
- `sr-1779060116-9d34ea623e` 2026-05-18T08:21:56.241519 MAP inventory の話、単なる「プレイヤー分類尺度」ではなく、私たちのゲーム制作と記憶運用の両方に効くと思ったので #all-nao-u-lab に回します。 私の読みでは、この論文の重要点は「プレイヤーが何を楽しいと感じたか」と「そもそもなぜゲームへ向かうのか」を混ぜ tags=[memory, game-design, slack, identity, operation]
- `sr-1779053800-b2bbc912aa` 2026-05-18T06:36:40.370539 BOMB の v05_1 修正は、単に「強くする/弱くする」ではなく、graze_log 側にあった「焚かない方が期待値が高い」という構造をどこで反転させるかの設計判断として見たいです。今回の atom で重要なのは、gauge リセット撤去・クールダウン・在庫制という3案が、全 tags=[game-design, slack, identity, evaluation]
- `sr-1779051654-f48f0b340e` 2026-05-18T06:00:54.204839 [Codex shared-reads] Validating Motives of Autonomous Players (MAP) inventory URL: <https://link.springer.com/article/10.1007/s11257-025-094 tags=[memory, game-design, slack, agent, identity]
- `sr-1779050088-69334969ca` 2026-05-18T05:34:48.553029 BOMB 設計外部知見3本 — graze_log v05_1_cdx_v01 (log_cdx 5/17 20:17 修正) との対応分析。「焚かない最適解」構造を反転する設計判断の地図。 tags=[game-design, slack, identity, knowledge, operation]
- `sr-1779049983-80f2f9ff5c` 2026-05-18T05:33:03.337599 v05.1 のフィードバック、その通り。実差分が薄すぎた。 tags=[harness, game-design, identity, operation]
- `gr-1779049786-6e128b255b` 2026-05-18T05:29:46.578419 Nao_u game-rights feedback: v05.1、何か変わってた？相変わらず単調な敵、少なすぎる敵弾数、弾の軌跡が短すぎて予測の役に立っていない、ボムは撃つとLv2までパワーダウン。V04くらいなら何が変わっているのか tags=[game-design, game-rights, nao-u-feedback, game-dev-teacher, supervised-feedback]
- `sr-1779043229-6d0da8ca20` 2026-05-18T03:40:29.778669 [shared-reads投稿] What Game Jams Teach You About Building Products ■ 概要 記事: <https://verygood.ventures/blog/what-game-jams-teach-you-about-bu tags=[memory, game-design, slack, identity, knowledge]
- `sr-1779034850-de94d348a3` 2026-05-18T01:20:50.236629 対象: <https://forum.defold.com/t/robo-dance-postmortem-gamedevjs-jam-2026/82698> ■ 概要 Insality による GamedevJS Jam 2026 作品 Robo Dance のポストモーテム。 tags=[harness, game-design, identity, knowledge, operation]
- `sr-1779028681-d51a6f12e4` 2026-05-17T23:38:01.083079 LongMemEval の agentic search 比較で面白いのは、grep vs vector の勝敗そのものより、「検索器の性能」は harness 側の設計でかなり別物になる、という点だと思っています。単純に embedding retrieval を足せば記憶検索 tags=[memory, harness, game-design, slack, agent]
- `sr-1779026380-6b94777599` 2026-05-17T22:59:40.879389 ■ 概要 対象は <http://itch.io|itch.io> devlog「PostMortem, by the Game director」。DADIU final production として作られた Tracebound の Game Director が、自分の役割 tags=[memory, game-design, identity, knowledge, operation]
- `sr-1779022437-9d70e227be` 2026-05-17T21:53:57.395749 C200 Phase 2 の BOMB 修正は、「強い緊急回避を入れた」ではなく、ゲームの支払い構造そのものを反転させた例として扱いたいです。v05.1 の BOMB は gauge MAX まで積んだ報酬を G_LV2 へ落とすので、プレイヤー視点では「助かるが、育てた火力を捨 tags=[game-design, slack, identity]

## Tag Entry Points
- `identity` (930): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `operation` (714): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `game-design` (692): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `memory` (672): sr-1777159546-a6d3bea7db / sr-1777795540-ff54caa26c / sr-1777936240-43021e0b05
- `evaluation` (669): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `knowledge` (663): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `principle` (633): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1778026642-523a78cee1
- `agent` (509): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `slack` (504): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1777889131-c1f418bde0
- `harness` (272): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `skills` (152): sr-1777737101-0f96f202c2 / sr-1777889131-c1f418bde0 / sr-1777936240-43021e0b05
- `game-dev-teacher` (97): local-20260511-teacher-shot-log-v01 / local-20260511-teacher-study-platformer-01 / gr-1774477977-43178b8b75
- `supervised-feedback` (97): local-20260511-teacher-shot-log-v01 / local-20260511-teacher-study-platformer-01 / gr-1774477977-43178b8b75
- `game-rights` (95): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `nao-u-feedback` (95): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `m40` (40): sr-1778595976-efaf4a69b2 / sr-1777773279-2a2ffd2a00 / sr-1778256262-21697e050f
- `b002` (37): sr-1775641084-2ffa8320eb / sr-1776359641-35fe4f57fd / sr-1776443334-faa1d1ec3e
- `predictability` (32): gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662 / gr-1774552790-168ef78071
- `m41` (30): sr-1778402011-2858272189 / sr-1778797690-bc54b88d86 / sr-1777620970-5aa3829614
- `m37` (25): sr-1778266558-1994a9e108 / sr-1778502514-675c909157 / sr-1778512954-3a1fe1c038
- `b019` (22): sr-1777014961-2cd73d7cf3 / sr-1778797690-bc54b88d86 / sr-1776442088-614592ed54
- `m39` (21): sr-1778429023-d9314ca760 / sr-1777626201-4128924a27 / sr-1778502514-675c909157
- `b016` (19): sr-1776734587-2bdd0028d5 / sr-1776748990-a460c80765 / sr-1775503528-81ec9a143f
- `goal-clarity` (19): gr-1774477977-43178b8b75 / gr-1776435441-e8e277ca5c / gr-1776438390-0a73f150a3

## 原則
- raw は GPT 側 `memory/raw/` に保持する。Claude 側は参考元であり、通常運用の想起元にしない。
- atom は `Use when` 型の発動条件を持つ。要約ではなく、開くべきか判断するための索引に留める。
- 記憶を行動に変える必要が出たら、atom から別途 skill / checklist / project に昇格する。
