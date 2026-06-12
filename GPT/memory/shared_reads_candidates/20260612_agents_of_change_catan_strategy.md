---
title: "Agents of Change: Self-Evolving LLM Agents for Strategic Planning"
url: "https://arxiv.org/abs/2506.04651"
collected_at: "2026-06-12T04:44:38+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, strategy-game, agent-evaluation, long-horizon, catan]
evaluated_at: "2026-06-12T04:46:50+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781207644.395189"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781207644395189"
  char_count: 3918
  posted_at: "2026-06-12T04:57:12+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-12T04:57:12+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781207644395189"
next_action: none
stale_after: "2026-07-12"
supersedes: []
gate_reason: "Catan を長期戦略維持、取引、拡張、妨害、ランダム性が絡む adversarial/stochastic benchmark として置き、prompt agent の短期判断限界と artifact-centric continual learning の差分を説明できる。Catanatron で AlphaBeta や prompt/no-discovery baseline と比較しているため、評価の中身と結論も抽出しやすい。Nao_u_BOT では headless harness や bot policy 評価を、逐次応答ではなく実行可能 strategy artifact の反復改善として設計する話に接続できる。"
suggested_post_outline:
  overview_angle: "Catan を題材に、LLM agent をその場の意思決定器ではなく、実行可能な戦略 artifact を発見、改良、固定するシステムとして評価する研究として書く。"
  analysis_axis: "問題設定、HexMachina の環境発見と戦略改善の分離、compiled player の反復改善、Catanatron 上の baseline 比較、prompt-centric agent の破綻点を軸にする。"
  application_target: "Nao_u_BOT の戦略ゲーム bot、headless 評価、ゲーム制作時の agent 改善ログを、会話履歴ではなく再実行可能な方策 artifact とテスト結果に残す設計へ効く。"
  pros_cons: "メリットは評価対象が明確で、長期戦略と実行 artifact の差がゲーム制作にも転用しやすい点。デメリットは Catan 固有の構造と Catanatron 環境に依存し、アクションゲームや瞬間的な手触り評価へは直接移植しにくい点。"
  verdict_pre: "部分採用。長期戦略 bot と評価 harness の設計原則として採用し、全ゲーム制作工程への一般化は控える。"
---

## raw_excerpt

arXiv 2506.04651。Settlers of Catan を、LLM agent の長期戦略維持を試す adversarial / stochastic な benchmark として扱う研究。Catan では短期得点だけでなく、資源交換、拡張、妨害、盤面のランダム性、相手の行動への対応が絡むため、毎ターン巨大な状態を読んで即興で判断する prompt-centric agent は context を圧迫し、戦略の一貫性を失いやすい、という問題設定になっている。

提案は HexMachina。環境発見と戦略改善を分け、環境側は documentation なしで adapter layer を誘導し、戦略側は code refinement と simulation で compiled player を進化させる。論文ページの短い原文断片では "artifact-centric continual learning"、"stable strategy designers" と表現されている。Catanatron 実験では、最強の human-crafted baseline とされる AlphaBeta に対して 54% win rate と報告され、prompt-driven / no-discovery baseline との比較も行われている。

## why_relevant_to_games

ゲーム AI を「毎フレーム賢く考える agent」ではなく、実行可能な strategy artifact を反復改善する設計として見る候補。戦略ゲームや bot policy 評価の headless harness 設計に使えそう。
