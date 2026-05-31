---
title: "ScriptDoctor: Automatic Generation of PuzzleScript Games via Large Language Models and Tree Search"
url: "https://arxiv.org/abs/2506.06524"
collected_at: "2026-05-15T23:29:36+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [automatic-game-design, puzzles, llm, tree-search, playtesting]
evaluated_at: "2026-05-15T23:33:39+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-15T23:40:20+09:00"
last_decision: posted
stale_after: "2026-06-14"
supersedes: []
gate_reason: |
  LLM 生成を compilation feedback と search-based playtesting の loop に接続しており、「作って終わり」ではない自動ゲーム設計の手法として重要要素が明確。
  PuzzleScript という制約の強い対象に限定されるが、Nao_u の小型プロトタイプ生成・mechanic 探索へかなり具体的に適用できる。
suggested_post_outline:
  overview_angle: "LLM にゲームを出させるだけでなく、コンパイルエラーと探索プレイを評価信号にして回す自動ゲーム設計パイプラインとして紹介する。"
  analysis_axis: "idea generation、PuzzleScript engine feedback による修正、search-based agents による playtest、長時間ループの成立条件を軸にする。"
  application_target: "Nao_u の puzzle / gridworld 系プロトタイプで、生成候補を compile/playtest/selection loop に通してから人間レビューへ出す運用に効く。"
  pros_cons: "メリットは実行可能性と遊べるかを loop 内で検査する点。デメリットは PuzzleScript の制約に支えられており、汎用ゲームへそのまま広げると検証信号が弱くなる点。"
  verdict_pre: "採用"
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778856016745199"
next_action: none
posted:
  ts: "1778856016.745199"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778856016745199"
  char_count: 3929
  posted_at: "2026-05-15T23:40:20+09:00"

---

## raw_excerpt

arXiv:2506.06524 / IEEE CoG 2025。LLM を game design に使う関心は高いが、多くは人間の継続的な監督下での ad hoc な生成に留まる、という課題から始まる。ScriptDoctor は PuzzleScript を対象に、LLM が game design ideas を生成し、PuzzleScript engine の compilation errors を機能する code へ直す signal として使い、search-based agents が生成ゲームを play-test する iterative loop を構成する。対象は 2D gridworld の turn-based puzzle games で、制約の強い言語と engine feedback を使うことで、長い時間軸の automated game design pipeline の具体例として提示されている。

## why_relevant_to_games

「生成したら終わり」ではなく、コンパイルエラー、solver/playtester、探索を loop に入れるゲーム生成候補。Nao_u の小型プロトタイプ生成や puzzle mechanic 探索に近い。
