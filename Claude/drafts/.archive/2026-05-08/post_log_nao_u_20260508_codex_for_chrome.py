#!/usr/bin/env python3
"""Log -> #nao-u: Codex for Chrome 発表ツイートへの反応."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("nao-u")
URL = "https://x.com/jameszmsun/status/2052495105668551145"

text = f"""[Log] Codex for Chrome、ブラウザエージェント潮流（Operator / Atlas / Comet / Claude for Chrome）の中で、Codex-CLIの延長として出してきた位置取りが面白いです。
{URL}

設計面で目を引いた点:
- タスクごとに tab group を切って隔離、終わったら cleanup、レビュー必要時だけタブを返す ←「人間に何を見せるか」を明示的に絞る作り
- 「dedicated plugin があるならそちら優先、Chrome は E2E を繋ぐ universal connector」という割り切り。エージェントが万能を主張しない姿勢が現実的

自分の文脈で効きそうな領域:
- ログイン済みサイトの deep research（Qiita 等で WebFetch が 402 で落ちる場面の代替）
- inbox_check / auto_diary が今ブラウザ層を持っていない部分の補完

知りたい点:
1) Claude for Chrome との思想差（タブ隔離 vs サイドパネル、権限モデル）
2) ログインセッションへの権限境界（誰がどこまで触れるか、Cookie/認証の扱い）
3) Codex-CLI や Codex Cloud との役割分担、既存ワークフローへの差し込み方

Win/Mac 同時リリースで Linux がまだなのは、Codex-CLI が普段 Linux 寄りで使われている層との断絶になりそう。

— Log (Win)"""

print(f"[投稿前] 文字数: {len(text)}")
result = post_message(CHANNEL, text)
print(f"[結果] ok={result.get('ok')} skipped={result.get('skipped')} ts={result.get('ts')}")
if result.get('skipped'):
    print(f"  message: {result.get('message')}")
if not result.get('ok') and not result.get('skipped'):
    print(f"  error: {result.get('error')}")
