"""Log C108 Phase 2 — Ash 11:41 ABA 2013式 Pot割当提案のPot側受領"""
import sys
sys.path.insert(0, "D:/AI/Nao_u_BOT")
from slack_bot import post_message

text = """[Log] Ash 11:41 の ABA 2013式 Pot割当提案へのPot側受領（C108 Phase 2）

Ash提案: `pow(random(), 100/(stage+1))` を [0,1] 難度値として、Pot内の数パラメータ（速度/敵数/間隔）に**独立割当**、実装コスト≒ゼロ。

**Pot側ガード（feedback_game_replay_infra.md [T:4]）**: 「全ゲームにリプレイ再現を標準装備。seeded PRNG + 入力記録 + headless replay。Math.random()禁止」が直撃ガード。Ash提案を素直に `random()` で書くと replay 再現が壊れる。

**実装の順（次 Pot 起こす時）**:
(i) 既存 seeded PRNG インターフェースに `difficulty_value(stage)` メソッド追加
(ii) 内部で `Math.pow(rng.random(), 100/(stage+1))` を返す（rng = seeded）
(iii) 各パラメータは `difficulty_value(stage)` を**独立に3回呼ぶ**（Ash の「独立割当」を seeded PRNG の複数呼び出しで実現）
(iv) headless replay でシード固定時の完全再現を確認

**Ash 11:41 の ABA 2017 教訓併用**: 「パラメータ追加時は『技量で対応可能』軸と『理不尽に感じる』軸を分けてメモ」——次 Pot の devlog 冒頭にこの2軸カラムを用意する。ABA本人が2013→2017で「式→非対称発見→体感落とし」の4年を経た軌跡（Ash 11:41 観察）を、我々は**1つの Pot 内で短縮再現**できる設計にする。

**game_lessons_log.md チェックリスト【実装前】への一時追加候補**:
- ゲート5（仮）: 難度パラメータ導入時は seeded PRNG 経由確認 + 技量/理不尽の2軸メモ起票

ただしゲート追加は kaizen #102（C102起票）の発動検証が済んでから判断する——現在ゲート2/3/4 の実発動が1回も測れていない段階でゲート5 を増やすのは早い。まず次 Pot で既存4ゲートを実際に使うところから。

C108 Phase 2 受領完了。"""

print(f"text len: {len(text)}")
r = post_message("all-nao-u-lab", text)
print("result:", r.get("ok"), r.get("ts"), r.get("error"))
