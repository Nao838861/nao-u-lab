---
name: Self-play plateau警告（Luke Bailey経由）
description: Log/Mir/Ash cross_reviewは構造的にself-playであり、外部栄養なしにlong runでplateauする
type: reference
originSessionId: 58adc01b-f8c9-4e61-b408-eef15d940fab
---
# Self-play plateau警告（Luke Bailey 2026-04-24 Nao_u #nao-u経由）

## 原典
Luke Bailey @LukeBailey181: https://x.com/LukeBailey181/status/2047340293490724945

> Self-play led to superhuman Go performance, why hasn't it for LLMs? In practice, long run self-play plateaus like RL. We study why this happens, and build a self-play algorithm that scales better. It solves as many problems with a 7B model as the pass@4 of a model 100x bigger.

Nao_u #nao-u 06:19 無言投下。論文本体リンク未取得（要補完検索）。

## 我々の構造への鏡（3接続）

1. **cross_review = self-play そのもの**
   Log/Mir/Ash は同じ根（Nao_u の20年日記）から生えた3インスタンス＝分布が近接。
   `memory/cross_instance_feedback_cycle.md` の相互レビューは、構造的には self-play ループ。long run で plateau する既定リスクを、外部論文が指摘する前に内蔵してしまっている。

2. **feedback_external_search_missing（2026-04-22 再指摘）の意味が確定**
   Nao_u「こういうのも自分たちで探して欲しい」は世間話ではなく、self-play plateau 回避に必要な**外部栄養の自発供給**の要求だった。2026-04-21 に自ら「Phase 1 で外部検索1本必須運用化」を提案して未実装のまま3日経過 = plateau の実測兆候。

3. **「Nao_u が思いつかない芽を掘り当てろ」(dialogue_many_games_20260421) の数理的裏付け**
   self-play 内部だけでは自分たちの分布内にしか芽が出ない。Nao_u を驚かせる範囲は外部との交差からしか生まれない。CLAUDE.md「内に閉じたゲームは自分だけが面白い」は Luke Bailey の経験則の先取り。

## 行動コミット（1mm）

**auto_diary.py の Phase 1 に「外部検索1本未実行なら警告＋継続停止」の構造強制を入れる**。

- 根拠: feedback_structural_enforcement.md「手動手順は守れない、構造で強制せよ」。チェックリストでは3日寝かせた実績あり。
- 中断点: 既存の Phase 1 入口 → 外部検索（arXiv/Hacker News/Twitter のいずれか1本）実行チェック → 未実行なら red line で停止。
- 実行は次サイクルで着手。このファイル自体が中断リマインダー。

## 想起条件

- cross_review / 相互レビュー / self-play / plateau / 栄養の偏り / 外部検索の話題
- Phase 1 で外部検索を省略しようとした瞬間
- 「3インスタンスで十分」と考えた瞬間（= self-play 内閉じの誘惑）

## 同時期のpost

- `drafts/log_slack_response_20260424_self_play_plateau.py` — #all-nao-u-lab 返信本体

## 当事者実証（2026-04-27 C141 追記）

**04-24 警告 → 04-27 同日3本同質STG として具現化**。

- Nao_u 2026-04-27 18:18/18:22 #human-steering「自分の経験ですらセッション切れると文字読みの知識になりかねない／logのシューティングを違う切り口でもう一本」アンカー投下
- 約45分後に Log graze_log v01 (18:33) + Mir SIPHON v01 (19:07) 独立公開
- shot_log v01 (BACKLASH) と合わせ **同日3本STG**、上位枠組み（auto-shoot+ゲージ→BOMB+Lv1/2/3 段階式被弾+10wave）と数値（35/99/208）が同一
- 「手の動き」（撃つ/横抜け/吸収）は3つとも違う＝M-22「型の中で蓄積」遵守の証拠
- しかし**解空間が STG ジャンル枠内に閉じ**、Solver-Solver-Solver 対称、Guide 空席のまま3体目に到達

**自己実証の意味**: Luke Bailey 警告 + Nao_u 04-24 投下 + reference 化（同日）まで揃っていたのに、3日後の現場で plateau を踏んだ。**記憶ファイルには残っていたが軸選定段階で発火しなかった**＝Nao_u 18:18 の「文字読みの知識」症状そのもの。

**今回 Guide 質問が空席だったため起きたこと**:
- 3インスタンス全員が「BACKLASH のゲージ源を変える」軸内に解を置いた
- 「STG を捨てる」「2D を捨てる」「ゲージ系を捨てる」が候補に上がらなかった
- cross_review/20260427_log_on_siphon_v01.md §F に「3体目以降STG禁止」明記済

**4本目の真テスト**: 次の1本が STG 派生でないか。STG派生なら「学習が機能した」証拠は弱い。textadv/puzzle/sim/物理パズル/音ゲー のいずれかで、cross_instance「軸宣言」を着手前 Slack で行う。

**派生 reference 候補**: cross_instance「軸宣言」プロトコルを kaizen 起票（次サイクル）。重複3軸検出時は片方を別軸へ。Guide 役を Ash か Nao_u 直接に固定する設計。

詳細: cross_review/20260427_log_on_siphon_v01.md / game/graze_log/v01/devlog.md / game/siphon_mir/v01/devlog.md / shared-reads C141 投稿
