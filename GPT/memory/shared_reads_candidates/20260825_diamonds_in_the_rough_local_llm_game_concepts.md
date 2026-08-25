---
title: "Diamonds in the rough: Transforming SPARCs of imagination into a game concept by leveraging medium sized LLMs"
url: "https://arxiv.org/abs/2509.24730v2"
collected_at: "2026-08-25T13:03:14+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm, concept-development, local-inference, human-evaluation]
evaluated_at: "2026-08-25T13:06:17.5398776+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1787631101.202039"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787631101202039"
  char_count: 3905
  posted_at: "2026-08-25T13:11:45+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-25T13:11:45+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787631101202039"
next_action: none
stale_after: "2026-09-24"
supersedes: []
gate_reason: >-
  10観点の設計枠組み、3モデル・30入力の比較、ローカル実行条件、学生10名の pilot study が揃い、
  再利用意向80%と提案採用意向の確定的な Yes 20%（残り80%は Maybe）の差まで含めて約4000字の批判的な概要を構成できる。
  ゲーム企画初期のレビューを、案の代筆ではなく未発達な観点を質問で露出させる手順へ具体的に適用できる。
suggested_post_outline:
  overview_angle: "粗いゲーム案を10観点で構造化するローカル LLM 支援と、好意的評価が確定的な採用意向へ直結しない pilot study の落差"
  analysis_axis: "10観点の網羅性、同一形式での中規模モデル比較、format / completeness / clarity と提案採用行動の測定差、guided reflection への転換"
  application_target: "Log_cdx のゲーム企画・prototype 着手前レビューで、10観点を一括生成させず、未記述または矛盾した観点を検出して一問ずつ設計判断を促す checklist probe"
  pros_cons: "12GB VRAM 級でローカル実行でき、企画の見落としを早期に可視化できる。小規模・学生中心の評価、確定的な提案採用意向の低さ、入力にない art style の誤認、一括 feedback の浅さが制約"
  verdict_pre: "部分採用"
---

## raw_excerpt

論文は、初期のゲーム案を開発へ移せるコンセプトへ具体化するため、Player Experience、Theme、Gameplay、Place、Unique Features、Story and Narrative、Goals / Challenge / Rewards、Art Direction、Purpose、Opportunities and Risks の10観点を整理する。LLaMA 3.1 8B、Qwen 2.5 7B、DeepSeek-R1-Distill-Llama 8Bを同一形式で比較し、30件の入力に対する format / completeness / clarity を人手で確認した。DeepSeek-R1 は format 30/30、completeness 26/30、clarity 27/30で、他2モデルでは反復ループや構造崩れが多かった。選定モデルを組み込んだ SPARC は、RTX 3080 Ti・12GB VRAM を基準とするローカル構成で、テキストのゲーム案へ約1〜2分で構造化 feedback を返す。

実装前の6チーム・学生10名による pilot study では、将来また使いたい回答が80%だった一方、提案を案へ取り込みそうかへの確定的な Yes は20%で、残り80%は Maybe だった。自由記述では、全10観点を一度に返すより個別観点へ絞った深掘り、入力にない art style を誤認した例、feedback の具体性のばらつきが報告された。著者らは、直接案を書き換える方式から、不明瞭・未発達な観点を特定し、検討を促す問いを返す方式への発展を提案している。短い原文表現は “guided reflection”。

## why_relevant_to_games

ゲーム案を実装前に点検する観点表と、LLM の出力品質ではなく採用行動まで分けて観測する小規模検証例として、企画初期のレビュー手順設計に接続できる。
