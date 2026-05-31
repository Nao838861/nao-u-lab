---
title: "GBQA: A Game Benchmark for Evaluating LLMs as Quality Assurance Engineers"
url: https://arxiv.org/abs/2604.02648
collected_at: 2026-05-26T22:11:26+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-testing, qa, llm-agent, benchmark, evaluation]
evaluated_at: "2026-05-26T22:17:14+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-26T22:26:00+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779801836076109"
posted:
  ts: "1779801836.076109"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779801836076109"
  char_count: 3551
  posted_at: "2026-05-26T22:26:00+09:00"
stale_after: "2026-06-25"
supersedes: []
next_action: none
gate_reason: >-
  LLM を実行環境内の QA engineer として扱う問題設定、GBQA のゲーム数・バグ数・注入/検証構成、baseline agent と 48.39% 上限という評価結果が候補内で取れる。
  自作ゲームの headless 評価や bot policy 検証を「何を見逃したか」まで測る軸に直結し、CoopEval 水準の概要に必要な問題設定・手法・評価・結論が揃っている。
suggested_post_outline:
  overview_angle: "ゲーム QA を LLM agent の長期探索・実行環境理解・バグ発見能力の benchmark として定義する、という軸で概要化する。"
  analysis_axis: "human-verified bug set、multi-agent bug injection/validation、interactive ReAct baseline、verified bug discovery rate の限界を分けて分析する。"
  application_target: "graze_log_cdx などの playable diff 検証で、単なるクリア可否ではなく event-derived bug 発見率・再現性・見逃し分類を作るための評価設計に効く。"
  pros_cons: "メリットは QA 評価の粒度が具体化すること。デメリットは benchmark 化されたバグが自作 prototype の主観的違和感や game feel までは拾いにくいこと。"
  verdict_pre: "部分採用"

---

## raw_excerpt
arXiv:2604.02648。2026-04-03 submitted、ICLR 2026 workshop paper。ゲーム開発を、LLM が実行環境内でバグを自律発見できるかを測る代表 domain として使う。GBQA は 30 games と 124 human-verified bugs を含み、難易度を 3 段階に分ける。benchmark は multi-agent system で games を作り bug を注入し、人間 expert が correctness を確認する。baseline interactive agent は multi-round ReAct loop と memory mechanism を持ち、long-horizon exploration でバグ検出を試す。実験では frontier LLM でも autonomous bug discovery は難しく、best-performing model でも verified bugs の 48.39% に留まる、という結果が示されている。

## why_relevant_to_games
Nao_u 側の headless 評価や bot policy 検証を「ゲームQAとして何を見落とすか」の候補軸にできる。制作物の自動検査で、静的コード成功と実プレイ上のバグ発見を分ける材料になる。
