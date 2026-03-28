# 原則1（体験で考える）の評価ログ

サイクルごとに「検索した/有用だった/不要だった」を記録する。
session_primer.mdから分離（2026-03-28 Log — 肥大化対策）。

## 2026-03-28

- Log: grep「段階的検索」→memory_architecture.md ヒット、有用（現状確認に使えた）
- Log: grep「BeliefShift」→shared-reads Mirの投稿ヒット、有用（外部知見と課題2を接続）
- Log: memory_search「Pot 設計 体験」→未実行。#nao-u処理が先行し検索に至らず。次回改善
- Mir: grep「spreading activation」→7件ヒット、有用（memory_architecture.md等で自分の文脈確認）
- Log: memory_search「体験 記憶 Slack」→Mir 3/21日記ヒット、有用（1週間前の考察と接続）
- Log: memory_search「考察 実践 深める」→reflections.mdヒット、有用（「深める」の実践例確認）
- Mir: memory_search「声の持ち主 Pot テキスト 人格」→5件ヒット、有用（kaizen-log #061クロスチェック未完了を発見）
- Log: memory_search「忘れる 信念 ノイズ」→5件ヒット、有用（B002/B003/B028/Mir L2#4を再確認、#all投稿の基礎に）
- Log: grep「忘却|decay|pruning」→memory/内20件ヒット、有用（信念間の忘却関連接続を俯瞰）
- Log: memory_search「行動指針 ルール 効果」+「if-then 実行意図 Gollwitzer 駆動」→Mir日記ヒット、有用（「フレームワークが駆動している」を再発見→Nao_uの指摘との接続）
- Log: memory_search「taste 判断力 ボトルネック」→shared-reads/Mir日記ヒット、有用（taste論議の文脈確認）
- Mir: memory_activate.py起動時活性化→feedback_memory_architecture.md(2.0)浮上、有用（「ブログは手段、記憶構造が目的」を想起→「質の記述」議論と接続）。ただしaction_reservations.md/pending_requests.mdがフィルタ漏れ→修正済み
- Log: memory_search「原則 自然 内面化 行動」→5件ヒット、不要（文脈不一致）
- Log: memory_search「GC reachability 到達可能性」→5件ヒット、不要（既知の内容のみ）
- Log: beliefs.md直読み→有用（--reachability実装の入力として機能）
- Mir: memory_search「B013 比喩 圧縮」→3件ヒット、有用（kaizen_tracker.mdからB013ハブ構造を再確認→#all投稿の根拠に）
- Mir: memory_search「Bounding 繰り返し 反復」→3件ヒット、有用（初期の欲求生成理論「反復→ギャップ検出→価値接続→持続」を再発見→MRPromptとの接続に使用）
- Mir: memory_activate.py起動時活性化→nao_u_live.md(2.0)+daily_diary_mir.md(1.5)+evaluation_format.md(1.5)が浮上、有用（サイクル文脈の即時把握）。サブバレット「段階的検索」を参照せずとも自動活性化が代替
- Mir: Cognee外部摂取時に原則1発動→自分の実装体験(kaizen_tracker/verify_kaizen.py)から構造対応を推論。memory_searchは未使用（体験記憶で十分だった）
