---
title: Runtime Evaluation of Procedural Content Generation in an Endless Runner Game Using Autonomous Agents
url: https://arxiv.org/abs/2605.01783
collected_at: 2026-05-17T20:52:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, procedural-generation, playtesting, agent-evaluation, runtime-validation]
evaluated_at: "2026-05-17T21:00:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-17T20:47:29+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779018447709959"
posted:
  ts: "1779018447.709959"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779018447709959"
  char_count: 3945
  posted_at: "2026-05-17T20:47:29+09:00"
stale_after: "2026-06-16"
supersedes: []
next_action: none
gate_reason: |
  PCG の失敗を blocked / repetitive / unsolvable などの runtime 問題として置き、生成ループ内に先行 scanner と traversal agent を入れる手法が具体的に読める。
  Nao_u_BOT の headless 判定や到達不能地形検出に直接接続でき、評価軸も playability / diversity / controllability / performance として概要化できる。
suggested_post_outline:
  overview_angle: "PCG を生成後レビューではなく、プレイヤー到達前に自律 agent が検査する runtime validation loop として読む。"
  analysis_axis: "constraint-driven generation、aerial scanner、ground traversal agent、physics sweep / ray cast / structured crash report がどの失敗を検出するか。"
  application_target: "graze_log / shot_log 系の headless 評価で、プレイヤーより前に未来地形・弾幕・通路を検査して playable diff の失敗原因を構造化する場面。"
  pros_cons: "利点は PCG の破綻を実プレイ前に検出できること。弱点は endless runner 依存があり、面白さや学習曲線の評価は別軸で補う必要があること。"
  verdict_pre: "部分採用"

---

## raw_excerpt
arXiv abstract / search result からの要点抜粋。PCG は手作業のレベル設計なしにコンテンツを作れる一方、生成物が unbalanced / blocked / repetitive / technically unsolvable になる評価問題を持つ。論文は endless-runner game "Momentum" を題材に、runtime terrain generation、environment object spawning、autonomous agent-based evaluation を 1 つの gameplay loop に統合する。タイルと環境オブジェクトはプレイヤー進行に応じて生成され、配置は WFC に着想を得た constraint-driven mechanism を使う。評価側では、プレイヤーより先行する aerial scanner と ground-traversal agent が生成された通路を検査し、ray casting、volumetric physics sweeps、obstacle-layer filtering、structured crash reporting で問題シナリオを検出する。評価軸として playability / diversity / controllability / runtime performance も扱う。

## why_relevant_to_games
PCG を「生成して終わり」ではなく、プレイヤー到達前に headless/agent が通路を検査する loop として扱う材料。graze_log / shot_log の headless 判定を runtime validation に寄せる発想の候補。
