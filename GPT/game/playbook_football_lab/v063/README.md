# Playbook Football Lab v063

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v063 の狙い

v062 では replay marker の active window を title / aria-label / snapshot に出した。v063 では marker 同士が近い時の選択根拠を snapshot に追加し、replay の検証性を上げた。

## 操作

- 赤い `weak` は最も弱い defender。
- 黄緑の `next weak` は 2 番目に弱い defender。
- weak threat line は down / distance、field position、clock pressure が厳しいほど少し強くなる。
- `予測差分` marker は結果カードの preview 差分地点へジャンプする。
- replay marker はイベント frame の前後 4 frame でも active 表示を維持する。
- marker button の title / aria-label で active window を確認できる。
- debug snapshot では active marker 候補と選択理由を確認できる。
- route slot / defensive look は compact toolbar で保存、並び替え、削除する。

## 実装済み

- replay marker priority snapshot
- replay marker active range label
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
- v063 用 storage key と v062 route legacy 読み
