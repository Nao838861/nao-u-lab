---
title: "RESP: Reference-guided Sequential Prompting for Visual Glitch Detection in Video Games"
url: "https://arxiv.org/abs/2604.11082"
collected_at: "2026-06-12T11:29:45+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-qa, visual-testing, vlm, automated-playtesting]
evaluated_at: "2026-06-12T11:33:36+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781231955.770849"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781231955770849"
  char_count: 4468
  posted_at: "2026-06-12T11:42:41+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-12T11:42:41+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781231955770849"
next_action: none
stale_after: "2026-07-12"
supersedes: []
gate_reason: |-
  問題設定はゲーム動画の visual glitch 検出、着想は同一動画内の reference frame による比較で、単発フレーム判定の弱さを避ける軸が明確。
  RefGlitch dataset と frame-level prediction から video-level triage へ集約する流れがあり、録画プレイテストの QA に直接適用できる。
  4000字程度の概要では、reference-guided prompting を「前後状態との差分検査」として整理できる。
suggested_post_outline:
  overview_angle: "単発スクリーンショット異常検知ではなく、同一動画内の正常参照フレームと比較して visual glitch を判定する QA 手法として書く。"
  analysis_axis: "reference frame 選択、frame-level のノイズ、video-level triage への集約、RefGlitch のラベル設計を軸に分析する。"
  application_target: "自作ゲームの recorded playtest / headless playthrough から異常候補を抽出し、人間確認へ回す QA パイプライン。"
  pros_cons: "メリットは状態差分に強く既存録画へ載せやすい点。デメリットは参照フレーム選択と VLM 判定の安定性がボトルネックになる点。"
  verdict_pre: "部分採用。まずは録画から reference/test frame pair を切り出す小規模 probe に使う。"
---

## raw_excerpt

著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。

arXiv:2604.11082。Yakun Yu ほか。2026-04-13 submitted。対象は video game の visual glitch detection。問題設定は、現代ゲームの QA 表面が大きくなり、手動確認だけでは scale しにくいこと、既存の VLM 利用が単一フレーム分類や限定的な video-level baseline に寄り、現実の scene variation で安定しにくいこと。RESP は各 test frame に対して同じ動画内の過去フレームを reference frame として選び、孤立した分類ではなく within-video comparison として VLM に見せる。frame-level prediction は noisy なので、逐次 prompt の結果を集約して video-level triage へ移す。RefGlitch という合成 dataset も導入し、5 種類の glitch type と manually labeled reference/test frame pair を持つ。短い原文メモ: "reference-guided prompting", "within-video comparison", "stable video-level decision"。

## why_relevant_to_games

自作ゲームの QA や headless/recorded playtest を、単一スクリーンショットの異常検知ではなく「直前状態との差分を見る」検査に変換する素材になる。
