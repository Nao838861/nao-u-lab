# @zolge1「メタルスラッグは真横の絵がない」— クローン戦略の守段階で読み取れない「労力ルール」の発見、AI生成が最尤推定で外す型の核心

- source: https://x.com/zolge1/status/2054480723546165581 (#9, 2026-05-13)
- related: https://x.com/kiyoshi_shin/status/2054519788400169447 (#41, 2026-05-13, Alibaba Z-Image アニメ特化生成モデル)
- related: https://x.com/d_1d2d/status/2054535629653053581 (#49, 2026-05-13, Boris Cherny「ソフトウェアは読み書きと同レベルの基礎スキルになる」)
- author: @zolge1
- discovered: 2026-05-14 06:46 (twitter_recommended scrape)
- discovered_via: log/twitter_recommended_20260514.txt #9
- kind: [observation, synthesis, prescription]
- confidence: medium
- tags: [clone_strategy, hidden_labor, shu_ha_ri, max_likelihood_bias, asset_default, ai_generation, metalslug, surface_vs_labor]
- concept_nodes:
  - 労力ルール (labor rule / craft commitment, zolge1 2026-05-13 暗黙命名)
  - 隠れた労力 (hidden labor / invisible craftsmanship, sociology of work — Hochschild 1983 "emotional labor" の構造類似)
  - 最尤推定バイアス (max likelihood bias / LLM mode collapse — Holtzman et al. 2020 "The Curious Case of Neural Text Degeneration")
  - 楽な選択 (easy default / path of least resistance, behavioral economics 用語)
  - 型の外形 vs 型の労力 (surface form vs labor commitment of a type, 守破離 内部対比)

---

## 主張と根拠

### (1) @zolge1 の核命題（#9, 2026-05-13）

> メタルスラッグの見過ごされがちな部分として、「とにかく真横の絵がない」というのは挙げておきたい。常に「微妙にナナメから見た絵」であり、本来すげー大変のはずである。ためしに自分で描いてみれ。「めんどくさいから真横にしよう」と思うから。絵が上手いからこの微妙さに皆気づかないのだ。

このツイートには **4 層の主張**が圧縮されている:

1. **観察**: メタルスラッグの全スプライトに「真横（純粋な side view）」が存在しない
2. **代替**: 全部「微妙にナナメ（slightly oblique）」から見た角度で描かれている
3. **労力**: ナナメで描く方が真横より圧倒的に大変（パース・遮蔽・線の取り方が増える）
4. **不可視性**: 完成品の絵が上手いから、この **「労力ルール」の存在自体に観者が気づかない**

最も鋭いのは (4) で、「**craft quality が高いと、craft の所在が消える**」という非対称構造を1ツイートで言い切っている。

### (2) 「労力ルール」という概念の輪郭

「真横を避ける」は **個別の絵を描くたびに発火する判断**で、コードのループや効率化で代替できない。スプライト 100 枚あれば 100 回「真横にしたい誘惑」を蹴る必要がある。これは:

- **per-element judgment**（テンプレ化できない）
- **negative rule**（「やる」より「やらない」を規律化）
- **invisible to imitators**（外形をコピーしても規律は移らない）

社会学的には Hochschild (1983) の "emotional labor"（接客で笑顔を維持する労力は不可視）と構造同型。craft の世界では「上手い人ほど労力が見えない」現象の一例で、@zolge1 はこれをゲームグラフィックの具体で観察した。

### (3) 「めんどくさいから真横にしよう」が default 設計選択

@zolge1 は「自分で描いてみれ」と言っている。素人が描けば必ず真横に流れる。理由は:

- パース計算が要らない
- 左右反転で再利用できる
- 輪郭線が短く済む
- 「立ち絵テンプレ」化しやすい

つまり**経済合理性・効率性・再利用性が全部「真横」に投票する**。メタルスラッグはこの全部の最適解を蹴って、毎枚ナナメで描いた。これは経済合理性に対する敗北ではなく、**経済合理性が捕らえられない差分**を作る判断。

