# 2026-10-16：小さい前輪の中間角をドット単位で補う

ユーザー原文:

> 以前滑らかだったものがなくなると違和感が強いので、ドット単位の修正で何とかならないだろうか？

[原因調査とC案の採用](20261016_carstyle_palette_c.md)を受け、前輪画像を修正した。mainには別作業の追加エンジン音・CPU走行ライン31bc759が入っていたため、それをベースに保持。carstyle worktreeをclean確認して `codex/tire-dot-smoothing-20261016` に切り替えて作業した。最終commit `4b49ab003c72bec6218d8d0272b08c6e74cb2705` をfeatureとmainへpushし、両worktreeでclean・remote同期を確認。

通常起動は `D:\HomeBrew\MMC5Racing\play_latest.cmd`。`play_carstyle.cmd` も通常起動へ接続するよう変更。配布ROMは `releases/MMC5Racing_TireDots_136x184.nes`、SHA256 `9f1d7bc7cf4f0b9785f4706a558e87ab954d1cbcac2e6756fce3d91bd7b689e5`。正式ビルドと、直前配布8a7332be…への直接パッチがbyte一致した。

直進2×4dotを維持し、0..45°の9枚を直接記述。先端を切る／1dotを動かすことで中間の傾きを作り、転置と反転で64角度を生成する。0と5.625°は同じ絵、11.25°から形を変える。時間方向の交互表示なし。全周の異なる実画像は12→52種類、黒画素の主軸角の最大の飛びは35.78→10.98°、指定角度との差は最大16.875→5.625°。黒画素7〜9dot、中心ずれは各軸最大0.25dot。指標は見た目の改善の根拠であり物理角の変更ではない。

実装は対象repo `direct-runtime/car-style/tire_dots.py`。元の40パターンの後の空き19枚から15枚（even210..238）を使い、GRIP bank3／DRIFT bank507へ480Bずつ置く。bank109の起動時コピー元 `$7D00/$7E00` のtile／属性64B×2だけを差し替える。元の車体・前輪位置・他車・ghost・HUD・音・CPUラインは保持し、実行コード変更0・追加サイクル0・RAM0・sprite0・ROMサイズ不変。CHR予約は55／59枚、残り4枚。

正式ビルドの最後へ追加したため、追加音の入力SHAガードa98b6910…は変更不要。`--original-tires` は直前の追加音／CPUライン入り8a7332be…を再現。`--no-engine-body` 等の履歴再現フラグも旧版を維持する。6種のCLI選択を確認した。

空きCHRは既存ordinalの検査を引数化して再利用。修正前ROMの全4096自車組、タイトル960セル、背景128方向19780recordsで非参照を確認。実6502で車体64×車輪64×小数carry2=8192状態を実行し、前後とも218cycles、前輪tile／属性以外の自車OAM同値。Mesenで両モード全64角度の左右前輪と実CHR一致、前輪以外の画素差0。

native QAで最初はbank109のAE67をhookしたが、実際の処理はRAM `$0300` へコピーされていたため角度が固定のままだった。コピー済みルーチンの入口へhookを移し、OAMのtile／属性とLUTが全64角度で一致することを検査して、無効な初回測定を証拠に使わなかった。QAは描画用角度だけを指定し、OAM・CHR・物理・時計・コードは書かない。

証拠は `verification/tire-dots/`。比較 `steering.gif`、全角度 `angles.png`、CPU／native結果、空き領域報告、fixture ZIPを保存。mainの通常起動のSHA照合も成功。実機や人の体感の最終評価は未完了だが、中間角の消失と大きな飛びをドットだけで緩和できた。全状態60fpsの追加保証はしない。
