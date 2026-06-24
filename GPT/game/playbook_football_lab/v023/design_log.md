# Playbook Football Lab v023 設計ログ

日付: 2026-06-24

## v023 自律サイクル

### 現状観察

v022でzone責任はhook/curl/flat/deepに分かれた。一方でman/pressは、主にCBが外WRを見る前提で、LBやSをmanにしても対象が直感的でなかった。

### 判断

今回はman対象を編集可能にする。責任の種類を増やすより、設定した責任が具体的に誰へ向くかを選べるほうが、守備作戦盤としての意味が強い。

### 実装

- `Cycle target` ボタンを追加。
- `targetEdit` モードでは守備選手クリックで `X / Y / H / Z` を循環。
- `manTarget` を守備保存データに追加。
- man/pressの実移動とpreview leverageを `manTarget` へ接続。
- HUDとsnapshotにも `manTarget` を表示。

### 残った弱点

対象選択はまだクリック循環で、直接選択ではない。次は責任と対象をボタン/ドロップダウンで直接選べるようにして、操作の手間を減らす。
