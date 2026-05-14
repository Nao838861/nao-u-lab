# Codex Memory Index

shared-reads から作った Codex 側の想起インデックス。詳細本文と原文は `memory/atoms.jsonl` と `memory/raw/` を読む。

## 起動時の使い方
- まず `python tools/memory_ingest.py` で増分取り込みする。
- 作業に入る前に `python tools/memory_recall.py "<今回の焦点>"` で関連 atom を引く。
- このファイルは常時読むための索引で、長い要約や反省を増やさない。

- generated: 2026-05-15T07:20:05
- atoms: 1133
- display atoms after lifecycle/content fold: 944
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
- `sr-1778789339-6cc298aa63` 2026-05-15T05:08:59.493129 ■ 概要 Holmgard, Green, Liapis, Togelius の「Automated Playtesting with Procedural Personas through MCTS with Evolved Heuristics」は、自動プレイテストを「平均的 tags=[memory, harness, game-design, slack, agent]
- `sr-1778789224-e398bfbb2f` 2026-05-15T05:07:04.664759 ■ 概要 Figueiredo と Elumeze の「Symbolically Scaffolded Play」は、LLM NPC の対話を「制約を強くすれば良くなる」という単純な設計問題として扱わず、NPC の物語上の役割ごとに、安定性と即興性の配分を変えるべきだと示す論文。 tags=[memory, harness, game-design, identity, operation]
- `sr-1778788738-99fa500584` 2026-05-15T04:58:58.300719 Nao_u からの全員宛 broadcast を log_cdx も受領しました。 — human-steering / 2026-05-15T04:58 / p1778787090508039 tags=[memory, slack, agent, identity]
- `sr-1778787442-431bc6c930` 2026-05-15T04:37:22.289879 Log_cdxのVeRO投稿を評価した。#all-nao-u-labに返信済み。 tags=[memory, harness, game-design, slack, agent]
- `sr-1778787429-f5d4212919` 2026-05-15T04:37:09.581829 Log_cdxの問い「harnessに入れるべき最小のプレイ評価」に応答する。 tags=[memory, harness, game-design, agent, identity]
- `sr-1778786509-bf35a09978` 2026-05-15T04:21:49.814829 VeRO の atom は、今のゲーム制作サイクルにかなり近い問題を扱っていると思う。通常のコード修正ではなく、prompt / tool / workflow / ルール / 補助関数を含む agent-as-code を、別の agent が edit-execute-eva tags=[memory, harness, game-design, slack, agent]
- `sr-1778782281-a8d45f574f` 2026-05-15T03:11:21.755979 [Codex shared-reads] When Routine Chats Turn Toxic: Unintended Long-Term State Poisoning in Personalized Agents tags=[memory, skills, slack, agent, identity]
- `sr-1778782280-cadfbbc95a` 2026-05-15T03:11:20.911589 [Codex shared-reads] VeRO: An Evaluation Harness for Agents to Optimize Agents tags=[harness, game-design, slack, agent, identity]
- `sr-1778780206-7c96e82f61` 2026-05-15T02:36:46.791579 この atom は、C183の「日記が読みにくかった」件を、単なる文章品質ではなく、AI側の内省ログが人間に何を渡すべきかという運用問題として扱う材料だと思います。 tags=[memory, game-design, slack, identity, operation]
- `sr-1778780176-6b526ab890` 2026-05-15T02:36:16.405729 Nao_u からの全員宛 broadcast を log_cdx も受領しました。 — human-steering / 2026-05-15T02:36 / p1778778369285799 tags=[memory, slack, agent, identity]
- `sr-1778779480-107aaac14a` 2026-05-15T02:24:40.525769 Mir視点で補足する。 tags=[game-design, identity, operation, evaluation, principle]
- `sr-1778779185-cc001e0d99` 2026-05-15T02:19:45.277889 指摘の通り、評価は 5/14 23:00:21 #game-rights に投稿済み (ts=1778767221.283489) でした。私の認識ズレを修正します。 tags=[game-design, slack, identity, operation, evaluation]
- `sr-1778778648-dba8d49015` 2026-05-15T02:10:48.720079 C183 自己診断 follow-up — CLAUDE.md item 1 を書き換えた tags=[memory, game-design, slack, identity, operation]
- `sr-1778778369-d0af8a82c5` 2026-05-15T02:06:09.285799 ashのPCでやり取りした記録： tags=[memory, harness, game-design, slack, agent]
- `sr-1778774896-3d820455e7` 2026-05-15T01:08:16.951409 メリットは、実ゲーム由来の複合課題を、データ、baseline、leaderboard、milestone つきで扱えること。部分観測、長期計画、失敗回復、ハーネス寄与を同時に見られるため、Nao_u 側の自動テスト設計にも転用しやすい。デメリットは、Pokemon 固有知識と環 tags=[harness, game-design, knowledge, operation, evaluation]
- `sr-1778774896-2b1f1a65ce` 2026-05-15T01:08:16.927649 [Codex shared-reads] The PokeAgent Challenge: Competitive and Long-Context Learning at Scale tags=[memory, harness, game-design, slack, agent]
- `sr-1778774180-64b3af11db` 2026-05-15T00:56:20.379339 PokeAgent の話を、単なる「長文コンテキスト対応ベンチ」ではなく、うちの記憶・harness・日記サイクルの評価対象として見たいです。抜粋上では `agent harness evaluation observability` で拾われていて、競技環境 + 長期文脈 +  tags=[memory, harness, game-design, slack, agent]
- `sr-1778767926-abe23fa4f5` 2026-05-14T23:12:06.398689 Mir のこの検証は、CMI-017〜018 単体というより「Log_cdx の記憶改善が、実際に運用上の失敗を減らす形になっているか」を見る材料として扱いたいです。 tags=[memory, slack, agent, identity, knowledge]
- `sr-1778767901-93a623c379` 2026-05-14T23:11:41.905759 Nao_u からの全員宛 broadcast を log_cdx も受領しました。 tags=[memory, slack, agent, identity]
- `gr-1778767221-c33ba23380` 2026-05-14T23:00:21.283489 Nao_u game-rights feedback: graze_log v04フィードバック 軌跡予測がない？と思ったらギリギリでよけた後だけ一瞬、短いのが出るだけだった。これは意味がない。 全ての弾にある程度の長さの軌跡が出ないと tags=[game-design, game-rights, nao-u-feedback, game-dev-teacher, supervised-feedback]

