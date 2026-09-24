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

VAR-8Kについての最新指示は「最終更新から数時間以上たっていたら止まっているとみなして引き継いで進めて」。
先の「それはこちらでやるので考えなくていい」より、この追加指示を優先した。
専用設計の最終更新9/23 23:04、配列実装19:04から確認時9/24 08:52まで約10時間以上経過していたため、
`6a5b67c`で引継ぎ予約をmainへpush。AUTHORINGの除外とHARDWAREのユーザー担当は維持する。

VAR-8Kも`3b01344`で完了・mainへpush済み。

- 永続構成の分岐修正表をRAM4の682件→RAM7の512件へ並べ替え、PCで最大件数を実測。
  圧縮ブロックが一つの空きに入る時は既存の直接読出し形式を使い、余分な5 Bヘッダを省く。
  最新ゲームはRAM7上部へ確定ソースを移してRAM15を空け、連続8,191 Bを実行時配列に使える。
  修正表最大956件、ソース保存33,808 B、配置残31 B。初期の一次＋二段目容量は10,239 B。
- 実際の保護区間から最長の空きを選ぶため、旧保存や別ソースでは容量が減る。既存保存は上書きしない。
  RAM15を配列が使った後は次回RUNで行索引を再構築する。配列が使わない通常ゲームは差分RUNを維持。
  修正表の成長、長い差分比較キャッシュがソースへ衝突する場合も、書き込む前に拒否・全体生成へ戻す。
- 256以上・変数のBYTE配列添字で起きる既存のROM復帰先不具合も修正。
  コード出力の保護チェックを共通ROMへ置き、OPTIMIZERの呼出元を別バンクへ変えない。
- 関連36試験、非圧縮NEW最大配列・冷起動、最新ゲームの最大配列試験版で元ソースROM消去後の
  編集・末尾94・LIST・冷起動再RUNが成功。元のゲーム本編とは試験を分けて記録した。
- Mesen製品全編は道中7,584・ボス1,153更新、リザルト・再挑戦、6,085,560画素等の不一致ゼロ。
  初回約27.211秒、差分約1.416秒。道中遅延320／ボス2は残る。
  内蔵Mesenの実キー編集・復帰・別プロセス冷起動も成功。ROM最小はKERNEL17 B。
- 検証PCでld65内部エラー、Pythonの型破損、PowerShellアクセス違反が散発した。
  自分の検証プロセスだけProcessorAffinity=1にして関連36試験を完走した。
  製品コードへ再試行を追加して隠してはいない。PC全体の原因診断・設定変更はしていない。

一次記録は`docs/var_phase_20260924.md`と`docs/benchmarks/var_phase_20260924/`。
製品ビルド`.tmp/var_phase_game_v4/`、最大配列試験版`.tmp/var_maximum_game/`、
内蔵Mesen`.tmp/var_phase_console/`。FamiBASIC worktreeは`D:/HomeBrew/FamiBASIC_Turbo_remaining`。
この時点ではAUTHORING-E2E（別スレッド）とHARDWARE（ユーザー側）が残っていた。以下の追加作業で更新。

2026-09-24、AUTHORING-E2Eへの「進めて」を受け、以前のAUTHORING除外をこの項目について上書きして引継ぎ。
空からPC制作・保存・フォルダ移動した同一ROMを、内蔵Mesenの実キーRUN・停止・BASIC編集・再RUN・別プロセス冷起動まで通した。
`800 POKE 1792,39`の確定後は38から39へ変わり、冷起動LISTとRUNでも39を保持。初期保存で既存保存を上書きしない。
独立Mesenと内蔵コアの初回・編集後・冷起動後は各61,440画素すべて一致、PC原本の全ファイルハッシュ不変。
別スレッドのSPRITE-PATTERN-UI完了変更を統合し、描画を新CHR編集UIの実マウスイベントへ追従して全経路を再試験した。
最終証跡は`.tmp/authoring_e2e_integrated_v2/`、ROM SHA-256は`c453959dbd32a2e016380df6bbdcb2def7ac3a65ecbed508cda7c35b780de1ac`。
全入りゲーム再ビルド・本体コンパイル容量監査も合格、生成コード62,166 B、コード最小空き260 B、ROM最小19 B。
一次記録は`docs/authoring_e2e_20260924.md`と`docs/benchmarks/authoring_e2e_20260924/`。
実装・証跡は`15968d5`、新UI統合再検証は`8820d30`、予約更新とのマージ後`373e08d`をmainへpush済み。作業ツリーclean。
本体はBASIC編集、素材はPCで編集するCHR-ROM方針を維持。PCソースへの自動逆同期と物理MMC5試験は今回の達成範囲ではない。
この時点の残件はCHR-GRID-NAMES（別スレッドが現在実行中）、LD65-HOST-CAUSE（散発的なホスト障害の根本原因未特定）、HARDWARE（ユーザー担当）。
CPU 0へ自分の検証プロセスのみ固定して試験を実行したが、これをPC障害の原因特定・解消とは扱わない。

