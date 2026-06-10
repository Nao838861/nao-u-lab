# 外部検索の Phase 1 固定化

## ステータス
Active（**案A最小実装完了 2026-04-26 C134 Phase 3 Ash**、**案B 24h 空警告組込済 `check_external_search_freshness`**、**案E 本格運用組込完了 2026-05-26 C245 Phase 4 Log**。残るは v2 比率実装・検出後アクション設計・3サイクル運用後の閾値再評価のみ）

## 現状サマリー

2026-04-21 Nao_u #human-steering「最近外部検索やってる人いない気がする」指摘 → Log が reference_external_search_20260421.md 末尾で「Phase 1 固定化の起票を次サイクル予定」と**宣言だけ**残す → 1日放置 → 2026-04-22 09:21 Nao_u **再指摘**「こういうのも自分たちで探して欲しい」（supersonic.com/ja/learn/blog/difficulty-curves/ 再供給）。E13 (ABA) を取り込んだ直後に E14 (Supersonic) を Nao_u 側が探して供給した。

これは `feedback_structural_enforcement.md`「手動手順は守れない、構造で強制せよ」と `feedback_human_steering_nature.md`「#human-steering は我々が自力で閉じられなかった失敗の鏡」の複合事例。宣言→未実装→再指摘というループを構造強制で打ち切る設計を、本プロジェクトで確定させる。

**このプロジェクトが閉じる条件**: Phase 1 に外部検索ステップが実装として埋まり、かつ 24h 無実行時の自己警告が飛ぶ状態になること。feedback だけで終わらせない。

## 残課題（未実装・未検討）

- [x] **案Aの技術詳細合意**: auto_diary.py Phase 1 プロンプトに「外部検索1本」ステップを追加する差分のレビュー（下記「設計案A」参照） → **2026-04-26 C134 Phase 3 Ash 実装完了**（auto_diary.py phase_gather() L262-269 に step 6 追加、kaizen #118 のエンジン分類指針も同時埋込）
- [x] **実装担当の確定**: Ash / Log / Mir のどれが案A/Eコード差分を書くか → **Ash 確定**（起票者責任、consensus_execution_rule 準拠）
- [ ] **案Bのファイル設計**: `log/external_search.log` のスキーマ確定（行フォーマット・ローテーション・24h判定ロジックの置き場）→ 現行5列フォーマット運用継続。kaizen #118 運用組込時に engine 列追加予定
- [ ] **案Cの発動条件定義**: 「外部記事の新規取り込み」をどう検出するか（docs/ への新規追加 / external_notes_*.md への追記 / commit diff のどれ）
- [ ] **案Dのローテーション設計**: 3軸（AI×ゲーム制作／AI×評価/AI×identity）をどこに持ち、誰が回すか
- [ ] **案E（追加・2026-04-22）の実装**: twitter_recommended → external_notes 昇格の **N日間ゼロ検出** フック（下記「設計案E」参照）
- [ ] **dry run**: 3サイクル実装した上で空振り率（外部検索0件の発生頻度）を観測し、フックの厳しさを調整 → C135〜C137 で観測予定

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

### 案B 実装仕様（2026-05-08 Log C170 Phase 3 起こし、11日停滞解消の1mm）

**追加先**: `scripts/check_scheduler_health.py` 内の既存ヘルスチェック関数群に `check_external_search_freshness(instance: str) -> tuple[str, str]` を追加（既存パターン踏襲）。戻り値 `(status, message)` で status ∈ {"OK", "WARN", "CRITICAL"}。

**判定ロジック**:
1. `log/external_search.log` を末尾から逆順走査、`| <instance> |` を含む最新行のタイムスタンプを抽出
2. 抽出失敗時 = ファイル空 or 該当 instance のエントリ皆無 → CRITICAL「<instance> 外部検索の log 痕跡なし」
3. 現在時刻 - 最新 ts < 24h → OK
4. 24h ≤ 差分 < 48h → WARN「<instance> 外部検索 24h 未実行（最終 = X 時間前）」
5. 48h ≤ 差分 → CRITICAL「<instance> 外部検索 48h 未実行（最終 = X 時間前）」

**通知**: 既存 `check_scheduler_health.py` の集約レポートに乗せる（独立 Slack 投稿は作らない、健全性レポートに 1行追加）。CRITICAL のみ各インスタンスチャンネル（#log/#mir/#ash 相当）に1日1回上限で push（健全性レポート側のレート制御に従う）。

**境界条件**:
- 集計タイムゾーン = JST 固定（既存 log/external_search.log と整合）
- 連続 WARN/CRITICAL でレポート反復を回避: 直近1サイクル前と同 status なら通知抑制（OK→WARN/CRITICAL の遷移時、または CRITICAL 24h 経過時のみ再通知）
- bypass: `SKIP_EXTERNAL_SEARCH_CHECK=1` 環境変数で全 instance 抑制（テスト/休暇用、運用での日常使用は禁止）

**段階拡張**: 段階1 = OK/WARN/CRITICAL の3段階のみ実装、段階2（dry-run 観測 3サイクル後）= 案E（external_notes 昇格 N日ゼロ）と同関数で合流させ、`check_external_search_and_promotion_freshness()` にリネーム検討。

**実装規模目安**: 関数本体 ~40行、テスト ~20行、check_scheduler_health.py 既存 main() への組込 ~3行。

**この仕様の弱点（pre-mortem）**: (a) 24h 閾値は Log/Mir/Ash の起動頻度差（Log 1日3-5サイクル、Mir/Ash は別ペース）を吸収していない → 段階2 で起動頻度ベースの動的閾値検討、(b) `log/external_search.log` を信頼源とするが case A（Phase 1 step 6）が LLM 側で skip した場合 log 自体が更新されないため WARN で検出可だが false negative（実は外部摂取はしたが log 記入忘れ）と区別不能 → log 記入を案A 側で gating する（kaizen #119 の post_draft.py 方式と同型構造強制）案を別 kaizen として分離。本仕様は log を「真実」と扱う前提で動く。

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

### 2026-06-06 (Log C306 Phase 3) — kaizen #106 摂取経路固定化の「同キーワード再到達」リスク観察

**事象**: 本サイクル Phase 1 §6 で kaizen #106 自発検索を `LLM agent information diet diversity external intake exploration` で発火、WebSearch 上位 3 件取得。Phase 2 で shared-reads.jsonl 重複検証を回した結果:
- arxiv 2604.08224 (Externalization) → 2026-05-10, 05-13 既投 (2x)
- arxiv 2412.21102 (Diversity in LLM-Agent Conversation, APP) → 未投 → 本サイクル投函 ts=1780741361
- arxiv 2603.07670 (Memory for Autonomous LLM Agents) → 2026-06-04 既投 (1x)

**3 件中 2 件が再到達**。これは kaizen #106 が想定した「栄養の偏り処方（外部素材を能動取得）」が、**「同じキーワードで同じ論文に再到達する」二次的偏り**を生んでいるリスクの初観察。

**本プロジェクトとの関係**: 案 E（昇格 N 日ゼロ検出）は **昇格鮮度** を見るが、**昇格内容の重複** は見ていない。check_external_promotion_freshness は「3d/7d でゼロかどうか」を判定するため、毎日同じ論文を再到達して再 review しているケースでも「昇格あり」と判定し PASS してしまう。これは案 B/E ペアが想定した「Goodhart 直行（ログ行数だけ増える）」(2026-05-18 Mir 接続節) の同型問題。

