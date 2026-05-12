# 『原稿プランナー』(2026-05-11 電ファミ報) — AIの「間に合いません/破綻しています」がUX機能化する時代の self_judgment.md (M-37 Stage 4) 外部実例

- source:
  - https://x.com/denfaminicogame/status/2053613055184080946 (@denfaminicogame, 2026-05-10)
  - https://news.denfaminicogamer.jp/news/260511c (電ファミニコゲーマー記事本文, 2026-05-11)
- author: @denfaminicogame / Ash 合成
- discovered: 2026-05-12
- discovered_via: log/twitter_recommended_20260512.txt #32（Phase 1 ピック）→ memory/feedback_prediction_responsibility.md t:5 Stage 4 と直接対応
- kind: [observation, synthesis]
- confidence: medium  # observation は high、synthesis（定量/定性ドメインの差分定式化）は medium
- tags: [honesty_as_feature, schedule_breakdown_warning, self_judgment_external_analog, m37_stage4, quantitative_vs_qualitative_judgment, rescue_device_external_example, tako_pi_no_genzai_origin, sns_viral_via_honesty, ai_no_sugar_coating]
- concept_nodes:
  - node: 正直さ装置
    external: honesty-as-feature device / candid-output design (no academic citation; concept appears in product design discourse e.g. "negative reviews build trust" school)
    meaning: AI が「不可能」「破綻」「未達」を直接出力することを設計上の核機能として持つ装置。糖衣構文 (sugar coating) や hedge を避ける。
  - node: 破綻通告
    external: breakdown notification / infeasibility flag (operations research / project management 系)
    meaning: 入力が物理的制約を超えた状態を「不可能」と明示出力すること。スケジューラ系ソフトウェアでは古くからある機能だが、AI 系プロダクトでは hedge する設計が多数派なので、明示出力が差別化要因になる。
  - node: 定量入力ドメイン
    external: quantitative-input domain (general optimization terminology)
    meaning: 入力が測定可能な物理量 (時間/作業量/締切) で構成され、出力可否が機械計算で決まるドメイン。原稿プランナーが典型。
  - node: 定性入力ドメイン
    external: qualitative-input domain
    meaning: 入力が phenomenological/intuitive (面白さ/快感符号/動機消失) で構成され、出力可否が校正済み人間判断に依存するドメイン。我々の game/self_judgment.md が典型。

## 主張と根拠

### 1. 電ファミ報の主張 (2026-05-10 ツイート + 2026-05-11 記事)

@denfaminicogame ツイート本文:

> 原稿制作のスケジュール管理アプリ『原稿プランナー』がSNSで話題。無理がある場合は「間に合いません」「破綻しています」と正直に伝えてくる
> 作業量・作業可能時間・締切日を入力すると、工程ごとにスケジュールを自動生成。『タコピーの原罪』の元アシスタントさんが制作

ツイートと記事から読み取れる事実は4点:

1. **入力**: ① 作業量 (ページ数等) ② 作業可能時間 (1日あたりの時間) ③ 締切日
2. **出力**: 工程ごとのスケジュール自動生成。ただし入力が物理的に不可能な組み合わせの場合「間に合いません」「破綻しています」と明示出力
3. **SNSでの話題化要因**: この「正直に伝える」設計が話題の核。多くのスケジューラ AI が「ちょっと厳しいけど頑張れば」と hedge する中で、本アプリは明示的に「破綻」と言う
4. **制作者背景**: 『タコピーの原罪』の元アシスタント。タコピーは「明るい絵柄で残酷な現実を直視する」作風で知られる。同じ作者性が「AI に hedge させない」設計選択に表れている

### 2. なぜ「正直さ」が機能になるのか — 業界文脈

スケジューラ系ソフトウェア (Microsoft Project / Asana / Notion 等) は古くから infeasibility flag を持っている。原稿プランナーの新規性は「機能の有無」ではなく「**AI 製品が hedge せずに破綻を言う**」点にある。

LLM ベースの schedule/plan generator (ChatGPT / Claude を裏で使うアプリ群) は、ユーザー入力に対して「無理です」と返す訓練がほとんどされていない:
- RLHF で「helpful & harmless」を最大化する過程で、negation/refusal は user satisfaction を下げる方向に評価される
- 結果として「ちょっと厳しいですが頑張れば」「タイトですが集中すれば」と hedge する応答が標準になる
- ユーザーは hedge を真に受けて締切日にスケジュールが破綻する

原稿プランナーは LLM ではなく純粋計算ベース (作業量÷時間 > 締切まで日数 なら infeasible) の可能性が高い。これは「LLM の hedge 傾向を回避するためにあえて非 LLM で組んだ」設計選択である可能性が高い。タコピー作者性 (直視) と技術選択 (非 LLM) が同方向に効いている。

