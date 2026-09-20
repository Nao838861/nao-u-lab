# FamiBASIC Turbo

製品名は **FamiBASIC Turbo** に確定。現行本流の作業フォルダーは `D:\HomeBrew\FamiBASIC_Turbo_main`。

## 現行サンプルの入口

最新は [インゲーム最適化の到達点](ingame_optimization_20260920.md)。main `651be68` までpush済み。正本は `experiments/single_basic_console/game/src/main.bas`、入口は `EditFlightLab.cmd`。全武器の道中7,200更新で処理落ち333→143回、ボス32→0回。完全60fpsは未達。画面修復を長く遅らせる案は不採用。

## 以前の本流採用と統合の記録

完成作業の最新チェックポイントは [BASIC完成作業の到達点と継続先](basic_completion_20260919.md)。`codex/basic-completion` の `5a11da2` では旧581地形版の画面・高速R移植と更新抜け0を検証済み。最新画像・本体編集経路との統合は継続中。下記の本流採用・テーブル統合時点の記録とは測定対象を区別する。

ユーザーの「この作業ツリーを奔流にして。」により、`D:\HomeBrew\FamiBASIC_Turbo_basic_port` のBASIC移植版を本流へ採用。ゲーム固有ASM全102入口をBASICへ移植した第14段階と、通常敵8体・敵弾8発の第15段階が基準。標準のBuildFlightLab.cmd / PlayFlightLab.cmdは移植版を対象にする。現行仕様はプロジェクト内の `experiments/basic_service_port/README.md` と `docs/basic_port_mainline.md` を読む。

本流採用コミットは `bb8c24b`。mainとexperiment/basic-service-portへpush済み。標準ビルドのROMは第15段階とハッシュ一致し、回帰29件・Mesen全長検証を再実行済み。本流フォルダーにも同じROMを配置した。

現在のPC編集正本は `examples/flight_lab/basic_only/src/main.bas` の1本と外部素材 `assets/project.json`。102処理はPC用の `REM @UNIT` 宣言で分割してコンパイルし、通常BuildServiceでリンクする。`EditFlightLab.cmd` から「テーブル」を開き、37表の値・構造・配置グループを編集して保存・RUNできる。制作時にゲーム専用PythonやASMを読む必要はない。通常BASICの `BANK n` と構造化テーブルの併用、グループ変更・増量時の自動再配置にも対応済み。PC版が今回の対象で、本体上の素材編集GUIは含まない。完全60fpsは未達。旧v011のタイトル・結果画面と広角・高速・地形貫通Rは比較用に残る別構成。

## GitHubと更新時の同期

- GitHub: https://github.com/Nao838861/FamiBASIC_Turbo （非公開）。`origin` を設定済み、`main` は `origin/main` を追跡する。
- 2026-09-17、開発履歴を `ab82203`（既定型DEFと8bit版STAR LANCER）までpushし、remoteのHEAD一致を確認した。
- 今後も大きな更新では、関連テストと配布物更新を行い、変更をコミットしてGitHubへpushする。今回の依頼により継続して承認されているため、毎回のpush許可は取り直さない。失敗時は未pushのコミットと原因を報告する。
- 既存の無関係な作業差分を混ぜず、秘密情報・一時ファイルを含めない。公開範囲の変更は今回の指示に含めない。

依頼原文：

> Githubに上げておいて。今後も大きな更新があったらpushして。

現行実装は本体のソースコンパイルとフルスクリーン編集に対応済み。下記の0.1記録は初期段階の履歴であり、現在の到達点はプロジェクト内の `docs/verification.md` と `docs/optimization.md` を参照する。

## 設計と初期実装の入口

- [構造化テーブルの実装](D:/HomeBrew/FamiBASIC_Turbo_main/docs/structured_tables.md) — 37表1508バイトをPC表編集GUIへ統合。セル編集、構造定義、Undo/Redo、CSV、保存・RUNに対応。既定配置のTBYTEは従来のPEEK命令と同じ速度。再配置が必要な場合は別バンクへの読出しと元のコード窓の復帰を生成する。
- [配置グループとBANK統合](D:/HomeBrew/FamiBASIC_Turbo_main/docs/table_bank_placement.md) — ユーザーは物理バンクではなく同居グループだけを指定する。コードBANKとは別番号空間で、整列・8KB制約を検査して自動配置。通常BANK版はスカラーのTADDRポインタも追跡する。NMI・BGM・通常DATAとの併用を検証済み。画像・BGMは外部素材のまま。本体素材GUIと音楽の自由配置は今回の対象外。

