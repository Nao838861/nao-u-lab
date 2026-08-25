---
title: "Beyond Final Scores: A Systematic Evaluation of Agents for Long-Horizon AI Research and Development"
url: "https://arxiv.org/abs/2608.13417"
collected_at: "2026-08-26T01:33:39+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, evaluation, long-horizon, harness, experience-reuse, game-development]
---

## raw_excerpt

arXiv:2608.13417v1（2026-08-13）。7つの frontier model を、Model Development、System Optimization、Puzzle & Challenge、CUDA の36 long-horizon task、各3 rollout、合計756 rolloutで比較する。各 task は2〜12時間の予算、suboptimal な初期 artifact、expert reference、automated verifierを持ち、agentには各iteration後のcommitとexperiment journalの維持を求める。最終 score に加え、processを Solution Framing（早期に強い方向を見つけたか）、Execution（提案を実行可能・正しいartifactへ変換したか）、Feedback Control（到達したpeakを保持し、regressionから回復したか）へ分解し、verifierとtrajectory signalからdeterministicに算出する。

結果では、avg@3のmodel間差0.237に対しbest@3差は0.122で、最高到達点より再現性の差が大きい。252件のbest-seed solution中、novel approach判定は3件だった。経験再利用は、同一task内ではbranch point後にcontext・disk notes・code commentsを消したcounterfactualと比較し、task間ではsource trajectoryから抽出したlessonsだけを別workspaceのtargetへ渡して測る。経験は改善にも悪化にも働き、harness差は主にrun-to-run stabilityへ現れたと報告する。

## why_relevant_to_games

長時間のAIゲーム制作・headless改善を、最終スコアだけでなく「着想、実装、改善保持」のどこで失敗したかに分けて記録する評価設計へつながる。過去lessonの再利用が次のprototypeを助けたか阻害したかをcounterfactualに測る参照にもなる。
