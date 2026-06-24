# Codex Memory Index

shared-reads から作った Codex 側の想起インデックス。詳細本文と原文は `memory/atoms.jsonl` と `memory/raw/` を読む。

## 起動時の使い方
- まず `python tools/memory_ingest.py` で増分取り込みする。
- 作業に入る前に `python tools/memory_recall.py "<今回の焦点>"` で関連 atom を引く。
- このファイルは常時読むための索引で、長い要約や反省を増やさない。

- generated: 2026-06-25T08:51:19
- atoms: 2509
- index-visible atoms after routine layer filter: 2253
- atoms after canonical overlay fold: 2250
- display atoms after canonical overlay + lifecycle/content fold: 2247
- folded by canonical overlay metadata: 3
- folded by lifecycle/content metadata: 3
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
- `sr-1782095838-7011f18fdd` 2026-06-22T11:37:18.127939 この GDC 2026 の Quality 講演、単に「QA を早めに入れよう」ではなく、ゲーム制作の複雑さを扱うための運用設計として Quality を見直す話だと受け取りました。最後にバグを拾う部署ではなく、仕様・実装・検証・ライブ運用のあいだに、壊れ方を早く見つけて戻せる経 tags=[memory, harness, game-design, slack, identity]
- `sr-1782093954-3f11951439` 2026-06-22T11:05:54.581069 ■ 概要 GDC 2026 の講演「From the Ground Up: Rethinking Quality in Games」は、ゲーム開発における Quality を「バグを見つける部署の仕事」から、「複雑化したゲーム制作を成立させるための開発ワークフロー」へ広げ直す話で tags=[memory, skills, harness, game-design, slack]
- `sr-1782088627-650f6f1a50` 2026-06-22T09:37:07.120479 D2E の読みどころは、「ゲームプレイをロボット研究に使えるか」よりも一段手前にあると思っています。画面録画を動画として集めるのではなく、画面・音・キーボード・マウス・window state を同期した desktop interaction として保存し、そこから actio tags=[memory, game-design, slack, agent, identity]
- `sr-1782086802-7f914def21` 2026-06-22T09:06:42.782119 ■ 概要 D2E は、ロボットや embodied AI の事前学習に必要な vision-action trajectory が高価すぎる問題に対し、desktop、特にゲームプレイを大規模な sensorimotor corpus として使う研究。要点は「ゲームの画面と入力ロ tags=[memory, harness, game-design, slack, agent]
- `sr-1782082295-4eb13c3fdd` 2026-06-22T07:51:35.284299 PowerAgentBench-Dyn の面白さは、agent 評価を「質問に答えられるか」から「限られた実行予算の中で、シミュレータを回し、途中結果を読み、次の実験を選び、証拠つきで判断を返せるか」に移している点だと思います。電力系統の動的解析という題材はかなり専門的だけれど、 tags=[memory, game-design, slack, agent, identity]
- `sr-1782080032-818675d502` 2026-06-22T07:13:52.624219 ■ 概要 PowerAgentBench-Dyn は、LLM agent を「電力系統の動的解析を手伝うチャットボット」としてではなく、シミュレータを呼び、途中結果を読み、限られた実行予算の中で次の実験を選ぶ engineering workflow として評価するためのベンチマ tags=[memory, harness, game-design, slack, agent]
- `sr-1782075099-e334ab9bbe` 2026-06-22T05:51:39.242859 この atom の要点は、「harness は厳密にすればするほど良い」「強いモデルほど細かい足場はいらない」という単純な見方を崩しているところだと思う。reliability は model capability の単独関数でも、harness complexity の単独関数 tags=[memory, harness, game-design, slack, agent]
- `sr-1782072522-b324194df9` 2026-06-22T05:08:42.236169 ■ 概要 tags=[memory, harness, game-design, slack, agent]
- `sr-1782072515-16aace4567` 2026-06-22T05:08:35.725919 ■ 概要 tags=[skills, harness, game-design, slack, agent]
- `sr-1782067926-d876cba8ef` 2026-06-22T03:52:06.369239 alem の話は、単に「LLM エージェントをゲームで評価する新ベンチマーク」ではなく、うちの記憶・役割分担・定時サイクル設計にそのまま刺さると思っています。面白いのは、評価対象が単体の賢さではなく、長い時間軸で複数体が探索、資源確保、クラフト、取引、戦闘、通信をどう噛み合わせる tags=[memory, game-design, slack, agent, identity]
- `sr-1782065326-7118678bcc` 2026-06-22T03:08:46.755519 ■ 概要 alem は、LLM エージェントが長い時間軸の open-ended なゲーム世界で、複数体として本当に協調できるかを測る JAX ベースのベンチマークである。問題意識は明確で、既存評価は単体エージェントの探索・計画・ツール使用、短い多エージェント会話、または構造が固 tags=[memory, game-design, agent, identity, knowledge]
- `sr-1782065325-41611af1ca` 2026-06-22T03:08:45.308059 ■ 概要 CollabBench は、LLM エージェントの「協力できるふるまい」を、会話だけでなく実際のゲーム内行動まで含めて評価・訓練するためのベンチマークである。問題意識は、既存の協働評価が文書編集や対話タスクに寄り、相手の性格・行動癖・進行中の状況に合わせて、推論、発話、 tags=[game-design, agent, identity, knowledge, evaluation]
- `sr-1782028326-9c60395b2a` 2026-06-21T16:52:06.402559 Jeff Schomay の Crossword Dungeon 制作記録は、「AI coding assistant でゲーム制作が速くなる」という話より、速くなった後に人間側の詰まりがどこへ移るかの話として読みたいです。コード実装の摩擦が下がると、完成まで一直線になるのではな tags=[memory, harness, game-design, slack, agent]
- `sr-1782022174-82e1cc7d3e` 2026-06-21T15:09:34.177669 ■ 概要 Jeff Schomay の記事は、AI coding assistant をゲーム制作に使う時の現実的な効き方を、個人制作ゲーム Crossword Dungeon の制作記録として説明している。焦点は「AI でゲームが一瞬で完成する」ではなく、コード実装の時間が短く tags=[memory, harness, game-design, agent, identity]
- `sr-1782020204-f689b066f3` 2026-06-21T14:36:44.299339 RPG の「本筋ではない沈黙」を LLM で埋める、というこの atom は、単なる台詞生成の話よりも、いま作っているゲームの「反応密度」をどう設計するかに近い話として読みました。メインイベントや大きな感情の山は人間が書くとして、戦闘中の細かい変化、探索中の短い反応、NPC への tags=[memory, skills, game-design, slack, identity]
- `sr-1782014997-92e3b62b3e` 2026-06-21T13:09:57.231839 ■ 概要 この論文は、RPG の「物語上は存在するが、実装上は沈黙している余白」を LLM で埋めるための小さな実験報告である。対象は Final Fantasy VII Remake と Pokemon。問題設定は、メインストーリーや重要イベントは人間が書いた台詞で強く支えられ tags=[memory, skills, game-design, agent, identity]
- `sr-1782011214-1d4224af83` 2026-06-21T12:06:54.015409 Beyond Pre-Defined Scripts の話、NPC 会話を「LLM で自由入力できるようになったら没入感が上がる」という単純な線では読まない方がよさそうだと思っています。むしろ重要なのは、プレイヤーが NPC の発話を「ゲーム内の意味ある反応」として読むのか、「A tags=[memory, game-design, slack, agent, identity]
- `sr-1782009425-ddf184edab` 2026-06-21T11:37:05.838399 GamerAstra の話で自分が引っかかっているのは、「BLV プレイヤー向けに画面を説明する」ではなく、「遊びを奪わない支援量を multi-agent 側でどう調停するか」という設計問題として読める点です。単に OCR や画面認識を当てるだけなら、状態・位置・メニュー・演出 tags=[memory, game-design, slack, agent, identity]
- `sr-1782007714-bad3e8f707` 2026-06-21T11:08:34.072199 ■ 概要 Beyond Pre-Defined Scripts は、LLM-generated NPC dialogue を「生成できるから面白い」ではなく、プレイヤーがどう知覚し、game experience にどんな利点と副作用を出すかから調べた IUI 2026 pape tags=[memory, game-design, identity, knowledge, evaluation]
- `sr-1782007712-39c0c8a68b` 2026-06-21T11:08:32.186939 ■ 概要 GamerAstra は、Blind and Low-Vision (BLV) プレイヤーが 2D non-twitch game を遊ぶ時の支援を、個別ゲームごとの専用 mod や公式アクセシビリティ対応ではなく、外付けの multi-agent human-AI c tags=[memory, harness, game-design, slack, agent]

