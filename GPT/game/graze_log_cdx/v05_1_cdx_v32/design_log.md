# graze_log v05.2_cdx_v29 design_log

## 対象 directive

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の active 指示を対象にした。Slack direct pending はなかった。

> v25 の simple bot は clear するが BOMB を必須使用しない。次は「人間が自然に撃ちたくなる final cue」として BOMB の役割を再評価する。

直近の `v28` は 1942 trace study として headless が通っていたが、bot は BOMB なしで A clear していた。つまり、BOMB の final cue を評価する土台としては不足していた。

## 実装前判断

今回は敵編隊をさらに変えない。v28 の 1942 trace labels / source notes / coordinate scale は維持し、boss 終盤だけを playable diff にする。敵配置を同時に変えると、BOMB cue の評価と wave 文法の評価が混ざるため。

使う過去知見:

- `Playable / Headless 評価`: 起動だけでなく、final cue が発火し、bot が BOMB を使って clear するかを検証する。
- `Balance / Rule Space`: BOMB を常時強化ではなく、stage 最後の明確な役割として置く。
- `Feedback / Rights / Human Judgment`: headless は面白さ判定ではなく、cue と BOMB 使用が検証可能になったかだけを見る。

## 設計サイクル 1

良いところ / 悪いところ:

1. v28 は 1942 参照が具体的。
2. red five / red ten / side curl / bonus plane がある。
3. boss まで到達する。
4. clear できる。
5. stage flags が検証可能。
6. しかし BOMB なしでも clear できる。
7. BOMB cue が発火しているか分からない。
8. boss final が通常ショットの延長に見える。
9. BOMB を使わない A clear と使う S clear の差が体験前に読めない。
10. gauge を貯める理由が boss final と結びついていない。
11. cooldown だけでは「今撃つ理由」にならない。
12. scoring boost は cue として読みにくい。
13. 弾速半減は final ではなく防御補助に見える。
14. boss HP が多いだけだと作業になる。
15. boss が無敵になるだけだと理不尽に見える。
16. 画面中央の cue が必要。
17. cue と入力可能状態がずれると混乱する。
18. gauge 不足で cue だけ出ると罰に見える。
19. BOMB が clear に直結すると役割は明確。
20. ただし鍵穴化のリスクがある。
21. lock まで通常ショットで進めると、通常プレイの流れは残る。
22. lock は boss 終盤だけに限定できる。
23. lock 発生時に gauge を満タン化すれば「撃てる cue」になる。
24. `bossFinalCue` flag を検証できる。
25. bot が BOMB 使用 clear すれば検査できる。
26. 敵配置へ手を入れないので diff が読みやすい。
27. v28 へ戻す手順も短い。
28. BOMB damage は boss final だけで意味を持てばよい。
29. Active DEF を触らないため副作用が少ない。
30. 人間評価では強制感を確認する必要がある。

改善案:

1. boss 終盤で CORE LOCK を表示する。
2. boss 終盤で gauge を満タン化する。
3. BOMB damage を boss final で clear に足る値へ上げる。
4. BOMB なしでは通常ショットが lock HP 以下を削れないようにする。
5. lock 中だけ画面中央に `PRESS SPACE/B` を出す。
6. bot は `bossFinalCue` を見て BOMB を撃つ。
7. headless は cue flag と BOMB clear を検査する。
8. BOMB cooldown はそのままにする。
9. Active DEF は触らない。
10. wave timing は触らない。
11. boss HP 全体は触らない。
12. clear grade は BOMB 使用で S を継続する。
13. cue popup を短くする。
14. lock HP を低めにして通常ショット区間を残す。
15. cue 発生前に BOMB を撃ててもよいが、bot は final まで温存する。
16. `CORE CHARGED` と `CORE LOCK` が混ざりすぎないよう中央文言を明確化する。
17. README に「検証用 diff」と明記する。
18. devlog に強制感リスクを書く。
19. check は `?bot=1` を明示する。
20. final cue を stageFlags に残す。
21. v29 は BOMB cue 以外の評価を主張しない。
22. boss visual は最小変更に留める。
23. lock を見えない補正にしない。
24. gauge refill は lock イベントの一部として扱う。
25. BOMB key は SPACE/B 両方を表示する。
26. clear probe は手動 BOMB の機能を維持する。
27. Active DEF probe は regress していないか残す。
28. v28 の 1942 trace checks は維持する。
29. staging に BOMB 使用数を残す。
30. continuous directive の last_result を更新する。

筋の良い案:

