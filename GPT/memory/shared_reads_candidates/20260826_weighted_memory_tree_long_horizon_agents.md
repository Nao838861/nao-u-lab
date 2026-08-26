---
title: "Weighted Memory Tree: Remembering What Matters for Long-Horizon LLM Agents"
url: "https://arxiv.org/abs/2608.20631v1"
collected_at: "2026-08-26T22:34:36+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-memory, long-horizon, game-development, evaluation]
evaluated_at: "2026-08-26T22:39:07+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-26T22:46:48.2450126+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787752001500119"
next_action: none
stale_after: "2026-09-25"
supersedes: []
posted:
  ts: "1787752001.500119"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787752001500119"
  char_count: 4465
  posted_at: "2026-08-26T22:46:48.2450126+09:00"
gate_reason: >-
  task / subtask / action の階層、動的 retention score、更新・減衰・fold の中核と、
  3モデルでの精度・token・poisoning 評価まで抽出でき、約4000字の概要へ展開できる。
  複数 playable diff をまたぐ制作履歴で、現行仕様と検証済み失敗を active に保つ用途へ具体化できる。
suggested_post_outline:
  overview_angle: "長期 agent memory の問題を保存量ではなく active set の選別問題として捉え直す"
  analysis_axis: "階層化、retention score の更新と減衰、fold 後の参照可能性、精度・token・poisoning の評価を分けて検証する"
  application_target: "ゲーム制作サイクルの feature / subtask / action 履歴を、現行仕様・未解決 failure・完了試行に分け、次の playable diff に必要な evidence だけを active context に残す運用"
  pros_cons: "長期制作の文脈量と古い判断の混入を同時に抑えられる一方、retention score の根拠設計と game-specific な再評価が必要"
  verdict_pre: "部分採用"
---

## raw_excerpt

LLM agent は計画、tool use、外部情報取得を含む multi-step task を解ける一方、実行履歴が長くなるほど推論 cost が増え、古い・無関係・誤誘導的な情報が reasoning を劣化させる。既存の memory 手法は履歴を整理・圧縮しても、どの記憶を active に残すかを決める仕組みが弱い。Weighted Memory Tree（WMT）は実行過程を task、subtask、action の階層に編成し、各 memory に動的な retention score を与える。event-based update と selection-based decay により score を更新し、有用な情報を保持し、完了 trajectory を fold し、utility の低い内容を抑制しつつ、fold 済み context へのアクセスも残す。評価は GAIA-Text 上で Qwen3-8B、Gemma 4 E4B、Llama-3.1-8B を使い、ablation と memory-poisoning experiment も実施した。linear memory と比べて accuracy は平均 9.97 percentage points 向上し、prompt token 使用量は 32.8%減少したと報告される。poisoning 実験では unreliable information の持続と伝播が抑えられた。著者らは、long-horizon memory では保存量より「何を active に残すか」の決定が重要だと結論づけている。

## why_relevant_to_games

複数 commit・playtest・修正をまたぐゲーム制作で、現行仕様、未解決 failure、完了した試行、古い判断を active / folded に分ける memory 設計の参照になる。制作 agent が過去の失敗情報や陳腐化した設計を次の playable diff へ持ち越す場面の検証候補として使える。