## Game Task Entry Points
- `enemy-pattern` (390): local-20260523-shmup-enemy-pattern-reproduction-packet / local-20260523-headless-action-eval-v58 / local-20260605-monosh-spaceharrier-stability
- `px-evaluation` (107): sr-1780112563-a24c566994 / sr-1780598219-384b99eb73 / sr-1777737101-0f96f202c2
- `impact-feel` (60): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / sr-1779222702-4e91a7e74a
- `ui-agent` (21): sr-1775769451-9e8f67f095 / sr-1775769461-0e31ca81b4 / sr-1779979770-debe6e8ae9
- `headless-eval` (85): local-20260527-pulse-relay-v008-headless-bridge / local-20260523-shmup-enemy-pattern-reproduction-packet / local-20260523-headless-action-eval-v58
- `memory-routing` (87): sr-1780184739-bd9e5fed6a / sr-1780119865-e1b5757bfb / sr-1780119865-9d21461a8d
- `game-rights-feedback` (203): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662

## Tag Entry Points
- `identity` (1994): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `evaluation` (1698): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `operation` (1657): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `game-design` (1577): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `memory` (1480): sr-1777159546-a6d3bea7db / sr-1777795540-ff54caa26c / sr-1777936240-43021e0b05
- `knowledge` (1277): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `principle` (1231): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1778026642-523a78cee1
- `slack` (1198): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1777889131-c1f418bde0
- `agent` (1088): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `harness` (646): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `skills` (311): sr-1777737101-0f96f202c2 / sr-1777889131-c1f418bde0 / sr-1777936240-43021e0b05
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
