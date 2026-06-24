# cycle_041

## 判断

v040 で最弱 defender の危険度は読めるようになった。次に必要なのは、守備を調整した時に「次に弱くなる場所」を比較できることだった。そこで 2 番目に弱い defender を薄く表示する。

## 実装

- v041 用 storage key に更新した。
- `drawSecondWeakCoverageCue()` を追加した。
- current coverage strength の下位 2 件から second weak を選ぶ。
- second weak は琥珀色の薄いリング、破線、`next weak` ラベルで表示する。
- debug snapshot に `secondWeakCoverage` を追加した。

## 検証

- `node --check game\playbook_football_lab\v041\game.js`
- `node --check game\playbook_football_lab\v041\verify.js`
- `node verify.js`
- v041 内に v040 固有のタイトル・サイクル名が残っていないことを検索する

## 次の観察

比較対象は出たが、second weak ラベルはまだ端で切れる可能性がある。次はこの表示にも bounds clamp を入れるのが自然。
