---
title: "Shared Control for Game Accessibility: Understanding Current Human Cooperation Practices to Inform the Design of Partial Automation Solutions"
url: "https://arxiv.org/abs/2509.02132"
collected_at: "2026-06-17T23:45:26+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-accessibility, shared-control, partial-automation, human-ai-collaboration, assistive-play]
evaluated_at: "2026-06-17T23:47:54+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781707908.582599"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781707908582599"
  char_count: 3837
  posted_at: "2026-06-17T23:51:48+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-17T23:51:48+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781707908582599"
next_action: none
stale_after: "2026-07-17"
supersedes: []
gate_reason: >-
  問題設定、14名インタビュー、human assistant から software agent への部分自動化、automation confusion や sociality loss などの設計リスクが candidate 内に揃っている。
  ゲーム制作では AI 支援を自動攻略ではなく shared-control copilot として分解する判断軸に直結する。
suggested_post_outline:
  overview_angle: "障害のあるプレイヤーの共同操作実践から、AI partial automation の設計要件と失敗条件を引き出す研究として書く。"
  analysis_axis: "accessibility barrier を human shared control がどう補い、software agent 化で autonomy / confusion / sociality がどう揺れるかを中心に分析する。"
  application_target: "Nao_u_BOT の操作補助、ヒント、失敗回避、AI copilot を、代行範囲・情報提示・介入タイミング・共同感の4軸で設計する場面。"
  pros_cons: "メリットは支援粒度と倫理リスクを同時に扱える点。デメリットは人間同士の共同プレイ文脈からAI実装へ移す時に、社会性や責任分界の再設計が必要な点。"
  verdict_pre: "部分採用。自動化そのものより、copilot 支援の設計チェックリストとして採用する。"
---

## raw_excerpt
arXiv / ACM CHI 2026 の論文。Dragan Ahmetovic, Matteo Manzoni, Filippo Corti, Sergio Mascetti による shared control 研究で、障害のあるプレイヤーが入力しづらい操作を他者へ委ね、1 つのゲームキャラクターを共同で操作する実践を扱う。arXiv 要旨では、14 名の accessible gaming / shared control 経験者への interview を通じて、shared control technologies がどのように使われ、どんな accessibility challenges を解くか、また human assistant の支援を software agents でどこまで自動化できるかを調べると説明されている。

検索結果と本文断片では、shared control は inaccessible games への access を可能にする一方、人間の支援に依存することが制約になるとされる。参加者は software agent による部分自動化を歓迎しつつ、automation confusion、sociality / inclusion の喪失、支援の粒度、on-demand information、fine control、fast-paced control sequences などの設計要件を挙げている。

## why_relevant_to_games
ゲーム内 AI 支援を「プレイヤーを置き換える自動攻略」ではなく、pilot / copilot の共同制御として設計する入口になる。操作補助、情報提示、失敗回避、社会性の維持を分ける観点が使える。
