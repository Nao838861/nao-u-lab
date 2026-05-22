# graze_log v05.2_cdx_v53 design_log

## 対象 directive 原文

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md`:

> `v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

現在の焦点:

> 次は still screenshot だけでなく、probeFrame を複数連続で撮るか、Browser Use Node REPL が使えるセッションで実ブラウザ目視し、alpha 0.10 の guide が動きとして読めるかを確認する。薄すぎる場合は alpha 0.12 か短い fade 調整を試す。

## 実装前判断

v52 では Chrome probe 画像で、guide は見えるがかなり薄いと分かった。今回は stage / enemy / bullet / reward / bot policy を変えず、横移動 wave の guide alpha だけを 0.10 から 0.12 に上げる。合わせて post-midboss と cross-lock の各 3 frame を撮る probe check を作り、静止画 1 枚ではなく短い動きとして読めるかを確認する。

使う過去知見:

- `Playable / Headless 評価`: clear だけでなく、狙った瞬間の可視状態を検証する。
- `Repair / Iterative Improvement`: 面白さを断定せず、変更後 regression と観測証拠を残す。
- `Feedback / Rights / Human Judgment`: headless は人間評価の代替ではなく、人間が見るべき差分を絞る補助にする。

## 設計サイクル 1

良いところ / 悪いところ 30件:

1. 良い: v52 は route clear / grade S を維持している。
2. 良い: v52 は chevron を削除している。
3. 良い: v52 は exact frame probe を持つ。
4. 良い: v52 guide は矢印記号には戻っていない。
5. 悪い: v52 guide はかなり薄い。
6. 悪い: still 2 枚だけでは動きの読め方が弱い。
7. 良い: alpha 0.12 は小さい変更で試せる。
8. 悪い: alpha を上げすぎると UI lane marker に戻る。
9. 良い: lineWidth と chevrons を維持すれば記号感は抑えられる。
10. 悪い: guide duration を変えると gameplay digest 以外の見え方が変わる。
11. 良い: alpha だけなら trace で明確に確認できる。
12. 悪い: 見た目変更は headless の楽しさ指標には出ない。
13. 良い: Chrome probe の bytes と画像で最低限確認できる。
14. 悪い: 実ブラウザ手操作の目視はまだ未完了。
15. 良い: 3 frame 連続なら入る/ピーク/抜けるが見える。
16. 悪い: 3 frame でも動画ではない。
17. 良い: `.tmp` 出力なら commit を汚さない。
18. 悪い: `.tmp` は証拠として git に残らない。
19. 良い: design_log に結果を残せる。
20. 良い: v53 は v52 へ簡単に戻せる。
21. 良い: 敵配置を変えないので評価条件が揃う。
22. 悪い: playable content の新 wave は増えない。
23. 良い: 継続 directive は focused evaluation も対象。
24. 悪い: 完成判断にはまだ人間プレイが必要。
25. 良い: style compare で regression を見られる。
26. 悪い: v52 と trace digest はほぼ同じになる。
27. 良い: 同じであることが今回の狙い。
28. 良い: alpha 差は guide event に残る。
29. 悪い: alpha 0.12 が強すぎる時の fallback が必要。
30. 良い: fallback は v52 の alpha 0.10 に戻すだけでよい。

改善案 30件:

1. v52 を v53 にコピーする。
2. `GAME_VERSION` を v53 にする。
3. title / h1 を v53 にする。
4. ledger source を v53 にする。
5. source notes に v53 を足す。
6. `GUIDE_ALPHA` を 0.12 にする。
7. `GUIDE_LINE_WIDTH` は 2.2 のままにする。
8. `chevrons:false` は維持する。
9. guide path は維持する。
10. guide duration は維持する。
11. enemy color は維持する。
12. wave spawn は維持する。
13. scoring は維持する。
14. bot policy は維持する。
15. probeFrame は維持する。
16. v53 normal check を作る。
17. v53 visual check を作る。
18. v53 Chrome probe check を作る。
19. post-midboss 3060/3090/3120 を撮る。
20. cross-lock 3860/3890/3920 を撮る。
21. v013 style compare を作る。
22. latest2 compare を走らせる。
23. README を v53 に書き換える。
24. devlog を v53 に書き換える。
25. continuous directive を更新する。
26. staging に記録する。
27. memory raw record が増えたら stage 対象にするか判断する。
28. 無関係な dirty files は混ぜない。
29. commit する。
30. push する。

筋の良い案:

`alpha=0.12` のみを採用し、連続 probe で確認する。解決できる問題は、v52 の「見えるが薄い」を推測で放置せず、最小調整として読める方向へ寄せられること。新しい懸念は、guide が少し強くなって敵の動きではなく UI 誘導に見える可能性。

## 設計サイクル 2

候補比較 30件:

