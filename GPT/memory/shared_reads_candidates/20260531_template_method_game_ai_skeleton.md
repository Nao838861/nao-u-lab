---
title: "Template Method"
url: "https://refactoring.guru/design-patterns/template-method"
collected_at: "2026-05-31T06:59:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, mechanics, architecture, ai, reusable-skeleton]
---

## raw_excerpt
Refactoring.Guru の Template Method 解説。中心は「アルゴリズムの骨格を superclass に置き、個別ステップだけを subclass が差し替える」設計パターン。記事中のゲーム寄り例では、戦略ゲームの `GameAI` が `turn()` の流れとして resource collection、building construction、unit production、attack を固定し、Orcs / Monsters などの AI が build や attack の具体手順だけを変える。重要なのは、variant ごとに全体フローを複製せず、共通構造は固定し、違いが出る箇所だけを hook / abstract step として露出する点。

設計上の効用として、似た処理を持つ複数クラスの重複を superclass に引き上げられること、client 側の conditional を減らせること、変更時に全 variant を同時に直す必要を減らせることが挙げられている。一方で skeleton が強すぎると利用者を制限し、step が増えるほど保守が難しくなるという注意もある。ゲーム制作文脈では、敵 AI、wave grammar、チュートリアル演出、評価 bot policy の「共通順序」と「差し替え点」を分ける資料として拾う。

## why_relevant_to_games
ジャンル骨格テンプレートや headless bot policy を作る時、共通進行を固定しつつ graze / parry / relay / dash など固有 mechanic だけ差し替える設計メモに使える。
