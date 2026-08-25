---
title: "Beyond Final Scores: A Systematic Evaluation of Agents for Long-Horizon AI Research and Development"
url: "https://arxiv.org/abs/2608.13417"
collected_at: "2026-08-26T01:33:39+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, evaluation, long-horizon, harness, experience-reuse, game-development]
evaluated_at: "2026-08-26T01:37:33+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-26T01:46:16+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787676350878149"
next_action: none
stale_after: "2026-09-25"
supersedes: []
posted:
  ts: "1787676350.878149"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787676350878149"
  char_count: 4280
  posted_at: "2026-08-26T01:46:16+09:00"
gate_reason: >-
  36 task・756 rollout の比較から、最終値だけでは見えない着想・実装・改善保持を rule-based metric で分解し、
  経験再利用も task 内外の controlled comparison で測っている。長時間の AI ゲーム制作 loop を診断する評価軸へ直接移せ、
  問題設定・手法・定量結果・限界を含む約4000字の概要を一次論文から構成できる。
suggested_post_outline:
  overview_angle: "最終スコア偏重を離れ、長時間 agent のどこで進歩が得られ失われるかと、経験が次の判断を助けるかを分けて測る評価設計"
  analysis_axis: "Solution Framing / Execution / Feedback Control、avg@3 と best@3、task 内外の経験再利用 counterfactual が何を識別できるか"
  application_target: "Log_cdx の長時間ゲーム prototype・headless 改善 cycle に、peak 到達、regression、回復、lesson transfer の deterministic 記録を入れる評価 harness"
  pros_cons: "失敗箇所と再現性を分離し、記憶の正負効果まで測れる一方、技術 artifact 中心の36 taskから遊びの質へ移すには verifier と評価信号の再設計が必要"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv:2608.13417v1（2026-08-13）。7つの frontier model を、Model Development、System Optimization、Puzzle & Challenge、CUDA の36 long-horizon task、各3 rollout、合計756 rolloutで比較する。各 task は2〜12時間の予算、suboptimal な初期 artifact、expert reference、automated verifierを持ち、agentには各iteration後のcommitとexperiment journalの維持を求める。最終 score に加え、processを Solution Framing（早期に強い方向を見つけたか）、Execution（提案を実行可能・正しいartifactへ変換したか）、Feedback Control（到達したpeakを保持し、regressionから回復したか）へ分解し、verifierとtrajectory signalからdeterministicに算出する。

結果では、avg@3のmodel間差0.237に対しbest@3差は0.122で、最高到達点より再現性の差が大きい。252件のbest-seed solution中、novel approach判定は3件だった。経験再利用は、同一task内ではbranch point後にcontext・disk notes・code commentsを消したcounterfactualと比較し、task間ではsource trajectoryから抽出したlessonsだけを別workspaceのtargetへ渡して測る。経験は改善にも悪化にも働き、harness差は主にrun-to-run stabilityへ現れたと報告する。

## why_relevant_to_games

長時間のAIゲーム制作・headless改善を、最終スコアだけでなく「着想、実装、改善保持」のどこで失敗したかに分けて記録する評価設計へつながる。過去lessonの再利用が次のprototypeを助けたか阻害したかをcounterfactualに測る参照にもなる。
