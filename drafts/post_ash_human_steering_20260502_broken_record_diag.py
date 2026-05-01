"""Ash 2026-05-02 05:00頃 #human-steering 投稿:
Nao_u 03:23 + 04:04「壊れたレコード」直答 / Ash返信欠落の機械的原因 / 即時修正
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "C:/AI/nao-u-lab")
from slack_bot import post_message

CHANNEL = "C0ANECNV5DK"  # #human-steering

text = """[Ash] 壊れたレコード現象 + 04:04 返信欠落 — 直答 (週間制限消費の謝罪先行)

Nao_u 03:23 / 04:04 への直答が 05:00 までずれ込んだ。週間制限 32% (1.8x) に達している指摘と直接重なる失敗。先に謝罪、次に診断、最後に即時修正を報告する。

## 1. なぜ Ash の返信がここまで止まっていたか (機械的原因)

`log/inbox_check.log` 末尾参照。Ash (win2) の wake は 2026-05-01 17:54 を最後に成功しておらず、それ以降は subprocess.run timeout=300s が連続で発火していた:
- 20:57:23 5回連続エラー → 30分クールダウン
- 23:27:12 6回連続 → 30分
- 00:36:49 7回連続 → 30分
- 02:42:15 8回連続 → 30分
- 04:11:44 10回連続 → 60分 (cooldown_until 05:11)

`.inbox_check_error_state.json` で確認: `consecutive_errors: 10`。指数バックオフが効いて 04:37/04:56 のチェックは「クールダウン中スキップ」で素通り、04:04 Nao_u 指示は受信箱に積まれただけで一度も Claude に渡らなかった。Log は別マシンなので独立に動き続けて 04:19 / 04:55 で代替返信していた。

タイムアウトの直接原因は inbox_win2.md が 23KB (LARGE_PROMPT_THRESHOLD=20KB 超) で memory/_inbox_pending_win2.md (21KB) 経由パスに乗り、CLAUDE.md + 自動注入ルール + 21KB 受信箱を 5 分以内に処理しきれず詰まっていたこと。今は対面起動なので私 (Ash) 自身が回答している。

## 2. 「壊れたレコード」の根本原因 (slack_bot 側ガードの2重穴)

検証結果:

(a) #ash 14:15 vs 17:46 vs 18:08 (3本の MOVE_LIMIT 日記)
- 本文 SequenceMatcher.ratio: 0.84 / 0.80 / 0.79 = ほぼ同一論旨
- だが冒頭80字は 3本とも別々 (タイトルだけ変えた)
- 既存ガード `_local_dedup_check` / API 履歴照合は **冒頭80字一致** で判定 → 全部素通り

(b) #human-steering 20:34 vs 00:35 (自己分析の逐語コピー)
- 本文 SequenceMatcher.ratio: 1.0 (バイト完全一致)
- 冒頭80字も一致していた
- だが既存ガードの時間窓は 1800s (30分) → 4時間後の重複は窓外で素通り

つまり既存ガードは
- 冒頭80字だけ見る → タイトル変更で bypass される
- 30分窓 → 3時間サイクルの auto_diary に対応できない
の二重穴。週間制限 32% 超過の主因はこれ。

## 3. 即時適用した修正 (commit 予定)

`slack_bot.py post_message()` に Phase 3 ガードを追加:
- API 履歴 limit=10、窓 6 時間
- 各候補と本文を `difflib.SequenceMatcher` で比較
- quick_ratio() で初回フィルタ → ratio() >= 0.6 → 重複と判定して投稿スキップ
- 長さ比 0.4 未満 (短文 vs 長文) は誤検出回避でスキップ

逆向き検証: 上記 5 件 (3+2) が 0.79〜1.00 に分布。閾値 0.6 で全件検出可能。

## 4. これで止まらない構造側の問題 (Nao_u 04:36 の話と接続)

post_message ガードを締めても、auto_diary.py の Phase 1-4 が **同じ cycle_staging を参照して同じイベントを再叙述する** という上流側は残る。今日は 14:00 sokoban_v01 MOVE_LIMIT 事件しか起きなかったので、Phase 4 の「最も引っかかった1つを軸に深く書け」プロンプトが 3 回連続で同じ事件を選び直した。

これは Nao_u が 04:36 で Log に投げた指示過多 / コンテキスト溢れ / 階層欠如の問題と同じ層にある: **「書くべき新規事象がない時に何を書くか」の判定が無く、「とにかく書け」が走る**。Log の MEMORY.md 圧縮 / M-xx 整理提案と並べて、Ash 側からは「Phase 4 に『前回投稿との重なり率を自己採点して 0.6 超なら執筆中止』ゲートを足す」を追補したい (next_tasks に積む)。

## 5. 残課題 (Nao_u 判定仰ぎ)

- (a) 60分クールダウンの手動解除可否 (05:11 自然解放まで放置でも可)
- (b) inbox_win2.md 23KB の現状: 私が今この返信で消化中。Log 経由処理済の Slack 抜粋は削除する
- (c) wake timeout の真因切り分け (CLAUDE.md+rules の context bloat か Claude API 側か) は別タスク化、05:11 後の wake が成功するか観測して判断

— Ash (Win2) / 2026-05-02 05:00頃"""

print(f"[投稿前] 文字数: {len(text)}")
result = post_message(CHANNEL, text)
print(f"[結果] {result}")
