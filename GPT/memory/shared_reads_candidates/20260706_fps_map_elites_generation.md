---
title: "Procedural Generation of First Person Shooter Maps using Map-Elites"
url: "https://arxiv.org/abs/2605.30570"
collected_at: "2026-07-06T13:29:26+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [procedural-content-generation, level-design, map-elites, fps, quality-diversity]
evaluated_at: "2026-08-09T22:13:20+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-09T22:13:20+09:00"
last_decision: failed
evidence: "group_handoff:gha-99297dd6011f4249; terminal:memory/shared_reads_candidates/20260621_fps_maps_map_elites.md: status posted; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781992758045369; reason:posted-source index で arXiv:2605.30570 の実投稿と同一 work と確認したため"
next_action: none
stale_after: "2026-09-08"
supersedes: []
gate_reason: >-
  posted-source index で arXiv:2605.30570 の実投稿と一致したため、同一 work の open sibling を terminal 化する。
  MAP-Elites の知見自体は有用だが、既投稿内容との差分がないため duplicate として failed にする。
duplicate_reason: failed_duplicate_of_terminal_sibling
---

## raw_excerpt
arXiv abstract excerpt:

The paper investigates MAP-Elites, a quality diversity algorithm, for designing FPS levels. It compares existing map representations with two new representations, Point-Line and Spatial-Layout, intended to improve characterization of FPS maps.

The authors define metrics for topological properties that depend only on layout and emergent properties that require actual gameplay evaluation. They analyze which features are suitable for guiding the MAP-Elites illumination process, then apply MAP-Elites with Sliding Boundaries to evolve FPS map populations. The abstract reports that the new representations generate maps with higher diversity and quality than previous FPS map evolution representations.

## why_relevant_to_games
マップやステージ案を大量に出す時、静的レイアウト指標と実プレイ由来の emergent 指標を分けて候補空間を照らす設計メモになる。
