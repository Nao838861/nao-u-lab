# visual review

headless の数値では拾いにくい、敵の意図、射線、掃け方、同じ rhythm の連続、不格好な重なりを確認する。

## 見る区間

- 0-10 秒: scout の入場、撃ち切り、下抜け。
- 7-14 秒: orange lance の横編隊、gap、横へ掃ける理由、左右の問い返し。
- 14-22 秒: diver と support scout の鋭い入場、短い show、中央照準への戻し。
- 22-39 秒: carrier setup cross、carrier と side arc の重なり、pulse の使い所。
- 48 秒以降: boss 導入、phase 変化、山場の持続。

## 結果

検証日時: 2026-05-23

### 0-10 秒: scout

- route sample では scout が `entry -> show -> exit` を持ち、最初の 0.8 秒付近から縦 rail に入る。
- 1-4 秒は `visibleTargets` が 1 -> 6 -> 4 -> 1 と推移し、最初から撃つ対象がある。
- 7 秒に単独の calm 秒があるが、連続した退屈 run ではない。8 秒から side lance が入り、次の wave へつながる。
- scout は下へ抜けるため、撃ち漏らしが画面下方向の失敗として見える。

### 7-14 秒: orange lance

- side lance は横から入り、中央寄りの射線に乗ってから反対側へ掃ける。目的は「横を向かせる」だけではなく、中央撃ちの直後にプレイヤーの照準を横へ振ること。
- 左からの orange lance は 7 秒台から詰めた間隔で入り、10 秒台に右からの返しを置いた。片側の長い単調列ではなく、左右の圧を短い会話にした。
- gap は「被らないために遠ざける」ではなく、同一軌跡をテンポよく撃ち切れる間隔として調整した。overlap check は `pairOverlaps: 0`。

### 14-22 秒: magenta diver

- diver は斜め入場、短い show、斜め退場で scout/side とは違う rhythm になっている。目的は、横圧のあとに中央付近を短く刺して、撃ち遅れを作ること。
- support scout を前倒しで混ぜ、diver だけが孤立して流れる区間を減らした。18-19 秒と 23-25 秒に出ていた boring run は redesign 後に消えた。
- entry が鋭く、退場は突き抜けるため、攻撃後に意志を失って漂う動きにはなっていない。

### 22-39 秒: carrier setup + carrier + side arc

- carrier setup cross は、carrier が出る前に横へ振って照準を散らすための区間。左右を無意味に同時化せず、時間分離して「交差しているように見えるが重ならない」状態へ寄せた。
- carrier は単体で硬い的にするのではなく、sideArc と弾幕を重ねて pulse の判断を作る。32-36 秒台は `enemyBullets` が増え、撃つか避けるかの圧が出る。
- redesign 後の最近接は `minGap: 0.08`。数値上は非常に密だが `pairOverlaps: 0`。過剰に離してテンポを殺すより、同一軌跡上の時間差で密度を残す方を選んだ。

### 48 秒以降: boss

- boss は 48 秒に出現し、redesign 後の balanced headless では 68.82 秒撃破、boss duration 20.82 秒。
- 理想通常火力 TTK は 15.97 秒、pulse burst TTK は 11.77 秒。3 秒瞬殺ではない。
- 3 phase で drift と弾 pattern が変わる。phase3 は当初危険すぎたため、弾数と fire cadence を下げた。

## 見た目上まだ疑う点

- 音がないため、撃破や pulse の手応えは視覚だけに依存する。
- route sample と headless の確認であり、人間の実ブラウザ長時間プレイとは別軸の確認が残る。
- `minGap: 0.08` は攻めた密度なので、実画面では一部の敵が窮屈に見える可能性がある。ここは「重ならない」を過剰適用して間延びさせないため、次に目視で最初に見る。
