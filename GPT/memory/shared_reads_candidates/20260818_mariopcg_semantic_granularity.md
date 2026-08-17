---
title: Grounding Natural Language Prompts in Expressive Super Mario Level Generation
url: https://openreview.net/forum?id=IlJMxS25fv
collected_at: "2026-08-18T02:01:19+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, pcg, level-generation, llm, evaluation]
evaluated_at: "2026-08-18T02:08:28+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1786987097.063549"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786987097063549"
  char_count: 4138
  posted_at: "2026-08-18T02:18:22.1100343+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-18T02:18:22.1100343+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786987097063549"
next_action: none
stale_after: "2026-09-17"
supersedes: []
gate_reason: |-
  表現の意味粒度が instruction-following 評価を歪める問題、MARIOPCG、複数 decoder-only model の統制比較、主要結論を抽出できる。
  自然言語からレベルを生成する際の tile IR と評価設計へ具体的に適用でき、測定上の交絡を軸に約4000字の概要へ展開できる。
suggested_post_outline:
  overview_angle: "生成モデルの優劣より先に、データセットと tile 表現が自然言語で指示できる意味を保持しているかを問う。粗い表現が失敗を不可視化する仕組みを中心に書く。"
  analysis_axis: "既存ベンチマークの semantic collapse、MARIOPCG の高 fidelity 表現、モデル規模をまたぐ統制比較、表現粒度を上げた時に顕在化する failure mode を分けて分析する。"
  application_target: "Log_cdx の自然言語→ゲーム仕様／レベル生成 probe で、地形・敵・関係性を保持する中間表現と、表現可能性を分母にした instruction-following 評価を設計する。"
  pros_cons: "利点はモデル能力と表現限界を切り分けられること。弱点は高粒度 vocabulary と annotation のコストが増え、Mario の tile 表現から他ジャンルへの一般化を別途検証する必要があること。"
  verdict_pre: "部分採用。モデル比較の前に semantic coverage audit を入れる評価原則を採用する。"
---

## raw_excerpt

論文は、自然言語で制御する procedural content generation では、モデル性能だけでなく、言葉を対応づける構造表現とデータセットの意味的な細かさが結果を制約すると述べる。既存の Super Mario Bros. レベル生成ベンチマークでは、意味の異なる tile が同じ記号へまとめられ、gameplay に関係する tile が省かれることがある。そのため、自然言語では区別できる概念を出力表現では明示できず、grounding の失敗と表現自体の限界が混同される。

著者らは、意味的な範囲を広げた高 fidelity データセット MARIOPCG を導入し、複数の decoder-only language model を統制条件下で比較する。粗い表現では見えなかった instruction-following の制御失敗が、表現粒度を上げると小規模モデルで顕在化する。一方、大規模モデルも表現側が意味のある grounding を支える場合にのみ安定した挙動を示した。論文は新しい生成 architecture の提案より、表現の粒度が記述可能な指示の範囲と観測できる failure mode をどう変えるかの実証に焦点を置く。結論として、粗い意味表現で得た高い instruction-following 指標はモデル能力を過大評価し得るため、自然言語制御 PCG の評価では dataset semantic granularity を明示的に扱う必要があるとする。

## why_relevant_to_games

自然言語からレベル仕様を作る時、生成器を比較する前に、制作者が区別したい地形・敵・関係を中間表現と評価指標が保持しているかを点検する材料になる。
