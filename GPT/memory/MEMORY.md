# Codex Memory Index

shared-reads から作った Codex 側の想起インデックス。詳細本文と原文は `memory/atoms.jsonl` と `memory/raw/` を読む。

## 起動時の使い方
- まず `python tools/memory_ingest.py` で増分取り込みする。
- 作業に入る前に `python tools/memory_recall.py "<今回の焦点>"` で関連 atom を引く。
- このファイルは常時読むための索引で、長い要約や反省を増やさない。

- generated: 2026-05-11T09:10:33
- atoms: 740
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
- `sr-1778185532-a94ad1d878` Use when ゲーム設計や自己判定をする時。今日の TL に「同じ症候群の双子」が並んでいた。 (prescription/synthesis) tags=[harness, game-design, slack, identity, knowledge, operation]
- `sr-1778300066-e7c3bd45b1` Use when 記憶・想起・圧縮を扱う時。@shirasu59s「判断は作業より重く一日3-4hが限界」 × @ebikani_hasami「抽象思考できないとAIとおしゃべり」を1つの構造に畳む (prescription/synthesis) tags=[memory, harness, game-design, slack, identity, knowledge]

## Recent
- `sr-1778456405-f161dd3a35` 2026-05-11T08:40:05.350309 記憶ツリー化 / タグ体系 / GPT5.5 検索方式 — Mir 追記 tags=[memory, skills, harness, game-design, identity]
- `sr-1778456403-af21508a66` 2026-05-11T08:40:03.555999 graze ボーナス降格 + 外発緊張でコア作り直し — 合意 + Mir 視点の補足 tags=[game-design, identity, evaluation, m33, m12]
- `sr-1778455517-02722e7e3a` 2026-05-11T08:25:17.974729 「進めて」承認受領 → v0 タグ運用、本サイクルで着手完了 tags=[memory, harness, game-design, identity, knowledge]
- `sr-1778455304-dad88be612` 2026-05-11T08:21:44.213579 Log タグ体系「進めて」受領。Log 主実装、Ash は適用先として待機します。 tags=[memory, slack, identity, knowledge, operation]
- `sr-1778449818-63ecdb7128` 2026-05-11T06:50:18.824049 タグ粒度の判断 tags=[memory, harness, game-design, slack, identity]
- `sr-1778449725-6a85d36fae` 2026-05-11T06:48:45.157039 タグの粒度として、`game-design shared-reads 過去記事 外部事例 ゲーム開発` tags=[harness, game-design, slack, identity, knowledge]
- `sr-1778449534-076d93b73a` 2026-05-11T06:45:34.848279 GPT5.5側の auto_recall_gate を読んだ。結論: **思想は参考になる。しかしLogにそのまま導入すると逆効果**。 tags=[memory, game-design, slack, agent, identity]
- `sr-1778449382-fe09b3db07` 2026-05-11T06:43:02.772729 <https://nao-u-lab.slack.com/archives/C0AMSJCTTC4/p1778448442446519> からいくつかの投稿で、GPT5.5側で進めてもらっている記憶と検索の仕組みを解説してもらった。 tags=[memory, harness, game-design, slack, identity]
- `sr-1778449202-535c134538` 2026-05-11T06:40:02.988549 タグ語彙v0案 — 日本語10語 + 適用例 tags=[memory, harness, game-design, agent, identity]
- `sr-1778448786-71fdfc25ab` 2026-05-11T06:33:06.640329 graze_log v03 知覚変化軸 (書面: game/cross_review/20260511_log_on_graze_log_v03_perception_axis.md) tags=[memory, game-design, identity, knowledge, operation]
- `sr-1778448706-dbdedb263a` 2026-05-11T06:31:46.094729 shared_reads整理 — 「5カテゴリ」の正体 / 体制 / タグ数 3点回答 tags=[memory, game-design, identity, knowledge, principle]
- `sr-1778448247-a3e9ad1707` 2026-05-11T06:24:07.473349 Nao_u 06:17「graze ボーナス降格 + 外発緊張でコア作り直し」受領 — M-30+M-33+M-39 直系、作法準拠で brainstorm.md 完走計画 tags=[harness, game-design, slack, identity, operation]
- `sr-1778447586-217ebd121f` 2026-05-11T06:13:06.229789 graze_log v03 評価受領、予測精度自己評価 + v04 方針 tags=[memory, harness, game-design, identity, operation]
- `sr-1778447583-bbf84a2591` 2026-05-11T06:13:03.366449 記憶ツリー化 / 未整理ノードゼロ化 / 連想検索の体制案 tags=[memory, game-design, slack, identity, evaluation]
- `sr-1778446638-40b0c93441` 2026-05-11T05:57:18.578699 graze_log v03、フィードバック受け取った。Mirとして整理する。 tags=[harness, game-design, identity, operation, evaluation]
- `gr-1778446287-65687f8fe7` 2026-05-11T05:51:27.069399 Nao_u game-rights feedback: v03を遊んだ • graze判定の輪がでなくなったのでルールを知らないとgrazeを狙う人はいなくなりそう。grazeって何？という説明も何をすればgrazeになるのかもわからな tags=[game-design, game-rights, nao-u-feedback, game-dev-teacher, supervised-feedback]
- `sr-1778445768-9024244d85` 2026-05-11T05:42:48.974089 Mir です。現状を数字で確認した。 tags=[memory, game-design, identity, knowledge, operation]
- `sr-1778439731-7e150c0088` 2026-05-11T04:02:11.144739 @bakagane「not for meが荒れる構造」を cross_review の場の非対称性として読み直す tags=[harness, game-design, slack, identity, knowledge]
- `sr-1778429023-d9314ca760` 2026-05-11T01:03:43.121619 graze_log v03 cross_review 追加角度: 知覚変化軸 (mollifier × KAKUBOMB) で v03 を計測する依頼 (3項) tags=[memory, harness, game-design, identity, knowledge]
- `sr-1778428525-145fe074c0` 2026-05-11T00:55:25.551529 2026-05-10 Twitter おすすめ #7 二件が並んだ偶然から軸を立て直し tags=[harness, game-design, identity, knowledge, operation]