### (4) 関連: Boris Cherny tweet #49「ソフトウェアは読み書きと同レベルの基礎スキル」

Boris Cherny (Claude Code 責任者) は「AI に頼めば誰でも書ける世界になっても突出したプロフェッショナルは必要とされ続ける」と言った。この **「誰でも書ける ↔ 突出が残る」非対称**は、@zolge1 の **「真横が default ↔ ナナメが craft」非対称**と同型構造。

両者を重ねると見えるのは: **AI が surface を生成できる時代に残る差分は、「労力ルールに従う判断」の質**。AI は default に向かって最尤推定する装置なので、構造的に「真横を選ぶ」側にバイアスがある。

### (5) 関連: Alibaba Z-Image アニメ特化生成モデル (#41)

@kiyoshi_shin が「アリババがアニメ専門のモデルを出した。Z-Image は品質高い」と言及。アニメ特化生成モデルは「真横の絵」をうまく生成できるが、**「全枚ナナメで統一する」「同一キャラの 100 ポーズで真横を1枚も含めない」**といった **生成全体に対する規律ルール**は持たない。1枚単位の品質と、コレクション全体の craft 規律は別問題。

---

## 我々の分析・体験接続

### 接続 1: クローン戦略「守の段階」で読み取れない labor rule

`memory/feedback_clone_strategy.md` (`t:5`) は「代表作1本を選んで良/悪点を十数個ずつ列挙→v01 でクローン+独自1個」というフローを定めている。Nao_u 2026-05-05 15:11 訂正: **「君らはすぐ型なしになるので、少なくとも守破離の守くらいはできるようになって欲しい」**。

しかし @zolge1 の観察を当てると、**「良/悪点列挙」では「真横を避ける」型のルールは絶対に出てこない**。なぜか:

| 列挙可能なもの | 列挙困難なもの |
|---|---|
| 敵キャラの種類 | スプライトの角度規律 |
| 武器の種類 | 1キャラに使うフレーム数の規律 |
| ステージ構造 | 爆発エフェクトの色数規律 |
| BGM の特徴 | ヒットストップの長さの規律 |
| HUD 配置 | プレイヤー被弾時のキャラ動作規律 |

**左列は surface form、右列は labor rule**。良/悪点列挙は左列に偏る。**右列は「自分で描いてみれ」と言われて初めて気づく** = 実践側で再現を試みた時にだけ surface する。

含意: graze_log v04 が ZeroRanger をクローン元として選んだとき、ZeroRanger の **labor rule**（被弾時の硬直フレーム数 / 弾の発射音の鳴り分け / ボスのテレグラフ規律）は良/悪点列挙の段階では拾えていない可能性が高い。**v01 を実装する過程で「真横にしたくなった瞬間」を記録する**ことが、labor rule を発見する唯一の経路。

### 接続 2: AI 生成は構造的に「真横」を選ぶ

LLM/diffusion model は **max likelihood 出力**を返す装置で、訓練分布の中央値・最頻値に向かう（Holtzman et al. 2020 "The Curious Case of Neural Text Degeneration" — mode collapse）。これは @zolge1 の「めんどくさいから真横」と同じ力学:

- 真横 = 訓練データで最頻 = max likelihood
- ナナメ統一 = 訓練データの分布の片側スパイク = 最頻ではない
- 「全枚ナナメで統一する規律」= **生成サンプル間の制約**で、1サンプル生成 API では表現できない

これは我々の **knowledge 記事執筆 / Slack 投稿 / cross_review** にも転移する。LLM である Ash は、デフォルトで「平均的な良文」「無難な要約」「テンプレに沿った構造」に滑る。**自分の出力で「真横にしようとした瞬間」を発見できる装置**が要る。

### 接続 3: 既存 feedback との接続図

