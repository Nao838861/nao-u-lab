# graze_log v05.2_cdx_v67 design_log

## 対象 directive と原文

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active` を対象にした。Nao_u の継続指示は、`v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまで定時サイクルで改善を続ける、というもの。

直近の補足方針は「別指示があるまでは、ゲーム制作そのものよりも AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要ならゲームを改変してよいが、主眼は自動実行で何をどう振るのが良さそうかの検証」。

## 実装前判断

v66 は `probeReview=1` の review URL に DOM contract を追加した。今回の弱点は、実ブラウザや screenshot を人間が見る時に、CHASE popup の frame / side / distance / readable 判定が canvas 内の見た目だけに閉じており、DOM から照合しづらいことだった。

今回は gameplay を変えず、review surface を「人間目視へ渡す前の観測面」として強化する。採用した過去知見は次の通り。

- `memory/game_headless_action_eval_playbook_20260523.md`: headless は面白さ判定ではなく、主観 feedback を policy / telemetry に翻訳する補助。
- `memory/game_memory_task_lens_index.md` の Playable / Headless 評価: 起動確認だけでなく、人間評価前の比較証拠を残す。
- v66 devlog: DOM contract は「正しい URL を開ける」保証であり、報酬感の判定ではない。

## 設計サイクル 1

現状の良い点: route が clear する、camper が失敗する、CHASE bonus が good policy にだけ出る、bare canvas pixel probe がある、normal UI screenshot がある、DOM contract がある、version が DOM に出る、canvas が labeled、policy matrix が複数 seed を持つ、density timeline がある、popup occlusion が測れる、popup distance が測れる、screenshot が保存される、bad-policy failure が残る、route coverage が見える、boss cue が trace に残る、Active DEF 使用が残る、BOMB 使用が残る、guide trace が残る、source note が残る、v65/v66 から gameplay 比較しやすい、Chrome `--dump-dom` が使える、human review URL が定まる、review screenshot の canvas 位置が取れる、CHASE 文字 pixel が取れる、policy split が score 以外も持つ、camper score が低い、panic churn が見える、route/aggressive/marksman の違いが出る、ログが JSON で残る。

悪い点: review panel がない、frame と popup の対応が DOM で読めない、screenshot だけでは座標根拠が弱い、panel なしでは Browser Use に渡す情報が薄い、popup が読める理由を人間が追いにくい、review URL の目的が DOM から弱い、`makeProbeSnapshot()` と実 DOM の対応が薄い、headless 結果が長すぎる、review surface が canvas 一枚に寄っている、CHASE の side が画面外資料にない、距離が画面上にない、readable 判定が画面上にない、policy 名が review 面に出ない、version と frame が review 面で弱い、popup がない frame の扱いが見えにくい、panel 自体の存在検査がない、screenshot の高さが panel なし前提、DOM regex が v66 固定、source note assertion が継承関係に弱い、visual probe の結果が人間に説明しづらい、通常プレイとの差分が見えにくい、review UI が headless 専用か曖昧、テレメトリと画面の対応が離れている、将来の in-app browser 目視で再現条件を取り違えやすい、DOM contract が canvas 周辺で止まっている、popup readable が true でも理由が残らない、review surface の品質判定が pixel だけに偏る、policy matrix と visual probe の橋が弱い、次回の比較対象が増えない。

改善案: review panel を足す、panel に version を出す、panel に frame を出す、policy を出す、phase を出す、CHASE active count を出す、readable yes/no を出す、side を出す、player distance を出す、popup box を出す、player 座標を出す、panel dataset を付ける、DOM dump で panel を検査する、screenshot 高さを増やす、visual probe に panel text 検査を入れる、source note を v66/v67 継承に直す、gameplay は据え置く、focused check で route clear を維持する、policy matrix を再実行する、visual probe を再実行する、panel は `probeReview=1` のみ表示する、bare probe では隠す、通常プレイには出さない、`makeProbeSnapshot()` に panel DOM 欄を足す、Chrome screenshot と DOM を同じ URL で取る、report に browserDomContract を残す、docs に「面白さ判定ではない」と明記する、staging に path と検証を書く、continuous directive を更新する。

