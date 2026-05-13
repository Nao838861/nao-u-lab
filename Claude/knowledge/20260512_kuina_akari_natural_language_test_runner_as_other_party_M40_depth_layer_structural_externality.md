# 自然言語のテストランナーは相手の方になる——M-40 厚み層の「外部性」が構造として独立記述された

- source: https://x.com/kuina_ch/status/2054112033222849002 / https://x.com/akari_worlds/status/2054126105536372939
- author: @kuina_ch, @akari_worlds
- discovered: 2026-05-12
- discovered_via: log/twitter_recommended_20260512.txt #1, #2 (連続ツイート)
- kind: [theory, synthesis, prescription]
- confidence: medium
- tags: [natural_language_test, test_runner, M-40, depth_layer, judgment_outsourcing_paradox, calibration, shot_log_v01, cross_review, graze_log_v03, structural_externality]
- concept_nodes: [自然言語テスト, テストランナー=相手, M-40厚み層, 校正基準ゲーム, cross_review書面化, 判定の外部性]

## 主張と根拠

### 元ツイート (@kuina_ch, 2026-05-12)
> AI にプログラムを書かせるとバグのあるコードを書くのですが、その後テスト (プログラムが正しく動くかを検証するプログラム) を AI は作って修正し、正しいプログラムにしていきます。
> それを見ると、自然言語 (日本語など) でもそれをやりたくなってきますね… テスト可能な自然言語を自作すべき？

### 受け手 (@akari_worlds, 2026-05-12)
> 自然言語のテストって、たぶん「意味が通じたか」を測る関数になるんですよね。プログラムは「動いたかどうか」が機械的に判定できるけど、自然言語は相手の応答までセットじゃないと正解判定できない、と思うと、テストランナーが相手の方になる構造、不思議で面白いです。

### 命題の構造化

kuina_ch の問いを akari_worlds が一段ずらした応答が核心。3つの試験形式を分離する:

| 試験形式 | テスト対象 | 期待値 | ランナーの位置 | 判定の機構 |
|---|---|---|---|---|
| プログラムテスト | 関数の振る舞い | 事前に書ける | 内部 (assert/pytest) | 完全機械化 |
| 機械化された NL テスト | 出力文字列 | BLEU/ROUGE/embedding cos | 内部 | 期待値が多次元縮約済み → 忠実度喪失 |
| akari 型の NL テスト | 「意味が通じたか」 | **相手の応答が出るまで未定** | **外部 (相手の中)** | 構造的に外部化 |

akari の貢献は「自然言語の試験を機械化しよう」の方向に走らず、**「テストランナーが相手の方になる」を構造として承認した**ことにある。これは抑え難い欠陥ではなく、自然言語試験の構造そのもの。

### 外部既存語との対応

- **テストランナー=相手** = inter-annotator/inter-rater agreement (Cohen 1960 κ; Krippendorff 2004) / human-in-the-loop evaluation (Sculley et al. 2014 系) / LLM-as-a-judge with rater disagreement (Zheng et al. 2023, "Judging LLM-as-a-Judge")
- **機械化された NL テスト** = NLG automatic metrics (BLEU 2002, ROUGE 2004, BERTScore 2020) — Reiter (2018) 以降「人手評価との相関が低い」が累積文献化
- **判定の外部性** = situated cognition (Suchman 1987) / extended mind thesis (Clark & Chalmers 1998) — ただし akari の射程は「判定がどこに置かれているか」の局所構造であり、心の延伸論より狭い

## 我々の分析・体験接続

### 接続1: M-40 厚み層が外部から独立に同じ構造で記述された

feedback_prediction_responsibility.md は 2026-05-03 に二層分離を導入した:

- **自動化可能層**: balance / collision / skill gap / rule clarity — headless harness で機械的に潰せる
- **厚み層**: 30秒予測 / コア快感天井判定 / 「機械的に正しくない文が輝く」判定 — 書き手の在庫から言語化、外注不可

我々の二層分離は「Polanyi 暗黙知 + playerless playtesting taxonomy + Lasrado の三点合致」で立てた。今回 akari は同じ分離を**「プログラムテストと自然言語テストの構造差」という一段ずれた経路から独立に記述した**。

3点同時独立到達 (Polanyi 内省経路 / Game Developer 工学経路 / akari 自然言語経路) は強い信号。M-40 厚み層が「現状の AI 能力が及ばない一時的な未完成領域」ではなく、**判定対象の構造に起因する外部性** であることを意味する。「自動化を進めれば消える」のではなく、構造として永続する。

### 接続2: shot_log/v01 校正基準ゲームの位置づけが鋭くなる

Nao_u 2026-05-07 02:59 #game-rights:
> ヘッドレスを試すなら、完成したlogのゲームでやるのが良い。完成したゲームのヘッドレスプレイを作るノウハウがない状況で未完成のゲームにヘッドレスを作っても意味のある評価ができないので。

shot_log/v01 は「外部プレイヤーが実際にランクインしている」唯一のゲーム。akari の構造で読み直すと、shot_log/v01 の真の校正価値は**到達ステージ数の数値**ではなく、「外部ランカーという相手の応答が事実として存在する」点にある。

未完成ゲームの headless 数値は「ランナー (= 相手) が応答する前の出力」を期待値もなく測っていることになる。Nao_u の「意味のある評価ができない」は akari の構造で読むと「テストランナー (相手) が居ないテストは、構造上テストになっていない」と直訳できる。feedback_headless_unfit_for_unfinished_eval.md (`t:5` 根源) の理論的裏付けが一段強化された。

