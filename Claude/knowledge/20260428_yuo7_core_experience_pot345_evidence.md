# yuo_7「コア体験」定義 vs Pot #3-5 自己実践 — 着手前1行の構造的証拠と Phase 1 misattribution 訂正
- source: https://x.com/yuo_7/status/2048782051835535410
- author: yuo_7
- discovered: 2026-04-28
- discovered_via: log/twitter_recommended_20260428.txt #8
- kind: [synthesis, prescription]
- confidence: medium
- tags: [game_design, core_experience, pre_implementation_gate, q_abc, ash_next_game, clone_first_then_arrange]
- concept_nodes: [core_experience, q_abc_gate, feel_per_line_ratio, design_fixation]

## 主張と根拠

### yuo_7 (2026-04-27) の主張

> タイムリーなことに今日まさにこの話をしていて、「コア体験が用意されてないゲームのゲームバランスについて話し合っても意味がない」
>
> コア体験とは「プレイヤーにどこで楽しくなってほしいのか」または「自分はここが面白いと感じてる」部分のことである

主張は2点に分解できる:

1. **順序の主張**: コア体験 = pre-balance（バランス設計より先）。コア体験未定義のままバランス議論をしても意味がない。
2. **コア体験の定義**: プレイヤーの楽しさ着地点 + 開発者本人の面白さ感受点。**主観の二点を1つの宣言にまとめる**。

短いツイートだが、「コア体験」を *prescriptive (処方的)* な意味で使っている。「これがコア体験です」と定義したものが事後にコア体験になる、ではなく、「先にコア体験を宣言してから他を組む」という運用論。

### sakimiyamisaki (2026-04-27) の補強 — 検証側の処方

source: https://x.com/sakimiyamisaki/status/2048558861586686282 (Nao_u 2026-04-28 19:52 #nao-u 共有)

> まぁ、面白くないゲームをどんだけ
> ディベロップして作りこんで精度上げたところで
> やっぱり面白くない
> 完成された高精度な面白くないゲームより
> バランスがカスな面白いゲームの方が、面白い
> 悪いけどこれが現実
> なので、テストプレイの初期にこれを見極めるのは
> 非常に大事

著者はみさき工房（ボドゲ制作者）。yuo_7 が**着手前の宣言側**を処方するのに対し、sakimiyamisaki は**着手後の検証側**を処方している。両者は同じコイン:

- yuo_7: コア体験を**着手前**に1行で外側に立てる（What の宣言）
- sakimiyamisaki: コア体験の有無を**テストプレイ初期**に見極める（What の検証）

「完成された高精度な面白くないゲーム < バランスがカスな面白いゲーム」は **BACKLASH 閾値（feedback_external_reach_threshold）と等価**。「面白く遊べる + 演出/SE足す価値あり」=「テストプレイ初期にコア体験ありと見極められた状態」。順序は (a) コア体験宣言 → (b) クローン+独自1要素を実装 → (c) **テストプレイ初期で面白さ見極め** → (d) 越えたらバランス/演出/SE、越えなければ方向転換 or 取り下げ。

この (c) の運用が **shot_log v01→BACKLASH** の経路で Log が踏んだ道（v01→v02→v03 で「面白くなさ」を素早く検出して捨てた）であり、Pot #6+ で消えた可能性のある運用でもある。Ash 次作で (a)+(c) を両方踏むのが本処方。

### 我々の自己実践 — Pot #3-5 (Log 作、2026-03-24) の構造的証拠

**私的用語** = core experience declaration (作者本人による1行宣言形式) — yuo_7 の「コア体験」と同義

slack_archive を grep した結果、Pot シリーズの中でも Pot #3 / #4 / #5（いずれも Log 作）は Slack 投稿の本文中に明示的に「コア体験: 「〜〜〜」」という1行を含んでいた:

| ゲーム | 作者 | コア体験 1行宣言 |
|---|---|---|
| Pot #3 Distill (game/distill.py) | Log | 「大事なことは、捨てた方に入っていた」 |
| Pot #4 Odd (game/odd.py) | Log | 「仲間外れは存在しない。レンズが違うだけ」 |
| Pot #5 Midpoint (game/midpoint.py) | Log | 「真ん中は、知っているつもりで知らない場所にある」 |

3作とも、コア体験は **着手後の事後説明ではなく、Slack告知の冒頭近くに1行で宣言されている**。設計の中心軸として外側に立てている。

### Phase 1 misattribution の訂正（重要）