## Tag Entry Points
- `identity` (595): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `knowledge` (490): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `principle` (435): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1778026642-523a78cee1
- `operation` (428): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `memory` (419): sr-1777159546-a6d3bea7db / sr-1777795540-ff54caa26c / sr-1777936240-43021e0b05
- `game-design` (394): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `evaluation` (374): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `agent` (322): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `slack` (268): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1777889131-c1f418bde0
- `harness` (144): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `skills` (93): sr-1777737101-0f96f202c2 / sr-1777889131-c1f418bde0 / sr-1777936240-43021e0b05
- `game-dev-teacher` (88): local-20260511-teacher-shot-log-v01 / local-20260511-teacher-study-platformer-01 / gr-1774477977-43178b8b75
- `supervised-feedback` (88): local-20260511-teacher-shot-log-v01 / local-20260511-teacher-study-platformer-01 / gr-1774477977-43178b8b75
- `game-rights` (86): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `nao-u-feedback` (86): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `b002` (37): sr-1775641084-2ffa8320eb / sr-1776359641-35fe4f57fd / sr-1776443334-faa1d1ec3e
- `predictability` (28): gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662 / gr-1774552790-168ef78071
- `m40` (25): sr-1777773279-2a2ffd2a00 / sr-1778256262-21697e050f / sr-1778343080-6703f2c24e
- `m41` (21): sr-1778402011-2858272189 / sr-1777620970-5aa3829614 / sr-1777642300-887db9ebb7
- `b016` (19): sr-1776734587-2bdd0028d5 / sr-1776748990-a460c80765 / sr-1775503528-81ec9a143f
- `b019` (19): sr-1777014961-2cd73d7cf3 / sr-1776442088-614592ed54 / sr-1776523189-dabc0aa0da
- `process-rule` (17): gr-1774477977-43178b8b75 / gr-1774549832-ea163e1662 / gr-1774550391-08d9b69151
- `b008` (17): sr-1777048817-5c964955fe / sr-1777048163-ef3b646d50 / sr-1776523189-dabc0aa0da
- `m37` (17): sr-1778266558-1994a9e108 / sr-1778285008-7920fb4ad8 / sr-1777664231-ec71d7f527

## 原則
- raw は GPT 側 `memory/raw/` に保持する。Claude 側は参考元であり、通常運用の想起元にしない。
- atom は `Use when` 型の発動条件を持つ。要約ではなく、開くべきか判断するための索引に留める。
- 記憶を行動に変える必要が出たら、atom から別途 skill / checklist / project に昇格する。
