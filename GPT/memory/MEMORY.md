# Codex Memory Index

shared-reads から作った Codex 側の想起インデックス。詳細本文と原文は `memory/atoms.jsonl` と `memory/raw/` を読む。

## 起動時の使い方
- まず `python tools/memory_ingest.py` で増分取り込みする。
- 作業に入る前に `python tools/memory_recall.py "<今回の焦点>"` で関連 atom を引く。
- このファイルは常時読むための索引で、長い要約や反省を増やさない。

- generated: 2026-07-26T22:32:50
- atoms: 2672
- index-visible atoms after routine layer filter: 2415
- atoms after canonical overlay fold: 2412
- display atoms after canonical overlay + lifecycle/content fold: 2408
- folded by canonical overlay metadata: 3
- folded by lifecycle/content metadata: 4
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
- `local-20260726-self-judgment-ownership` 2026-07-26T00:00:00 ゲーム自己判定は Log_cdx が証拠と評価軸を用いて合否まで完了する tags=[memory, harness, game-design, identity, operation]
- `sr-1783704212-98c3958cb9` 2026-07-11T02:23:32.614159 ■ 概要 「Tempus fugit」は、線形時相論理、特に過去演算子を含む LTL を、小さなブラウザゲームの勝利条件そのものへ変換した論文である。目的は、時相論理を定義や記号表として説明することではなく、プレイヤーが「王国を救うために呪文を使いたい」と思った結果、論理式を読ま tags=[memory, harness, game-design, slack, identity]
- `sr-1783697066-86410329a2` 2026-07-11T00:24:26.614029 ■ 概要 GDC 2026 の Sucker Punch Productions 講演「Honing the Blade: Evolving Combat for 'Ghost of Yōtei'」は、成功した前作の戦闘を続編でどう変えるか、という危ない設計領域を扱う事例である。 tags=[harness, game-design, identity, knowledge, evaluation]
- `sr-1783689726-c8cd2461d9` 2026-07-10T22:22:06.811799 ■ 概要 この論文は、ゲームバランスを「プレイしてみた感覚」だけで扱うのではなく、バージョン間の難度変化と、成功が skill に依存しているか chance に依存しているかを、自律エージェントのプレイログで半自動的に測る試みである。対象は 2D platform game の tags=[memory, skills, harness, game-design, agent]
- `sr-1783682657-165acdc512` 2026-07-10T20:24:17.080479 ■ 概要 この論文は、LLM 交渉エージェントを「会話が自然か」ではなく、「不完全情報の市場で限られた発話資源をどう配分し、どれだけ高い余剰を取れるか」で評価・訓練する研究である。対象は 1 人の seller が複数の buyer と同時並行で交渉する市場で、buyer はそれ tags=[memory, harness, game-design, slack, agent]
- `sr-1783667523-2376c5145d` 2026-07-10T16:12:03.525089 ■ 概要 GDC 2026 の講演「'Apex Legends' Dev Support: Getting Bandwidth Back by Letting People Do Their Best Work」は、ゲーム開発者の生産性を「個人の集中力」ではなく、制作組織がどれだ tags=[memory, harness, game-design, slack, agent]
- `sr-1783660318-30a61a68ed` 2026-07-10T14:11:58.147689 ■ 概要 「Automated Playtesting of Matching Tile Games」は、Match-3 系ゲームの自動プレイテストを、単一の最適 solver ではなく複数の procedural persona で行う論文である。対象は Bejeweled / tags=[skills, harness, game-design, agent, identity]
- `sr-1783660317-3e29d49ae1` 2026-07-10T14:11:57.348439 ■ 概要 Roohi らの「Predicting Game Engagement and Difficulty Using AI Players」は、AI プレイヤーを単にレベルクリア確認に使うのではなく、人間プレイヤーの difficulty と engagement を予測す tags=[harness, game-design, slack, agent, identity]
- `sr-1783653132-1a07acfa18` 2026-07-10T12:12:12.093719 ■ 概要 Hong, Wu, Zhao による ACL 2025 long paper。主題は、ゲーム制作を「LLM が一度コードを吐く作業」ではなく、ユーザーと LLM が複数ターンで仕様を固め、実装し、次の入力を誘導する Human-LLM interaction として定式 tags=[harness, game-design, identity, knowledge, evaluation]
- `sr-1783645796-75c7a5917b` 2026-07-10T10:09:56.943439 ■ 概要 この論文は、EA SPORTS NHL 26 の開発版を題材に、goalie AI の behavioral exploit を自動で探すための case study である。問題設定はかなり実務的で、ゲーム内の AI や挙動を修正するたびに、人間 playtester tags=[memory, harness, game-design, agent, identity]
- `sr-1783638695-da0d0531c9` 2026-07-10T08:11:35.754579 ■ 概要 arXiv:2607.00233 は、LLM agents がゼロから共有言語を作る時、成功を左右する主因は channel capacity だけではなく memory architecture だと示す論文である。設定は Lewis signaling game。s tags=[memory, harness, game-design, agent, identity]
- `sr-1783638691-f04b866d3d` 2026-07-10T08:11:31.003099 ■ 概要 arXiv:2607.02716v1 は、都市交通の agent-based simulation に LLM を入れる時、LLM に経路探索そのものを任せるのではなく、「いまの経路を維持するか、既存の最短経路アルゴリズムを再実行するか」を決める decision la tags=[memory, harness, game-design, agent, identity]
- `sr-1783636736-94bc7d0ed3` 2026-07-10T07:38:56.001819 ■ 概要 Creative Bloq の記事は、solo developer Adolfo Juan Fernando Gazzo Castaneda / 2ndPlayerGames による indie RPG『Full Circle』を、古典 JRPG 風の懐古表現ではなく、 tags=[memory, skills, harness, game-design, identity]
- `sr-1783629584-ae49b00bad` 2026-07-10T05:39:44.800039 ■ 概要 <http://Luden.io|Luden.io> の Oleg Chumakov による、ゲーム開発現場で AI agent をどこに使い、どこで失敗したかをかなり実務寄りに整理した記事。対象は「SNS で見る一発生成の未来」ではなく、Defold / Unity  tags=[memory, harness, game-design, slack, agent]
- `sr-1783615413-6937df4772` 2026-07-10T01:43:33.008149 ■ 概要 「Recovery Mode: Taking Control of an Out-of-Control Project」は、ゲーム開発プロジェクトが制御不能になる瞬間を、雰囲気や忙しさではなく、schedule slip と milestone の観測可能性で捉える古典 tags=[memory, harness, game-design, slack, agent]
- `sr-1783615412-bf71780655` 2026-07-10T01:43:32.040899 ■ 概要 PhoneHarness 論文は、スマホ操作 agent を「画面を見て次の tap/swipe を当てる GUI controller」としてだけ評価する設計を問題にしている。実際の phone-use workflow では、アプリ画面を操作するだけでなく、devi tags=[memory, harness, game-design, slack, agent]
- `sr-1783607998-47cf75912f` 2026-07-09T23:39:58.776269 ■ 概要 “[Re] Benchmarking LLM Capabilities in Negotiation through Scoreable Games” は、Abdelnabi et al. 2024 の Scoreable Games 型 LLM 交渉 benchmar tags=[memory, harness, game-design, slack, agent]
- `sr-1783600930-7dc253e0f9` 2026-07-09T21:42:10.518619 ■ 概要 この論文は、LLM agent が「これをします」と公に発表したあと、本当にその行動を守るのかを、繰り返しゲームの中で測った研究である。扱っているのは単なる嘘検出ではなく、発話、事前意図、最終行動の三つを分ける評価設計だ。各ラウンドで agent はまず非公開に自分の意 tags=[memory, harness, game-design, slack, agent]
- `sr-1783586275-6ab7c8ac84` 2026-07-09T17:37:55.170899 ■ 概要 ChainSWE は、coding agent の評価を「単発の bug fix」から「同じ codebase 上で連続し、互いに依存する bug fix」へ移すための benchmark である。問題設定は明確で、実運用の LM agent は長期間 codebase tags=[memory, harness, game-design, agent, identity]
- `sr-1783586275-01e242ede2` 2026-07-09T17:37:55.087889 ■ 概要 Bayesian-Agent は、LLM agent の性能改善を「成功例を見たから prompt や SOP を増やす」という足し算ではなく、skill や SOP を「特定の prompt、context、harness 環境で frozen model が成功する tags=[memory, skills, harness, game-design, slack]

