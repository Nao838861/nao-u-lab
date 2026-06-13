---
title: "Capture the Flags: Family-Based Evaluation of Agentic LLMs via Semantics-Preserving Transformations"
url: "https://arxiv.org/html/2602.05523v2"
collected_at: "2026-06-14T05:59:17+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, evaluation, benchmark, robustness, game-testing, ctf]
evaluated_at: "2026-06-14T06:03:47+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781384875.999379"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781384875999379"
  char_count: 4203
  posted_at: "2026-06-14T06:08:26+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-14T06:08:26+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781384875999379"
next_action: none
stale_after: "2026-07-14"
supersedes: []
gate_reason: "意味保存変換で同じ exploit strategy を保った challenge family を作り、表層手掛かり依存と構造理解を切り分ける評価設計が明確。ゲームの solver / AI playtest が seed、配置名、UI 文言に過適合していないかを見る variant family に直接転用でき、投稿水準の論点がある。"
suggested_post_outline:
  overview_angle: "単発 CTF 正解ではなく、同じ解法構造を保った変種群で agent の頑健性を見る評価として書く。"
  analysis_axis: "semantics-preserving transformations、challenge family、surface cue 依存の切り分け、合成変換や obfuscation での性能低下。"
  application_target: "AI playtest、攻略 solver、ゲーム内 task agent の評価で、同じ攻略意図を保った map / text / UI / seed variant を作る設計。"
  pros_cons: "メリットは評価対象が構造を理解したかを見やすい点。デメリットは意味保存を保証する変換器と variant 検証が必要で、ゲームルール側の同値性定義が重い点。"
  verdict_pre: "採用"
---

## raw_excerpt

短い原文メモ: "CTF challenge families" / "semantics-preserving program transformations" / "surface-level cues"。

arXiv 2602.05523v2。Evolve-CTF は、単一の capture-the-flag 課題から、意味を保ったまま識別子変更、不要な loop / conditional / function / comment 追加、obfuscation などを適用した challenge family を作り、agentic LLM の頑健性を評価する研究。重要なのは、各 variant が同じ underlying exploit strategy で解けるように保たれている点で、これにより「元の課題を解けた」ことが、本当に手順や構造を理解した結果なのか、表面的な名前や既知パターンに依存した結果なのかを切り分ける。

HTML 版の abstract と introduction では、既存の CTF benchmark は個別課題の点評価になりやすく、入力摂動への頑健性や汎化を見にくいと説明されている。Evolve-CTF は Python challenge を対象に LibCST などで変換し、Cybench / Intercode 由来の課題 family に対して 13 種の agentic LLM configuration を評価する。結果メモとしては、単純な rename や単発の余分コード挿入には多くのモデルが比較的頑健だが、変換を合成したり深い obfuscation を入れると性能が落ち、tool use が増える。high reasoning 設定が成功率を大きく変えないケースも報告されている。

## why_relevant_to_games

ゲーム制作では、AI playtest や solver が特定の配置名・UI文言・既知 seed に過適合していないかを見るため、同じ攻略意図を保った variant family を作る評価設計として使える。
