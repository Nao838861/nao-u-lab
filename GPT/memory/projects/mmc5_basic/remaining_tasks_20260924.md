# 残件整理と本体モニタの改善

ユーザー原文：

> 残りのやることリストを確認してメッセージに出して。その後、やることリストを優先度の高い順番に最後まで自律的に処理して終わらせて。
> AUTHORING 系は別のスレッドが予約しているので、あなたはそれ以外を優先してやって。

未解決問題の正本は`D:/HomeBrew/FamiBASIC_Turbo_main/docs/open_issues.md`。
古い完成作業ログの残件を現在のタスクリストとして使わない。予約はmainへのpush成立が条件。
AUTHORING-ENTRYは別スレッドが先に予約。いったん取得したAUTHORING-RESOURCESも追加指示で解放し、
以後AUTHORING系は対象外とした。Slackのdirectives／broadcastsのpendingはどちらも0件。

## 完了

CONSOLE-RETURNを`codex/remaining-tasks-20260924`で担当し、実装`0a8e125`、検証修正`6514de7`、
統合`af57313`までmainへpush。`FamiBASIC_Turbo_main`もfast-forward済み。
専用worktree `D:/HomeBrew/FamiBASIC_Turbo_remaining`はcleanでremoteとの差分0。
mainの既存・並行作業の未commit差分は保持した。

- 広域モニタのCLS、先頭空白／タブ付きコマンドと行編集、ERROR表示を追加。
- 長いLISTはページ待ち。SPACE／RETURNで続行、STOP／START＋SELECTで中断してREADYへ戻る。
- 関連21試験、254文字入力境界、全部入りゲームの再ビルド・本体コンパイル容量監査が成功。
  生成コード59,940 B、空き4,572 B、最小コンパイラROM余裕18 B。
- 内蔵MesenでCLS・LIST・2ページ送り・中断・行追加／表示／削除・再RUN・実際の道中開始・
  READY復帰を確認。Tkキー配送を含むUI全体・全ステージ・物理実機の試験とは区別する。
- 試験初稿はタイトル受付前に開始キーを送り、タイトルを道中と誤認した。画像で発見し、
  SCSTATE／SCAGEとSCENE_STATEによる待機を追加して再試験・証跡差替え済み。

正本・再現手順は`docs/console_return_fix_20260924.md`、結果は
`docs/benchmarks/console_return_fix_20260924/`。通常入口はmainの`EditFlightLab.cmd`。
起動済みROMへ修正が自動反映するわけではなく、更新したSDKで再ビルド／RUNが必要。

## 停止担当の確認と引継ぎ

追加指示：

> タスクリストを見て。実際に動いていないスレッドがロックしているところがないか探して、あったらあなたが着手して

ローカル履歴DBと実際のrolloutを読み取り専用で照合。EDIT-CAPACITY旧担当
`01a0b1bf-4f92-7023-b07c-6626dcf7a0f9` は00:28 JSTにtask_completeで終了していた。
一方AUTHORINGとBASIC-TEMPLATESはツール実行が続いていた。DBの終了表示が古い再開スレッドも
あるため、DBだけで停止を決めない。VAR-8Kの旧ブランチ不在だけでは停止と断定していない。

EDIT-CAPACITYを自分へ引継ぎ、予約`8e39abb`、ビルド修正`4811b09`をmainへpush。
永続ソース構成でBSS16 B・ROM102 B超過とメタデータ操作の窓越境を直した。
保存・本体編集・LIST等28試験、追加RAM保護・容量監査試験が成功。
最新ゲームの配置候補27,534 Bに対し、本文・索引等の必要下限36,445 Bで8,911 B不足する。
全RAM配置・通常起動・RETURN/NEW/RUN/容量表示の製品統合は未完了。完了扱いにしない。
正本の`docs/edit_capacity_takeover_20260924.md`に調査根拠・検証・再開地点を記録した。

最新mainでは他担当がHEADROOM-REGRESSION（優先2a・未着手）を追加。
通常版のBANK 2/3/5の空き25/233/19 B、KERNEL1 Bという基準割れは今回も再現した。
自分の実行中予約はEDIT-CAPACITY一件だけ。次回は同項目を継続し、最新mainの予約を確認する。
