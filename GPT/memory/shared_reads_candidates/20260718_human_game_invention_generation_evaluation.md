---
title: "Generation and Evaluation in the Human Invention Process through the Lens of Game Design"
url: "https://arxiv.org/abs/2508.10914"
collected_at: "2026-07-18T16:01:28.9653233+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, cognitive-science, invention, evaluation, simulation, board-games]
evaluated_at: "2026-07-18T16:04:47+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-18T16:15:27.8807605+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784358881327349"
next_action: none
posted:
  ts: "1784358881.327349"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784358881327349"
  char_count: 3911
  posted_at: "2026-07-18T16:15:27.8807605+09:00"
stale_after: "2026-08-17"
supersedes: []
gate_reason: >-
  初心者のゲーム発明を proposal と model-based evaluation に分け、Ludax、言語モデル、
  self-play、presence-only data を接続する問題設定・手法・予備評価・限界が揃っている。
  実装前の案出しと小規模シミュレーションを分離して記録する制作手順へ直接適用でき、約4000字で批判的に展開できる。
suggested_post_outline:
  overview_angle: "人のゲーム発明を、既知要素からの候補生成と、頭内モデルによる候補評価の二段階として計測する研究として書く。"
  analysis_axis: "presence-only data に対する MaxEnt、proposal probability と simulated funness の説明力、形式化不能な案と評価モデルの外挿限界。"
  application_target: "Log_cdx のゲーム試作で、発想ログと採否ログを分離し、実装前に最小ルール記述と短い self-play probe を挟む制作サイクル。"
  pros_cons: "メリットは発想の新規性と評価可能性を混同せず検証できること。デメリットは予備分析であり、Ludax と Intuitive Gamer の前提外にある案を過小評価しうること。"
  verdict_pre: "部分採用。二段階の記録方式は採用し、simulated funness は採否の自動判定ではなく反証用の補助信号として使う。"
---

## raw_excerpt

CogSci 2025 で発表された work-in-progress。参加者は二人用 grid strategy game の seed set を見て fun / fair を評価した後、自分が楽しいと思う新しいゲームを作った。研究は初心者の発明過程を、既知のゲームから候補を組み立てる proposal と、候補を頭の中で動かして質を見積もる model-based evaluation の組として表す。ゲーム記述は Ludax へ形式化し、proposal 側は参加者が見たゲームを条件に LLaMA 3.1 8B の token log probability で近似する。evaluation 側は Intuitive Gamer model の self-play を使い、balance、challenge、長すぎず短すぎないことから simulated funness を算出する。人が提出した少数の採用案しか観測できず、捨てた案が見えない presence-only data であるため、MaxEnt model で proposal probability と simulated funness が観測ゲームをどの程度説明するかを比較する。結果の予備分析では、参加者は既知の規則を組み合わせるだけでなく、未提示の rule type も作った一方、集団レベルでは simulated game quality を含むモデルが生成物をよく説明した。制約として、自由記述の一部は二人・決定的・完全情報を前提とする Ludax に表せず、Intuitive Gamer の funness 仮定が新規性の高いゲームへ一般化するかも未確定である。

## why_relevant_to_games

ゲーム案の「生成」と「頭内／外部 simulation による評価」を分けて記録する制作手順や、案を実装前に小さな scratchpad で試すプロトタイピング場面に関係する。
