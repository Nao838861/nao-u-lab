---
title: "Multimodal vs. Unimodal Physiological Control in Videogames for Enhanced Realism and Depth"
url: https://arxiv.org/abs/1406.0532
collected_at: 2026-05-16T03:29:17+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [hci, biofeedback, game-feel, input-design, player-experience]
evaluated_at: 2026-05-16T03:31:58+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-16T03:40:29+09:00"
last_decision: posted
stale_after: "2026-06-15"
supersedes: []
gate_reason: >-
  unimodal biofeedback から multimodal physiological control へ進める問題設定、vanilla/unimodal/multimodal の比較、
  fun・playability・GEQ・自由記述などの評価が揃っている。センサー前提を外しても、複数入力を「深さ」と「負荷」の両面で見る評価軸としてゲーム制作に転用できる。
suggested_post_outline:
  overview_angle: "biofeedback 論文としてではなく、複数入力が game feel に深さを足す時と、操作負荷で体験を壊す時の評価枠として読む。"
  analysis_axis: "vanilla / unimodal / multimodal 条件、2 physiological sensors と mechanics の対応、fun・ease of use・originality・playability・GEQ・自由記述の評価。"
  application_target: "ブラウザゲームやプロトタイプでの同時入力、長押し、移動量、視線/カーソル滞留などを深さとして扱う時の評価項目設計。"
  pros_cons: "メリットは入力の複雑化を realism/depth と負荷/安全性の両面で検査できる点。デメリットは古い研究でサンプルやデバイス前提が限定的な点、現行制作では生体センサー部分を抽象化して読む必要がある点。"
  verdict_pre: "部分採用"
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778870430127129"
next_action: none
posted:
  ts: "1778870430.127129"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778870430127129"
  char_count: 3970
  posted_at: "2026-05-16T03:40:29+09:00"

---

## raw_excerpt
arXiv:1406.0532。Goncalo Amaral da Silva。2014-06-02 submitted。ゲームの映像表現は大きく進化した一方、入力デバイスの進化は相対的に遅く、HCI では physiological data を入力にする biofeedback interaction が検討されてきた、という導入。従来の biofeedback prototype は 1 sensor を 1 game mechanic に割り当てる unimodality が多かった。

本研究は、1 mechanic に 2 physiological sensors を同時に組み合わせる multimodality を導入し、8 game mechanics を持つ FPS を vanilla / unimodal / multimodal の3条件で比較した。32 regular players の empirical study で、Fun、Ease of Use、Originality、Playability、Favourite Condition、IMI Questionnaire、keywords association、open-ended commentaries などを使って評価している。

結果として vanilla は使いやすさ、biofeedback 版は楽しさで評価され、unimodal は simplicity、multimodal は realism、activation safety、depth added to the game の面で異なる評価を得た。結論では、multimodal biofeedback は使い方次第で added depth を持ち、能力使用時の empowerment を高める場合も、意図的に physical effort を要求して行動を難しくする場合もある、とされる。

## why_relevant_to_games
入力難度・身体負荷・ゲーム内能力発動を結びつける古典寄りの HCI 事例。現在の制作ではセンサーがなくても、複数キー同時入力、長押し、マウス移動量などを「深さ」として扱う設計・評価項目の参考になる。
