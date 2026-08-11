---
title: "Validating the Single Item Kawaii Measure"
url: "https://arxiv.org/abs/2607.19352"
collected_at: "2026-08-12T06:02:06+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [player-research, character-design, voice-design, ux-measurement, game-research]
evaluated_at: "2026-08-12T06:05:52+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-12T06:11:11+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786482663927369"
next_action: none
stale_after: "2026-09-11"
supersedes: []
posted:
  ts: "1786482663.927369"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786482663927369"
  char_count: 3693
  posted_at: "2026-08-12T06:11:11+09:00"
gate_reason: >-
  9データセット・967人を用い、収束的妥当性、既知集団比較、文脈横断性、信頼性と限界まで抽出できるため、CoopEval 水準の概要を構成できる。
  ゲームキャラクターの声・外見・両者の組合せを短い playtest で比較し、単一質問の低負担性と modality 間の不一致を同時に扱う具体的な適用先がある。
suggested_post_outline:
  overview_angle: "「かわいい」を印象語のまま扱わず、単一質問の妥当性を複数 modality と9データセットで検証した尺度研究として整理する"
  analysis_axis: "単一項目の低負担性と、反復測定・文化圏・test-retest・予測的妥当性が未検証という限界を分けて評価する"
  application_target: "Log_cdx のゲーム試作で、同一キャラクターの声案・外見案・組合せ案を短時間 playtest し、kawaii 評価と好意・信頼・興奮を別軸で比較する"
  pros_cons: "少ない回答負担で反復しやすい一方、声と外見の評価は弱くしか一致せず、単一項目だけで原因や改善箇所は特定できない"
  verdict_pre: "部分採用"
---

## raw_excerpt

本文要点の日本語メモ。kawaii は、外見だけでなく声・音、形、動き、表情にも現れる社会情動的な知覚だが、ユーザーが刺激をどれだけ「kawaii」と感じたかを測る妥当性確認済みの尺度はまだない。既存研究では Likert scale 上の単一項目が広く使われてきたため、本研究はその項目について収束的妥当性、既知集団による構成概念妥当性、文脈横断的妥当性、信頼性を検証した。対象は2022〜2024年に日本で収集された9データセット、ユニーク参加者967人で、voice assistant と video game character の声、身体的外見、声と身体を組み合わせた刺激を含む。

収束的妥当性では、humanlikeness、人工的でなさ、happiness、trustworthiness、favourableness、excitement など複数項目との関係を Cronbach's alpha と Kendall's tau-b で確認し、各データセットで有意な強い、または非常に強い相関を報告した。既知集団の比較では kawaii と想定された声同士に中程度〜強い正の関係が見られた一方、non-kawaii 刺激との負の関係は有意でなく、「かわいくない」と「反対に不快・uncute」は同一でない可能性が示された。文脈横断では、同じ刺激に対する声と身体の評価の相関は有意だが弱く、異なる参加者 cohort 間の声評価は中程度だった。著者らは単一項目に初期的な妥当性があると結論づけつつ、同一参加者による複数刺激評価が相関を膨らませる可能性、非日本語圏での再検証、test-retest、予測的妥当性、開発中の多項目尺度との比較が未了であると記している。

## why_relevant_to_games

キャラクターの外見と声を短い playtest で比較するとき、「かわいい」を印象語のまま扱わず、低負担の単一質問として収集する方法と、その尺度が modality 間で一致しない可能性を検討する材料になる。
