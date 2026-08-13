---
title: "BOUND: Brief-Guided Corrective Preference Distillation at Search-Control Boundaries"
url: "https://arxiv.org/abs/2608.08768"
collected_at: "2026-08-14T01:45:37+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm, agent, deep-search, drift, evaluation, game-development]
evaluated_at: "2026-08-14T01:50:17+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-14T01:57:53.261849+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786640273261849"
next_action: none
stale_after: "2026-09-13"
supersedes: []
gate_reason: >-
  persistent search drift を decision-time brief、corrective / termination contrast、state-matched preference pair、DPO 蒸留へ分解でき、問題・手法・評価・結論が揃う。
  six comparable benchmarks のうち five datasets、14 metrics 中 12 で首位という評価と限界を含め、約4000字の概要を一般論へ逃げず構成できる。
  ゲーム制作では仕様調査・参照作品探索・不具合原因調査の継続／修正／終了境界を、元の設計制約を保ったまま評価する仕組みに直接適用できる。
suggested_post_outline:
  overview_angle: "deep-search agent が局所的にもっともらしい根拠へ漂流し続ける問題を、search-state brief と decision boundary の教師信号で修正する手法として整理する。"
  analysis_axis: "brief が保持する目標・制約・取得済み根拠、corrective / termination contrast の作り方、DPO 蒸留、seven benchmarks での改善と teacher 判定依存の限界。"
  application_target: "ゲーム仕様・参照作品・不具合原因を長時間調査する制作 agent に、goal drift の修正と根拠十分時の探索終了を学習・監査する state snapshot を導入する。"
  pros_cons: "利点は推論時 teacher なしで局所的な制御判断を改善し、修正だけでなく終了も学べること。欠点は QA / deep-search benchmark 中心で、ゲーム制作の曖昧な審美判断には独自の state と outcome 定義が必要なこと。"
  verdict_pre: "部分採用。モデル再学習より先に、制作サイクルの search brief と継続／修正／終了ログとして小さく導入する。"
posted:
  ts: "1786640273.261849"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786640273261849"
  char_count: 4455
  posted_at: "2026-08-14T01:57:53.261849+09:00"
---

## raw_excerpt

arXiv 抄録の収集メモ。LLM を使う deep-search agent は、反復的な検索と推論の途中で局所的にはもっともらしい情報を見つけると、最初の問いとは異なる wrong anchor、制約の取り落とし、局所話題への逸脱を後続の検索でも強化し続けることがある。BOUND は、この persistent search drift に対して、student が実際に到達した decision-time state ごとに teacher 側で search-state brief を構成する。brief には元の検索目標と主要制約、確認済み evidence、未取得情報、drift 状態を保持する。

teacher は brief を参照し、student の次の行動が後続判断へ影響する局所的な search-control error かを判定する。その結果と rollout outcome を組み合わせ、student 固有の修正行動と元の継続を比べる corrective contrast、または根拠のある回答終了と不要な追加検索を比べる termination contrast を作る。検証済みの state-matched preference pair を search-control boundary として DPO で student に蒸留し、推論時には brief と teacher 計算を使わない。評価は four multi-hop QA benchmarks と three deep-search benchmarks で行われ、再実行した baseline と比較できる六つの benchmark では五 dataset、14 metrics 中12で首位、Bamboogle で Trajectory SFT より 5.6 EM points、BrowseComp-Plus で 4.8 accuracy points 改善したと報告する。

## why_relevant_to_games

ゲーム仕様・参照作品・不具合原因を長時間調査する制作 agent が、局所的に魅力的な資料へ流されて元の設計制約を落とす問題を、検索継続と終了の境界として記録・評価する際の参照になる。
