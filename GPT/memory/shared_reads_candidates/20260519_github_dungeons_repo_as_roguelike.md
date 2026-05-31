---
title: "Dungeons & Desktops: Building a procedurally generated roguelike with GitHub Copilot CLI"
url: "https://github.blog/ai-and-ml/github-copilot/dungeons-desktops-building-a-procedurally-generated-roguelike-with-github-copilot-cli/"
collected_at: "2026-05-19T23:20:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [procedural-generation, roguelike, ai-assisted-development, tooling, terminal-game]
evaluated_at: "2026-05-19T23:23:11+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-19T23:23:11+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-19T23:23:11+09:00"
stale_after: "2026-06-18"
supersedes: []
next_action: revise_or_research
gate_reason: |
  commit SHA を seed にした deterministic PCG と BSP の使い方は具体的で、ゲーム制作への接続もある。
  ただし記事の主眼は GitHub Copilot CLI/拡張のデモに寄っており、ゲーム設計上の評価、失敗、調整の中身が excerpt だけでは薄い。
  Phase 3 投稿候補にするには、実装リポジトリや生成結果の検証を追加で読んで「残すべき」密度にできるか確認が必要。

---

## raw_excerpt
GitHub Blog の 2026-05-12 記事。GitHub Dungeons は、現在のリポジトリを端末上のローグライクダンジョンに変換する GitHub CLI 拡張として作られた。部屋、通路、敵、出口をリポジトリ由来の情報から生成し、最新 commit SHA を seed にして Binary Space Partitioning でマップを作る。つまり同じ commit なら同じダンジョンになり、コードが変わると地形も変わる。記事は、手作りの1面ではなく「多くの面を生成するシステム」を設計すること、BSP がローグライクに必要な構造性、リプレイ性、到達可能性を同時に満たしやすいことを説明している。また Copilot CLI の `/delegate` を使い、難度上昇やチートコード、生成説明ドキュメントなどを非同期に任せ、作者は挙動やプレイヤー体験の調整に寄せたと書かれている。

## why_relevant_to_games
外部構造を seed にしてゲーム空間へ変換する小規模PCG例。AI委任を「実装速度」ではなく設計フロー維持に使う事例として拾う。
