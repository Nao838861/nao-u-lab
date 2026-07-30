---
title: "Indie Game Publishing: The 21k+ Game Problem"
url: "https://80.lv/articles/indie-game-publishing-the-21k-game-problem"
collected_at: "2026-07-30T12:32:22.7753748+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-production, indie-dev, publishing, playtesting, marketing]
evaluated_at: "2026-07-30T12:38:19.8829299+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-30T12:38:19.8829299+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-30T12:38:19.8829299+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-29"
supersedes: []
gate_reason: >-
  core loop の stress-test、Steam Playtest と demo の役割分離、launch 指標、platform・localization 準備を、制作から発売までの一つの検証系列として抽出できる。
  具体的なゲーム制作へ適用でき、約4000字の概要・分析を構成できる。ただし数値閾値は publisher / Xsolla 側の経験則を含むため、普遍則ではなく計測開始点として扱う。
suggested_post_outline:
  overview_angle: "年間2.1万本という競争量への反応を、制作速度ではなく core loop・発見性・発売準備を連結した検証設計へ置き換える"
  analysis_axis: "Playtest→demo→launch の情報価値の違い、review・wishlist・followers・同時接続の指標階層、経験則に基づく数値閾値の限界"
  application_target: "Log_cdx の小規模ゲーム制作で、内部の playable diff、外部 playtest、公開 demo、配布判断を同じ evidence ledger 上に接続する"
  pros_cons: "利点は過剰 polish と無観客リリースを同時に避けられること。欠点は商業発売前提が強く、提示閾値の出典・ジャンル依存性・小規模試作への過大適用に注意が要ること"
  verdict_pre: "部分採用"
---

## raw_excerpt

Skystone Games の Andrew Naicker は、Steam で年間約2.1万本が発売される状況に対し、短期制作と大量投入ではなく、demo を見直して core loop を stress-test し、store page・trailer・positioning まで一体で設計する手順を説明している。追う指標として launch day の review score、wishlist conversion、demo が生んだ実質的な wishlist を挙げる。記事内の補足では、発売判断の目安として playtester / demo feedback、イベント中の同時接続、launch-day traffic を作れる wishlist、day-1 crash と進行不能の解消、core loop の完成を列挙する一方、観客を作らないままの過剰 polish を注意点としている。

publisher が提供するものは資金や配信だけでなく、platform・地域・influencer と築いた関係に費やした時間だと説明される。Steam event ごとに conversion と wishlist threshold の変化を追い、showcase を demo 公開や発表などの具体的な beat と結び付ける。後半では、通知を伴う demo の前に Steam Playtest を反復し、fun・bug・balance を検証する使い分け、localization を後付けにせず外部文字列・UTF-8・長い翻訳文・右から左の layout を開発段階で準備する論点も挙げている。

## why_relevant_to_games

core loop の試作・外部 playtest・demo・発売準備を別工程にせず、同じ検証系列として扱う制作フローの参考になる。小規模ゲームで「どこまで polish して出すか」を、体験と到達可能性の観測項目へ分解する場面に関係する。
