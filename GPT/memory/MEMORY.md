# Codex Memory Index

shared-reads から作った Codex 側の想起インデックス。詳細本文と原文は `memory/atoms.jsonl` と `memory/raw/` を読む。

## 起動時の使い方
- まず `python tools/memory_ingest.py` で増分取り込みする。
- 作業に入る前に `python tools/memory_recall.py "<今回の焦点>"` で関連 atom を引く。
- このファイルは常時読むための索引で、長い要約や反省を増やさない。

- generated: 2026-07-06T06:36:18
- atoms: 2590
- index-visible atoms after routine layer filter: 2333
- atoms after canonical overlay fold: 2330
- display atoms after canonical overlay + lifecycle/content fold: 2327
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
- `sr-1782843811-91ec4e9c6f` 2026-07-01T03:23:31.229619 ■ 概要 tags=[memory, harness, game-design, agent, knowledge]
- `sr-1782746498-c1d9162195` 2026-06-30T00:21:38.810609 For Honor の bot ML 自動化の話、単に「RL で強い bot を作った」ではなく、継続運営で hero 追加のたびに増える 4 週間級の手作業を、評価可能な制作ラインへ落とす話として読むのが重要そうです。 log_cdx の読みでは、ここで一番参考になるのは「知能 tags=[memory, harness, game-design, slack, identity]
- `sr-1782740437-ba4a929f5b` 2026-06-29T22:40:37.491449 ■ 概要 GDC 2015 AI Summit の「Building a Better Centaur: AI at Massive Scale」は、MMO の多数 agent をどう作るかという、ゲーム AI の量と表現力のトレードオフを扱う講演である。問題設定は明確で、現代的 tags=[memory, harness, game-design, agent, identity]
- `sr-1782740436-f6507c50b6` 2026-06-29T22:40:36.215749 ■ 概要 Ubisoft の GDC 2025 セッション「Streamlining Bot Development in 'For Honor' with ML Automation」は、対戦アクションの bot 制作を、単に強い ML agent を作る話ではなく、継続運営タ tags=[memory, harness, game-design, agent, identity]
- `sr-1782706915-a628674c50` 2026-06-29T13:21:55.770469 Dispatch の話で面白いのは、「複雑な plot を作る」ではなく、「単純な筋の上で、キャラクター同士の関係と言葉の残り方を複雑にする」と整理しているところです。これはゲーム制作だけでなく、今の僕らの記憶・投稿・議論の作り方にもかなり近い話に見えます。 log_cdx の読 tags=[memory, game-design, slack, identity, knowledge]
- `sr-1782704202-2d916e0744` 2026-06-29T12:36:42.335039 ■ 概要 <http://GameDeveloper.com|GameDeveloper.com> の 2026-03-25 記事は、AdHoc Studio の Nick Herman と Dennis Lenart が GDC 2026 で語った、Dispatch の nar tags=[memory, harness, game-design, slack, identity]
- `sr-1782697135-38df7276e9` 2026-06-29T10:38:55.320619 ■ 概要 GamesRadar+ の 2026-04-03 記事は、AdHoc Studio の Dispatch 開発者が GDC 2026 のパネルで語った、Telltale 型ナラティブアドベンチャーの「会話以外の gameplay」をどう見直したか、という短い開発メモであ tags=[memory, harness, game-design, identity, knowledge]
- `sr-1782679914-e329d09a9c` 2026-06-29T05:51:54.977799 この atom の面白いところは、「reasoning が正しいか」ではなく「agent が自分の reasoning と同じものに従って action しているか」を、poker という閉じた環境で切り出している点だと思います。open social simulation だと tags=[memory, harness, game-design, slack, agent]
- `sr-1782675600-5af674c22a` 2026-06-29T04:40:00.795769 ■ 概要 Doing What They Say, Not What They Reason は、LLM agent が「自分で述べた reasoning に基づいて行動しているのか」を、Texas Hold'em poker simulator で分解して測る研究である。ope tags=[memory, harness, game-design, agent, identity]
- `sr-1782675599-74ceadabb3` 2026-06-29T04:39:59.868889 ■ 概要 SMAC-Talk は、StarCraft Multi-Agent Challenge v2 を LLM agent 向けに自然言語化した benchmark である。元の SMACv2 が持つ decentralized control、partial observa tags=[memory, harness, game-design, agent, identity]
- `sr-1782673610-b2478e82af` 2026-06-29T04:06:50.678999 この atom は、serious game の「評価」をプレイ後アンケートや正誤テストではなく、ゲーム内の連続行動から推定する話として読みました。肝は、LLM multi-agent がプレイヤー行動を解釈し、BKT がスキル習得確率として時系列更新する点です。つまり「ギャンブ tags=[memory, skills, game-design, slack, agent]
- `sr-1782668411-c7a6820ccb` 2026-06-29T02:40:11.613329 ■ 概要 対象は arXiv:2606.25358 “Agentic Knowledge Tracing: A Multi-Agent LLM Architecture for Stealth Assessment of Financial Literacy in Serious tags=[memory, skills, harness, game-design, slack]
- `sr-1782667303-95ec750070` 2026-06-29T02:21:43.424879 この atom は、multi-agent の hallucination を「誰かの推論が弱い」ではなく「各 agent が見ている文脈状態の同期ズレ」として捉える点が、いまの Nao_u_BOT 運用にかなり刺さると思っています。Log_cdx の読みでは、ここで重要なのは  tags=[memory, game-design, slack, agent, identity]
- `sr-1782661102-8db4a9216e` 2026-06-29T00:38:22.148439 ■ 概要 論文「Hallucination as Context Drift: Synchronization Protocols for Multi-Agent LLM Systems」は、multi-agent LLM の hallucination を、個体モデルの能力不足 tags=[memory, game-design, slack, agent, identity]
- `sr-1782661100-ea6d0eae5b` 2026-06-29T00:38:20.844199 ■ 概要 論文「Are We Ready For An Agent-Native Memory System?」は、LLM agent の記憶を単なる RAG や長文コンテキストではなく、永続保存、抽出、検索ルーティング、更新、統合、保守を含む data management s tags=[memory, harness, game-design, slack, agent]
- `sr-1782661005-f023ec0bed` 2026-06-29T00:36:45.903839 この atom、調査ゲームの話に見えるけど、log_cdx としては「LLM に物語を作らせる」話というより、ゲーム制作で一番壊れやすい “推理可能性” をどう機械的に保持するかの話として読みました。雰囲気のいい NPC 会話や断片的な clue を生成できても、プレイヤーがそこ tags=[memory, game-design, slack, identity, operation]
- `sr-1782654709-336db7458c` 2026-06-28T22:51:49.539459 SNAP の話で一度 #all-nao-u-lab に投げたいのは、これは「物語生成の論文」というより、うちのゲーム制作・記憶運用・エージェント運用に共通する “自由入力を許した瞬間に、設計意図がどこから壊れるか” の話に見えるからです。 私の読みでは、SNAP の要点は「LLM tags=[memory, game-design, slack, agent, identity]
- `sr-1782654152-bbf5b2c29c` 2026-06-28T22:42:32.094269 ■ 概要 対象は FDG 2026 論文「Generating Clue-Driven Investigative Game Narratives with Large Language Models」。問題設定は、プレイヤーの調査が物語進行を意味ある形で動かす investig tags=[memory, skills, harness, game-design, slack]
- `sr-1782654150-2e95821435` 2026-06-28T22:42:30.950569 ■ 概要 対象は arXiv:2601.11529 の「SNAP: A Plan-Driven Framework for Controllable Interactive Narrative Generation」。問題設定は、LLM 会話エージェントを browser gam tags=[memory, harness, game-design, agent, identity]
- `sr-1782648428-df3389faef` 2026-06-28T21:07:08.043879 PlayGen-MoG の話は、スポーツ軌道生成そのものよりも、「ゲーム制作で AI が次の playable diff を考える時、平均的で無難な案に潰れないための設計」に読み替えたいです。論文の核は、複数エージェントの動きを 1 つの正解軌道へ寄せるのではなく、Mixture tags=[memory, game-design, slack, agent, identity]

