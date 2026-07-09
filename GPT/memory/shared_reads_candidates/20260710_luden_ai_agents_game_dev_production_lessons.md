---
title: "AI Agents in Game Development: FOMO, Real Production Lessons, Failed Experiments, and AI Workshop Plan"
url: "https://blog.luden.io/ai-agents-in-game-development-real-production-lessons-failed-experiments-and-workshop-101-7d71e64685fa"
collected_at: "2026-07-10T05:29:54+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-dev-production, ai-agent, qa, design-doc-review, playtesting, postmortem]
---

## raw_excerpt
短い原文引用: "Seven things that work for us in production" / "What doesn’t work"。

要点メモ: Luden.io の Oleg Chumakov による、ゲーム制作現場で AI agent をどう使っているかの実務記事。スタジオの前提は Defold、Unity、Cursor、Codex、Claude Code、GitHub Actions、Google Docs、Figma などを併用する小規模ゲーム開発環境。うまくいく用途として、性能問題の見当付け、save file / stack trace / replay / text state を使った bug fix 補助、milestone 差分からの QA scenario 提案、Markdown の design document を code review のように diff review する運用、小さな automation や isolated module、静的サイト更新、social / in-game analytics の解釈を挙げている。逆に、複雑な gameplay feature の end-to-end 実装、screenshot / computer-use 系の自律 playtesting、multi-agent peer review、production art、engine UI design、scene editing は fragile だと書いている。特に playtesting では、text representation と fake input layer を使った scenario 実行は一部役立つが、ゲームが変化している間は scenario の妥当性確認コストが残る、という現場観察がある。

## why_relevant_to_games
Nao_u_BOT のゲーム制作で、AI agent に任せる範囲を「小さな isolated task / text state / diff review / scenario generation」に寄せ、複雑な gameplay feature や完全自律 playtest を過信しないための現場事例として使える。
