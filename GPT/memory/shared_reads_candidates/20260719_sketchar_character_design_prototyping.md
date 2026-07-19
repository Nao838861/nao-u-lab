---
title: "Sketchar: Supporting Character Design and Illustration Prototyping Using Generative AI"
url: "https://arxiv.org/abs/2508.12333"
collected_at: "2026-07-19T14:46:15+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, character-design, generative-ai, prototyping, collaboration]
evaluated_at: "2026-07-19T14:50:14+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-19T14:50:14+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-19T14:50:14+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-18"
supersedes: []
gate_reason: >-
  10名の事前調査、文章・構造化キーワード・参照画像を往復する実装、17名の比較実験、CSIの有意差、参加者属性と生成画像の限界まで抽出できる。
  完成絵の自動生成ではなく、ゲームデザイナーとイラストレーターの初期共有物を作る手法として具体的で、少人数制作のキャラクター仕様・フィードバック手順へ直接適用できる。
suggested_post_outline:
  overview_angle: "Sketchar を完成画像の自動生成器ではなく、曖昧な人物像を文章・キーワード・参照画像の往復可能な設計資料へ変換する協働プロトタイピング手法として整理する。"
  analysis_axis: "10名の形成的調査から導いた課題、段階的な生成・人手修正、17名の比較実験と Creativity Support Index、実協働ではない評価条件と著作権・stereotype の限界を分けて読む。"
  application_target: "少人数ゲーム制作で、役割・背景・性格・関係を構造化し、ラフ画像を完成素材ではなくキャラクター仕様の検証物として使う企画―美術間の handoff に適用する。"
  pros_cons: "メリットは言語化しにくい意図を早期に可視化し、非美術職も修正点を共有しやすいこと。デメリットは画像品質と文化的偏り、権利確認、単独作業による協働評価の外的妥当性に制約があること。"
  verdict_pre: "部分採用。設定の構造化と低忠実度の参照画像生成は採用し、完成アート判断と権利確認は人間の工程として分離する。"
---

## raw_excerpt

ゲームのキャラクター設計では、物語・メカニクス・人物像を考えるデザイナーと、それを視覚化するイラストレーターの間で、言語と造形の専門性の差が反復的な手戻りを生む。事前調査ではゲーム制作経験者10名に、設計手順、意思疎通の難所、GenAIの利用場面をインタビューした。デザイナーは世界観やゲームジャンル、役割、背景を文章化し、人物を表すキーワードを抽出する一方、イラストレーターはキーワードから既存の参照画像を探し、スケッチとフィードバックを反復する。頭の中の像を言葉にできない、望む衣装や造形の参照例が見つからない、といった問題が報告された。

Sketchar は、名前・役割・背景・ゲーム種別などを入力し、LLMが統合説明とキーワードを段階的に生成し、そのキーワードと画風指定を画像生成へ渡す。利用者は人物の外見、性格、背景、関係を編集・再生成し、結果をプロフィールカードとして共有できる。生成人物との模擬会話や人物系統図も、設定を具体化する手掛かりとして備える。React、Flask、GPT-3.5、DALL-E 2 を組み合わせ、人間が各段階で出力を修正する構成である。

ゲーム制作経験を持つ17名の比較実験では、手作業中心の baseline と Sketchar 利用を順序を入れ替えて試し、Creativity Support Index を測定した。Sketchar 条件の総合値は有意に高く、特に collaboration 項目が高かった。美術経験のない参加者は、粗い参照画像でも意図伝達の起点になると捉えた一方、美術経験者は細部と実務品質への要求が高かった。実験上の collaboration は実際の共同編集ではなく、イラストレーターとの協働を想定した単独作業である。本文は、生成画像の姿勢・照明・位置の不正確さ、著作権、学習データ、文化的 stereotype、参加者が中国本土に限られる点も記録している。

## why_relevant_to_games

キャラクター仕様を「文章→構造化キーワード→参照画像→人手修正」の往復可能な試作品にし、企画意図と美術作業の橋渡しを設計する場面に使える。少人数制作で、完成絵ではなく初期の共有物をどう作るかという事例になる。
