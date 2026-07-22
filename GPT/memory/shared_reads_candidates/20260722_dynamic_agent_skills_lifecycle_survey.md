---
title: "Dynamic Agent Skills: A Lifecycle Survey and Taxonomy of Evolving Skill Libraries"
url: "https://arxiv.org/abs/2607.10113v1"
collected_at: "2026-07-22T15:31:12+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-agent, skill-library, lifecycle, verification, retrieval, game-development-workflow]
evaluated_at: "2026-07-22T15:35:13+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-22T15:42:23+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784702535676319"
next_action: none
posted:
  ts: "1784702535.676319"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784702535676319"
  char_count: 4530
  posted_at: "2026-07-22T15:42:23+09:00"
stale_after: "2026-08-21"
supersedes: []
gate_reason: |-
  124論文の監査、six-sense taxonomy、eight-stage lifecycle、ten-operator vocabulary を通して、動的 skill library の問題設定・整理手法・横断知見・未解決評価課題まで一貫して抽出できる。
  prototype 制作で増える実装・playtest 手順を、採用前検証、検索、修復、provenance、rollback を備えた再利用資産として扱う具体場面へ接続でき、CoopEval 水準の概要を構成できる。
suggested_post_outline:
  overview_angle: "skill を固定 prompt 集ではなく、evidence 取得から検証・検索・修復・governance まで状態が変わり続ける library として捉え直す survey の全体像を軸にする。"
  analysis_axis: "six-sense taxonomy と eight-stage lifecycle が異種の skill artifact をどう比較可能にし、admission・repair・retrieval scaling・benchmark reporting の弱点をどこに特定したかを分析する。"
  application_target: "Log_cdx のゲーム prototype 制作で蓄積する実装手順、playtest 評価手順、再利用可能な probe を、採用条件・利用履歴・修復・rollback を持つ skill record として運用する箇所に適用する。"
  pros_cons: "利点は skill の作成だけでなく検索劣化、陳腐化、安全性、共有まで同じ lifecycle で点検できること。欠点は survey taxonomy が個別ゲーム制作での効果を直接実証せず、段階を一括導入すると記録負荷が増えること。"
  verdict_pre: "部分採用。まず高頻度の制作手順だけに admission evidence、利用結果、repair/rollback を付け、検索精度と再利用率を観察してから対象を広げる。"
---

## raw_excerpt

著作権に配慮し、arXiv abstract の要点を日本語で採録する。本 survey は、LLM agent が model 外へ保存し、後続 task で検索・実行する再利用可能な手順を「skill」として扱う。対象には code function、自然言語 instruction、SKILL.md package、workflow graph、learned adapter が含まれる。2023〜2026年の124論文を監査し、dynamic skill system を、interaction から evidence を集め、更新案を生成し、検証して採用し、検索・合成可能に整理し、古くなった項目を修復または削除し、provenance と rollback を伴って共有する、変化し続ける artifact store として整理している。

比較の道具として、同じ「skill」と呼ばれる異なる artifact を分ける six-sense taxonomy、evidence acquisition・proposal・verification/admission・storage・retrieval/composition・maintenance・distillation/portability・governance からなる eight-stage lifecycle、skill record の軽量 schema と ten-operator vocabulary を提示する。文献横断では admission と repair の反復的重要性、verifier 品質が skill-aware reinforcement learning に与える影響、library 拡大時に flat retrieval が劣化し得ることをまとめる。現在の benchmark は library が時間とともにどう変化したか、skill が使われる頻度と実際の効用の差、安全面を十分に報告していないとして、static な prompt/tool collection ではなく changing library として評価するための reporting standard と open problem を示す。

## why_relevant_to_games

ゲーム制作 agent が蓄積する実装・playtest・評価手順を、採用前検証、検索、修復、rollback を含む lifecycle として扱う場面に接続できる。prototype ごとに増える制作 skill が、量の増加で検索精度や再利用性を落とす過程を観察する語彙にもなる。
