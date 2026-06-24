---
title: "Teaching AI agents to ask better questions by playing \"Battleship\""
url: "https://news.mit.edu/2026/teaching-ai-agents-ask-better-questions-playing-battleship-0603"
collected_at: "2026-06-20T03:05:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, question-asking, playtesting, board-game]
evaluated_at: "2026-06-20T03:20:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781891504.772559"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781891504772559"
  char_count: 3910
  posted_at: "2026-06-20T03:31:44+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-20T03:31:44+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781891504772559"
next_action: none
stale_after: "2026-07-20"
supersedes: []
gate_reason: |-
  問題設定、手法の中核、評価結果、制限が揃っており、CoopEval 水準の概要に展開できる。
  ゲーム制作への適用先も「LLM agent/playtester が未知状態を狭める質問を設計できるか」という具体的な評価軸に落とせる。
suggested_post_outline:
  overview_angle: "Battleship を質問生成・不完全情報探索の test bed に変換し、agent の弱点を「答える力」ではなく「聞く力」として評価する軸で書く。"
  analysis_axis: "Monte Carlo inference による captain 側の情報獲得質問、spotter 側の自然言語質問から Python 検査への変換、人間ログ由来 dataset と小型モデル改善幅を整理する。"
  application_target: "推理ゲーム、索敵、対話型チュートリアル、LLM playtester の観測行動設計に適用し、正解率だけでなく情報獲得行動を検査する probe に接続する。"
  pros_cons: "メリットは小型モデルでも探索の質を上げられる点。デメリットは Battleship が単純な環境で、複雑な状態空間や相手適応へはそのまま広げにくい点。"
  verdict_pre: "採用"
---

## raw_excerpt

MIT CSAIL / Harvard SEAS の研究紹介。古典的な Battleship を、船の位置を当てるだけでなく、自然言語の質問を投げる captain と yes/no で答える spotter の協力ゲームに作り替えている。40 人超の人間プレイログから BattleshipQA dataset を作り、GPT-5 や Llama 4 Scout などのモデルを比較したというメモ。

記事の中核は「AI agent は答えるより、よい質問を作るのが苦手」という問題設定。Monte Carlo inference strategy を captain 側に与え、隠れた船配置の候補を粒子のように重みづけしながら、次に情報量の高い質問を選ばせる。小型モデル Llama 4 Scout は、人間に勝つ割合が 8% から 82% に伸び、コストは GPT-5 の約 1% と説明されている。

spotter 側では、自然言語質問を Python の検査コマンドへ変換してから答えさせることで回答精度を上げる。記事は GPT-4o-mini で約 30% の改善、Claude 4 Opus で約 8 ポイント改善と紹介している。さらに Guess Who? でも同じ発想を試し、候補を絞る質問生成が有効だったとする。

重要な制限として、Battleship は比較的単純な test bed であり、より広い選択肢を持つ複雑環境への拡張は今後課題とされている。最後に、専門家コメントとして、単なる最適質問の計算だけでなく、共通基盤、誤解解消、相手への適応といった pragmatic reasoning が agent のボトルネックだと位置づけられている。

## why_relevant_to_games

ゲームAI評価を「正解行動を出せるか」だけでなく、「未知状態を狭める質問・探索を設計できるか」として扱う候補。推理、索敵、対話型チュートリアル、LLM playtester の観測行動設計に使えそう。
