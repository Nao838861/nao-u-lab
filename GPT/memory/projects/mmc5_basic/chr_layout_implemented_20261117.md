# CHR領域分割を実装、処理落ちゼロは未達（2026-11-17）

製品main `6f7d41f` をcommit/push済み。origin/mainとのahead/behindは0/0。共有mainには開始時から大量の別作業差分があり、今回の27ファイルは凍結した開始時SDKとの差分から切り出し、HEADベースの独立worktreeでテストした。既存の無関係な変更や音源、他ゲーム、ランチャー整理は混ぜていない。commitした27ファイルのblobはテストした作業ツリーと一致確認済み。

## 実装

- プロジェクト設定は `chr_layout={version:1,capacity_kib:512,sprite_banks:4}`。1バンク4 KiB、スプライト0始まり、残りがBG。末尾8 KiBは本体BASICの文字を保持する。
- 空のバンク追加、複製、上限の診断、容量変更の原子的な検査、保存・再読込。表示設定は8個の1 KiB枠を「素材番号・区画」で選択する。
- 通常テンプレートにも同じ編集文書を付ける。最新シューティングは同梱 `famibasic/data/templates/console_basic.json` から独立して新規作成する。
- SIDE ART Bの専用描画器・BG生成器は保持。`chr_sample_layout.resolve` がビルド時だけ画像参照、ExRAM属性、CHR定数、最終爆発の表を変換する。実行中の領域加算・名前検索は加えない。
- 旧0番参照の互換用BGは道中と同じ256 KiB窓に置く。ボスは256 KiB以降に維持し、上位ビット1→0の切替とコンパイラのゼロ値再利用による番地変化を避ける。
- HUDのPPUSTATUS読出しは4→2回。旧4回は起動位相で223行dot339〜224行dot3まで遅れ、HUDが欠けた。2回では割り込み16 cycles短縮。敵・弾・移動・武器・当たり判定は変更していない。

## 検証

- 独立HEAD作業ツリーで53 tests / 231.909秒が全成功。その後、設定ダイアログから8バンクへ変更して空バンクを追加するUI検証1件成功。ユニーク54件。
- 配布物だけの独立PythonプロセスでBG変換する検証も、既存テストを拡張して成功。SIDE ART B / single_basic_consoleの変換モジュールとfixturesを配布へ含めた。
- 道中・破壊後・左右の全画像参照を実際の16バイト画像へ解決し、画像とパレットの一致を確認。4つのスプライトページを使った後もREADY文字の画像が旧配置と一致。
- 同じHUD2回版の旧配置との本体コード比較は、全行のentry/header/body/bankが一致。全8 native RAM banksの相違は15個のLDA即値だけ。バンク配置変更による毎フレームの命令追加はない。
- 自然起動の画像比較は起動キャッシュの位相で割り込み遅延や負荷打切り位置が変わるため、全フレーム完全一致の証明として扱っていない。初期実験の「415枚一致」は採用しなかった条件式変更を含む版であり、最終版の全画面一致と混同しない。

## 性能の残件（重要）

**処理落ちゼロは未達。** ユーザーの要求を達成済みと扱わない。

Native NES coreで無敵化し、A連射・300フレームごとの左右入力を続ける負荷試験。変更前の保存版にも道中22回の更新遅れがあった。最終保存版は15回、新規版は11回（間隔3の箇所もあり）。全条件60fps・物理実機の保証ではない。更新速度の悪化はなく、採用した性能修正はHUD待ちの短縮。OR条件を2行へ分ける試作 `frame_budget.py` は既存コンパイラが既に短絡生成していて効果がなく、削除して不採用。

これ以上の最適化では、SCAN_PHASEの128行IRQを不用として消さない。6350 / 7100 / 31304がphase>=2を使い、188行のphase>=3とは別の描画制限を持つ。削除すると効果の仕様が変わる。

## 最新の保存先

- 正本SDK：`D:\HomeBrew\FamiBASIC_Turbo_main`
- 整理済み仕様：`docs/chr_bank_layout.md`
- 検証JSON：`docs/benchmarks/chr_layout_20261117.json`
- 再現コマンド：`python -m tools.check_chr_release <ROM> --invulnerable --out <JSON>`
- 保存済みゲーム：`build/basic_only/game`。sourceのHUD読出しとchr_layoutだけを更新し、既存の音源参照・素材・ゲームの編集を保持。
- 更新前退避：`build/basic_only/edited_backups/before_chr_layout_20261117_1e98747c`
- 最新ROM：`build/basic_only/game.nes`、SHA256 `561db040ef5b264459bd49b7a193f02d1b4ce12312b2cb7d5f9928114abf0ae9`。最終SDKから再ビルドして一致確認済み。
- 最新新規サンプルROMのSHA256：`06e4bc395b0ef73f599e8b43322cac9249691e2dd0e224a98ce47ac0f9e9cf8d`。
- 再現用作業ツリー：`D:\HomeBrew\FamiBASIC_Turbo_chr_verify_20261117`（c85a4c6 + 今回の27ファイル。commit blobと一致）
- 開始時SDKの凍結：`D:\HomeBrew\FamiBASIC_Turbo_chr_baseline_20261117`

## 環境の注意

このPCはPythonが通常のCPU割当で不安定になる既知問題がある。今回の検証はctypesの正しいargtypes/restypeでSetProcessAffinityMask(0xffff0000)を設定して実行。誤って既定の32bit引数でHANDLEを渡さない。製品側の安定化・ランチャー改修は別の未commit作業として保持しており、今回のmainには混ぜていない。

native_metadataはゲーム開始後のRAMから読むと、ゲームが再利用した管理領域を誤って解釈する。`startup_cache._capture` でコンパイル直後に取得したRAMを使う。logical bank 7のphysical bank 13はCPU $A000側であり、13を$8000側の先頭として逆アセンブルしない。
