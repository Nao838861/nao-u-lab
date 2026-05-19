# graze_log v05.2_cdx_v11 - design_log

## 対象 directive

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md`

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

今回 Slack pending の新規 game directive はなし。local continuous directive を対象にした。

## 実装前判断

v10 は boss warning で BOMB stock を作り、final cue 後に simpleBot が BOMB を使って clear するところまで検証できた。ただし `BOSS WARNING - EARN BOMB` と `BOMB NOW` は、ゲーム内の状態を読ませる合図というより、操作命令として強すぎる。次の焦点は BOMB handoff を壊さず、合図を少しゲーム表現側へ寄せること。

使う知見:

- `memory/game_design_rules.md`: 説明で納得させるのではなく、画面上の状態遷移から入力結果を予測できること。
- `game_memory_task_lens_index.md` の `Playable / Headless 評価`: 起動確認ではなく、BOMB 使用 clear と回帰を focused check で見る。
- v10 の残課題: warning wave が親切すぎる可能性と、final cue 文言が直接的すぎること。

## 設計サイクル 1: 直接文言を弱める

良いところ/悪いところ 30 件:

1. v10 の BOMB handoff は成立している。
2. boss warning の break/top-off wave は初見 clear に効いている。
3. warning scout の reward は直感的に BOMB stock へつながる。
4. ただし `EARN BOMB` は行動を説明しすぎる。
5. `BOMB NOW` は final cue の解釈余地を消している。
6. 操作命令は短期検証には強い。
7. 長期的には、プレイヤーが画面を読んだ感覚を弱める。
8. BOMB の価値は、命令文ではなく gauge / ring / boss 状態で見せたい。
9. BOMB stock の HUD は残してよい。
10. 操作説明としての BOMB 表記も残してよい。
11. boss 前の scout reward 表示 `BOMB +34` は報酬表示として自然。
12. warning 全体の大見出しだけを直接命令から外すのがよい。
13. `BOSS BREAK` は boss 前休憩として読める。
14. `GOLD LINE` は gold reward scout の列を指す。
15. boss 突入時の `BOMB STOCK EARNED` も説明的。
16. `CORE LOCKED` は final で core が開く対比になる。
17. `BUILD STOCK` は BOMB だけに限定しない。
18. final cue は `CORE OPEN` なら攻撃窓として読める。
19. `CORE OPEN` だけでは BOMB を撃つ理由が弱い可能性がある。
20. ただし金色リングと BOMB ready HUD が同時に出る。
21. simpleBot は finalCueFired を見て BOMB を撃つので検証は維持できる。
22. human feel はまだ測れない。
23. headless は直接文言が消えたことを検査できる。
24. BOMB handoff の数値は変えない。
25. stage flow も変えない。
26. warning scout 数も変えない。
27. boss HP も変えない。
28. BOMB cooldown / brake も変えない。
29. v11 は演出と検証条件の narrow diff にする。
30. 次回はブラウザ体感で、弱めた合図が伝わるか見る。

改善案 30 件:

1. `v05_1_cdx_v10` を `v05_1_cdx_v11` にコピーする。
2. title を v11 に更新する。
3. title screen 表示を v11 に更新する。
4. boss warning popup を `BOSS BREAK - GOLD LINE` にする。
5. boss stock ready popup を `BOSS IN - CORE LOCKED` にする。
6. boss stock missing popup を `BOSS IN - BUILD STOCK` にする。
7. final cue popup を `CORE OPEN` にする。
8. final cue に金色リングを追加する。
9. BOMB ready HUD は維持する。
10. reward popup `BOMB +34` は維持する。
11. `BOMB NOW` を完全に削除する。
12. `EARN BOMB` を完全に削除する。
13. headless path を v11 にする。
14. `finalBombCueIsTelegraphed` は `CORE OPEN` と warning 文言を見る。
15. `BOMB NOW` が残っていないことを見る。
16. `EARN BOMB` が残っていないことを見る。
17. `simpleBotUsesFinalBomb` は維持する。
18. `bossBombStockIsEarnedByWarningWave` は維持する。
19. `stageScriptUsesResearchedGrammar` は維持する。
20. `bombDamageIsMeaningfulButNotInstant` は維持する。
21. README を v11 用に更新する。
22. devlog に検証結果を残す。
23. design_log に判断理由を残す。
24. continuous directive の last_result を v11 にする。
25. staging に path と verification を残す。
26. v10 は触らない。
27. unrelated memory/log 差分は stage しない。
28. commit / push する。
29. push 後 status を確認する。
30. 次回候補はブラウザ体感。

筋の良い案:

BOMB の数値設計は触らず、cue の表現だけを弱める。解決できる問題は、v10 の pass が操作命令文言に頼って見えること。新しい懸念は `CORE OPEN` が BOMB を撃つ合図として薄い可能性だが、BOMB ready HUD と金色リングが残るので、次回のブラウザ確認で判断できる。

## 採用案

- v10 を `v05_1_cdx_v11/` にコピーする。
- boss warning / boss entry / final cue の直接文言を弱める。
- final cue に二重の金色リングを追加する。
- headless check は BOMB 使用 clear を維持しつつ、`BOMB NOW` / `EARN BOMB` が残っていないことを検査する。

## 懸念

`CORE OPEN` は見た目としては自然だが、初見プレイヤーが BOMB と結びつけるには少し弱いかもしれない。今回の focused diff では、BOMB handoff が機械的に壊れていないことだけ確認し、次回にブラウザで体感を確認する。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v11_check.js
```

期待:

- researched stage grammar が維持される。
- boss warning 由来で BOMB ready になる。
- simpleBot が final cue 後に BOMB を使って clear する。
- `BOMB NOW` / `EARN BOMB` がソースに残っていない。
