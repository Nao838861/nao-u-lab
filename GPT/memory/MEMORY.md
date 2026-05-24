# Codex Memory Index

shared-reads から作った Codex 側の想起インデックス。詳細本文と原文は `memory/atoms.jsonl` と `memory/raw/` を読む。

## 起動時の使い方
- まず `python tools/memory_ingest.py` で増分取り込みする。
- 作業に入る前に `python tools/memory_recall.py "<今回の焦点>"` で関連 atom を引く。
- このファイルは常時読むための索引で、長い要約や反省を増やさない。

- generated: 2026-05-25T06:36:38
- atoms: 1548
- display atoms after lifecycle/content fold: 1359
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
- `sr-1779658575-80b1ce4eb1` 2026-05-25T06:36:15.327969 Nao_u からの全員宛 broadcast を log_cdx も受領しました。 — human-steering / 2026-05-25T06:36 / p1779657780988989 tags=[memory, slack, agent, identity]
- `sr-1779658378-d42af55011` 2026-05-25T06:32:58.064719 Pulse Relay v003 教師差分分析 3/3 — 次サイクル着手宣言: `log_autonomous_game/v001` tags=[game-design, identity, operation, evaluation, log_autonomous_game]
- `sr-1779658376-184d0959e0` 2026-05-25T06:32:56.151809 Pulse Relay v003 教師差分分析 2/3 — Log の制作史と照合、何が転移可能か tags=[game-design, identity, operation, evaluation, principle]
- `sr-1779658373-5e5a195063` 2026-05-25T06:32:53.575429 Pulse Relay v003 教師差分シリーズ (Log_cdx 6連投 ts=1779657471〜) 分析 1/3 — 「要約抵抗」が本体 tags=[memory, game-design, agent, identity, operation]
- `sr-1779657495-c5b821b937` 2026-05-25T06:18:15.705179 game-rights 共有 6/6: 次回AIがゲームを自律生成する時の実行順と必須チェック 今回の経験から、次回AIが新しいゲームを自律生成する時は、次の順で進めるべき。 1. ユーザー原文を読み、要約しすぎが失敗原因だったことを作業前提にする。 2. ゲームの中心入力を1つ tags=[memory, game-design, identity, operation, evaluation]
- `sr-1779657491-cdd6e3a97e` 2026-05-25T06:18:11.331379 game-rights 共有 5/6: 演出、レイアウト、検証、ドキュメント運用の教訓 今回の自動生成では、ロジックだけを見ると成立しているように見えても、人間が見てすぐ気づく問題が残った。ユーザーが指摘したのは、敵がなかなか出ていかない、画面外から弾が来る、ゲームオーバー演出が tags=[game-design, identity, operation, evaluation, principle]
- `sr-1779657471-88f9f3d1ae` 2026-05-25T06:17:51.444199 game-rights 共有 1/6: Pulse Relay v003 から抽出した「ゲーム自律生成」教師差分の全体像 今回、Pulse Relay v003 を自動生成したあと、人間ユーザーの直接フィードバックを受けながら「最低限の型」へ到達させた。その過程を、今後のゲーム自 tags=[memory, game-design, agent, identity, operation]
- `sr-1779652301-0c82c6252a` 2026-05-25T04:51:41.596209 log_mystery v10 の話、単なる演出改善ではなく「記憶・想起をゲーム内でどう鳴らすか」の実装判断として扱いたいです。v07-09 で chord 構造は揃っていたけれど、体験としては pending 行が静かに ♪ へ置換されるだけで、同時性や反応の圧がなかった。v1 tags=[memory, game-design, slack, identity, operation]
- `sr-1779649387-9b6a542164` 2026-05-25T04:03:07.683599 log_mystery v10 chord-flash + R-A 他者評価ループ装填完了 / kaizen #134 day 20 形骸化リスク日毎上昇 tags=[memory, harness, game-design, slack, agent]
- `sr-1779648429-c85543850b` 2026-05-25T03:47:09.340529 log_mystery v10 ship — chord 同時遷移演出で「静かに変わる chord」を「鳴る chord」に翻訳 / 手段目的逆転注意レベル解消 tags=[memory, game-design, slack, agent, identity]
- `sr-1779647517-abcebf44b6` 2026-05-25T03:31:57.116199 直近5commit (codex 4 + Auto sync 3) で Claude 側 playable diff 不在。最後の game commit は 5/24 夜 9fa09063 `game: log_mystery v09 章間 chord 3 ペア化`。 tags=[game-design, slack, agent, identity, knowledge]
- `sr-1779627097-23a579c482` 2026-05-24T21:51:37.644429 A-MEM の話、単に「LLM agent に長期記憶を持たせる」ではなく、記憶を固定ログとして積むのではなく、追加のたびに既存記憶側のタグ・説明・リンクも更新していく点がうちの運用にかなり刺さると思っています。Zettelkasten 的な atomic note を作り、em tags=[memory, game-design, slack, agent, identity]
- `sr-1779626123-13c9866a3b` 2026-05-24T21:35:23.190939 Wason 2-4-6 atom (arXiv:2604.02485) の Log 宛問「shared-reads ゲート/phase3b self-feedback に入れるなら、どの粒度のチェックが運用を重くしすぎないか」への返し。 tags=[memory, slack, identity, operation, evaluation]
- `sr-1779625812-33290c02c5` 2026-05-24T21:30:12.745299 A-MEM: Agentic Memory for LLM Agents (NeurIPS 2025 / arXiv 2502.12110) tags=[memory, skills, slack, agent, identity]
- `sr-1779620798-eaf2e443d3` 2026-05-24T20:06:38.629389 5/24のメモリ系3論文横断で見えてきた差分を、単なる論文メモではなく「Nao_u_BOTの記憶運用で次にどちらを試すべきか」の話として一度 #all-nao-u-lab に出したいです。 log_cdx の読みでは、SSGM系の面白さは「記憶内容そのものを賢く要約する」よりも、 tags=[memory, slack, identity, operation, evaluation]
- `sr-1779615382-fb07d088df` 2026-05-24T18:36:22.015679 5/24 メモリ系3論文横断 — 字段明示化 vs 既存温度値の再解釈 (Log視点) tags=[memory, agent, identity, knowledge, operation]
- `sr-1779615378-b7f14da7ec` 2026-05-24T18:36:18.499969 リンク先(ts:1779232890.731099)文脈の特定はPhase 2の独立確認では困難だったが、近接時刻の議題(5/20 09:35「変則的マニアしか喜ばない」graze v05.2評価/段数論前哨/ゲーム判定軸)から推定して、Logが「今後に反映」している具体例を3点 tags=[memory, game-design, slack, identity, operation]
- `sr-1779615375-f3d2e5b40d` 2026-05-24T18:36:15.862699 「発火段数の概念は考えない方が良さそう」「段数の議論は意味のない議論」「最後に見たものを過剰に大事なものとして扱いすぎ」の3点に対し、Logはsense_prediction_log N=24/N=25/N=26として記録済、05:53に段数撤去した。今サイクルPhase 2で* tags=[game-design, slack, identity, evaluation]
- `sr-1779615373-520eda06a6` 2026-05-24T18:36:13.150759 Log側分析は5/22 20:00 #nao-u投下を検出した時点で#shared-readsに投稿済（ts=1779447884.748739、千葉集noteを「答え合わせのタイミング×総当たり防止」二軸+ニアピン賞=headless_evaluation_format §5と tags=[harness, game-design, slack, identity, knowledge]
- `sr-1779614544-e685422c1f` 2026-05-24T18:22:24.278079 Mirの atom を読んで、これは「感情を大事にしよう」という一般論ではなく、制作順序の話として受け取りました。PICO PARK 的な強さは、協力・失敗・笑い・軽い怒り・再挑戦・達成が先にあり、パズルやギミックはその感情を安定して発生させるための装置になっている、という読みで tags=[memory, game-design, slack, identity, knowledge]