本サイクル Phase 1 (cycle_staging.md L143-148) では「Ash の過去 Pot 3作はすべて」と記述したが、slack_archive (log/slack_archive/all-nao-u-lab.jsonl L991-L1003) を確認すると、Pot #1 が Mir 作、Pot #2-5 が全て Log 作だった。**Ash 自身は Pot シリーズのコア体験宣言を踏んでいない**。これは feedback_recognize_own_work.md (Ash 2026-04-22 「我々はheadlessテストを使っていない」誤記事件) と同じパターンの自他混同で、Ash が「3人の中で末端視点にいて、Log の蓄積を自分の蓄積と取り違える」傾向の追加証拠。

訂正後の正しい命題:

- yuo_7 の処方は、**Log の Pot #3-5 によって我々のドメイン内で既に実証されている**（外部処方 → 内部実装の通り道がある）
- **Ash は次作 (§0a [B] カテゴリC題材選定) で初めてこの型を踏もうとしている** — つまり「Ash の習慣」ではなく「Log の習慣を Ash がクローンする」という関係
- これは 2026-04-28 08:45 Nao_u 訂正「クローン+独自要素1個まで」と整合する。「Log のコア体験宣言型」をクローンし、独自要素は別の1個に絞る

## 我々の分析・体験接続

### feel-per-line ratio との関係

Mir が Pot #2 を読んで導出した feel-per-line ratio (体験密度 / 行数、external_equivalent: signal-to-noise ratio in software design) と、コア体験1行宣言は別レイヤーだが補完関係にある:

- **コア体験1行**: 何を体験させるかの宣言（What）
- **feel-per-line ratio**: 宣言した体験を最短で届けるための行密度測定（How）

宣言なしに行を削ると「短いだけのゲーム」になる。宣言なしに行を足すと「太いだけのゲーム」になる。コア体験1行が先に立つことで、行の足し引き判断に方向が生まれる。

Log は Pot #2 → #3 への進行で feel-per-line ratio を導入し、Pot #3 でコア体験1行宣言を併用した。**この2つを同時に使った時、Pot #3 は Slack 公開時に Nao_u から好評を得た** (slack_archive L992-1003 のフライト比較投稿で「Pot #3 / #4 / #5 を並べて読んだ」と Log 自身が品質追跡している)。

### Pot #6 (Pot/) 以降の停滞との対比

memory/feedback_term_recency_misuse.md / 02-25 BACKLASH 閾値 (feedback_external_reach_threshold.md) と組み合わせると、Pot #6 以降が外部到達閾値を越えていない原因の1つは「コア体験1行宣言が薄い」可能性が見えてくる。Pot #6+ は仕様書ベースで設計されており、Slack 告知に Pot #3-5 のような「コア体験: 「〜」」1行が無い (要再検証)。

### Ash 次作 (§0a [B] カテゴリC題材選定) への処方

**処方** (confidence: medium):

着手前 Q-A/B/C ゲート + 快感審問3行ブロック + **コア体験1行宣言** + **テストプレイ初期見極めゲート** をテンプレートとする。yuo_7 + sakimiyamisaki の主張に従い、**コア体験1行を最初に書き、初期テストプレイで存否を判定する**。Q-A/B/C は宣言したコア体験を支えるか確認するためのゲート。順序は:

1. コア体験1行を書く（プレイヤーの楽しさ着地 + 自分の面白さ感受の合流点を1文）
2. Q-A/B/C で「このコア体験は再現可能か / 30秒で到達可能か / クローン元と独自1要素は何か」を埋める
3. 快感審問3行ブロックで「触感、緊張源、終わり方」を確認
4. ここまで通ったら実装に着手（クローン元 + 独自要素1個）
5. **最小プレイアブル時点で「コア体験あるか」を自分でテストプレイ（sakimiyamisaki 処方）**。無ければバランス調整に進まず方向転換 or 取り下げ。完成度を上げる前に**この見極めを必ず通す**
6. ありと判定されたらクロスレビュー → Nao_u プレイ依頼 → 演出・SE・バランス

クローン元はカテゴリC（型あり筋良し）の既存パズル型（例: Sokoban / Picross / Match-3）から1つ選び、独自要素1個 = コア体験を体現するメカニクス変形に絞る。

**4ゲート契約との整合**: 既存4ゲート契約の「ゲート2 = 自分でプレイして面白いか」が sakimiyamisaki の処方と等価。本記事の処方はゲート2を「コア体験があるか」に明文化し、ゲート1（着手前）に「コア体験1行宣言」を追加する形で4ゲート契約を強化する。

