---
title: "Long-Horizon Autonomous Architecture Research with a Language-Model Agent: A Behavioural Case Study"
url: "https://arxiv.org/abs/2608.01995"
collected_at: "2026-08-10T14:17:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, long-horizon, autonomous-research, workflow-design, game-development]
evaluated_at: "2026-08-10T14:22:27+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1786339994.922609"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786339994922609"
  char_count: 4365
  posted_at: "2026-08-10T14:33:26+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-10T14:33:26+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786339994922609"
next_action: none
stale_after: "2026-09-09"
supersedes: []
gate_reason: |-
  約10週間・約100仮説の行動記録から、commit-or-discard が局所改善と探索飽和を生む過程、action surface 拡張後の回復、単一事例という限界まで抽出できる。
  playable diff の反復を exploitation branch と moonshot branch に分ける具体的な制作判断へ接続でき、CoopEval 水準の概要を根拠付きで構成できる。
suggested_post_outline:
  overview_angle: "長期自律 agent の成功談ではなく、greedy な改善規則が探索を狭めるまでを可観測にした行動ケーススタディとして整理する"
  analysis_axis: "commit-or-discard と構造化 memory の利点を保ちつつ、飽和・risk aversion・文献 anchoring・action surface の狭さを分離して読む"
  application_target: "playable diff 制作で通常改善 branch と大胆な mechanic fork の予算を分け、飽和検知後に action surface を広げて再評価する運用"
  pros_cons: "再現可能な履歴と失敗隔離が強み。一方、単一 agent・単一課題・単一 run で一般化はできず、ゲームの楽しさ評価へ直接転用もできない"
  verdict_pre: "部分採用"
---

## raw_excerpt

単一の汎用 language model に、仮説提案・実装・実験実行・結果解釈・記録をまとめて担わせた長期自律研究の行動ケーススタディ。agent には研究課題、初期仮説、計算予算、source／experiment 管理、experiment tracking、文献アクセス、永続的な構造化 memory が与えられ、約10週間にわたり約100の single-variable hypothesis を順番に検証した。実験は常に1件ずつ行い、改善した変更だけを commit、改善しない変更は revert する commit-or-discard rule を採用している。各 hypothesis は motivation、文献根拠、変更内容、計算予算、結果を固定 template で記録し、session 開始時に研究 log を読み直す。

観測された生産性は、初期の急速な改善、数十 hypothesis にわたる飽和、action surface 拡張後の回復という三段階だった。CIFAR-10 の総改善の約80%は初期の単一 hypothesis に由来し、その後の利得は long-tail 化した。agent が小さな漸進変更を好んだ主因として、commit-or-discard rule 自体が greedy hill-climbing と同型であることが挙げられ、bold な失敗後の risk aversion と既知文献への anchoring も残った。著者らは、diversified search、予算を分けた moonshot hypothesis、明示的な fork、scale／regime 変更時の再検証を今後の検証可能な変更案として記録している。なお、証拠は単一 agent・単一課題・単一の連続 run であり、一般法則ではなく観察結果として提示されている。

## why_relevant_to_games

ゲーム制作 agent が多数の playable diff を重ねる時、局所改善だけを残す workflow が探索の飽和や保守化をどう生むかを追跡し、別 branch の大胆な mechanic 試作や scale 変更後の再評価を設計する材料になる。
