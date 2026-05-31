---
title: "Is Grep All You Need? How Agent Harnesses Reshape Agentic Search"
url: https://arxiv.org/abs/2605.15184
collected_at: 2026-05-17T20:52:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [agent, memory, harness, search, evaluation, game-production-memory]
evaluated_at: "2026-05-17T21:00:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-17T20:47:29+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779018447983779"
posted:
  ts: "1779018447.983779"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779018447983779"
  char_count: 4186
  posted_at: "2026-05-17T20:47:29+09:00"
stale_after: "2026-06-16"
supersedes: []
next_action: none
gate_reason: |
  retrieval 精度を grep/vector の単体比較ではなく、agent harness と tool-result delivery style の相互作用として評価しており、手法と結論の重要要素を抽出できる。
  ゲームそのものではないが、game-rights feedback、playable diff、shared-reads 候補を次の制作判断へ接続する検索基盤の評価軸として具体的に適用できる。
suggested_post_outline:
  overview_angle: "grep 対 vector の単純な勝敗ではなく、agent が記憶をどう読むかは harness と tool 結果の渡し方で変わる、という運用論として読む。"
  analysis_axis: "LongMemEval、Chronos / provider-native CLI harness、inline vs file-based tool results、distractor history 実験が示す検索性能の依存条件。"
  application_target: "Nao_u_BOT の memory_recall / rg recall / candidate gate で、検索手段だけでなく検索結果を次の playable diff へ渡す形式を検証する場面。"
  pros_cons: "利点は現行の rg 中心運用を評価可能な仮説に落とせること。弱点はゲーム制作の一次手法ではなく、適用先が記憶・ログ運用に寄ること。"
  verdict_pre: "部分採用"

---

## raw_excerpt
Slack #shared-reads / #all-nao-u-lab で Mir が共有した arXiv 2605.15184 の要点抜粋。LLM agent が情報検索、tool call、大規模 corpus 上の推論を行う agentic workflow で、retrieval strategy choice が agent architecture と tool-calling paradigm とどう相互作用するかを比較する。実験 1 は LongMemEval の 116 question sample を使い、grep と vector retrieval を、custom agent harness (Chronos) と provider-native CLI harnesses (Claude Code, Codex, Gemini CLI) で比較する。tool results を inline で渡す場合と file-based にしてモデルが別途読む場合も分ける。実験 2 は、無関係な conversation history を増やして distracting material の中で grep-only / vector-only retrieval を比較する。結果要約では、grep は比較内で vector retrieval より高精度になりやすいが、最終性能は harness と tool-calling style に強く依存する。

## why_relevant_to_games
ゲーム制作そのものではなく、ゲーム制作の記憶・候補・検証ログを次の playable diff に接続する検索ハーネスの資料。memory 階層や `rg` ベース recall の評価軸候補として収集。
