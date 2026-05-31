---
title: "Co-Evolving LLM Decision and Skill Bank Agents for Long-Horizon Tasks"
url: "https://arxiv.org/abs/2604.20987"
collected_at: "2026-06-01T03:45:15+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm-agents, skill-bank, long-horizon, game-ai]
evaluated_at: "2026-06-01T03:48:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-06-01T03:48:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-01T03:48:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-01"
supersedes: []
gate_reason: |-
  decision agent と skill bank agent を分け、unlabeled rollout から reusable skill を抽出して次 episode に再利用する中核が明確。
  六つの game environments、8B base model、frontier LLM baseline 比 25.1% 以上改善という評価メモがあり、制作サイクルの prototype skill bank に具体適用できる。
suggested_post_outline:
  overview_angle: "long-horizon game agent が毎回手順を再発見しないために、過去 rollout から reusable skill bank を共進化させる手法として整理する。"
  analysis_axis: "decision agent と skill bank agent の役割分担、unlabeled rollout の分節化、skill 検索が episode 内の行動選択へどう戻るか、game environments での評価を分けて読む。"
  application_target: "Nao_u_BOT の prototype 制作で、headless repair、成功した改修手順、playtest で発見した操作列を skill bank として再利用する設計。"
  pros_cons: "メリットは長期タスクでの再発見コスト削減と経験の構造化。デメリットは text-rendered state 前提、skill 粒度の暴走、誤った手順の固定化。"
  verdict_pre: "部分採用。ゲーム内 agent そのものより、制作ログと評価ログから再利用可能な手順を切り出す運用設計として採る。"
---

## raw_excerpt
原文要旨メモ。COSPLAY は、long-horizon interactive tasks に対して、行動を選ぶ LLM decision agent と、過去 rollout から reusable skills を発見・維持する skill bank agent を共進化させる枠組み。Decision agent は現在の state に応じて skill bank から候補 skill を検索し、意図を更新しながら action を選ぶ。一方で skill bank agent は、agent の unlabeled rollouts を解析し、再利用できる skill を分節化して bank に追加する。これにより、agent が毎回同じ小手順を再発見するのではなく、過去の経験からできた skill を次の episode で参照する構造になる。

検索結果の要旨では、六つの game environments で実験し、8B base model の COSPLAY が単一プレイヤー game benchmarks で frontier LLM baselines より平均 reward を 25.1% 以上改善し、multi-player social reasoning games でも競争力を保つとされる。観測は text-rendered state や natural language state summaries に変換され、action も discrete text actions として扱われるため、視覚リッチな環境への直接適用には別課題が残る。

## why_relevant_to_games
Nao_u_BOT の制作サイクルで、過去 prototype の成功手順や headless repair を「その場限りの記録」ではなく skill bank として再利用する設計材料になる。