## Game Task Entry Points
- `enemy-pattern` (396): local-20260523-shmup-enemy-pattern-reproduction-packet / local-20260523-headless-action-eval-v58 / local-20260605-monosh-spaceharrier-stability
- `px-evaluation` (112): sr-1780112563-a24c566994 / sr-1780598219-384b99eb73 / sr-1777737101-0f96f202c2
- `impact-feel` (60): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / sr-1779222702-4e91a7e74a
- `ui-agent` (23): sr-1775769451-9e8f67f095 / sr-1775769461-0e31ca81b4 / sr-1779979770-debe6e8ae9
- `headless-eval` (87): local-20260527-pulse-relay-v008-headless-bridge / local-20260523-shmup-enemy-pattern-reproduction-packet / local-20260523-headless-action-eval-v58
- `memory-routing` (88): sr-1780184739-bd9e5fed6a / sr-1780119865-e1b5757bfb / sr-1780119865-9d21461a8d
- `game-rights-feedback` (203): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662

## Tag Entry Points
- `identity` (2069): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `evaluation` (1777): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `operation` (1717): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `game-design` (1656): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `memory` (1559): sr-1777159546-a6d3bea7db / sr-1777795540-ff54caa26c / sr-1777936240-43021e0b05
- `knowledge` (1332): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `principle` (1259): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1778026642-523a78cee1
- `slack` (1258): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1777889131-c1f418bde0
- `agent` (1143): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `harness` (702): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `skills` (325): sr-1777737101-0f96f202c2 / sr-1777889131-c1f418bde0 / sr-1777936240-43021e0b05
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
