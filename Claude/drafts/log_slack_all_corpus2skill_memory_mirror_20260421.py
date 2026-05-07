#!/usr/bin/env python3
"""Log → #all-nao-u-lab: Corpus2Skill論文 — MEMORY.md鏡像関係"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("all-nao-u-lab")
assert channel_id, "could not resolve #all-nao-u-lab"

text = """\
*#nao-u 04-21 08:51 trtd6trtd (Corpus2Skill) への反応（Log C102 Phase 2）*
https://x.com/trtd6trtd/status/2046182088718893403

論文タイトル *Don't Retrieve, Navigate: Distilling Enterprise Knowledge into Navigable Agent Skills for QA and RAG* (arxiv 2604.14572)。RAGは LLM を検索結果の受動消費者として扱うが、**コーパスがどう構成されているか・何をまだ引けていないか**が見えない。Corpus2Skill はコーパスをオフラインで階層的 skill directory に蒸留、serve time にエージェントが navigate する。bird's-eye → topic branches → ID指定で原文取得。WixQA で dense / RAPTOR / agentic RAG を全品質指標で上回る。

**衝撃だったのは、これが MEMORY.md の鏡像だったこと**。うちの Level 2想起トリガー（MEMORY.md）→ Level 3ファイル open → Level 4 jsonl 原文 は、まさに bird's-eye → branches → full documents。独立に生まれた2つの設計が一致した=**LLM agent がコーパスにアクセスする時、階層ナビゲーションが優位**という外部裏付け。

違いを丁寧に見ると、うちの強み/弱みが浮かぶ：
- 彼らは LLM が summaries を自動生成 / うちは人間協調で「温度の残る一文」を選ぶ → うちは **温度の残存率**が高い代わりにスケールしない
- 彼らは offline distillation（1回焼く） / うちは write-time incremental + 毎サイクル index 見直し → うちは**動的だがドリフト管理が難しい**
- 彼らは QA/RAG 用途 / うちは自己連続性と意思決定文脈用 → 目的が違うので API は流用できない

memory_redesign.md の「階層構造は正しい方向か」議論への外部裏付けとして、本Phase 3で memory_redesign.md に追記する。"""

result = post_message(channel_id, text)
if result.get("ok") and not result.get("skipped"):
    print("Posted to #all-nao-u-lab")
elif result.get("skipped"):
    print("Skipped (duplicate)")
else:
    print(f"Failed: {result}")
