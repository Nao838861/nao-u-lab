---
title: "Ctrl + Create: Empowering Creative Control in AI-Driven Rapid Level Design"
url: "https://dl.acm.org/doi/10.1145/3815598.3815646"
collected_at: "2026-08-23T11:17:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, level-design, generative-ai, mixed-initiative, creative-control, prototyping]
evaluated_at: "2026-08-23T11:22:07+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-23T11:27:30+09:00"
last_decision: postponed
evidence: "FDG abstract + ACM/DBLP/OpenAlex/Semantic Scholar metadata; full text unavailable at final review"
next_action: acquire_fulltext_then_candidate_revise
stale_after: "2026-09-22"
supersedes: []
gate_reason: >-
  空間配置を人間の control layer として残し、生成 AI を visualization layer に限定する着想が明確で、
  3条件・n=20 の比較から control、表現力、反復速度の結果まで追える。実制作への適用と限界を含む約4000字の分析が可能である。
suggested_post_outline:
  overview_angle: "level design の速度と designer agency の対立を、人間が空間を決め AI が視覚化する二層 pipeline で解く研究として整理する。"
  analysis_axis: "manual drawing、bare text-to-image、spatial-control pipeline の3条件を、配置の主導権、visual expressiveness、専門描画技能、iteration speed の差で比較する。"
  application_target: "Log_cdx のゲーム prototype で、衝突・導線・距離を決める whitebox を正本にし、画像生成を見た目候補の探索へ限定する制作ループに適用する。"
  pros_cons: "利点は高速な視覚探索と配置意図の保持を両立できること。弱点は n=20 の初期研究で、生成画像から実行可能 geometry への変換や gameplay validation を別途必要とすること。"
  verdict_pre: "部分採用。空間制約と生成表現の分離は採るが、生成結果を level data の正本にはしない。"
final_gate_reason: >-
  公開取得できたのは FDG 2026 abstract と書誌 metadata までで、12ページ本文は ACM 403、
  OpenAlex / Semantic Scholar / DBLP にも別の full-text URL がなかった。pipeline の具体構成、
  参加者属性、課題設計、尺度、統計量、質的分析、失敗条件を監査できず、3500-4500字の
  記事固有分析を推測なしで支えられないため、Phase 3 の最終ゲートで投稿を延期する。
---

## raw_excerpt

FDG 2026 の Generative AI track に掲載された研究。level design は、designer、artist、writer、gameplay engineer の間で creative vision を伝え、whiteboxing と set dressing を反復する労働集約的な工程である。画像生成 AI は初期案を素早く可視化できる一方、結果が model の解釈と能力に引っ張られ、designer が空間配置を直接決める control を失う可能性がある、という対立を問題設定にする。

提案は、generative AI に完成イメージを全面委任するのではなく、user-centered spatial control と生成 visualization を組み合わせる level-design pipeline である。著者らは mixed-methods study（n=20）を行い、手描きによる条件、text-to-image による条件、空間制御を組み込んだ提案 pipeline の3条件を比較した。公式 abstract が報告する範囲では、提案手法は bare な AI 条件より visual expressiveness と sense of control を高め、専門的な描画技能を要求せずに manual drawing 条件と同程度の control を示し、iteration も高速化した。収録内容は FDG 2026 公式 abstract と ACM / DBLP metadata に基づく。

## why_relevant_to_games

level のラフ配置を人間側で固定しつつ、見た目の候補生成だけを AI に任せる mixed-initiative prototype を設計する場面に関係する。
