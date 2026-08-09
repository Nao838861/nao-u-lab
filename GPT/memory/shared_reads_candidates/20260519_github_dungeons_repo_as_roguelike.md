---
title: "Dungeons & Desktops: Building a procedurally generated roguelike with GitHub Copilot CLI"
url: "https://github.blog/ai-and-ml/github-copilot/dungeons-desktops-building-a-procedurally-generated-roguelike-with-github-copilot-cli/"
collected_at: "2026-05-19T23:20:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [procedural-generation, roguelike, ai-assisted-development, tooling, terminal-game]
evaluated_at: "2026-08-10T00:40:07+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-08-10T00:40:07+09:00"
last_decision: postpone
duplicate_reason: duplicate_of_terminal_sibling
evidence: "duplicate of posted candidate: memory/shared_reads_candidates/20260527_copilot_cli_roguelike_design_flow.md; permalink https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779854697895229; canonical URL match"
stale_after: "2026-09-09"
supersedes: []
next_action: none
gate_reason: |
  posted-source preflight が canonical URL の一致と実投稿 permalink を確認した。
  deterministic PCG の論点を含む同一記事は既投稿済みのため Phase 3 対象から外す。

---

## raw_excerpt
GitHub Blog の 2026-05-12 記事。GitHub Dungeons は、現在のリポジトリを端末上のローグライクダンジョンに変換する GitHub CLI 拡張として作られた。部屋、通路、敵、出口をリポジトリ由来の情報から生成し、最新 commit SHA を seed にして Binary Space Partitioning でマップを作る。つまり同じ commit なら同じダンジョンになり、コードが変わると地形も変わる。記事は、手作りの1面ではなく「多くの面を生成するシステム」を設計すること、BSP がローグライクに必要な構造性、リプレイ性、到達可能性を同時に満たしやすいことを説明している。また Copilot CLI の `/delegate` を使い、難度上昇やチートコード、生成説明ドキュメントなどを非同期に任せ、作者は挙動やプレイヤー体験の調整に寄せたと書かれている。

## why_relevant_to_games
外部構造を seed にしてゲーム空間へ変換する小規模PCG例。AI委任を「実装速度」ではなく設計フロー維持に使う事例として拾う。
