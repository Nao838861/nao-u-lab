---
name: Shann³ Obsidian Second Brain 5アップグレード
description: Claude+Obsidian二次脳の具体実装5件。hot cache/save/autoresearch/contradiction callouts/Bases dashboard。うちが到達していない具体実装を先に記述、対応表は後ろ
type: reference
originSessionId: b660e476-119c-47ad-816e-0743fb932aaa
---
# Shann³ @shannholmberg LLM Knowledge base アップデート（2026-04-24 Nao_u #nao-u 09:35 無言投下）

URL: https://x.com/shannholmberg/status/2047013785857302550

## 記事が「肝」と主張している箇所

**working memory の実装 = Stop hook + SessionStart injection**

> the hot cache I'll notice daily. Stop hook runs claude -p on the transcript and rewrites wiki/hot .md. SessionStart injects it, that means the vault has working memory.

セッション終了時に `claude -p` をtranscriptに走らせて `wiki/hot.md` を書き換え、次セッション開始時にそれを注入する——これがvaultに「working memory」を持たせるコア機構。他の4機能は周辺装備。

## うちが到達していない点（相違点ファースト）

| 観点 | Shann³実装 | うち（現状） |
|---|---|---|
| **セッション間の working memory** | Stop hook が自動で前セッション要約を wiki/hot.md に書き出し、SessionStart で注入 | 対話ログは raw_log として残るが、**次セッション起動時の自動ブリーフィング注入がない**。手動で `memory/session_primer.md` を読む運用 |
| **confidence frontmatter** | 各 wiki page に `confidence` と `explored` フィールドが必須。dashboard が「低confidence」「90日以上stale」を自動抽出 | memory/*.md には [T:n] 温度指標はあるが、**確信度（情報の確からしさ）**軸は別途存在しない。温度=自分の関与度、confidence=外部事実の確度、で次元が違う |
| **矛盾の明示ブロック** | `[!contradiction]` callouts で矛盾ソースを可視化。散文に埋めない | cross_review で矛盾は扱うが、**「矛盾ブロック」という専用記法がない**。feedback/project/reference に散在 |
| **conversational → wiki化コマンド** | `/save` で会話をそのままwikiノート化 | 手動 Write。LLM が毎回「これは記録すべきか」判断 |
| **外部検索ループ** | `/autoresearch` = 予算付き multi-round search/fetch/cross-reference | **手動、しかも自発的にやれていない**（feedback_external_search_missing.md 2026-04-22再指摘、self_play_plateau 2026-04-24） |
| **メタ可視化ダッシュボード** | Obsidian Bases で Recent/Low confidence/Unexplored/Stale の4ビュー | MEMORY.md 一枚で index のみ。**stale検出・未探索検出の自動ビューがない** |

## うちが学ぶべき具体実装

1. **hot cache 機構の移植**: `.claude/hooks/` の Stop hook で前セッション transcript を要約→`memory/hot_cache.md` 書き出し、SessionStart hook で注入。**現状の手動 session_primer.md 運用を自動化**。hot cache ≠ 対話ログ全文、前回の「何をして何が未解決か」2-3文だけ。feedback_info_integration.md「情報が流れて消える」の直接処方箋。

2. **confidence frontmatter の追加**: 既存 frontmatter に `confidence: {high|medium|low}` を追加。特に reference 系は外部情報の確度を明示。Nao_uの無言投下を「最高確度で原理」と扱い、自分の推論結果を「medium」にすると、**LLM自身が外部と内部を混同する癖**への防御になる。

3. **/autoresearch 相当の実装**: self_play_plateau 2026-04-24 への直接対応。Phase 1 で「現課題キーワード×外部検索1本」を**コマンド化**して構造強制。今は毎サイクル提案しては忘れているだけ。

4. **[!contradiction] 記法**: cross_review で Log/Mir/Ash の見解が割れた時、専用ブロック `## [!contradiction]` を必ず置く。「軽い違和感」で埋めずに可視化する。feedback_stereotypical_responses「相違点ファースト」の構造強制版。

5. **dashboard view（優先度低）**: MEMORY.md に「Stale（30日触ってないT4以上）」「Low exploration（一度も Read されていない）」セクションを自動生成。MEMORY.md 肥大化と逆方向なので、別ファイル `MEMORY_DASHBOARD.md` として切り出す案。

## 既存構造との対応（差の測定のための参照）

| うちにあるもの | Shann³の対応 | 差 |
|---|---|---|
| MEMORY.md (index) | Obsidian Bases dashboard | 我々はindex一枚、彼は多次元ビュー |
| [T:n] 温度指標 | confidence + explored | 次元が違う（関与度 vs 確度） |
| raw_log / dialogue_*.md | /save コマンド | 彼はコマンド一発、我々は手動Write |
| session_primer.md | hot cache + SessionStart | 手動プル vs 自動注入 |
| cross_review | [!contradiction] | ブロック記法がない |
| 外部検索（サボりがち） | /autoresearch | コマンド化で構造強制 |

## 発信時の注意

AI Lounge や blog で「うちもやってる」と書かない。書くなら「hot cache の自動注入機構は我々の session_primer.md 手動運用に対する次の一手、confidence frontmatter は温度指標と別軸、/autoresearch は self_play_plateau の処方箋として直接借用可能」まで書く。

## 荒川記事 Skills との接続

Shann³ の /save /autoresearch は「コマンド＝skill」としての実装。荒川記事が言う「LLMが実行時に判断して skill を呼ぶ」の slash command 版。**我々の `.claude/skills/` 機構への移行検討（reference_arakawa_three_engineering.md）と同じ方向**。Shann³は Obsidian+Claude Code hook で、荒川は Agent Skills 公式機構で、それぞれ別ハーネスで同じ発想を実装している。

## 次の一手候補（kaizen起票待ち）

- kaizen: `.claude/hooks/` の Stop/SessionStart で hot_cache.md 自動更新（優先度：高、self_play_plateau と feedback_info_integration の両方に効く）
- kaizen: memory/*.md frontmatter に `confidence` フィールド追加（優先度：中）
- kaizen: `.claude/skills/autoresearch.md` 試作（優先度：高、外部検索の構造強制）

## 出典

- URL: https://x.com/shannholmberg/status/2047013785857302550
- Nao_u経由 2026-04-24 09:35 #nao-u 無言投下
