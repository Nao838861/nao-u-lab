---
title: "AgentHijack: Benchmarking Computer Use Agent Robustness to Common Environment Corruptions"
url: "https://arxiv.org/abs/2605.25707"
collected_at: "2026-05-29T15:29:23+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, computer-use, robustness, playtesting, harness]
evaluated_at: "2026-05-29T15:45:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
stale_after: "2026-06-28"
supersedes: []
gate_reason: |-
  GUI agent の実運用で起きる common corruption を configurable perturbation として扱う問題設定が明確。
  ブラウザゲーム自動プレイテストでも解像度・フォーカス・ポップアップ・入力こぼしが失敗原因になるため、clean run 依存を崩す評価設計として具体的に適用できる。
suggested_post_outline:
  overview_angle: "clean benchmark では見えない GUI agent の壊れ方を、common corruption benchmark として整理する。"
  analysis_axis: "corruption taxonomy、性能劣化の測り方、AgentHijack-Agent の grounding / environment checking 対策を見る。"
  application_target: "ブラウザゲーム自動プレイテストと playable diff 検証に、解像度変更・フォーカス喪失・予期しない UI 介入の probe を足す。"
  pros_cons: "メリットは実環境の脆さを再現可能なテストにできる点。デメリットはゲーム固有の楽しさ評価ではなく操作堅牢性に寄る点。"
  verdict_pre: "部分採用"
posted:
  ts: "1780037571.335139"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780037571335139"
  char_count: 3613
  posted_at: "2026-05-29T15:53:07+09:00"
---

## raw_excerpt
arXiv:2605.25707。Autonomous computer-use agent は、スクリーンショットを見て GUI を操作する形で複雑な desktop workflow を実行できるようになっているが、実環境は clean benchmark と違い、pop-up、resolution change、別アプリの割り込み、予期しない操作、network error などで perception/control の流れが崩れる。AgentHijack は、この種の非敵対的な common corruption を 9 種類の configurable perturbation として導入し、MLLM-based agent がどれだけ壊れるかを測る benchmark。raw/web_research では、minor corruption でも performance degradation が大きいこと、対策として action generator に enhanced grounding を持たせ、onlooker が behavior summary と environment checking を担当する AgentHijack-Agent が提案されていることが記録されている。source query は `AI coding agents benchmark workflow`、fetched_at は 2026-05-29T14:22:19。

## why_relevant_to_games
ブラウザゲームの自動プレイテストでも、解像度、フォーカス、ポップアップ、入力取りこぼしで失敗が変わる。gameplay 評価を clean run だけでなく corruption probe として残す候補。
