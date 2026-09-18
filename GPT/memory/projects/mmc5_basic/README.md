# FamiBASIC Turbo

製品名は **FamiBASIC Turbo** に確定。プロジェクトフォルダ: `D:\HomeBrew\FamiBASIC_Turbo`。

## 現行サンプルの入口

ユーザーの「この作業ツリーを奔流にして。」により、`D:\HomeBrew\FamiBASIC_Turbo_basic_port` のBASIC移植版を本流へ採用。ゲーム固有ASM全102入口をBASICへ移植した第14段階と、通常敵8体・敵弾8発の第15段階が基準。標準のBuildFlightLab.cmd / PlayFlightLab.cmdは移植版を対象にする。現行仕様はプロジェクト内の `experiments/basic_service_port/README.md` と `docs/basic_port_mainline.md` を読む。

本流採用コミットは `bb8c24b`。mainとexperiment/basic-service-portへpush済み。標準ビルドのROMは第15段階とハッシュ一致し、回帰29件・Mesen全長検証を再実行済み。本流フォルダーにも同じROMを配置した。

現在のPC編集正本は `examples/flight_lab/basic_only/src/main.bas` の1本と外部素材 `assets/project.json`。102処理はPC用の `REM @UNIT` 宣言で分割してコンパイルし、通常BuildServiceでリンクする。`EditFlightLab.cmd` から「テーブル」を開き、37表の値・構造・配置グループを編集して保存・RUNできる。制作時にゲーム専用PythonやASMを読む必要はない。本体の `BANK n` 文とは別の配置経路で、構造化テーブルとの本体BANK配置連携は未対応として診断する。完全60fpsは未達。旧v011のタイトル・結果画面と広角・高速・地形貫通Rは比較用に残る別構成。

## GitHubと更新時の同期

- GitHub: https://github.com/Nao838861/FamiBASIC_Turbo （非公開）。`origin` を設定済み、`main` は `origin/main` を追跡する。
- 2026-09-17、開発履歴を `ab82203`（既定型DEFと8bit版STAR LANCER）までpushし、remoteのHEAD一致を確認した。
- 今後も大きな更新では、関連テストと配布物更新を行い、変更をコミットしてGitHubへpushする。今回の依頼により継続して承認されているため、毎回のpush許可は取り直さない。失敗時は未pushのコミットと原因を報告する。
- 既存の無関係な作業差分を混ぜず、秘密情報・一時ファイルを含めない。公開範囲の変更は今回の指示に含めない。

依頼原文：

> Githubに上げておいて。今後も大きな更新があったらpushして。

現行実装は本体のソースコンパイルとフルスクリーン編集に対応済み。下記の0.1記録は初期段階の履歴であり、現在の到達点はプロジェクト内の `docs/verification.md` と `docs/optimization.md` を参照する。

## 設計と初期実装の入口

- [構造化テーブルの実装](D:/HomeBrew/FamiBASIC_Turbo/docs/structured_tables.md) — 初回の37表1508バイトの構造化に続き、PCエディタへ表編集GUIを統合。ユーザーの範囲指定は「今回はPC版への組み込み」。`basic_only/assets/project.json` が通常制作の正本。`TBYTE(BOSS_MUZZLE.X,PA)` を従来のPEEK命令、`TADDR(WAVES.RECORDS)` を定数番地へ解決し、実行時検索を追加しない。セル編集、構造定義、Undo/Redo、CSV、保存・再読込を実UIで検証。BANKを含む回帰79件と未対応配置の拒否1件が成功。既存配置を維持して同居・型・容量・固定件数を検査する。画像・BGMは外部素材のまま。任意のグループ変更による複数バンクへの自動再配置と本体RAM保存は未実装。
- [配置グループの全体設計](D:/HomeBrew/FamiBASIC_Turbo/docs/data_placement_groups_proposal.md) — ユーザーは物理バンクではなく「どのデータを一緒に置くか」だけ管理したい。データ形式と同居検査は導入済み、コードBANK・音楽・割り込み・本体素材RAMとの全接続完了とは区別する。

PC表編集の通常BuildService経路は、BANK統合後の全ゲーム検証済みROM `0397ffa43e9bf170b70864f87eafb93ddc0d990ac4ce48a5f88dff343b18df69` と全バイト一致。砲口Xの24→28変更はROMの1バイトだけに反映され、BASICの読出し結果は74→78、4個の砲口とも変更前後52サイクル。Undoで元ROMへ完全復元した。結果は `docs/table_authoring_proof.json`。実際の「保存してRUN」から埋込みMesenの232フレーム目のゲーム描画まで確認した。`8950c9e` までmainへpush済み。旧作業フォルダーで別スレッドがnative NESホストを作業していたため、統合と検証は独立clone `D:\HomeBrew\FamiBASIC_Turbo_tables_clean` で実施し、`D:\HomeBrew\FamiBASIC_Turbo_main` も同期した。起動入口は同フォルダーの `EditFlightLab.cmd`。

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
