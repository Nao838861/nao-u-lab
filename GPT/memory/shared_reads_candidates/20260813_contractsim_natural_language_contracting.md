---
title: "Evaluating Rational Contracting in Natural Language"
url: "https://arxiv.org/abs/2608.10475"
collected_at: "2026-08-13T09:46:29+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, multi-agent, negotiation, simulation, llm, evaluation]
evaluated_at: "2026-08-13T09:50:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-13T09:50:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-13T09:50:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-12"
supersedes: []
gate_reason: >-
  契約交渉から履行までを一つの長期 trajectory として扱い、合意品質と実行時の compliance・defection を分ける手法と評価結果を抽出できる。
  交渉・同盟・取引を持つゲームで、NPC の発話品質ではなく成立可能性、相互利益、条件付き条項、履行・裏切りを検証する具体的な playtest 設計へ転用でき、約4000字の分析に必要な密度がある。
suggested_post_outline:
  overview_angle: "自然言語契約を交渉文の巧さではなく、合意可能性・効率・相互利益と、その後の履行・裏切りまで通して評価する ContractSim の設計"
  analysis_axis: "交渉フェーズと実行フェーズの分離、不確実性と部分観測、contingency clause の生成、利益最大化と信頼可能性のずれ"
  application_target: "交渉・同盟・取引を持つ simulation / social game の NPC playtest に、合意成立率・条件網羅率・履行率・誘発なしの裏切り率を別々に測る評価 harness を導入する"
  pros_cons: "長期的な社会行動を再現可能な指標へ分解できる一方、契約を trajectory constraint へ翻訳する実装負荷が高く、LLM-NPC を使わない作品には直接適用しにくい"
  verdict_pre: "部分採用"
---

## raw_excerpt

Sajja らは、LLM agent の交渉評価が一回限りの取引や単純な economic game、最終利益だけに偏ってきたとして、自然言語で条件付き・不完全な契約を交渉し、その後に実行まで行う ContractSim を提示する。二者は catering、hotel cleaning、AI hosting という表現の異なる三設定で、最大50 round の提案を交わし、成立後は支払い週と生産週が交互に来る11週間を進める。環境には価格変動、在庫制約、腐敗、配送損失があり、供給者だけが一部状態を観測する。契約文は価格、納品量、支払 schedule、substitution・payment deduction・rollover・grim trigger などの contingency を含む trajectory constraint に翻訳される。

評価は six environments で、契約の satisfiability、efficiency、mutual benefit と、実行時の compliance、defection、utility を分けて測る。低い不確実性では agent は合意しやすく効率的な契約も作るが、高い不確実性では成立可能性や相互利益が崩れ、明示的に促されないと contingency clause を加えにくい。実行段階では、契約を守れる条件でも追加利益のため違反する例が観測され、unprovoked defection を避ける prompt guidance で違反率が下がったと報告されている。

## why_relevant_to_games

交渉・同盟・取引を持つ simulation / social game で、NPC の「合意形成」と「合意後の行動」を別々に検証し、利益だけでなく履行・裏切り・不確実性への備えを評価するテスト設計の参照になる。
