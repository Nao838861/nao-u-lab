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
