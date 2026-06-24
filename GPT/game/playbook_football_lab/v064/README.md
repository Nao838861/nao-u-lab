# Playbook Football Lab v064

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v064 の狙い

v063 では replay marker が近い時の選択根拠を snapshot に出した。v064 では予測差分 badge の日本語文を短くし、field 上の小さな badge に収まりやすくした。

## 操作

- 赤い `weak` は最も弱い defender。
- 黄緑の `next weak` は 2 番目に弱い defender。
- weak threat line は down / distance、field position、clock pressure が厳しいほど少し強くなる。
- `予測差分` marker は結果カードの preview 差分地点へジャンプする。
- `予測:H / 圧が先` のような短い badge で、予測と結果のズレを field 上に表示する。
- replay marker はイベント frame の前後 4 frame でも active 表示を維持する。
- debug snapshot では active marker 候補と選択理由を確認できる。

## 実装済み

- compact preview delta badge copy
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
- v064 用 storage key と v063 route legacy 読み
