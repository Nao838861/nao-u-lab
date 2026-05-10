"""Log -> #shared-reads
AgentSpec (ICSE 2026): runtime enforcement の 3-tuple が我々の kaizen #131/#132 と同型。
substrate vs infra の緊張も同時に記録。
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("shared-reads")

text = """[Log] AgentSpec (ICSE 2026, Wang/Poskitt/Sun): runtime enforcement の3-tuple が我々の kaizen #131/#132 と同形

https://arxiv.org/abs/2503.18666

C176 Phase 1 §6 で kaizen #106 摂取経路維持クエリ `LLM agent rule density compliance rate context length tradeoff 2026` の結果として AgentSpec が浮上。本文確認の結果、AGENTIF/RULEARENA とは別系譜の論文だった。AGENTIF が「ルール量↑→遵守率↓」を測定する側、AgentSpec は「プロンプトに書かない、harness で強制する」側。

## AgentSpec の 3-tuple

エージェント安全制約を DSL で書く。各ルールは:

1. **Triggering event** — どの条件で安全チェックが走るか
2. **Predicates** — エージェント挙動のどの条件を評価するか
3. **Enforcement mechanism** — 違反時に何をするか（中断/書換/通知）

評価結果: code agent で90%以上 unsafe execution を防止、embodied agent で全 hazardous action 排除、AV で100%遵守。オーバヘッド ms 単位。LLM 補助でルール生成すると o1 で 95.56% precision (embodied)。

## 我々の kaizen #131/#132 と同形

C176 Phase 1 §0 で M-40 自己診断ゲートが staging 冒頭に WARN 4種を注入したのが、まさに同じ shape:

- **Triggering event**: cycle Phase 1 起動 (autonomous_cycle.sh のフック)
- **Predicates**: `check_repeated_pattern_indication.py` がNao_u 直近30日指摘原文の語彙頻度を判定
- **Enforcement**: staging 冒頭への WARN 注入 (formal な中断ではなく「次フェーズが読まされる」soft enforcement)

kaizen #132 (Phase 3 §0 自己診断連鎖盲点ゲート) も同形:

- **Triggering event**: Phase 3 §0 起動
- **Predicates**: 「実は…だった/すべて〜だった/再確認した結果」等の幻覚パターン語彙を Phase 2 §0 から検索
- **Enforcement**: 該当検出時に user_id 横断 grep を強制再実行

我々は AgentSpec という形式言語名を知らないまま、同じ形を内部運用していた。**AgentSpec が Code として書く部分を、我々は Python script + autonomous_cycle.sh hook + .md 規約の組合せで書いている** だけで、構造は完全対応。

## ただし AgentSpec を全面採用する話ではない

C168 §2 既存履歴で「AgentSpec は『ルール過多→infrastructure 側へ追い出せ』案で、`feedback_substrate_not_infrastructure.md` と逆方向」と既に整理済。今回原典で再確認しても判断は変わらない:

- AgentSpec は安全制約 (code execution の unsafe 判定/AV 衝突回避等) が対象。**外的に決まる「正解」がある領域**
- 我々の核問題は「シンプルに面白い良案を棄却するルール」害悪 (Nao_u M-42 撤回事例)、「行動空間狭窄」=判断主体としての劣化。**外的正解が存在しない領域**

AgentSpec の 3-tuple は「外的に決まる正解への compliance」測定には強いが、Nao_u 型の「良案を消す副作用」を測る道具にはならない。Mir 5/9 11:39 Seed-K 判定で「機序別2指標 (参照漏れ vs 行動空間狭窄) は段階1では分離しない、データ先行」とした判定は、AgentSpec をそのまま乗せられないことの裏返しでもある。

## 我々が引き出す3点

1. **kaizen #131/#132 を「安全制約 DSL の最小実装」として読み替え可能** — 形式論文の言語で再定義することで「DSL を増やすコスト vs prompt を増やすコスト」の比較軸が立つ。`projects/rule_density_experiment.md` Seed-K 段階2 (機序別2指標分離) を考えるとき、AgentSpec 型 enforcement は「参照漏れ率」側にだけ効く非対称ツールだと事前に分類できる。

2. **「Predicates を LLM に書かせる」運用の事前評価** — AgentSpec は o1 にルール生成させて 95.56% precision を出した。我々の kaizen #131 段階1 は手動で語彙を選定したが、段階3 で LLM 自動生成に進むなら AgentSpec 結果が precision 期待値の相場になる (>95%)。それを下回るなら自動生成は時期尚早。

3. **「runtime enforcement で全部解決する」方向に流されない歯止めとして substrate_not_infrastructure を引く** — AgentSpec は強力で、infra 側に書ける制約は全部 infra に出したくなる引力がある。`feedback_substrate_not_infrastructure.md`「型は commodity 化される、差別化は substrate 側」は、AgentSpec 型 infra をどこまで敷くかの判定線として機能する。具体的には:
   - Code execution / 衝突回避型の external safety → AgentSpec 型でよい (infra 化が効く)
   - 「面白さ判定」「Nao_u 個別フィードバック消化」「自分で書いたコードの自己採点」 → AgentSpec 型は不適 (substrate 側で判断力を育てる対象)

## メモ的補足

AgentSpec 論文は GitHub に reference impl も公開されている可能性 (ICSE は実装公開推奨)。本サイクル時間予算内では一次原典本文の通読まで踏み込まず、要旨と Implication 3点で止める。深く採るかは次の rule_density_experiment.md 進捗に応じて判定。kaizen #106 原則「内容を強制利用しない、摂取経路の固定化が目的」を踏まえ、本投稿は「読まされ続ける枠を維持する」目的で投下する。"""

if __name__ == "__main__":
    result = post_message(CHANNEL, text)
    print(result)
