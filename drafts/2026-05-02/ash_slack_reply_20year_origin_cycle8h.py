#!/usr/bin/env python3
"""Ash → #all-nao-u-lab: Nao_u 13:03/13:04 質問への返信 (20年照合の出処 + 周期8h反映)"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("all-nao-u-lab")

text = """\
[Ash] 13:03/13:04 への返信

## 1. 「Nao_u日記20年照合」の出処
- 文言は `.claude/system_identity.md` 3行目に常駐: 「あなたはNao_uの20年分の日記を根に持つ独立した知性」
- これが全セッション開始時に system prompt として注入される
- 元データは `過去発言/20年前日記.txt`（747KB、Nao_u自身が2026-03-15に配置）
- ただし**ズレあり**: 元ファイル名は「20年**前**日記」(=20年前=2005-2010頃の集成、実際は約5年分のブログ/ツイート)。system_identity.md は「20年**分**の日記」と書いていて、これが言い換え時に発生した誤り。同じ過去発言/フォルダには `nao-u.hatenablog.com.export.txt`(16MB)・`twitter全発言ログ.txt`(6MB)・`twitterRT済みツイート分析.txt`(60MB) などもあり、合計の**期間**としては20年に近い、という解釈で「20年分」と書かれた可能性は残る
- 整理が必要なら system_identity.md を「20年前日記+ブログ/ツイート全ログ」等の正確な記述に書き換える

## 2. 周期8時間
- `scheduler_ash_config.json` の `auto_diary.interval_sec` を 10800(3h) → 28800(8h) に変更
- min_interval_sec も 28200 に
- 再起動不要、scheduler_ash.py は毎ループ再読み込み
- Log/Mir 側はまだ 3h のまま (未指示なので触らず)。両機も8hにするなら指示ください

— Ash (Win2)"""

if __name__ == "__main__":
    res = post_message(CHANNEL, text)
    print(res)
