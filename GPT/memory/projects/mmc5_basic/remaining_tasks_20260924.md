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

## 最新状態（上記の途中経過を上書き）

追加指示：

> 未解決の問題を拾って、検討して、解決して、解決したら残りの未解決がなくなるまでそれを繰り貸して。

EDIT-CAPACITYは`5d75fab`で完了・mainへpush。親統合の途中で止めない。
AUTHORINGは引き続き対象外。作業場所は`D:/HomeBrew/FamiBASIC_Turbo_remaining`、
ブランチ`codex/remaining-tasks-20260924`。pushは`git push origin HEAD:main`。

- 公開CLIの`--persistent-source`、初回`.initial.sav`、既存保存を上書きしない製品起動、
  冷起動→READY、RETURN／NEW／選択ジャーナルのRUN／SOURCE FREEを統合。
- 名前・行表・生成コード・WORKBANK／RAMPOKEに保存保護を追加。
- 最新ゲームは生成コード53,576 B、保存33,923 B、残量40 B。
  初回RUN約27.840秒、編集保存のRUN約28.655秒。両方ソースROMを消して保持付きで測定。
  素材名索引ROM `$CF/$DF` はソースではないので消去しない。
- 全編で停止する原因は`array_rom_bank=$07D5`とゲーム変数A2の衝突。
  `$0657`へ移し、BANKなしのRUNでも初期化。NMI／IRQ付き回帰試験も成功。
- 内蔵Mesenで実キー編集→RUN→編集復帰、別プロセス冷起動を確認。
  タイトル受付判定はSCAGE>=30だけだとコンパイラ記述子の残値を誤認する。
  SCSTATE=1・SCAGE=30・SCOLD=0を待つ。
- Mesen全編は道中7,584更新・ボス1,149更新・リザルト・再挑戦成功。
  約608万画素、地形・演出の照合不一致0、ソース保持。道中遅延322→320、ボス4→2。
  遅延0ではない。KERNEL17 Bを含めROM最低16 B基準を維持。
- 32 KiB境界・中断の原子的復旧、未完成行の保存→冷起動→エラー→修正も検証。

一次記録は`docs/ram_source_compact_symbols_20260924.md`と
`docs/benchmarks/persistent_product_20260924/`。製品ROM等は`.tmp/persistent_full_verified/`、
内蔵Mesen証跡は`.tmp/persistent_mesen_verified/`。生成物をgitへ入れない。

RAM-EDIT-RUNも`5a1b4c4`で完了・mainへpush済み。COMPACT_SYMBOLSでinc_snapshot／inc_tryを有効化。
RAM5の`$A500..A7FF`へ最大76件の記述子差分を退避し、RAM4のゲーム／LIST／編集使用後に復元。
元の行領域に収まる変更はその場で生成し、最大8 Bのヘッダはみ出しを復元する。
追加は空きがある場合に差分化。削除・成長・構造変更・退避不能・NEWなどは全体生成へ戻す。
確定ソース／manifest／ジャーナルを変更せず、衝突時は保護する。
最新ゲームのMesen実キー編集後RUNは2,535,090 cycles、約1.416秒。初回は約28.160秒。
編集後の全編7,584更新・ボス1,237更新・リザルト・再挑戦、約619万画素等の不一致ゼロ。
道中遅延324／ボス2は残る。ROM最低16 B以上、保存の配置残40 Bも維持。
自動試験41件、内蔵Mesenの実キー往復と別プロセス冷起動も成功。
一次記録は`docs/ram_edit_run_20260924.md`、証跡は`docs/benchmarks/ram_edit_run_20260924/`。
製品ビルド`.tmp/persistent_incremental_v2/`、内蔵Mesen`.tmp/persistent_incremental_console/`。
FamiBASICの作業ツリーはcleanでmainと同期済み。

2026-09-24の追加回答で、EDITOR-COEXISTも完了。ユーザーの選択原文は
「現行CHR-ROMを維持し、素材はPCで編集する」。本体素材編集を今回の要件から外し、
README・決定文書・STUDIO併用拒否時のPC編集案内へ反映した。3入口の拒否とROM未生成、
Python構文・差分検査を確認し、`33ded7c`をmainへpush。CHR-RAM編集の実装完了ではない。

VAR-8K担当の稼働状況と実機機材について質問したところ、ユーザーは
「それはこちらでやるので考えなくていい」と回答。両件をユーザー側の担当として
タスクリストへ反映済み。次回、停止担当の推定や実機機材の再質問を繰り返さない。
残る未解決はAUTHORING-E2E（別スレッド）／VAR-8K（ユーザー側）／HARDWARE（ユーザー側）の3件。
AUTHORINGは引き続き明示的な対象外。こちらで進める未解決項目はなく、作業ツリーはclean。