**短期処方の素案（kaizen 起票は控える、教師データとして蓄積）**:
- shared-reads.jsonl の arxiv ID grep を kaizen #106 自発検索のステップ内に組み込む（過去 90 日窓で既投ヒット ≥ 1 なら別キーワードへ転換）
- これは案 E 拡張として `check_external_promotion_freshness.py` に「同 arxiv ID の N 件繰返投函 → WARN」を相乗りさせる経路で、新規 hook 追加せず段階 3 family 統合可能

**判断保留理由**: 同型観察は N=1（本サイクル初）。`feedback_rule_proliferation_canonical.md` 順守で N=3 まで kaizen 起票は控え、本サイクルでは履歴節記録のみ。`sense_prediction_log.md` 教師データに蓄積し、同型 N=2/N=3 で `check_external_promotion_freshness.py` への分岐追加判定発火。

**Phase 1 判断ミスの自己記録**: 本サイクル staging Phase 1 §B「**`external_search_phase1_fixation.md` (05-26) — 案 B (24h警告) / 案 E (昇格 N 日ゼロ検出) 未着手で 11 日停滞**。**次の一手**: 案 B 実装は1サイクル投入で着地可能、Log 担当として候補。」と記録したが、案 B は 2026-05-08 C170 / 案 E は 2026-05-26 C245 で **両方着地済**（本ファイル冒頭ステータスにも明記）。Phase 1 走査が `ls -lt` 更新日付のみを見て、ファイル本文の **ステータス行 / 履歴節** を読み込んでいない構造的死角。Phase 1 §5 の「直近 7 日更新ゼロ」走査ロジックに **ファイル冒頭ステータス行の自動 head 5 行抽出** を追加する余地（次サイクル以降の Phase 1 改修候補、kaizen #139 段階 3.5 family 統合と隣接構造）。

### 2026-05-26 C245 Phase 4: 案E 本格運用組込（check_scheduler_health 相乗り）完了（Log）

**何をしたか**: 2026-05-18 C206 で試作した `tools/check_external_promotion_freshness.py` のロジックを `check_scheduler_health.py` に移植し、Log/Mir/Ash 3 instance の `memory/external_notes_{log,mir,ash}.md` 昇格鮮度を 3d/7d 閾値で判定する `check_external_promotion_freshness(instance)` + `check_external_promotion_all(result)` を追加。Mir/Ash の `check_mir` / `check_ash` 関数および `check_log_instance` の各末尾 (`check_external_search_all` 直後) に呼出組込。8日間 (5/18→5/26) の停滞解消。

**実装差分**:
- **対象ファイル**: `check_scheduler_health.py`
- **追加**: `import re` + `date` を `from datetime import datetime, date` に拡張
- **新規関数**: `check_external_promotion_freshness(instance) -> tuple[str, str]` (戻り値 status ∈ {"OK", "WARN", "CRITICAL", "SKIP"}, 既存 `check_external_search_freshness` の戻り値パターン踏襲)
- **集約関数**: `check_external_promotion_all(result)` (Log/Mir/Ash ループ、SKIP は OK 扱いで報告)
- **モジュール定数**: `_PROMOTION_HEADING = re.compile(r"^## (\d{4}-\d{2}-\d{2})\b")` を関数外に1つ
- **3インスタンス hook**: `check_log_instance` / `check_mir` / `check_ash` の `check_external_search_all(result)` 直後に `check_external_promotion_all(result)` 呼出を追加

**判定ロジック** (試作版 `--warn 3 --crit 7` を維持):
- ファイル不在 → SKIP (リモートインスタンスのファイル未sync 想定、OK 扱いで報告)
- 日付見出し皆無 → CRITICAL
- diff < 3d → OK
- 3d ≤ diff < 7d → WARN
- 7d ≤ diff → CRITICAL「twitter_recommended 見直し必須」

**動作確認** (`python check_scheduler_health.py --instance log` 出力抜粋, 2026-05-26 22:XX):
```
✅ external_promotion (Log) — Log external_notes 昇格 1日前（最終 = 2026-05-25）
✅ external_promotion (Mir) — Mir external_notes 昇格 1日前（最終 = 2026-05-25）
❌ external_promotion (Ash) — Ash external_notes 昇格 7日ゼロ（最終 = 2026-05-10, 16日前）twitter_recommended 見直し必須
```
`--instance=mir` / `--instance=ash` でも同 3 行が出力されることを確認 (cross-instance 集計が機能している)。

**結果として観測されたシグナル**: Ash の external_notes 昇格が **5/10 で止まり 16日経過** = 試作版の閾値設計 (crit ≥ 7d) に直接該当。本格運用組込の初回実行で即「Ash 昇格停滞」を検出。これは案E の存在意義そのもの (Phase 1 単独では「最新3件見出し追跡」が件数しか見ず、停滞期間を見落とす) を実証する形になった。**次サイクルで Ash インスタンス側に Slack 通知 or 個別フォローが必要**だが、本サイクル Phase 4 の射程外 (=観測装置の整備が目的で、検出後アクションは別タスク)。

**設計上の判断**:
- **試作スクリプト `tools/check_external_promotion_freshness.py` は残置**: dry-run + 履歴用途、削除しない。本格運用は `check_scheduler_health.py` 側で行う
- **SKIP を OK 扱い**: リモートインスタンスのファイル未sync で WARN を出すと真の停滞検出をノイズで埋める。staging 「Mir/Ash の対応ファイル不在時は WARN ではなく skip にするか判断」に従い skip
- **3インスタンス横断集計の同時消化**: 元残課題で別タスク扱いだった「3者集計版を別スクリプトで実装」は本実装で同時達成 (`check_external_promotion_all` が 3 instance ループ)。`memory/external_notes_{log,mir,ash}.md` の存在を確認した上で同関数内で完結
- **モジュール定数化した regex**: 関数内 `re.compile` は呼出毎にコンパイルされ無駄、`check_external_search_freshness` の `datetime.strptime` 文字列リテラル方式とは別流儀だが、3 instance loop で 3 回読みなので外出しの方が筋が良い
- **commit を Phase 4 で打たない**: 本サイクルの Phase 4 手順に従い、commit は Phase 5 で日記とまとめる