2026-09-19、`209fca4`までmainへpush済み。最新BANKブランチ`85dd72d`と最新mainの背景復元`59057c9`を統合し、単独BASICの外部素材も最新背景へ更新。通常ROMは最新mainの検証済み`564ac1f5d179eea9301baeb6f34a1be3fa845b5cff3aca2674a7ee38b7cc2a89`と全バイト一致。表の1セル変更はROMの1バイトだけを変更し、52サイクルのまま。Undoも一致。全37表をグループ0へまとめた場合は砲口読出し120サイクルとなり、再配置の切替費用が発生する。通常配置・全表グループ0の両方でMesen全長・191対象破壊・画素照合・ボス・音楽・リトライ成功。道中7201更新の処理落ちは通常61回／グループ0版99回、ボス区間はともに0回。112件の回帰と、最新main統合後の関連19件を確認。詳細は`docs/table_bank_verification.json`。独立clone `D:\HomeBrew\FamiBASIC_Turbo_tables_clean`で検証し、`D:\HomeBrew\FamiBASIC_Turbo_main`も同期・検証済みROM配置済み。起動は同フォルダーの`EditFlightLab.cmd`。元の`D:\HomeBrew\FamiBASIC_Turbo`は別スレッドのnative NES作業ブランチなので切り替えない。

- [ランタイム速度最優先の採用決定](runtime_speed_priority_20260917.md) — 新しい固定配列・敵レコードは境界検査なしを既定とする。追加仕様全般を事前確定・直接生成に適した契約で設計し、RUN準備時間より実行速度を優先する。正本はプロジェクトの `docs/runtime_speed_policy.md`。

- [スクロールBG仕様の決定記録](scroll_map_spec_20260917.md) — 16×16ブロック作成→配置の2段階、上下往復、画面分割の制約、RAM・保存契約。正本はプロジェクト内の `docs/scroll_map_spec.md` と `docs/scroll_map_format.md`。機能は未実装。

- [プロジェクトREADME](D:/HomeBrew/FamiBASIC_Turbo/README.md)
- [キャラエディタの実装と仕様案](D:/HomeBrew/FamiBASIC_Turbo/docs/character_editor.md) — PC8枠、本体4枠、操作と未達項目。現行仕様はプロジェクト側。
- [0.1実装・検証記録](implementation_20260916.md) — コンパイラ、PC/本体エディタ、保存、実測と残件。
- [V3ほぼ全命令への対応要求と検討](v3_compatibility_20260916.md) — 最新の範囲指定、候補台帳、除外候補、BGPUTの衝突。

ファミリーベーシックV3（ユーザー表記V03）を土台に、6502機械語コンパイラとキャラ／BGエディタ、実用的なゲーム向け拡張命令を揃える環境の設計。完全互換や元ROMのバグ再現は目標にしない。

最新の範囲指定では、V3の命令はほぼすべて対応対象。今回明らかに不要なV3固有依存だけを例外候補とし、コンパイルが難しいことを除外理由にしない。0.1の部分実装を完成扱いしない。

- [初期設計書](design_20260916.md) — 言語互換性、コンパイラ、MMC5メモリ配置、実行環境、検証計画、段階的な実装範囲。
- [ゲーム制作拡張・エディタ設計](game_extensions_20260916.md) — 現行の製品方針、OAM配列、VBlank転送、フレーム公開、スクロール、ラスターテーブル、編集データ形式と実装順序。
- [8bit整数・案1の採用決定](integer_types_20260916.md) — 8bit同士は8bitで計算、演算前のI16拡張、本体RUNの応答時間。未決定の細部は暫定案として区別。
- 0.1時点ではPC生成と本体のIR→6502生成、PC/本体の素材編集、保存まで実装した。その後、本体BASICテキスト入力・解析にも対応した。現在の検証範囲はプロジェクト側を参照する。
- エディタはPC版から着手し、ファミコン本体版も制作する方針で確定。編集形式と資源ビルドを共通化する。
- 本体のRUN応答時間は計測・改善するが、追加仕様ではランタイム速度を最優先する。PC版の所要時間を本体コンパイル時間の代用にはしない。未編集再RUNは機械語を再利用する設計。

## 依頼原文

> ファミコンのMMC5で動くBASICコンパイラを作ってほしい。ファミリーベーシックに互換性の高いBASICを、MSXべーしっ君のようなBASICコンパイラで高速に動かすのがコンセプト。まずは設計をしてみて。

## 追加指示原文

> 互換性は完全でなくてもよくて、V03をベースにしようか。ドット絵を描くキャラエディタと、BGを配置するBGエディタも使いたい。あと、スプライトはOAMに直接書くくらい扱いやすい機能と、BG書き換えを配列に積んでVBLANKで順番に書き換えるなどの、ゲームを作るのに有用な拡張命令を足したい。BGのスクロール値を指定したり、ラスタースクロールができる拡張命令もあると面白いね。実用的なゲームを作れる拡張がしたい。

エディタの利用場所への回答:

> 両方ほしい（まずPC版から）

## フォルダ作成・エディタに関する依頼原文

> プロジェクト名は何が適切かな？D:\HomeBrew にプロジェクトフォルダを作って。
> キャラエディタの仕様を決めたい。ファミリーベーシックV3に近い方法で切り替えたい。
> エディタはコントローラーで違和感なく使える現代的なインターフェースにして、いくつか保存先を作りたい。

名称の最終選択:

> FamiBASIC Turbo がいいね。ファミリーベーシックで速いことが伝わる。これで行こう。

実装への指示:

> 最後まで一気に実装を進めて。