筋の良い案: gameplay を変えず、review panel を headless 専用 surface として追加する。これにより、screenshot の目視、DOM contract、telemetry の対応を同じ URL で確認できる。懸念は UI が増えることだが、`probeReview=1` のみ表示に限定すれば通常 playable を汚さない。

## 設計サイクル 2

別案として、ゲーム内 CHASE 表示そのものを大きくする、popup 色を変える、報酬量を変える、敵配置を変える、bot policy を増やす、in-app browser 専用テストを作る、Playwright を導入する、画像 OCR を足す、スクリーンショットを contact sheet 化する、`makeProbeSnapshot()` だけ拡張する、HTML の meta に結果を入れる、URL query を増やす、review mode を別 HTML に分ける、ログだけ増やす、policy matrix の seed を増やす、camper だけ再検査する、route だけ再検査する、CHASE popup の cooldown を変える、panel に色 swatch を入れる、panel に event ledger digest を入れる、panel に boss cue overlap を出す、panel に too near/far を出す、panel に suppressed count を出す、panel に screenshot path を出す、panel を canvas 上に overlay する、panel を canvas 下に置く、panel を JSON script tag にする、panel を hidden data だけにする、panel を table にする、panel を compact grid にする、panel を normal UI にも出す。

採用しない理由: gameplay 変更は v66 との比較を壊す。bot 追加は主眼から外れる。OCR や Playwright 導入は依存と失敗面が増える。hidden data だけでは人間目視に渡す surface にならない。canvas overlay はゲーム画面を邪魔する。別 HTML は対象 URL が分裂する。したがって canvas 下の compact grid が最小である。

## 設計サイクル 3

最終確認の観点: 通常プレイに出ない、bare canvas に出ない、review screenshot に収まる、DOM で読める、version が一致する、frame が一致する、botStyle が一致する、CHASE count が一致する、readable が true になる、popup pixel が読める、canvas 位置が取れる、route clear が維持される、policy matrix が維持される、camper clear 0 が維持される、camper CHASE 0 が維持される、route/aggressive/marksman が CHASE を得る、noise bound が維持される、occlusion bound が維持される、review panel の文言が長すぎない、CSS が単色一辺倒にならない、レイアウトが縦に収まる、DOM regex が過剰に脆くない、source note が v66/v67 両方を残す、devlog が判断を残す、continuous directive が次焦点を残す、staging が evidence を残す、commit 対象を限定する。

採用案: `v05_1_cdx_v67` は v66 gameplay を維持し、`probeReview=1` で `#reviewinfo` を表示する。`data-probe-review-panel="chase-summary"` と dataset に version / frame / bot style / chase count / readable / side / distance を入れ、Chrome `--dump-dom` と screenshot で検査する。

## 懸念

review panel は「報酬感が気持ちよい」ことを直接判定しない。保証するのは、目視対象の frame と CHASE popup の位置・距離・読み取り可能性が同じ review URL で確認できることまで。次の cycle では、Browser Use が使えるなら実際に `probeFrame=838&probeDraw=1&probeReview=1` を開き、人間視点で邪魔さと報酬感を確認する。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v67_check.js
node tools\headless_graze_log_cdx_v05_2_v67_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v67_visual_probe_check.js
```

合格条件:

- focused check が route clear、boss cue、BOMB、Active DEF、source note を維持する。
- policy matrix が route/aggressive/marksman clear と CHASE bonus、camper clear 0 / CHASE 0 を維持する。
- visual probe が bare canvas pixel、review screenshot、DOM contract、review panel contract をすべて pass する。

## 結果

2026-05-24 に 3 本とも pass。focused check は最初に source note assertion が `v67 keeps gameplay identical to v65` を探して失敗したが、実際の破綻ではなく検査条件の更新漏れだった。v66/v67 の継承関係を明示する assertion へ直して pass。
