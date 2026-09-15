# FamiBASIC Turbo 0.1実装記録

## 指示原文

> 最後まで一気に実装を進めて。

プロジェクト `D:\HomeBrew\FamiBASIC_Turbo`。実装コミット `581525b9c1089d3e8c08271e4f6084c8c77c7393`。作業ツリーclean。remote未設定のため `git push` は `No configured push destination` で失敗。ユーザーへの報告に未push理由とhashを含める。

## 実装したもの

- Pythonの行番号付きBASICパーサ・型検査・6502生成。INTEGER/BYTE/SBYTE、配列、IF/GOTO/GOSUB/FOR、PRINT等。
- 案1の8bit演算：8bit同士はラップ、演算前I16で拡張。代入先から型を推論しない。
- MMC5のブート、算術、OAM、VBlankキュー、横/縦2画面、横ラスタースクロール、パルス音。
- TkのPCキャラ/BGエディタ。パッド、マウス、8×8/16×16、塗潰し・コピー・反転、64操作の差分Undo/Redo。
- PCの素材8枠（プロジェクトIDで分離）、一式8枠、名前・代表キャラ・UTC時刻、JSON/CHR/PNG、自動復旧、検証後の置換保存。
- 本体CHRTOOL/BGTOOL、A描画・B Undo・SELECT色・STARTメニュー、素材4枠、保存中断の旧内容復旧。
- 本体の型付きIR→6502コンパイラ。出力8 KiB、ラベル256、修正170。未編集再RUNは機械語キャッシュ。
- `Launch.cmd`、`Build.cmd`、ゲームROM `build/game.nes`、開発ROM `build/FamiBASIC_Turbo.nes`。

## 実機側プロファイル

標準：PRG-ROM32 KiB、CHR-ROM16 KiB、PRG-RAM32 KiB。
本体開発用：PRG-ROM32 KiB、CHR-RAM8 KiB、バッテリPRG-RAM64 KiB。特定基板の動作確認ではない。

RAMバンク0=ランタイム、1=生成コード、2=作業素材、3=上書き前退避、4..7=保存枠。本体の保存にBASICソースは含まない。

## 検証と実測

- `python -m unittest tests.test_compiler -v`：21合格。py65の独立CPUでPC生成と本体生成を比較し、型・演算・配列・制御・描画・境界・エラーを検査。
- `python -m tests.ui_smoke`：実際のTk画面、描画・Undo・保存・画面切替。スクリーンショット目視。
- `python -m tests.mesen_smoke`：Mesen 2.1.1で9ケース。CHR/OAM/BG、入力、5050の文字表示、ラスター境界256画素、16区間＋14転送、保存→再起動、書込み中断を模した旧枠復旧。
- 全Mesenケースで描画中$2007書込み0件。
- サンプル269バイトIR→497バイト機械語。コード生成約38,600サイクル=21.5ms。
- 入力ポーリングからコード開始：初回100,602サイクル=56.2ms、キャッシュ再RUN62,033=34.7ms。
- ラスター16区間＋14転送のNMI最大1,844サイクル。

PCでの解析/ROM生成や電源投入を本体RUN時間へ混ぜない。元V3・べーしっ君に対する速度倍率は未測定。

検証データは `build/qa/validation.json` とPNG。ソース正本はプロジェクトの `docs/language.md`、`docs/architecture.md`、`docs/character_editor.md`、`docs/verification.md`。

## 重要な未達

**元の構想全体は未完成。** 本体でBASICテキストを入力・構文解析・型検査する部分はない。PCで解析してIRにし、本体で機械語化する2段階方式。次は本体の行編集・キーボード・トークン化を同じIRへ接続する必要がある。

文字列変数、INPUT、DATA/READ、PLAY、V3自動スプライト移動、複数コードバンクは未実装。PCプレビューは音声・PPU・2画面等の厳密な代用ではない。本体エディタは8×8と1操作Undoで、PCの全機能は未移植。実ファミコン、基板、実パッド、PAL、DPCM併用、別エミュレータは未検証。

## 実装で得た注意点

- MMC5の初期バンクでは$C000カーネルから直接ブートできない。$FFE0から$5116を設定する。
- CHRモード0のバンク番号は8 KiB単位。単純CPUテストでは気づけずMesenの空白画面で発見。
- 属性のx16/y16下位bit、垂直ページの正規アドレス、転送末尾の全範囲検査が必要。
- ラスター表のコピーをNMI内に置くと予算超過。メインで準備しポインタだけ交換する。
- 単純なIRQ→$2005では境界行の途中に切替が出る。事前計算したY/PPUアドレスを帰線期間でコミットして修正。
- 保存は一意な一時ファイルと終了時の非同期完了待ちが必要。Undoは差分で持ち、無関係なBASIC編集を巻き戻さない。

ユーザーの「最後まで」という指示は継続的な実装の意図。初期版を構想全体の完成として報告しない。
