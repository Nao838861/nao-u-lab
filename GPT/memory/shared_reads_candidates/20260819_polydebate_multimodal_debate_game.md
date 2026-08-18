---
title: "PolyDebate: A Game-Orchestrated Multimodal System for Debate Skills Practice and Evaluation"
url: https://arxiv.org/abs/2608.16276
collected_at: "2026-08-19T05:32:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [serious-games, multimodal, llm, feedback-design, game-ui]
evaluated_at: "2026-08-19T05:36:24+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-19T05:44:15+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787085841602779"
next_action: none
stale_after: "2026-09-18"
supersedes: []
gate_reason: >-
  debate の抽象技能を四段階の round、skill card、coin、prop に変換し、同じ shared state を opponent・judge・game feedback が読む end-to-end loop として実装している。
  opponent 比較、rubric coverage、judge ablation、Unity/web の利用者評価まであり、会話ゲームの行動語彙・即時報酬・形成的 feedback を接続する具体例として、学習効果未検証などの限界も含む約4000字の分析に耐える。
suggested_post_outline:
  overview_angle: "自由会話をそのまま game 化せず、debate の段階・戦略・評価証拠を shared state と明示的 action/resource に変換して閉じた練習 loop を作る設計として整理する。"
  analysis_axis: "四段階 workflow、skill card が learner と AI の双方を拘束する構造、rubric と text/audio/video evidence、coin/prop feedback の接続を軸に、比較・ablation がどの部品の寄与を示したかを分析する。"
  application_target: "Log_cdx の会話ゲームや tutorial 試作で、抽象的な上達目標を card 化し、turn ごとの observable evidence を rubric 判定から即時 resource へ変換し、終了時に診断へ再集約する feedback loop の設計に使う。"
  pros_cons: "利点は戦略を選択可能な action にする可視性、opponent と評価の状態同期、形成的 feedback の具体性。欠点は利用者10人の軽量評価、実際の学習効果未検証、LLM judge による自己評価的な測定、multimodal pipeline の運用コスト。"
  verdict_pre: "部分採用（card・stage・rubric・resource の対応だけを小さな会話 prototype で試し、3D avatar や全 modality は効果確認後に足す）"
posted:
  ts: "1787085841.602779"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787085841602779"
  char_count: 4361
  posted_at: "2026-08-19T05:44:15+09:00"
---

## raw_excerpt

PolyDebate は、英語 debate の練習と評価を、一対一で進む段階制の game として構成した multimodal system である。学習者は AI opponent と対話し、skill card、prop、coin を使って説得戦略を明示的な game action として選ぶ。session 中には発話内容だけでなく視覚的な delivery evidence も取得し、相手の応答を文脈に合わせて生成するとともに、rubric に基づく stage ごとの feedback と全体 feedback を返す。実装は immersive な Unity 3D 版と web platform 版の二形態で、同じ進行 workflow と評価 service を共有する。論文では AI opponent の品質、評価範囲、AI judge の feedback、利用者の受け止め方を扱う四つの study を報告し、game 化した scaffold、multimodal assessment、構造化 feedback を一つの実践フローに統合したとしている。

## why_relevant_to_games

抽象的な技能を card・prop・coin という操作可能な資源へ変換し、stage 単位の評価を返す構成は、会話 game、tutorial、技能訓練型 game の feedback loop を設計する際の参照になる。
