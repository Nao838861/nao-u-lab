# Playbook Football Lab v061 自己評価

## 良くなったところ

- topbar の clock 表示が JS state と接続された。
- snap ごとに clock が進み、終盤では weak threat line が少し強くなる。
- debug snapshot で `gameClockUrgency` と clock state を検証できる。

## 弱いところ

- clock はまだ簡易モデルで、タイムアウトや hurry-up までは無い。
- replay marker window の範囲は UI にはまだ出ていない。
- game clock urgency の効き具合は実プレーで見ながら調整したい。

## 次に直すなら

1. replay marker window の範囲を UI に小さく示す。
2. marker 同士が近い時の優先順位を snapshot に出す。
3. 日本語化した文言の長さを field badge 幅に合わせてさらに短縮する。
4. mobile toolbar の visual density をスクリーンショットで確認する。
5. hurry-up / chew clock の選択を小さく足す。
