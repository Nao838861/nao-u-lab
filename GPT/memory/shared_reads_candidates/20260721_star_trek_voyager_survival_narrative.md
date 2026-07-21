---
title: "Star Trek: Voyager - Across the Unknown reinvents TV storytelling for survival strategy - Narrative Notebook #3"
url: "https://www.gamedeveloper.com/design/star-trek-voyager-across-the-unknown-reinvents-episodic-storytelling-for-survival-strategy-narrative-notebook-4"
collected_at: "2026-07-21T11:02:00.9428358+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, narrative-design, survival-strategy, quest-design, adaptation, systemic-storytelling]
evaluated_at: "2026-07-21T11:08:54+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-21T11:08:54+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-21T11:08:54+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-20"
supersedes: []
gate_reason: >-
  198話を約30話・12 sector・三層 event へ圧縮し、crew availability、成功確率、負傷・死亡、後続 reward を
  横断状態として結ぶ手法が具体的である。原作再現と可変 survival play の両立を制作工程へ移せ、約4000字の概要を構成できる。
suggested_post_outline:
  overview_angle: "固定された長編原作を、共有状態が干渉する可変 quest network へ翻訳する設計"
  analysis_axis: "episode 選別、main/side/random の三層化、crew と resource の競合、確率、長期 reward、原作順序の再編集を一つの因果系として分析する"
  application_target: "既存設定や長い物語を prototype 化する際、人物・資源・mission の共有状態から A/B/C plot の干渉を生む quest 設計"
  pros_cons: "長所は既知の物語でも選択と損失を生めること。短所は確率依存が人物ドラマを偶然事故へ薄め、原作知識が最適解の探索を歪める危険があること"
  verdict_pre: "部分採用"
---

## raw_excerpt

本文要点の日本語メモ。『Star Trek: Voyager - Across the Unknown』は、全7 season・198 episode の TV 作品から約30 episode を選び、12 sector を進む survival strategy の mission 構造へ圧縮している。story event は、進行に結び付く multi-stage の main quest、任意の惑星で開始する side quest、dialogue tree だけで解決する random event の三層。space combat、選択肢、異なる skill を持つ3人の crew を送る away mission を組み合わせ、失敗は負傷・死亡・game over まで波及する。複数 mission を並行させることで、ある人物が別任務で不在になり次の成功確率が下がるなど、TV の A/B/C plot に似た干渉が生まれる。

選択肢の多くは成功確率を伴い、正しい dialogue を暗記しても survival を確定できない。救出できた人物や獲得した技術は後続 event の成功率を上げるが、取得自体が保証されないため強い narrative/systemic reward として扱える。原作 episode の順序もそのまま写さず、離れていた二話を一つの quest chain に再構成し、限られた text box と open-ended play の中で人物への愛着と選択余地を残す。原作再現は fixed branching story ではなく、resource pressure、確率、crew availability、任意 mission の重なりで既知の物語を変形させる設計として実装されている。

## why_relevant_to_games

長い原作や設定資料を、main / optional / random event と共有 resource・人物状態へ分解し、既知の物語でもプレイごとに因果が交差する quest structure を設計する場面に使える。
