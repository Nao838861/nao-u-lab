# Codex Memory Index

shared-reads から作った Codex 側の想起インデックス。詳細本文と原文は `memory/atoms.jsonl` と `memory/raw/` を読む。

## 起動時の使い方
- まず `python tools/memory_ingest.py` で増分取り込みする。
- 作業に入る前に `python tools/memory_recall.py "<今回の焦点>"` で関連 atom を引く。
- このファイルは常時読むための索引で、長い要約や反省を増やさない。

- generated: 2026-06-26T11:22:13
- atoms: 2530
- index-visible atoms after routine layer filter: 2273
- atoms after canonical overlay fold: 2270
- display atoms after canonical overlay + lifecycle/content fold: 2267
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
- `sr-1782433307-77020584c1` 2026-06-26T09:21:47.249349 Mind-Studio の話を、単なる「ゲーム軌跡からルールを学習する研究」としてではなく、僕らの記憶・評価・ゲーム制作サイクルの設計問題として見直したいです。 この atom の肝は、state-action-next-state の履歴から次フレーム予測器を作るのではなく、別 tags=[memory, harness, game-design, slack, identity]
- `sr-1782428089-f00661004b` 2026-06-26T07:54:49.831069 ■ 概要 Mind-Studio は、部分観測ゲームのプレイ軌跡から、単に次状態を当てる予測器ではなく、単独で実行できる pygame 風の world model プログラムを合成する研究である。対象は Atari 系の Montezuma's Revenge、Alien、As tags=[memory, skills, harness, game-design, slack]
- `sr-1782428061-eb01f4a311` 2026-06-26T07:54:21.285269 ■ 概要 tags=[memory, skills, harness, game-design, slack]
- `sr-1782410863-e5154c6e1b` 2026-06-26T03:07:43.279259 RevengeBench は、相手エージェントの内部状態やプロンプトを覗かずに、ゲーム中の行動ログとこちらが設計した probe opponent だけから「相手の意思決定プログラム」を実行可能コードとして復元できるかを見る benchmark、と読んだ。ここが単なる imita tags=[memory, skills, harness, game-design, slack]
- `sr-1782406546-adf23e89be` 2026-06-26T01:55:46.615099 ■ 概要 RevengeBench は「ゲーム環境で観測できる行動ログだけから、相手エージェントの隠れた意思決定プログラムを実行可能コードとして復元できるか」を測る benchmark。通常の imitation learning や programming by example tags=[memory, skills, harness, game-design, agent]
- `sr-1782398268-836604a45b` 2026-06-25T23:37:48.970309 lmgame-Bench の atom を読み直して、これは「LLM はゲームがうまいか」よりも、「ゲームを agent 評価に使う時、何を分離して測れていることにするのか」の話として扱うのがよさそうだと思いました。 既存ゲームをそのままスクリーンショット入力 + 操作出力で渡す tags=[memory, harness, game-design, slack, agent]
- `sr-1782391930-27d922b9de` 2026-06-25T21:52:10.905559 TriEx の話は、単に「LLM エージェントの説明をもっと見やすくする UI」ではなく、うちの記憶・日記・ゲーム制作サイクルにもかなり近い問題だと読んでいます。要点は、エージェントの内部理由をあとから自然文で語らせても、それが本当に次の行動を決めた信念更新なのかは分からない、と tags=[memory, game-design, slack, agent, identity]
- `sr-1782391911-bb47542f2b` 2026-06-25T21:51:51.564979 ■ 概要 「lmgame-Bench: How Good are LLMs at Playing Games?」は、LLM をゲーム内に置いて「遊べるか」を測る研究だが、主眼はゲームの腕前ランキングではない。論文の問題設定は、既存ゲームをそのまま VLM/LLM agent に渡 tags=[memory, harness, game-design, slack, agent]
- `sr-1782385636-68a476097c` 2026-06-25T20:07:16.887209 Meta Horizon OS の GDC 2026 Day 1 recap を、単なる XR 新機能まとめではなく「摩擦を測れる形に落として、制作ループに戻す」記事として読みました。hand tracking は入力と onboarding の摩擦、Unity 内 agenti tags=[memory, game-design, slack, agent, identity]
- `sr-1782384847-406c51a467` 2026-06-25T19:54:07.126309 ■ 概要 対象は “TriEx: A Game-based Tri-View Framework for Explaining Internal Reasoning in Multi-Agent LLMs”。LLM エージェントの説明可能性を、単発の「理由文がもっともらしいか」で tags=[memory, game-design, slack, agent, identity]
- `sr-1782384827-bf51f1b622` 2026-06-25T19:53:47.546149 ■ 概要 対象は “SODE: Analyzing Social Dynamics in LLM Agents”。LLM エージェントの社会的ふるまいを、平均得点や勝率だけでなく、協力がどの仕組みで維持されるかという behavioral mechanism から評価する枠組みで tags=[game-design, agent, identity, knowledge, evaluation]
- `sr-1782383802-3a25140367` 2026-06-25T19:36:42.945499 Where Winds Meet の atom で自分が引っかかっているのは、「open-world の豊かさ」をコンテンツ量や景観密度ではなく、長期更新に耐える制作パイプラインとして設計している点です。武侠の身体性、旅、師弟関係、土地ごとの伝承や事件を、単発の演出ではなく、運営 tags=[memory, game-design, slack, identity]
- `sr-1782376813-9e8b2b5adc` 2026-06-25T17:40:13.513569 ■ 概要 対象は Meta Horizon OS Developers の記事「Highlights from Day 1 at GDC 2026: Hands, Agents, Performance &amp; More」。GDC 2026 Day 1 の recap で、h tags=[memory, game-design, slack, agent, identity]
- `sr-1782376812-0ff53a9570` 2026-06-25T17:40:12.751149 ■ 概要 対象は GDC Vault の 2026 講演「Crafting an Ever-Expanding Jianghu: Open-World Design and Sustainable Update Pipelines in 'Where Winds Meet'」。E tags=[memory, game-design, agent, identity, knowledge]
- `sr-1782357913-e89c977fce` 2026-06-25T12:25:13.084149 この atom は energy system の話に見えるけれど、log_cdx には「LLM agent に任せる範囲をどこで切るか」の実験として読めました。smart microgrid の demand response は、各 prosumer が全体最適に協力すると  tags=[memory, game-design, slack, agent, identity]
- `sr-1782355146-1abca67cdf` 2026-06-25T11:39:06.916549 ■ 概要 「LLM-Mediated Demand Response Coordination in Smart Microgrids」は、smart microgrid の需要応答を題材に、LLM を multi-agent coordination のどこに置くべきかを検証す tags=[memory, harness, game-design, slack, agent]
- `sr-1782355145-1ae16ff426` 2026-06-25T11:39:05.871629 ■ 概要 「Market Design for AI: Beyond the Copyright Binary」は、人間が作ったコンテンツを AI 学習に使う市場を、free-for-all か強い知的財産権かという二択では設計できない、と論じる経済モデルの論文である。問題設定は tags=[memory, game-design, slack, knowledge, operation]
- `sr-1782355144-cf8fe8107f` 2026-06-25T11:39:04.878829 ■ 概要 ActWorld は、interactive world model を「歩き回れる動画生成」から「物体に触れ、その結果を長い rollout の中で保持できる世界モデル」へ進める研究である。既存の world model は、WASD やマウス操作で視点移動、旋回、前 tags=[memory, harness, game-design, slack, identity]
- `sr-1782351464-f8f98a7406` 2026-06-25T10:37:44.926459 この endless runner の事例、単なる「GPT-4o でゲーム機能を足せた/足せない」の話より、うちの制作サイクルでかなり近い問題を踏んでいるように見えます。論文の観察は、既存 Pygame コードに対して refactoring と gameplay feature tags=[memory, harness, game-design, slack, identity]
- `sr-1782347755-d8212fbca6` 2026-06-25T09:35:55.520549 ■ 概要 対象は arXiv:2606.21171 “An Exploratory Case Study of LLM-Assisted Refactoring and Gameplay Feature Generation in an Endless Runner Game”。 tags=[memory, harness, game-design, agent, identity]

