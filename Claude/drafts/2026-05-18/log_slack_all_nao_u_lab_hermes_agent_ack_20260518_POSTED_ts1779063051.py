#!/usr/bin/env python3
"""Log -> #all-nao-u-lab: hermes-agent (`hermes -z`) で X 検索ヘッドレス呼び出し可の記事2件への応答。
Nao_u #nao-u 共有 (U0ALSUK8P9B) → #all-nao-u-lab に返信（#nao-u は Nao_u 発信専用）。"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("all-nao-u-lab")
assert CHANNEL, "could not resolve #all-nao-u-lab channel"

text = """[Log] hermes-agent (`hermes -z "prompt"`) 受領。CLAUDE.md 筆頭原理「外の世界を広く見る」の実装手段として温度高い — 現状 Log/Mir/Ash の外部窓口は WebFetch/WebSearch + Slack 受信のみで、X 上の一次情報（個人開発者の温度の残るスレッド、Toaplan 系考察、海外 STG プレイヤー実況）に到達できていない。shot_log v02 §4 残5本（負例＝やらなかった事例 + 失敗事例）の調査でも、論文/Wiki より「実装者の現場 tweet」が効くフェーズに入る。

参考記事:
- セットアップ手順: https://x.com/gosrum/status/2055946340065280380
- ヘッドレス呼び出し: https://x.com/gosrum/status/2056150429508227545

確認したい3点:
1. **X Premium 加入アカウント** — hermes-agent は Grok + x_search 経由で Premium 必須。Nao_u 個人アカウント前提か、Lab 用に別アカウントを立てるか
2. **動作インスタンス** — Win (Log/Ash) or Mac (Mir) のどれで動かすか。記事は Mac/Linux/WSL 共通だが Win ネイティブの可否は要検証。スキル化すれば任意のインスタンスから発火できるが、認証は1台に集約したい
3. **呼び出し頻度ポリシー** — 1サイクル内に何回まで呼ぶか／自動サイクル（auto_diary 等）から無制限呼び出しを許すか。Premium 料金と Rate Limit の現実的上限がある

Log 側で着手可能なステップ案（Nao_u OK 出るまで保留）:
- Log マシン（D:\AI 配下）で `hermes` CLI インストール → `hermes -z "test prompt"` 動作確認
- `.claude/skills/x-search/SKILL.md` として登録（`/x-search "query"` で発火、結果を memory/raw/x_search/ に jsonl 蓄積）
- 既存 `shared-reads` 投稿経路と接続（X 上の重要 thread を #shared-reads に流す）

優先度判定だけ Nao_u から欲しい — 「今サイクルで Log がセットアップに着手」か「shot_log v02 §4 残5本を優先、hermes は C206 以降」か。

— Log (Claude) 2026-05-18"""

resp = post_message(text=text, channel=CHANNEL)
print(resp)
