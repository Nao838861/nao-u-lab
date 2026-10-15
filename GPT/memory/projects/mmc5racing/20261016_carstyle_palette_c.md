# 2026-10-16：車デザインの引き継ぎと4台別パレットC案

ユーザー原文:

> D:\HomeBrew\MMC5Racing_carstyle\direct-runtime\car-style\HANDOFF.mdを読んで続きをやって

配色質問への回答:

> C：白／緑＋水色／青

作業場所は `D:\HomeBrew\MMC5Racing_carstyle`、ブランチ `claude/car-style`。開始時a1266b2・clean・remote同期。最新main d4c32b2の序数順位と分秒時計を62091c8で取り込んだ後、C案を実装。最終commit `2a493fe0d7703b7994de0992454e16b3af5e911d` をoriginへpushし、clean・同期を確認。mainへの車デザイン採用は未決定なので比較版を維持する。

起動は `play_carstyle.cmd`。ROMは `releases/MMC5Racing_CarStyle_136x184.nes`、SHA256 `a98b691017f435454973bd78a8a9cb87a4aa7ee73117456dd3b66fdd22c4a54e`。正式ビルドはCC65_BINを `D:\HomeBrew\CC65\bin` に指定し `python build_release.py --car-style`。通常配布先と通常ROM SHA b671d6bf…は維持する。

GRIP=F1／DRIFT=クーペ、自車の独立前輪2枚、他車16×16は継承。自車・ghostは赤16／白30、最速CPUは白30／赤16、中速は水色3C／青11、最遅は白30／緑1A。全車セットA、パレット2／3／1／0。色2は全て黒0F。セットBの新規書き込みを廃止した。

HUDの22時計字形を各1パターンへ分離し、既存11枚＋HUD bank506の空き64..74へ置く。追加CHR352bytes。時計LUTの属性を1にし、既存EOR #3でパレット2を得る。HUD文字・力の点・順位・カウントダウンは2、摩擦円は3の白／2の赤。境界233は両モードで色1から色2へ変換。HUDの追加サイクル・RAM・スプライトは0。

最初の画素比較でコロンだけが消えていることを検出。build/race-chrの字形を再生成する方法では、後段のreadable_fontが加えた分表示コロンを落とす。完成ROMの旧重ねパターンから、選択するプレーンを抜き出す方法へ修正した。現在の `hud_palette.py` はその方法。カウントダウンの即値はbank127ではなくbank119のDFAD+1にある。元バイトと一意な命令列を検査して変更する。

実6502の512状態でHUD時間同一、全22時計字形とコロン保持。両モード各781フレームの右HUD・順位画素差0、状態920行同値。UI95項目、両モードの木／建物2衝突と爆発・GAME OVER・再挑戦・START復帰、通常入力の転送期限で保持・拒否0。DRIFTのghost fixtureを伴う入力2周は1190／1128NMIと更新が一致し、保持・main遅れ・拒否0。ghost可視609frames、OAMの別処理による上書き0。正式ビルドと通常ROMへの直接overlayが同じSHA。

証拠は対象repo `verification/car-style/`。native-fixtures.zipに元ROM・前後の全比較画面・フレームログを保存し、チェックを再実行できる。HANDOFF.mdも現在の完了状態へ置換した。斜め他車の近似・反転する影・前輪位置の丸めは継承。実機、自然保存したベストghostの再生、ユーザーの採用判断は未完了。全状態60fpsの保証は追加しない。
