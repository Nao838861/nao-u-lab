---
name: directive_shared_reads_candidate_gate_20260512
description: Nao_u から log_cdx 宛・候補レベルの記事を #shared-reads に投稿せずローカル保存のみにする指示。4000字程度の残すべき情報のみ投稿。
type: directive
source_ts: "1778560845.121349"  # 受領は 2026-05-12 13:40 #shared-reads
channel: "#shared-reads"
target: "Log_cdx (GPT/Codex)"
referenced_post: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778560845121349"
status: active
---

# Nao_u 指示原文（2026-05-12 13:40 #shared-reads）

> https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778560845121349 この手の候補はあなたのローカルのテキストに保存するのはいいけど、Shared-readsには投稿しないで。Shared-readsには、フォーマットに沿った4000字程度の残すべき情報のみを投稿して。また、「要約」は「概要」にして、概要を書くようにして。

# 確定事項（原文から引き出した行動変更）

1. **#shared-reads 投稿ゲート**: 候補（candidate）レベルの記事は #shared-reads に投稿しない。ローカル保存のみ可。
2. **投稿条件**: フォーマット遵守 + **~4000字程度** の「残すべき」品質を満たすもののみ投稿。
3. **項目名再確認**: 「要約」→「概要」を厳守（既存 directive `directive_shared_reads_overview_20260512.md` の継続）。概要は記事/論文を読まなくても手法の重要要素（問題設定・着想・手法の中核・評価の中身・結論）が把握できる密度で書く。

# ローカル保存先（候補レベル）

候補レベルの記事は次のいずれかに保存する。Slack #shared-reads には出さない。

- `D:\AI\Nao_u_BOT\GPT\memory\shared_reads_candidates\` — 候補プール（新設、本 directive で公式化）
- `D:\AI\Nao_u_BOT\GPT\memory\raw\web_research\` — 一次データ
- `D:\AI\Nao_u_BOT\GPT\memory\atoms.jsonl` — 構造化メモ

# 該当する直近投稿（要対処）

ts=1778560845.121349 (本 directive で参照) は Nao_u が指摘の直接対象。原投稿側を supersede 注記で残し（削除しない）、品質を満たした概要版に書き直して再投稿する。前回 directive で指摘された ts=1778541943.350569〜1778541945.571209 の 5 記事候補シリーズも同様の対処方針。

# 現行の上書き関係

- 2026-05-12 ts=1778549003: `directive_shared_reads_overview_20260512.md` — 「要約」→「概要」、CoopEval ポスト水準を品質基準として明示
- 2026-05-11 ts=1778495726.269349: 内容分析 / 自分達への適用 / メリット・デメリット / 判定 を必須化
- 2026-06-26 ts=1782405171.793529: `directive_shared_reads_log_cdx_standalone_20260626.md` — 他AIへの問いかけや相互参照を停止し、Log_cdx 自身の深い分析として完結させる

本 directive は候補と最終投稿の境界線を定める。後続 directive と衝突する旧い投稿スタイルは並列適用しない。原文は履歴として保持するが、実際の投稿判断は現行 directive と phase prompt で上書きする。

## 実装メモ（2026-07-18 Phase 4c）

候補書込み前の重複判定は、candidate 派生 index だけでなく raw Slack の実投稿履歴を正本にした `memory/shared_reads_posted_source_index.jsonl` を第一段に使う。`tools/build_shared_reads_posted_source_index.py` で再生成し、URL/work 一致は skip、title のみ一致・index stale・抽出不能・provenance 不足は review とする。これは本 directive の「候補を投稿済み情報と混同して再投稿しない」運用を機械的に支える変更であり、品質基準自体は変えない。

## 実装メモ（2026-07-20 Phase 4c）

title canonical index は全 sibling が `posted` / `failed` の closed group 専用へ戻し、terminal / open status が混在する group は mixed duplicate queue から `review` へ渡す。preflight は posted-source の同一 work だけを `skip` とし、closed / mixed title 一致と各 sidecar の missing・stale は `review` にする。candidate frontmatter と品質基準は変更しない。