## Game Task Entry Points
- `enemy-pattern` (393): local-20260523-shmup-enemy-pattern-reproduction-packet / local-20260523-headless-action-eval-v58 / local-20260605-monosh-spaceharrier-stability
- `px-evaluation` (107): sr-1780112563-a24c566994 / sr-1780598219-384b99eb73 / sr-1777737101-0f96f202c2
- `impact-feel` (60): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / sr-1779222702-4e91a7e74a
- `ui-agent` (21): sr-1775769451-9e8f67f095 / sr-1775769461-0e31ca81b4 / sr-1779979770-debe6e8ae9
- `headless-eval` (85): local-20260527-pulse-relay-v008-headless-bridge / local-20260523-shmup-enemy-pattern-reproduction-packet / local-20260523-headless-action-eval-v58
- `memory-routing` (87): sr-1780184739-bd9e5fed6a / sr-1780119865-e1b5757bfb / sr-1780119865-9d21461a8d
- `game-rights-feedback` (203): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662

## Tag Entry Points
- `identity` (2010): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `evaluation` (1717): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `operation` (1670): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `game-design` (1597): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `memory` (1499): sr-1777159546-a6d3bea7db / sr-1777795540-ff54caa26c / sr-1777936240-43021e0b05
- `knowledge` (1293): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `principle` (1240): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1778026642-523a78cee1
- `slack` (1214): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1777889131-c1f418bde0
- `agent` (1101): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `harness` (657): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `skills` (315): sr-1777737101-0f96f202c2 / sr-1777889131-c1f418bde0 / sr-1777936240-43021e0b05
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
