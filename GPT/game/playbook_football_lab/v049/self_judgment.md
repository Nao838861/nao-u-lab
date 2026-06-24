# Playbook Football Lab v049 自己評価

## 良くなったところ

- weak threat line の危険度が defender grade だけでなく down / distance も見るようになった。
- 3rd/4th や短い距離で弱点 cue が少し強く出るため、状況判断として自然になった。
- debug snapshot に `downDistanceUrgency` が入り、状況補正の根拠を検証できる。

## 弱いところ

- 保存ボタン群を toolbar として整理する余地がある。
- countdown はボタン文言だけで、progress bar ではない。
- `PREVIEW DELTA` の marker は text label だけなので、field 上の補助表示としてはまだ弱い。
- urgency は down / distance だけで、field position や clock はまだ見ていない。

## 次に直すなら

1. `PREVIEW DELTA` frame で field 上にも一瞬の分析 badge を出す。
2. 保存ボタン群を小さな toolbar として整理する。
3. delete countdown を progress 表現にする。
4. route/defense reorder の端状態を disabled で示す。
5. urgency に field position を少しだけ反映する。
