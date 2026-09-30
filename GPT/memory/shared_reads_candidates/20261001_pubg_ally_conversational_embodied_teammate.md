---
title: "PUBG Ally: A Conversational Embodied Agent as an AI Teammate"
url: "https://arxiv.org/abs/2609.29837"
collected_at: "2026-10-01T04:17:58+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, embodied-agent, ai-teammate, playtesting, evaluation, live-service]
---

## raw_excerpt

PUBG: BATTLEGROUNDS の実試合で、人間と音声会話しながら自律行動する AI teammate「PUBG Ally」の設計・訓練・評価報告。language-model agent は、現在の game state を bounded tool interface で照会し、player speech を解釈して発話と high-level action を選ぶ。movement、combat、recovery は game tick で動く高速な behavior-tree controller が担当し、言語モデルの推論待ちと反射的な操作を分離する。訓練用には韓国の PC bang で 1,046 人、38,956 gameplay sessions を収集し、player speech、game events、観測要求、tool results、agent speech、実行 action、post-session feedback を記録した。

評価は held-out trajectory による offline capability / safety evaluation、小規模 online comparison、大規模 A/B comparison を段階的につなぎ、free-text feedback で評価項目自体も更新する。consumer-grade RTX 4060 級で STT・2B SLM・TTS を on-device 実行し、単一の音声交換は約 1.6 秒、cloud 構成は約 3.4 秒。live beta は 141 か国に到達し、試合記録で利用を確認できた回答者の net recommendation は +25.1 percentage points。一方、combat skill は 2.58/5、situation reading は 2.88/5 で、総合的な好意と戦闘 teammate としての弱さが同時に観測された。

## why_relevant_to_games

リアルタイムゲームの AI teammate を、会話品質だけでなく遅延・行動同期・安全性・人間の選好まで含めて設計／評価する場面に使える。offline 指標と実プレイ評価のずれを反復的に修正する収集ループの実例でもある。