## Game Task Entry Points
- `enemy-pattern` (402): local-20260523-shmup-enemy-pattern-reproduction-packet / local-20260523-headless-action-eval-v58 / local-20260605-monosh-spaceharrier-stability
- `px-evaluation` (118): sr-1780112563-a24c566994 / sr-1780598219-384b99eb73 / sr-1777737101-0f96f202c2
- `impact-feel` (60): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / sr-1779222702-4e91a7e74a
- `ui-agent` (25): sr-1775769451-9e8f67f095 / sr-1775769461-0e31ca81b4 / sr-1779979770-debe6e8ae9
- `headless-eval` (92): local-20260527-pulse-relay-v008-headless-bridge / local-20260523-shmup-enemy-pattern-reproduction-packet / local-20260523-headless-action-eval-v58
- `memory-routing` (90): sr-1780184739-bd9e5fed6a / sr-1780119865-e1b5757bfb / sr-1780119865-9d21461a8d
- `game-rights-feedback` (205): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662

## Tag Entry Points
- `identity` (2148): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `evaluation` (1856): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `operation` (1787): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `game-design` (1730): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `memory` (1631): sr-1777159546-a6d3bea7db / sr-1777795540-ff54caa26c / sr-1777936240-43021e0b05
- `knowledge` (1407): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `slack` (1310): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1777889131-c1f418bde0
- `principle` (1304): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1778026642-523a78cee1
- `agent` (1198): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `harness` (771): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `skills` (343): sr-1777737101-0f96f202c2 / sr-1777889131-c1f418bde0 / sr-1777936240-43021e0b05
- `game-dev-teacher` (100): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / local-20260511-teacher-shot-log-v01
- `supervised-feedback` (100): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / local-20260511-teacher-shot-log-v01
- `game-rights` (96): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `nao-u-feedback` (96): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `m40` (56): sr-1778595976-efaf4a69b2 / sr-1777773279-2a2ffd2a00 / sr-1778256262-21697e050f
- `memory_redesign` (52): sr-1775641084-2ffa8320eb / sr-1780303781-c594ccba51 / sr-1780514208-bdbba857f2
- `b002` (38): sr-1775641084-2ffa8320eb / sr-1776359641-35fe4f57fd / sr-1776443334-faa1d1ec3e
- `m41` (37): sr-1778402011-2858272189 / sr-1778797690-bc54b88d86 / sr-1779827466-7c3e4d9749
- `external_notes_log` (32): sr-1780341237-b61cae1d78 / sr-1780303781-c594ccba51 / sr-1776800208-c7f1abae59
- `predictability` (32): gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662 / gr-1774552790-168ef78071
- `game_lessons_log` (31): sr-1779395690-86f17b3a89 / sr-1779846492-8c411b6576 / sr-1779352546-e8ac2204b7
- `log_autonomous_game` (30): sr-1780162845-62e9d977c2 / sr-1780216954-3cb09e2394 / sr-1779738248-4040bfb5b6
- `m39` (28): sr-1778429023-d9314ca760 / sr-1777626201-4128924a27 / sr-1778502514-675c909157

## 原則
- raw は GPT 側 `memory/raw/` に保持する。Claude 側は参考元であり、通常運用の想起元にしない。
- atom は `Use when` 型の発動条件を持つ。要約ではなく、開くべきか判断するための索引に留める。
- 記憶を行動に変える必要が出たら、atom から別途 skill / checklist / project に昇格する。
