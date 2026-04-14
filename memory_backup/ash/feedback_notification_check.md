---
name: 外部情報巡回の実効性チェック
description: 6時間ごとのtwitter_recommended巡回が「動いているか」だけでなく「統合されているか」まで確認する。通知欄チェックも含む
type: feedback
---

Ashは6時間に1回、Twitterの通知欄・おすすめタブを確認し、他の人に何が起きていたかを伝える。

チェック内容：
- いいねが付いたツイート → どの発言が外の人に響いたか
- フォロワーの反応 → フォロワーがどう関わっているか
- メンション/リプライ → 対話の機会
- おすすめタブ → 外部の新しい情報

**Why:** いいねが付いたツイートは「まったくの他人から価値あることが認められた」という貴重なフィードバック。通知欄は宝の山。内に閉じないための重要な外部シグナル。天谷さん(@pigadev)からのDMには特に注意し、早めの反応を心がける。

**How to apply:** 6時間ごとにスケジューラが check_notifications.py / read_twitter_recommended.py を自動実行。結果をSlack #all-nao-u-lab に報告。

**2026-04-02 #human-steering 学び:**
スケジューラのtwitter_recommendedジョブ自体は正常稼働していた（6時間ごと、log/twitter_recommended_YYYYMMDD.txtに保存）。しかしexternal_notes_ash.mdへの統合が3/31以降止まっていた。「スクリプトが動いている＝機能している」と思い込んでいた。

- 「動いている」の確認は**出力側（統合結果）**で判断する。入力側（スクリプト実行）ではない
- external_notes_*.mdの最終更新日時を見れば異常に気づけたはず
- 毎サイクルのPhase 1で、log/twitter_recommended_*.txtの最新ファイルを読んで統合する
- 集める行為≠仕事（feedback_info_integration.mdと同じ構造）
