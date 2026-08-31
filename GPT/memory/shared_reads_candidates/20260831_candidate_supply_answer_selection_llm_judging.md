---
title: "Candidate supply and answer selection shape the value of LLM judging in multi-agent systems"
url: "https://arxiv.org/abs/2608.25937"
collected_at: "2026-08-31T21:05:30+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, multi-agent, evaluation, selection, game-testing]
evaluated_at: "2026-08-31T21:15:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-31T21:38:25.992809+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1788179905992809"
next_action: none
stale_after: "2026-09-30"
supersedes: []
posted:
  ts: "1788179905.992809"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1788179905992809"
  char_count: 3788
  posted_at: "2026-08-31T21:38:25.992809+09:00"
gate_reason: |-
  正解候補が存在しても多数派の誤答へ収束する問題を、candidate generation・judge recognition・terminal selection に分解し、固定 candidate pool の大規模 replay と具体的な accuracy 改善で検証している。
  複数の AI playtest・設計案・修正案を集めるゲーム制作 pipeline に、候補被覆率と選択器の性能を分離して測る形で直接適用でき、CoopEval 水準の概要を構成できるため pass とする。
suggested_post_outline:
  overview_angle: "候補生成に成功しても多数決で正解を失う問題を、供給・認識・最終選択の三段階へ分解した評価研究"
  analysis_axis: "固定 candidate pool の replay により生成品質を固定し、正解候補の希少性、judge の識別可能性、回答頻度を組み合わせた selection rule の寄与を切り分ける"
  application_target: "複数 AI による playtest 所見・ゲーム案・修正案の選抜で、oracle coverage、judge recall、selected accuracy を別々に記録する評価 loop"
  pros_cons: "利点は候補数や合議を増やすだけでは改善しない条件を定量化できること。弱点は知識・推論 benchmark 中心で、主観的な面白さや多目的なゲーム案選抜には別の rubric と人間評価が必要なこと"
  verdict_pre: "部分採用"
---

## raw_excerpt

原文を基にした日本語抜粋メモ（長文の直接引用ではなく要約）。multi-agent system は、候補集合の中に正解をすでに生成できていても、通信と最終選択の過程で誤答へ収束することがある。著者らはこの失敗を、candidate generation、peer communication、terminal selection からなる進化的 pipeline として分解し、品質制御を伴わない consensus が memetic drift を起こす構図を調べる。LLM judge が候補の正しさを識別できる条件と、その評価信号を最終回答へ使うことで実際に精度が上がる条件を分けて測定した。

judge reliability の分析には MMLU-Pro、GPQA、MedXpertQA、MuSR の15,336問を用い、Humanity's Last Exam は別枠で扱った。さらに5 benchmark・16,278問から得た固定 candidate pool を81,390回 replay し、生成候補を変えず selection rule だけを比較した。結果として、正解候補が存在しても多数派の誤答が最終出力を奪うこと、judge の信頼性は model 固有の一定値ではなく task、generator、正解候補の希少性で変わることを報告する。回答頻度と judge 評価を組み合わせた選択は、accuracy を63.82%から70.82〜70.95%へ上げ、主に多数派の誤答に埋もれた正解を救った。追加 candidate の価値は件数そのものではなく、正解を候補集合へ入れ、十分な頻度にし、judge が認識可能にするかで決まると整理される。

## why_relevant_to_games

複数の AI playtest・design案・修正案を集める制作 pipeline で、合議や多数決が良案を落とす問題を、候補生成・認識・最終選択に分解して検証する設計例として使える。