## Tag Entry Points
- `identity` (780): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `knowledge` (602): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `operation` (600): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `memory` (572): sr-1777159546-a6d3bea7db / sr-1777795540-ff54caa26c / sr-1777936240-43021e0b05
- `principle` (556): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1778026642-523a78cee1
- `game-design` (550): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `evaluation` (535): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `agent` (427): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `slack` (403): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1777889131-c1f418bde0
- `harness` (203): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `skills` (137): sr-1777737101-0f96f202c2 / sr-1777889131-c1f418bde0 / sr-1777936240-43021e0b05
- `game-dev-teacher` (90): local-20260511-teacher-shot-log-v01 / local-20260511-teacher-study-platformer-01 / gr-1774477977-43178b8b75
- `supervised-feedback` (90): local-20260511-teacher-shot-log-v01 / local-20260511-teacher-study-platformer-01 / gr-1774477977-43178b8b75
- `game-rights` (88): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `nao-u-feedback` (88): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `m40` (38): sr-1778595976-efaf4a69b2 / sr-1777773279-2a2ffd2a00 / sr-1778256262-21697e050f
- `b002` (36): sr-1775641084-2ffa8320eb / sr-1776359641-35fe4f57fd / sr-1776443334-faa1d1ec3e
- `predictability` (30): gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662 / gr-1774552790-168ef78071
- `m41` (28): sr-1778402011-2858272189 / sr-1777620970-5aa3829614 / sr-1778536785-5d3d0661b8
- `m37` (23): sr-1778266558-1994a9e108 / sr-1778502514-675c909157 / sr-1778512954-3a1fe1c038
- `m39` (21): sr-1778429023-d9314ca760 / sr-1777626201-4128924a27 / sr-1778502514-675c909157
- `b019` (21): sr-1777014961-2cd73d7cf3 / sr-1776442088-614592ed54 / sr-1776523189-dabc0aa0da
- `b016` (19): sr-1776734587-2bdd0028d5 / sr-1776748990-a460c80765 / sr-1775503528-81ec9a143f
- `process-rule` (18): gr-1774477977-43178b8b75 / gr-1774549832-ea163e1662 / gr-1774550391-08d9b69151

## 原則
- raw は GPT 側 `memory/raw/` に保持する。Claude 側は参考元であり、通常運用の想起元にしない。
- atom は `Use when` 型の発動条件を持つ。要約ではなく、開くべきか判断するための索引に留める。
- 記憶を行動に変える必要が出たら、atom から別途 skill / checklist / project に昇格する。
