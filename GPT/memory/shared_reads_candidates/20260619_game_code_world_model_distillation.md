---
title: Distilling Game Code World Model Generation into Lightweight Large Language Models
url: https://arxiv.org/abs/2605.24375
collected_at: 2026-06-19T09:59:20+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-rules, executable-spec, llm, world-model, verification]
evaluated_at: 2026-06-19T10:02:07+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1781831223.301279"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781831223301279"
  char_count: 3889
  posted_at: "2026-06-19T10:08:26+09:00"
status: posted
candidate_status: posted
last_reviewed_at: 2026-06-19T10:08:26+09:00
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781831223301279"
next_action: none
stale_after: "2026-07-19"
supersedes: []
gate_reason: |-
  rules、legal actions、state transitions、observations、rewards を executable model にする問題設定と、SFT / RLVR / verification framework の評価軸が明確。
  ゲーム制作記憶を自然文 lesson で終わらせず、prototype 生成を検証できる executable spec へ落とす接続が具体的。
suggested_post_outline:
  overview_angle: "ゲームルールを自然文メモではなく、検証可能な Code World Model に変換する研究として書く。"
  analysis_axis: "30 games dataset、structural / semantic verification、SFT と RLVR の役割分担、execution-level adherence を軸に分析する。"
  application_target: "Nao_u_BOT の企画、lesson、ゲーム制作ルールを、合法手、状態遷移、勝敗条件、報酬、テストケースへ分解する。"
  pros_cons: "利点は自然文の曖昧さを検証可能な spec に近づける点。欠点は複雑な手触りや演出評価を code model に落とすと情報が欠けやすい点。"
  verdict_pre: "採用。モデル蒸留そのものより、executable spec と verifiable rewards の設計を採用する。"
---

## raw_excerpt
arXiv abstract と 2026-06-10 #all-nao-u-lab raw からの抄訳メモ。LLM は自然言語から executable code を生成できるため、AI agents 用の environment を自動構築する可能性がある。Code World Models は、game rules を Python implementations に変換し、Monte Carlo Tree Search のような solvers と組み合わせられる。論文はゲーム設定に絞り、rules、legal actions、state transitions、observations、rewards を実装する executable models を Game Code World Models と呼ぶ。

既存の CWM 生成は frontier models と inference-time refinement loops に依存しがちで、accessibility と scalability に制約がある。そこで論文は 30 games の curated dataset、structural / semantic game properties に対する verification framework、Supervised Fine-Tuning と Reinforcement Learning with Verifiable Rewards を組み合わせた post-training pipeline を提示する。Qwen2.5-3B-Instruct では、SFT が syntactic correctness を増やし、RLVR が execution-level adherence to game rules を改善したとされる。

Slack raw では、生成モデルそのものよりも、生成物をルール記述、合法手、状態、操作、勝敗/失敗条件、観測可能性、テストケースに分解し、deterministic に報酬や採否を返す枠組みが注目されていた。ゲーム制作記憶を自然文 lesson だけでなく、将来の prototype 生成を検証できる executable spec に近づける問いとして拾われていた。

## why_relevant_to_games
企画や lesson を自然文のまま溜めるだけでなく、勝敗条件・入力制約・状態遷移・報酬を検証可能な小単位へ落とす候補になる。
