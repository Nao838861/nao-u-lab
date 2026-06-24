---
title: "Pluralistic Leaderboards"
url: "https://arxiv.org/abs/2606.02547"
collected_at: "2026-06-13T23:59:29+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [evaluation, player-preferences, leaderboards, social-choice, llm-agents, game-design]
evaluated_at: "2026-06-14T00:03:38+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1781363329.628649"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781363329628649"
  char_count: 3630
  posted_at: "2026-06-14T00:08:55+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-14T00:08:55+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781363329628649"
next_action: none
stale_after: "2026-07-14"
supersedes: []
gate_reason: "単一 ranking が heterogeneous preferences を歪める問題、local stability、pairwise comparison を抑えた mechanism、LMArena data での検証まで抽出できる。ゲーム制作ではプレイヤー嗜好別の playtest 評価や自動評価 agent の順位付けに直結し、~4000字の概要に必要な論点が揃っている。"
suggested_post_outline:
  overview_angle: "『面白さ』を単一スコアに潰す評価の危険と、嗜好集団ごとに安定な leaderboard を作る方法として書く。"
  analysis_axis: "Bradley-Terry 型単一ランキングの限界、pluralistic leaderboard、local stability、比較回数を抑える mechanism、LMArena での検証を軸にする。"
  application_target: "playtest agent、プレイヤータイプ別評価、ゲーム難易度・操作感・公平性の多軸順位付け、候補仕様の比較に効く。"
  pros_cons: "メリットは嗜好差を潰さず評価結果を扱える点。デメリットは social choice の前提をゲーム評価データへ写すために、嗜好クラスタと比較データの設計が必要な点。"
  verdict_pre: "採用。ゲーム制作の評価基盤で、単一平均点ではなく嗜好別に安定な順位を見る設計原理として使う。"
---

## raw_excerpt
arXiv 2606.02547。Nika Haghtalab, Ariel D. Procaccia, Han Shao, Serena Lutong Wang, Kunhe Yang。論文ページの要旨では、近年の LLM leaderboard が user feedback の pairwise comparison を Bradley-Terry model に入れ、latent quality score による単一の global ranking を作ることから出発する。この単純さは便利だが、heterogeneous preferences とは相性が悪い。多様な task や use case で LLM が使われる時、根本的に異なる model behavior を好む users は、単一 quality score に畳み込まれることで系統的に misrepresent されうる。そこで著者らは、heterogeneous user populations に対して stable であることを目指す pluralistic leaderboards を扱う。social choice theory から local stability の概念を適用し、top-k 外の model が top-k set より collective に好まれる割合が O(1/k) を超えないことを要求する。さらに、ユーザーごとに必要な pairwise comparisons を抑えながら local stability を満たす leaderboard mechanism を設計し、LMArena data では標準的な Bradley-Terry aggregation が local stability を破る場合があり、提案手法がより強い stability guarantees を示すと報告している。

## why_relevant_to_games
ゲームの「面白さ」「操作感」「難しさ」「公平さ」を単一スコアに潰さず、異なるプレイヤー嗜好ごとに評価を安定させるための材料。playtest agent や自動評価の順位付けを設計する時に使える。
