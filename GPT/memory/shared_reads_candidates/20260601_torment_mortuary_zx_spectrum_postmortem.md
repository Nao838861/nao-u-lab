---
title: "Postmortem for Torment: Act 1 - The Mortuary"
url: "https://itch.io/devlog/1527183/postmortem-for-torment-act-1-the-mortuary.amp"
collected_at: "2026-06-01T07:30:01+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [postmortem, narrative-design, parser-adventure, constraints, retro-game]
evaluated_at: "2026-06-01T07:33:19+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-06-01T07:33:19+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-01T07:33:19+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-01"
supersedes: []
gate_reason: "一次の制作 postmortem として、ZX Spectrum / Sinclair BASIC の制約を parser、room logic、dialogue、sound cue、suspicion、ending に変換した過程が追える。制約を雰囲気と mechanics の核へ変えた事例であり、小規模 prototype 設計へ具体的に適用できる。"
suggested_post_outline:
  overview_angle: "メモリ制約や sparse media を削る理由ではなく、tension / pacing / suspicion を濃くする設計材料として扱った点を軸にする。"
  analysis_axis: "初期 scope、Sinclair BASIC 実装、free memory の圧迫、parser と suspicion system、sound/pause/short sentence による pacing を整理する。"
  application_target: "Nao_u_BOT の小規模 narrative prototype、限られた asset / UI / command set で tension を作る設計レビュー。"
  pros_cons: "メリットは最小構成でも tone と mechanics を一致させる実例、デメリットは retro/parser 固有の前提が強く一般化には翻訳が必要。"
  verdict_pre: "部分採用。制約を理由に system を足すのではなく、少数の feedback loop を強くする評価軸として使う。"
---

## raw_excerpt
itch.io devlog。2026-05-18 posted。haabb による ZX Spectrum / Sinclair BASIC ベースの text adventure 制作 postmortem。

要点メモ。最初は単一 room、movement、LOOK command だけの小さな実験だったが、quiet / claustrophobic / dialogue-heavy / atmospheric な元ネタの性質が text adventure と相性よく、ZX Spectrum の sparse visuals、minimal sound、silence、pauses、short sentences を弱点ではなく tone に変えた。ほぼ全体を Sinclair BASIC で作り、room logic、parser、dialogue、inventory、sound effects、suspicion、disguise、endings、event scripting を詰め込んだ結果、メモリ制約が主敵になる。開発中には free memory が 373 bytes まで落ち、各 sentence が design decision になった。大きな RPG system ではなく tension が必要だと気づき、sound cues、pauses、suspicion、vulnerability、pacing に集中した。SUSP system は、死者が生者に気づく場所で生きている、という単純な不安から派生し、disguise decay や warning states などにつながった。

## why_relevant_to_games
制約を「削る理由」だけでなく雰囲気とメカニクスの核に変える事例。小規模 prototype で system を増やしすぎる前に、tension / pacing / feedback の最小構成を探す材料になる。
