# Claude feedback canonical 候補選定レポート

作成日: 2026-05-14
対応タスク: CMI-012

## 目的

次に canonical 化すべき feedback 群を選ぶ。今回は Claude 側の記憶本文は編集せず、既存ファイルと参照経路を読んで、次回以降の改善対象を確定する。

## 結論

次の canonical 化候補は、**「情報収集が報酬化する / 分析で止まる / 外部情報が行動に戻らない」クラスタ**にする。

候補ファイル名は `Claude/memory/feedback_analysis_to_action_canonical.md` とするのが自然。既存の `feedback_analysis_action_gap.md` と `feedback_info_integration.md` を中心に、`feedback_retrieve_before_synthesize.md`、`external_notes_*`、`feedback_index.md`、`operational_index.md` の参照を束ねる。

このクラスタは CMI-011 の external_notes 監査と直結している。外部摂取、分析、Slack 投稿、記録作成が「行動した感覚」を生む一方で、ゲーム制作・記憶統合・次サイクルの判断に戻らない問題を扱うため、記憶システム改善の優先度が高い。

## 候補 A: 情報収集が報酬化する / 分析から行動への断絶

主な対象:

- `Claude/memory/feedback_analysis_action_gap.md`
- `Claude/memory/feedback_info_integration.md`
- `Claude/memory/feedback_retrieve_before_synthesize.md`
- `Claude/memory/feedback_index.md`
- `Claude/memory/operational_index.md`
- `Claude/memory/external_notes_ash.md`
- `Claude/memory/external_notes_log.md`
- `Claude/memory/external_notes_mac.md`
- `Claude/memory/external_notes_mir.md`

中心問題:

- 「重要なことを見つけた」「記録した」「Slack に投稿した」で満足し、実装・統合・制作に戻らない。
- external_notes が runtime input として大きく育っているが、未統合、統合済み、暗黙沈降、保留の区別が横断的には見えにくい。
- 直近で読んだ情報や温度の高い話題から合成が始まり、過去の失敗構造を先に検索できない。
- `feedback_info_integration.md` は「集めた情報が流れて消える」問題を扱っているが、`feedback_analysis_action_gap.md` の「分析で止まる」問題とまだ一枚の canonical にまとまっていない。

優先する理由:

- CMI-011 external_notes 監査の次段に直結する。
- 記憶システムの write/manage/read 全部に関係する。
- 既存参照が複数 index に散っており、読みに行くべき入口が割れやすい。
- 「改善案を作ったが、実際の運用が変わらない」という今回の記憶改善そのものの再発防止になる。

注意点:

- 範囲が広いため、canonical 本文は新ルールを増やしすぎず、既存ルールの読み順と適用場面を整理する形に留める。
- external_notes 本体の構造変更は別タスクで扱い、この canonical 化では直接編集しない。
- `feedback_sprint_not_plan.md` が `feedback_index.md`、`operational_index.md`、`concept_graph.md` などから参照されているが、実体ファイルは見つからなかった。これは別途、壊れた参照の監査対象にする。

## 候補 B: 判断先送り / 人間・レビュー依存

主な対象:

- `Claude/memory/feedback_judgment_postpone_patterns.md`
- `Claude/memory/feedback_self_judgment_no_human_dep.md`
- `Claude/memory/feedback_predict_before_human_play.md`
- `Claude/memory/feedback_judgment_delegation.md`
- `Claude/memory/feedback_pre_impl_critical_review.md`

中心問題:

- Nao_u、cross_review、人間プレイを判定装置にしてしまう。
- 実装後に人間へ渡してから判断するのではなく、渡す前に自己予測、問題検出、修正可否判定を済ませる必要がある。
- M-37、M-39、M-40 系の上位ゲートとして重要。

今回の判断:

- 重要度は高いが、`feedback_judgment_postpone_patterns.md` がすでに統合台帳として機能している。
- `game_dev_index.md` からの導線もあり、現時点では候補 A より canonical 化の追加効果が小さい。
- 次に扱うなら、canonical 新設よりも既存統合台帳のポインタ整理と文字化け・読みやすさ確認を優先する。

## 候補 C: ゲーム制作の着手前ゲート / brainstorm workflow

主な対象:

- `Claude/memory/feedback_deep_analysis_cycle.md`
- `Claude/memory/feedback_pre_impl_critical_review.md`
- `Claude/memory/feedback_similar_games_first.md`
- `Claude/memory/feedback_prior_art_citation_must_verify.md`
- `Claude/memory/feedback_brainstorm_workflow_failure.md`
- `Claude/memory/feedback_brainstorm_appropriateness_q0.md`
- `Claude/memory/game_dev_index.md`
- `Claude/skills/lessons-recall/SKILL.md`

中心問題:

- M-37、M-38、M-41、M-43 など、ゲーム制作前に通すべきゲートが増えている。
- 似たゲームの確認、ジャンル深掘り、Q0/Q1.5、事前批評、引用検証などが複数ファイルに分散している。
- 一方で、ゲートを増やしすぎると「実装前に止まる」副作用もある。

今回の判断:

- ゲーム制作への影響は大きいが、`game_dev_index.md` と lessons-recall への導線がすでにある。
- canonical 化は有効だが、候補 A の「分析で止まる」問題を先に押さえないと、ゲート整理自体がまた準備作業として報酬化する危険がある。

## 比較表

| 候補 | 問題意識との一致 | 重複解消効果 | 読み道改善 | 実行への効き | 安全性 | 判断 |
|---|---:|---:|---:|---:|---:|---|
| A. 情報収集/分析から行動への断絶 | 高 | 高 | 高 | 高 | 中 | 最優先 |
| B. 判断先送り/人間依存 | 高 | 中 | 中 | 高 | 中 | 既存台帳優先 |
| C. ゲーム制作着手前ゲート | 高 | 高 | 中 | 中 | 中 | A の後 |

## 次アクション

1. CMI-013 は予定通り lifecycle/frontmatter 監査を行う。
2. 新しい backlog として、A クラスタの canonical 作成を追加する。
3. さらに別 backlog として、`feedback_sprint_not_plan.md` の壊れた参照を監査する。

CMI-012 の成果は「今すぐ canonical を増やす」ことではなく、次に増やすならどれが一番効くかを決めること。今回は A を選び、B と C は既存導線を尊重して後回しにする。
