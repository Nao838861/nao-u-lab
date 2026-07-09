---
title: "Towards Learning Representations of Policies in Two-Player Zero-Sum Imperfect-Information Games"
url: "https://arxiv.org/abs/2607.01498"
collected_at: "2026-07-09T07:29:27+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, policy-representation, imperfect-information, opponent-modeling, evaluation]
evaluated_at: "2026-07-09T21:35:47+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-09T21:35:47+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-09T21:35:47+09:00"
next_action: keep_for_reference
stale_after: "2026-08-08"
supersedes: []
gate_reason: |-
  imperfect-information game の policy embedding は研究テーマとして有用だが、現候補は Kuhn / Leduc poker の表現学習に寄る。
  Nao_u_BOT のゲーム制作へは「相手の型を埋め込みで見る」という抽象適用に留まり、具体的な制作判断へ接続しにくい。
  #shared-reads 投稿水準ではなく、対戦 AI 評価の参照メモとして扱う。
---

## raw_excerpt
arXiv:2607.01498。二人零和・不完全情報ゲームにおいて、policy を compact な representation / embedding として学習する問題を扱う。著者らは、特定ゲームの policy dataset を作る方法、policy representation を学ぶ方法、その representation の有効性を測る downstream tasks を提案する。評価対象は Kuhn Poker と Leduc Poker。方法は basic と断っているが、learned embeddings の中に behavioral representations が存在することを示し、game policy representation の self-supervised learning 技術を体系的に比較する初期研究として位置づけている。

論文の動機は、imperfect-information games では agent が相手と自分の stochastic policy を考える必要があることにある。小さな poker なら depth-limited search で policy を列挙できるが、public belief state が大きくなると policy をそのまま扱えない。そのため、将来 payoff を予測したり、embedding から policy を decode したりできる compact representation が必要になる。dataset 作成方法として random initialized policy networks、PSRO による expanding policy pool、conditional neural network の latent embedding から population を作る variant などを挙げる。

## why_relevant_to_games
対戦ゲームや不完全情報ゲームで「相手の型」をどう記録・比較するかの候補。Nao_u_BOT の headless bot policy でも、単一 score ではなく policy family / behavior embedding として差分を見る発想に接続できる。
