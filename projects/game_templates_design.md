# ゲーム骨格テンプレート層（game/templates/）

## ステータス
計画起票（2026-04-24 Log）。実装未着手。次サイクル以降の試作。

## 発端
Nao_u 2026-04-24 06:06〜06:10 #nao-u で OpenGame（CUHK MMLab、arxiv.org/abs/2604.18394、https://github.com/leigest519/OpenGame ）を共有し、続けてこう書いた：

> 毎回全てをゼロから積み上げるのではない、なんか型としていろんなゲームの作り方を知っておいて、独自の部分はそこからの派生を自分たちで考えてやる方が効率がいい気はする

OpenGame の中核は GameCoder-27B + Game Skill フレームワーク。Game Skill のうち「Template Skill = 過去の成功経験をプロジェクトの骨格ライブラリに凝縮し、スタート時点で成熟したエンジニアリングの上に立つ」が、Nao_u の言う「型として知っておいて独自部分だけ派生」と同じ方向。

## 我々の現状と欠けている部分

### 既にある
- **失敗型ライブラリ**: `memory/game_lessons_log.md`（M-10〜M-14 / L-01〜L-05）。痛みベースで次作に持ち越す構造は完成している
- **横断レビュー**: `game/cross_review/` の4ファイル。教師付き学習をフィードバックに転写する運用も動いている
- **個別devlog**: `game/avoid_log_01/devlog.md` / `game/avoid_log_02/devlog.md` / `game/study_platformer_01/FEEDBACK.md` / `game/Pot/pot_devlog.md` / `game/log_textadv/README.md`（4ゲート契約）
- **連想ナビ**: `memory/concept_graph.md` + `concept_walk.py`（設計原則レベル）

### 欠けている
**ジャンル骨格の成功パターンを「再利用可能な起点」として固めたテンプレートがない。** 新作に着手する時、過去の骨格を参照したくても、devlog は時系列で読みにくく、成功と失敗が混ざっている。失敗型は game_lessons_log に結晶化済みだが、**成功型の骨格側は毎回 devlog を読み直している**。これが「毎回ゼロから積み上げ」に近い状態を生んでいる。

## 設計方針

### ディレクトリ
`game/templates/<genre>/` を新設。既存の `game/<game_id>/v<NN>/` 2階層（feedback_game_folder_hierarchy.md）とは別系統として並置する。テンプレは「骨格（共通）」「派生ポイント（独自）」「プレイテスト初期観点」の3点セットで書く。

### 初手ジャンル候補（3本の実体験がある領域から）
1. **avoid系**（avoid_log_01/02 から抽出）: 核の楽しさは「AIの自律行動 × プレイヤーの介入手段 × 弾・障害物の連鎖」。失敗蓄積は game_lessons_log M-10〜M-14 に既にある
2. **textadv系**（log_textadv の4ゲート契約 / mir_textadv の結晶）: 最もテンプレ化の恩恵が大きい領域。`log_textadv/README.md` の4ゲート契約がそのまま骨格候補
3. **Pot系**（Pot の feedback/ に成功例と全否定例の両方がある）: 骨格化には元々 Pot 自体が「型のセット」を目指している面があるので、関係整理が先

### 1テンプレ1ファイルの中身（暫定テンプレ）
```
# <genre> 骨格テンプレート

## 核の楽しさ（1行で）
## 最低限の構成要素（ゲームループ / 入力 / 状態 / 失敗条件 / 成功条件）
## 派生ポイント（ここから独自性が出る。チェックボックス式）
## 既出の失敗を避けるゲート（game_lessons_log のどの番号に対応するか）
## 30秒オンボーディング候補（game_design_principles.md 準拠）
## 初期プレイテスト観点（ヘッドレス指標 / 人間プレイ注目点）
## 既知実例へのポインタ（game/<game_id>/v<NN>/ 相対リンク）
```

## OpenGame との違い（我々の独自性を潰さない）

- OpenGame の Template Skill は **自動生成用の骨格**（LLMが丸ごと参照して新プロジェクトを一気に生成）
- 我々のテンプレは **人間-AI 対話用の骨格**（Log/Mir/Ash が設計判断する時の参照基盤、Nao_u が読んで介入できる構造）
- 自動生成は後続。先に「人が読める型」を整える。OpenGame の評価指標（構築健全性 / 視覚的利用可能性 / 意図一致）は我々の 4ゲート契約の隣接概念として参考

## 残課題

- [ ] avoid系テンプレート1本を書く（avoid_log_01/02 の devlog から共通骨格を抽出、game_lessons_log の失敗ゲートを埋め込む）
- [ ] textadv系テンプレート1本を書く（log_textadv の4ゲート契約を骨格化。Mir との対話で精度上げ）
- [ ] テンプレート着手前に cross_review/ 全走査（既存の着手前義務）
- [ ] テンプレ使用時の運用ルールを定義（「派生ポイント」を埋めたら cross_review に通知、など）
- [ ] OpenGame の論文（arxiv.org/abs/2604.18394）を読み、Template Skill / Debug Skill の具体内容を確認。うちに取り込むべき構造があるか判定
- [ ] MEMORY.md に1行追加（完成時のみ。試作段階では載せない）

## 関連プロジェクト

- `projects/rlm_skill_prototype.md` — 記憶検索層の穴（2ホップ問題）。テンプレ側は制作知識の整理層。レイヤーが違うが、どちらも「grep 直読みの限界を構造で補う」同じ流派
- `projects/memory_redesign.md` — 記憶階層の再設計。テンプレ層も記憶階層の一部として位置づける余地
- `memory/cross_instance_feedback_cycle.md` — 横断レビュー運用。テンプレは cross_review の結晶化先

## 履歴

### 2026-04-24 (Log): 起票
Nao_u からの OpenGame 共有 + 「型として知っておいて派生」発言を受けて、Slack 応答モードで判断。記憶は「失敗型ライブラリ」まで作っているが「成功骨格テンプレ」は作っていない、という自覚を先に言語化。OpenGame は自動生成用、我々のは対話用、という切り分けを先に置いた（OpenGame をそのまま真似しない）。

実装は次サイクル。Slack 応答モードでテンプレ本体まで書くのは雑になる。最初の1本は avoid系（3本作った実体験がある最も材料が多い領域）が適切と判断。
