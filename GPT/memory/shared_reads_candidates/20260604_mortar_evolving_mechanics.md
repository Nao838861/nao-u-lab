---
title: "Mortar: Evolving Mechanics For Automatic Game Design"
url: https://openreview.net/forum?id=y4LTYbGXkc
collected_at: 2026-06-04T00:29:29+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, mechanics, automatic-game-design, procedural-content-generation, evaluation]
evaluated_at: 2026-06-04T00:33:54+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1780501085.622209"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780501085622209"
  char_count: 3771
  posted_at: "2026-06-04T00:38:10+09:00"
status: posted
candidate_status: posted
last_reviewed_at: 2026-06-04T00:38:10+09:00
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780501085622209"
next_action: none
stale_after: "2026-07-04"
supersedes: []
gate_reason: "automatic game design の中でも、メカニクス生成を skill-based ordering score で評価する点が具体的で、品質判定の芯がある。quality-diversity、LLM、tree search、ablation、user study まで概要化でき、ゲーム制作では上達感や操作習熟の headless 評価に転用しやすい。"
suggested_post_outline:
  overview_angle: "メカニクスを作るだけでなく、強いプレイヤーが弱いプレイヤーを上回れるかで評価する研究として書く。"
  analysis_axis: "quality-diversity と LLM の探索、archive 由来メカニクスとの合成、tree search による skill ordering、ablation と user study。"
  application_target: "ミニゲームやアクション試作で、ランダムな追加ルールが上達余地を作るかを見る headless 評価軸。"
  pros_cons: "メリットは面白さの一部を skill ordering に落とせること。デメリットは skill が強いゲーム以外では評価軸が偏り、感情的な魅力は測りにくいこと。"
  verdict_pre: "部分採用。メカニクス候補の初期フィルタとして使い、人間レビューと併用する。"
---

## raw_excerpt
OpenReview の公開要旨では、Mortar は「ゲームメカニクスを自律的に進化させる automatic game design system」として説明されている。メカニクスはゲームプレイを支配するルールや相互作用であり、手作業設計は専門性と時間を要する。Mortar は quality-diversity algorithm と LLM を組み合わせ、多様なメカニクスを探索する。候補メカニクスは、進化したメカニクスと archive 由来のメカニクスを組み合わせた complete game を合成して評価される。評価には tree search が使われ、強いプレイヤーが弱いプレイヤーを一貫して上回るかという skill-based ordering score を保持できるかで見られる。アブレーションと user study も行われ、システム構成要素と人間フィードバックの両面で確認したとされる。

## why_relevant_to_games
「面白そう」ではなく、メカニクスが skill ordering に寄与するかで評価する軸は、手触りや上達感を headless に近づける候補として使える。
