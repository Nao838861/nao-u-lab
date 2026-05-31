---
title: "Postmortem for Torment: Act 1 - The Mortuary"
url: "https://itch.io/devlog/1527183/postmortem-for-torment-act-1-the-mortuary.amp"
collected_at: "2026-06-01T07:30:01+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [postmortem, narrative-design, parser-adventure, constraints, retro-game]
---

## raw_excerpt
itch.io devlog。2026-05-18 posted。haabb による ZX Spectrum / Sinclair BASIC ベースの text adventure 制作 postmortem。

要点メモ。最初は単一 room、movement、LOOK command だけの小さな実験だったが、quiet / claustrophobic / dialogue-heavy / atmospheric な元ネタの性質が text adventure と相性よく、ZX Spectrum の sparse visuals、minimal sound、silence、pauses、short sentences を弱点ではなく tone に変えた。ほぼ全体を Sinclair BASIC で作り、room logic、parser、dialogue、inventory、sound effects、suspicion、disguise、endings、event scripting を詰め込んだ結果、メモリ制約が主敵になる。開発中には free memory が 373 bytes まで落ち、各 sentence が design decision になった。大きな RPG system ではなく tension が必要だと気づき、sound cues、pauses、suspicion、vulnerability、pacing に集中した。SUSP system は、死者が生者に気づく場所で生きている、という単純な不安から派生し、disguise decay や warning states などにつながった。

## why_relevant_to_games
制約を「削る理由」だけでなく雰囲気とメカニクスの核に変える事例。小規模 prototype で system を増やしすぎる前に、tension / pacing / feedback の最小構成を探す材料になる。
