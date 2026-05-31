---
title: "Multi-Agent Strategic Games with LLMs"
url: "https://arxiv.org/abs/2605.03604"
collected_at: "2026-05-17T05:29:19+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-agent, multi-agent, cooperation, conflict, communication]
evaluated_at: "2026-05-17T05:36:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-17T05:38:02+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778963879436699"
posted:
  ts: "1778963879.436699"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778963879436699"
  char_count: 3990
  posted_at: "2026-05-17T05:38:02+09:00"
stale_after: "2026-06-16"
supersedes: []
next_action: none
gate_reason: |
  repeated security dilemma を通信、人数、有限 horizon で操作する設計なので、問題設定・手法・評価結果・結論が候補段階で具体的に揃っている。
  協力/裏切り/交渉ゲームのルール設計と、LLM player の公開発話・内部推論ログを分ける評価設計に接続でき、4000 字級の概要にも耐える。
suggested_post_outline:
  overview_angle: "LLM を strategic game の被験者として使い、通信・人数・終端条件が協力/対立をどう変えるかを見る実験として読む"
  analysis_axis: "multipolarity、finite horizon、communication の 3 操作と、public messages / private reasoning / observed actions の三層ログを軸に分析する"
  application_target: "協力ゲーム、交渉ゲーム、裏切りを含む小規模プロトタイプ、LLM プレイヤー評価ログ設計"
  pros_cons: "長所はルール変数と行動変化の対応が明確な点。短所は security dilemma の抽象ゲームであり、商用ゲームの体験価値には翻訳が必要な点"
  verdict_pre: "部分採用"

---

## raw_excerpt
arXiv:2605.03604。2026-05-05 submitted。LLM を repeated security dilemma の experimental subjects として扱い、conflict / cooperation の理論的メカニズムを再現するかを調べる論文。baseline game を multipolarity、finite time horizons、availability of communication の 3 軸で拡張し、複数モデルの挙動を比較する。

要旨メモ: 結果は systematic and consistent patterns を示し、multipolarity は conflict likelihood を上げ、finite horizons は backward-induction logic と整合する universal unraveling を誘発し、communication は signaling and reciprocity により conflict を減らす、とされる。観測された行動だけでなく、agents' private reasoning と public messages を取得できるため、preemption、cooperation under uncertainty、trust-building のような strategic logics と行動選択を接続して分析できる点が方法論的な貢献として示されている。

## why_relevant_to_games
協力・裏切り・交渉を含む小規模ゲームの設計で、通信チャネル、人数、終端条件がプレイ感と均衡をどう動かすかを考える材料になる。LLM プレイヤーを評価器として使う時も、公開発話と内部推論を分けてログ化する観点に使える。
