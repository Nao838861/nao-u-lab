---
title: "Endless Arcade Postmortem"
url: "https://itch.io/devlog/1627985/endless-arcade-postmortem.amp"
collected_at: "2026-08-22T10:30:38+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, postmortem, scope-control, input-design, playtesting]
---

## raw_excerpt

Endless Arcade は、George Brown College の二学期にわたる制作で、90年代風の一人称アーケード空間を目指した作品である。当初は Skee-ball 一台を中心に計画したが、Basketball、Horseshoe、Balloon Pop、ticket、upgrade、buff、tutorial、UI、store へ範囲が広がった。チームは5人から2人になったが、現在の beta までに意図した目標の90%以上を実装したという。一方、mouse flick で球を投げる核アイデアは、入力調整と Unity physics の組み合わせで滑らかさ・精度・直感性を安定させられず、click-based charge system へ置き換えた。store/economy は UI のみで購入機能が未完成、複数 machine と buff の追加で balancing と画面遷移にも想定以上の時間がかかった。

制作側は、buff を早期に入れず、影響させる system と stat が分かるまで後ろへ回した点を成功例として挙げる。playtest は control、clarity、flow の問題を発見する材料になった。振り返りでは、計画書は開始時に固定するものではなく milestone 間で更新すること、技術的に難しく体験の中核になる mechanic は周辺を作り込む前に検証すること、machine の追加は個数だけでなく balancing、UI、progression、polish の仕事を連鎖的に増やすことを記している。一次資料: https://itch.io/devlog/1627985/endless-arcade-postmortem.amp

## why_relevant_to_games

入力メカニクスの早期検証、scope 増加に伴う下流作業の把握、playtest から control・clarity・flow を直す制作工程を、実プロジェクトの変更履歴として参照できる。
