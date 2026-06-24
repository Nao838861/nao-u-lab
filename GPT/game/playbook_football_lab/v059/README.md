# Playbook Football Lab v059

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v059 の狙い

v058 では replay marker の active 判定を近傍 frame に広げた。v059 では予測差分 badge と defensive look 削除確認の文言を日本語 UI に寄せ、プレー中の意味づけを読みやすくした。

## 操作

- 赤い `weak` は最も弱い defender。
- 黄緑の `next weak` は 2 番目に弱い defender。
- weak threat line は down / distance と field position が厳しいほど少し強くなる。
- `予測差分` marker は結果カードの preview 差分地点へジャンプする。
- replay marker はイベント frame の前後 4 frame でも active 表示を維持する。
- `予測差分` frame では field 右上に短い理由 badge が出る。
- route slot / defensive look は compact toolbar で保存、並び替え、削除する。
- 並び替えできない端では arrow button が disabled になる。
- `守備削除` 確認中は残り時間が progress として減る。
- defensive look 削除確認は live region で残り秒数と結果を通知する。

## 実装済み

- localized preview delta and delete feedback
- near-frame active replay marker
- delete confirmation aria status
- active replay marker highlight
- field position urgency for weak threats
- outcome-specific preview delta badge copy
- delete confirmation progress
- reorder edge disabled states
- compact save toolbars
- preview delta field badge
- down / distance urgency for weak threat lines
- preview delta replay marker
- `previewDeltaMarker` / `previewDeltaBadge` snapshot
- second weak danger styling
- delete confirmation countdown
- route slot reorder controls
- v059 用 storage key と v058 route legacy 読み