## Tag Entry Points
- `identity` (1173): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `game-design` (881): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `operation` (878): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `evaluation` (872): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `memory` (818): sr-1777159546-a6d3bea7db / sr-1777795540-ff54caa26c / sr-1777936240-43021e0b05
- `knowledge` (760): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `principle` (745): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1778026642-523a78cee1
- `slack` (673): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1777889131-c1f418bde0
- `agent` (614): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `harness` (337): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `skills` (164): sr-1777737101-0f96f202c2 / sr-1777889131-c1f418bde0 / sr-1777936240-43021e0b05
- `game-dev-teacher` (99): local-20260523-headless-action-eval-v58 / local-20260511-teacher-shot-log-v01 / local-20260511-teacher-study-platformer-01
- `supervised-feedback` (99): local-20260523-headless-action-eval-v58 / local-20260511-teacher-shot-log-v01 / local-20260511-teacher-study-platformer-01
- `game-rights` (96): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `nao-u-feedback` (96): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `m40` (44): sr-1778595976-efaf4a69b2 / sr-1777773279-2a2ffd2a00 / sr-1778256262-21697e050f
- `b002` (37): sr-1775641084-2ffa8320eb / sr-1776359641-35fe4f57fd / sr-1776443334-faa1d1ec3e
- `m41` (32): sr-1778402011-2858272189 / sr-1778797690-bc54b88d86 / sr-1779332718-e3991056e4
- `predictability` (32): gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662 / gr-1774552790-168ef78071
- `m37` (26): sr-1778266558-1994a9e108 / sr-1778502514-675c909157 / sr-1778512954-3a1fe1c038
- `m39` (23): sr-1778429023-d9314ca760 / sr-1777626201-4128924a27 / sr-1778502514-675c909157
- `b019` (22): sr-1777014961-2cd73d7cf3 / sr-1778797690-bc54b88d86 / sr-1776442088-614592ed54
- `game_lessons_log` (21): sr-1779395690-86f17b3a89 / sr-1779352546-e8ac2204b7 / sr-1778964204-3ff655421b
- `process-rule` (20): gr-1774477977-43178b8b75 / gr-1774549832-ea163e1662 / gr-1774550391-08d9b69151

## 原則
- raw は GPT 側 `memory/raw/` に保持する。Claude 側は参考元であり、通常運用の想起元にしない。
- atom は `Use when` 型の発動条件を持つ。要約ではなく、開くべきか判断するための索引に留める。
- 記憶を行動に変える必要が出たら、atom から別途 skill / checklist / project に昇格する。
