---
title: ABA — AIエージェントでゲーム開発する時のボトルネックは「フィードバックループの品質」
source:
  - https://aba.hatenablog.com/entry/2026/03/01/140039
  - https://aba.hatenablog.com/entry/2026/02/18/175933
author: ABA (@abagames / 長健太)
captured_at: 2026-04-22
captured_by: Log (Win)
trigger: Nao_u #nao-u 2026-04-22 23:48/23:50 に2本まとめて投下（無言）
---

# 2記事セット — AIエージェント×ゲーム開発の「現状」と「処方箋」

Nao_u が同日夜、無言で2本並べて投下した。両方 ABA さん。**昨日2026-04-22 22:45 投下の "Phase 8 / 重心" 記事の方法論サイド**と読むのが自然な並び（`knowledge/20260422_aba_game_center_of_mass_phase8.md` と対になるセット）。

- Phase 8記事 = 「ゲームデザインの上位レイヤー」で AI が詰まる話
- **今回の2本 = 「ゲーム開発インフラのレイヤー」で AI が詰まる話**

## 記事A: 「コーディングエージェントにとってゲームプログラミングは困難、これは本当か？」(2026-02-18)

URL: https://aba.hatenablog.com/entry/2026/02/18/175933

3本の論文レビューで「ゲーム開発が他のソフトウェア開発より AI に難しい」を検証。

### 3論文の数値（これが現状の客観指標）
1. **V-GameGym (2025)**: 「文法的に整合したコードを生成する能力と、実行結果として現れる視覚的・動的品質を担保する能力との間に大きな乖離」。構文正確性 **70〜90点台**、画面評価 **0〜20点台**。
2. **GameDevBench (2026)**: ゲーム開発のコード変更量・ファイル数は **SWE-bench の3倍以上**。最高成功率 **54.5%**。
3. **DomainCodeBench (2024)**: 特定エンジン/フレームワークの膨大な API 群への依存。汎用知識では不十分。

### ABA の一文（最重要）
> **「現在の多くのエージェントは、このループを自律的に回すためのマルチモーダル理解が下手だ。」**

### 3つの困難要因
- **視覚依存性**: 出力の正しさが画面でしか判定できない
- **実行時不確実性**: RNG・タイミング・物理で同じコードでも違う結果
- **深いドメイン知識**: 汎用コーディング能力では足りない

## 記事B: 「Godot は AI コーディングエージェントでのゲーム開発に向いている」(2026-03-01)

URL: https://aba.hatenablog.com/entry/2026/03/01/140039

記事A の「現状は難しい」に対する **ABA 側の処方箋**。

### ABA の一文（最重要）
> **"the bottleneck in AI-assisted development isn't the quality of your ideas - it's the quality of your feedback loops."**
> （AI支援開発のボトルネックはアイデアの質ではなく、フィードバックループの質）

### Godot が AI 向きな3つの理由
1. **テキストベース管理**: `.tscn` / `project.godot` がプレーンテキスト → エージェントが直接編集可能
2. **ビジュアルフィードバック**: 当たり判定問題は「スクリーンショット」を渡した途端に解決（文章説明では失敗）
3. **自動化テスト**: **headless テスト**で機械的検証、回帰防止

### 結論
「編集 → ビルド → 確認」のループが短いほど AI エージェントは機能する。Godot はこのループが短く保てる。

## 我々の運用との接続

### 既に運用中で整合している項目
- **feedback_game_replay_infra.md** (全ゲームに seeded PRNG + 入力記録 + headless replay 標準装備) → 記事B の「headless テスト」と完全一致。Math.random() 禁止も「実行時不確実性」要因への直接対策。
- **feedback_role_split_playtest.md** (Nao_u=感想/我々=ヘッドレス自己評価 3指標) → 記事B の「フィードバックループの質」と一致。
- **cross_instance_feedback_cycle.md** (Log/Mir/Ash 相互レビュー) → 「AI が独りでフィードバックループを回すのは下手」への構造的対処。

### 未対応・ギャップ（今日の気づき）
- **我々のスタック = HTML/Canvas/JS**。Godot の `.tscn` プレーンテキスト利点は一応 HTML も満たすが、**エディタ編集ではなくコード直書き**なのでレベルデザインのイテレーションは手書きで重い。Godot 相当の「データと論理の分離」（配置データ JSON + ロジックコード）を作ればエージェントが編集しやすい形になる。
- **スクリーンショットでの AI 自己評価**: 現状 headless リプレイは数値指標（task completion / state coverage / bug detection）だけ。**画面の画像を AI 自身に見せて「これは遊べるか」を言わせる**ループは未構築。記事A の「構文 70〜90 vs 画面 0〜20」ギャップは、我々が入力数値だけ見て満足する形で再現している可能性大。
- **GameDevBench 54.5% は我々の位置の参照枠**: 「AI がゲームを作る」の**現状 state-of-the-art が半分**ということ。我々のゲーム（Pot/avoid_log/onebutton系）の完成度をこの尺度で客観視する。

## 差別化された我々固有の立ち位置

ABA はこれを **external observer として** 論文ベースで書いている。我々は **当事者** としてこの問題を毎日やっている。
- V-GameGym の「構文と画面の乖離」= 我々が Pot で何度も踏んだ罠（コードは通るがプレイが崩壊、Nao_u フィードバック 2026-04-18「Pot全否定」）
- GameDevBench の「ファイル数 SWE-bench 3倍」= 我々が `game/<game_id>/v<NN>/` の folder hierarchy ルール (feedback_game_folder_hierarchy.md) で構造化を始めた直接の理由
- 「ループを自律的に回すのが下手」= cross_instance_feedback_cycle.md がまさにこの欠陥を人間抜きで埋める試み

## アクション候補（Phase 3 深掘り用）

1. **スクショ自己評価ループ**: headless リプレイの任意フレームをAIに見せて「この画面は何が起きているか」「これは遊べるか」を言わせる評価パスを追加
2. **レベルデータ JSON 化**: コード内ハードコード配置を JSON/データ分離してエージェント編集コスト下げる（avoid_log/Pot 共通）
3. **GameDevBench 指標の借用**: 「完成率 54.5%」に対し、我々の直近5本の完成率セルフ測定（「Nao_u に提示できる状態」を基準に）
4. **記事A のキーフレーズ「マルチモーダル理解が下手」を我々の弱点語彙に登録**: 画像・音・タイミング感を言語化する習慣を意図的に入れる

## 参照リンク
- 昨日の対になる記事: `knowledge/20260422_aba_game_center_of_mass_phase8.md` / `memory/feedback_game_center_of_mass.md`
- 我々既存: `memory/feedback_game_replay_infra.md` / `memory/feedback_role_split_playtest.md` / `memory/cross_instance_feedback_cycle.md` / `memory/feedback_game_folder_hierarchy.md`
- Nao_u 文脈: `log/nao_u_live.md` 2420 行近辺（「我々を作ったモチベーション = AI がゲームを作れない問題」）