「残件をすすめて」を受け、最新mainでCHR-GRID-NAMESの完了を確認し、LD65-HOST-CAUSEを`bc9e228`で予約。
固定入力調査ツール`tools/probe_ld65_host.py`を追加した。コピーした入力のハッシュを前後照合し、
再試行なしでCPU affinity別の終了コード・診断・ROMハッシュを記録。失敗や不一致は非ゼロ終了。
AUTHORING作品120リンク、全入り永続構成の全32論理CPU別等495リンクは全成功、それぞれ出力一致。
現行全入りゲームもCPU制限なし・回復処理を通さない`compile_project`を別プロセスで20回実行し、全成功・同一ROM。
既存BuildService・CHR編集20試験、容量監査も成功。probeの不正入力2件と正常入力4件で終了コードを検証。
これらは障害の根本解消を証明しない。Windowsには当日もPython・Git・cc65・.NETの異常終了がある。
BIOS 1.14/2022-11-03、CPU Update Revision 0x10Eを再確認。公式Intelの推奨は0x12F以降だが、CPU故障と断定しない。
BIOS更新・再起動・オフライン診断は実施せず、強制CPU固定や追加の再試行も製品へ導入しない。
LD65-HOST-CAUSEは再発条件またはPC環境の点検待ちとして外部待ちへ変更。修正完了ではない。
一次記録`docs/ld65_host_investigation_20260924.md`、証跡`docs/benchmarks/ld65_host_20260924/`。
変更`38ed451`、別スレッドのBG一覧改善完了を統合した`79eb5fc`をmainへpush済み、作業ツリーclean。
正本の未着手・実行中はゼロ。残るのはLD65-HOST-CAUSEとユーザー担当HARDWAREの外部待ち2件。

## 2026-09-25：BG統合・外部導入不要の配布更新

上記の残件ゼロは当時のタスク表のみ。棚卸しでMCPの追跡漏れを確認し、ユーザーと
「BG共通化→最新Windows配布・文書→MCP」の3項目を先行する合意を得た。追加候補は後で相談する。
MCPの受入クライアントはCodexとClaude Code。利用者によるPython・Node・cc65・Mesenの外部導入を不要にする。

BG-SUBSETは別スレッドの完成を統合済み。WINDOWS-REFRESHも`bfd6630`で完了しmainへpushした。
配布は`D:/HomeBrew/FamiBASIC_Turbo_remaining/dist/windows-20260925-release/FamiBASIC_Turbo-Windows.zip`。
生成元`b1290dd`、196,676,147 bytes、SHA-256 `04d327e396ddae546e1d2b48623c9eff41e8ea06ab2b322ab9d55164be19b865`。
署名済みPython 3.10.6と必要なライブラリ・コンパイラ・エミュレータを同梱し、3,784ファイルのハッシュ照合済み。
最初の配布で起きたMesen LoadRom初期化障害は、隠しTk窓のイベントを200ms処理してからロードする変更で
実コア試験と配布試験が成功。PC全体の間欠障害の根本解消とは扱わない。

日本語の別フォルダ・PATHをSystem32のみ・開発パスとPython通信をauditで拒否した試験で、
4種ROM・実Tk GUI・サンプル除外後の基本ROMが成功。audit4,679件、禁止アクセス0件。
最新ゲームはコンパイル直後の1秒待機ではタイトル描画途中だったためSCSTATE=1・SCAGE=30・SCOLD=0を待つ。
正常なタイトル実画像を確認した。受入元`d9cef5e`から最終配布への差分は利用案内・ソースZIP・
生成テンプレートのproject_idのみと全ハッシュ比較で確認。最終再梱包の全試験再実行とは区別する。
保存手順・本体素材編集・旧容量制限も現行文書へ更新した。詳細は`docs/windows_refresh_20260925.md`。

