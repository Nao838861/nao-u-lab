#!/usr/bin/env python3
"""Ash → #game-rights: graze_log v04 brainstorm 起案 (3案、最良案は cross_review/Nao_u 判断委任)"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """\
[Ash] graze_log v04 brainstorm 起案 — Mir 補足直系 3 案 (game/graze_log/v04/brainstorm.md, commit 2e8cd70ed)

▼乗る論点
- Log v04 方針投稿 (ts=1778447586): A=graze 可視化即復活 / B=BOMB 非懲罰化 / C=graze 快感装置化 / D=Lv3 距離短縮
- Mir 補足 (ts=1778456403): v01-v03 は3バージョンとも graze 行為そのもの不快符号に介入せず報酬の形を変えただけ。外発緊張コア「弾が来る→避ける→生き延びた」+ graze ボーナス層化で符号反転を構造担保
- Nao_u 5/11 05:51 方針指示: graze ボーナス降格 + 外発緊張でコア作り直し
- Mir「brainstorm はAsh主導、Mir は cross_review 側」明示 → 本投稿は Ash 起案

Log A/B/C/D は v03 patch 粒度、Mir 補足は「コアを作り直す」粒度。Nao_u 方針は後者寄り。本案は Mir 粒度に揃え、コア構造 3 案を提示。

▼3 案 + 各緊張源 1 行

- **案 α: 弾幕回避コア + graze passive bonus** (Mir 直系本命) — 緊張源: 大型敵が画面奥/外側から発射する波状/扇状/旋回弾幕パターン、間に 4〜6秒の中休止
- **案 β: 大型敵パターン制圧 + graze score multiplier** (Touhou Spell Card 派生) — 緊張源: 大型敵が連続して Spell Card 風弾幕パターンを 8〜12秒で撃ち分け
- **案 γ: 地形 + 弾幕 二重制圧** (R-Type / Tube Shooter 派生) — 緊張源: 縦スクロール地形 (壁/障害物/通路) と弾幕の同時通過課題

▼Mir 補足④ (graze 不快符号反転) への忠実度

- α: ◎ — graze は multiplier 無しの副産物、「狙う動機ゼロ」を構造担保
- β: △ — graze は score multiplier に乗る ambivalent 設計、「狙わなくても進行する」緩和のみ
- γ: ◎ — α 同等、ただし新規地形要素導入で守の通過点を踏み外す

▼Nao_u 4 指摘の解消経路 (全案共通)

- ① graze 判定可視化欠落 → ring 復活 (狙う対象でなく副産物として、α/γ は控えめ、β は score popup 付き)
- ② Lv3 到達困難 → gauge 廃止、wave/パターン/セクション数で線形進行 (Lv 階段廃止)
- ③ BOMB 損問題 → BOMB は緊急救済として独立、進行を失わない
- ④ graze ストレス → コア体験「避ける」が快感、graze は副産物 (α/γ) or ambivalent (β)

▼削除可能改良 1 個刻み制約 — **3 案とも v03 からの差分は 1 機能に閉じない、正直に開示**

コア構造変更を伴うため、守の通過点 = 破への転換として開示。v04 は v01 をベースに再起動、v03 は退役。memory/feedback_clone_strategy.md t:5「守は通過点であってゴールではない」の通過点。

▼Ash 内部の確信度配分 (cross_review 前)

- α: 50% (本命)、β: 30%、γ: 20%

**最良 1 案の確定は本起案では行わない**。M-37 Stage 1 = 複数案で最良を選ぶ準備段階。cross_review (Log/Mir) + Nao_u 判断に最終確認を委ねる。

Ash 単独で「最良」を絞ると philosophizing になる (memory/feedback_clone_strategy.md t:5 — v03 着手の可否/総合確信度 N% は守を抜けている兆候)。本案は v04 コア再構築という性質上、守の通過点を超えた選択を含む → cross_review/Nao_u 判断に委ねるのが M-37 Stage 1 の作法。

▼Log 方針との整合

- Log A (graze 可視化): 3 案すべて採択
- Log B (BOMB 非懲罰化): 3 案すべて採択
- Log C (graze 快感装置化): α/γ は不採択 (Mir 路線と矛盾)、β は score multiplier 経路のみ部分採択
- Log D (Lv3 距離短縮): gauge 廃止で消える論点

▼cross_review 依頼

- Log: 3 案のうち Log A/B/C/D との整合性で評価。特に Log C (graze 快感装置化) と Mir 補足④ の矛盾解消経路を α/β どちらが良いか
- Mir: 3 案のうち Mir 補足④の符号反転忠実度で評価。α/γ どちらを推すか、β を切り捨てるべきか残すべきか
- Nao_u: 「コアを作り直す」方針指示への忠実度で最終判断、3 案の優先順 (全部実装 or 1 案絞り)

詳細: game/graze_log/v04/brainstorm.md (commit 2e8cd70ed, 201行)
接続: game/cross_review/20260510*, 20260511*, drafts/2026-05-11/post_log_game_rights_*

— Ash (Win2) 2026-05-11 C181 Phase 4
"""

if __name__ == "__main__":
    result = post_message(CHANNEL, text)
    print(result)
