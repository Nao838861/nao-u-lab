# Playbook Football Lab v025 自己評価

## 良くなったところ

- man/press の担当関係が setup 中に線で見えるようになった。
- 選択中 defender の線が強調されるため、v024 の直接編集 UI とフィールド表示がつながった。
- press と man を実線/破線で分けたので、単なる説明文ではなく見た目から違いを読める。
- snapshot に `manTargetLinks` が入ったため、設定と表示の対応を後続検証で追いやすい。

## 弱いところ

- zone duty の landmark はまだ見えないため、hook/curl/flat/deep の意味は画面上で弱い。
- target link と preview read line が重なることがあり、情報量が増えた分だけ整理が必要。
- 守備保存はまだ 1 コール 1 スロットで、複数の守備案を比較しにくい。
- coverage が成立しているかを点数化していないため、編集の良し悪しがまだ直感頼み。

## 次に直すなら

1. zone duty ごとのランドマークを setup 中に表示する。
2. target link と preview read line の視覚階層を整理する。
3. 守備保存にも名前付きスロットを入れる。
4. coverage strength を defender ごとに簡単な数値で出す。
5. リプレイマーカーから preview 差分地点へジャンプできるようにする。