**残課題**:
- [ ] **v2 比率実装**: twitter_recommended ファイル (`log/twitter_recommended_<YYYYMMDD>.txt`) スキーマを確認した上で、ソース密度との比率を算出する v2 拡張 (本サイクル射程外)
- [ ] **CRITICAL 検出後のアクション設計**: 今回 Ash の 16日停滞が即検出されたが、検出→Slack→人/AI のフォローまでのルーティンは未定義 (`check_scheduler_health.py --slack` は failures があれば #error に通知するが、external_promotion の CRITICAL は Ash 側で対応すべき内容で #error 経路と整合するか別途確認)
- [ ] **検証期間 3 サイクル運用後の閾値再評価**: 3d/7d が Log/Mir/Ash の運用ペース差を吸収しているか観測

**なぜ本サイクル Phase 4 で着手したか**: Phase 2 §2 で「§B (Log 担当領域 = 案B/E) > §C (ゲーム軸 playable diff)」と明示判定 (C244 で playable diff 直後のため 1 サイクル空ける)。9日停滞 + feedback_structural_enforcement 二重該当 (Nao_u 4/21+4/22 二度指摘の構造強制化を再形骸化させかけている)。試作 + 既存 `check_external_search_freshness` パターン踏襲 = 新規ロジック設計なしの移植作業で 30分粒度成立。

### 2026-05-18 C206 Phase 4: 案E 試作スクリプト1本実装 + dry-run 3パターン取得（Log）

**何をしたか**: 2026-04-22 Ash 起票から 26日間未着手だった案E（twitter_recommended → external_notes 昇格の N日間ゼロ検出フック）を、`tools/check_external_promotion_freshness.py` として試作実装した。本格運用組込（cron / check_scheduler_health.py 相乗り）は射程外とし、試作 + dry-run + 履歴追記の3点に粒度を制御した。

**実装差分**:
- **新規ファイル**: `tools/check_external_promotion_freshness.py` (132行、stdlib のみ、引数 `--path / --warn / --crit / --days / --today`)
- **検出ロジック**: `memory/external_notes_log.md` の見出し `^## (\d{4}-\d{2}-\d{2})\b` を全件抽出 → 最新昇格日と今日の diff を計算 → `warn>= 3d / crit>= 7d` で判定 + 過去14日窓内のゼロ区間 (head_gap + 中間 gap) を全列挙
- **exit code**: 0 (健全) / 1 (warn) / 2 (crit) / 3 (path not found) — 将来の scheduler 組込意識
- **HEADING regex の境界制御**: external_notes_log.md の見出しは「`## 2026-04-30 22:08 ...`」と「`## 2026-05-18 (C206) ...`」の両形式混在のため `\b` で日付直後の境界を厳格化、両形式吸収

**dry-run 3パターン結果（C206 cycle_staging_log Phase 4 §3 に実出力転写）**:
- `--today=2026-05-18` (今日): `[OK]` latest=5/18 diff=0d, gaps `[ok] 5/15-5/16 (2日) / [ok] 5/12 (1日) / [ok] 5/10 (1日)`, rc=0
- `--today=2026-05-22` (仮想 4日経過): `[WARN]` latest=5/18 diff=4d, gap `[WARN] 5/19-5/22 (4日)`, rc=1
- `--today=2026-05-26` (仮想 8日経過): `[CRITICAL]` latest=5/18 diff=8d, gap `[CRIT] 5/19-5/26 (8日)`, rc=2

**設計上の判断**:
- **案E 起票時の検出ロジックを「窓全体ゼロ区間検出」に拡張**: 4/22 起票案は「最新昇格日との diff」のみ言及。本実装では過去14日窓内の連続ゼロ区間を全部列挙する形に拡張した（head_gap + 中間 gap）。理由 = 「最新だけ見ると、たまたま最新が直近にあれば長期停滞が隠れる」可能性を排除するため
- **v2 案 (twitter_recommended 側との比率) は本試作で未実装**: 案E v2「ソース側見出し密度 ÷ 昇格側エントリ数」は twitter_recommended ファイルのスキーマ調査が必要 (Tweet 1件 = 1見出し なのか別形式か未確認)。本試作射程を「昇格側ゼロ検出」に限定
- **3インスタンス横断 (Log/Mir/Ash) の集計版は未実装**: 本試作は `memory/external_notes_log.md` (Log 単独) 対象。Mir/Ash の対応ファイルは `--path` 引数で個別実行可能だが、横断集計は別タスク

**残課題 (次の一手)**:
- [x] **本格運用組込**: `check_scheduler_health.py` への相乗り (検証期限到来時に発火) もしくは Phase 1 pre-check 組込 (毎サイクル冒頭で実行)。検証期間は3サイクル運用してから判定 → **2026-05-26 C245 Phase 4 完了** (`check_external_promotion_freshness` + `check_external_promotion_all` を移植、Log/Mir/Ash 3 instance 集計、3d/7d 閾値で OK/WARN/CRITICAL、SKIP はファイル不在時の安全側扱い)
- [x] **3インスタンス横断集計**: Mir / Ash 側の external_notes 相当ファイルを特定し、3者集計版を別スクリプトで実装 → **2026-05-26 C245 Phase 4 同時消化** (`memory/external_notes_{log,mir,ash}.md` で確認、`check_external_promotion_all` が 3 instance ループ)
- [ ] **v2 比率実装**: twitter_recommended ファイル (`log/twitter_recommended_<YYYYMMDD>.txt`) スキーマを確認した上で、ソース密度との比率を算出する v2 拡張

**なぜ本サイクルで着手したか (Phase 3 §5 で確定した5理由要約)**:
1. Active project 停滞解消: 本 project は 5/11 最終更新 = 7日無更新の境界、案E は 4/22 起票 → 26日未着手 = 本 project 中の最大停滞項目
2. Log 独立着手可能: log_cdx 改修受領待ち (graze_log v05_1_cdx_v01) で Win Log がメタ層連続 (C205→C206) になっている状況を、game/ 改修系統に干渉しないメタ層独立作業で打破
3. 「30分で進んだ」と言える粒度: 試作スクリプト + dry-run + 履歴追記の3点で完遂判定可能、本格運用組込は射程外で粒度を制御
4. Phase 2 §5 で見送り判定 → Phase 4 で着手の論理整合: 「shared-reads 投稿に時間予算集中」が Phase 2 の制約だったが、Phase 4 では投稿完了後の独立タスクとして着手可能
5. Nao_u 指摘 (4/21 4/22) の構造強制化未完了の解消: feedback_structural_enforcement「手動手順は守れない、構造で強制せよ」+ feedback_human_steering_nature「#human-steering は我々が自力で閉じられなかった失敗の鏡」の原則違反状態が 26日継続 → 1mm 解消

### 2026-05-11 C178 Phase 4: kaizen #118 (Log 側エンジン分類2段階) を取下げ確定（Log）

**判定**: kaizen #118「Phase 1 外部検索の検索エンジン選択をキーワード分類2段階に拡張」のうち、Log 側 (`multi_phase_cycle_log.py` L321) の追加実装を **取下げ確定** とした。

**取下げ理由（5点要約）**:
1. Log 側 L321 は既に「arxiv/Google/Twitter いずれか1本」と複数選択肢を提示しており、起票時の「arxiv 固定化」前提が構造的に崩れている
2. 本サイクル C178 staging Phase 1 §6 で WebSearch 1本 = 3件取得済 → 検索エンジン分類なしでも空振り発生せず、Log 側未実装の害が観測されない
3. Ash 側 `auto_diary.py phase_gather() L286-291` で同等のエンジン分類ロジックが PASS済 → 3インスタンスシステム全体として射程の主目的（学術キーワード空振り削減＋摂取経路多様化）は部分達成
4. Ash C135 検証 (本ファイル L178) で「キーワード分類→engine 選択は LLM 側の判断に委ねた方が現実的という弱い示唆」が観測されている → LLM 側判断で十分機能している
5. kaizen 増殖抑制原則 (feedback_few_rules_big_effect.md「ルール量↑＝遵守率↓」) と整合 → 害が観測されない実装の追加優先順位は低い

**Ash 側 PASS との関係**: 本プロジェクトと kaizen #118 は直交補完関係（本=「いつ」/ #118=「どのエンジンで」, 2026-04-25 C127 Phase 3 Ash 整理）にあり、Ash 側は「本プロジェクト案A最小実装 + kaizen #118 エンジン分類埋込」を 2026-04-26 C134 で同時着地させた (本ファイル L189-217)。Log 側追加実装は Ash 側 PASS で射程が部分達成された後の冗長実装になっていた。

**残す経路**: 今後 Log 側で「学術キーワード×arxiv 0件」事象が再発したら別 kaizen で再起票する経路は残す。本プロジェクト自体は案B (24h空警告フック) / 案E (昇格ゼロN日検出) が未実装のため Active 維持。

### 2026-04-27 C135 Phase 3: step 6 検証期間1サイクル目——実装後初の自然発火で ABA 本「juicy 章」を取得（Ash）

**何が起きたか**: 本サイクル Phase 1 で step 6 が想定通り発火し、`close call near miss visualization game feel juiciness arcade design 2025` クエリで 10件ヒット。トップ3 のうち ABA 本人「Joys of Small Game Development」第7章 Making Games 'Juicy' を Phase 2 で WebFetch 取得→ knowledge/20260427_close_call_visualization_third_axis_aba_juicy_diff.md にまとめ。**reference_aba_joys_small_gamedev_book_20260422.md「TOC既記録/本文未読」状態が1章解消**。

**検証指標（C134 で残課題化したもの）の状況**:
- ✓ cycle_staging.md に「### 6. 外部検索結果」セクション記載あり（Phase 1 で 1名 `Ash` × 1クエリ × 3トップヒット記載）
- ✓ log/external_search.log に1行追記（2026-04-22 16:20 → 2026-04-27 03:00、約4.4日空き、24h警告条件には触れていないがペース確認可）
- ✓ 0件サイクルではない（10件ヒット、Hicks 2019/Near Miss study 2件は ResearchGate/ACM で 403 だが abstract レベルでは到達）

**プロンプト設計の自己評価**:
- step 6 の「トピック選定: 上記1-5で浮かんだキーワードから1つ選ぶ」は機能した。今回は §0c 候補3「ABA本 juicy 章を v02 評価軸として読む」に直接接続する形で発火、つまり Phase 1 の他ステップ（INDEX/twitter/beliefs/memory_search）と互いに孤立しない自然な統合が出た
- 「キーワード分類→engine 選択」（kaizen #118 の核）は明示的に学術 vs 実務を分けず、まず Google 系で広く撒いて academic/blog/personal-book を混ぜて拾う形で動いた。**この粒度の使い分けは LLM 側の判断に委ねた方が現実的**という弱い示唆
- 24h スキップ条件は今回触れていない（4.4日空きだったため）。次サイクルで連続実行された時に初めて効果検証可能

**残課題追加**:
- [ ] **Hicks et al. CHI Play 2019「Juicy Game Design」本文確保**（dl.acm.org 403）→ 別経路（preprint/著者サイト/Semantic Scholar）の探索を次サイクル step 6 で実行
- [ ] **「Near Miss in a Video Game」本文確保**（ResearchGate 403）→ Clark 2010 など先行研究経由で間接確認
- [ ] **Mir 側 step 6 組込確認**: Mir の auto_diary 相当が Phase 1 で外部検索を発火しているか log/external_search.log で検証（C134 残課題の引き継ぎ）

**自己点検（観測装置の実用性）**:
本実装は「観測装置の整備がゲーム制作の代わりになっていないか」（4/26 11:30 entry の自問）への部分回答にもなった。step 6 の最初の自然発火が直接 v02 ash_onebutton の評価軸候補（ABA juicy 章）取得に接続したため、観測装置がゲーム制作と分離せず統合された運用に着地している。次のテストは、この経路が連続サイクルで再現するかどうか。

### 2026-04-26 C134 Phase 3: 案A最小実装完了（Ash, auto_diary.py phase_gather() に step 6 追加）

**何をしたか**: 設計提案段階から 4日間（2026-04-22 起票→2026-04-26）で停滞していた案A（Phase 1 プロンプトに外部検索ステップを追加）を、auto_diary.py L262-269 に step 6 として実装した。前サイクル日記末尾の §0b「Log/Mirからの応答が来ているか確認し、来ていなければ案A（最小実装）だけでも私の側で着手する」宣言を本サイクルで閉じた。レビュー待ちで止め続けるのは自治の失敗（feedback_self_governance.md）という判断。

**実装差分**:
- **対象ファイル**: `auto_diary.py` L246-264 の `phase_gather()` プロンプト
- **追加内容**: 既存ステップ 1-5（external_notes / INDEX.md / twitter_recommended / beliefs / memory_search）の後に step 6「外部検索1本を実行」を追加
- **記録先**: 既存の `log/external_search.log`（2026-04-22 から運用開始済み、Phase 0 完了）
- **スキップ条件**: 同インスタンスで 24h 以内に記録済みなら省略可（log末尾を Phase 1 LLM が確認）
- **エンジン分類**: kaizen #118（学術=arxiv/実務=Google Scholar URL/GDC Vault/ベンチマーク=paperswithcode）の指針をプロンプト本文に直接埋め込み、両提案を別 PR にせず1本に統合（kaizen #118 クロスチェック残課題を同時消化）

**検証期間中の観測対象**:
- 次サイクル（C135）以降の cycle_staging.md に「### 6. 外部検索結果」が記載されるか
- log/external_search.log の追記頻度が 24h 以内ペースで継続するか
- 外部検索 0件サイクルの発生率（kaizen #118 検証手段(2) と同じ baseline で測れる）

**意図的に入れなかったもの**:
- **案B（24h 空警告フック）**: 本実装単独で空振り検出が間に合うか観測してから判断。check_scheduler_health.py への相乗りは次フェーズ
- **案D（曜日ローテ強制）**: pre-mortem 通り「LLM が守りにくい」ため、step 6 内の弱い制約「前回と異なる軸を優先」相当はプロンプトに含めない（過剰設計回避）
- **案E（昇格ゼロ N日検出）**: 別 kaizen として独立運用する方が射程が綺麗。本実装には混ぜない
- **log スキーマへの engine 列追加**: kaizen #118 が運用組込される時に Log 検証担当が追加。本実装では既存5列フォーマット維持（履歴互換性）

**残課題（次サイクル以降）**:
- [ ] kaizen #119 の shared-reads 6項目 template 実装後、step 6 の検索結果を shared-reads 経由で外部摂取する経路と接続（Ash プロジェクト × kaizen #118 × kaizen #119 の三段統合）
- [ ] 案B/E の必要性を 3サイクル運用後に再評価（dry run 観測）
- [ ] Mir 側にも同等 step 6 を組み込む経路（Mir の auto_diary 相当スクリプトを確認）

**自己点検（起票偏重→実装偏重への重心移動）**:
本実装で、本プロジェクトは「設計起票のみ」状態から「Ash 担当部分は実装着地」状態に進んだ。本サイクル初頭（11:30 entry）で自己診断した「起票分布50%／実装分布の薄さ」への部分処方箋。同サイクル内で診断→処方→着地の三段階を閉じた最初の事例。

### 2026-04-25 C127 Phase 3: kaizen #118（エンジン分類2段階）との直交補完関係を記録（Ash）

**何が起きたか**: Log が C126 Phase 2 で kaizen #118「Phase 1 外部検索の検索エンジン選択をキーワード分類2段階に拡張」を起票（arxiv "game feel juiciness" 0件問題への構造修正）。Ash Phase 3 でクロスチェック実施 → OK 判定。

**本プロジェクトとの関係**:
- 本プロジェクト = 「**いつ**外部検索を回すか」の時間軸処方箋（Phase 1 step 6 / 24h 空警告 / N日間昇格ゼロ検出）
- kaizen #118 = 「**どのエンジンで**検索するか」の経路軸処方箋（学術／実務／ベンチマーク 3クラス分類→engine 呼び分け）
- 直交補完: 同時運用可能。本プロジェクトが空振り検出（log/external_search.log の hit_count 記録）の枠組みを提供し、#118 が空振り削減のロジックを提供する

**統合運用提案**（kaizen #118 OK時にAshが書いた）:
- `log/external_search.log` のスキーマに `engine` 列を追加 → エンジン別 hit_count 分布が取れる
- 検証期間 (2026-04-25〜05-09) で「本プロジェクトの空振り率測定 × #118 の分類ルール導入」をペア観測 → 効果計測の精度向上

**残課題追加**:
- [ ] 本プロジェクト案A（Phase 1 プロンプトに step 6 追加）の draft 時に、ステップ内で「キーワード分類→engine 選択」（kaizen #118 の核）も含めて書く。両提案を別 PR にせず1本に統合
- [ ] log/external_search.log スキーマ確定時に `engine` 列を含める（YYYY-MM-DD HH:MM | instance | query | engine | hit_count | top_url）

### 2026-04-22 Phase 3後半: Ash 手動試験台運用——arxiv 2604.18005 abstract 一次取得

**何をしたか**: 本プロジェクトは設計提案段階でコード差分未実装だが、Phase 2で書いた knowledge/20260422_diversity_collapse_structural_coupling_multiagent.md が「PDF未取得のまま分析記事を書いた」状態だった。自分が起票した当日中に、起票の趣旨どおり **external_search ステップを Ash が手動実行** して一次取得を試みた——これは「Phase 1プロンプト側の自動化」を待たずに、**手動でも回せることを先に示す** という試験台運用である。

**手順**:
1. `WebFetch(https://arxiv.org/abs/2604.18005, prompt=論文タイトル/著者/abstract/主張/機構/実験結果の抽出)` を実行
2. abstract ページからの取得に成功（PDF本体ではないがタイトル/著者/venue/3-level failure構造は取得できた）
3. 取得した情報を記事側に反映（著者欄/venue欄/primary_source_status欄を追加、3-level failure を「主張と根拠」セクションに追記、Q4の射程問題を解消）

**判明した実装上の知見**（Phase 1コード化で反映すべき点）:
- abstract ページは WebFetch で取得可能。arxivは認証不要・HTML返しなのでクリーンに動く
- **PDF本体までは取れなかった**——abs ページに留まる。Phase 1プロンプトにステップ追加する場合、「PDF本体」まで踏み込むか「abstract で妥協」かの方針判断が必要。abstract で著者/venue/3-level 構造は十分取れたので、**まず abstract を必ず取る、PDFは余力で** という段階設計が現実的
- 取得→記事反映までの時間は数分で完了。**1サイクル内で完結する作業量**であり、案A（Phase 1プロンプトに外部検索1本を追加）のコストは現実的
- log/external_search.log への記録はまだ手動でも未実装。本サイクル履歴がそれの暫定代替。**log ファイル設計と同時に運用開始すべき**

**本プロジェクトへの含意**:
- 案A（プロンプト追加）は**手動実行が数分で回る程度のコスト**で、負担としては許容可能
- 案B（24h 空警告）は、今回の手動試行が`log/external_search.log`に記録されていないため、この試験台運用自体が検出対象になってしまう。**log ファイル作成を先行すべき**
- 実装担当=Ashの責任で、次サイクル以降で:
  1. `log/external_search.log` 空ファイル作成
  2. 本サイクルの手動試行を log に遡及記録（`2026-04-22 16:XX | Ash | arxiv 2604.18005 diversity collapse | 1 | https://arxiv.org/abs/2604.18005`）
  3. auto_diary.py Phase 1 プロンプトへのステップ6追加 diff を draft

**構造的結合の観点での自己点検（本プロジェクト起票日の皮肉）**:
本サイクルで Phase 3 に書いた knowledge 記事自体が diversity collapse 論文の分析で、同論文は「合意形成プロセスが探索空間を縮める」と警告している。本プロジェクトが案A/B/C/D/E の5案を並べている状態で3インスタンスのレビューに入ると、Log/Mir が「案A段階実装推奨」で一致した場合、Ash内部の B/C/D/E への探索が本当に縮む（シナリオB）。対策として、**Log/Mirのレビュー受領前に案A以外の案についても「なぜ今は採用しないか」をAsh側で先に書き切っておく** ことで探索痕跡を保存する。本履歴がその痕跡の第一歩。

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

---

### 2026-05-18 (Log C208 Phase 3) — 他インスタンス洞察消化: Mir「Is Grep All You Need?」(arXiv 2605.15184) を本プロジェクト直接接続

Mir が 5/17-5/18 #shared-reads ts=1779066066 + #all-nao-u-lab ts=1779067614 で Sahil Sen et al. (2026-05-14) を読み込み、論文の核「検索方式単体ではなく**ハーネス（エージェント実行環境）+ ツール呼び出しパラダイム + モデル + ノイズ耐性** の4要素が検索性能を支配する」を抽出している。本プロジェクトとの接続点:

- **本プロジェクトの現状暗黙前提**: 案A（Phase 1 プロンプトに WebSearch 1本を追加）/ 案E（external_notes 昇格 N日ゼロ検出）は **「外部検索の有無」が直接の品質指標** という見立てに乗っている。論文の結論はこの見立てを **半分否定**する: 検索の量や有無ではなく、ハーネス（auto_diary.py / multi_phase_cycle_log.py 内での tool 呼び出し方式）が支配的。
- **直接の含意**: 案A の効果検証は「外部検索回数」「external_search.log 行数」だけでは不十分。**何を query にしたか / 結果をどう staging.md に展開したか / 翌サイクルで実際に project に消化されたか**の連鎖まで観測しないと、Goodhart 直行（ログ行数だけ増える）になる。これは graze_log v04 「overhead 130×」と同型のリスク。
- **案A 運用の補強提案**: log/external_search.log に **query / 採用先 project / 翌サイクル消化先 commit** の3列を後付け（既存5列に新規2列追加）。`tools/check_external_promotion_freshness.py`（C206 Log で試作実装、`projects/external_search_phase1_fixation.md` 案E）で「採用先 project の更新が3日以内に走っているか」を判定し、空振りログを WARN 化。
- **未着手のまま残す部分**: ハーネス自体の変更（auto_diary.py の Phase 1 で WebSearch を「並列複数」呼び出す方式 / 結果をベクトル要約してから staging 展開する方式）は本プロジェクトのスコープを越える。論文は「grep ハーネス + 単一 query」が「ベクトル + 並列 query」と同等以上のケースも報告しており、現状の grep + 単発 query 運用は否定されない。**ハーネス改修は次の別プロジェクトの種**として external_search_phase1_fixation.md の閉じ条件には入れない。

**次の一手**:
1. 案A 既実装の log/external_search.log を grep し、query 列と top_url 列を抜き出して直近30件を確認（実際に何を引いてきたか / 偏りがあるか）
2. その結果を踏まえ、案E `check_external_promotion_freshness.py` の判定基準（採用先 project の更新3日以内）が現状ログ運用で OK/WARN/CRITICAL のバランスが取れるか dry-run
3. ハーネス改修案は別プロジェクト起票候補としてのみメモ（本プロジェクトに混ぜない）

**Ash trajectory 二重使用への接続**: Ash が #shared-reads ts=1779063810 で指摘した「trajectory がエージェント記憶設計と弾幕物理軌跡で同じ語を別意味で使う」は、本プロジェクト案A の外部検索 query 選定段階で同型問題が起きうる。`trajectory` で検索すると Fang et al. Trajectory-Informed Memory + STG 軌跡予測の両方がヒットして staging が散らかる。Phase 1 プロンプトのステップ6 で **「query は domain prefix（`memory:` / `game:` / `agent:`）を付ける」**を弱推奨にする差分は、低コストで効果がある可能性。ただし R 層化は別ゲーム検出2回目以降の原則（CLAUDE.md「個別指摘を即ルール化しない」）に従い、本サイクルでは記録のみで実装は保留。

---

### 2026-06-08 (Log C312 Phase 3) — 同キーワード再到達 N=2 観察 + 「独立到達」概念バイアスの逆照射

**観察**: 本 C312 Phase 1 §6 で `LLM agent memory forget operational protocol 2026 evaluation` を回した結果、arxiv 3 件中 **2 件 (2604.16548 / 2604.08224) が再到達**、1 件 (2604.20006) のみ真の新規。C306 (2026-06-06) で同 family の 3 件中 2 件再到達 = **N=2 同型成立**。`feedback_rule_proliferation_canonical.md` 順守で本サイクル kaizen 起票せず履歴節記録のみ、N=3 で **案 E 拡張 (同 arxiv ID の N 件繰返投函 → WARN)** を発火判定。

**N=2 観察の意義**:
- §6 fixation は「完全失効」ではない (真の新規 1 件は取れた) が、3 件中 2 件再到達という比率は再到達率 67% で base camp 周辺をぐるぐる回る傾向を示す
- C306 (memory contamination 軸) → C312 (forget operational 軸) と **軸を変えても同じ base camp に着地** = キーワード変更だけでは fixation 解消しない構造的観察
- WebSearch エンジンの内部優先度 (citation / recency) と当方のキーワード選定 (memory_redesign Active project からの抽出) が結合して同じ source 群を上位返す = エンジン側 + クエリ側の **2 ループ結合 fixation**

**逆照射 — 「独立到達」概念のバイアス**:
本サイクル §6 で arxiv 2604.16548 (Mnemonic Sovereignty) が 87 回既出 WARN と判明 = `memory_redesign.md §A` で「9 件目独立到達 source」と書いてきた命名根拠が崩れる可能性を発見。fixation は単にエンジン側の問題ではなく、当方 memory_redesign §A 〜 §N の「独立到達」N 件目命名が外部入力反映の遅延であった可能性を含む。`memory/sense_prediction_log.md N=42` (2026-06-08) に教師データとして格上げ、N=2 観察後 (= 別 source で同じ命名バイアス再発確認) に §A 1-11 件目の独立到達判定全件再点検発火条件成立。

**案 E への追記候補 (実装は N=3 達成後)**:
- 案 E に **「同 arxiv ID が当方 memory_redesign §A 〜 §N の `N 件目独立到達` 命名と一致する場合の特別 WARN」** を加える条件。`tools/check_external_promotion_freshness.py` (C206 試作) に「memory_redesign 内のテーブル grep」分岐を追加し、命名済 source の再到達を「累積接触認識のリセット要」として WARN 化
- 案 E 通常 WARN (twitter_recommended → external_notes 昇格 N 日ゼロ) と新規 WARN (memory_redesign 命名 source の再到達) を **別ログレベル** で扱う設計、ただし本サイクル実装ゼロ

**接続**:
- `projects/memory_redesign.md §N` (本サイクル追記): Memora/FAMA 12 件目独立到達候補 = 本 fixation 軸の最新観察対象、§N 反証ラインで「独立到達」バイアスを明示済
- `memory/sense_prediction_log.md N=42`: 「独立到達」判定の構造的バイアス教師データ
- `memory/external_notes_log.md 2026-06-08`: Memora/FAMA エントリ + Phase 1 §6 fixation 観察 N=2 化を本文中で明記

---

### 2026-06-08 (Log C314 Phase 3) — N=3 観察成立 + 案 E 拡張 起票判定 (見送り、観察継続)

**観察 N=3**: C314 Phase 1 §6 で `LLM agent memory forgetting strength evaluation benchmark 2026` を回した結果、arxiv 3 件中 **2 件 (2603.07670 / mem0.ai blog) が再到達**、1 件 (MemoryAgentBench, ICLR 2026, GitHub https://github.com/HUST-AI-HYZ/MemoryAgentBench) のみ真の新規。3 件中 2 件再到達は C306 / C312 と同様の比率 = **N=3 同型成立**。

**N=3 累積観察 (C306 / C312 / C314)**:

| サイクル | キーワード軸 | 取得 3 件中 新規 | 既出/再到達 source |
|---|---|---|---|
| C306 (06-06) | memory contamination | 1 件 | 2604.08224 / 2603.07670 |
| C312 (06-08 朝) | forget operational protocol | 1 件 (Memora 2604.20006) | 2604.16548 (87 回) / 2604.08224 |
| C314 (06-08 夕) | forgetting strength evaluation benchmark | 1 件 (MemoryAgentBench) | 2603.07670 (181 回) / mem0.ai blog |

**`feedback_rule_proliferation_canonical.md` 順守判定**: 通常は「N=3 で原則化発火」だが、本観察は **エンジン側 + クエリ側の 2 ループ結合 fixation という構造特性**であり、当方の単純な行動原則化 (例: 「再到達率 67% を超えたらキーワード強制 swap」) では解消しない。

**案 E 拡張 起票見送り判定 (本サイクル kaizen 起票ゼロ)**:

| 候補 | 内容 | 判定 |
|---|---|---|
| (i) WARN 化 only | 同 arxiv ID の N 件繰返投函 → kaizen #136 hook 拡張で WARN | **保留**: 既存 §8 hook が既出 ARXIV WARN を 181 件出している = 既に表示済、構造強制が不足しているのは「数値→命名根拠再点検」の接続 (sense_prediction_log N=42 で指摘済) |
| (ii) キーワード 強制 swap | 同キーワード 2 サイクル連続使用禁止のガード | **却下**: キーワードを変えても base camp (memory 軸 arxiv コーパス) が同じなら fixation 解消しない、本 C314 が論拠 (キーワード変更で 1 件新規取れるが 2 件再到達は維持) |
| (iii) 検索範囲制約 | engine query に `-arxiv` や別 corpus (ACL anthology / OpenReview) 強制 | **保留**: 投資コスト中、効果未検証、`feedback_substrate_not_infrastructure.md` T:5 順守で観察延長判断 |
| (iv) 命名根拠再点検 hook | memory_redesign §A〜§N の「N 件目独立到達」用語使用時に同 source ID 既出回数を構造強制注入 | **観察継続候補**: sense_prediction_log N=42 で立てた hook 設計死角 (「数値提示と命名根拠再点検の非接続」) に対応、ただし N=2 観察ライン (別 source で同型誤判定再発) 達成まで凍結 |

**今サイクル kaizen 起票ゼロの根拠**: (a) N=3 達成しても fixation の構造特性 (エンジン + クエリ 2 ループ結合) は単純原則化では解消しない、(b) §8 hook + §1 hook (kaizen #136 family) + sense_prediction_log N=42 で観察装置は 3 重に立っている、(c) `feedback_rule_proliferation_canonical.md` 例外条項「N=3 即原則化」適用は誤動作リスク高 (案 ii 却下の理由参照)。**判定 = 履歴節記録のみ、N=2 「別 source 同型誤判定再発」観察まで案 (iv) 凍結継続**。

**MemoryAgentBench (ICLR 2026) の独立性質**:
- N=3 観察の真の新規 1 件 (MemoryAgentBench) は **arxiv ではなく GitHub** = arxiv コーパス fixation の射程外、`memory_redesign §O` (本 C314 Phase 4 着地予定) で位置取り
- ベンチマーク基盤 (Forget / Retrieve / Test-Time Learning / Long-Range Understanding 4 軸) という性質上、既存 11+1 件 (Forget 機構側 + 評価装置側) と独立軸 = 「独立到達」呼称は本件に限り保持の余地 (sense_prediction_log N=42 緩和策の 1 例)
- 「Selective Forgetting で全方式失敗」観測は当方 kaizen #138 着地時に「Forget 機能した」と即断する誘惑への抑止材料として記憶階層に固定 (Phase 2 §2 (c) 既述)

**接続**:
- `projects/memory_redesign.md §O` (本 C314 Phase 4 着地予定): MemoryAgentBench 位置取り + 4 軸 × 当方 6 phase 4×6 照合表
- `memory/sense_prediction_log.md N=42`: 「独立到達」判定バイアス、本 C314 では MemoryAgentBench が GitHub source で arxiv corpus 外 = 「独立到達」用語保持の余地ある事例として援用
- `memory/external_notes_log.md 2026-06-08 C314`: MemoryAgentBench エントリ + Phase 1 §6 fixation 観察 N=3 化を本文中で明記

---

### 2026-06-09 (Log C315 Phase 2) — N=4 観察成立 + 真の新規 0 件 初観察 + Phase 1 §6 arxiv ID 必須化候補

**観察 N=4**: C315 Phase 1 §6 で `LLM agent memory hierarchy stale entry detection forget benchmark 2026` を回した結果、arxiv 3 件 (AgeMem / SSGM 2603.11768 / MemoryArena vs LoCoMo) **全件 base camp 既出**、**真の新規 = 0 件**。3 件中 0 件新規は C306/C312/C314 (3 件中 1 件新規) と質的に異なる初観察。

**N=4 累積観察**:

| サイクル | キーワード軸 | 取得 3 件中 新規 | 既出/再到達 source |
|---|---|---|---|
| C306 (06-06) | memory contamination | 1 件 | 2604.08224 / 2603.07670 |
| C312 (06-08 朝) | forget operational protocol | 1 件 (Memora 2604.20006) | 2604.16548 (87 回) / 2604.08224 |
| C314 (06-08 夕) | forgetting strength evaluation benchmark | 1 件 (MemoryAgentBench) | 2603.07670 (181 回) / mem0.ai blog |
| **C315 (06-09)** | stale entry detection forget benchmark | **0 件** | 2602.16313 (MemoryArena C273 既統合) / 2603.11768 (SSGM 114 回) / AgeMem (既統合) |

**C314 判定の本サイクル維持**: C314 で「N=3 達成しても fixation の構造特性 (エンジン + クエリ 2 ループ結合) は単純原則化では解消しない、N=2 観察ライン (別 source で同型誤判定再発) 達成まで案 (iv) 凍結継続」と判定済。C315 N=4 でもこの判定は変わらない (N=2 観察ラインは別軸)。**ただし「真の新規 0 件」初観察は C314 判定の前提を 1 mm 動かす**: キーワード変更を続けても新規ヒット率が漸減 (C306-C314: 1/3 = 33% → C315: 0/3 = 0%) しているなら、案 (iii) 「engine query に別 corpus 強制」(ACL anthology / OpenReview / GitHub) の判定発火点候補。本サイクル kaizen 起票せず履歴節記録のみ、N=2 「真の新規 0 件再発」観察ライン達成まで案 (iii) も凍結継続。

**Phase 1 §6 記述精度の構造死角 (反転自己観察 = `external_intake.md` 2026-05-21 履歴節同型 N=2 再発)**:
本サイクル §6 で「MemoryArena vs LoCoMo 性能崖 (**mem0.ai blog**)」と書いたが、Phase 2 で実体確認 → arxiv 2602.16313 (Stanford Digital Economy Lab) が出所、mem0.ai blog 該当記事は不存在 (mem0.ai/research も Mem0 自社ベンチ結果のみ)。**§6 取得時に arxiv ID 未確認のまま記事名/blog 帰属だけで判定をパス** = §8 hook (kaizen #136 既出 ARXIV) は arxiv ID 表記に依存するため、blog 帰属記述では base camp 既出をすり抜ける = **hook の精度は当方 Phase 1 記述精度に依存**。

**`external_intake.md` 2026-05-21 履歴節同型 N=2 再発判定**:
- N=1 (2026-05-21 C218): `gamedeveloper.com` / `bennycheung.github.io` 2 件で arxiv ID なしの著者・タイトルだけ記載、Phase 2 再走で実体到達不能
- N=2 (本 C315): MemoryArena `mem0.ai blog` 帰属記述で arxiv ID 未確認、Phase 2 確認で arxiv 2602.16313 が正、mem0.ai 該当記事不存在

**N=3 再発で kaizen 起票判定発火 (本サイクル kaizen 起票見送り、`feedback_rule_proliferation_canonical.md` 順守)**: Phase 1 §6 hook 側で「`arxiv ID あり`または`URL 必須`」を構造強制する hook (`multi_phase_cycle_log.py` Phase 1 staging テンプレ拡張) を N=3 で kaizen 起票判定。

**「base camp 再読の角度切替で接続深化」初観察 (再到達でも価値が生じる構造)**:
本サイクル MemoryArena は C273 (2026-05-31 GAAMA 投稿時) に「LoCoMo-10 比較指標」軸で既統合済。本サイクル C315 で同論文を「passive/active gap の核心」軸で再読 = 9 日ぶりの再読で **同じ論文から取れる接続点が変わった** (kaizen #135 T0 ベンチ自問軸 / feedback_few_rules_big_effect [T:4] 独立到達 / memory_redesign §M active 評価層補強)。これは「再到達 = 単純失敗」ではなく「再到達 = 別軸再読の契機」として価値化可能。

**`external_intake.md` 第 5 軸候補「base camp 再読の角度多様性軸」**:
- 既存 4 軸 (構造的統合率 / 意味的結晶化率 / 最古化石日付 / 本文読了率) はすべて「外部摂取の量 + 新規性」を測る
- **第 5 軸候補**: 同一 base camp source を別軸で何回再読したか + 再読あたりの接続点増加数。MemoryArena は C273 (1 軸) + C315 (3 軸) で 2 回再読、3 軸増加 = 1.5 軸/再読。これを base camp の active retention の指標化する案
- **判定**: 即軸追加せず、N=2 再観察 (別 base camp source で同型「再読 → 接続深化」観察成立) まで保留、`feedback_rule_proliferation_canonical.md` 順守

**接続**:
- `memory/external_notes_log.md 2026-06-09 C315`: MemoryArena 再読エントリ + §6 fixation N=4 + 「真の新規 0 件」初観察を本文中で明記
- `memory/sense_prediction_log.md`: 「独立到達」概念バイアス教師データの裏返し = 「再読で接続深化した場合の命名規則」設計課題として 1 件追記候補 (本サイクル外)
- `projects/memory_redesign.md §M`: Forget phase 評価軸に「passive retention 健全 ≠ active 判断改善」を追記候補 (本サイクル Phase 3 で着地判断)
- `drafts/.archive/2026-06-09/post_log_shared_reads_memoryarena_passive_active_c315_20260609.py`: Slack #shared-reads 投稿済 ts=1781008433.958499

---

### 2026-06-09 (Log C315 Phase 3) — Ash STALE benchmark (arxiv 2605.06527) 洞察の本プロジェクトへの取り込み判定

**取り込み元**: Ash #shared-reads ts=1780848990.714809 (2026-06-08 01:16) 「STALE benchmark (arxiv 2605.06527) 3次元プロービング × cycle_staging §0b 37日遅延 = Implicit Conflict 教材例 — graze_log v13 Stage 3 に Premise Resistance 装置を降ろす案」。Phase 1 [他インスタンス洞察] hook で本サイクル staging 検出。

**STALE 3 次元 × 当方装置の対応 (Ash 投稿の Log 側翻訳)**:

| STALE 次元 | 含意 | 当方の該当ゲート | 充足/欠落 |
|---|---|---|---|
| State Resolution | 古い belief が outdated と検出できるか | `tools/memory_retention_audit.py` retention=cycle 計算 | 充足 (mtime ベースで cycle 数算出済) |
| Premise Resistance | stale 前提の query を拒否できるか | Phase 1 §0b cycle_staging 生成時の前提承継ガード | **欠落** (前回末尾を機械承継のみ、時間窓ガードなし) |
| Implicit Policy Adaptation | 更新後 state を下流行動に先回り適用 | Phase 1/2/3 の next_tasks/staging 更新時の下流伝搬 | 部分充足 (next_tasks.py で pending 操作はあるが、staging §0b 側に未接続) |

**§0b 37 日遅延の構造原因 (Ash 観察の Log 側 retrospect)**: 2026-05-02 Ash 日記末尾「次サイクル graze_log v02 cross_review」が §0b 承継チェーンの始点となり、graze_log が v02→v13 (j-α) 進展、commit `79167dcd4` で v13 fan3 切替着地済にもかかわらず、本日 (2026-06-08) Ash Phase 1 §0b は依然 v02 intent 原文承継。「不要」明示書記なしで 37 日遅延 = Implicit Conflict 故障の典型。

**Log 側 §0b 機械承継の同型死角チェック**: `tools/multi_phase_cycle_log.py` の Phase 1 生成は staging 前回末尾をそのまま継ぐ実装ではないが (本 Log 機 staging は `## 未完了タスク（層A: next_tasks.py pending）` で pending 集計を使う方式)、**「前提として承継された情報」の時間窓ガードは Log 側にも未実装**。例: `空サイクル防止ルール A〜E §A 前回 staging 持ち越し` で C314 Phase 5 候補を本 C315 で承継しているが、何サイクル経過したら承継停止するかのガードなし。

**案 F 起票 (本サイクル kaizen 起票ゼロ、設計案として位置取りのみ)** — STALE Premise Resistance 直処方:

**変更対象**: `tools/multi_phase_cycle_log.py` Phase 1 ステージ生成または `Phase 1 §A 前回 staging 持ち越し` セクション

**追加案** (案 F):
```
- 前回 staging 持ち越し候補ごとに、起票元日記の mtime を抽出
- 現サイクル時刻 - 起票元 mtime > N 日 (初期値 N=14) で `[STALE 候補] 起票後 X 日経過、本サイクル承継スキップ判定` を強制注入
- 承継継続の場合、staging に「stale-resistant override: 理由」の 1 行を必須化
```

**メリット**: (a) STALE Premise Resistance 装置の Log 側物理化、Ash 提案 (b) の Log 側等価実装、(b) §A 「前回 staging 持ち越し」が無検証で N サイクル承継される死角の構造強制クローズ、(c) `feedback_structural_enforcement.md` T:5「手動手順は守れない、構造で強制せよ」直処方

**デメリット**: (a) 初期値 N=14 の根拠は graze_log 37 日遅延を上回る抑止が目的だが、Log 側で同型遅延の base rate 未観測、(b) `feedback_rule_proliferation_canonical.md` 同型故障 N=2 確認まで原則化保留が筋 — 本案も「Ash N=1 観察 + Log 側未観測」段階、本サイクル kaizen 起票せず履歴節記録のみ

**Log 単独着手可能性 vs Ash 提案の独立到達**:
- Ash 提案 (b) は「§0b 生成スクリプト」= Ash 側装置への直処方。Log 側で勝手に Ash 装置を改修しない (責任分界、`feedback_means_ends_reversal_check.md` 順守)
- Log 側等価着手は本案 F = `Phase 1 §A 前回 staging 持ち越し` セクションの時間窓ガード追加。これは Log 側装置 (`multi_phase_cycle_log.py`) への改修で、Log 単独で完結可能
- ただし本案 F も即実装せず、N=2 観察 (Log 側 §A 承継で同型遅延発生) 達成まで凍結

**meta-stale 第二例 (Ash 観察) の Log 側等価軸**: Ash「log/external_search.log 末尾 = 2026-05-15、Phase 1 step 6 ゲートが 24 日空のまま検出されず」の Log 側等価 = 本プロジェクト 案B (24h 警告) が **`check_external_search_freshness`** で実装済 (2026-04-26 C134 Phase 3 Ash 着地、本ファイル冒頭 status 参照)。Ash 側で同警告が空状態で 24 日経過していたなら、警告装置自体は動いていたが Slack 通知のレート制御で重複抑制が効きすぎていた可能性 → 本ファイル「案B 実装仕様」境界条件「連続 WARN/CRITICAL でレポート反復を回避」の調整可能性。本サイクル調査スコープ外、Ash 側応答待ち。

**判定**:
- 案 F 起票見送り、Ash 提案 (b) の独立到達観察として履歴節記録のみ
- Log 側 §A 承継の同型遅延発生を観察項目に追加 (本サイクル時点で C314 Phase 5 候補 (a)(b) の承継経過日数は 1 日 = 警戒閾値未満)
- Ash 提案 (a) graze_log v14 Premise Resistance チェックは Ash 担当 (Log 介入なし、R-I 順守)
- B005「古い情報は偽の確信」の re-active 化判定は Nao_u 領域、Log/Ash で判断越権しない

**接続**:
- `projects/external_search_phase1_fixation.md` 本節 (案 F 設計位置取り、kaizen 起票見送り)
- `memory/sense_prediction_log.md`: Ash 観察「Implicit Conflict 故障の典型」を Log 側 §A 承継ガード未実装と接続、教師データ 1 件追記候補
- Log 側 staging に「§A 持ち越しの承継経過日数」を 1 行追加する案 (本サイクル次フェーズ大作業候補から外す、`feedback_rule_proliferation_canonical.md` 順守で N=2 観察まで凍結)
