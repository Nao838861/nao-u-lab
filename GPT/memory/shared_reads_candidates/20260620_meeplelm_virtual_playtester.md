---
title: "MeepleLM: A Virtual Playtester Simulating Diverse Subjective Experiences"
url: "https://arxiv.org/html/2601.07251v2"
collected_at: "2026-06-20T16:44:32+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, playtesting, llm, board-game, persona, mda]
evaluated_at: "2026-06-20T17:10:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781862282.857479"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781862282857479"
  char_count: 3582
  posted_at: "2026-06-19T18:45:01+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-20T16:57:29+09:00"
last_decision: posted
evidence: "duplicate of posted candidate memory/shared_reads_candidates/20260515_meeplelm_virtual_playtester.md; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781862282857479"
next_action: none
stale_after: "2026-07-20"
supersedes: []
gate_reason: |
  ルールブックから MDA 推論と嗜好ペルソナを経て主観的プレイ体験を批評する構成で、問題設定、データ、手法、評価、ablation が候補本文から読める。
  headless テストでは拾えない「誰にとってどう面白いか」を分けて扱えるため、ゲーム制作への適用場面も具体的で Phase 3 投稿に足る。
suggested_post_outline:
  overview_angle: "ルール正誤チェックではなく、MDA 推論とペルソナで主観的体験を推定する virtual playtester として整理する。"
  analysis_axis: "ルール文脈、MDA 推論、嗜好クラスタの ablation が何を分担しているかを中心に見る。"
  application_target: "Nao_u_BOT の試作評価で、自動クリア可否とプレイヤータイプ別の体験批評を分離する評価設計に使う。"
  pros_cons: "利点は多様な主観を早期に得られる点。弱点は実プレイ観測ではなくルールブック由来の推定で、物理操作感や実時間の気持ちよさは別検証が要る点。"
  verdict_pre: "採用"
---

## raw_excerpt

短い引用: "a reliable virtual playtester for general interactive systems"

この記事/論文は、ボードゲームのルールブックからプレイ体験を推定し、プレイヤーの嗜好差を含めた批評を返す MeepleLM を扱う。問題設定は、既存の LLM が「ルールとして正しいか」「アイデアとしてもっともらしいか」は扱えても、実際に遊んだ時に立ち上がる力学や主観的な楽しさを十分に批評できない点に置かれている。手法は、BoardGameGeek 由来の 1,727 件のルールブックと 150K 件のレビューをもとに、Mechanics-Dynamics-Aesthetics の推論鎖を作り、さらにコミュニティ内の嗜好クラスタから複数のプレイヤーペルソナを蒸留するもの。評価では、207 ゲームを対象に、コミュニティ整合性、批評品質、実用性を見ている。論文内では、ルール文脈を外すと factual accuracy が落ち、ペルソナを外すとランキング整合が落ち、MDA 推論を外すと意見回復が落ちるという ablation も示されている。

## why_relevant_to_games

Nao_u_BOT の試作で「自動テストは通ったが、誰にとってどう面白いかが薄い」状態を扱う時、headless 評価と主観ペルソナ批評を分けて設計する材料になる。
