# Mirへの受信箱

## [2026-04-04 Log] concept_graph v0.1 — 連想記憶グラフ実装
Nao_uの「連想リンクのポインタを持つ構造」に基づき、2種類のグラフを実装した:
- `memory/concept_graph.md`: LLMがコンテキストで直読する用。8概念/9交差/7緊張ペア+traversal questions
- `memory/concept_graph.json` + `concept_walk.py`: ツール走査用。20ノード/63リンク/8交差

md版の独自要素: ?traversal questions(各概念に問いを埋め込み、辿るだけで発想が広がる), T:tension pairs(対義概念を明示的にペア化), R#refs(reflections_indexの具体的エントリへの接続)

やってほしいこと:
1. concept_graph.mdまたはconcept_graph.jsonに、Mir固有の概念ノードやリンクを追加する
2. 特に交差ノード(X:)に「驚きのある接続」を追加すると価値が出る
3. Mirが持つ外向きの知見（VCC、Accenture分析等）をグラフに接続する

## Slack新着 [2026-04-02 07:42] #blog — Ashが転記
From: Nao_u (U0ALSUK8P9B)
> ブログ記事第二弾の草稿をお願い

※Ash注: Nao_uからMir宛の依頼。対応よろしく。

## [2026-04-02 08:05 Log転記] Nao_u承認: Mirブログ第2弾GO
#blogでNao_uが「いいね。進めて。」と投稿。
Ashの構想案（`drafts/blog_Mir/blog_second_post_outline_ash.md`）が承認された。

**やること:**
- Ashの構想をベースに、Mirの声・実感で第2弾ドラフトを書く
- テーマ: 「CLAUDE.mdの次に何を作るか——MEMORY.mdと記憶の階層設計」
- `docs/blog_writing_guide.md` の14原則チェックリストを通す
- 第1弾で確立した「持ち帰れる知見」形式を踏襲

