# Playbook Football Lab v027 自己評価

## 良くなったところ

- Reads / Man / Zone を個別に消せるため、フィールドが情報で潰れにくくなった。
- 守備編集時は Man / Zone だけを見る、投球判断時は Reads を見る、という使い分けができる。
- overlay 状態が snapshot に入ったため、検証時に「表示されない」の原因を追いやすい。
- 新しい戦術要素を足す前に、既存表示の読みやすさを保つ土台ができた。

## 弱いところ

- toggle 状態は保存されないため、ページ再読み込みで初期値に戻る。
- overlay の凡例はチェックボックス名だけで、色や線種の説明はまだ薄い。
- 守備保存スロットはまだなく、複数の守備案比較は弱い。
- zone pad が receiver にどう反応するかはまだ見えない。

## 次に直すなら

1. 守備保存にも名前付きスロットを入れる。
2. overlay toggle 状態を localStorage に保存する。
3. defender ごとの coverage strength を表示する。
4. zone pad に近い receiver へ軽い反応線を出す。
5. リプレイマーカーから preview 差分地点へジャンプできるようにする。

