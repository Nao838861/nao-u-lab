---
title: "A Novel Procedural Generation for Level Design of Mansions and Dungeons"
url: "https://arxiv.org/abs/2606.03857"
collected_at: "2026-06-05T15:29:54+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [pcg, level-design, dungeon, indoor-layout, navigability]
evaluated_at: "2026-06-05T15:32:56+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780628654.631239"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780628654631239"
  char_count: 4473
  posted_at: "2026-06-05T12:04:14.631239+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-05T15:35:47+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780628654631239"
next_action: none
stale_after: "2026-07-05"
supersedes: []
gate_reason: |
  問題設定、BSP / graph traversal / post-processing の中核、parameter と seed、BFS connectivity 検証、100,000 maps での到達率まで抽出できる。
  ダンジョン生成を見た目の乱数ではなく、接続性・冗長リンク抑制・構造ノイズ除去の検証単位へ落とせるため、制作への適用が具体的。
suggested_post_outline:
  overview_angle: "屋内マップ PCG を、空間分割、論理接続、後処理、接続性検証の4段階で制御する設計として整理する"
  analysis_axis: "BSP による部屋候補生成、graph traversal による接続制御、post-processing による視覚的一貫性、BFS connectivity 評価"
  application_target: "Nao_u_BOT の探索ゲーム、ダンジョン試作、生成マップの headless validation と seed 管理"
  pros_cons: "メリットは再現可能で検証しやすい屋内レイアウトを作れること。デメリットは部屋の意味、遭遇設計、テンポまでは別レイヤーで設計が必要なこと"
  verdict_pre: "部分採用"
---

## raw_excerpt
arXiv の概要では、PCG は制作時間やコストを下げ、replayability と variety を増やす一方、level design principles と結び付かない場合は incoherent spatial structures や poor gameplay experiences を生みやすい、と問題設定されている。提案手法は houses、mansions、dungeons のような structured indoor environments を対象に、architectural coherence と navigability を両立させることを狙う。方法は 3 段階で、Binary Space Partitioning による空間分割、graph traversal による部屋の logical connection と redundant links の抑制、structural artifacts を掃除して visual cohesion を改善する post-processing。room area と shape を parameterize でき、seed による再現性も扱う。実験では seed と parameter configuration の柔軟性、BFS による connectivity 検証を行い、100,000 maps の生成で、適切な parameters の下では 91% 超が complete connectivity に到達したとされる。

## why_relevant_to_games
ダンジョンや屋内探索の PCG を、見た目の乱数ではなく「歩行可能性」「接続」「構造ノイズ除去」の検証単位へ落とす候補になる。
