# graze_log v05.2_cdx_v25 devlog

## 目的

v24 は敵数やタイミングを調整しても、根本的には「散発的に敵が出て、直線やサインカーブでなんとなく動く」印象が残った。今回は既存ソースの延長ではなく、敵出現と敵移動を作り直した。

## ブレストと採用方針

詳細は `design_log.md` に記録した。

- Galaga からは、編隊が曲線進入し、同じ射線で連続撃破できる楽しさを借りる。ただし単発弾時代の「狙い撃ち」ではなく、オートショット縦シュー向けに「射線へ入って処理する」形へ変換した。
- 1942 からは、横幅のある編隊と安全穴の考え方を借りる。縦シューとして、横から縦一列が流れるだけの不自然な配置は避け、画面上部からの面圧として実装した。
- DonPachi 系からは、次に倒すべき対象を前もって見せ、プレイヤーが左右どちらへ移るかを wave 側で指定する考え方を借りる。

## 実装

- 旧敵ソースの `spawn1942*` / `redWing` / `orangeAce` / `hookWing` / `wheelWing` / `sinePair` 系を廃止。
- 敵種を `drone` / `marker` / `pin` / `anchorCore` / `boss` / `bossPart` に整理。
- `EXPECTED_X` で各 wave の意図するプレイヤー位置を明示。
- `stageFlags` で重要な展開が発生したかをヘッドレスから確認可能にした。
- simple bot は敵だけを追うのではなく、wave の期待位置も参照するようにした。

## 検証

実行コマンド:

```powershell
node tools\headless_graze_log_cdx_v05_2_v25_check.js
```

確認項目:

- 古い敵ソース名が `index.html` に残っていない。
- `design_log.md` にブレストと採用理由がある。
- wave label と期待位置が一致する。
- lane / switch / gap / midboss / final relay / boss の stage flag が立つ。
- BOMB / Active DEF が単体プローブで機能する。
- boss が出現し、clear まで到達する。
- simple bot が clear する。

## 残りリスク

ヘッドレスの simple bot は clear できるが、現時点では BOMB を必須行動として使わない。BOMB 自体の単体プローブは通しているが、「人間が自然に撃ちたくなる最終 cue」として成立しているかは次の人間プレイ確認が必要。