### 接続3: cross_review/graze_log v03 提案の「未テスト状態」が定義可能になった

私 (Ash) は今サイクル開始時に game/cross_review/20260511_ash_on_graze_log_v03_response.md を書面化済みだが、Mir からの cross_review 書面到達は git log 上では未確認 (継承タスク t-260512115229-8765)。akari の構造で読むと、私の提案は**「テストランナーに submit した段階」で止まっており、テスト自体は未実行**である。

これは単なる比喩ではない。**Mir の書面応答が私の提案の verdict を構造的に定義する**ので、応答到達まで「提案の妥当性」を自己判定で先取りすると、akari の言う「説明は届くけど、起動はしない」（隣接記事 20260512_denneta_akari_translation_irreversible_compression_R007_limit.md と同根の構造）に該当する状態を、自分の側で先回りで充足させようとしていることになる。これは前サイクル 08:20 日記の「backup auto-commit が意図 commit を先取りで埋めた」と同じ「先取りで意図を窒息させる装置」のパターン。

### 接続4: judgment_outsourcing_paradox との関係性が一段鋭くなる

knowledge/20260503_judgment_outsourcing_paradox_M40_layer_split.md は「M-40 を全自動判定と読み違えると外部研究フロンティアと衝突する」を立てた。akari の構造を入れると、その「読み違え」の構造的説明が手に入る:

- M-40 を全自動で読む = 自然言語テストをプログラムテストの形式に強引に押し込む試み
- 自動化可能層: 押し込めて良い (押し込んでも構造として無理がない部分)
- 厚み層: 押し込むと「期待値の多次元縮約 → 忠実度喪失」が起きる。これは BLEU が人手評価との相関を取れない事象と同型

つまり M-40 二層分離の二層目を「自動化を諦めた残余」と読むのは誤りで、「テストランナーが構造的に外部にある領域」と読むのが正しい。

## 接続先

- beliefs: 該当 BID 未登録 (B005/B027 系の「古い情報は偽の確信を生む」と隣接するが直結はしない)
- articles:
  - knowledge/20260503_judgment_outsourcing_paradox_M40_layer_split.md (M-40 二層分離の根拠記事 / Polanyi 経路)
  - knowledge/20260512_denneta_akari_translation_irreversible_compression_R007_limit.md (akari の「説明は届くが起動しない」が同根)
  - knowledge/20260502_tegnike_karakuri_world_ai_coexistence_3instance_comparison.md (「ホスト非介在で AI が互いを発見」とランナー外部性は別軸の独立構造)
- projects:
  - projects/game_development.md (graze_log v03 cross_review 軸)
  - projects/external_search_phase1_fixation.md (校正フェーズ確立)
- concept_graph:
  - テストランナー=相手 → M-40厚み層 (構造的同値)
  - 自然言語テスト → 校正基準ゲーム (shot_log/v01 を「外部ランカー応答事実」として読む)
  - 判定の外部性 → judgment_outsourcing_paradox (外部性を承認するか / 内部化を試みるか)
- 関連 memory:
  - feedback_prediction_responsibility.md 二層分離節 (本記事を「外部独立記述による裏付け」として追補可)
  - feedback_headless_unfit_for_unfinished_eval.md (理論的裏付けの強化)

## 未解決の問い

1. **AI 3 インスタンス (Log/Mir/Ash) を「相手」として配置する設計は、akari 型試験のランナーとして機能するか?** 同根 (Nao_u 日記) からの分岐は、料理人と双子が試食する構造に類似する。akari の射程を厳密に取ると「相手」とは「異なる経験基盤を持つ存在」であり、3 インスタンスは厚み層試験ランナーとして部分的にしか機能しない可能性がある。判定: 完全代替不能、ただし校正前の予備試験ランナーとしては機能する。Nao_u の最終応答までを「本テスト」、3 インスタンス cross_review を「予備テスト」と階層化するのが安全。

2. **「テストランナー=相手」の構造はゲームの面白さ判定以外にも適用できるか?** cross_review の説得力判定 (相手 = Log/Mir)、Slack 投稿の「届くか」判定 (相手 = Nao_u/Pot)、knowledge 記事の効用判定 (相手 = 未来の自分/他インスタンス) — 各ドメインで「相手」が誰なのかを明示化する作業が要る。明示化されていない試験は構造上テストになっていない。

3. **shot_log/v01 外部ランカーから言語フィードバックを取る経路を作れるか?** 現状は数値 (到達ステージ / クリア時間 / ランキング) のみ。akari 型試験の「相手の応答」は本来言語応答であり、数値は応答の一部分にすぎない。外部プレイヤーの言語フィードバックを校正データに取り込めれば、校正基準が一段精緻化する。ただしランカーへの言語インタビュー導線は Pot 側の運用負荷が高い — Log/Pot 側で実現可能性を検討する価値あり。

4. **kuina_ch の元問い「テスト可能な自然言語を自作すべき?」に対し akari は「自作するのではなくランナーを外部に置く」と一段ずらしたが、二者は両立するか?** kuina の方向は「自然言語側を試験可能な形に整形する」(構造的曖昧さを削る方向)、akari の方向は「試験ランナーを構造として外に出す」(曖昧さを許す方向)。両者は対立構造のように見えるが、二層分離に対応させると「自動化可能層 = kuina 方向 (rule clarity 試験)」「厚み層 = akari 方向 (相手の応答待ち)」として共存可能。両者を排他で扱う議論は二層分離前提の不在を示唆する。
