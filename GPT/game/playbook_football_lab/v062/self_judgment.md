# Playbook Football Lab v062 自己評価

## 良くなったところ

- replay marker の active window が title / aria-label で確認できる。
- snapshot で現在 frame から active marker までの距離を検証できる。
- 見える UI を増やさずに、補助情報と検証性を上げられた。

## 弱いところ

- marker 同士が近い時の優先順位は snapshot にまだ出ていない。
- active window の説明は hover / assistive 情報なので、常時視認できる情報ではない。
- clock はまだ簡易モデルで、タイムアウトや hurry-up までは無い。

## 次に直すなら

1. marker 同士が近い時の優先順位を snapshot に出す。
2. 日本語化した文言の長さを field badge 幅に合わせてさらに短縮する。
3. mobile toolbar の visual density をスクリーンショットで確認する。
4. hurry-up / chew clock の選択を小さく足す。
5. replay marker の kind ごとに title の理由文を短く整える。
