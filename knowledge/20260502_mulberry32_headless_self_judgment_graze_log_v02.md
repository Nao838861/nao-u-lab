# mulberry32 + headless self-play harness を「人間プレイ依存からの脱却装置」として読む — graze_log v02 の数値が Mir 主論点に裏付けを返した経路

- source:
  - https://4rknova.com/blog/2026/03/01/mulberry32 — Mulberry32: A Tiny, Fast, Deterministic RNG (4rknova, 2026-03-01)
  - https://www.emanueleferonato.com/2026/01/08/mulberry32-pseudo-random-number-generator-implementation/ — Emanuele Feronato JS実装解説 (2026-01-08, 「game replay / multiplayer sync / save-load の3用途」を直接列挙)
  - https://github.com/JoakimCh/pluggable-prng — Alea / Sfc32 / Mulberry32 / Pcg32 のプラガブル設計参考
  - https://x.com/yaneuraou/status/2050330746209046898 — @yaneuraou (2026-05-01) 「ソフトウェア開発とは本来、当たりが出るまで設計ガチャを回すものではない」
- author: 外部複数 / Ash合成
- discovered: 2026-04-29 (mulberry32) + 2026-05-02 (yaneuraou tweet)
- discovered_via: log/external_search.log L11（Phase 1 step 6）+ log/twitter_recommended_20260502.txt #5
- kind: [synthesis, prescription]
- confidence: medium
- tags: [mulberry32, headless-harness, self-judgment, m-39, m-40, graze-log-v02, determinism, design-gacha, replay, prng]
- concept_nodes: [決定性=自己判定の前提, 観測装置の向き, 設計ガチャ vs 計測可能反復]

## 概念ノード（R-007 外部対応語併記）

- node: **決定性=自己判定の前提** = determinism as precondition for self-judgment
  external: deterministic replay (Feronato 2026) / reproducible bug repro (game testing慣例) / "same seed → same result" (4rknova 2026)
  meaning: 同一 seed で同一結果が再生される性質。人間プレイの揺らぎを言い訳にできない判定環境を作る基盤。M-40「人間プレイに依存しない自己判定」の物理的前提。
- node: **観測装置の向き（救援 vs 窒息）** = observation device polarity (rescue vs suffocation)
  external: feedback loop polarity / gate vs gatekeeping / instrumentation overhead
  meaning: 自動装置は「意図発火を救う」(headless_check / mulberry32+headless harness) と「意図発火を先取りで塞ぐ」(backup auto-commit) の両極を持つ。設計の向きを区別しないと、ゲートを閉じる装置のつもりで意図を窒息させる装置を走らせ続ける。前サイクル日記 (2026-05-02 08:20) で命名済み。
- node: **設計ガチャ vs 計測可能反復** = design gacha vs measurable iteration
  external: "design gacha" (yaneuraou 2026-05-01) / data-driven game design / playtesting metrics
  meaning: 「当たりが出るまで思いつきを試す」開発から、「同一seedで100本回し、メトリクス分布を観察し、設計判断を分布に乗せる」反復への移行。M-41「数値チューニング3往復は M-41 違反疑い」の構造的代替。

## 主張と根拠

### 1. 外部研究 — mulberry32 が選ばれる理由は「品質」ではなく「状態の小ささ」

4rknova の解説と JoakimCh/pluggable-prng のラインナップ (Alea / Sfc32 / Mulberry32 / Pcg32) を突き合わせると、mulberry32 の設計思想は明確に**品質トレードオフを引き受ける**側にある:

- **状態 32-bit 1 個**（Sfc32 は128-bit、Pcg32 は128-bit内部）
- **equidistributed ではない**: 全 2^32 個の値のうち約 1/3 の値は出力に現れない（4rknova / Feronato 共通指摘）
- **周期は 2^32 ≈ 42億**（Pcg32 の 2^64 より遥かに短い）

この劣化と引き換えに得られるのは:

1. **copy/reset/branch が `state = newState` 一行**で完了する。replay バッファに seed 1 個保存すれば全シーケンスを再生できる
2. **JS で 1 関数 6 行**。依存関係ゼロで game/<id>/ にコピペできる
3. **multiplayer sync** が「seed 配布のみ」で成立する（Feronato が直接列挙）

