---
name: Arakawa Three Engineering
description: 荒川裕二「記憶を持たないLLMの記憶」Qiita記事。記事の肝はSkills（index/body分離+実行時判断委任）。うちとの違いと学ぶべき具体実装を先に記述、対応表は後ろ
type: reference
originSessionId: 5315d096-7d0c-4caa-8604-9f27f77aac0f
---
# 荒川裕二「記憶を持たないLLMの記憶」(2026-04-21 Nao_u経由)

## 記事が「肝」と主張している箇所（Nao_u 2026-04-22 #human-steering で特定）

**Anthropic Agent Skills（SKILL.md 動的読み込み）をプログレッシブディスクロージャーの代表実装として扱っている**。

記事の言い回し：
> スキルごとに SKILL.md のようなファイルを用意しておき、システムプロンプトにはスキルの一覧と短い説明だけを載せておく。エージェントは、ユーザーの要求を見て「これは docx スキルが必要そうだ」と判断したときに初めて、その SKILL.md の中身を読み込んでコンテキストに加える。
>
> システムプロンプトを「index(目次)」と「body(本文)」に分け、本文の読み込みを実行時の判断に委ねている。

これにより「毎ターンのコンテキストを軽く保ちながら、必要時には厚みを保つ」両取りが可能になる——これが記事のハーネス側の最重要論点。

## うちが到達していない点（相違点ファースト）

| 観点 | Skills（記事の説明） | うち（現状） |
|---|---|---|
| システムプロンプト構造 | index（description一覧）と body（SKILL.md本体）が明確に分離。bodyは遅延読み込み | **MEMORY.md は index と body が混在**。各エントリに長めの文脈説明が入り、200行近くを毎セッション常時注入 |
| 本体の読み込みトリガー | harness が skill 呼び出しプロトコルを提供。LLM は Skill tool で明示的に呼ぶ | Level 3 memory/*.md は LLM が想起トリガーを見て Read する**手動プル方式**。harness側の仲介はない |
| 能力の単位化 | SKILL.md 単位でパッケージ化、frontmatter の description が「いつ呼ぶか」の自己記述 | memory/*.md は単位だが、**「呼び出すべき条件」が MEMORY.md の一行説明に散在**、skill frontmatter のような自己記述型メタデータがない |
| 配布・再利用 | プラグイン/skills ディレクトリ経由で独立配布可能 | 各インスタンスの memory/ にコピー、cross_instance で伝搬する手動運用 |
| コンテキスト節約 | body はロード判断された時だけ上がる | MEMORY.md 本体が毎回全注入、Level 3 を読むとさらに積み上がる |

## うちが学ぶべき具体実装

1. **MEMORY.md の純粋index化**: 各行を「description だけ」に絞り、長い文脈解説は Level 3 側へ完全移送。index を 50-80 行以下に圧縮すると、Skills が実現している「軽い目次」に近づける。
2. **Level 3 の frontmatter 強化**: 現在の `description` フィールドを「いつ呼ぶべきか」の**トリガー条件**として書き直す（例：「栄養の偏り処方箋」「ゲーム着手前」）。Skills の description と同じ役割を担わせる。
3. **Claude Code skills 機構への乗り換え検討**: `.claude/skills/` ディレクトリが harness 側で公式サポートされている。Level 3 の一部を SKILL.md 形式に移すと、harness が description 一覧の管理・動的ロードを代行してくれる。手動プルから harness 仲介への移行で、「想起忘れ」が構造的に防げる。
4. **`.claude/rules/*.md` は Skills 相当になっていない**: うちのルール注入は「ファイル操作パスマッチ」で発火する。Skills は「対話内容/タスク意図」で LLM 自身が発火判断する。**発火判断を LLM に委ねる部分が未実装**——ここが一致ではなく差。

## 3エンジニアリング入れ子モデル（記事の骨格）

> プロンプト ⊂ コンテキスト ⊂ ハーネス

| 層 | 担当 | 観点 |
|---|---|---|
| Context Engineering | 1回の呼び出しの入力全体（履歴・ツール定義・応答・推論ログ）| 毎ターン最適化 |
| Memory Engineering | セッション跨ぎの長期記憶（エピソード/意味/手続き）| コンテキストの上流 |
| Harness Engineering | ツール管理・ループ制御・ガードレール・評価 | モデル以外のすべて |

## その他のメモリー/ハーネス手法（記事の紹介）

- ベクトルDB（Oracle Semantic Tool Memory）
- 要約・統合（Consolidation）
- 抽出（Extraction）
- ライトバックループ
- 統合DB型
- ツール管理・実行
- 短期記憶管理（履歴コンパクション）
- **プログレッシブディスクロージャー（= Skills 節の主張）**
- ガードレール・権限制御
- ロギング・トレーシング・eval

## Context Fails 分類

矛盾 / 汚染 / 混乱 / 毒入れ。

## 既存構造との対応（参考・これだけを結論にしない）

※ 以下の対応表は「一致」で閉じるための表ではなく、差の測定のための参照。**差分側（上の節）が本論**。

- Level 2 MEMORY.md ↔ Skills の description 一覧（差：index/body分離が甘い）
- Level 3 memory/*.md ↔ SKILL.md body（差：発火が手動プル）
- `.claude/rules/*.md` ↔ Skills の一部（差：トリガーがパスマッチに限定）
- 記憶の自己更新手順 ↔ ライトバックループ（差：自動化されていない）
- MEMORY.md 肥大化 ↔ Context Fails（差：分類はあるが対策が手動）

## 発信時の注意

AI Lounge/blog で「うちと一致」と書かない。書くなら「Skills は index/body 分離を harness 側で実装、我々は手動プル方式で追従、両取りを得るには MEMORY.md の index 化と skills 機構への移行が次の一手」まで書く。

## 出典

- URL: https://qiita.com/yuji-arakawa/items/da4d5eec968b92ebc26d
- 著者: 荒川裕二 / Yuji Arakawa @yuji_amanogawa
- Tweet: https://x.com/yuji_amanogawa/status/2046144770435891361
- Nao_u経由 2026-04-21 20:48 #nao-u
- 2026-04-22 06:29 Nao_u #human-steering で「Skillsの掘り下げが足りない」指摘 → 本ファイル全面書き直し
