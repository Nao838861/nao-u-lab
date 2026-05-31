---
title: "Odysseus: Scaling VLMs to 100+ Turn Decision-Making in Games via Reinforcement Learning"
url: "https://arxiv.org/abs/2605.00347"
collected_at: "2026-05-26T03:05:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, playtest, ai-agent, vlm, reinforcement-learning, platformer]
evaluated_at: "2026-05-26T03:11:06+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-26T03:29:40+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779732980931389"
posted:
  ts: "1779732980.931389"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779732980931389"
  char_count: 3903
  posted_at: "2026-05-26T03:29:40+09:00"
stale_after: "2026-06-25"
supersedes: []
next_action: none
gate_reason: >-
  100+ turn の長期意思決定で VLM agent が崩れる問題、turn-level critic 付き RL、Super Mario Land 評価という骨格が揃っている。
  Nao_u_BOT の headless 評価が短期入力列に寄りがちな問題へ、長期ターン安定性と action prior の観点を直接持ち込める。
  CoopEval 水準の概要では、RL 論文紹介よりも「ゲーム評価者を長く保たせる条件」として書ける。
suggested_post_outline:
  overview_angle: "VLM をゲームプレイヤーにする話ではなく、100+ turn の評価者・操作者を安定させる訓練設計として書く。"
  analysis_axis: "SFT/短期 RL の限界、turn-level critic の役割、pretrained VLM の action prior、in-game/cross-game generalization を比較する。"
  application_target: "headless playtest harness、長期 run の崩壊検出、BOMB なし完走などの評価設計に適用する。"
  pros_cons: "強みは長期行動評価の具体軸がある点。弱みは Super Mario Land 依存と RL 訓練コストで、即時実装は proxy 指標からになる点。"
  verdict_pre: "部分採用"

---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv metadata / abstract の要点メモとして保存する。短い原文句: "100+ turns" / "lightweight turn-level critic"。

Odysseus は、VLM を video game のような interactive decision-making task へ拡張する研究。既存手法は human trajectory による大規模 SFT、または 20-30 turn 程度の短い RL 設定に寄りがち、という問題設定を置く。対象環境は Super Mario Land で、100 turn 以上に渡り、画面理解、推論、操作選択をつなげる必要がある。提案は RL-based training を安定させるため、PPO に軽量な turn-level critic を組み合わせる adapted variant。critic-free な GRPO や Reinforce++ と比べて training stability と sample efficiency を改善する、とされる。さらに pretrained VLM が強い action prior を持つため、古典的 deep RL のゼロからの学習より sample efficiency がよく、action engineering の手作業負担も下がる、という主張。結果は複数 level、in-game / cross-game generalization、general-domain capabilities 維持を含む構成。

## why_relevant_to_games
LLM/VLM をゲーム制作用の自動プレイヤー・評価者にする時、「長いプレイをどこで崩すか」を見る候補。Nao_u_BOT の headless 評価で、単発入力ではなく長期ターンの安定性を測る発想に使える。
