# 2026-10-16：車デザインの引き継ぎと4台別パレットC案

ユーザー原文:

> D:\HomeBrew\MMC5Racing_carstyle\direct-runtime\car-style\HANDOFF.mdを読んで続きをやって

配色質問への回答:

> C：白／緑＋水色／青

作業場所は `D:\HomeBrew\MMC5Racing_carstyle`、ブランチ `claude/car-style`。開始時a1266b2・clean・remote同期。最新main d4c32b2の序数順位と分秒時計を62091c8で取り込んだ後、C案を実装。実装commit `2a493fe0d7703b7994de0992454e16b3af5e911d` をoriginへpushした。続くユーザーの採用指示により、main `7ef624682e8393c89ce0b88b99dea7de6836beed` へ統合・通常配布化済み。両worktreeを同期してmainとcar-styleをpush、clean確認。

通常起動は `D:\HomeBrew\MMC5Racing\play_latest.cmd`、ソース再ビルドは `play.cmd`。ROMは `releases/MMC5Racing_CarStyle_136x184.nes`、SHA256 `a98b691017f435454973bd78a8a9cb87a4aa7ee73117456dd3b66fdd22c4a54e`。CC65_BINを `D:\HomeBrew\CC65\bin` に指定し、引数なしの `python build_release.py` で同じROMを生成する。明示的な `--car-style` も維持。旧車体＋序数順位b671d6bf…は `--no-car-style` で再現する。既存の履歴再現フラグは旧車体を自動選択し、8種のCLI分岐と起動SHA照合を確認済み。

GRIP=F1／DRIFT=クーペ、自車の独立前輪2枚、他車16×16は継承。自車・ghostは赤16／白30、最速CPUは白30／赤16、中速は水色3C／青11、最遅は白30／緑1A。全車セットA、パレット2／3／1／0。色2は全て黒0F。セットBの新規書き込みを廃止した。

HUDの22時計字形を各1パターンへ分離し、既存11枚＋HUD bank506の空き64..74へ置く。追加CHR352bytes。時計LUTの属性を1にし、既存EOR #3でパレット2を得る。HUD文字・力の点・順位・カウントダウンは2、摩擦円は3の白／2の赤。境界233は両モードで色1から色2へ変換。HUDの追加サイクル・RAM・スプライトは0。

最初の画素比較でコロンだけが消えていることを検出。build/race-chrの字形を再生成する方法では、後段のreadable_fontが加えた分表示コロンを落とす。完成ROMの旧重ねパターンから、選択するプレーンを抜き出す方法へ修正した。現在の `hud_palette.py` はその方法。カウントダウンの即値はbank127ではなくbank119のDFAD+1にある。元バイトと一意な命令列を検査して変更する。

実6502の512状態でHUD時間同一、全22時計字形とコロン保持。両モード各781フレームの右HUD・順位画素差0、状態920行同値。UI95項目、両モードの木／建物2衝突と爆発・GAME OVER・再挑戦・START復帰、通常入力の転送期限で保持・拒否0。DRIFTのghost fixtureを伴う入力2周は1190／1128NMIと更新が一致し、保持・main遅れ・拒否0。ghost可視609frames、OAMの別処理による上書き0。正式ビルドと通常ROMへの直接overlayが同じSHA。

証拠は対象repo `verification/car-style/`。native-fixtures.zipに元ROM・前後の全比較画面・フレームログを保存し、チェックを再実行できる。HANDOFF.mdもmain採用後の状態へ更新した。斜め他車の近似・反転する影・前輪位置の丸めは継承。実機、自然保存したベストghostの再生は未完了。全状態60fpsの保証は追加しない。

## main採用とタイヤ角度の指摘

ユーザー原文:

> mainに反映して。

> タイヤの角度反映がすごく荒くなったが、原因は何？

main反映中の質問として調査。旧・新ROMの前輪を全64角度でデコードし、画像の種類が旧20／新12、直進の黒画素範囲が旧2×6dot／新2×4dotであることを確認。新デザインは8点を最近接ドットへ丸めるため、0〜16.875°が同一画像、22.5°で初めて変化する。角度選択のbank109 `$AE67..$AF09` は完全同一で、64段階・5.625°刻みを維持している。CPU間引きやHUDのパレット整理による現象ではない。最初に旧サイズを約3×4dotと推測して説明したが、実データの2×6dotへ明示訂正した。

原因は `car-style/build.py` の `tire_image` と小さい画像への丸め。今回は質問への原因調査のみで字形の修正はしていない。main採用ROMは検証済みC案からbyte同一。HUD画素一致試験はタイヤの角度別の見え方を評価できていなかった。比較は `verification/car-style/tire-angle-analysis.json`、通常ビルド一致とCLIは `main-adoption.json`。タイヤ画像の改善は今後の修正指示待ち。
