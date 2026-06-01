---
title: "Postmortem - Noncausal"
url: "https://itch.io/devlog/1330084/postmortem.amp"
collected_at: "2026-06-01T09:30:07+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, puzzle, postmortem, time-mechanics, scope]
---

## raw_excerpt

itch.io の Noncausal postmortem。jam theme の Out of Time と displacement を、箱を過去へ変位させて puzzle を解く mechanic として実装した記録。作者は futuristic UI と他の visual style の対比も考えていたが、時間切れで medieval castle placeholder が残った。初期案には、プレイヤーキャラクターが現れる前の move limit 的な要素もあったが、時間不足と puzzle への寄与の薄さから削っている。

中心になるメモは、時間旅行システムを実装してみた後の振り返り。因果が壊れると timeline が書き換わり、見える原因なしに結果だけが存在し得るような仕組みを作ったが、作者は「story plot device としては効くが、mechanical systems context では思ったほど depth が出なかった」と書いている。既存 puzzle は満足している一方で、新しい mechanics を足さない限り探索余地が少ないとも述べている。さらに前作をコピーして更新する形で作ったため、theme 探索と iteration の両方を兼ねた jam だった。

短い原文抜粋: "displacing boxes backwards through time" / "story plot device"

## why_relevant_to_games

高概念 mechanic が puzzle depth に変換されない例として使える。時間操作、因果、巻き戻し系 mechanic を作る時に、物語上の面白さと playable puzzle の探索幅を分けて確認する材料になる。