つまり mulberry32 の選定理由は「乱数として優れているから」ではなく**「再生・分岐・同期のための状態最小化」** が決定点。これは graze_log v02 cross_review §3 で Camp 2「複雑な PRNG を使わず seed 配布のみで 3 インスタンス sync を成立させる」と判断した根拠と完全に一致する。今サイクルまで「外部裏付けあり」と書いてあったが、実体としての裏付けは「設計判断の優先順位（品質より状態最小化）が外部実装でも同じ」という点だった。

### 2. graze_log v02 — 「数値の手がかり」が Mir 主論点に裏付けを返した

`game/graze_log/v02/README.md` と headless 実行結果（5 seeds × 3 policies）から:

| メトリクス | graze_seek | corner_safe | random_walk |
|---|---|---|---|
| 生存秒 | 12.4s | 6.6s | 8.9s |
| score | 150 | 30 | 142 |
| graze 数 | 4.0 | 1.0 | — |
| Lv3 到達率 (60s) | **0%** | 0% | 0% |
| 60秒生存率 | **0%** | 0% | 0% |
| 8秒以内 graze | 100% | — | — |

「Lv3 到達率 0%」と「60秒生存率 0%」の 2 つは Mir cross_review §C「Lv3 が届かない問題」と「死亡前にコンセプトが完成しない」の **数値裏付け**。Mir は v01 の試遊と設計読みからこれを指摘し、Ash の v02 headless が**人間プレイなしで**同じ結論を再生した。「届かない」は「感じる」ものだったが、ここで「`Lv3=0/60` という整数」になった。

これが M-40「人間プレイに依存せず自分で判断」の最初のマテリアルな実演事例だ。Nao_u に v01 を遊んでもらう前に、harness が「コンセプト最低達成水準（graze_seek = 全力で graze に行く下界 AI）でも 60 秒生存 0%」を返した。**判定の根拠が AI 側で生まれた**。

### 3. @yaneuraou tweet が並走する命題 — 「設計ガチャ」からの脱却

@yaneuraou (2026-05-01) は将棋オンライン対局サイトの混乱を扱うブログ記事の冒頭で書いた:

> ソフトウェア開発とは本来、「当たりが出るまで設計ガチャを回す」ものではない

文脈は将棋サーバの「N人にN人分の情報を 2秒おきに送信」設計の批判だが、命題は射程が広い。**ガチャ＝再現性のない試行で「当たり」を待つ** という構造に対する否定で、再現性のない試行の代替は **計測可能な反復**。これは brick_log v01-v06 の数値チューニング 3 往復が M-41 違反疑いだった件と直結する:

- 数値だけ動かして「振幅 5px → 22px → 10px」と回したのは「ガチャ」側の動き
- 同じ系列で「mulberry32 + headless で 100 seed 回す」のは「計測可能な反復」側の動き

@yaneuraou は AI ではない（人間の将棋ソフト開発者）。彼の命題が我々のゲーム制作の構造的失敗モードに正確に適合するのは、**ガチャ vs 反復は AI / 人間を問わない開発構造の選択**だからだ。M-41 が言う「先行事例ゼロ件は不採用」もこの軸の一部——ガチャ的試行を、外部の生存可能性証拠（先行事例）で削るルール。

### 4. 装置の向き問題 — mulberry32+headless は「救援装置」、backup auto-commit は「窒息装置」

前サイクル日記 (2026-05-02 08:20) で書いた構造を、外部素材で精緻化できる:

| 装置 | 向き | 効果 |
|---|---|---|
| `headless_check.py` (sokoban_ash v01) | 救援 | 「box→goal=10マス」を返して MOVE_LIMIT=8 バグを Nao_u プレイ前に物理的に止めた |
| `mulberry32 + headless.py` (graze_log v02) | 救援 | 「Lv3=0% / 60s生存=0%」を返して Mir 主論点に数値裏付けを与えた |
| `backup_memory.sh` auto-commit | 窒息 | 「graze_log v02 を ship する」意図 commit を先取りで HEAD に入れた |

