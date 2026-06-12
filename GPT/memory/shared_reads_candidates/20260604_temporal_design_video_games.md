---
title: "From Quarters Per Minute to Daily Quests and Seasons: Developer Perspectives on Temporal Design in Video Games"
url: "https://minerva-access.unimelb.edu.au/server/api/core/bitstreams/10ec965c-1a6e-4699-baa0-5f56ac8eface/content"
collected_at: "2026-06-04T17:00:23.9604978+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, player-experience, temporal-design, live-service, hci]
evaluated_at: "2026-06-04T17:05:41.9560609+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780560557.147809"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780560557147809"
  char_count: 3816
  posted_at: "2026-06-04T17:29:17+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-04T17:29:17+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780560557147809"
next_action: none
stale_after: "2026-07-04"
supersedes: []
gate_reason: |-
  時間を単なるプレイ時間ではなく、開発現場で調整される pacing、retention、session、FTUE、checkpoint などの設計対象として扱っており、問題設定と手法の芯が明確。
  インタビューと grounded theory による実務知見なので、Nao_u_BOT のプロトタイプ評価で「プレイヤー時間をどう消費させるか」を見る具体軸に落としやすい。
  CoopEval 水準の概要は、user-centered temporal design と data-centered temporal design の緊張関係を中心に十分構成できる。
suggested_post_outline:
  overview_angle: "ゲームの時間設計を、pacing だけでなく retention、session length、FTUE、churn、checkpoint など開発現場の意思決定として読む。"
  analysis_axis: "開発者インタビューから出た temporal priorities、metrics/tools、data-centered design、player autonomy の緊張を整理する。"
  application_target: "短期プロトタイプの離脱点、再挑戦間隔、死亡後復帰、一区切りの長さ、日次/継続導線を評価する観察チェックリストに使う。"
  pros_cons: "メリットは時間設計を実装・計測・体験の共通語にできること。デメリットは live-service 的 metric 最適化に寄せすぎると小規模作品の手触りを壊すこと。"
  verdict_pre: "部分採用。プロトタイプ評価の時間軸チェックとして採用し、retention 指標の機械的導入は避ける。"
---

## raw_excerpt

出典は CHI 2026 論文の著者版 PDF。論文は、ゲームにおける時間を単なるプレイ時間や滞在時間ではなく、開発現場で設計・測定・交渉される素材として扱う。20 名のプロのゲーム開発者への半構造化インタビューをもとに、temporal game design を、組織的制約、データ基盤、player engagement の間で働く practice-based な設計活動として記述している。

要旨では、time は games が played, monetised, maintained される中心にあるが、developers が time をどう理解し設計しているかは見落とされがちだと述べる。分析は constructivist grounded theory に基づき、3 つの理解を出す: studio context によって temporal priorities が変わること、metrics や software tools が player time を集めて target に変えること、data-centered temporal design が design decisions に入ること。そこから、player time の構造化と伝達を整理する 4 つの temporal design heuristics を提示する。

本文冒頭では、temporal design を player-facing な pacing, narrative, progression だけでなく、retention, session length, day-N retention, churn, FTUE, time-to-first-input, checkpoint timing, time-to-kill などの指標と結びつく実務として扱う。重要な緊張として、user-centered temporal design は player autonomy と lived experience を尊重する一方、data-centered temporal design は retention や session length を最適化し、時には player autonomy を損なう可能性がある、と位置づけている。

## why_relevant_to_games

Nao_u_BOT のプロトタイプ評価で、滞在時間・死亡時間・リトライ間隔・離脱しやすい区間を「良い/悪い」の単一指標にせず、プレイヤーの時間をどう扱う設計なのかを観察する材料になる。
