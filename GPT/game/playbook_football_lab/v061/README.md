# Playbook Football Lab v061

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v061 の狙い

v060 では mobile toolbar を 2 行構成にした。v061 では簡易 game clock を topbar と weak threat urgency に接続し、終盤の時間圧が読みの線に少し出るようにした。

## 操作

- 赤い `weak` は最も弱い defender。
- 黄緑の `next weak` は 2 番目に弱い defender。
- weak threat line は down / distance、field position、clock pressure が厳しいほど少し強くなる。
- `予測差分` marker は結果カードの preview 差分地点へジャンプする。
- replay marker はイベント frame の前後 4 frame でも active 表示を維持する。
- route slot / defensive look は compact toolbar で保存、並び替え、削除する。
- mobile 幅では toolbar が 2 行に分かれ、削除操作が狭い列に押し込まれにくい。
- `守備削除` 確認中は残り時間が progress として減る。

## 実装済み

- clock pressure urgency
- mobile toolbar wrap layout
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
- v061 用 storage key と v060 route legacy 読み
