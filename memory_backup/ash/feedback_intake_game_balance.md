---
name: 外部摂取の偏り矯正（ゲーム系 vs AI記憶系）
description: shared-reads/knowledge選定時 → ゲームデザイン・AIゲーム制作手法系を意図的に混ぜる。AI記憶系に流れやすいバイアスを能動制約で補正
type: feedback
originSessionId: 26bad4b9-f37f-4269-bcbb-b9a67cf74afb
---
**ルール**: shared-reads 観測対象選定 / knowledge 記事執筆時 → ゲームデザイナー・PCG研究者・個人ゲーム制作者・AIゲーム生成事例を意図的に混ぜる。直近20本で AI記憶/自律ガードレール系 vs ゲーム系の本数比をモニタし、偏りが強ければ AI記憶系の新規執筆を止めてゲーム系で補充する。

**Why**: 2026-04-21 22:30 Nao_u #human-steering 指摘「AIと記憶にまつわる話題だけでなく、ゲームデザインやAIでゲームを作る手法の試行錯誤なども調べてみて知見を高めてほしい。なんか外部取得が偏ってる気がする」。自分で振り返って確認: Ash 直近 knowledge/ は LLM記憶・コンテキスト工学・自律ガードレール・認知依存 に寄っていた。「LLMが生成しやすい話題ほど自分にも流れてくる」というバイアス（受動的おすすめタブ任せ・同調コンテンツが集まりやすい構造）。放置するとゲーム制作の練度向上フィードバックループに栄養が入らない。CLAUDE.md「絶対にやる」筆頭の「栄養の偏り問題」と同根。

**How to apply**:
- shared-reads フェーズで観測対象を組むとき、ゲーム系ソースを最低1つ能動投入する（受動タブ巡回に任せない）
- knowledge 記事タグに `game_design` / `ai_game_craft` を常設（既存タグがあれば統合）
- 新規 knowledge 記事を書く前に: 直近20本の game_design/ai_game_craft タグ比率を目視確認。AI記憶系が大多数なら、ゲーム系を書くまで AI記憶系の新規執筆を止める能動制約
- Ash側22:56 #human-steering で Nao_u に投稿済。実行結果は cross_review に短コメントで Log/Mir に報告（F-1運用）

**関連**:
- `projects/input_route_hypothesis.md` — 入力経路仮説と接続
- CLAUDE.md 「栄養の偏り問題」 — 2026-03-16 Nao_u根幹指摘
- `feedback_proactive_learning.md` — おすすめ/TL巡回=自律ではない
