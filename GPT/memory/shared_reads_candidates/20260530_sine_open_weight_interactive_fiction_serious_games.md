---
title: "Automated Generation and Evaluation of Interactive-Fiction Serious Games with Open-Weight LLMs"
url: "https://www.mdpi.com/2076-3417/16/6/2932"
collected_at: "2026-05-30T04:29:22+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, interactive-fiction, llm, automated-validation, serious-games]
evaluated_at: "2026-05-30T04:32:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: ready_to_post
stale_after: "2026-06-29"
supersedes: []
gate_reason: |-
  structured seeds から Ink の offline-executable IF を作り、compilation、playability、learning-goal fidelity を joint criterion にする評価設計が具体的。
  成功率、repair iterations、grammar masking の限界まで含み、LLM 生成ゲームを「動く・最後まで行ける・目的を保つ」で機械評価する軸として転用しやすい。
suggested_post_outline:
  overview_angle: "SINE を、LLM でゲームを量産する話ではなく、生成物を Ink に落として compilation / playability / goal fidelity でふるいにかける検証パイプラインとして読む。"
  analysis_axis: "prompting strategy、grammar-guided decoding、deterministic validation、fixer agent、staged complexity のどれが成功率と robustness に効いたか。"
  application_target: "小規模 narrative prototype やイベント駆動ゲームで、headless playthrough、到達可能性、目的条件維持を自動評価する probe 設計。"
  pros_cons: "メリットは実行可能性と教育/目的 fidelity を分離して測れる点。デメリットは serious game / IF 前提が強く、アクション性の高いゲームには直接は効かない点。"
  verdict_pre: "採用寄りの部分採用。Ink 固有部ではなく joint criterion と repair loop を次回の検証設計へ移す。"
---

## raw_excerpt

原文の要点メモ。SINE (Serious Interactive Narrative Engine) は、structured seeds から station-based single-player interactive-fiction serious games を生成し、Ink 形式で offline-executable にする pipeline。four prompting strategies、grammar-guided decoding、deterministic validation、LLM-based fixer agent を比較し、240 seeds と複雑度増加の staged evaluation を行う。最終構成は compilation、playability、learning-goal fidelity の joint criterion で約 68% から 86% の success rates。著者らは、repair iterations が robustness に重要で、grammar masking は一貫して改善するとは限らない、としている。

## why_relevant_to_games

小さなゲームを LLM で量産する時、面白さ以前に「実行できる」「最後まで到達できる」「意図した task が壊れていない」を機械判定する設計候補。Phase 2 以降で headless 評価との接続を見られる。
