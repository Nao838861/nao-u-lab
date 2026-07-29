---
title: "Human-Centric Reflective Architecture for Human-AI Collaborative Decision-Making"
url: "https://arxiv.org/abs/2607.03025v1"
collected_at: "2026-07-30T02:00:52.1553030+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [human-ai-collaboration, reflective-agent, reinforcement-learning, player-modeling, evaluation]
---

## raw_excerpt

論文は、人間と AI の共同意思決定を、AI agent と human player が反復的に行動する stochastic game として定式化し、Human-Centric Reflective Architecture（HCRA）を提案する。出発点は、AI の推奨精度が高いだけでは人間の過信・過小信頼を防げず、人間の期待や制約へ較正された助言が必要だという問題である。HCRA は actor LLM、evaluator、self-reflection LLM、human calibration model、human acceptance model の五要素を持つ。actor が推奨内容と confidence を生成し、evaluator が正しさと自然言語で与えた制約への適合を評価する。calibration model は actor の confidence を人間向けに変換し、acceptance model は人口統計的特徴なども入力して、人間が推奨を受け入れる確率を予測する。self-reflection は評価、受容確率、短期・長期 memory を用いて言語 feedback を生成し、次の推奨を更新する。

短期 memory は現在 request の質問、推奨、評価、confidence、reflection を保持し、長期 memory は終了した request の履歴を次回へ引き継ぐ。目的関数は単なる task score ではなく、正しく制約に適合した提案を受け入れ、誤った提案を拒否する人間側 utility を高めるよう構成される。実験領域は観光推薦であり、実人間の常時 feedback の代わりに、実データで訓練した human behavior model を反復 loop 内で使用する。著者らは、human-calibrated model と human-centric objective を組み込んだ反復が、推奨の有効性と品質を高めたと報告している。

## why_relevant_to_games

AI を使うゲーム設計支援や自動 playtest で、task score だけでなく「設計者・プレイヤーが助言をどう受け取り、どの制約を重視するか」を feedback loop の状態として扱う構成例になる。
