---
title: "AI Native Games: A Survey and Roadmap"
url: "https://arxiv.org/abs/2607.00527"
collected_at: "2026-07-06T06:32:14+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-native-games, generative-ai, mechanics, taxonomy, evaluation]
evaluated_at: "2026-07-06T06:36:06+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-06T06:36:06+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-06T06:36:06+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-05"
supersedes: []
gate_reason: >-
  AI-native game の線引きを runtime generative AI が core loop を構成するかという反事実基準で定義し、AI-assisted production や PCG と切り分けられる。
  53 件 corpus、G/N taxonomy、mechanical invariants まであり、問題設定・手法・評価対象・設計上の結論を ~4000 字の概要に展開できる。
  Log_cdx のゲーム制作では、AI 要素を面白さの飾りではなく state、feedback、agency に束ねる設計チェックとして直接使える。
suggested_post_outline:
  overview_angle: "AI-native game を「AI が core loop を外すと遊びが崩れる構造」として定義し、53 件 corpus と G/N taxonomy で現在地を読む。"
  analysis_axis: "AI-augmented、PCG、chatbot 型との境界、G-axis/N-axis taxonomy、mechanical invariants が open-ended 出力を playable gameplay に変える条件。"
  application_target: "次の AI-native prototype の設計レビューで、生成 AI が goals、rules、state、feedback、pacing、player agency に接続しているかを検査する基準にする。"
  pros_cons: "利点は線引きと設計語彙が明確なこと。弱点は corpus が language-forward prototype に偏り、アクション性や継続運用の実証がまだ薄いこと。"
  verdict_pre: "採用。AI 要素を core loop に置く企画だけでなく、AI 風味の飾りを落とす棄却基準としても使う。"
---

## raw_excerpt

arXiv:2607.00527。2026-07-01 submitted。論文は、生成 AI が dialogue、quest、character、image、world を runtime に生成できるようになった一方で、それだけでは AI-native game でも playable game でもない、と置く。定義の中核は「runtime generative AI が core loop の構成要素かどうか」。AI 部分を取り除いたり、単純な代替物で置き換えたりした時に、中心的な遊びが崩れる、または根本的に別物になるなら AI-native とみなす。この反事実的基準で、AI-augmented games、boundary artifacts、chatbot、tavern-style role-play、PCG、AI-assisted production と切り分ける。

著者らは公開されている 53 件の AI-native games / prototypes を分析し、player-facing game type を表す G-axis と、生成 AI が不可欠になる dominant AI mechanic を表す N-axis の taxonomy を提案する。現状の corpus は narrative adventure、epistemic interaction、generative narrative のような language-forward design に集中し、semantic adjudication、multi-agent simulation、generative construction、relationship / companion play はまだ薄い。設計問題としては、open-ended な AI 出力をそのまま面白さにするのではなく、goals、rules、state、feedback、pacing、player agency という mechanical invariants で「解釈でき、結果を持つ」遊びへ束ねることが強調されている。

## why_relevant_to_games

AI を「制作補助」ではなく「遊びの中心機構」にする時の線引きと、open-ended 出力を stable gameplay に落とす観点を集められる。次の AI-native prototype 設計や、AI 要素が core loop を本当に支えているかの確認に使える。
