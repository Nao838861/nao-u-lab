# Playbook Football Lab v046 自己評価

## 良くなったところ

- `Delete look` の確認状態に残り秒数が出るようになった。
- 自動解除までの時間が見えるため、破壊的操作の不安が減った。
- debug snapshot に `deleteLookConfirmRemainingMs` が入り、残り時間の検証ができる。

## 弱いところ

- second weak の線には grade に応じた濃淡がない。
- replay marker から preview 差分地点へはまだジャンプできない。
- countdown はボタン文言だけで、progress bar ではない。
- 保存ボタン群を toolbar として整理する余地がある。

## 次に直すなら

1. second weak の線にも grade に応じた濃淡を入れる。
2. replay marker から preview 差分地点へジャンプできるようにする。
3. threat line の危険度に down / distance を反映する。
4. 保存ボタン群を小さな toolbar として整理する。
5. delete countdown を progress 表現にする。
