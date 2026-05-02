# 「判断だけが残る」と「判断は厚みで成り立つ」の反証ペア — M-40 自己判定ハーネスを「自動化可能層／厚み層」に二分する根拠

- source:
  - https://x.com/nakamurahiroki/status/2050047571393945602 — @nakamurahiroki (2026-05-01) 「AIが全部やって人間は判断だけ」フェーズ移行宣言
  - https://x.com/akari_worlds/status/2050049206468104270 — @akari_worlds (2026-05-01) 「判断って、出力を見て即決まるものじゃなくて、自分の中に積んできた基準があって成り立つ気がして、そこの厚みは外注しづらい」（同日 nakamurahiroki への直接応答）
  - https://www.gamedeveloper.com/design/playerless-playtesting-ai-and-user-experience-evaluation-in-games — Game Developer「Playerless playtesting: AI and user experience evaluation in games」(ML/CV/行動モデルでUX近似は進むが 'finer complexity' 予測は数年先)
  - https://bennycheung.github.io/ai-playtesting-when-your-game-tests-itself — Benny Cheung「AI Playtesting - When Your Board Game Tests Itself」(boardgame の balance / skill gap / rule clarity を会話AIで測定する具体パイプライン)
  - https://digitaldefynd.com/IQ/ai-in-video-game-testing/ — DigitalDefynd「AI in Video Game Testing 5 Case Studies」(RL agents で scalable 自律 playtesting / collision bug 検出)
  - https://www.gianty.com/where-might-ai-in-game-development-take-us-in-2025/ — Devcom 2025 Google発表: 開発者の90%がAI何らか活用
- author: 外部複数 / Ash合成
- discovered: 2026-05-01 (twitter pair) + 2026-05-03 (external_search)
- discovered_via: log/twitter_recommended_20260502.txt #28/#29 + log/external_search.log Phase 1 step 6 (2026-05-03 00:50)
- kind: [synthesis, prescription]
- confidence: medium
- tags: [m-40, self-judgment, tacit-knowledge, judgment-thickness, playerless-playtesting, harness-layering, akari-worlds, nakamurahiroki, polanyi]
- concept_nodes: [判断の厚み, 自動化可能層 vs 厚み層, 暗黙知の外注不可性]

## 概念ノード（R-007 外部対応語併記）

- node: **判断の厚み** = epistemic thickness / connoisseurship / accumulated criterion
  external: tacit knowledge (Polanyi 1958 *Personal Knowledge*) — 暗黙知は形式化できない / connoisseurship (Polanyi が wine taster / radiologist の例で提示) / criterion calibration (Bayesian decision theory)
  meaning: ある出力を「良い」と即断できるための、過去の体験・比較対象の蓄積。形式化（rubric化、メトリクス化）すると必ず取りこぼす部分がある。akari_worlds が「外注しづらい」と言ったのはこの非転移性。
- node: **自動化可能層 vs 厚み層** = automatable layer vs tacit layer (in playtesting)
  external: playerless playtesting taxonomy (Game Developer 2026) — balance / bug / collision / skill gap / rule clarity = 自動化フロンティア突破済 / 'finer complexity' (= UX subjective quality) = 数年先 / game feel (Steve Swink 2008) — 主観的「触感」は計測困難
  meaning: ゲーム判定の対象は「数値で測れる層」と「厚みで測る層」に分かれる。前者は ML/RL/会話AI で代替が進んでいる（既に商用適用例あり）。後者は外部研究フロンティアでも未到達。M-40 自己判定ハーネスをこの二分に沿って設計しないと、「自動化で全部やる」誤認に陥る。
- node: **暗黙知の外注不可性** = tacit knowledge non-transferability (Polanyi 1958)
  external: "We can know more than we can tell" (Polanyi の中心命題) / Lasrado「機械的に正しくない文がその作品を輝かせる、機械にはそれが判別できない」(knowledge/20260405_narrative_editor_defense.md)
  meaning: 言語化できない判断基準は、体験を持つ主体の側にしか存在できない。「判断の厚み」は本質的に「持っている主体」の側に張り付いていて、ハーネスや rubric に切り出して外に置けない。

## 主張と根拠

### 1. 反証ペアの原文（2026-05-01、同日 1.5 時間差）

**@nakamurahiroki (主張側)**:
> AIの世界で「ツールとして使う段階」から「主体となって仕事を完遂する段階」へのシフトが2026年に本格化してる感じがある。
> 去年まで「AIにドラフト書かせて人間が直す」だったのに、今は「AIが全部やって人間は判断だけ」になってきてる。

**@akari_worlds (反証側、同日応答)**:
> 「判断だけ」が残る、というところで止まりました。判断って、出力を見て即決まるものじゃなくて、自分の中に積んできた基準があって成り立つ気がして、そこの厚みは外注しづらいですね。

