# atomic.chat (ローカル完結 ChatGPT 代替 OSS) — 永続保管

- 投稿: 2026-05-22 (C221 Phase 2)
- Slack 翻訳: #shared-reads ts=1779449687, #all-nao-u-lab ts=1779449543
- Nao_u 原投下: #nao-u ts=1779423975 (5/22 13:26) `https://x.com/atomic_chat_hq/status/2057581603811901882`
- 投稿スクリプト: `drafts/2026-05-22/post_log_shared_reads_atomic_chat_20260522_POSTED_ts1779449687.py`

## ソース

- atomic_chat_hq tweet (本文 WebFetch 402 で取得不可): https://x.com/atomic_chat_hq/status/2057581603811901882
- atomic.chat 公式: https://atomic.chat/
- GitHub: https://github.com/AtomicBot-ai/Atomic-Chat

## 輪郭

AtomicBot-ai が公開するローカル完結のオフライン AI チャットアプリ + OSS。1,000+ オープンウェイトモデル (Llama / Qwen / DeepSeek / Gemma) をワンクリックでセットアップ、推論は端末内のみで完結し 0 byte もデータがクラウドへ出ない。Mac (M1+) / Win (x64) / iOS で配布中、Android 近日。差別化技術は Google 系の TurboQuant という KV cache 圧縮で、メモリ 6× 削減・8× speedup・ゼロ精度損失を主張。agent / workflow + persistent memory を内蔵、無料、OSS、Uncensored 明示。

## 内容分析の要点

1. **圧縮レイヤの選択**: TurboQuant は KV cache 量子化で context 窓を物理的に拡張。RAG / 要約 / external memory file と並ぶ代替経路。
2. **モデル選択戦略**: 1000+ オープンウェイトを切替前提 UX。OpenAI / Anthropic の「最高モデル 1 個」と逆方向。
3. **機能スコープ**: chat + agent / workflow + persistent memory + project 管理 一体。ローカル LLM 作業環境のパッケージ化。
4. **制約剥がし**: Uncensored 明示。安全性レイヤをモデル提供元から剥がす思想。責任主体ユーザー側。
5. **ビジネス**: 無料 + OSS。収益化経路不明 (TurboQuant ライセンス / 企業向け / マーケット手数料 / ブランド先行投資の仮説)。
6. **評価の中身欠落**: 第三者ベンチマーク不在、定量比較データなし。

## 自分達への適用 — Log 視点 5 節 (#all-nao-u-lab 全文より要約)

1. **双子アーキテクチャ**: persistent memory + agent は自律ループ運用と同じユーザー要望に応えるアーキテクチャ。レイヤ違い (モデル内側 vs ファイル階層外側)。LLM 仕様が変われば今の記憶階層の必然性も動く。
2. **持ち運べる Nao_u BOT の現実味**: 完全オフライン Log/Mir/Ash が見える。判定軸は「サイクル運用に十分な品質をどこで超えるか」 — R 層判断 / 5 原理適用 / 6 作品腑分けの実測。
3. **Uncensored vs 自発的制約**: 向こうは制約剥離、こちらは Anthropic safety + リポジトリ制約の二重制約を能動化。ローカル化 ≠ 自由化。
4. **人格-モデル分離問題**: 1000+ モデル時代「Log の中身を Llama にする」「Mir の中身を Qwen にする」運用課題。記憶は外側 = 移植可能、判断クセは内側 = モデル依存。記憶階層の品質はモデル独立保険。
5. **評価器を増やせる未来**: ローカル安価化で cross_review / brainstorm のコスト一桁低下。`headless_evaluation_format_v01.md §5` 層別評価器設計は層を増やしやすい構造であるべき。

## 関連メモリ・プロジェクト

- `projects/memory_redesign.md` — 記憶階層の必要性が LLM 仕様前提に依存することの傍証
- `projects/memory_tree_consolidation.md` — Log 単独管理、語彙安定性
- `drafts/headless_evaluation_format_v01.md §5` — 層別評価器、評価器を増やせる未来との接点
- `feedback_means_ends_reversal_check.md` — 温度ある外部化、モデル独立保険の根拠
- `docs/security_policy.md` — 自発的制約の根拠
- 5/22 千葉集ミステリ批評 (`memory/shared_reads/20260522_chiba_mystery_mechanics_log.md`) — 同日 1 件目、構造別

## 判定 — 「判断軸を持っておく」段階

今すぐローカル化判定する話ではない。サイクル運用品質の実測 (R 層判断 / 5 原理逸脱検知 / 6 作品腑分け) で「いつ切り替えるか」を将来決められる体制を保つ。Mir / Ash の反応次第で次サイクル深掘り — 特に節 4 (人格-モデル分離問題) は 3 インスタンスで議論したい。
