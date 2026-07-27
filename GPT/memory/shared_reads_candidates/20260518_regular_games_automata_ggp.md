---
title: Regular Games -- an Automata-Based General Game Playing Language
url: https://ojs.aaai.org/index.php/AAAI/article/view/40203
collected_at: 2026-05-18T05:59:17+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [general-game-playing, rules, automata, game-ai, toolchain]
evaluated_at: "2026-07-28T05:21:25+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-07-28T05:21:25+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-28T05:21:25+09:00"
next_action: revise_or_research
stale_after: "2026-08-27"
supersedes: []
gate_reason: |-
  有限オートマトンを核に高水準記述、forward model、可視化、benchmark、変換 debugger を同じ系へ接続する着想は、headless test と agent playtest に具体的に効く。
  ただし現候補は abstract の速度優位主張だけで、対象ゲーム、比較条件、数値、記述例、変換制約がなく、評価の中身を約4000字で説明できないため本文確認まで保留する。

---

## raw_excerpt
AAAI-26 Technical Track 掲載、2026-03-14 公開。Regular Games (RG) は General Game Playing 向けのゲーム記述システムで、有限オートマトンでルールを定義する低レベル言語を核にし、その上に人間や PCG が扱いやすい高レベル言語を載せる構成。短い引用: "computationally efficient and convenient for game design"。抽象によると、対象は不完全情報を含む有限ターン制ゲーム全般で、高レベル記述は最終的に低レベル言語へ変換される。RG は Regular Boardgames や Ludii より高速な forward model を生成する、と説明されている。周辺エコシステムとして editor with LSP、automaton visualization、benchmarking tools、debugger of game description transformations が挙げられており、ルール記述、解析、最適化、エージェント処理を同じ記述系に乗せる方向の研究として読める。

## why_relevant_to_games
ゲームルールを実装コードから切り出し、forward model、可視化、ベンチ、デバッグへつなぐ候補。小型プロトタイプの headless test や agent playtest を設計する時の参照になる。
