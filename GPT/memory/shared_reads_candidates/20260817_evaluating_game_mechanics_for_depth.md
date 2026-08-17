---
title: "Evaluating Game Mechanics For Depth"
url: "https://www.gamedeveloper.com/design/evaluating-game-mechanics-for-depth"
collected_at: "2026-08-17T13:30:51+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, mechanics, depth, challenge-design, postmortem]
---

## raw_excerpt

本文の要点を収集時メモとして日本語で言い換えたもの。Insomniac Games で設計を担当した Mike Stout は、mechanic の「深さ」を、同じ操作を反復させる複雑さではなく、プレイヤーが習得した能力を繰り返し発揮でき、challenge が退屈になるほど固定も、習熟を味わえないほど急変もしない状態として整理する。そのために必要なのは、challenge の完了状態をプレイヤーが思い描ける明確な objective と、成功へ複数の実質的な判断・操作を持ち込める meaningful skill である。

記事は『Ratchet & Clank』の tractor beam を例に、浅さを直そうとして robot、bomb、laser、rocket block など objective を増やしても、実際の活動がすべて「物体を A から B へ運ぶ」に還元されるなら、学習負荷だけが増えて深さは増えないと振り返る。診断手順として、objective と meaningful skill を別々に列挙し、機能的に重複する項目、単に基礎的すぎる操作、objective を skill と誤認した項目を消す。浅い mechanic では objective が多く skill が少ない場合があり、演出追加は一時的に飽きを覆えても、この構造自体は直さないという説明である。

## why_relevant_to_games

prototype が「最初は楽しいがすぐ単調」「要素を足したのに深くならない」とき、objective 数と meaningful skill 数を分離して棚卸しする設計メモとして使える。
