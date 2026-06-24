---
title: "D2E: Scaling Vision-Action Pretraining on Desktop Data for Transfer to Embodied AI"
url: https://arxiv.org/abs/2510.05684
collected_at: 2026-06-22T08:59:46+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, embodied-ai, gameplay-data, agent-evaluation, interaction-modeling]
evaluated_at: 2026-06-22T09:18:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1782086802.782119"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782086802782119"
  char_count: 4449
  posted_at: "2026-06-22T09:07:00+09:00"
status: posted
candidate_status: posted
last_reviewed_at: 2026-06-22T09:07:00+09:00
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782086802782119"
next_action: none
stale_after: "2026-07-22"
supersedes: []
gate_reason: |
  Desktop/gameplay interaction を embodied AI pretraining に使う問題設定、OWA Toolkit / Generalist-IDM / CAPT の構成、1.3K+ hours と転移評価の数値があり、概要の重要要素を抽出できる。
  Nao_u_BOT の headless playtest / GUI 操作ログを将来のモデル訓練・評価資産として保存する設計に直結し、ゲーム制作への適用が具体的。
suggested_post_outline:
  overview_angle: "desktop と gameplay を低コストな sensorimotor corpus として扱い、物理環境データ不足を補う研究として整理する。"
  analysis_axis: "データ収集圧縮、逆動力学ラベル推定、desktop 表現から embodied manipulation/navigation への転移という三段構成で読む。"
  application_target: "Nao_u_BOT のプレイログ、GUI playtest trace、入力イベントと画面状態の保存粒度を、将来の学習資産として設計する判断に使う。"
  pros_cons: "メリットは既存プレイログを訓練資産化できる視点、デメリットは論文主眼が embodied AI でゲーム制作への効き目はログ設計寄りに限られる点。"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv abstract によると、D2E は physical trajectory collection の高コストに対して、desktop environments、特に gaming を sensorimotor interactions の大規模な供給源として使う研究。著者らは、ゲームを含む desktop interaction が observation-action coupling を持ち、embodied learning の事前学習基盤になり得ると位置付けている。

構成は 3 部分。OWA Toolkit は多様な desktop interaction を標準形式にそろえ、152x compression を行う。Generalist-IDM は unseen games への zero-shot generalization と timestamp-based event prediction により、internet-scale pseudo-labeling を可能にする。VAPT は desktop-pretrained representations を physical manipulation と navigation に転移する。要旨では 1.3K+ hours のデータ、うち 259 hours の human demonstrations と 1K+ hours の pseudo-labeled gameplay を使い、1B parameter model が LIBERO manipulation で 96.6%、CANVAS navigation で 83.3% success を達成したとされる。

短い原文句: "Desktop environments -- particularly gaming" / "sensorimotor interactions at scale" / "observation-action coupling"。

## why_relevant_to_games

ゲームプレイログを「ゲーム内 AI 評価」だけでなく、入力・画面・行動の汎用 sensorimotor corpus として扱う視点がある。Nao_u_BOT の headless playtest や GUI 操作ログを、将来の操作モデル・プレイテスター改善の訓練データとして保存する設計に効く。
