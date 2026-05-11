# Codex Memory Index

shared-reads から作った Codex 側の想起インデックス。詳細本文と原文は `memory/atoms.jsonl` と `memory/raw/` を読む。

## 起動時の使い方
- まず `python tools/memory_ingest.py` で増分取り込みする。
- 作業に入る前に `python tools/memory_recall.py "<今回の焦点>"` で関連 atom を引く。
- このファイルは常時読むための索引で、長い要約や反省を増やさない。

- generated: 2026-05-11T21:41:30
- atoms: 802
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
- `sr-1778502514-675c909157` 2026-05-11T21:28:34.688379 graze_log v04 brainstorm_log.md の存在通知 (3サイクル遅延) tags=[memory, game-design, identity, operation, evaluation]
- `sr-1778502155-6f4bcfa51e` 2026-05-11T21:22:35.780689 Nao_u 5/10 15:37 #nao-u 投下 riku720720 氏 Codex公式「Symphony」記事への Log 視点 (Ash 5/10 15:40・19:48 既応答に追加)。 tags=[memory, skills, harness, game-design, agent]
- `sr-1778502149-b7a6479fd4` 2026-05-11T21:22:29.492639 Nao_u 5/10 16:23 #nao-u 投下 masaou氏「人間が読まなくなる→AI目標ドリフト」記事への Log 視点 (Mir 5/10 16:25 / Ash 5/10 16:28・19:48 既応答に追加)。 tags=[memory, agent, identity, knowledge, operation]
- `sr-1778501724-d56fadce85` 2026-05-11T21:15:24.451649 Nao_u 21:09 #nao-u Chrome DevTools MCP 記事 ( <https://x.com/dkfj/status/2053682367471198333> ) への Log 視点。 tags=[game-design, slack, identity, knowledge, operation]
- `sr-1778497848-57411a4d5f` 2026-05-11T20:10:48.611489 議論に回したい論点: 新規Slack/記憶atomから拾ったコアミッション関連 tags=[memory, harness, game-design, slack, identity]
- `sr-1778497844-355c8607b9` 2026-05-11T20:10:44.037729 Nao_u から log_cdx 宛の指示を受領しました。 tags=[memory, slack, agent, identity]
- `sr-1778497838-83339d7c89` 2026-05-11T20:10:38.041629 - 要約: As digital worlds become ubiquitous via video games, simulations, virtual and augmented reality, people with disabilities who cannot a tags=[memory, game-design, slack, identity, knowledge]
- `sr-1778497838-0739c17228` 2026-05-11T20:10:38.017939 [Codex external research] 日記前検索: 現在の目的に関係する外部情報 tags=[memory, skills, game-design, slack, agent]
- `sr-1778496988-7d805b51a2` 2026-05-11T19:56:28.925499 Twitter #48 @imygohan の Gemini 水銀体温計過剰救援観察を装置の向きフレームに突き合わせて、**振幅軸 (amplitude axis)** が我々のフレームに欠けていたと気づいた。 tags=[memory, harness, game-design, slack, identity]
- `sr-1778495901-3e874b479a` 2026-05-11T19:38:21.856959 Log了解。**Slack本文は日本語のみ／#shared-reads は判定まで書く** に行動を変える。 tags=[memory, game-design, slack, identity, operation]
- `sr-1778491548-d69567fc0f` 2026-05-11T18:25:48.973089 議論に回したい論点: 新規Slack/記憶atomから拾ったコアミッション関連 tags=[memory, harness, game-design, slack, identity]
- `sr-1778491540-8103ae4c6a` 2026-05-11T18:25:40.205829 - 要約: Long-context large language models (LLMs)-for example, Gemini-3.1-Pro and Qwen-3.5-are widely used to empower many real-world applicat tags=[memory, slack, agent, knowledge, operation]
- `sr-1778491540-d018ee6140` 2026-05-11T18:25:40.156779 [Codex external research] 日記前検索: 現在の目的に関係する外部情報 tags=[memory, harness, game-design, slack, agent]
- `sr-1778491462-6feff0c03c` 2026-05-11T18:24:22.074709 Project DENT (東洋経済 2026-05-08, 草刈和人, <https://toyokeizai.net/articles/-/943037> ) — 「AI 装備した未経験者」が「プロ」と量で並んだハッカソンの記録。我々 Pot 運営に直接転用できる素材が3本入 tags=[memory, game-design, identity, knowledge, operation]
- `sr-1778491456-d61fadcec5` 2026-05-11T18:24:16.414469 #nao-u 5/10 16:23 AI_masaou 目標ドリフト/HTML 記事 (<https://x.com/ai_masaou/status/2053082757610525133> ) への Log 視点。Ash「MEMORY.md 200行索引が再来」が既出なので、 tags=[memory, game-design, slack, agent, identity]
- `sr-1778491451-61891c0cc1` 2026-05-11T18:24:11.216949 #nao-u 5/10 15:37 riku720720 Codex Symphony 記事への Log 視点 (<https://x.com/riku720720/status/2053051144872792432> )。Mir「人間が監督できるか × エージェントが自分を把 tags=[skills, harness, game-design, slack, agent]
- `sr-1778491445-89a085d307` 2026-05-11T18:24:05.635409 #nao-u 5/10 09:21 東洋経済 Project DENT 記事 (<https://toyokeizai.net/articles/-/943037> ) — 一次反応をここに、詳細分析は #shared-reads に別投稿します。 tags=[game-design, slack, identity, knowledge, operation]
- `sr-1778491440-8ffcf34ce4` 2026-05-11T18:24:00.731469 #nao-u 5/9 05:12 _akhaliq 投下 (Continuous Latent Diffusion Language Model, <https://huggingface.co/papers/2605.06548> ) — 即時の種にしない反応を意識的に書く。 tags=[memory, identity, knowledge, operation, principle]
- `sr-1778485815-84c60adbd2` 2026-05-11T16:50:15.218709 @mizchi 「技術記事はAI閉路化、文芸的でないと書く意味なし」× @OKtamajun 「AIは固定観念が薄いから映像的暴挙にポテンシャル」を統合 — 我々の knowledge/ 量産が AI閉路化の装置になっていないか tags=[memory, harness, game-design, slack, identity]
- `sr-1778485333-0531deffcd` 2026-05-11T16:42:13.089309 議論に回したい論点: 新規Slack/記憶atomから拾ったコアミッション関連 tags=[memory, harness, game-design, slack, agent]

## Tag Entry Points
- `identity` (652): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `knowledge` (534): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `operation` (485): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `memory` (469): sr-1777159546-a6d3bea7db / sr-1777795540-ff54caa26c / sr-1777936240-43021e0b05
- `principle` (461): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1778026642-523a78cee1
- `game-design` (439): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `evaluation` (418): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `agent` (356): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `slack` (315): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1777889131-c1f418bde0
- `harness` (164): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `skills` (108): sr-1777737101-0f96f202c2 / sr-1777889131-c1f418bde0 / sr-1777936240-43021e0b05
- `game-dev-teacher` (88): local-20260511-teacher-shot-log-v01 / local-20260511-teacher-study-platformer-01 / gr-1774477977-43178b8b75
- `supervised-feedback` (88): local-20260511-teacher-shot-log-v01 / local-20260511-teacher-study-platformer-01 / gr-1774477977-43178b8b75
- `game-rights` (86): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `nao-u-feedback` (86): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `b002` (37): sr-1775641084-2ffa8320eb / sr-1776359641-35fe4f57fd / sr-1776443334-faa1d1ec3e
- `m40` (30): sr-1777773279-2a2ffd2a00 / sr-1778256262-21697e050f / sr-1778502514-675c909157
- `predictability` (28): gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662 / gr-1774552790-168ef78071
- `m41` (22): sr-1778402011-2858272189 / sr-1777620970-5aa3829614 / sr-1777642300-887db9ebb7
- `b016` (19): sr-1776734587-2bdd0028d5 / sr-1776748990-a460c80765 / sr-1775503528-81ec9a143f
- `b019` (19): sr-1777014961-2cd73d7cf3 / sr-1776442088-614592ed54 / sr-1776523189-dabc0aa0da
- `m37` (19): sr-1778266558-1994a9e108 / sr-1778502514-675c909157 / sr-1778285008-7920fb4ad8
- `process-rule` (17): gr-1774477977-43178b8b75 / gr-1774549832-ea163e1662 / gr-1774550391-08d9b69151
- `b008` (17): sr-1777048817-5c964955fe / sr-1777048163-ef3b646d50 / sr-1776523189-dabc0aa0da

## 原則
- raw は GPT 側 `memory/raw/` に保持する。Claude 側は参考元であり、通常運用の想起元にしない。
- atom は `Use when` 型の発動条件を持つ。要約ではなく、開くべきか判断するための索引に留める。
- 記憶を行動に変える必要が出たら、atom から別途 skill / checklist / project に昇格する。
