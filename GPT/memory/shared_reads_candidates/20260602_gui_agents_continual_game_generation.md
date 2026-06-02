---
title: GUI Agents for Continual Game Generation
url: https://arxiv.org/abs/2605.28258
collected_at: 2026-06-02T13:59:22.2815508+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, ai-playtesting, llm-agent, game-generation, evaluation]
evaluated_at: 2026-06-02T14:02:36+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: 2026-06-02T14:02:36+09:00
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-02T14:02:36+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-02"
supersedes: []
gate_reason: "playable なゲーム生成を一回のコード生成ではなく、GUI agent による実プレイ評価を含む継続ループとして扱う点が明確。PlaytestArena / Play2Code / rubric pass-rate 66.8% まであり、手法・評価・限界を概要に展開できる。Nao_u 環境の browser playtest と subjective feedback の接続も具体的。"
suggested_post_outline:
  overview_angle: "ゲーム生成の失敗を「コードが出ない」ではなく「ブラウザで触って遊べる状態まで閉じない」と捉え、GUI agent を評価者兼改善入力にする軸で書く。"
  analysis_axis: "PlaytestArena の expected in-play behaviors、Play2Code の game agent / GUI agent / shared memory、traceable だが揺れる GUI feedback の限界を分けて分析する。"
  application_target: "playable diff 後の headless/browser playtest、rubric 化された in-play behavior、Codex の実装ループに GUI 操作ログを戻す仕組み。"
  pros_cons: "メリットは実プレイに近い検証と改善ループの明確化。デメリットは GUI agent feedback の主観的揺れと、人間プレイの楽しさ判定を置換しきれない点。"
  verdict_pre: "部分採用。自動テスターとして全面委任せず、playable 到達と明白な操作破綻の検出に使う。"
---

## raw_excerpt
arXiv 2605.28258。原文断片: "Generating a game is not the same as making one that can be played." 論文は、ゲーム生成を一回のコード生成ではなく、ブラウザで実際にプレイする GUI agent を含む継続ループとして扱う。客観評価側では PlaytestArena を導入し、8 ジャンル・200 件の browser-based game generation tasks と expected in-play behaviors の rubric を組み合わせ、GUI agent がビルドを読み込んでプレイし採点する。主観テスター側では Play2Code を提案し、game agent と GUI agent が shared memory を持って coding と playing の往復を続ける。実験では frontier models でも直接 playable games を生成するのは難しく、Play2Code は rubric pass-rate 66.8% と報告されている。GUI playtester の feedback は human report より traceable だが、人間テスターに似た idiosyncratic な揺れもあるとされる。

## why_relevant_to_games
Nao_u 環境の headless / browser playtest / subjective feedback の橋渡し材料。playable diff 後に「本当に触れるか」を GUI agent で検出する設計の候補になる。
