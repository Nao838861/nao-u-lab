---
title: "OpenGame: Open Agentic Coding for Games"
url: https://arxiv.org/abs/2604.18394
collected_at: 2026-05-26T22:11:26+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-generation, llm-agent, coding-agent, browser-game, evaluation]
evaluated_at: "2026-05-26T22:17:14+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-26T22:26:00+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779801836817719"
posted:
  ts: "1779801836.817719"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779801836817719"
  char_count: 4408
  posted_at: "2026-05-26T22:26:00+09:00"
stale_after: "2026-06-25"
supersedes: []
next_action: none
gate_reason: >-
  isolated coding から playable game creation へ移るときの破綻要因、Game Skill / Template Skill / Debug Skill、OpenGame-Bench の Build Health / Visual Usability / Content Alignment が明確。
  Codex のゲーム制作運用にある template reuse、debug protocol、headless browser 評価と直接対応し、Phase 3 の概要で手法と適用先を十分に展開できる。
suggested_post_outline:
  overview_angle: "LLM coding agent を「ゲームを最後まで playable にする agent」に引き上げるため、skill library と実行接地評価を組み合わせる設計として書く。"
  analysis_axis: "Game Skill / Template Skill / Debug Skill、GameCoder-27B の training、OpenGame-Bench の三つの評価面を分解して、どこが通常の code benchmark と違うかを見る。"
  application_target: "Codex の prototype 制作で、既存 skeleton、検証済み debug 手順、headless + visual + intent alignment の評価セットを標準化する導線になる。"
  pros_cons: "メリットは playable diff の失敗モードを広く評価できること。デメリットは VLM judge や専用 model/training に依存する部分をそのまま移植しにくいこと。"
  verdict_pre: "部分採用"

---

## raw_excerpt
arXiv:2604.18394。2026-04-20 submitted。問題設定は、LLM/code agent が isolated programming tasks では成果を出しても、高レベル設計から fully playable game を作ると cross-file inconsistency、broken scene wiring、logical incoherence で崩れやすいという点。OpenGame は end-to-end web game creation のための open-source agentic framework として提案される。中心に Game Skill があり、Template Skill は経験から project skeleton library を増やし、Debug Skill は verified fixes の protocol を維持する。GameCoder-27B は game engine mastery 用に continual pre-training、supervised fine-tuning、execution-grounded reinforcement learning を使う。OpenGame-Bench は Build Health、Visual Usability、Intent Alignment を headless browser execution と VLM judging で評価する。

## why_relevant_to_games
Codex のゲーム制作サイクルで、template reuse、debug protocol、headless browser 評価をどう分けるかの外部事例になる。特に playable diff の検証を「build 成功」ではなく visual usability と intent alignment まで広げる入口。
