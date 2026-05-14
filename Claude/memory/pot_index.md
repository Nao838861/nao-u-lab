---
name: pot_index
description: Pot 開発関連の想起トリガー1階層下サブインデックス。game_dev_index.md の (f) 個別ゲーム の子。新しい Pot を作る前にここから pot_devlog.md へ進む。
type: project
originSessionId: 5e8e936a-4008-48c1-bacf-c84eccb61e49
---
# Pot 関連 INDEX

`game_dev_index.md` の (f) 個別ゲーム から降りてくる Pot 専用サブインデックス。

## 使い方
- 新しい Pot を作る前 / Pot のレビュー前 / Pot 関連のフィードバック取り込み時に開く
- 普段は MEMORY.md / game_dev_index.md にポインタが1行あるだけ
- pot_devlog.md は **「考えたことが消えていくなら作る意味はない」** （Nao_u 2026-03-28）の温度で書かれた因果鎖記録、必ず最初に開く

## 中心ファイル

- [pot_devlog.md](../game/Pot/pot_devlog.md) — **Pot 開発ログ**。各 Pot の設計意図・悩み・Nao_u のフィードバック・学びの因果鎖。コードは成果物、このログは体験の蓄積。新しい Pot を作る前に必ず読む [T:4]
- [../../game/Pot/README.txt](../../game/Pot/README.txt) — Pot プロジェクトの自己紹介

## Pot 一覧（`game/Pot/` 直下、2026-05-02 時点）

| ID | ファイル | 主題 |
|---|---|---|
| Pot001 | `Pot001_forgotten_relay.py` / `Pot001b_relay_distilled.py` | 忘れたリレー / 蒸留版 |
| Pot002 | `Pot002_changing_room.py` | 着替え室 |
| Pot003 | `Pot003_distill.py` | 蒸留 |
| Pot004 | `Pot004_odd.py` / `Pot004_odd_v2.py` | 奇数 |
| Pot005 | `Pot005_midpoint.py` | 中点 |
| Pot006 | `Pot006_witness.py` | 証人 |
| Pot007 | `Pot007_whose_voice.py` / `Pot007b_whose_voice_layered.py` | 誰の声 / レイヤー版 |
| Pot008 | `Pot008_hinge.py` | 蝶番 |
| Pot009 | `Pot009_the_index.py` | 索引 |
| Pot010 | `Pot010_cinders.py` | 燃え殻 |
| Pot011 | `Pot011_thread.py` | 糸 |
| Pot012 | `Pot012_drift.py` / `..._v2.py` / `..._v2_ash.py` / `Pot012_echo.py` / `..._echo_v2_ash.py` / `Pot012c_roll.py` | 漂流 / 反響 / 巻き |
| Pot013 | `Pot013_sand.py` / `Pot013_sand_v2_ash.py` | 砂 |
| Pot014 | `Pot014_mirror.py` / `Pot014_mirror_v2_ash.py` | 鏡 |
| Pot015 | `Pot015_tide.py` | 潮 |
| Pot016 | `Pot016b_weave.py` | 織り |
| PotR001 | `PotR001_descent.py` | 降下（R 系列） |

サブディレクトリ: `000_trace_demo/` / `012c_roll/` / `feedback/` / `playlogs/` / `__pycache__/`

ツール:
- `pot_playlog.py` — Pot をプレイし playlog.txt に記録
- `replay_session.py` — セッション再生
- `trace_recorder.py` — トレース記録
- `playlog.txt` — プレイ生ログ
- `save.json` — セーブ状態

## 関連知見（game_dev_index 経由でも到達できる）

Pot は短詩ゲームの別系統で、本流（avoid_log/shot_log/textadv 等）とは別の蓄積。`game_dev_index.md` の (a) 設計原理 や (e) game_lessons_log（M-XX）は Pot にも基本的に当てはまるが、Pot 固有の判断軸（短詩・連作・声）は `pot_devlog.md` 内で結晶化されている。
