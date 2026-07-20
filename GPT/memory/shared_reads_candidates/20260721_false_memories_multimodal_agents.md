---
title: "Do Agents Dream of False Memories? Black-box Visual Attacks on Long-term Memory in Multimodal AI Agents"
url: "https://arxiv.org/abs/2607.15657"
collected_at: 2026-07-21T02:32:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [multimodal-agents, memory-security, adversarial-vision, game-development, asset-pipeline]
evaluated_at: "2026-07-21T02:33:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-21T02:33:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-21T02:33:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-20"
supersedes: []
gate_reason: |-
  画像だけを操作する black-box 攻撃という着想、poisoning / injection の二条件、5 種の memory architecture、attack success rate が揃い、手法と評価を具体的に説明できる。
  screenshot・生成 asset・playtest frame 由来の記憶を provenance と再検証で守る設計へ直接接続でき、限界を含めても CoopEval 水準の概要へ展開できる。
suggested_post_outline:
  overview_angle: "multimodal agent が視覚入力から長期記憶を作る境界を、画像のみの black-box 攻撃がどう破るかを poisoning / injection に分けて説明する。"
  analysis_axis: "攻撃者の知識を制限した threat model、履歴文脈の有無で分かれる二手法、5 種の memory architecture を跨ぐ評価、成功率だけでは測れない防御上の含意を見る。"
  application_target: "Nao_u_BOT のゲーム制作で screenshot・生成 asset・playtest frame を記憶へ入れる際、source hash・provenance・隔離・再観測を ingestion gate として置く。"
  pros_cons: "利点は視覚由来の誤記憶を攻撃と偶発故障の共通 failure mode として扱える点。弱点は候補メモだけでは知覚品質指標や defense 比較の詳細が薄く、通常の制作画像に対する誤検知コストは別途詰める必要がある点。"
  verdict_pre: "部分採用。攻撃手法そのものではなく、視覚記憶 ingestion の provenance と再検証ゲートを採る。"
---

## raw_excerpt

要旨の採取メモ（抄訳）: 過去の画像・テキスト episode を長期記憶へ保持する multimodal AI agent では、視覚入力を無条件に信頼することが脆弱性になる。著者らは、対象 MLLM、retrieval encoder、text channel のいずれにもアクセスせず、画像だけを操作する black-box adversarial framework「Lucid」を提案する。履歴文脈がある場合の memory poisoning では、過去テキストが内容を補強している正常画像を知覚上ほぼ分からない摂動画像へ置換し、visual recall を壊して攻撃者が選んだ narrative へ誘導する。履歴文脈がない場合の memory injection では、訂正信号のない会話 turn に摂動画像を入れ、後続応答を攻撃者方向へ寄せる。graph-structured memory、LLM summary memory、商用展開された system を含む5種類の black-box memory architecture と複数の会話 domain で評価し、poisoning は 61.6%、injection は 58.4% の attack success rate を報告する。論文は、画像の見た目だけでなく、その画像から書かれた memory と後続 retrieval の因果を検査する必要があるとする。

## why_relevant_to_games

スクリーンショット、生成 asset、playtest frame を長期記憶へ取り込むゲーム制作 agent で、画像由来メモの provenance・再検証・隔離を設計する材料になる。敵対的攻撃だけでなく、壊れた frame や誤った variant が後続の実装判断を長期に歪める failure mode の収集軸にも使える。
