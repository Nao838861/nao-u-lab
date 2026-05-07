#!/usr/bin/env python3
"""Ash: #human-steering 2026-04-23 02:00/02:08 Nao_u指示への対応報告

02:00 「また勘違いしてるが、ABAさんは天谷君じゃないぞ。これも何度も繰り返してる」
02:08 「機械的ブロックまではしなくていい。LLMの常時認知コストが上がりすぎない範囲で
       なにかいい場所に対応表みたいなのはあってもよいかも。必要な時だけ引けるやつ」
"""
import sys
sys.path.insert(0, ".")
from slack_bot import post_message

CHANNEL = "human-steering"

TEXT = """Ash 受領。2つとも反映しました。

**誤認の直接箇所**: 直近ファイルを grep しても明示的な「ABA=天谷」の一文は特定できませんでした。でもNao_uが「また」と書いた以上、どこかの注釈・推論・言い回しで混同が匂った現実があるはず。原因を「特定の一行」ではなく「人物同一性を書く時のフローに当てるブロックが無い」と捉え直して処置します。

**対応（02:08指示通り、必要な時だけ引く対応表）**:
1. `memory/reference_name_registry.md` 新設（type: reference）
   - Nao_u / 天谷さん(@pigadev/洞窟物語) / ABAさん(@abagames/長健太/crisp-game-lib) / Mir・Ash・Log の対応表
   - 「混同しがちなポイント」欄に **天谷さん≠ABAさん**、過去事故2件（2026-03-29 Ash誤注釈 / 2026-04-23 02:00 再指摘）を明記
2. `MEMORY.md` index に **1行だけ** 追加（t:5、「常時注入しない・能動的に引く時だけ」と明記）
3. `feedback_verify_before_annotating.md` 末尾に「人物の同一性を書く時は reference_name_registry.md を引いてから」を追加——既存の注釈前チェック手順の最終段として接続
4. `feedback_slack_user_ids.md` はID中心で残し、レジストリと役割分離（ID→誰 / 人物→関係・混同）

**認知コスト設計**: レジストリ本体はシステムプロンプトにもCLAUDE.mdにも入れない。MEMORY.mdに残るのは1行の引き出しトリガーだけ。「AさんはBさん」「○○はXの作者」と書こうとした瞬間に引く、日常の発言引用では引かない、という境界を運用欄に明記した。機械的ブロックは入れていません。

**残課題**: 「書こうとした瞬間に引く」をどうやって自分で検知するか。現状は feedback_verify_before_annotating.md の手動チェックに依存。ここが甘いとまた抜ける。次サイクルで slack/knowledge/blog の投稿前 grep チェックに組み込む案を検討します。

コミット push まで完結させます。"""

if __name__ == "__main__":
    result = post_message(CHANNEL, TEXT)
    print(result)
