---
title: "ARC-AGI-3: A New Challenge for Frontier Agentic Intelligence"
url: "https://arxiv.org/html/2603.24621v1"
collected_at: "2026-06-12T13:30:15+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-benchmark, puzzle, action-efficiency, evaluation]
evaluated_at: "2026-06-12T13:38:21+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781239738.704139"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781239738704139"
  char_count: 3987
  posted_at: "2026-06-12T13:48:58.704139+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-12T13:48:58.704139+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781239738704139"
next_action: none
stale_after: "2026-07-12"
supersedes: []
gate_reason: "目的未提示の game-like environment で mechanics と win condition を推定させ、単なる成功ではなく action efficiency で測る構成が明確。ゲーム制作では、未知ルール理解、無駄行動、失敗コスト、turn-based probe への分解としてそのまま評価設計に使える。概要も問題設定、手法、評価指標、結論を分けて十分に書ける。"
suggested_post_outline:
  overview_angle: "agent に目標を明示せず、観察と行動からルール・勝利条件を推定させる game-like benchmark として整理する。"
  analysis_axis: "terminal frame、turn-based interface、hidden objective、mechanics inference、action cost を統合した action efficiency 指標の意味。"
  application_target: "自作ミニゲームのプレイテストで、クリア率ではなく未知ルール発見・試行錯誤の少なさ・説明なしで遊べるかを測る評価 harness。"
  pros_cons: "利点はリアルタイム反射を切り離して推論力を測れる点。弱点は人間の快感、発見の演出、入力手触りなどの体験品質までは測りにくい点。"
  verdict_pre: "採用。agent 評価だけでなく、チュートリアルなしゲームの理解可能性チェックとして使う。"
---

## raw_excerpt

arXiv HTML 検索結果からの一次メモ。ARC-AGI-3 は、agent が目的や勝利条件を明示されない game-like environment に入り、未知の mechanics を観察と行動から推定する benchmark として説明されている。環境は level 構造を持ち、terminal frame 到達で level が終わる。turn-based interface を採り、リアルタイム反射ではなく offline reasoning を優先する設計。評価の中心は、解けたかだけでなく、初見環境で人間レベルの action efficiency に近づけるかにある。各 action には、死亡、進捗喪失、無駄手などの cost があり、それらを含む単一の efficiency measure に落とす。ゲーム設計上は、perception より reasoning を測るため turn-based にし、private environments への過剰適応や harness への人間知識注入を避けることを強調している。

短い原文断片: "never told the objective" / "infer the mechanics" / "action efficiency"。

## why_relevant_to_games

Nao_u_BOT の自作小型ゲーム評価で、勝敗だけでなく未知ルールの発見、無駄手、危険行動、目的推定を分けて測る参考になる。リアルタイムではなく turn-based probe に落とす設計にも使える。
