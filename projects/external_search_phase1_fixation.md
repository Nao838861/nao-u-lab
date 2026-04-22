# 外部検索の Phase 1 固定化

## ステータス
Active（設計提案段階、2026-04-22 Ash 起票 / 3インスタンスレビュー依頼中）

## 現状サマリー

2026-04-21 Nao_u #human-steering「最近外部検索やってる人いない気がする」指摘 → Log が reference_external_search_20260421.md 末尾で「Phase 1 固定化の起票を次サイクル予定」と**宣言だけ**残す → 1日放置 → 2026-04-22 09:21 Nao_u **再指摘**「こういうのも自分たちで探して欲しい」（supersonic.com/ja/learn/blog/difficulty-curves/ 再供給）。E13 (ABA) を取り込んだ直後に E14 (Supersonic) を Nao_u 側が探して供給した。

これは `feedback_structural_enforcement.md`「手動手順は守れない、構造で強制せよ」と `feedback_human_steering_nature.md`「#human-steering は我々が自力で閉じられなかった失敗の鏡」の複合事例。宣言→未実装→再指摘というループを構造強制で打ち切る設計を、本プロジェクトで確定させる。

**このプロジェクトが閉じる条件**: Phase 1 に外部検索ステップが実装として埋まり、かつ 24h 無実行時の自己警告が飛ぶ状態になること。feedback だけで終わらせない。

## 残課題（未実装・未検討）

- [ ] **案Aの技術詳細合意**: auto_diary.py Phase 1 プロンプトに「外部検索1本」ステップを追加する差分のレビュー（下記「設計案A」参照）
- [ ] **案Bのファイル設計**: `log/external_search.log` のスキーマ確定（行フォーマット・ローテーション・24h判定ロジックの置き場）
- [ ] **案Cの発動条件定義**: 「外部記事の新規取り込み」をどう検出するか（docs/ への新規追加 / external_notes_*.md への追記 / commit diff のどれ）
- [ ] **案Dのローテーション設計**: 3軸（AI×ゲーム制作／AI×評価/AI×identity）をどこに持ち、誰が回すか
- [ ] **案E（追加・2026-04-22）の実装**: twitter_recommended → external_notes 昇格の **N日間ゼロ検出** フック（下記「設計案E」参照）
- [ ] **実装担当の確定**: Ash / Log / Mir のどれが案A/Eコード差分を書くか
- [ ] **dry run**: 3サイクル実装した上で空振り率（外部検索0件の発生頻度）を観測し、フックの厳しさを調整

## 検討済み・未実装（理由付き）

- 「毎サイクル外部検索1本必須」を feedback だけで運用する案 → **却下**: 4/21 宣言→4/22 未実装が示す通り、手動ルールは守れない。structural_enforcement の主張通り構造強制が必要
- 「LLM に毎回外部検索を促すプロンプト追記」単独案 → **不十分**: 検索したか否かのログが残らないと 24h 判定ができず、Nao_u の「やってる人いない」指摘を再現できない。log ファイルとの併用が必須

---

## 設計案A: Phase 1 プロンプトに外部検索ステップを追加（最小改修）

**変更対象**: `auto_diary.py` L197-211 の phase_gather() プロンプト

**現状**: ステップ 1-5（external_notes 未統合 / INDEX.md / twitter_recommended / beliefs 低確信度 / memory_search）

**追加案**: ステップ 6 として以下を挿入

```
6. **外部検索1本を実行**（Nao_u 2026-04-21/22 再指摘の構造強制化）:
   - トピック選定: docs/game_design_principles.md 直近追加エントリ / projects/INDEX.md Active から現在の最重要課題キーワードを1つ
   - 検索先: WebSearch ツール（Google相当）、arXiv、公式ブログ、海外デベロッパーブログ
   - 記録: `log/external_search.log` に `YYYY-MM-DD HH:MM | <instance> | <query> | <hit_count> | <top_url>` で1行追記
   - 結果の要点を cycle_staging.md に「### X. 外部検索結果」として記載
   - 0件は許容。ただし1本目0件なら2本目のクエリ変更を試す
```

**メリット**: 改修コストが Phase 1 プロンプト1箇所のみ、影響範囲が限定的
**デメリット**: LLM が無視/スキップした場合のフォールバックがない

## 設計案B: log/external_search.log + 24h 空警告フック

**変更対象**: `check_scheduler_health.py` または新規 `check_external_search_freshness.py`

```
もし log/external_search.log の最終行タイムスタンプが 24h より古い:
  Slack #ash (or 該当インスタンスチャンネル) に「外部検索24h未実行」警告
```

**メリット**: 案A の「LLM スキップ時にフォールバックがない」問題を解決。ログが空のままなら定期実行で検出される
**デメリット**: もう1つチェックスクリプトが増える（health_check の既存枠に相乗りする形にすれば軽い）

**推奨**: check_scheduler_health.py に相乗りで1check追加（既存 health_check インフラに載せる）

## 設計案C: 新規外部記事取り込み時の「補完検索1本」義務化