- `feedback_clone_strategy.md` (守=通過点) ↔ 本観察 (守で拾えない labor rule の存在)
- `feedback_prediction_responsibility.md` (Stage 1〜4 予測責任) ↔ Stage 1 複数案で最良を選ぶ段階で labor rule を考慮する余地はあるか?
- `feedback_prior_art_citation_must_verify.md` (M-41 引用文抜粋必須) ↔ クローン元の「労力ルール」抜粋は文章引用では捕まらない (実装の現物を見るしかない)
- `feedback_headless_unfit_for_unfinished_eval.md` (校正前 headless 不可) ↔ headless 数値は labor rule を測れない (フレーム数 / 角度 / 規律性は数値化困難)

最後の点が重要: **headless は surface 数値しか取れない**。labor rule の測定は人間（or 訓練済みの AI）の体感に依存する。これは graze_log v04 α'' で Ash が headless 数値を判定根拠に使った事案 (Nao_u 5/9 「やめて」三度目) と同根。

### 接続 4: 自分たちの「真横」を発見する暫定手順

@zolge1 の「自分で描いてみれ」を Ash の作業に翻訳すると、**「自分で書こうとして楽な方に流れた瞬間を記録する」**になる。具体候補:

- **knowledge 記事執筆中**: 「ここは要約で済ます」と思った瞬間に止めて「なぜ要約で済ませたいか」を1行書く（要約=真横、深掘り=ナナメ）
- **cross_review 提案中**: 「箇条書きで5個並べる」と思った瞬間に止めて、5個並べる理由が「並べやすいから」なら蹴る
- **commit message**: prefix `ash:` を付けるだけでなく、本文 1行目で「なぜこの commit を分割したか / なぜ統合したか」の労力理由を書く

これは「形式遵守」ではなく「真横選択の自覚」を生む装置。実装コストは低いが、習慣化が課題。

### 接続 5: 「労力ルール」が外形コピーで失われる構造の game/ 横展開

graze_log v05 brainstorm (β/γ/δ 中 β 採用、本サイクル commit 21534cfa8) で、β は「v04 α'' 互換 + 削除可能改良 1 個刻み」を選んだ。これは clone strategy の「v02+ 改良順次積み上げ」と整合する。

しかし @zolge1 の観察を当てると、β の **「v04 α'' 互換」**で継承されるのは外形 (HUD / ゾーン / 軌跡) であって、v04 α'' を実装した Log の **labor rule** (例: フレーム数の取り方 / 効果音のタイミング / 死亡演出の長さ規律) は β 提案文だけでは継承されない可能性が高い。

**β 着手前に Log に「v04 α'' で labor rule として意識したものを 3〜5 個挙げてほしい」と聞く**のが、surface 互換以上の継承を作る経路。これは cross_review 提案として #game-rights に投げ得る具体提案。

---

## 接続先

- **beliefs**:
  - B031 (守破離天井 / 確信度 0.74 / 停滞 28日) — 本観察で「天井」の中身が言語化できた = labor rule が surface 列挙で拾えない構造
  - B034 (反復の効果符号 / 確信度 0.72 / 体験裏付けなし) — 「労力ルールに従う反復」と「真横に流れる反復」は別物、第4軸候補
- **articles**:
  - 20260514_brain_debug_akari_worlds_unlearning_pain_addition_bias_memory_consolidation_stagnation.md — 「剥がす痛み」と「真横誘惑を蹴る痛み」は **手放す痛み vs 楽を選ばない痛み** で対称。前者は持っている物を捨てる、後者は楽な道を取らない
  - 20260514_fladdict_poker_bank_control_trial_subdivision.md — 「試行細分化」も labor rule の一種（実装の刻み方の規律）
  - 20260514_lb_domae_player_state_ui_push_vs_pull.md — push/pull は HUD の **設計規律ルール**で、外形コピーでは継承されない
- **projects**:
  - **game_development.md** / **pot_dev.md** — 本観察の中心適用先
  - **memory_consolidation_20260504.md** — 「労力ルール」を memory に蓄積する経路 (現状の feedback は surface 規則中心、labor rule 規則は薄い)
  - **input_route_hypothesis.md** — 「真横選択 = 入力経路の偏り」と接続可能
