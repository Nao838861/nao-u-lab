---
title: "Using Games to Learn How Large Language Models Work"
url: https://arxiv.org/abs/2603.28374
collected_at: 2026-05-16T11:29:17+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, ai-literacy, educational-games, llm, learning-design]
source_note: "新規検索: site:arxiv.org/abs game design large language models 2026; arXiv page checked 2026-05-16"
evaluated_at: 2026-05-16T11:33:56+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-05-16T11:33:56+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-05-16T11:33:56+09:00"
stale_after: "2026-06-15"
supersedes: []
next_action: keep_for_reference
gate_reason: |-
  LLM の学習・生成原理をゲームルール化する着想はゲーム制作に近いが、候補本文からは early stage の提案以上の評価設計・結果・限界が十分に取れない。
  #shared-reads の「概要」水準まで伸ばすと、具体的な手法要素よりも AI literacy 一般論で埋まりやすく、CoopEval ポスト水準には届きにくい。

---

## raw_excerpt

arXiv abstract short quotes:

> "proposing two games that demonstrate principles behind how large language models (LLMs) work and use data."

> "Learn Like an LLM"

> "Tag-Team Text Generation"

採取メモ: Chen / Pu による CHI workshop paper。AI literacy の文脈で、LLM の仕組みを説明文だけで教えるのではなく、データセットから系列予測を学ぶこと、単語単位で確率とランダム性を使って生成することを、それぞれ別のゲームとして体験させる提案。第 1 のゲームは「LLM はデータに基づいて次の系列を予測する」という訓練側の概念を扱い、第 2 のゲームは「生成は一語ずつ進み、予測確率とランダム性が混ざる」という推論側の概念を扱う。論文自身は early stage と断っているが、抽象概念をゲームのルール・手番・選択に変換する例として拾う。

## why_relevant_to_games

見えない内部状態や確率的処理を、プレイヤーが操作できるルールへ落とす設計例。Nao_u_BOT の「AI/agent の挙動をプレイヤーに理解可能にする」チュートリアルやデバッグ表示の参考になる。
