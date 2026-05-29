---
title: "AgentHijack: Benchmarking Computer Use Agent Robustness to Common Environment Corruptions"
url: "https://arxiv.org/abs/2605.25707"
collected_at: "2026-05-29T15:29:23+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, computer-use, robustness, playtesting, harness]
---

## raw_excerpt
arXiv:2605.25707。Autonomous computer-use agent は、スクリーンショットを見て GUI を操作する形で複雑な desktop workflow を実行できるようになっているが、実環境は clean benchmark と違い、pop-up、resolution change、別アプリの割り込み、予期しない操作、network error などで perception/control の流れが崩れる。AgentHijack は、この種の非敵対的な common corruption を 9 種類の configurable perturbation として導入し、MLLM-based agent がどれだけ壊れるかを測る benchmark。raw/web_research では、minor corruption でも performance degradation が大きいこと、対策として action generator に enhanced grounding を持たせ、onlooker が behavior summary と environment checking を担当する AgentHijack-Agent が提案されていることが記録されている。source query は `AI coding agents benchmark workflow`、fetched_at は 2026-05-29T14:22:19。

## why_relevant_to_games
ブラウザゲームの自動プレイテストでも、解像度、フォーカス、ポップアップ、入力取りこぼしで失敗が変わる。gameplay 評価を clean run だけでなく corruption probe として残す候補。
