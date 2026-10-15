# 2026-10-16：DRIFTのCPU45秒化とプレイ画面内の順位

ユーザー原文:

> drift modeのCPUを、トップを60秒->45秒に変えて、他の2台も同じ比率で早くして。あと、画面右下に順位を出したい。順位の計算を軽くする方法はあるか？即時性は犠牲にしていいので、できるだけ低い負荷で出したい。

> 順位表示の画面右下は、右側領域ではなく、左側のプレイ画面の右下に。

対象は `D:\HomeBrew\MMC5Racing`。IDEで開かれているFamiBASICのHTMLは対象外。開始時mainはd750cc8でclean。別作業のタイトル復帰修正が入ったため、独立worktree `D:\HomeBrew\MMC5Racing_drift_rank`、branch `codex/drift-pace-rank-20261016` で実装し、途中でd9e887eのタイトル修正と6f02fb5の車デザイン資料を取り込んだ。既存の他者差分は変更しない。

実装commit: `645f41b3fb4d86b7fc1b16ed7b0479acd425bcd3`。feature branchとmainへpush済み。通常checkoutもmainをfast-forwardした。

## 現行成果物

- ROM: `releases/MMC5Racing_RightCrop_136x184_Drift45Rank.nes`
- SHA256: `1124dda0f59f2ced77f1780f23c83c068a5cc452dfc64451479c10f5036f9d3d`
- 通常入口: `build_release.py`／`play_latest.cmd`。`--no-race-updates` で今回のCPUペース・順位追加前へ戻せる。
- 実装: `direct-runtime/race-rank/build.py`、`rank.s`、`step.s`。既存184生成器・エンジン音程の後、BGM overlayの前へ追加。
- 証拠: `verification/race-rank/README.md`、`cpu.json`、`native.json`、`native-fixtures.zip`、`portable.json`、`hud.png`。
- 旧ROM・タイトル復帰修正・136×184表示・既存物理・音・時計・全CHR画像は維持。

DRIFTの設計目標80／70／60秒へ3/4を掛け、千鳥配置120／240／360を含めてQ8.8を再調整。遅い順のrateは2905／3310／3850、5周完了は3599／3150／2700実NMI＝59.98／52.50／45.00表示秒。GRIPの2179／2491／2899と状態列は変更しない。

順位は**左側プレイ画面**x124..131、文字y206..212に数字1〜4を表示。ghost移動で空いたOAM4を1枚だけ使う。当初の「1/4」2枚案は採用せず、CPU車6枚＋順位1枚＋境界1枚を8枚に収める。画像・palette・PPU転送・NMI処理は追加しない。

20×20の400bytes位置表から進行量を引き、続く3更新でCPUを1台ずつ比較。32描画更新に1回、通常約0.53秒周期。ゼロページ追加なし、WRAM6130..6137の8bytes。順位のみ平均43.59375cycles、休止中27cycles、位置参照全条件最大219cycles。GRIPの休止中CPU更新は従来から37cycles増。表は32px格子なので走行中は接戦の誤差・遅れを許す簡易順位。GOALは正確な完了tickで確定し、同tickはCPU優先。

## 検証と再利用時の注意

6144状態の6502実行、GRIPの連続4799ticks同値、位置表800条件、順位1〜4、lap wrap、スタート、無効周、world境界、各GOAL時刻前後を検査。両モードの変更前後各7200frames＝計28800framesをMesen2.1.1で比較し、周回・時計・位置・記録・両ghost slotが一致。各6381main締め切りは全て間に合う。184版の既存転送拒否はDRIFT7／GRIP9で前後同数。全状態60fpsの保証にはしない。

入力のみの1周は1190NMI／1190更新、hold・main遅れ・転送拒否0。保存用の連続QAは物理実行後に経路姿勢を供給するfixtureであり、自然走行の主張と分ける。空の展開先からの可搬source再ビルドもROM byte一致。

nativeの再実行で同じemulator出力フォルダーを再利用すると、前回のbattery saveを読み込むchecksumで起動時間が変わり、タイトル入力を取り逃す。毎回新しい出力ルートを使う。再利用した試走は採用ZIPに入れていない。旧 `analyze_margins.py` はholdとmain遅れを同一視するため184の転送拒否を含む試走には使わず、今回の `check_native.py` で別々に比較する。