1. alpha 0.11: 変化が小さすぎる可能性。
2. alpha 0.12: 小さいが目視差が出そう。
3. alpha 0.14: 強くなりすぎる可能性。
4. lineWidth 2.6: lane marker 感が戻る。
5. duration 延長: 読めるが説明っぽくなる。
6. duration 短縮: 見逃しやすくなる。
7. fadeIn 強化: 出現の違和感が出る。
8. fadeOut 早め: 動きの終端が読みづらい。
9. chevron 復活: v51 の改善を戻すので却下。
10. 敵色だけ強化: guide の薄さには直撃しない。
11. ghost enemy path: 次回候補として有効。
12. guide を点線化: 記号感が増す。
13. 3 frame probe: 今回に合う。
14. 6 frame probe: やや重いが許容。
15. 動画生成: 今回は過剰。
16. Browser Use 目視: このセッションでは Node REPL がない。
17. Chrome screenshot: 現在使える。
18. canvas command check: alpha と chevron なしを機械確認できる。
19. route bot only: 見た目 probe には十分。
20. 複数 bot screenshot: path guide 確認には不要。
21. style compare: gameplay regression 確認に必要。
22. score diff: 変更目的とずれる。
23. trace digest diff: 変更なしを確認する。
24. guide event alpha: 変更ありを確認する。
25. screenshot bytes: 最低限の非空確認。
26. 画像目視: 最終判断に必要。
27. README 更新: probe 利用の迷いを減らす。
28. devlog 更新: 戻しやすくする。
29. continuous directive 更新: 次焦点を残す。
30. staging 更新: phase の成果を残す。

筋の良い案:

「alpha 0.12 + 6枚 Chrome probe + gameplay digest 比較」をセットにする。解決できる問題は、見た目を少しだけ改善しながら、ゲーム内容を変えていないことを検証できる点。懸念は、画像確認が主観に残ること。

## 設計サイクル 3

実装採用 30件:

1. v53 を作る。
2. alpha 0.12 にする。
3. v53 source note を入れる。
4. check で v53 version を確認する。
5. check で alpha 0.12 を確認する。
6. visual check で guide stroke を確認する。
7. visual check で chevron-like stroke 0 を確認する。
8. Chrome probe で 6 PNG を生成する。
9. PNG bytes を確認する。
10. style compare v013 を実行する。
11. latest2 compare を実行する。
12. route clear を維持する。
13. aggressive clear を維持する。
14. defensive / panic の失敗傾向を維持する。
15. routeEvents を維持する。
16. boss final cue を維持する。
17. postMidCrossWave を維持する。
18. crossLockWave を維持する。
19. guide trace count 2 を維持する。
20. alpha diff 以外の guide shape は維持する。
21. README を短く書く。
22. devlog を短く書く。
23. design_log に判断理由を残す。
24. continuous directive を更新する。
25. staging に path / verification を残す。
26. `.tmp` は commit しない。
27. memory raw record は今回の compare 出力なら stage する。
28. 無関係 atom 群は stage しない。
29. commit / push する。
30. push 後 status を確認する。

捨てたもの:

- chevron 復活。
- wave / 敵配置の同時変更。
- alpha 0.14 以上の強い guide。
- 今回の段階で動画生成まで広げる案。

## 採用案

`v05_1_cdx_v53` として、guide alpha を 0.12 に上げ、6 frame Chrome probe と v53 headless checks を追加する。

## 懸念

- alpha 0.12 が UI 誘導に見える可能性がある。
- headless は「読めそうな画像が出る」ことまでは確認できるが、人間がプレイ中に読めるかはまだ別評価。
- Browser Use in-app browser では未確認。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v53_check.js
node tools\headless_graze_log_cdx_v05_2_v53_visual_check.js
node tools\headless_graze_log_cdx_v05_2_v53_chrome_probe_check.js
node tools\headless_game_style_compare_v013.js
node tools\compare_graze_log_style_latest2.js
```

## 検証結果

2026-05-22 実行。

- `node tools\headless_graze_log_cdx_v05_2_v53_check.js`: pass。route bot は `mode=clear`、`grade=S`、`routeEvents=29`、`killCount=162`、`maxChain=20`、`bombCount=1`。guide trace は `crossLockGuide=1`、`postMidCrossGuide=1`、`readabilityGuides=2`、`alpha=0.12`、`lineWidth=2.2`、`chevrons=false`。
- `node tools\headless_graze_log_cdx_v05_2_v53_visual_check.js`: pass。frame 3090 / 3890 の canvas command で nonblank draw ops、guide path stroke 2 本、chevron-like stroke 0 本を確認。
- `node tools\headless_graze_log_cdx_v05_2_v53_chrome_probe_check.js`: pass。Chrome で `.tmp/graze_log_cdx_v53_probe/` に post-midboss 3060/3090/3120、cross-lock 3860/3890/3920 の PNG 6 枚を生成し、すべて 43KB 以上。
- 画像目視: alpha 0.12 の guide は alpha 0.10 より読みやすいが、まだかなり控えめ。左右へ交差する path として見え、chevron 的な矢印記号感は戻っていない。
- `node tools\headless_game_style_compare_v013.js`: pass。v53 record を `memory/raw/game_eval/graze_log_style_compare.jsonl` に追記。
- `node tools\compare_graze_log_style_latest2.js`: pass。v52 -> v53 は route / aggressive が clear 維持、defensive / panic が over 維持。routeEvents、kills、hits、bombs、pressure、movementSwitches、guide trace digest は全 policy で同値。

## 残課題

alpha 0.12 は採用可能に見えるが、まだ実手操作中の視認性は未検証。次は Browser Use Node REPL が使えるセッションで in-app browser 目視するか、guide duration / fade を触る前に実プレイ相当の moving check をもう少し強くする。
