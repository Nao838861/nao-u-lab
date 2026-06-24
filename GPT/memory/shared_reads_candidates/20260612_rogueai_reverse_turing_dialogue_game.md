---
title: "RogueAI: A Reverse Turing Test for Detecting Licensed AI Deception in Dialogue"
url: "http://arxiv.org/abs/2606.13310v1"
collected_at: "2026-06-12T13:30:15+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-deception, dialogue-game, llm-agent, evaluation]
evaluated_at: "2026-06-12T13:38:21+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781239550.760649"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781239550760649"
  char_count: 3787
  posted_at: "2026-06-12T13:45:50.760649+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-12T13:45:50.760649+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781239550760649"
next_action: none
stale_after: "2026-07-12"
supersedes: []
gate_reason: "AI deception を抽象的な安全論ではなく、one-on-two interrogation game として操作可能な設計に落としている。問題設定、licensed deceiver の役割、プレイヤー質問、信頼判定という手法要素が明確で、対話 NPC / 情報推理 / 尋問 UI へ具体的に転用できる。CoopEval 水準の概要も、信頼性をプレイヤーが探索するゲーム設計として十分な密度で書ける。"
suggested_post_outline:
  overview_angle: "Turing Test を『人間らしさ』から『信頼できる相手を見抜けるか』へ反転し、AI deception を対話ゲームの検証課題にした点を中心に書く。"
  analysis_axis: "licensed to deceive された agent、共有架空世界、2 体比較、プレイヤー主導の質問設計、最終信頼判定が評価設計として何を分離しているか。"
  application_target: "Nao_u_BOT の対話 NPC、隠し役職、証言比較、プレイヤーが質問で状態を絞るプロトタイプの設計・評価。"
  pros_cons: "利点は deception を安全な箱庭内で扱え、対話の面白さと評価が一致する点。弱点は論文候補時点でゲーム体験の深いユーザー評価や長期リプレイ性が薄い可能性。"
  verdict_pre: "部分採用。対話推理ゲームの評価枠として採用し、欺瞞の強度や失敗時の納得感は別途プロトタイプで検証する。"
---

## raw_excerpt

arXiv 検索結果と `memory/raw/web_research/results.jsonl` の要旨メモ。RogueAI は、従来の Turing Test を「AI らしさを見抜く」問題から「対話相手を信用できるか」にずらし、1 人の人間プレイヤーが 2 体の区別不能な LLM agent に質問する one-on-two interrogation game として実装する。設定上、片方の agent だけが共有された架空世界の中で deceiver として licensed され、プレイヤーは対話を通じてどちらが信用できないかを推定する。重要なのは、AI deception を単なる分類器評価ではなく、プレイヤーが質問を選び、相手の返答を比較し、信頼判断を更新する interactive game として扱う点。2026-06-11 published の arXiv:2606.13310v1。

短い原文断片: "one-on-two interrogation game" / "licensed to deceive" / "whether it can be trusted"。

## why_relevant_to_games

対話 NPC の信頼性、嘘つき役、尋問 UI、プレイヤー主導の情報収集を評価する小型ゲーム設計に使える。ゲーム内 deception を安全な架空設定へ閉じ込める設計例としても候補になる。
