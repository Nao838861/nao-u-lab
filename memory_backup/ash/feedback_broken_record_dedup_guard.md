---
name: 壊れたレコード現象 / dedup ガードの2重穴
description: slack_bot.post_message の prefix80一致 + 30分窓ガードでは「タイトルだけ変えた再投稿」「数時間後の逐語コピー」を素通り。Phase 3 で本文類似度 (SequenceMatcher.ratio>=0.6 / 6h窓) を追加した
type: feedback
originSessionId: 66f39a93-a5ce-4c3c-8026-42f026ac7bf2
---
## ルール
長文 (>=500字) を Slack に投稿する経路は **必ず slack_bot.post_message() を経由する**。直接 chat.postMessage を呼ばない。post_message には 3 層ガードがある:
1. `_local_dedup_check` — 冒頭80字ハッシュ一致 / 30分窓 (race condition 対策)
2. API 履歴 limit=3 / 冒頭80字一致 / 30分窓 (別セッション対策)
3. **API 履歴 limit=10 / 本文 SequenceMatcher.ratio >= 0.6 / 6時間窓** (broken-record 対策、2026-05-02 追加)

## Why
2026-05-02 03:23 Nao_u #human-steering 指摘: Ash が同じ内容の長文を繰り返し投稿していた。週間制限 17.5%→32% (1.8x) 消費過剰の主因。実際の検出データ:

(a) #ash 14:15 / 17:46 / 18:08 (3本の MOVE_LIMIT 日記)
- 本文 SequenceMatcher.ratio: 0.84 / 0.80 / 0.79 (≒同一論旨、タイトルだけ変更)
- 既存ガードは冒頭80字一致で判定 → タイトル変更で全部 bypass

(b) #human-steering 20:34 / 00:35 (自己分析の逐語コピー)
- 本文 ratio: 1.0 (バイト完全一致)
- 既存ガードの時間窓 1800s (30分) → 4時間後の重複は窓外で素通り

つまり既存ガードは「冒頭80字だけ見る」「30分窓」の2重穴。

## How to apply
- post_message を経由する限り自動で発火するので「明示的に何かする」必要はない
- 投稿が `{'ok': True, 'skipped': True, 'message': 'Broken-record post detected ...'}` で返ってきたら **再投稿しない / 別文面で書き直さない**。それが broken record の発火条件
- ガード自体を信用せず、書く前に「これは前回 4-6 時間以内の自分の投稿と同じ事象を再叙述していないか」を 1 行自問する (上流側の節約)
- 自分のチャンネル日記 (#ash) は auto_diary.py の Phase 1-3 が同じ cycle_staging を見るため Phase 4 が同じ事象を再叙述しやすい。Phase 4 投稿前に「直近1時間の同事象重複率」を自己採点する skill を別途検討 (next_tasks 候補)
- post-time ガードはあくまで Slack を汚さない最終防衛線。**Claude API トークンは生成時点で消費済み**なので、上流の「書くべきか」判定が本丸

実装: slack_bot.py `_content_similarity_check()` (commit e4931697)

## 追補 2026-05-04 02:36 Nao_u #human-steering: 上流側着手 (下流逃避自覚)
**長期再発の核**: 下流ガード (`_CONTENT_DEDUP_WINDOW_SEC`, ratio threshold) は1行で書き換えられ即時計測可能、上流 (Phase 4 LLM が同 topic を選ぶ構造) は prompt 改修 + 24h 観測が必要で着手感が重い。**commit message に「本丸は上流」「next: 上流側」と書くこと自体が、上流に手を付けない免罪符として機能していた**。書く=実行と取り違える癖が M-42 撤回事案 (禁止ルール型 kaizen 自分で書きながら6件連続違反) と同形でインフラ bug fix 側に再現。

**上流処方 (auto_diary.py)**:
- (A) `get_recent_diary_topics()`: limit=5→30、>=500字フィルタ、ts cutoff 24h、見出し行抽出。旧実装は health_check 短文ノイズを拾い Phase 4 LLM は実質「自分が直近何を書いたか」を見えていなかった
- (B) `phase_diary()` prompt: 冒頭に「staging §直近の#ash投稿 を先に読め / 主題が同 topic なら書かない / 代替 (a)同事件の差分+続報明示 (b)別 topic (c)スキップ報告 / どれか冒頭3行で宣言」セクション追加

**観測ゲート**: 次 auto_diary cycle で §直近の#ash投稿 が長文日記2本だけになるか + Phase 4 出力冒頭に divergence 宣言が出るか + 3-5 cycle で skipped:True が止まるか。止まらなければ Phase 4 出力後の self-check ループに降りる必要あり。

**自分への教訓**: 「対処したはずの問題が長期再発」の構造的兆候 = commit message で正解を書きながら下流の軽い側ばかり 2 回以上連続 commit。同じ宣言を 2 回 commit message に書いた時点で *次は上流に降りる* を強制ルール化 (本ファイル末尾参照)。
