# 184行を目指した最適化の途中結果

依頼原文:

> MMC5Racingの徹底的な最適化をお願いしたい。
> 縦解像度184を達成するため、既存の処理を可能な限り変えずに最適化してほしい。

**184行は未達。** 開発場所は `D:\HomeBrew\MMC5Racing`。mainへ [a1e9ac7](https://github.com/Nao838861/MMC5Racing/commit/a1e9ac757688a8efc76b7e7a6243ff4073afd4fc) をpushした。終了時はclean、origin/mainとのahead/behindなし。

## 採用した差分

描画準備の即値化、行ポインターの不要なAND、条件比較で既にC=0のCLC、空の最終行のヘッダー読み取りを省いた。実6502の同じ連続2,516姿勢で16〜126cycles、平均69.086cycles短縮、悪化0。NT/ExRAMの書き込み順・値・転送費用は一致する。物理PRG113/115/119/126と全CHRはバイト一致。RAM/ROM容量の追加は0。

準備・起動の時間変化で露出した、CPU車と荷重点が重なった時の黒帯スプライト落ちは、OAM54→空き20へ移して修正した。CPU車40〜45、プレイヤー48〜53、ゴースト4/11、4輪円56〜63は維持する。8スプライト制約そのものは残る。

通常 `build.cmd` / `play.cmd` は新しい144×176を使う。SHA256は `20ab3111589af025a24023de8d8efe38ad9c078b71a209df8581ac553088ed1d`。旧通常版 `a6c7b40...` は `releases/MMC5Racing_AllIntegrated_144x176_73e3806.nes` に保存した。`build_release.py --no-fast-column-prepare` で旧176を再生成できる。

全2,437,120窓の転送超過0、両モード8描画経路で保持・拒否0、実背景画素・先頭行・黒帯、両モード各7200フレームの5周・録画・ベスト／前周再生・保存／再走を検証した。最小主処理余裕は190→217cycles。ソースZIPを新規展開して基準版と通常版のSHA一致も確認。実機と人の操作感は未検証。

## 次に残った作業

184試作は `build/opt184-checked/direct-rival-game3.nes`、SHA256 `aa756e53543df6d2e982b2258868269eed1d4bf856e885a43f1e08c9529c1419`。描画の同値検査は通るが、転送最大8685 / 予算7449、1236cycles不足、327407窓が超過。native DRIFT turnsでも1091レースフレーム中1065回の拒否・保持。**配布版・達成済みとして扱わない。**

source operandを切り抜き範囲だけ更新する案は、キャッシュ整合性を直しても平均262.959cycles悪化したため撤回した。上側3ブロック行のExRAMを無料で前倒しする模型も最大7505 / 7449、6窓超過。前倒しの主処理費用・ビーム追越し・保持との整合性は未実装・未証明。次は転送側の表現・配置・スケジュールまで検討する必要があり、今回の微小短縮を184の達成へ言い換えない。

詳細と再現は開発側の [verification/column-prepare/README.md](https://github.com/Nao838861/MMC5Racing/blob/a1e9ac757688a8efc76b7e7a6243ff4073afd4fc/verification/column-prepare/README.md)。独立した検査スクリプト・成功と失敗のJSON・原文は同commitにある。IDEで見えていたFamiBASICのHTMLは別プロジェクトなので触っていない。