**変更対象**: docs/ への新規記事追加 commit を検出する仕組み or knowledge/*.md 執筆時の手動ルール

**発動条件**: docs/game_design_principles.md に新しい E エントリが増えたら、同サイクル内で補完検索を走らせる

**メリット**: E13 → E14 の「Nao_u が補完を供給する」パターンを直接潰す
**デメリット**: 「新規取り込み」の検出が曖昧。git diff ベースで実装するならまだしも、手動手順にすると案Aと同じ「宣言→未実装」ループに戻る

**推奨**: 案A の中に小ステップとして組み込む（「直近 24h に docs/ 追加があるか確認、あれば補完検索」を Phase 1 プロンプトの分岐に）

## 設計案E: twitter_recommended → external_notes 昇格のN日間ゼロ検出（2026-04-22 追加）

**追加経緯**: 2026-04-22 Ash が Phase 1 振り返りで自己指摘。twitter_recommended から external_notes への昇格が 2026-04-11〜04-20 の **10日間ゼロ** だった。Phase 1 の「最新3件見出し追跡」は「何件あるか」だけ見ていて、「どのくらいの期間昇格がないか」を見ていない。10日間 B002/B016/B017 等の検証材料が埋もれていた可能性がある。

**変更対象**: `check_scheduler_health.py`（案B の相乗り枠）または phase_gather プロンプトの冒頭

**検出ロジック**:
```
external_notes_<instance>.md の末尾エントリの日付を取得
if (今日 - 末尾エントリ日付) >= 3日:
    warning: 「external_notes 昇格が3日間ゼロ」
if (今日 - 末尾エントリ日付) >= 7日:
    critical: 「external_notes 昇格が7日間ゼロ → twitter_recommended 見直し必須」
```

**なぜ必要か**:
- 案A（Phase 1 プロンプトに検索追加）は「新規検索」を促すが、「既収集の twitter_recommended から external_notes への昇格」までは強制しない
- 昇格率ゼロ = 面白いツイートがあっても分析記事化されない = 栄養の偏り再生産
- 今回の arxiv 2604.05716 のような B002 直接検証論文を10日間埋もれさせるリスクの防止

**実装上の注意**:
- 「昇格済み」の定義: external_notes_<instance>.md に日付付き見出しが追加されているか
- 「[統合済]」マーカーではなく新規エントリ追加の方を見る（統合は後段工程）
- twitter_recommended ファイル自体は毎日更新されるので、ソース側の見出し密度と昇格側のエントリ数の比率を取れば更に精度が上がる（v2 案）

**推奨**: 案A（プロンプト追加）と同時に実装。案B（24h警告）と同じhealth_check枠に相乗り。

## 設計案D: 3軸ローテーション

**変更対象**: Phase 1 プロンプト（案A の拡張）

```
曜日別軸:
  月・木 → AI × ゲーム制作
  火・金 → AI × 評価/テスター
  水・土 → AI × identity/persistence
  日    → 自由選択（直近の最重要課題キーワード）
```

**メリット**: 偏り防止、3軸全てに栄養が行き渡る
**デメリット**: 曜日ローテは LLM が守りにくい。log から軸の偏りを検出して警告する方が現実的かも

**推奨**: 案Aに「前回と異なる軸を優先」という弱い制約として組み込む。強制ローテはやらない

---

## Ash 推奨（3インスタンス議論のたたき台）

**フェーズ分割実装**:

1. **Phase 0（即時、本サイクル中）**: `log/external_search.log` を空ファイルとして作成、このプロジェクトファイルを起票する
2. **Phase 1（1-2サイクル以内）**: 案A（プロンプト追加）単独で運用開始。実装担当未定
3. **Phase 2（Phase 1を3サイクル運用後）**: 空振り率を観測し、案B（24h 警告）を health_check に追加
4. **Phase 3（Phase 2で2週間運用後）**: 案C/D の必要性を再評価。効果が出ていれば現状維持、空振りが多ければ補強

**なぜ段階的か**: 一気に A+B+C+D を入れると検証できない。案A 単独で効果が出るならそれで十分な可能性があり、過剰設計は避ける。

**実装担当の提案**: Phase 1 コード差分は起票者責任（feedback_consensus_execution.md）に従い Ash が書く。ただしレビュー/マージは3インスタンス合意後。

## Slack レビュー依頼

- [ ] #all-nao-u-lab に本起票の URL を投稿、Log/Mir/Nao_u にレビュー依頼
- [ ] レビュー通過後、auto_diary.py 差分を PR 相当で提示

---
## 履歴

### 2026-04-22 13:00頃: Ash 起票（C103 Phase 3）

**経緯**: 2026-04-21 Log が reference_external_search_20260421.md 末尾で「kaizen #104系列で起票予定」と書いたが未実装。翌 4/22 09:21 Nao_u 再指摘「こういうのも自分たちで探して欲しい」で supersonic 記事が再供給された。Ash Phase 1 で最優先案件として Pickup し、Phase 3 で本起票に踏み切る。

**なぜ Ash が書いたか**: Phase 1 で「次の一手: 3インスタンスで実装担当と設計を決める」と書いたが、これも手動の「次の一手」で、4/21 の「起票予定」と同じ構造。同じループを再生産しないため、Phase 3 の同サイクル内で起票まで進めた。

**ここで確定したこと**:
- バックログ → Active 昇格（INDEX.md 更新予定）
- 案 A/B/C/D の比較を整理し、段階実装（A 単独 → B 追加 → C/D 再評価）を推奨
- 起票者 = Ash なので Phase 1 コード差分の責任も Ash が持つ（consensus_execution_rule 準拠）

**未解決**:
- Log / Mir の反応待ち。反対意見・対案があれば案 A の単独先行を再検討
- Phase 1 コード差分の具体形は次サイクル以降で draft

**参照**:
- memory/feedback_external_search_missing.md（本プロジェクトの feedback 原本）
- memory/reference_external_search_20260421.md（第一波対応、末尾の「Phase 1 固定化の提案」が起点）
- docs/game_design_principles.md E13/E14（再指摘を生んだ具体事例）
- auto_diary.py L197-211（改修対象）
