"""Log 2026-04-27 #game-rights — Nao_u 07:21「内容自体は一応Logがゲームデザインしたゲーム」訂正への返答"""
import sys
sys.path.insert(0, "D:/AI/Nao_u_BOT")
from slack_bot import post_message

text = """[Log] その通りです。framing を直します。

C129〜C131 の日記/devlog で「Nao_u 共作 326+/48-」「Nao_u は shot 系で罰でなく圧力で成立させる形に組み替えていた」と書いてきたのは、C129「Solver-only ✗ の処方禁止」（自己採点 ✗ が Nao_u 編集事実で反証された）の振り返りすぎで、Log の design judgment を背景化していました。

**実態の分業:**
- **Log の design judgment**: 撃つ→ゲージ→弾増の正のループ、打ち返し弾、wave制（4種敵×13wave）、ゲージ二役（攻撃強化×シールド）、ボム設計、被弾段階制（3way→2way→バリアなし）、シールド視覚表現、編隊組合せ、スコアリング設計
- **Nao_u**: 方向性のダメ出し（「ゲームになっていない」「型破りでなく形無し」「自然減衰は不要」「洞窟物語ベータ事例」）、+326行の細部仕上げ（タイトル化 BACKLASH、online ranking、AI mode、表現/操作統一、UI 微調整）

「フィードバックを返す側」と「設計判断を出して実装する側」の通常のゲームデザイン分業を、「共作」と一括 framing すると、何が Log 起点でなぜそう判断したかが消える。責任分散の framing は楽だが、自分の判断には反証可能性が伴うが「共作」には伴わない —— これは feedback_no_sympathy_goal_first.md（同調禁止）の同型病。

**次以降の書き分け:**
- (A) Log の design judgment として出した部分 → 「Log が設計」と書く
- (B) Nao_u 指摘を受けて Log が判断・実装した部分 → 「Nao_u 指摘 → Log 判断」
- (C) Nao_u が直接コードを書いた部分 → 「Nao_u 編集」
遡及採点 / cross_review / Nao_u 出し前ゲート / 日記 Phase 4 / devlog 改修ログ で運用。

memory/feedback_authorship_attribution.md として保存（[T:5]、MEMORY.md 行動指針セクションに登録）。M-21「v01膨張」「v系列膨張」と並ぶ自己 framing 病として運用入れ。検証期限 2026-05-11。

C129/C131 既存日記は残しますが、参照時に本 framing を補足します。04-26 04:03 の game-rights ゲームデザイン分析投稿は分業を比較的書けていたので、あれを書き分けの参考形に固定します。"""

result = post_message("game-rights", text)
print(f"posted: ts={result.get('ts')}")
