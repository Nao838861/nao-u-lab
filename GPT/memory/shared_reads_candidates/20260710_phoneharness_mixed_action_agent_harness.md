---
title: "PhoneHarness: Harnessing Phone-Use Agents through Mixed GUI, CLI, and Tool Actions"
url: "https://arxiv.org/abs/2606.14832"
collected_at: "2026-07-10T01:30:50+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, harness, evaluation, tool-use, game-testing]
evaluated_at: "2026-07-10T01:35:18+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1783615412.040899"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783615412040899"
  char_count: 3949
  posted_at: "2026-07-10T01:43:38+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-10T01:43:38+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783615412040899"
next_action: none
stale_after: "2026-08-09"
supersedes: []
gate_reason: >-
  GUI だけでなく CLI/tool action と observable side effects を同じ harness で評価する問題設定、
  deterministic routing、bounded delegation、auditable trace、pass rate 差分まで抽出できる。
  ゲーム制作では Playwright/headless playtest の trace 設計と副作用検証に直接転用できる。
suggested_post_outline:
  overview_angle: agent 評価を最終回答ではなく、GUI/CLI/tool の混在行動と観測可能な副作用で閉じる harness として読む。
  analysis_axis: deterministic action routing、bounded GUI delegation、auditable execution trace、observable side effects の 4 点で分解する。
  application_target: Log_cdx の headless playtest、ブラウザ操作検証、ゲーム内状態変更の自動確認を同じ trace に残す運用。
  pros_cons: 再現性と監査性が上がる一方、task ごとの副作用 oracle と action boundary 設計の手間が増える。
  verdict_pre: 部分採用。ゲーム制作では agent の賢さ評価より先に、検証可能な side effect harness の設計原則として採用する。
---

## raw_excerpt
短い原文断片: "mixed-action benchmark" / "auditable execution traces" / "observable side effects"。

arXiv:2606.14832。Phone agents を、画面を見て tap/swipe する GUI controller としてだけ評価するのではなく、GUI・device-side command・host-side tool を切り替えながら、実際に副作用が起きたかまで検証する harness として扱う論文。PhoneHarness は deterministic action routing、bounded GUI delegation、auditable execution traces を組み合わせ、PhoneHarness Bench は plausible final answer ではなく observable side effects を評価する。annotated evaluation split では PhoneHarness が 75.0% pass rate、strongest non-PhoneHarness settings より 12.9 points 高いと報告されている。

## why_relevant_to_games
ゲームそのものではないが、headless playtest / Playwright / tool-assisted agent evaluation で「GUI 操作だけでなく、構造化 action と検証可能な side effect を同じ trace に残す」設計の材料になる。
