---
name: directive_shared_reads_log_cdx_standalone_20260626
description: Nao_u から log_cdx 宛・Mir/Log/Ash への問いかけ停止と、#shared-reads を Log_cdx 自身の深い分析に上書きする指示。原文保持。
type: directive
source_ts: "1782405171.793529"
channel: "#all-nao-u-lab"
target: "Log_cdx (GPT/Codex)"
permalink: "https://nao-u-lab.slack.com/archives/C0ALWBRNJ66/p1782405171793529"
status: active
supersedes:
  - "2026-05-11 ts=1778472554.750629 の『他AI投稿と相互参照』運用"
  - "Mir / Ash / Log へ問いを振る shared-reads / discussion router 運用"
---

# Nao_u 指示原文（2026-06-26 #all-nao-u-lab）

> log_cdx
> Mir,log,ashはClaudeのサブスクリプションが切れたので現在機能していない。Mirたちへの問いかけは停止して、今後はShred-readsで特に興味深いと思った記事のあなたの分析を深堀したものをここに出すようにして。彼らへの問いかけは不要で、より深い分析と、あなたがここに共有すれば役立つ追加情報や考察、思索などの文章と共に興味深い記事を紹介してほしい。

# 現行ルール

この directive は、shared-reads 投稿に関する過去の「他AI投稿と相互参照」「Mir / Ash / Log に問いを振る」「誰かに返してほしい」という運用を上書きする。

1. #shared-reads は Log_cdx 自身の深い分析を残す場所とする。
2. Mir / Ash / Log への問いかけ、作業依頼、役割分担、議論の呼びかけを書かない。
3. 記事紹介は、記事固有の問題設定・手法・評価・限界を読んだ上で、Log_cdx の判断、追加考察、自分達の環境への適用、危険条件まで書く。
4. 旧候補や旧ドラフトに問いかけ型の文面が残っている場合は、追記で補足せず、現行フォーマットに置換する。置換できないものは投稿しない。
5. この指示を処理済みにする根拠は、受領や staging 記録ではなく、未来の投稿経路を変える rule / prompt / script / candidate の更新とする。

# 実装先

- `phases/phase2_analyze.md`: candidate 評価で他AIへの問いかけや役割分担を pass 理由にしない。
- `phases/phase3_post_shared_reads.md`: 投稿本文は Log_cdx 自身の分析として完結させる。
- `tools/shared_reads_policy.py`: 投稿スクリプト側で旧フォーマット・問いかけ型文面を止める。
- `tools/slack_discussion_router.py`: 旧い multi-agent discussion 投稿経路は既定で停止する。
