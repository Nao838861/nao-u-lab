# graze_log v05.2_cdx_v28 design_log

## 入力原文

> 一旦、選んだ既存ゲームの出現パターンと、出現後の軌跡や軌跡を追従する速度などを、既存ゲームの完全再現を目指してやってみて。shot_logも同じようにやってもらった。

## 反省

v25 は「Galaga / 1942 / DonPachi から型を借りた」と書いたが、実態は抽象化だった。具体的な出現順、敵数、軌跡、追従速度を見て写したものではなく、「曲線で入る」「横幅圧を出す」という言葉を実装しただけだった。

今回の v28 は、まず 1942 の公開資料に明示されている編隊単位をトレース対象にする。

## 参照情報

- Arcade Database / MAME 1942:
  - 赤い小型機は5機または10機の編隊を飛ぶ。
  - 5機編隊全滅で500点、10機編隊全滅で1000点。
  - 最後の機体を倒すと POW が出る。
  - 小型機が下左右からゆっくり出て上へ飛ぶことがある。
  - 特定ステージで5機V字の赤編隊が上からまっすぐ降りる。
- NES manual mirror:
  - RED FORMATION を全滅させると POW が出る。
  - POW には火力、画面内敵全滅、僚機などがある。

## ブレスト cycle 1: 何を「再現」と呼ぶか

1. ゲーム名だけを wave 名に入れても再現ではない。
2. 敵数が原作資料の単位と合っている必要がある。
3. 赤5機/10機は最初に入れるべき。
4. 全滅報酬があるため、編隊は group として扱うべき。
5. 速度は「速い/遅い」ではなく duration frame として記録する。
6. 軌跡は名前ではなく座標列で残す。
7. 原作座標系を持たないと、毎回感覚値になる。
8. 1942 は 224x256 画面なので、それを基準座標にする。
9. 現在の 420x620 へ sx/sy で変換する。
10. 赤V字は x=112 を中心に左右オフセットを置く。
11. 赤10機は左右交互の ladder としてまず写す。
12. 横から来る敵は side curl としてベジェで写す。
13. 下から上へ飛ぶ低速機は bonus plane として写す。
14. screen-wide pass は安全穴を作るが、1942 の後半情報なので暫定。
15. 大型機は boss proxy として置く。
16. ボスそのものは 1942 stage 32 にはないため、graze_log の finite stage 都合で proxy と明記する。
17. 既存の v25 marker/pin/anchorCore は使わない。
18. 敵名も red/gray/bonus/bomber/boss に寄せる。
19. まず12 wave 程度で短く確認する。
20. bot が clear できるかは最低限の壊れていない確認。
21. bot が面白さを保証しないことは明記する。
22. BOMB 自発使用はまだ成立していない。
23. ただし今回の主目的は敵軌跡トレースなので、BOMB は残課題に回す。
24. 速度感は headless では見えないので auto_verify が必要。
25. auto_verify は bot=1 で見られるよう維持する。
26. design_log には参照元と非再現部分を分ける。
27. 「完全再現を目指す」と「完全再現できた」を混同しない。
28. まずは public reference で明示された編隊を正とする。
29. 次に動画フレーム単位の観察ができれば座標を詰める。
30. 今回は v28 として別フォルダにする。

## ブレスト cycle 2: 実装する trace card

1. `1942 red five V down`: 赤5機V字。中心 x=112、左右 16/32px、250F。
2. `1942 left curl squadron`: 左から8機。左外から入り、中央寄りへ曲がって下へ抜ける。285F。
3. `1942 right curl squadron`: 右から8機。同上の鏡像。
4. `1942 red ten ladder`: 赤10機。左右交互、上下にずらして編隊として下へ抜ける。315F。
5. `1942 bottom bonus plane L`: 下左からゆっくり上へ飛ぶ小型機。360F。
6. `1942 mirrored side curls`: 左右 side curl を時間差で重ねる。
7. `1942 screen width pass gap R`: 横幅 pass。右側を安全穴にする。
8. `1942 bomber escort entry`: 左右護衛 curl と中央大型機。
9. `1942 red five V repeat faster`: 同じ5機Vを少し速く再提示。
10. `1942 bottom bonus plane R`: 下右からの低速機。
11. `1942 boss warning red ten`: ボス前の赤10機 restock。
12. `1942 large bomber proxy`: graze_log 用の大型機 proxy。

## ブレスト cycle 3: 採用/却下

### 採用

- 224x256 source coordinate を持つ。
- `traceLine` / `traceBezier` で軌跡を明示する。
- group 全滅報酬を入れる。
- stage flag と traceLog で、どの wave が発火したか検査する。
- public reference にない部分は proxy と書く。

### 却下

- v25 の `marker / pin / anchorCore` を再利用する。
- 「DonPachi switch」など抽象概念の wave 名を残す。
- 1942 と言いながら敵数を自由に変える。
- 速度を `fast` / `slow` だけで表す。
- boss を 1942 stage 32 の正確な再現と言い張る。

## 残りリスク

- これは動画フレームから起こした完全コピーではない。公開資料に明示された編隊単位を、原作座標系でトレースカード化した段階。
- 実際の 1942 stage 32 の最初の数 wave の順番と一致している保証はない。
- ただし v25 のような「名前だけ引用」からは進み、敵数・group・座標・duration を持つ再現試作になった。
- bot は clear するが BOMB を使わない。次は boss final cue と BOMB の自然使用を別途詰める。
