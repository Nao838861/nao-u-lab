# visual review

headless の数値では拾いにくい、敵の意図、射線、掃け方、同じ rhythm の連続、不格好な重なりを確認する。

## 見る区間

- 0-10 秒: scout の入場、撃ち切り、下抜け。
- 8-18 秒: orange lance の横編隊、gap、横へ掃ける理由。
- 18-30 秒: diver の鋭い入場と短い show。
- 30-45 秒: carrier と side arc の重なり、pulse の使い所。
- 48 秒以降: boss 導入、phase 変化、山場の持続。

## 結果

検証日時: 2026-05-23

### 0-10 秒: scout

- route sample では scout が `entry -> show -> exit` を持ち、最初の 0.8 秒付近から縦 rail に入る。
- 1-4 秒は `visibleTargets` が 1 -> 6 -> 4 -> 1 と推移し、最初から撃つ対象がある。
- 7 秒に単独の calm 秒があるが、連続した退屈 run ではない。8 秒から side lance が入り、次の wave へつながる。
- scout は下へ抜けるため、撃ち漏らしが画面下方向の失敗として見える。

### 8-18 秒: orange lance

- side lance は横から入り、中央寄りの射線に乗ってから反対側へ掃ける。
- 16 秒台の bridge lance と 18 秒の diver が当初重なった。原因は直角 offset 不足ではなく、bridge lance の退場先と diver の入場位置が同じ左側に重なったことだった。
- 修正では bridge lance の rail を上へ移し、役割を「横圧の橋渡し」として保った。overlap check は `pairOverlaps: 0`。

### 18-30 秒: magenta diver

- diver は斜め入場、短い show、斜め退場で scout/side とは違う rhythm になっている。
- 23 秒に isolated visible-but-not-shootable があるが、連続 run ではない。次秒で shootable が戻る。
- entry が鋭く、退場は突き抜けるため、攻撃後に意志を失って漂う動きにはなっていない。

### 30-45 秒: carrier + side arc

- carrier と sideArc が重なる 32-35 秒で `enemyBullets` が 12-23 まで上がり、pulse の使い所ができる。
- sideArc は一度、左右交互の出現にした結果、退出する敵と反対側から入る敵が画面端で被った。これは出現順の問題として、片側入場の小隊ブロックへ修正した。
- 修正後の最近接は `minGap: 2.29`。かなり密だが overlap は 0 で、過剰に離していない。

### 48 秒以降: boss

- boss は 48 秒に出現し、balanced headless では 70.23 秒撃破、boss duration 22.23 秒。
- 理想通常火力 TTK は 15.97 秒、pulse burst TTK は 11.77 秒。3 秒瞬殺ではない。
- 3 phase で drift と弾 pattern が変わる。phase3 は当初危険すぎたため、弾数と fire cadence を下げた。

## 見た目上まだ疑う点

- 音がないため、撃破や pulse の手応えは視覚だけに依存する。
- route sample と headless の確認であり、人間の実ブラウザ長時間プレイとは別軸の確認が残る。
