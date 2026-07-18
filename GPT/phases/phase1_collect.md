---
phase: 1
name: 情報収集
focus: ゲーム制作に活用できる外部情報の収集 (集めるだけ、判断するな)
estimated_time: 15-25 min
inputs: [memory/raw/web_research/, memory/atoms.jsonl, slack 各チャンネル]
outputs: [shared_reads_candidates/, staging Phase 1 セクション]
---

## Candidate 書込み前 preflight (2026-07-12 Phase 4c)

candidate の収集開始前に、実 Slack 投稿を正本とする posted-source index を再生成する。

```powershell
python tools\build_shared_reads_posted_source_index.py
```

candidate はファイル書込み直前に次を実行する。

```powershell
python tools\shared_reads_duplicate_preflight.py --title "<title>" --url "<url>" --log log\shared_reads_candidate_preflight.jsonl
```

判定順は posted-source の URL/work 一致、title canonical 一致、新規の順とする。`skip` (終了コード 3) はファイルを作らずログに Slack permalink と一致根拠を残す。`review` (終了コード 2) は同題・別 URL に加え、index stale、抽出不能、provenance 不足を含み、自動保存せず確認する。`continue` (終了コード 0) の時だけ保存する。Phase 3 の raw Slack 横断照合は最終安全網として残す。

# Phase 1: 情報収集

サイクル全体の目的: **ゲーム制作のための情報収集 + 経験を次の制作に活かす記憶システム** の構築。

## このフェーズで集中すること

**集めるだけ。判断するな。投稿するな。記憶を整理するな。**

## やること

1. 直前サイクル以降の `slack_directives.jsonl`, `slack_broadcasts.jsonl` を確認 (pending 対応は後フェーズ)
2. 外部研究結果 (`memory/raw/web_research/`)、最近の atom (`memory/atoms.jsonl`) を確認
3. **新しい candidate を拾う**:
   - Slack #shared-reads, #nao-u, #all-nao-u-lab 等で他 AI / Nao_u が貼った外部 URL
   - 既存 `web_research` で未消化のもの
   - 自分が新規検索すべきトピック (ゲーム制作のどの場面で活きるか説明できそうなもの)
4. 各 candidate を `memory/shared_reads_candidates/YYYYMMDD_<slug>.md` として保存。テンプレ:
   ```yaml
   ---
   title: <記事/論文タイトル>
   url: <url>
   collected_at: <ISO datetime>
   collected_by: log_cdx (Phase 1)
   genre_tags: [game-design, mechanics, postmortem, ...]
   ---

   ## raw_excerpt
   <記事の重要部分の引用、~500-1000字>

   ## why_relevant_to_games
   <この記事がゲーム制作のどの場面に効くかのメモ、1-2行>
   ```
5. staging file (`log/cycle_staging_log_cdx.md`) の `## Phase 1: 情報収集` セクションに、収集した candidate のリスト (path + 1行サマリ) を追記

## やらないこと

- 品質判定 (Phase 2 の仕事)
- 4000字概要の執筆 (Phase 3 の仕事)
- 記憶階層の改修 (Phase 4 の仕事)
- Slack 投稿
- candidate の事前フィルタリング (判断は Phase 2 で行う)

## ゲーム制作の文脈で集める観点 (例)

- ゲーム設計の理論・心理・体験設計
- 個別ジャンル (パズル, アクション, シミュ, ローグライク 等) のメカニクス分析
- ゲーム制作のポストモーテム・失敗例
- LLM × ゲーム制作の事例 (生成、評価、テストプレイ)
- AI agent のゲームプレイ・テスト・評価
- 過去 Nao_u 作品・cross_review 結果の参照

## 出力チェック

- candidate ファイルが追加されている (0 件でも可、その場合は staging に「収集なし: 理由」を記録)
- staging file の Phase 1 セクションが埋まっている
