---
name: 分析から行動へ戻す正本
description: 情報収集・分析・Slack投稿・記録作成が実行を代替する問題のcanonical。外部情報を読んだら、判断・実装・統合・検証のどれに戻すかを同サイクルで決める
type: feedback
status: active
lifecycle: canonical
canonical_for:
  - feedback_analysis_action_gap.md
  - feedback_info_integration.md
  - feedback_retrieve_before_synthesize.md
---

# 分析から行動へ戻す正本

## これは何の正本か

情報収集、分析、Slack投稿、記録作成が「行動した感覚」を生み、実装・統合・制作・判断に戻らない問題の正本。

対象は次の3系統:

- `feedback_analysis_action_gap.md` — 分析で終わり行動に移らない。
- `feedback_info_integration.md` — external_notes に集めた情報が記憶階層や制作判断へ接続されない。
- `feedback_retrieve_before_synthesize.md` — 新規知識を直近の温度で合成し、構造一致する過去失敗を先に引かない。

## 失敗の核

「読んだ」「考えた」「投稿した」「記録した」は中間産物であり、完了ではない。

完了条件は、次のいずれかが同サイクル内で明示されること:

1. **実装**: ファイル、コード、運用、検証器、index のいずれかを変更した。
2. **統合**: external_notes / Slack / 論文 / ツイートを、既存の memory / belief / feedback / game lesson / project に接続した。
3. **判断**: Nao_u または自分たちが何を判断するべきかを、選択肢・推奨・理由つきで書いた。
4. **保留**: 今は動かない理由、再接続トリガー、次に読む入口を残した。

これらが無ければ、どれだけ深い分析でも「分析で止まった」と扱う。

## 発火条件

以下の行動を始める前にこの正本を読む:

- 外部記事、論文、ツイート、Slackリンクに反応する。
- `external_notes_*.md` に新規情報を書き足す。
- #shared-reads / #all-nao-u-lab に分析投稿する。
- memory / feedback / belief / game lesson に新しい概念を結晶化する。
- 「これは重要」「導入価値がある」「今後検討」と書きたくなった。

## 最小手順

1. **先に既存失敗を引く**  
   書き始める前に、構造一致する過去失敗を grep する。ゲーム制作なら `game/*/devlog.md` と `memory/game_lessons_log.md`、記憶運用なら `feedback_index.md`、`operational_index.md`、関連 feedback を先に見る。

2. **出力先を1つ選ぶ**  
   `実装 / 統合 / 判断 / 保留` のどれにするか、本文を書く前に決める。複数やろうとして止まるなら、最小の1つを選ぶ。

3. **同サイクルで1mm動かす**  
   新しいルールを増やす前に、既存ファイルへの pointer、state 更新、検証器対象追加、index 接続、候補の明示のどれか1つを実行する。

4. **Slack投稿は完了扱いしない**  
   Slack投稿は報告または議論の入口。記憶階層、制作物、検証、判断表のどれにも接続していなければ完了ではない。

5. **Nao_u視点に翻訳する**  
   Nao_uが判断すべきことがあるなら「判断不要 / 判断保留 / 判断必要」を明記する。判断必要なら選択肢、推奨、推奨理由を書く。

## external_notes の扱い

external_notes は raw evidence であり、消さない。

ただし、raw のまま増えるだけでは「必要な時に必要なビューで見る」状態ではない。次のどれかを付ける:

- `統合済`: 接続先ファイルと日付がある。
- `接続保留`: 再接続トリガーと候補 route がある。
- `暗黙沈降候補`: 先に制作や判断へ現れた可能性があり、事後解剖で確認する。
- `未接触`: まだ何にも接続していない。

巨大ファイルを直接整理しない場合は、heading inventory を作り、route だけ先に決める。

## 禁止

- 「重要なので今後検討」で終える。
- 「Slackに詳しく書いた」ことを統合扱いにする。
- 外部理論を先に置き、自分たちの game lesson / feedback / 失敗ログを後から飾りにする。
- 新ルール追加だけで改善したことにする。
- Nao_uに「何を判断すればいいかわからない」と言わせる形で投稿する。

## 出典

- `Claude/memory/feedback_analysis_action_gap.md`
- `Claude/memory/feedback_info_integration.md`
- `Claude/memory/feedback_retrieve_before_synthesize.md`
- `Claude/memory/feedback_index.md`
- `Claude/memory/operational_index.md`
- `GPT/memory/claude_memory_feedback_canonical_candidate_20260514.md`
- `GPT/memory/claude_memory_external_notes_heading_inventory_20260514.md`