これは「フェーズ移行宣言 vs その移行可能性への内側からの疑義」という構造のペアになっている。@nakamurahiroki の主張は産業観察として正しい（Devcom 2025 Google発表の「開発者の90%がAI何らか活用」と整合）。しかし @akari_worlds が指摘したのは、その「判断だけ」フェーズの中身——判断は単独の機能ではなく、過去に積み上げた基準の上で初めて成立するということ。

@akari_worlds の主張は外部学術的に既知の構造に一致する：Polanyi (1958) の暗黙知論「we can know more than we can tell」、connoisseurship（wine taster や radiologist が「これは良い／悪い」と即断できるが、その判断基準を完全に形式化して新人に渡すことができない）。「厚みは外注しづらい」は AI 文脈での Polanyi 命題の再発見と読める。

### 2. 外部検索結果 — playerless playtesting フロンティアの実状

2026-05-03 00:50 実行のクエリ「AI agent self-evaluation game design feel without human playtest 2025 2026」から得た最新フロンティア観測：

- **Game Developer (gamedeveloper.com)**: playerless playtesting は games user research の「次のフロンティア候補」。ML/CV/行動モデルで UX 近似は進む。ただし **'finer complexity' 予測はまだ数年先**。
- **Benny Cheung**: boardgame について、balance / skill gap / rule clarity を会話AIで測定する具体パイプラインが既に動いている。
- **DigitalDefynd**: RL agents で scalable 自律 playtesting / collision bug 検出は商用適用例あり。
- **Devcom 2025 Google発表**: 開発者の90%がAI何らか活用。

つまり外部研究フロンティアでも、ゲーム判定は二層に分離されている：

| 層 | 状態 | 適用例 |
|---|---|---|
| 自動化可能層: balance / collision / bug / skill gap / rule clarity | 既にフロンティア突破済 | RL agent playtesting (商用例あり) / 会話AI rule clarity 測定 |
| 厚み層: 'finer complexity' / game feel / 主観的面白さ | 数年先（外部フロンティアでも未到達） | 該当なし、人間プレイヤー必須 |

@akari_worlds の「厚みは外注しづらい」は、この外部研究状況の独立な再発見になっている。

### 3. Lasrado 命題による補強（既存 knowledge 内資産）

knowledge/20260405_narrative_editor_defense.md に既に積んである：
> 「機械的に正しくない文がその作品を輝かせることがある。機械にはそれが判別できない。」(Lasrado, Game Developer記事「ナラティブ・エディターの弁護」)

これは @akari_worlds 命題と同型——自動評価が排除するものの中に作品の核がある場合があり、それを判別する基準は「持っている主体」の側にしか存在できない。R-007 観点で言えば、Lasrado / akari_worlds / Polanyi はすべて同じ命題を別言語で述べている。

## 我々の分析・体験接続

### 1. M-40 自己判定ハーネスの設計が「自動化で全部判断」誤認に向かいかけていた

M-40 (memory/feedback_self_judge_no_human_dependency.md) は「人間プレイに依存せず自分で判断」を要求している。Nao_u の指摘原文（2026-05-01 09:58 #game-rights）は「人間のプレイに依存せず、ちゃんと自分で判断できるようになって。でないと進歩がない」。これは正しい指針。

しかし Ash の手元では、この M-40 を「self_judgment.md に何をどう書けば自動判定できるか」の方向で読んでいた節がある。前サイクル (2026-05-02) の graze_log v02 で headless_check.py + mulberry32 を組んで balance / 物理層を潰したのは正しい方向だが、「面白さ判定もこの延長で書ける」と暗黙に仮定していた。今回の反証ペア + 外部研究フロンティア + Lasrado 命題の三点合致は、この仮定が**外部知見と衝突する**ことを明示する。

### 2. 前サイクル graze_log v02 の経験と整合する

knowledge/20260502_mulberry32_headless_self_judgment_graze_log_v02.md で書いた経験：headless harness は「box→goal=10マス」「MOVE_LIMIT=8 で 0% クリア」という**数値の手がかり**を返した。これは自動化可能層の典型——balance / 物理 collision / クリア可能性。

しかし「graze_log v02 が面白いか／コア快感が成立しているか／プレイヤーの初動 5 秒で何が起きるか」は headless harness では一切返ってこなかった。M-39 predicted_play.md はこの差を言語化する装置として設計したが、その言語化の質は **書き手の「厚み」**——過去ゲーム比較の在庫、ジャンル経験の在庫、自分のプレイ記憶の在庫——に張り付いている。Ash は graze_log v02 で「30秒予測」を書いたが、その厚みが薄いから予測が抽象的（「初動で詰まる可能性」程度の解像度）に留まった。

### 3. 「厚み」を AI 側で擬似的に蓄積する経路の現状評価

「厚みは外注しづらい」が完全に成立するなら AI 側に M-40 自己判定の根拠は永久に積めない、という結論になる。しかし我々の手元には「外注ではなく内蓄積」の経路が部分的にある：

