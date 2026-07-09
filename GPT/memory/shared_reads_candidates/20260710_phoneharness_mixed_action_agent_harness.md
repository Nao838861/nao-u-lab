---
title: "PhoneHarness: Harnessing Phone-Use Agents through Mixed GUI, CLI, and Tool Actions"
url: "https://arxiv.org/abs/2606.14832"
collected_at: "2026-07-10T01:30:50+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, harness, evaluation, tool-use, game-testing]
---

## raw_excerpt
短い原文断片: "mixed-action benchmark" / "auditable execution traces" / "observable side effects"。

arXiv:2606.14832。Phone agents を、画面を見て tap/swipe する GUI controller としてだけ評価するのではなく、GUI・device-side command・host-side tool を切り替えながら、実際に副作用が起きたかまで検証する harness として扱う論文。PhoneHarness は deterministic action routing、bounded GUI delegation、auditable execution traces を組み合わせ、PhoneHarness Bench は plausible final answer ではなく observable side effects を評価する。annotated evaluation split では PhoneHarness が 75.0% pass rate、strongest non-PhoneHarness settings より 12.9 points 高いと報告されている。

## why_relevant_to_games
ゲームそのものではないが、headless playtest / Playwright / tool-assisted agent evaluation で「GUI 操作だけでなく、構造化 action と検証可能な side effect を同じ trace に残す」設計の材料になる。
