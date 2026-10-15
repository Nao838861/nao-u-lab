# MMC5Racingコースの地面描画比較

2026年10月16日。対象は、MMC5Racingの実際のコース形状でポリゴンとMODE7風を比較したい開発者。**楕円コースを既存コースの形状へ差し替え、自動周回も元のスタート位置・進行方向に合わせた。**

通常の[run_ground_compare.cmd](../../../run_ground_compare.cmd)は、車体縮尺と物理接続を追加した[v003](../v003/README.md)を起動する。このv002を再生する場合は`python tools/launch_ground.py --version v002 --gsu-mhz 50`。[ROM v002](../../../releases/GSU_GroundCompare_v002.nes)、[元コースとの形状比較](results/course_overview.png)、[4視点の比較](results/comparison.png)、[実ROMの動作GIF](results/interactive_50mhz.gif)。

## 操作

| パッド | 未割当時のキー | 操作 |
|---|---|---|
| A | Z | ポリゴン／MODE7風を変更 |
| SELECT | 右Shift | 車載・近い追従・高い追従・俯瞰を変更 |
| B | X | 自動周回を停止／再開 |
| 左／右 | 左右矢印 | 停止中に1地点戻る／進む |

初期は高い追従視点。Xで止めてからZで変更すると、同じ地点で2方式を比べられる。下段のP/Tは方式、Vは視点、CはGSU基準MHz、Fは描画中にまたいだNES field数。

## 元コースからの生成

MMC5RacingのCPU車が使う32点の中央ルートを[course.json](course.json)へ保存した。640×640の原座標を全方向同じ1/5の縮尺で配置する。右の直線から北へ進むスタート位置`(568,392)`、長い斜め直線、左側の折り返し、中央の逆向きカーブ、右下のカーブを使う。

路肩を含む幅は80px、灰色のアスファルトは64px。4色の比較画面では、茶色や赤の路肩を白へまとめる。元の確認用マップから道路・縁石・路肩を抽出した[参照道路領域](course_reference.png)と、出典ファイルのhashを保存した。景物の独立したコーンは道路領域から除いた。

32点を均等に間引かず、直線の中間点から減らして19断面を残す。道路と内外の路肩を合わせて57四角形。RAMの枠を曲線の精度へ振り向けるため、比較用の固定車を外し、自車1台にした。全84頂点、62四角形で既存の40KiB RAMへ収まる。GSUへ自車の先頭頂点と地面面数を渡し、断面数を固定値から切り離した。

同じ4輪郭からポリゴンと64×64の画像を生成する。画像は元座標10pxが1画素となるため、近くの路肩は角張り、細かな曲線は量子化される。地面の走査・4視点・近遠面クリップ・PPU直読の契約は[v001](../v001/README.md)を引き継ぐ。

自動周回は元の32点を結ぶ経路を距離で64地点へ再標本化する。自車とカメラの方位には接線を補間して使う。今回の変更はコース表示と比較ルートで、4輪物理やCPU車を使うレース本体の移植は後段となる。

## 形状の確認

- 19断面への簡略化による元の32点ルートからの最大距離は**1.325px**。
- 確認用マップの道路領域と生成メッシュの領域のIoUは**95.82%**。元の滑らかなカーブ、路肩の画素表現、輪郭の整数化による差を含む。
- 元画像の道路範囲は`x=32..607, y=58..607`、メッシュは`x=32..607, y=59..605`。
- 自動周回64地点はすべて元の道路内かつ生成した灰色の路面内。固定小数点化後の元ルートへの距離は最大**0.023px**。
- 4視点で同じ自車の位置・方位を使用し、地面の全四角形が凸であることも確認。

[形状検証の数値と出典](results/course_validation.json)。比較画像の左側は元道路を灰色、生成輪郭を白、元の中央ルートを水色、スタート位置を赤で表示。右側はROMへ入れた64×64画像の拡大。

## 動作と性能

25／50MHz × 4視点 × 2方式 × 64地点の計1,024画像、50,331,648画素が独立した整数幾何参照と完全一致。実Mesenでは両クロックで各64画像、計128画像・7,864,320 RGB画素を照合した。方式の長押し、視点の一周、停止中の方式変更、左右1地点送りも通過。

GSU開始からSTOPまでの全64地点の最長時間。CPU準備と範囲フィルの時間は別途かかる。

| 視点 | 25MHz ポリゴン | 25MHz テクスチャ | 50MHz ポリゴン | 50MHz テクスチャ |
|---|---:|---:|---:|---:|
| 車載 | 50.17ms | 61.37ms | 42.45ms | 37.63ms |
| 近い追従 | 57.74ms | 65.27ms | 49.73ms | 39.90ms |
| 高い追従 | 62.54ms | 72.07ms | 53.86ms | 43.88ms |
| 俯瞰 | 71.27ms | 91.71ms | 60.99ms | 55.85ms |

50MHzの実ROMの採取画像は3〜4 fields、約20〜15fps。今回も30fps化は未達。曲がりの多いコースでポリゴンの作業量が変わり、方式の速度差も地点・視点で変わる。[全測定](results/benchmark.json)、[検証ログ](results/verification.json)、[検証用アーカイブ](results/verification.zip)、[配布manifest](../../../releases/ground_compare_v002.json)。

v001の楕円ROMは再ビルド後も配布hashと一致した。旧版を起動する場合は`python tools/launch_ground.py --version v001`を使う。

## 再生成

```powershell
python projects\nes_superfx\tools\build_ground.py --version v002
python projects\nes_superfx\tools\verify_mmc5_course.py
python projects\nes_superfx\tools\verify_ground.py --directory projects\nes_superfx\build\ground\v002 --mhz 50
python projects\nes_superfx\tools\verify_ground.py --directory projects\nes_superfx\build\ground\v002 --mhz 25
python projects\nes_superfx\tools\package_ground.py --directory projects\nes_superfx\build\ground\v002
```

生成は保存済みの原座標と参照画像だけで再現できる。元のMMC5Racingリポジトリを変更せず、出典のhashで入力を識別する。[改修ログ](design_log.md)、[自己判定](self_judgment.md)。
