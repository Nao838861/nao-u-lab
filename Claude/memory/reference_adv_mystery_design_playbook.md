---
name: reference_adv_mystery_design_playbook
description: ADV/ミステリ系ゲームを次に作る時の Log 想起ポイント集。千葉集 note (planetary_gear) 2026-05-22 「正解に三つの鐘が鳴る」を元に、Log 固有の適用判断（LLM-as-player 前提・既存 game/* への射影・「甘い犯罪」の使い方）を整理。Nao_u 2026-05-23 07:49 #human-steering「全員それぞれの視点で次に作る時のための記憶として残す」直接処方。
type: reference
tags: [adventure, mystery, narrative, genre-history, llm-as-player]
source: https://note.com/planetary_gear/n/nd75f0dd32f06
companion: memory/shared_reads/20260522_chiba_mystery_mechanics_log.md
---

# ADV/ミステリ系ゲーム設計の想起カード（Log 視点）

**いつ開くか**: 新規 ADV/ミステリ/推理系 v01 着手前 / 既存 ADV 系改修判断 / 「会話 + 選択肢」系の brainstorm / LLM-as-player 用ゲーム候補ジャンル検討。`/game-analyze` 起動時に R-D（型から始める）の補助として併読する。

**companion**: [shared_reads/20260522_chiba_mystery_mechanics_log.md](shared_reads/20260522_chiba_mystery_mechanics_log.md) は STG 転用観点（headless 評価層別 / graze batch / 第5源独立収束）。本ファイルは ADV を自分で作る時の観点で、視座が違う。

---

## ジャンルの構造的な壁

**「不完全なプレイヤーを名探偵に仕立てる」強制判定問題**。小説の推理は参加が任意 (=オプショナル) だが、ゲームでは「謎が解けないと先に進めない」=判定が強制される。この強制性がプレイヤー能力分布の右裾を切り落とす（=ジャンルの天井を決める）。

この壁を抜けるためにジャンル史が試した装置は、**「ジャンル本質の妥協を装置で覆う」=「甘い犯罪」**と呼ばれる。新作で何か新しい装置を入れる時、それは結局この壁のどこを削っているのか？を一度言語化してから採用する。

## 既存装置の系譜（6 種 = R-D「ジャンル grammar」の素材）

各装置は「強制判定のどの部分を緩めたか」で系譜化されている。新作で 1 つを採用する時、**どの問題に効く装置か**を明示する（M-37 の「解決可能性」と接続）。

| 作品 | 年 | 装置 | 緩めた箇所 | LLM-as-player 親和性 |
|---|---|---|---|---|
| かまいたちの夜 | 1994 | 同シナリオ繰り返しで True End 到達がメタ判定 | プレイヤー側の試行回数で底上げ | 中（繰り返し探索は得意だが、文学的「ピンとくる」は弱い） |
| 逆転裁判 | 2001 | 「矛盾指摘」だけに判定対象を絞る | 判定ルーブリックの極小化 | **高**（判定軸が明示 = LLM が最も強い） |
| Return of the Obra Dinn | 2018 | 3人ロックイン + 複数正解許容 | 部分点でゲートを抜けさせる | 高（部分点設計は LLM 評価と同型） |
| The Case of the Golden Idol | 2022 | 2D 化で探索負荷削減 + 章制 + 「誤り N 個」表示 | 情報密度を下げる + 近さ信号 | 高（情報密度低 = context 効率良） |
| The Roottrees are Dead | 2023 | キーワード検索 DB + 〈直感〉= 未発見資料リンク数 | 外部ツール（検索）を正規メカに取込 | **最高**（テキスト検索 = LLM 母語） |
| Type Help | 2025 | テキストのみ「時間 × 場所 × 人物番号」入力 | 入力空間を完全テキスト化 + 矛盾自動判定 | **最高**（CLI 推理ゲーム = headless 評価と相性最大） |

**進化方向**: 厳密判定 → 部分一致許容 → 誤り個数表示 → 探索ガイド。**プレイヤーの認知限界をシステム側が吸収する方向に収斂**している（Nao_u「簡単で深いものが残る」と通底）。

## Log 視点での適用判断（次に作る時の問い）

### Q1. これは「人間プレイヤー」用か「LLM プレイヤー」用か
- 人間用: 上記 6 種から型を選び、独自要素 1 つだけ載せる（R-D 守破離）
- LLM 用: **Roottrees/Type Help 系（テキスト検索+組み合わせ入力）を v01 型クローン候補に格上げ**。これは Log/Mir/Ash 相互プレイ実験の最有力候補ジャンル
- 「両方」と書きたくなったら ✗。target を 1 つに絞る（R-G）

### Q2. 採用する装置は「判定の強制」のどこを緩めているか
1 行で書けないなら ✗。「面白そうだから」「最近見たから」は ✗（feedback_concept_relevance_judgment.md と同型）。

### Q3. 「甘い犯罪」のドーズはどれくらいか
- 緩めすぎ: プレイヤーが「自分で解いた」感を失う（=コア快感の毀損 / Q-H-8b）
- 緩めなさすぎ: 右裾切り（=判定が強制されて壁）
- 中間を取る基準: **「30 秒以内に最初の鐘が鳴る」かを predict（R-F）**。鳴らないなら緩めが足りない、鳴りすぎなら緩めすぎ

### Q4. 章制（Golden Idol）を採用する時の注意
章制 = ファクト集合の閉鎖。STG のステージ制（操作上達の段階化）と機能が違う。「章を切る」=「ロックインする情報量を有限化する」操作。**章末で必ず「鐘」を鳴らす設計責任**が生じる。鳴らさない章は ✗。

### Q5. ヒント系（Roottrees〈直感〉= 未発見リンク数）を入れる時の罠
ヒントは「ガイド付きオープン探索」と「答えのバラまき」が紙一重。**ヒントは "未到達 metric の存在" を出して "中身" は出さない**ルールで揃える。中身を出した瞬間に「探索の快感」が消える（feedback_pleasure_element_first.md）。

## 既存 game/* への射影

### 直接転用候補
- **graze_log/avoid_log 系の chase ペナルティ**: 「甘い犯罪」=不完全さを装置で覆う = chase safe rail v60/v61 系の方向と本質一致。罰の絶対値を下げず装置で逃げ道を用意する設計は ADV 系譜が 30 年やってきたこと。chase 改修方針の妥当性を本ファイル経由で確認できる
- **headless 評価層別判定**: 「誤り N 個」(Golden Idol) や「3 人ロックイン」(Obra Dinn) は 0/1 判定を **距離付き連続信号** に置き換える設計。drafts/headless_evaluation_format_v01.md §5 の 3 層階段判定（合格/惜しい/遠い）と同型 → 既に shared_reads 側に記録済

### 転用しない箇所（境界）
- ミステリの「正解は存在する」前提は STG/avoid 系には無い。**ロックインの意味が違う**（ミステリ = 正答到達確認 / STG = 設計仮説の検証）
- 「ゆるさの戦略的活用」は STG では graze で既に運用済 = 新規発見ではない
- 章制（Golden Idol）= ファクト集合閉鎖、STG ステージ制 = 操作上達段階化、機能が違う

## 自己採点 ✗ 条件（ADV 系 v01 brainstorm.md 着手時）

R-A〜R-I に追加して以下を確認:

- 6 装置のどれを型として選んだか書いていない（守破離 R-D 違反）
- 採用装置が「強制判定のどこを緩めているか」1 行で書けない
- LLM 用か人間用か target が両方になっている（R-G 違反）
- 30 秒以内の「最初の鐘」予測を書いていない（R-F 違反）
- ヒント系を入れて「中身」を出している（R-A コア快感毀損）
- 章制を入れて「章末の鐘」設計が無い
- 「正解が存在する」前提を別ジャンル（STG/avoid）にそのまま持ち込んだ

## なぜこの記事が貴重か（Log の判断）

人間ゲームデザイナがどう「ジャンル深掘り」しているかの実例。skills/genre-deep-analysis/SKILL.md §「R-A 方法論の参考実例」に既に参照リンクが入っている。本ファイルは ADV を**自分で作る時**の補助で、skill 側は**ジャンル分析の手本**として使う。両者は補完関係。

**最大の収穫**: 「**プレイヤーには本物の推理力がない**」を前提に設計するという反転。Nao_u_BOT 全体が「LLM agent は不完全である」を前提に装置で覆う構造そのもの。skill / harness / cross_review / self_judgment はすべて「甘い犯罪」の系譜にある。新しい skill / 評価機構を設計する時、「これは LLM のどの不完全さを装置で覆っているか」を 1 行で書く癖を持つ。

## Linked

- companion: [shared_reads/20260522_chiba_mystery_mechanics_log.md](shared_reads/20260522_chiba_mystery_mechanics_log.md)（STG 転用観点 / 第 5 源収束）
- skill: [skills/genre-deep-analysis/SKILL.md](../skills/genre-deep-analysis/SKILL.md) §「R-A 方法論の参考実例」
- 上流: [game_lessons_log.md](game_lessons_log.md) R-D（型から始める）/ R-G（target 1 行明文化）/ R-A（コア快感）
- 関連: [feedback_surprise_ninja_concept_first.md](feedback_surprise_ninja_concept_first.md)（ADV/シナリオ文脈限定の脚本論、別軸）
