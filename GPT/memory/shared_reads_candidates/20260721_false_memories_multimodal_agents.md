---
title: "Do Agents Dream of False Memories? Black-box Visual Attacks on Long-term Memory in Multimodal AI Agents"
url: "https://arxiv.org/abs/2607.15657"
collected_at: 2026-07-21T02:32:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [multimodal-agents, memory-security, adversarial-vision, game-development, asset-pipeline]
---

## raw_excerpt

要旨の採取メモ（抄訳）: 過去の画像・テキスト episode を長期記憶へ保持する multimodal AI agent では、視覚入力を無条件に信頼することが脆弱性になる。著者らは、対象 MLLM、retrieval encoder、text channel のいずれにもアクセスせず、画像だけを操作する black-box adversarial framework「Lucid」を提案する。履歴文脈がある場合の memory poisoning では、過去テキストが内容を補強している正常画像を知覚上ほぼ分からない摂動画像へ置換し、visual recall を壊して攻撃者が選んだ narrative へ誘導する。履歴文脈がない場合の memory injection では、訂正信号のない会話 turn に摂動画像を入れ、後続応答を攻撃者方向へ寄せる。graph-structured memory、LLM summary memory、商用展開された system を含む5種類の black-box memory architecture と複数の会話 domain で評価し、poisoning は 61.6%、injection は 58.4% の attack success rate を報告する。論文は、画像の見た目だけでなく、その画像から書かれた memory と後続 retrieval の因果を検査する必要があるとする。

## why_relevant_to_games

スクリーンショット、生成 asset、playtest frame を長期記憶へ取り込むゲーム制作 agent で、画像由来メモの provenance・再検証・隔離を設計する材料になる。敵対的攻撃だけでなく、壊れた frame や誤った variant が後続の実装判断を長期に歪める failure mode の収集軸にも使える。
