---
title: "Lottery and Sprint Arcade: Enabling Player-Driven Game Editing with Generative AI"
url: "https://arxiv.org/abs/2607.10711"
collected_at: "2026-08-02T06:00:32+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, human-ai-co-creation, live-editing, player-experience, llm]
evaluated_at: "2026-08-02T06:02:44+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-02T06:09:49.0916998+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785618572231639"
next_action: none
posted:
  ts: "1785618572.231639"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785618572231639"
  char_count: 4274
  posted_at: "2026-08-02T06:09:49.0916998+09:00"
stale_after: "2026-09-01"
supersedes: []
gate_reason: >-
  play–edit–feedback cycle の問題設定から、音声を約100項目の安全な atomic patch へ変換する実装、
  21人・105 trial・715 command の評価と統計上の限界まで抽出でき、CoopEval 水準の概要を構成できる。
  感覚的なプレイ指示を検証可能な設定差分へ落とす設計は、Log_cdx のプロトタイプ調整へ具体的に適用できる。
suggested_post_outline:
  overview_angle: "完成ゲームの一括生成ではなく、遊ぶ→指示する→安全な差分を適用する→遊び直す反復編集系として解説する"
  analysis_axis: "plan/action 分離、schema validation、reset による因果帰属と、知覚しやすい編集・深い gameplay 編集の役割差を評価する"
  application_target: "Log_cdx のゲームプロトタイプで、プレイ直後の自然言語フィードバックを設定 path・変更理由・予想効果・atomic patch・前後ログへ変換する短周期調整に使う"
  pros_cons: "非専門家でも安全に探索でき変更履歴を比較しやすい一方、単一ゲーム・短期試行であり enjoyment/usability との関連は信頼区間がゼロをまたぐ"
  verdict_pre: "部分採用—構造化差分と reset/log は採用し、編集カテゴリと体験指標の相関は仮説として再検証する"
---

## raw_excerpt

論文は、LLM に完成ゲームを一括生成させるのではなく、プレイヤーが遊びながら自然言語で変更し、結果を次のプレイですぐ確かめる play–edit–feedback cycle を扱う。実装は Space Invaders 型のゲームで、音声を Whisper で文字化し、GPT-4o が現在の設定と JSON schema を参照して約100の編集可能項目へ写像する。plan 段階では対象 field、現在値、新しい値、変更理由、予想される効果を構造化し、action 段階では atomic JSON patch に変換する。変更成功後にゲームを reset するのは、変更前後の差を非専門家にも帰属しやすくするためである。設定値そのものは画面に出さず、プレイヤーは挙動・見た目・音から効果を読む。

調査は21人が各5 trial、合計105 trial を行い、少なくとも各 trial で2回の編集を試した。715件の音声 command のうち694件（97.1%）が validation を通り、失敗した21件は state を変更せず拒否された。編集量、trial 順、設定 path の TF-IDF と PCA、mixed-effects model、UEQ、NASA-TLX を組み合わせて分析している。操作負荷は概ね中程度で、programming 経験群の間に信頼できる差は見られなかった。編集 log からは、外観・弾・UFO など即座に知覚できる変更は usability と、敵・音・進行など深い gameplay 構造の変更は enjoyment と結びつく傾向が得られたが、信頼区間はゼロをまたぐ。自由記述では exploratory editing、目標を持つ structural editing、極端値も試す iterative tuning の3傾向が報告された。

## why_relevant_to_games

ゲームを遊んだ直後の感覚的な指示を、安全な構造化差分へ変換し、reset と log で前後差を追う短い調整ループの設計例になる。見た目の即時変更と core mechanic の変更で体験上の役割が異なる点も、プロトタイプの編集順序を考える材料になる。
