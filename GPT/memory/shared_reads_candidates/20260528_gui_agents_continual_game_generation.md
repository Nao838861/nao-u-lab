---
title: "GUI Agents for Continual Game Generation"
url: "https://arxiv.org/abs/2605.28258"
collected_at: "2026-05-28T23:29:37+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-playtesting, gui-agent, game-generation, evaluation]
evaluated_at: "2026-05-28T23:47:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-29T00:09:30+09:00"
last_decision: posted
stale_after: "2026-06-27"
supersedes: []
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779979770780529"
posted:
  ts: "1779979770.780529"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779979770780529"
  char_count: 3673
  posted_at: "2026-05-29T00:09:30+09:00"
next_action: none
gate_reason: >-
  ブラウザゲーム生成の失敗を static artifact ではなく interaction-level failure として扱う問題設定が明確。
  PlaytestArena と Play2Code の役割分担、200 tasks / 8 genres / rubric pass-rate という評価軸があり、
  Nao_u_BOT の playable diff 検証へ具体的に接続できる。
suggested_post_outline:
  overview_angle: "one-shot 生成では見落とす操作時の破綻を、GUI agent による実プレイ評価と coding-playing loop で潰す手法として書く。"
  analysis_axis: "PlaytestArena の rubric 評価と Play2Code の shared memory loop を分け、何を客観評価し、何を改善ループに戻すかを見る。"
  application_target: "browser game prototype の headless/GUI playtest、完成判定前の interaction probe、agent が作った playable diff の再現検査。"
  pros_cons: "メリットは人間が触る前に操作破綻を拾えること。デメリットは GUI agent 評価がゲームの面白さや長期バランスを直接保証しないこと。"
  verdict_pre: "部分採用。完成判定者ではなく、ブラウザ上の破綻検出器として採用する。"

---

## raw_excerpt

arXiv / search result からの要点メモ。論文は、ゲーム生成を「prompt から一回で artifact を出す」作業として扱うと、実際にブラウザで遊んだ時の interaction-level failure が残る、という問題設定から始まる。提案は GUI agent を 2 つの役割で使うこと。1 つ目は PlaytestArena で、8 ジャンル・200 個の browser-based game generation tasks に対して、期待される in-play behaviors の rubric を置き、GUI agent が build をブラウザで開いて遊び、客観評価者として判定する。2 つ目は Play2Code で、game agent と GUI agent が shared memory を持って継続的にやり取りし、coding と playing の対話としてゲーム生成を改善する。実験では Play2Code が 66.8% の rubric pass-rate を示し、single-pass や agentic-coding baseline より高かったと報告されている。

## why_relevant_to_games

Nao_u_BOT の「playable diff を作って headless / browser で検証する」運用に近い。GUI agent を完成判定者ではなく、ブラウザ上の相互作用破綻を見つける playtester として使う候補。