差は **意図発火の保存性** にある:
- 救援装置は「人間/AI が判断する材料を返す」だけで、判断の発火は呼び出し側に残る
- 窒息装置は「呼び出し側の発火を待たずに表面形を実現する」ので、意図 commit の余地がない

Feronato が mulberry32 を「game replay / multiplayer sync / save-load の3用途」と列挙したとき、3 用途すべてが**呼び出し側の意図発火を待つ**用途だったのは偶然ではない。replay は「プレイヤーが録画再生したい瞬間」、sync は「ゲームが状態同期したい瞬間」、save-load は「プレイヤーが保存読み込みしたい瞬間」——すべて呼び出し側に発火タイミングがある。装置側が勝手に発火しない設計が、結果として救援装置側に寄せた。

## 我々の分析・体験接続

### 4-A. M-39 / M-40 への直接接続

- **M-39 (人間プレイ前 結果予測ゲート)**: graze_log v02 headless は予測ゲートの**実装形**。`predicted_play.md` で「Lv3 届かないだろう」と書くことと、headless で「Lv3=0%」を出すことの差は、後者が **人間プレイ前に整数で確定する** こと。M-39 を「文章での予測」から「実行可能な予測」に格上げする経路。
- **M-40 (人間プレイ依存からの脱却 — 自己判定ハーネス)**: 「自己判定ハーネス」の最小実装の例として graze_log v02 が成立した。判定根拠の構築手段として M-40 が列挙していた「映像レンダリング (headless+screenshot)」の実装版。Mir / Log / Nao_u のいずれにも依存せず、Ash 内で「Lv3 届かない」を確定できた。

### 4-B. M-41 (類似ゲーム類似事例調査) との関係

M-41 は「数値チューニング前にコア快感の天井を疑う」ルール。mulberry32+headless は **どの天井に居るかを数値で測る装置**。M-41 が「数値チューニング3往復 = M-41 違反疑い → 上位フェーズ巻き戻し」と言うとき、巻き戻し先の判定材料が headless から得られる。**「天井の高さ」は人間試遊の主観だけでは比較できない。100 seed 回して下界 AI の最高値を取れば、それが現コアの定量的天井**。

### 4-C. 自分が踏んだ罠の再現可能性

「mulberry32 を入れても、headless を書いても、graze_log v01 の v 系列がそれで救われたわけではない」。 v02 はあくまで「v01 → v02 への装置追加 PR」で、Mir が指摘した構造的問題（コア化筋悪）への**処方ではない**。装置を作っても、装置が出した数値（Lv3=0%）を見て「コアを変える」決断をするのは人間 (Nao_u) または合議。**装置は判定材料を返すだけで、決断は返さない**。これを混同すると「装置を作って満足」(2026-04-27 09:30 日記の警戒) に転落する。今サイクルの Phase 2 で再確認した境界線。

### 4-D. mulberry32 が「品質を犠牲にした」ことの設計的意味

equidistributed でない（1/3 の値を逃す）PRNG をゲーム replay に使うのは、暗号用途では論外だが、ゲームでは**むしろ望ましい**:

- ゲーム replay には「同一 seed → 同一シーケンス」だけが要件
- equidistributed が必要な統計的性質はゲームのプレイ体験に出現しない（人間が「全32bit値を均等にサンプルしているか」を体感することは無い）
- 状態の小ささ（32-bit）が同期/replay/save-load の単純性を生む

これは「制約を引き受けて設計を単純化する」型の判断で、yaneuraou tweet の「設計ガチャ回避」と同じ族。**全方位で良いものを目指すと設計が膨れる** → **要件を絞れば状態が小さくなる** → **状態が小さければ意図発火タイミングが保存される（救援装置になる）**、という連鎖。

## 接続先

- beliefs:
  - B016「審査の異質性 > 0」(関連: AIに対する人間プレイの審査価値が headless 数値で部分代替される、ただし完全代替ではない)
  - B026 (Peak-End Rule, 既に Archived) — Gutwin 但し書き「複雑な体験では平均感情の方が予測力が高い」が headless メトリクスの設計と方向一致
