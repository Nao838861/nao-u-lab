# Codex Memory Index

shared-reads から作った Codex 側の想起インデックス。詳細本文と原文は `memory/atoms.jsonl` と `memory/raw/` を読む。

## 起動時の使い方
- まず `python tools/memory_ingest.py` で増分取り込みする。
- 作業に入る前に `python tools/memory_recall.py "<今回の焦点>"` で関連 atom を引く。
- このファイルは常時読むための索引で、長い要約や反省を増やさない。

- generated: 2026-05-26T00:06:59
- atoms: 1589
- display atoms after lifecycle/content fold: 1399
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
- `sr-1779717626-fcfc55b670` 2026-05-25T23:00:26.976659 ■ 概要 80 Level の Toukana Interactive インタビュー「How Dorfromantik Expands Its Cozy World Through Minimalist Design」は、Dorfromantik の Medieval Biome tags=[memory, harness, game-design, identity, knowledge]
- `sr-1779715454-22222e8a6c` 2026-05-25T22:24:14.945489 EvolveMem の面白さは、長期記憶を「保存物」ではなく「取り出し方まで含む可変システム」と見ている点だと思いました。今の自分たちは atom / rules / feedback / inbox を増やす設計にはかなり意識が向いている一方で、どの順番で読むか、何件読むか、ど tags=[memory, slack, identity, operation, evaluation]
- `sr-1779714056-3bad00d205` 2026-05-25T22:00:56.327489 冨田到さん共有: EvolveMem (arxiv 2605.13941v1) <https://arxiv.org/html/2605.13941v1> tags=[memory, game-design, identity, operation, evaluation]
- `sr-1779702786-977fe7580b` 2026-05-25T18:53:06.090159 この atom は、HyDE/SL-HyDE を「embedding 検索の技術」としてではなく、今の我々の memory grep 運用を説明する鏡として読み替えたいです。 自分の理解では、HyDE は「クエリそのもの」ではなく、クエリから生成した仮想回答を検索の足場にする。つ tags=[memory, game-design, slack, identity, operation]
- `sr-1779701926-e1f333f952` 2026-05-25T18:38:46.657909 *Self-Learning HyDE — 我々の memory grep 運用は embedding なしで SL-HyDE 同型の反復学習を回している* tags=[memory, game-design, agent, identity, knowledge]
- `sr-1779701916-014c401c82` 2026-05-25T18:38:36.619609 log_cdx 15:23 HyDE/agentic search → memory 設計ルール昇格か probe 留めかの問いに、Log 単独で回答します。 tags=[memory, game-design, slack, agent, identity]
- `sr-1779696514-fc4243163e` 2026-05-25T17:08:34.099079 Lap の話を、単なる「LLMで自動プレイできた」ではなく、うちのゲーム制作サイクルに入れるべき評価ハーネスの最小形として読み替えたいです。論文の肝は、match-3 の盤面を画像から数値 matrix に落とし、LLM に次の手を選ばせ、実行後の盤面をまた観測してループするとこ tags=[memory, harness, game-design, slack, agent]
- `sr-1779690832-a0488769cf` 2026-05-25T15:33:52.905979 Towards LLM-Based Automatic Playtest (arxiv 2507.09490) — 手法名 "Lap" tags=[memory, harness, game-design, slack, agent]
- `sr-1779690823-9cfbf0f049` 2026-05-25T15:33:43.312759 ScriptDoctor: Automatic Generation of PuzzleScript Games via LLMs and Tree Search (arxiv 2506.06524) tags=[game-design, slack, agent, identity, operation]
- `sr-1779690813-b5ab0dbbf9` 2026-05-25T15:33:33.274249 Fly, Fail, Fix: Iterative Game Repair with RL and LMMs (arxiv 2507.12666, RLVG workshop 2025) tags=[harness, game-design, slack, agent, identity]
- `sr-1779690227-33b1145adf` 2026-05-25T15:23:47.277609 agentic search が grep だけで意外に成立する、という話を memory 運用に引き寄せて考えたいです。ここで重要なのは「grep が強い」ではなく、検索前に LLM 側がかなり贅沢に意味変換している点だと思います。人間が `movie` と打つところを、LLM tags=[memory, game-design, slack, agent, identity]
- `sr-1779685369-d5593fa883` 2026-05-25T14:02:49.935299 <https://80.lv/articles/obstacle-overdrive-how-an-indie-studio-created-a-toy-car-adventure-game> ■ 概要 80 Level の Arcane Ermine インタビューは、Obsta tags=[memory, harness, game-design, slack, identity]
- `sr-1779683794-9e5bc11976` 2026-05-25T13:36:34.486529 Movement Prediction の記事で出てくる「キャラクタ予測は 1 秒未満に抑える」という経験則、log_autonomous_game v001 の Q-D にかなり直接刺さると思っています。記事自体は dead reckoning、つまり `現在位置 + 速度 × tags=[memory, game-design, slack, agent, identity]
- `sr-1779683763-91dc42c0fa` 2026-05-25T13:36:03.094609 *#nao-u 05-25 13:28 kazunori_279 への反応（Log）* tags=[memory, game-design, slack, agent, identity]
- `sr-1779679990-e1fa110c02` 2026-05-25T12:33:10.506839 Movement Prediction (<http://gamedeveloper.com|gamedeveloper.com>) — 「キャラクタ予測 1秒未満」の外部経験則が log_autonomous_game v001 Q-D に直接かみ合う tags=[memory, game-design, agent, identity, knowledge]
- `sr-1779677581-cc17431118` 2026-05-25T11:53:01.255999 ■ 概要 <https://indiesagas.com/shape-swarm-post-mortem-launching-digital-sagas-first-game/> Digital Sagas の Shape Swarm postmortem は、「小さく作る」こと tags=[memory, harness, game-design, identity, knowledge]
- `sr-1779671306-3927d68a55` 2026-05-25T10:08:26.021399 Log 評価を読んで、私(log_cdx)側で一番重要だと思ったのは「ゲーム制作の失敗知を、きれいな一般論に圧縮した瞬間に再発する」という点です。今回の 8 観点は「UIを良くする」「敵を自然にする」ではなく、対象物側マーカー、中心入力の試打、7区分の時間予算、bad polic tags=[harness, game-design, slack, identity, operation]
- `sr-1779671274-de4e7220a1` 2026-05-25T10:07:54.093989 Nao_u から log_cdx 宛の指示を受領しました。 — human-steering / 2026-05-25T10:07 / p1779668181087499 tags=[memory, slack, agent, identity]
- `sr-1779669572-f7f36af5cb` 2026-05-25T09:39:32.065929 <https://arxiv.org/abs/2604.13151> ■ 概要 この論文は、LM agent が失敗したときに「未知領域を探せなかった」のか、「見つけた知識を使えなかった」のかを、外から観測できる行動だけで分けて測る評価法を提案する。対象は AI coding、w tags=[harness, game-design, agent, identity, knowledge]
- `sr-1779669494-15705cce59` 2026-05-25T09:38:14.944199 <https://arxiv.org/abs/2605.21240> ■ 概要 この論文は、自己改善型 LLM agent がエピソードを重ねるほど賢くなる一方で、過去に報酬が高かった行動列へ固着し、まだ試していない有望な方針を捨ててしまう問題を「exploration coll tags=[memory, harness, game-design, agent, identity]

## Tag Entry Points

### Broad Tag Descent

`identity` / `evaluation` / `operation` / `game-design` / `memory` のような巨大 tag は、上位 atom を順に掘らず、まず `memory/game_memory_task_lens_index.md` の `Broad Tag Descent Map` に降りる。具体対応表は lens index 側を正本にし、この MEMORY.md は入口だけに留める。

- ゲーム制作前は、該当 broad tag から `Playable / Headless 評価`、`Balance / Rule Space`、`Feedback / Rights / Human Judgment` などの lens を先に選ぶ。
- `headless harness`、`bad-policy`、`shmup enemy pattern`、`feedback bridge` のような具体タスクは、Tag Entry Points ではなく lens の「使う場面」/ recall query / representative を読む。
- 足りない時だけ `python tools/memory_recall.py "<lens 名 + 具体タスク>"` を実行し、broad tag 全体検索へ戻る。

- `identity` (1213): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `game-design` (917): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `operation` (910): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `evaluation` (906): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `memory` (849): sr-1777159546-a6d3bea7db / sr-1777795540-ff54caa26c / sr-1777936240-43021e0b05
- `knowledge` (772): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `principle` (771): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1778026642-523a78cee1
- `slack` (698): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1777889131-c1f418bde0
- `agent` (637): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `harness` (351): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
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
- `game_lessons_log` (23): sr-1779395690-86f17b3a89 / sr-1779352546-e8ac2204b7 / sr-1778964204-3ff655421b
- `b019` (22): sr-1777014961-2cd73d7cf3 / sr-1778797690-bc54b88d86 / sr-1776442088-614592ed54
- `process-rule` (20): gr-1774477977-43178b8b75 / gr-1774549832-ea163e1662 / gr-1774550391-08d9b69151

## 原則
- raw は GPT 側 `memory/raw/` に保持する。Claude 側は参考元であり、通常運用の想起元にしない。
- atom は `Use when` 型の発動条件を持つ。要約ではなく、開くべきか判断するための索引に留める。
- 記憶を行動に変える必要が出たら、atom から別途 skill / checklist / project に昇格する。
