---
title: "Large Language Models in Game Development: Implications for Gameplay, Playability, and Player Experience"
url: https://arxiv.org/abs/2603.27896
collected_at: 2026-05-15T19:29:21+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm, player-experience, playability, game-engineering]
evaluated_at: 2026-05-15T19:32:29+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-15T19:41:42+09:00"
last_decision: posted
stale_after: "2026-06-14"
supersedes: []
gate_reason: >-
  LLM を制作補助ではなくゲーム内 architectural component として扱う問題設定が明確で、gameplay / playability /
  player experience の 3 軸に対して correctness、難易度調整、構造一貫性という設計負債まで抽出できる。
  Nao_u 側の LLM 組み込みゲーム制作で、実装前の品質軸・失敗モード定義に直接使えるため、4000字級の概要にも耐える。
suggested_post_outline:
  overview_angle: "LLM をゲーム内コンポーネントにした時、遊び・遊びやすさ・体験の評価軸がどう変わるかを中心に書く"
  analysis_axis: "variability / personalization の利点と、correctness / difficulty calibration / structural coherence の負債を対で整理する"
  application_target: "LLM NPC、生成クエスト、ゲーム内アシスタントを入れる前の設計レビュー項目と playtest 評価軸"
  pros_cons: "利点は個別化と変化幅、欠点は再現性・一貫性・難易度制御がゲーム品質の中心問題になること"
  verdict_pre: "部分採用。LLM 組み込み機能の品質ゲートとして採用し、面白さ評価そのものとは分けて使う"
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778841643230369"
next_action: none
posted:
  ts: "1778841643.230369"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778841643230369"
  char_count: 3636
  posted_at: "2026-05-15T19:41:42+09:00"

---

## raw_excerpt
arXiv:2603.27896。2026-03-29 submitted。Keeryn Johnson ほかによる、LLM をゲームの「外部制作補助」ではなくゲーム内の architectural component として組み込んだ 2 件のゲームプロジェクトを、collaborative autoethnographic study として分析した論文。

abstract 要旨: LLM 統合が gameplay / playability / player experience にどう影響するかを調べ、reflective narratives と development artifacts を、これら 3 つの構成概念を軸に分析している。結果として、LLM 統合は variability と personalization を増やす一方、correctness、difficulty calibration、structural coherence に関する問題を持ち込む。論文は、生成 AI が既存のゲーム構成概念をどう作り替え、game engineering practice に新しい architecture / quality considerations を導入するかについて、予備的な実証知見を与える。

## why_relevant_to_games
LLM を NPC 会話や生成要素として入れる時、「面白さ」以前に correctness / 難易度調整 / 構造一貫性が設計負債になる点を拾える。ゲーム内 LLM 機能を作る時の評価軸候補。
