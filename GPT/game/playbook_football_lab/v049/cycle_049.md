# cycle_049

## 判断

v048 で preview 差分へ replay marker から戻れるようになった。次に残る粗さは、弱点 cue の危険度が defender grade だけで、3rd short や 4th down のような状況重要度を見ていないことだった。フットボールらしい判断では down / distance が大きく効くため、v049 では threat line の強さに状況 urgency を混ぜる。

## 実装

- `downDistanceUrgency()` を追加し、down と distance から 0 から 0.42 の urgency を返すようにした。
- `weakThreatStyle()` の danger に urgency を加えた。
- `secondWeakThreatStyle()` には控えめに urgency を加え、主 weak より弱い階層を保った。
- debug snapshot に `downDistanceUrgency` を追加した。
- v049 用 storage key に更新し、v048 route を legacy 読みにした。

## 検証

- `node --check game\playbook_football_lab\v049\game.js`
- `node --check game\playbook_football_lab\v049\verify.js`
- `node verify.js`
- v049 内に v048 固有のタイトル・サイクル名が残っていないことを検索する

## 次の候補

- `PREVIEW DELTA` frame で field 上にも一瞬の分析 badge を出す。
- 保存ボタン群を toolbar として整理する。
- delete countdown を progress 表現にする。
