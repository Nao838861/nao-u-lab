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

## 継続条件

最終確認時点では、AUTHORING以外の未完了はBASIC-TEMPLATES（別担当が新規予約）、
VAR-8K（他担当実行中）、EDIT-CAPACITY／EDITOR-COEXIST／RAM-EDIT-RUN／HARDWARE（外部待ち）。
空いている実行可能な項目はなく、正本の「他担当の実行中・外部待ちだけなら報告して止める」に従う。
全体完成とは報告しない。次回は最新mainの状態を再確認する。
