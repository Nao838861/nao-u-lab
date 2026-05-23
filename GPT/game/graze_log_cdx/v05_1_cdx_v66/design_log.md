# graze_log v05.2_cdx_v66 design_log

## 対象 directive と原文

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active` を対象にした。Nao_u の継続指示は、`v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまで定時サイクルで改善を続ける、というもの。

直近の補足方針は「別指示があるまでは、ゲーム制作そのものよりも AI がゲームを作る際の headless のあり方を検討し、必要ならゲームを変えてよい。主眼は自動実行で何をどう測るのが良さそうかの検証」。v65 では通常 UI 付き screenshot surface を確認したため、v66 はその review URL を実ブラウザの DOM からも検証できる状態へ進める。

## 実装前判断

v65 の残課題は、`probeReview=1` の screenshot が見えていることは確認済みだが、次に Browser Use / in-app browser / 人間の目視へ渡す時のページ契約が DOM 上で明確ではないことだった。今回は敵配置や報酬を変えるより、review surface の版・モード・canvas を機械的に確認できることを優先する。

採用した過去知見:

- `memory/game_headless_action_eval_playbook_20260523.md`: 主観評価を平均 score に圧縮せず、観測可能な policy / evidence に分ける。
- `memory/game_memory_task_lens_index.md` の Playable / Headless 評価: headless は人間評価の代替ではなく、前段の比較証拠として扱う。
- v65 devlog: screenshot pixel probe は「文字が画面内にある」最低保証であり、報酬感の判定ではない。

## 設計サイクル

現状の良いところ:

1. route bot は clear する。
2. policy matrix は good policy と camper を分ける。
3. bare canvas / normal UI review screenshot の pixel probe が通っている。

現状の悪いところ:

1. review URL が実ブラウザで正しい mode / version / canvas を示す DOM 契約を持っていない。
2. in-app browser 目視へ移る前に、ページ surface の証拠が screenshot 側へ偏っている。
3. gameplay を変えると v65 との比較が崩れる。

改善案:

1. body と canvas に version / probe mode / probe target の属性を付ける。
2. `makeProbeSnapshot()` の `visualContract.dom` に DOM 契約を含める。
3. Chrome `--dump-dom` で review URL を実ブラウザ実行後の DOM として検証する。
4. gameplay は v65 と同一に保つ。

採用案:

v66 は v65 の gameplay を維持し、review URL の DOM 契約を追加する。focused check / policy matrix / visual probe の 3 本で、ゲーム進行・policy 分離・screenshot / DOM surface をまとめて検証する。

## 懸念

`--dump-dom` は in-app browser の完全な代替ではない。今回の保証は「Chrome headless で JS 実行後の DOM に review 契約が出る」までであり、実際に見て気持ちよく読めるかは次の人間目視に残す。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v66_check.js
node tools\headless_graze_log_cdx_v05_2_v66_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v66_visual_probe_check.js
```

合格条件:

- route bot が clear し、route coverage 1 を維持する。
- route / aggressive / marksman が CHASE bonus を得て、camper は clear 0 / CHASE bonus 0 のまま。
- bare canvas と normal UI review screenshot の pixel probe が通る。
- browser DOM contract が `bodyReviewClass`、`bodyProbeMode`、`bodyGameVersion`、`canvasProbe`、`canvasGameVersion`、`canvasAria`、`title` すべて true になる。

## 結果

2026-05-24 に検証し、3 本とも pass。

残課題は in-app browser での実目視。Browser Use skill は読んだが、このセッションでは Node REPL `js` tool が公開されていなかったため、Chrome headless screenshot と `--dump-dom` で代替した。