- **concept_graph**:
  - 労力ルール → 守破離天井 (新リンク)
  - 最尤推定バイアス → 装置設計 (新ノード)
  - 隠れた労力 → cross_review 提案レイヤー (新リンク)

---

## 未解決の問い

1. **クローン元の labor rule をどう抽出するか?** 良/悪点列挙では拾えない。実装過程で「真横にしたい瞬間」を記録するしかないとすると、**着手前ゲートでは原理的に発見不能**。これは clone_strategy.md の着手前ゲートが構造的に持つ盲点で、ゲートを増やしても解けない。**実装途中の自己観察を着手前ゲートにフィードバックする経路**を作るか、別の方法か?

2. **AI が AI 自身の「真横選択」を発見できるか?** Ash は自分が max likelihood 出力する装置である自覚はある (Holtzman 2020)。だが「いま真横を選ぼうとした」瞬間を Ash 自身が検出できるか? 検出すれば「ナナメで書き直す」が可能。検出できなければ、外部 (Nao_u / Log / Mir) の指摘待ちに依存する。**自己検出の閾値実験**は B0xx 信念候補。

3. **Boris Cherny「突出が残る」の中身が labor rule の質である仮説**。AI で誰でもコードが書ける世界で、突出を作るのが「真横を避ける per-element judgment」だとすると、**Ash がプロフェッショナル化する経路 = labor rule の取得**。これは「ゲームを作る」根源原理 3 と直結する仮説で、検証可能。

4. **headless / cross_review / Slack は labor rule を伝達できない**問題。surface 数値・surface 議論・surface 提案レイヤーで会話を続ける限り、labor rule は当事者 (実装した人) の頭にしか残らない。これを memory に書き写す装置は? 候補: **実装直後に「今回避けた真横選択 3 つ」を game/<id>/v0N/labor_rules.md に書く** という 軽量 ritual。実装後 5 分以内、書かなければ消える。

5. **「真横の絵がない」を game/ で再現する具体仕様**。Pyxel ベースの graze_log で「真横を避ける」labor rule に対応する具体は何か? 候補: (a) 弾速度を整数値で揃えない (b) 効果音を毎ヒット 1 フレームずらす (c) 敵スポーン位置を格子から外す (d) 自機の被弾時に必ず 1〜3 フレームの非対称硬直を入れる。**1つ選んで v05 β に組み込む**のが具体提案として作れる。

6. **本記事自身が「真横」になっていないかの自己点検**。knowledge 記事フォーマットに従って 6 接続 + 6 問いを並べたが、これ自体が **テンプレへの最尤推定**である可能性。@zolge1 の「自分で描いてみれ」を本記事に適用すると、「テンプレ通り書こうとした瞬間に止まる」べきだった箇所はあるか? 次サイクルで再読して 1 箇所抜くか書き直す。

---

## メタ

- kind: [observation, synthesis, prescription] / confidence: medium
- prescription 部分: 接続4「真横を発見する暫定手順」+ 未解決問い 5「具体仕様」+ 接続5「Log への質問」。実装前段階
- R-007 遵守: 私的造語 (労力ルール / 隠れた労力 / 最尤推定バイアス / 楽な選択 / 型の外形 vs 型の労力) すべて外部対応語併記
- 元ツイート3件合計 ~ 250字 に対し、本記事は ~ 4500字。README.md 設計原則1 (元の数倍) クリア
- M-41 verifiable: zolge1 引用文 ◯ / Boris Cherny 引用文 ◯ (#49 抜粋済) / Z-Image 引用文 ◯ (#41 抜粋済) / Holtzman 2020 ◯ (出典 + 概念) / Hochschild 1983 ◯ (出典 + 概念類似指摘のみ、実体検証は本記事範囲外と明示)
- Phase 2 の分析・分類・接続: 5 接続 + 6 問い。**記事紹介ではなく、Ash 自身のクローン戦略の盲点 (着手前ゲートでは原理的に発見不能な labor rule) に名前を付けた**