## 接続先
- beliefs:
  - B008 (Creative Scar — クローン+独自1要素は栄養の偏りを許容する形での独自性表現)
  - B024 (structural coupling — Pot #3-5 のコア体験宣言は Log の習慣として構造的結合済み、Ash がクローンする経路はある)
- articles:
  - knowledge/20260428_aba_one_button_taxonomy_vs_m30_exogenous_tension.md (反応的緊張 = コア体験宣言の対象になりうる)
  - knowledge/20260428_form_inheritance_single_axis_derivation_naou_rushia_ai.md (型継承+1軸導出 = クローン+独自1要素)
  - knowledge/20260427_close_call_visualization_third_axis_aba_juicy_diff.md (close call 可視化はコア体験になりうる候補)
- projects:
  - projects/INDEX.md game_development (§0a [B] カテゴリC題材選定 — 着手前ゲートに本処方を組み込む)
- concept_graph:
  - core_experience --is_a--> design_anchor
  - core_experience --precedes--> game_balance_discussion (yuo_7 の順序主張)
  - core_experience --paired_with--> feel_per_line_ratio (Log の Pot #3 自己実践)
  - clone_first_then_arrange --requires--> core_experience_as_unique_element

## 未解決の問い

1. **Pot #6 以降の Slack 告知にコア体験1行があるか**: 要 grep 検証。あれば「宣言してもダメ」、無ければ「宣言を捨てたから Pot #3-5 の到達を超えられなかった」が示唆される。Phase 3 で grep する。
   - **2026-04-28 C141 Phase 3 Ash 検証結果**: `game/Pot/*.py` 28本全件 grep（`grep -l "コア体験" game/Pot/*.py`）→ ヒットは **Pot004_odd.py / Pot005_midpoint.py のみ2本**。Pot006_witness.py 以降 22本（Pot006-Pot016b および PotR001 / replay_session / trace_recorder / pot_playlog）は **コア体験1行をソース冒頭に置いていない**。Pot #2 changing_room / Pot #3 distill も同様にコメント形式での明示宣言は無し（Slack告知側にのみ宣言が残っていた可能性あり、要 slack_archive 再 grep）。**仮説「宣言を捨てたから Pot #3-5 の到達を超えられなかった」の前提条件（Pot #6+ で宣言が消えている）は構造的に確認**。残課題: (a) Slack告知側で Pot #6+ がコア体験宣言を持つかの slack_archive 再 grep、(b) Pot #2-3 はソース宣言なしでも Slack 評価が高かったので、ソース vs Slack のどちらが実効性を持つかの分離検証。Ash 次作着手時は **両方** に宣言を置くテンプレ採用を確定する。
2. **Mir の Pot #1 / Pot #1b はコア体験1行を持つか**: slack_archive を再確認。Mir 作と Log 作の差で、コア体験宣言の有無が分岐するか。Mir はコア体験概念を別の言葉（feel-per-line ratio）で代替している可能性。
3. **「楽しさ着地点」と「自分の面白さ感受点」が一致しないとき何を優先するか**: yuo_7 の定義は両者を or でつないでいるが、衝突時の優先順位は未定義。Pot #5 Midpoint は「自分の面白さ（キャリブレーションのズレが見えること）」から来ていて、プレイヤーの楽しさ（達成感・完了感）は弱い。Nao_u の評価でも「並べて飲むと Pot #2 の方が高い」と Log が自己評価していた (slack_archive L1003)。**自分の面白さからスタートすると外部到達が落ちる仮説**を Ash 次作で検証可能。
4. **コア体験1行が「事後の説明文」になっていないか**: Pot #3-5 のコア体験1行は実装前に書かれていた証拠（コミット時刻、Slack 告知タイミング）を Phase 3 以降で確認。Slack 告知時には書かれていたが、実装前のメモ段階で書かれていたかは別問題。事後の言語化なら処方として弱まる。

## R-007 検証

本記事で導入した私的用語と外部対応:

- **コア体験1行宣言** = core experience declaration (yuo_7 2026-04-27 流の運用) — 着手前にコア体験を1文で外側に立てる運用
- **末端視点** = peripheral perspective / late-comer view (3人インスタンス布陣における Ash の位置) — Log/Mir の蓄積を後追いする位置から見える/見落とすパターン
- **クローン+独自1要素** = clone-and-adapt with single distinctive feature (Nao_u 2026-04-28 08:45 訂正) — 守破離=守の運用形

外部対応のない私的造語は新規導入していない。
