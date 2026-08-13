---
title: "AI Native Games: A Survey and Roadmap"
url: "https://arxiv.org/abs/2607.00527"
collected_at: "2026-07-18T08:14:18+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, ai-native-games, generative-ai, mechanics, survey]
evaluated_at: "2026-07-18T08:15:44+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
duplicate_preflight_decision: skip
duplicate_reason: failed_duplicate_of_terminal_sibling
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-14T01:49:09+09:00"
last_decision: failed
evidence: "group_handoff:gha-50f3726a62a848fa; terminal:memory/shared_reads_candidates/20260706_ai_native_games_survey_roadmap.md: posted https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783287766520669; reason:canonical arXiv work identity 2607.00527 が実投稿済み source と一致し open siblings に独立した追加価値がない"
next_action: none
stale_after: "2026-08-17"
supersedes: []
gate_reason: >-
  Phase 2 の内容品質判定は pass だったが、Phase 3 の最終レビューで canonical URL と題名が
  2026-07-06 の投稿済み candidate に一致することを確認した。既存投稿は同じ論文の手法、評価対象、
  適用、限界を 4467 字で既に扱っており、新規の差分や更新版に基づく追加価値がないため再投稿しない。
suggested_post_outline:
  overview_angle: "AI-native を技術の有無ではなく、AIを除去した時に中心的な遊びが崩れるかという反実仮想基準で定義し、53作品の設計空間を整理する"
  analysis_axis: "G-axis と N-axis の二軸分類、および開放的な生成結果を goal・rule・state・feedback・pacing・player agency に接続する mechanical invariants の有効性と限界"
  application_target: "新規ゲーム案と既存 prototype の企画レビューで、生成AIが core loop に不可欠か、出力が観測可能な状態変化とプレイヤー判断へ接続されているかを点検する"
  pros_cons: "利点はAI mechanicの必要性と未開拓領域を共通語彙で比較できること。弱点はsurvey taxonomyであり、個別mechanicの面白さや長期運用、安全性、費用を直接実証しないこと"
  verdict_pre: 部分採用
---

## raw_excerpt

生成 AI が実行時に台詞、クエスト、キャラクター、画像、世界を作るだけでは、そのゲームが AI-native であるとも、遊べるとも限らない。著者らは、実行時生成 AI が core loop を成立させる構成要素であり、それを除去または単純な代替物へ置き換えると中心的な遊びが崩れるか根本的に変わる、という counterfactual criterion を定義する。この基準で AI-assisted production、従来型 procedural content generation、chatbot 的作品などと区別し、公開されている 53 のゲーム／prototype を調査した。

整理には、player-facing な game type を表す G-axis と、遊びに不可欠な AI mechanic を表す N-axis の二軸 taxonomy を用いる。現状の事例は narrative adventure、epistemic interaction、generative narrative など言語中心へ偏り、semantic adjudication、multi-agent simulation、generative construction、relationship／companion play は比較的少ない。論文が中心課題として挙げるのは、意味的に開かれた AI 出力を、goal、rule、state、feedback、pacing、player agency という mechanical invariants によって、解釈可能で結果を伴う gameplay へ組織することである。今後の論点には controllable generation、AI-as-mechanic、multimodal／multi-agent systems、推論コスト、評価、安全性、規制が含まれる。

出典メモ: arXiv:2607.00527、2026-07-01 投稿。著者は Zhiyue Xu, Fandi Meng, Kaijie Xu, Clark Verbrugge, Simon Lucas, Jian Zhao。

## why_relevant_to_games

LLM を単なるコンテンツ生成器として足すのではなく、除去すると core loop が崩れる「mechanic」として設計できているかを検討する場面に効く。自由生成を goal／state／feedback／pacing に接続する設計語彙として利用できそうである。
