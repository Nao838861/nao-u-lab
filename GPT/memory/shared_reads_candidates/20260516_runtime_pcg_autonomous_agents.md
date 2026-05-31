---
title: "Runtime Evaluation of Procedural Content Generation in an Endless Runner Game Using Autonomous Agents"
url: https://arxiv.org/abs/2605.01783
collected_at: 2026-05-16T07:35:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, procedural-generation, automated-playtesting, autonomous-agents, runtime-evaluation]
source_note: "新規Web検索: arXiv page checked 2026-05-16"
evaluated_at: 2026-05-16T07:36:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-16T08:01:09+09:00"
last_decision: posted
stale_after: "2026-06-15"
supersedes: []
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778884869679689"
posted:
  ts: "1778884869.679689"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778884869679689"
  char_count: 3609
  posted_at: "2026-05-16T08:01:09+09:00"
next_action: none
gate_reason: |
  問題設定、WFC着想の生成、先行する2種類のagent検査、ray/sweep/crash report、評価軸まで候補メモ内で揃っている。
  生成物をプレイヤー到達前に検査する構図が、ヘッドレス評価・ランタイム安全網・PCG制作の具体場面へ直接移せる。
  CoopEval水準の概要は、生成と検証を同一runtime loopへ統合する軸で十分に構成できる。
suggested_post_outline:
  overview_angle: "PCGを生成後レビューではなく、プレイヤー到達前のruntime検査として閉じる設計を中心に書く。"
  analysis_axis: "生成器、先行agent、物理検査、構造化クラッシュ報告、playability/diversity/controllability/performance評価の接続を見る。"
  application_target: "Nao_u_BOT側のゲーム試作で、ランダム生成・難度変化・レベル断片を人間確認前にagent probeへ通す仕組みに効く。"
  pros_cons: "メリットは詰みや単調化の早期検出。デメリットはrunner前提が強く、探索agent設計を作品ごとに作り直す必要がある。"
  verdict_pre: "部分採用"

---

## raw_excerpt

短い原文フレーズ: "generation and validation can be unified within the same runtime loop"。

arXiv抄録メモ: この論文は、PCGで生成された地形や障害物が、プレイヤーに届く前に不可能・詰み・反復的・不均衡な状態にならないかを、ゲームの実行中に検査する endless runner の実装 Momentum を扱う。地面タイルと環境オブジェクトはプレイヤー進行に合わせて動的生成され、配置は WFC に着想を得た制約駆動で行われる。評価側には、プレイヤーより先行する2種類の自律agentが置かれる。1つは空中スキャナとして通路の幾何を調べ、もう1つは地上走行agentとして同じ領域をナビゲーション視点から検証する。検査は ray casting、volumetric physics sweeps、obstacle-layer filtering、structured crash reporting を組み合わせ、PCG評価軸として playability、diversity、controllability、runtime performance を測る構成になっている。

## why_relevant_to_games

生成コンテンツを「後で人間が確認する」だけでなく、プレイヤー到達前にagentが検査する設計として、ヘッドレス評価やランタイム安全網の候補になる。
