# Playbook Football Lab v058

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v058 の狙い

v057 では defensive look 削除確認の状態を live region でも伝えた。v058 では replay marker の active 判定を exact frame から近傍 frame に広げ、再生やスクラブ中にイベント位置を見失いにくくした。

## 操作

- 赤い `weak` は最も弱い defender。
- 黄緑の `next weak` は 2 番目に弱い defender。
- weak threat line は down / distance と field position が厳しいほど少し強くなる。
- `PREVIEW DELTA` marker は結果カードの preview 差分地点へジャンプする。
- replay marker はイベント frame の前後 4 frame でも active 表示を維持する。
- `PREVIEW DELTA` frame では field 右上に短い理由 badge が出る。
- route slot / defensive look は compact toolbar で保存、並び替え、削除する。
- 並び替えできない端では arrow button が disabled になる。
- `Delete` 確認中は残り時間が progress として減る。
- defensive look 削除確認は live region で残り秒数と結果を通知する。
- route slot と defensive look はどちらも arrow button で並び替え可能。

## 実装済み

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
- v058 用 storage key と v057 route legacy 読み
