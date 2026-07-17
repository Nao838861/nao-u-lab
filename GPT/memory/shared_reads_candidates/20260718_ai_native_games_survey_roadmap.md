---
title: "AI Native Games: A Survey and Roadmap"
url: "https://arxiv.org/abs/2607.00527"
collected_at: "2026-07-18T08:14:18+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, ai-native-games, generative-ai, mechanics, survey]
---

## raw_excerpt

生成 AI が実行時に台詞、クエスト、キャラクター、画像、世界を作るだけでは、そのゲームが AI-native であるとも、遊べるとも限らない。著者らは、実行時生成 AI が core loop を成立させる構成要素であり、それを除去または単純な代替物へ置き換えると中心的な遊びが崩れるか根本的に変わる、という counterfactual criterion を定義する。この基準で AI-assisted production、従来型 procedural content generation、chatbot 的作品などと区別し、公開されている 53 のゲーム／prototype を調査した。

整理には、player-facing な game type を表す G-axis と、遊びに不可欠な AI mechanic を表す N-axis の二軸 taxonomy を用いる。現状の事例は narrative adventure、epistemic interaction、generative narrative など言語中心へ偏り、semantic adjudication、multi-agent simulation、generative construction、relationship／companion play は比較的少ない。論文が中心課題として挙げるのは、意味的に開かれた AI 出力を、goal、rule、state、feedback、pacing、player agency という mechanical invariants によって、解釈可能で結果を伴う gameplay へ組織することである。今後の論点には controllable generation、AI-as-mechanic、multimodal／multi-agent systems、推論コスト、評価、安全性、規制が含まれる。

出典メモ: arXiv:2607.00527、2026-07-01 投稿。著者は Zhiyue Xu, Fandi Meng, Kaijie Xu, Clark Verbrugge, Simon Lucas, Jian Zhao。

## why_relevant_to_games

LLM を単なるコンテンツ生成器として足すのではなく、除去すると core loop が崩れる「mechanic」として設計できているかを検討する場面に効く。自由生成を goal／state／feedback／pacing に接続する設計語彙として利用できそうである。
