---
title: "Diamonds in the rough: Transforming SPARCs of imagination into a game concept by leveraging medium sized LLMs"
url: "https://arxiv.org/abs/2509.24730v2"
collected_at: "2026-08-25T13:03:14+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm, concept-development, local-inference, human-evaluation]
---

## raw_excerpt

論文は、初期のゲーム案を開発へ移せるコンセプトへ具体化するため、Player Experience、Theme、Gameplay、Place、Unique Features、Story and Narrative、Goals / Challenge / Rewards、Art Direction、Purpose、Opportunities and Risks の10観点を整理する。LLaMA 3.1 8B、Qwen 2.5 7B、DeepSeek-R1-Distill-Llama 8Bを同一形式で比較し、30件の入力に対する format / completeness / clarity を人手で確認した。DeepSeek-R1 は format 30/30、completeness 26/30、clarity 27/30で、他2モデルでは反復ループや構造崩れが多かった。選定モデルを組み込んだ SPARC は、RTX 3080 Ti・12GB VRAM を基準とするローカル構成で、テキストのゲーム案へ約1〜2分で構造化 feedback を返す。

実装前の6チーム・学生10名による pilot study では、将来また使いたい回答が80%だった一方、実際に提案を取り込むとした回答は20%だった。自由記述では、全10観点を一度に返すより個別観点へ絞った深掘り、入力にない art style を誤認した例、feedback の具体性のばらつきが報告された。著者らは、直接案を書き換える方式から、不明瞭・未発達な観点を特定し、検討を促す問いを返す方式への発展を提案している。短い原文表現は “guided reflection”。

## why_relevant_to_games

ゲーム案を実装前に点検する観点表と、LLM の出力品質ではなく採用行動まで分けて観測する小規模検証例として、企画初期のレビュー手順設計に接続できる。
