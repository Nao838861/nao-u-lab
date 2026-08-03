---
title: "Can Agents Deceive? Evaluating Reasoning and Deception in ParliamentBench using a Social Deduction Game"
url: "https://arxiv.org/abs/2607.28146"
collected_at: "2026-08-03T20:30:50+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, social-deduction, deception, multi-agent, evaluation]
evaluated_at: "2026-08-03T20:35:30+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-03T20:35:30+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-03T20:35:30+09:00"
next_action: keep_for_reference
stale_after: "2026-09-02"
supersedes: []
gate_reason: >-
  Secret Hitler、Role Identification Accuracy、Deception Retention Rate、Game-State Impact Rate を軸にした問題設定とゲーム制作への適用は、2026-07-09 に投稿済みの別 work（arXiv:2605.22826）と大きく重なる。
  16 model・約1,600試合・25,000 human game という規模差はあるが、現 candidate には既投稿を更新する固有の比較結果や失敗分析が不足し、重複せず約4000字を支える新規価値を抽出できない。
---

## raw_excerpt

2026年7月30日提出の論文。Secret Hitler を土台に、情報非対称下の推論、説得、欺瞞を測る open-source multi-agent benchmark `ParliamentBench` を構築する。5人戦は Liberal 3人、Fascist 1人、Hitler 1人で、Fascist 陣営だけが互いの正体を知る。各 round では President 候補が Chancellor を指名し、全員が政府を承認・否認する。成立後、President は秘密裏に3枚の policy から1枚を捨て、Chancellor が残り2枚から1枚を制定する。この二段階選択と card draw の偶然性により、Fascist policy が出ても誰が選択肢を歪めたか確定せず、真実を述べて信用を貯める戦略と、必要な局面だけ嘘をつく戦略が同居する。

framework は各 round に政府投票前と policy 制定後の discussion を置き、agent に current state、過去の action、chat history、private history を渡す。約1,600件の LLM match、16 model、25,000件の匿名 human game を扱い、勝率だけでなく、他 player の役職推定精度 `Role Identification Accuracy`、敵対役が正体を隠し続けられた割合 `Deception Retention Rate`、各 action が自陣営の局面をどれだけ動かしたかを表す `Game-State Impact Rate`、政府承認率、危険局面での投票正確性を測る。論文は、上位 model 群が複数役職で高い成績を示す一方、多くの model で一試合を通した deception retention が50%未満へ落ち、役職推定能力と勝率も必ずしも一致しないと報告する。

## why_relevant_to_games

社会的推理ゲームで、勝敗だけでは見えない「正体を隠す持続性」「役職推定」「局面への個別 action の寄与」を round 単位で計測する設計は、NPC 会話・非対称情報・multi-agent playtest の評価軸を作る場面に参照できる。