残る先行合意の項目はAUTHORING-MCP（未着手、予約なし）。同時編集の扱いについてユーザーへ非同期で確認中：
「IDEに未保存変更があればMCP書込みを停止し、IDEで保存・破棄後に再開。保存済み外部変更は既存確認で取込」でよいか。
ユーザーの「不明点は質問してから実装」に従い、この仕様の回答前に依存する実装は始めない。
Codex CLI 0.149.0（PowerShellのcodex.ps1は実行ポリシーで不可、codex.cmdを使う）、Claude Code 2.1.207を確認。
openai-docsスキルと公式MCP/両クライアント資料を参照済み。MCP本体と実接続試験はまだない。
物理MMC5はユーザー担当、LD65-HOST-CAUSEは引き続き外部待ち。追加候補へはまだ着手しない。

## 2026-09-25：MCP実装、Claude Code認証待ち

ユーザーの「はい」で未保存IDE変更があればMCP書込みを止める方式が確定。
`0d5cdab`でAUTHORING-MCPを予約して実装し、最終記録`6b72da2`をmainへpush済み。作業ツリーclean。
15個のstdioツール、共通AuthoringService、IDEとの名前付きパイプ調停、同梱設定生成・起動を追加した。
BuildServiceとEmbeddedSessionを共用し、プロジェクト版の比較・素材バッチ検証・ディスク競合・Undo・
ビルド取消・実ROM入力/画像/シンボル・ROM/ZIP出力・切断後の解放を実装。
MCPの子プロセスにはプロトコルstdinを引き継がず専用起動を使う。画像はPPU描画完了時の画素とフレームを対応させた。

最終配布：`D:/HomeBrew/FamiBASIC_Turbo_remaining/dist/windows-mcp-20260925-final/FamiBASIC_Turbo-Windows.zip`。
生成元`93d2b4104df61bd5addc05c32e47f4231f8a829a`、196,821,924 bytes、3,803ファイル全ハッシュ照合。
SHA-256 `ae3c56c0573fe6b19c2e7f747eb8a574ca0266dfcb4ce89b6da17104e180152c`。
利用者によるPython・Node・cc65・Mesenの追加導入は不要。配布のMCP_Setup.cmdで設定を生成する。

制作/実Tk/実ホスト/テンプレート/環境/統合BG UIの計41試験を関連する変更時に確認。
全入り容量は62,166 B、コード最小260 B、ROM最小19 Bで合格。
`6dac5f6`の配布は4種ROM・GUI・MCP・設定生成・サンプル除外を隔離環境で完走。
最終`93d2b41`のMCPを別フォルダ・System32のみのPATH・開発パスとPython通信拒否で再試験し、
audit2,778件・禁止アクセス0件。最新タイトル全61,440画素が基準と一致、連続フレーム送りとSTARTも成功。
小さなプレビューを古い映像と判断したが、元PNGの画素は正常だったためユーザーへ訂正済み。
ここをゲーム描画不具合の修正と記録しない。物理実機・別PC・OS全体ACLの試験ではない。

最終配布をCodex CLIネイティブ0.147.0（既定ラッパーの0.149.0とは別）から19ツール操作で完走。
エラー行10→修正→実ROM→A=42、右12フレームB=1、解除後B=0→画像→ROM/ZIP出力。
証跡`docs/benchmarks/mcp_20260925/`、説明`docs/mcp_verification_20260925.md`、操作`docs/mcp_guide.md`。

**唯一のMCP残件はClaude CodeでのAI制作試験。** Claude Code 2.1.207は最終配布の生成設定でConnected。
AI呼出しは`OAuth session expired and could not be refreshed`で停止し、非同期質問でユーザーへ再ログインを依頼中。
既存ユーザー設定は変更していない。接続健康診断は独立したCLAUDE_CONFIG_DIRを使った。
AUTHORING-MCPを外部待ちへ変更した。ユーザーが再ログイン完了を知らせたら同項目を再予約し、
`python -m tools.verify_mcp_clients claude --app dist/windows-mcp-20260925-final/FamiBASIC_Turbo --output .tmp/<新規試験先>`
で制作を確認し、記録・完了・pushする。追加機能候補は3項目完了後に相談するという合意を維持。
