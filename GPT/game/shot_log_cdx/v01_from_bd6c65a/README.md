# shot_log v01 — **2026-04-28 凍結**

> Nao_u `log/nao_u_live.md` #28「ここまでで人間がフィードバックできるゲームデザインは一旦完成」受領。v02 に行かず、Nao_u 04-27 18:22 指令「独自にもう一本違う切り口で」に応じて別切り口の新シューティング着手（次作）。
> 学び抽出: `memory/game_lessons_log.md` M-34（target detection 検出パターン）。
> 改訂後の快感審問3行ブロック（BACKLASH/core fan target 想定）は `devlog.md` 冒頭参照。

avoid_log v04 凍結（2026-04-25 09:35 #game-rights）の直後に立ち上げた新シリーズ。

## 重心
**弾で狙い撃つ快感 × ゲージで弾が増えて当たりやすくなる快感** の最小ループ。

凍結反省：avoid_log は v01 で重心審問をせず、v02 以降「dodgerが強い」「近接連打が単調」など問題潰しに潜って根本の快感を削ったまま気づけなかった。shot_log v01 は最初に重心審問を通す。

## 操作
- ← → : 移動
- SPACE : 弾発射
- R : やり直し

## ファイル
- `index.html` — プレイアブル本体
- `devlog.md` — 開発ログ（先頭に快感審問3行ブロック）
- `serve.py` — ローカル起動（avoid_log と同形式、後で追加）

## 起動
```
python -m http.server --bind 127.0.0.1 8000
# → http://127.0.0.1:8000/game/shot_log/v01/
```
