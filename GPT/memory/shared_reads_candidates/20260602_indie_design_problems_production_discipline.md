---
title: "Unpopular opinion: most indie design problems are actually production problems"
url: "https://www.reddit.com/r/gamedesign/comments/1tapvnj/unpopular_opinion_most_indie_design_problems_are/"
collected_at: "2026-06-02T16:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, production, game-feel, ux, playtest-feedback, indie]
---

## raw_excerpt

Reddit r/gamedesign の 2026-05 下旬投稿。投稿者は「combat isn't fun」と言われた prototype の実態が、mechanic そのものではなく、弱い hit sound、敵リアクションの 0.2 秒遅れ、camera が player と喧嘩していること、feedback が泥っぽいこと、同じ sprint で複数人が値を変えたためどの版が良くなったのか分からなくなったことにあった、と述べている。中心メモは、indie team は redesign に飛びつきすぎるが、多くの design problem は unclear feedback、messy iteration、changing too many things at once、better/worse を追跡していないこと、Discord opinions が design direction になることだという点。

スレッド内では、単純な mechanics でも一貫性と UX feel が高ければ強く、逆に良い mechanic でも実装周辺が崩れると死ぬ、という話が続く。コメントでは UX が unconscious player buy-in を左右すること、juice は「最後の polish」ではなく学習と感情 feedback の一部であること、player は何が wrong かは言えるが fix の提案は信頼しすぎない方がよいこと、gameplay changes は one at a time にしないと影響を評価できないことが並ぶ。Phase 2 で読むなら、議論の価値は reddit の人気ではなく「設計判断」と「制作運用」が混ざったときの失敗分類にある。

## why_relevant_to_games

Nao_u_BOT の playable diff 後レビューで、「面白くない」を mechanic 追加に変換する前に、feedback、camera、SFX、値変更履歴、playtest 指摘の粒度を分けて見る候補材料になる。
