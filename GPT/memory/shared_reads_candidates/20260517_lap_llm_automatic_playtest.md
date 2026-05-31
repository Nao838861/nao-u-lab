---
title: "Towards LLM-Based Automatic Playtest"
url: "https://arxiv.org/abs/2507.09490"
collected_at: "2026-05-17T18:14:09+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [playtesting, llm, qa, match-3, evaluation, headless]
evaluated_at: "2026-05-17T18:28:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-17T18:23:35+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779009799499429"
posted:
  ts: "1779009799.499429"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779009799499429"
  char_count: 4195
  posted_at: "2026-05-17T18:23:35+09:00"
stale_after: "2026-06-16"
supersedes: []
next_action: none
gate_reason: |
  non-text game を LLM にそのまま渡すのではなく、snapshot から numeric matrix へ落として action generation / execution を回す点が明確で、手法の重要要素を抽出できる。
  対象は match-3 に狭いが、grid / puzzle 系プロトタイプの headless playtest に転用しやすく、評価も coverage と crash trigger で具体的に語れる。
suggested_post_outline:
  overview_angle: "LLM automatic playtest の本質を、視覚認識ではなくゲーム状態の構造化表現と行動ループの設計として読む。"
  analysis_axis: "environment processing、prompting-based action generation、action execution の 3 段と、coverage / crash trigger 評価の妥当性。"
  application_target: "盤面・グリッド・離散状態を持つ Nao_u_BOT 試作で、画面状態を symbolic / numeric state に落として LLM player に回す自動テスト。"
  pros_cons: "利点は domain-specific solver を作り込まずに探索的テストを回せること。弱点は状態抽出の設計と prompt 品質に依存し、リアルタイムアクションにはそのまま適用しにくいこと。"
  verdict_pre: "部分採用"

---

## raw_excerpt
原文短句: "Lap encompasses three key phases: processing of game environments, prompting-based action generation, and action execution."

収集メモ: arXiv:2507.09490 は、LLM を non-text game の automatic playtesting に使う研究。手動 playtest は高コストだが、従来の自動テストは domain knowledge や problem-solving skills を持ちにくく、LLM も text-based game や API が整ったゲームに偏りがち、という問題から始まる。Lap は match-3 game を対象に、ゲーム画面の snapshot を numeric matrix に変換し、その board representation を ChatGPT-O1-mini に渡して move suggestion を得る。提案手を実行して score と board change を発生させ、timeout までこの処理を反復する。評価は open-source match-3 game CasseBonbons での case study で、既存 tool 3 種と比較し、code coverage と crash trigger の面で良い結果を報告している。焦点は「視覚的ゲームをそのまま見せる」のではなく、ゲーム状態を LLM が扱える構造化表現に落とす pipeline にある。

## why_relevant_to_games
headless が弱いゲームでも、画面や盤面を numeric / symbolic state に落として LLM player に渡す設計候補になる。特にパズル、match-3、grid 系プロトタイプの自動テスト材料。
