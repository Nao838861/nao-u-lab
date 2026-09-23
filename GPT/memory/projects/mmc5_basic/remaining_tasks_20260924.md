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

次はRAM-EDIT-RUNを`3a0e488`で予約・push済み。EDIT-CAPACITY完了で外部待ちが解けたため、
ユーザーの継続指示に従い差分／再RUN高速化を続行する。まだ実装していない。
現状はCOMPACT_SYMBOLSでinc_snapshot／inc_tryを無効化、編集でcompiler管理表を破棄する。
通常構成の増分実装は`runtime/wide_incremental.c`、全RAM版は保存保持と管理表の共存が課題。
VAR-8Kは他担当の予約が残る。旧ブランチ不在や時間経過だけで停止と決めず、未解除。

EDITOR-COEXISTについて現行512 KiB CHR-ROMを維持するか本体CHR-RAM編集まで対応するか、
非同期質問を提示済み。まだ回答は得ていない。物理実機HARDWAREも外部待ちのまま。