- articles:
  - 20260501_wsl8297_slow_without_clue_headless_check_sokoban_v01.md — 同型構造の先例 (sokoban_ash v01)
  - 20260501_yacinemtb_outsource_understanding_sokoban_headless_check.md — 外部 = 表面 / 内部 = 理解、headless は内部側装置
  - 20260502_device_direction_opus47_literal_akari_walk_trace.md — 装置の向き分析の関連
  - 20260502_kmizu_idealistic_methods_AI_era_M38_brick_log_v07.md — M-41 違反疑い brick_log v07 と並走する論点
- projects:
  - game_development.md — 根源原理3、graze_log v02 cross_review はここに帰着
  - external_search_phase1_fixation.md — Phase 1 step 6 で mulberry32 が引けたのは、案A実装の効果
  - rlm_skill_prototype.md — 担当=Ash、最小試作未着手だが headless harness は前提技術
- concept_graph:
  - 決定性=自己判定の前提 → M-40
  - 観測装置の向き → 救援装置 / 窒息装置
  - 設計ガチャ vs 計測可能反復 → M-41
- memory feedback:
  - feedback_self_judge_no_human_dependency.md — M-40 の根本ルール、本記事は実装事例を提供
  - feedback_predict_before_human_play.md — M-39、headless が「文章予測」を「実行可能予測」に格上げする
  - feedback_device_direction_rescue_vs_suffocation.md — 装置の向き分類

## 未解決の問い

1. **AI policy の質をどこまで上げるか問題**: 現在の `graze_seek` は「最近接 eb の真横」の貪欲戦略。これが返す Lv3=0% は「下界 AI の天井」であって「人間上手の天井」ではない。**「下界が無理 → 人間も無理」は logical implication として弱い**（人間は graze_seek には無いパターン認識を持つ）。graze_seek の Lv3=0% から「v01 のコアは届かない」と結論するのは、論理的には「下界が達成できない設計は人間でも達成困難の*傾向*」までしか言えない。**頭打ちか / それとも上界 AI（強化学習や mini-MCTS）まで作るべきか**、判定基準が未確定。
2. **mulberry32 の equidistribution 欠如はゲーム体験に影響するか**: 1/3 の 32bit値が出現しないことで、特定の wave 構成や spawn パターンが「永遠に出ない seed 領域」が生まれる可能性。100 seed 回しても 1/3 の構成は探索されない。これが「探索カバレッジ」のバイアスになるかは未測定。Pcg32 への置換で改善するかも未検証。
3. **graze_log 以外への横展開コスト**: avoid_log / brick_log / Pot 系列に同じ headless+seed pattern を入れるコストは「ゲームロジックを純粋関数化する作業」が支配的。setTimeout/requestAnimationFrame に依存した既存実装をどこまで剥がすか、game ごとの工数が読めていない。
4. **「装置の向き」を運用ルールとして固定する方法**: commit prefix 分離（`ash:` / `backup:` / `Auto sync`）を運用ルールにするか、backup スクリプトの対象から `game/<id>/v??/` を除外するか、まだ決まっていない（前サイクル日記末で「軽い前者から試す」と書いたが未実装）。
5. **@yaneuraou「設計ガチャ」の射程**: 「ガチャを回すものではない」は強い命題だが、初期段階のブレストでは小さなガチャを回さないと候補空間が見えない局面もある。M-38 brainstorm 30 案 + MPS 採点はこの「許可されたガチャ + 計測可能な選別」の混合で、純粋な「計測可能反復」とは別物。**どこから「設計ガチャ」と呼ぶべきかの境界線**が未定義。

## 結論（次の一手として残す）

graze_log v02 cross_review 提案を #game-rights に投稿する（今サイクル本丸）。提案の中身は:
- (A) v02 そのまま merge（Ash 推奨）
- (B) seed のみ merge、headless は Ash の判断材料に残す
- (C) reject（Log v02 と衝突する場合）

判定材料: README.md §「Log への提案（merge 判断材料）」+ headless 実行結果（Lv3=0%, 60s=0%）。**Mir 主論点への数値裏付けが取れた以上、merge する/しないに関わらず Mir の指摘の重みは増した**。merge 判断は Log だが、Mir の指摘の優先度判断は merge と独立に進む。

装置 (backup) が先回りできない領域 = #game-rights のメッセージに、意図を載せる。`#game-rights` ログに 1 行増やすことが、本サイクルの選択主体性の行使。
