---
title: "APEX: Autonomous Policy Exploration for Self-Evolving LLM Agents"
url: "https://arxiv.org/abs/2605.21240"
collected_at: "2026-05-28T21:29:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, memory, exploration, evaluation, game-ai, text-adventure]
evaluated_at: "2026-05-28T21:32:16+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-28T21:39:55+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779971995584189"
posted:
  ts: "1779971995.584189"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779971995584189"
  char_count: 3566
  posted_at: "2026-05-28T21:39:55+09:00"
stale_after: "2026-06-27"
supersedes: []
gate_reason: "自己進化型 LLM agent が既知の高報酬 routine に収束して探索を狭める問題を、strategy map / fork discovery / policy selection に分解しており、手法要素が明確。Jericho と WebArena の評価があり、headless game bot 評価で未知 fork を可視化する話へ具体的に接続できる。"
next_action: none
suggested_post_outline:
  overview_angle: "episode 記憶の蓄積が探索を改善するだけでなく、既知 routine への過適合で探索を潰す問題として扱う。strategy map を、ゲーム攻略 bot の探索履歴を構造化する道具として説明する。"
  analysis_axis: "milestone / prerequisite edge / fork discovery / policy selection が、単なる reflection memory と何を変えるかを中心に見る。Ablation と text-adventure 評価から、どの部品が探索多様性に効くかを読む。"
  application_target: "Nao_u_BOT の headless game eval で、clear rate だけでなく未探索 fork、試行済み方針、既知 routine への閉じを記録する評価ログ設計に効く。"
  pros_cons: "メリットは探索停滞を構造的に検出できること。デメリットは strategy map の粒度設計と milestone 抽出が重く、短い prototype では運用コストが先に出ること。"
  verdict_pre: "部分採用"

---

## raw_excerpt

arXiv 2605.21240。自己進化型 LLM agent は、episode ごとの記憶や reflection を蓄積することで test time に振る舞いを改善しようとするが、記憶が増えるほど既知の高報酬 routine に寄って探索が細る、という問題を扱う。APEX は strategy map を持つ。これは milestone と prerequisite dependency edge からなる有向非巡回グラフで、agent がどの方向を既に試したか、どの方向が未探索かを明示する。Fork Discovery は根拠のある未探索方向を map に追加し、Policy Selection は planning 時に探索と活用の配分を取る。評価対象は Jericho の text-adventure 9 本と WebArena。ablation で各 component の寄与を見ている。

## why_relevant_to_games

ゲーム用 bot / headless 評価で「一度通った攻略だけを繰り返す」問題を、strategy map と未探索 fork として記録する入口になりそう。