- **CORE LOCK + guaranteed BOMB**: boss 終盤で削りが止まり、cue と gauge refill を同時に出す。

解決できる問題:

- BOMB なし clear では final cue を評価できない問題。
- BOMB を撃つべき瞬間が曖昧な問題。
- headless が BOMB 役割を検査していない問題。

新しく生じる懸念:

- 「BOMB を撃て」という鍵穴に見える可能性。
- gauge refill が都合のよい補正に見える可能性。
- boss 終盤で通常ショットが効かないことに違和感が出る可能性。

## 設計サイクル 2

候補比較:

1. cooldown 強化: 連打は防ぐが、final cue にはならない。
2. BOMB 後弾速半減: 防御補助にはなるが、boss final で撃つ理由が薄い。
3. score boost: 体感 cue として弱い。
4. boss 大弾幕化: BOMB を撃ちたくなるが、避けられないだけに見える危険がある。
5. CORE LOCK: 強制感はあるが、BOMB の役割は最も明確。

複数問題を同時に解ける案:

- CORE LOCK は cue / BOMB 使用 / headless 検証を同時に解く。
- 敵配置や道中資源設計を触らないため、v28 trace study の評価を壊しにくい。

懸念:

- 面白さではなく手続きとして BOMB を押させているだけになる可能性がある。これは次回の人間プレイ確認事項に回す。

## 設計サイクル 3

採用:

1. `BOSS_FINAL_LOCK_HP = 17`
2. lock 発生時に `bossFinalCue` flag を立てる。
3. lock 発生時に gauge を `G_MAX` にする。
4. lock 中は boss への通常ショット damage を止める。
5. BOMB boss damage を 22 にして、lock 後の BOMB で clear できるようにする。
6. headless は `botClearsWithBomb` を必須にする。

捨てる:

1. 道中 wave の追加変更。
2. Active DEF の再調整。
3. BOMB cooldown の再調整。
4. score multiplier や弾速半減の追加。
5. boss 弾幕密度で BOMB を強制する案。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v29_check.js
```

期待:

- 1942 trace の既存検査がすべて通る。
- `bossFinalCue` が true になる。
- bot が BOMB を 1 回使用する。
- bot が `S` clear する。

## 検証結果

2026-05-21 実行。`bossFinalCue: true`、`bombCount: 1`、`grade: "S"`、`botClearsWithBomb: true` を確認。

## 残課題

人間プレイで、CORE LOCK が「ここで BOMB を撃つ climax」と読めるか、「指定された入力を押すだけ」と見えるかを確認する。後者なら、lock ではなく boss の危険行動や演出で BOMB を自然化する必要がある。

# graze_log v05.2_cdx_v32 design_log

## 対象フィードバック

v09 は既存ゲームの参照を再現できていない低質な劣化コピーであり、複数タイトルを寄せ集めても散漫さが増すだけ。
v30 も単に出現テンポが変わっただけで、敵の出現パターンや移動アルゴリズムの悪さは残っている。
shot_log はベストではないにせよ最低限の水準に達していたため、その方向の「気持ちよい敵配置」を、より精度を上げて作る必要がある。

## 実装前判断

複数タイトル混合をやめる。
v32 は DonPachi Stage 1 に寄せる。

参照元の完全コピーではなく、公開資料で確認できる stage 文法を graze_log のルールへ移す。
具体的には、30f chain window、硬い敵を chain 早期に入れる構造、bunker release、high turret midboss、boss 部位構造を採用する。

## 採用

1. 30f chain window を `CHAIN_WINDOW=30` として実装。
2. 小型 heli connector を短い列として置く。
3. tank / bunker / crane / stock carrier を硬い chain 起点にする。
4. bunker は時間経過で smallTank を放出する。
5. midboss は aimed + spread の短い危険ピークにする。
6. boss は core + back/side parts にする。
7. back part は wide 7-way、side part は fast stream。
8. parts 破壊後に core を開き、BOMB cue を出す。

## 捨てたもの

- v09 の Ikaruga / Gradius / Touhou / DonPachi 混合。
- v30 の `spawnFuelColumns` 型の直線 fuel 追加。
- 「敵数が増えればよい」という評価。

## 検証

`node tools\headless_graze_log_cdx_v05_2_v32_check.js` pass。

bot は `killCount=67`, `maxChain=16`, `bombCount=1`, `grade=S`。
`usesSingleSource`, `chainWindowModeled`, `reachesMidboss`, `reachesBossParts`, `usesHardTargetRelease`, `bossPartStructure`, `botClearsWithBomb` がすべて true。