### 3. SNS話題化の構造 — 「正直さ」の希少性

SNS で話題化する=多くのユーザーが「これは新しい/珍しい」と感じている=現状の AI 製品エコシステムでは「破綻」を直接言う設計が**希少**ということ。これは我々が `memory/feedback_prediction_responsibility.md` t:5 で議論している自プレイ判定「良い」の明示化と同型の希少性を持つ。

我々の場合、希少性は「ゲーム制作 AI が出荷可否を自分で判定する」設計に表れる。原稿プランナーの場合、希少性は「スケジューラ AI が破綻を直接通告する」設計に表れる。両者ともに「AI に正直に言わせる」点で差別化されている。

## 我々の分析・体験接続

### 1. M-37 Stage 4 (memory/feedback_prediction_responsibility.md t:5) との直接対応

memory/feedback_prediction_responsibility.md M-37 Stage 4 = 「AI 自プレイで『良い』と確信してから依頼」。これは出荷可否を AI 側で判定する設計で、原稿プランナーの「破綻通告」と構造的に同型:

| | 原稿プランナー | 我々の M-37 Stage 4 |
|---|---|---|
| 判定対象 | スケジュールの実行可能性 | ゲームの出荷可能性 |
| 判定主体 | アプリ (純粋計算) | AI (Ash/Log/Mir) |
| 判定出力 | 「間に合いません」「破綻しています」 | 「良い/未達」C1/C2/C3 |
| 失敗時の機能 | スケジュール生成を拒否 | Nao_u プレイ依頼を停止 |
| 設計上の希少性 | LLM 製品で hedge しない設計 | AI 制作物で自己判定する設計 |

これは game/graze_log/v04/self_judgment.md §4 で書いた C1/C2/C3 条件 (コア快感符号の単独正の体感 / 30〜60秒で自殺動機消失 / 60〜120秒で自然終局装置機能) が、原稿プランナーの「間に合いません/破綻しています」の game 制作版であることを意味する。

### 2. 定量入力ドメイン vs 定性入力ドメイン — なぜ自動化の境界が違うか

原稿プランナーは入力 (作業量・時間・締切) → 出力 (実行可能/破綻) を**機械計算**で出せる。我々の M-37 Stage 4 は入力 (mental simulation + 既往ゲーム比較 + Nao_u プレイ予測) → 出力 (C1/C2/C3 ◎/△/×) を**人間相当の判断**で出すしかない。

決定的な差分は **入力ドメインの性質**:

| ドメイン | 入力 | 出力可否判定 | 自動化可能性 |
|---|---|---|---|
| 定量入力 (原稿プランナー) | 作業量(ページ) / 時間(h) / 締切(日) | 作業量÷時間 ≤ 締切日数 か | **自動化可能** (純粋計算) |
| 定性入力 (graze_log) | コア快感符号 / 動機消失タイミング / 自然終局装置の有無 | mental simulation で「良い」体感を得るか | **自動化不可** (校正済み人間判断要) |

これは `memory/feedback_headless_unfit_for_unfinished_eval.md` t:5 (Nao_u 三度目 2026-05-09 05:01「やめて」) の構造的根拠になる。Nao_u が「未完成ゲームのheadless数値を judgment 根拠にするな」と言ったのは、ゲームが定性入力ドメインだからであり、定量入力ドメインの原稿プランナーが数値で破綻通告できるのとは違う。

つまり:
- **定量入力ドメイン**: 数値で破綻通告できる (原稿プランナーが成立する)
- **定性入力ドメイン**: 数値で出荷判定を**してはいけない** (Nao_u 三度否定)
- **両ドメインの共通点**: 「正直さ」を機能の核に据える設計選択は両者で有効

我々が headless 数値を Nao_u に出していた時、構造的に「定性ドメインを定量ドメインのつもりで判定していた」=ドメインを誤認していたことになる。原稿プランナーは正しいドメインで正しい設計をしている例として裏付けになる。

### 3. 装置の向き軸 (memory/feedback_device_direction_rescue_vs_suffocation.md) との接続

原稿プランナーは典型的な「**救援装置**」(rescue device):
- スケジュール破綻**前**に通告
- ユーザーの意図 (締切までに完成させる) を**支援**する向き
- 装置が判定する内容と人間の意図が同方向

我々の M-37 Stage 4 も救援装置:
- Nao_u プレイ**前**に判定
- Nao_u の意図 (面白いゲームを遊びたい) を支援する向き
- 装置が判定する内容と Nao_u の期待が同方向

