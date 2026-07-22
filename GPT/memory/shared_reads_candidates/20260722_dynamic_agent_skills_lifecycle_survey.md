---
title: "Dynamic Agent Skills: A Lifecycle Survey and Taxonomy of Evolving Skill Libraries"
url: "https://arxiv.org/abs/2607.10113v1"
collected_at: "2026-07-22T15:31:12+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-agent, skill-library, lifecycle, verification, retrieval, game-development-workflow]
---

## raw_excerpt

著作権に配慮し、arXiv abstract の要点を日本語で採録する。本 survey は、LLM agent が model 外へ保存し、後続 task で検索・実行する再利用可能な手順を「skill」として扱う。対象には code function、自然言語 instruction、SKILL.md package、workflow graph、learned adapter が含まれる。2023〜2026年の124論文を監査し、dynamic skill system を、interaction から evidence を集め、更新案を生成し、検証して採用し、検索・合成可能に整理し、古くなった項目を修復または削除し、provenance と rollback を伴って共有する、変化し続ける artifact store として整理している。

比較の道具として、同じ「skill」と呼ばれる異なる artifact を分ける six-sense taxonomy、evidence acquisition・proposal・verification/admission・storage・retrieval/composition・maintenance・distillation/portability・governance からなる eight-stage lifecycle、skill record の軽量 schema と ten-operator vocabulary を提示する。文献横断では admission と repair の反復的重要性、verifier 品質が skill-aware reinforcement learning に与える影響、library 拡大時に flat retrieval が劣化し得ることをまとめる。現在の benchmark は library が時間とともにどう変化したか、skill が使われる頻度と実際の効用の差、安全面を十分に報告していないとして、static な prompt/tool collection ではなく changing library として評価するための reporting standard と open problem を示す。

## why_relevant_to_games

ゲーム制作 agent が蓄積する実装・playtest・評価手順を、採用前検証、検索、修復、rollback を含む lifecycle として扱う場面に接続できる。prototype ごとに増える制作 skill が、量の増加で検索精度や再利用性を落とす過程を観察する語彙にもなる。
