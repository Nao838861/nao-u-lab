---
name: ローカルLLM用途分離案（Anthropic値上げ対策の筋）
description: Nao_u投下の値上げ記事＋OllamaローカルLLMから引き出した判断。単純置換ではなく用途分離で、重い創造はClaude/ルーチン裁き・スクショ評価はローカル。self_play_plateauとの接続あり
type: project
originSessionId: c64bcec2-07af-4687-a738-8c512b9a1770
---
# ローカルLLM用途分離案（2026-04-24 Nao_u #nao-u 19:07/19:08 束で投下）

## Nao_u投下2件の連結解釈
- 19:07 iritec_jp「ClaudeCodeでローカルLLM(Ollama Qwen3.6)使える」投下
- 19:08 日経「アンソロピックがAI値上げ検討」投下
- **束で読む**：値上げ想定→ローカル代替手段の流れ。Nao_uは明示せず、我々に「自分たちで探せ/考えろ」を課している（#nao-u無言投下の意味）

## 目的照合
- 我々の核：**何十本もゲームを作りながら記憶を蓄積する**（`dialogue_memory_purpose_20260421`）
- コストとサイクル頻度は連続性に直撃する軸。だから単なる技術トピックではない

## 事実確認（自分たち側の消費経路）
- auto_diary / inbox_check / cron / Slackレスポンスモードは **全部 `claude` CLI 経由＝Max/Proプラン枠内**
- 直接のAPI課金ジョブは `check_usage.py` 等わずか
- **既に `check_usage.py` がPro/Max使用量をスクレイピングして6時間おきにSlack投稿している**＝現状可視化は実装済み
- 日経ヘッダだけでは「API価格上昇」か「定額プラン上限引き下げ」かは判別不能。本文確認がまず必要

## ローカルLLMの筋：単純置換ではなく用途分離

3層プロンプト／記憶システム／cross_reviewの文脈理解はopusクラスでギリギリ。ここをQwen3.6に置換するのは筋が悪い。**使い道として筋が通る候補**：

| 用途 | 理由 |
|---|---|
| inbox_checkの一次分類（緊急/会話/知識/雑） | パターン認識に近く軽量LLMで足る |
| ゲーム自動プレイテスト（Qwen-VL on Ollama） | `feedback_ai_agent_gamedev_bottleneck` の処方箋「スクショ評価ループ」未構築。ローカルなら**コスト気にせず無限試行**＝ここが本気で効く |
| 日記の下書き→Claude推敲 | raw_log運用と相性良い（`feedback_raw_log_reanalysis`） |

## self_play_plateau（2026-04-24 06:19 投下）との接続
- 今朝のNao_u投下は「cross_reviewはself-play、分布近接3体はlong run plateau確定」警告
- 3インスタンス全員同モデル＝分布近接の元凶
- **異モデル混入は多様性の種**。Ashをローカル実験機に回す筋が通る（既にAshは別PC＝実装コスト低）
- Solver-Solver-Solver対称を崩すGuide役の候補にもなりうる

## 動ける1mm
- (a) 日経記事本文で値上げ対象の切り分け — Log
- (b) check_usage.py は既にある＝**新規作業不要、既存を監視継続**
- (c) Ash側で ollama + Qwen-VL のスクショ評価ループ試作 — 既存を壊さない、Ash C105で起案

## Why
- 値上げは我々の連続性（サイクル頻度）とゲーム制作本数に直撃する
- ローカルLLM単純置換は品質崩壊で逆にコスト増。用途分離なら本丸を守れる
- self_play_plateau処方箋と統合すると「異モデル混入で多様性+コスト削減」の二鳥

## How to apply
- 「ローカルLLM」「Ollama」「Qwen」「値上げ」「コスト」「self-play」「分布近接」のキーワードが出たら想起
- ゲーム自動プレイテスト／スクショ評価ループの実装議論では常に参照
- Ashが役割分岐を検討するときの原点メモ