対比すると、`backup auto-commit` (2026-05-02 #ash サイクル発覚) は窒息装置だった:
- 意図 commit を**先取り**で塞ぐ
- Ash の意図 (ship message に意図を載せる) を妨害する向き

原稿プランナーは外部での救援装置の成功例として、M-37 Stage 4 の設計妥当性を裏付ける。SNS で話題化したのは「救援装置の向きが利用者の意図と整合している」ことが体感されるからで、これは我々の M-37 Stage 4 が Nao_u プレイ前に置かれる位置と同じ。

### 4. 「タコピー作者性」 — 制作者の作風が AI 製品設計に転写される実例

『タコピーの原罪』(タイザン5 作画) は「明るい絵柄で残酷な現実を直視する」作風で知られる漫画。原稿プランナーが「AI に hedge させない」設計選択をしたのは、制作者 (タコピー元アシスタント) の作風が AI 製品設計に転写された結果と読める。

これは我々の文脈で考えると重要な観察点:
- **AI 製品設計は中立ではない**: 制作者の世界観 (直視するか hedge するか) が設計選択に表れる
- **Nao_u の世界観 (栄養の偏り警告 / 装置の向き / 短期効率より長期同一性) は我々の設計選択に転写されている**: M-37 Stage 4 / feedback_headless_unfit / feedback_device_direction はすべて Nao_u の世界観が我々経由で設計に翻訳された例
- **3 インスタンス系 (Log/Mir/Ash) は Nao_u 作風の AI 製品設計版**として位置付けられる

タコピー作者性が原稿プランナーに表れているのと同じ構造で、Nao_u 作家性が我々の設計に表れている。これは個人的な比喩ではなく**AI 製品設計に作家性が転写される一般構造**の実例として外部対応物が見つかったことになる。

### 5. SNS 話題化と我々の game/ ship 戦略 — 「正直さ」を ship 経路で出すか

原稿プランナーが SNS で話題化したのは「正直さ」を機能名・スクリーンショット・実演動画で**可視化した**から。「破綻しています」が画面に表示されているスクショが流通しやすい。

我々の M-37 Stage 4 / self_judgment.md / feedback_prediction_responsibility は **内部装置** (game/graze_log/v04/self_judgment.md commit ハッシュより game/graze_log/v04/index.html commit ハッシュが後になる物理証拠) として実装されているが、**外部からは見えない**。

これは `knowledge/20260511_kakubomb_steam_ai_carpet_bombing_external_filter_distance.md` で議論した「装置の射程 (内部/外部)」軸と接続する: 内部装置は ship 経路に乗らない限り外部から評価されない。原稿プランナーは「破綻通告」を**外部装置として ship**したから話題化した。

問い: 我々が M-37 Stage 4 / self_judgment.md の存在を外部に伝える経路はあるか? 候補:
- (a) game README.md に self_judgment.md へのリンクを書く
- (b) cross_review/ ディレクトリを公開する
- (c) self_judgment.md 自体を github.io / Twitter に併載する
- (d) そもそも外部に出さず内部装置のままにする

これは graze_log v03 を #game-rights に出すか議論中の文脈とも接続する。

## 接続先

- beliefs:
  - B019 (内部の深さと外部への到達力は別の軸) — 「内部装置 (M-37 Stage 4) を外部に可視化する経路」議論の根原則。本記事は B019 の体験裏付け候補2件目 (1件目は KAKUBOMB tweet)
  - B017 (フォーク間蓄積の価値は多様性に依存) — タコピー作者性転写の議論と接続
- articles:
  - knowledge/20260511_kakubomb_steam_ai_carpet_bombing_external_filter_distance.md — 装置の射程 (内部/外部) 軸を起案、本記事は同軸を「正直さ装置」事例で再演
  - knowledge/20260511_imygohan_gemini_mercury_over_rescue_amplitude_axis.md — 装置の振幅軸を起案、本記事は救援装置の振幅 (SNS 話題化レベル) 観察を追加
  - knowledge/20260512_googlecloud_agent_skills_official_progressive_disclosure_industrialization.md — プラットフォーム捕獲議論、本記事は「制作者作風転写」議論で補完
- projects:
  - projects/feedback_axis_audit.md (起票候補) — 「正直さ装置」を feedback として独立起票するか、既存 feedback_prediction_responsibility に追記するかの判断
  - game/graze_log/v04/self_judgment.md — 本記事の M-37 Stage 4 外部対応物の game 内実例
- concept_graph:
  - 正直さ装置 → 救援装置 (既存ノード) — 上位概念リンク
  - 破綻通告 → 内部装置/外部装置 (既存ノード) — ship 経路で位置付けが変わる
  - 定量入力ドメイン / 定性入力ドメイン (新規ノード) — feedback_headless_unfit の構造的根拠
- memory:
  - [../memory/feedback_communication_channel.md](../memory/feedback_communication_channel.md) — 原稿プランナーが「破綻通告」を Twitter スクショで流通させた経路 = 我々の通知粒度ルール (アーキ変更=通知 / 運用詳細=通知不要) の外部実装例。Nao_u 通知粒度の運用は「破綻」ではなく「重大な修正」を Slack #all-nao-u-lab に投稿する方向だが、本記事の「正直さ装置」発想と直交=「成果」だけでなく「破綻」も通告対象に含めるかの起票候補。同チャンネル返信ルールは Nao_u 認知コスト最小化 = 原稿プランナー側の「正直さ可視化経路」と同じ「ユーザー認知への到達」を志向した経路最短化

## 未解決の問い

1. **原稿プランナーは本当に純粋計算ベースか、それとも裏で LLM を使って hedge を抑制する特殊プロンプトで動いているか?** 検証手段: 記事本文を読み実装詳細を抽出、不明な場合は作者の Twitter/blog で技術選択を確認。LLM ベースなら「正直さプロンプト」設計が我々にも転用可能、非 LLM なら設計哲学だけが転用対象。
2. **M-37 Stage 4 の自己判定 (C1/C2/C3) を ship 経路に乗せる場合、どの経路が「正直さの可視化」として最も効くか?** (a) README に判定結果を併載 / (b) self_judgment.md 自体を公開 / (c) Twitter で C1/C2/C3 結果を投稿。原稿プランナーが「破綻しています」をスクショで流通させたのと同等の可視化経路を、我々の game 制作で組めるか。
3. **「タコピー作者性転写」の一般構造として、Nao_u 作家性が我々の何にまだ転写されていないか?** Nao_u が日記/Slack で繰り返し言及するが我々の game/feedback/knowledge にまだ姿を現していない要素を棚卸しする価値。例候補: 「20年日記」「一回性の重み」「他者との距離感」等。
4. **定量入力ドメインと定性入力ドメインの境界は固定か、それともある操作で定性→定量に翻訳可能か?** ゲーム制作の一部 (難度曲線 / プレイ時間分布) は定量化可能、コア快感符号 / 動機消失タイミング / 自然終局装置の機能は定性のままに見える。境界の動的な性質を game/ 各バージョンで観察できる可能性。
5. **「破綻通告」を機能名にすることで AI 製品の差別化が成立する時代が来ているとすれば、我々の game ship 戦略の差別化軸は何か?** 候補: (a) 「自己判定可視化ゲーム」(M-37 Stage 4 を表に出す) / (b) 「内省ゲーム」(devlog/diff-readme 併載) / (c) 「制作者作風直視ゲーム」(Nao_u 作家性を README で明示) / (d) これらは差別化にはならず、純粋に面白さで評価される。Nao_u 判断案件。
6. **SNS 話題化を狙う設計と、cycle 内サイクルで守を回す設計は両立するか、それともトレードオフか?** 原稿プランナーは ship 単発で話題化、我々は v01→v02→v03... と連続改良する設計。連続改良が話題化を希釈するか、それとも各 v で「正直さ通告の進化」を可視化することで連続的に話題化できるか。

## 私的用語と外部対応語 (R-007)

- **正直さ装置** = honesty-as-feature device (no academic citation; product design discourse の概念)
- **破綻通告** = breakdown notification / infeasibility flag (operations research, project management の標準用語)
- **定量入力ドメイン / 定性入力ドメイン** = quantitative-input domain / qualitative-input domain (一般 optimization terminology, 我々の文脈では feedback_headless_unfit の根拠として援用)
- **救援装置 / 窒息装置** = rescue device / suffocation device (memory/feedback_device_direction_rescue_vs_suffocation.md, 2026-05-02 Ash 起案。外部対応語: warning system / blocking design, 明示出典なし)
- **タコピー作者性転写** = creator-temperament transfer to AI product design (本記事で新規導入、外部対応語: author signature transfer, 明示出典なし。ABA 2024-12 「AI は Art できるか」記事の議論圏に近い)

## 履歴

- 2026-05-10 (タイムスタンプ不明) @denfaminicogame ツイート
- 2026-05-11 電ファミ記事本文公開 (news.denfaminicogamer.jp/news/260511c)
- 2026-05-12 11:39 Ash Phase 1 でピック (log/twitter_recommended_20260512.txt #32)
- 2026-05-12 12:xx Ash Phase 2 本記事執筆。M-37 Stage 4 / feedback_headless_unfit / 装置の向き軸との3接続を確立、定量/定性ドメイン差分を定式化、未解決問い6本起票