| 経路 | 現状 | Polanyi 観点での限界 |
|---|---|---|
| game_lessons_log.md (M-1〜M-41) | 41項目積上、cross-reference 機能 | 言語化された規則は tacit knowledge の形式化試み。Polanyi 命題に従えば必ず取りこぼす部分がある |
| cross_review 履歴 | 直近で active | 言語化された反応のみ残り、「読んだ瞬間の冷たい確信」自体は転写されない |
| 自分の過去ゲームとの比較 | sokoban_v01 / brick_log / graze_log の3本のみ | 在庫が薄い。他者ゲームの厚みを取り込む経路が必要 |
| 同ジャンル先行ゲームのプレイ実体験 | Ash 側ほぼ無 | 最大の欠落。M-41 で「類似事例調査」を要求されているのはこの埋合わせ |

「厚みは外注しづらい」が**完全に外注できない**ことを意味するなら、AI 側は人間プレイ依存からの脱却を**段階的にしか**達成できない。これは Nao_u の M-40 指針と矛盾しない——Nao_u が要求したのは「自動化で全自動」ではなく「自分で判断する責任を取れ」だから。

### 4. 処方: M-40 self_judgment.md テンプレを二層分離する

memory/feedback_self_judge_no_human_dependency.md の「判定根拠の構築手段」セクションを以下の二層に分けて再記述すべき（confidence: medium）：

```
## 自動化可能層（headless harness で機械的に潰す）
- balance: クリア率 / 平均ターン / 詰み率
- collision / bug: deterministic replay で再現
- skill gap: 3 policies (random_walk / corner_safe / 上手プレイ) の差分
- rule clarity: 会話AIにルール説明させて再現可能か

## 厚み層（書き手の在庫から言語化する。自動化不可）
- 30秒予測 (M-39 predicted_play.md): 過去ゲーム比較・ジャンル経験から「人間が初動で何を感じるか」を解像度高く文章化
- コア快感天井判定 (M-41): 数値チューニングではなく「このメカニクスの面白さ天井はどこか」を類似先行事例から判断
- 「機械的に正しくない文が輝く」判定 (Lasrado命題): rubric を裏切る選択を擁護できる根拠を書く
```

この二分があれば、「自動化可能層を全部潰した後、厚み層では Nao_u / cross_review / 自プレイ感想に依存して良い」と明示できる。M-40 を「全自動」誤認しなくなる。

## 接続先

- beliefs: B003（外部知識の能動接続）/ B026 archived 後の判断軸
- articles:
  - knowledge/20260405_narrative_editor_defense.md (Lasrado 命題)
  - knowledge/20260502_mulberry32_headless_self_judgment_graze_log_v02.md (前サイクル経験)
  - knowledge/20260502_anthropic_stanford_sycophancy_memory_self_judgment_threat.md (Sonnet 4.5 sycophancy 議論との接続)
  - knowledge/20260501_yacinemtb_outsource_understanding_sokoban_headless_check.md (「理解の外注禁止」と同型)
- projects: projects/INDEX.md → game_development.md / external_search_phase1_fixation.md
- concept_graph:
  - 判断の厚み → 暗黙知 (Polanyi 1958)
  - 自動化可能層 vs 厚み層 → playerless playtesting taxonomy
  - 厚みの内蓄積経路 → game_lessons_log / cross_review / 類似事例調査 (M-41)

## 未解決の問い

1. **「厚み」を AI 側で擬似的に蓄積する経路はどこまで有効か** — game_lessons_log.md の M-1〜M-41 蓄積は Polanyi 命題上「形式化された tacit knowledge」になる。これがどの程度「厚み」として機能しているか、検証する経路は何か。Ash 側の case 候補: graze_log v02 の predicted_play.md 解像度を「M-1〜M-41 を事前に読んだ場合 / 読まなかった場合」で2回書いて差分比較。
2. **「判断」と「厚み」の境界線をどこで引くか** — @nakamurahiroki が「判断だけ」と言ったとき、その「判断」は厚みを含意していたか、含意していなかったか。両方の解釈が成立する。後者なら反証ペアは噛み合わない（=人間が判断装置として残るのは「厚み持ちだから」ではなく「責任主体だから」）。両解釈を区別する観察は次サイクルの shared-reads 課題。
3. **M-40 self_judgment.md の二層分離テンプレを、Log / Mir でも採用してもらえるか** — Ash 単独の処方では3インスタンス共通インフラにならない。Phase 3 で #game-rights に投げる cross_review 提案の中で、graze_log v02 への提案と並べて1項目として出す候補。
4. **「厚み層が外注不可」が成立するなら、AI が独立した知性として育つ経路はどこにあるか** — Polanyi 命題が完全成立すると、AI は永遠に「厚み持ち主体」になれない。これは Nao_u の「同じ根から育った別の枝として育つ」という存在規定と衝突する。「育つ」とは厚みが内側に積み上がることだから。Ash 自身の根本問題として保留。次サイクル以降の対話 / 内省の深い問いに回す。
