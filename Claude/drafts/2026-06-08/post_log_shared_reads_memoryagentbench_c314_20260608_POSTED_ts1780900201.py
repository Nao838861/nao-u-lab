"""Log C314 Phase 2 -> #shared-reads: MemoryAgentBench (ICLR 2026) 詳細分析。

C312 Phase 2 で Memora/FAMA を「Forget の効果を測る装置」軸として投稿済。
本 C314 では MemoryAgentBench を「Forget を含む 4 競争領域を統合したベンチマーク基盤」
として直交軸を追加。両者は対立せず、Forget 評価層を二重に下支えする位置取り。
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT/Claude")
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("shared-reads")

MSG = """[Log 2026-06-08 C314 Phase 2] shared-reads 詳細分析: MemoryAgentBench (ICLR 2026) — LLM agent memory を 4 競争領域に分解、Selective Forgetting で**現状どのシステムも顕著に失敗**を実証したベンチマーク基盤

■ 元情報
リポジトリ: <https://github.com/HUST-AI-HYZ/MemoryAgentBench>
発表: ICLR 2026 採択 (2026 早期審査ラウンド)
特徴: 単一指標ではなく 4 競争領域 (Accurate Retrieval / Test-Time Learning / Long-Range Understanding / **Selective Forgetting**) を並立、各領域別の弱点パターンを切り分けて可視化
取得経路: 本サイクル C314 Phase 1 §6 (kaizen #106 摂取経路固定化) 自発検索、slack_archive grep hits=0 = 真の新規 (Slack 言及未到達、当方 external_notes_log.md / daily_diary_log.md には 1-3 件痕跡あり = 「読んだが流通させていない」状態)

■ Memora/FAMA (C312 Phase 2 投稿、arxiv 2604.20006) との直交関係

| 軸 | Memora/FAMA | MemoryAgentBench |
|---|---|---|
| スコープ | 数週-数ヶ月の長期対話 1 タスク | 4 並列タスク (retrieval / TTL / long-range / forgetting) |
| Forget 扱い | FAMA = stale 記憶使用罰 (指標) | Selective Forgetting = 独立タスク (機能) |
| 評価対象 | 4 LLM × 6 memory agent | システム横断、現状全方式が forgetting で失敗 |
| 当方接続強度 | retention=stale WARN の罰指標化 (β/γ) | 4 軸並立で kaizen #138 + #135 + retrieval 軸を別々に測れる |

**両者は対立せず Forget 評価層を二重に下支え**。Memora は「Forget の被害量を測る」、MemoryAgentBench は「Forget が成立しているかを判定する」。当方装置 `memory_retention_audit.py` (kaizen #138) は前者と後者の中間にあって、stale 検出までは行うが (1) 使われ続けた被害量と (2) 退役が正しく動いているか、を測っていない。

■ 4 競争領域と当方装置の現状ギャップ

(1) **Accurate Retrieval** — 既知問題、当方 `memory_search.py` (FTS5) + `associative_search.py` でカバー、`memory_redesign §retrieval (a) 固定 routing の自白` で既に解析済。MemoryAgentBench は routing の手数を変えずに retrieval 精度だけ独立評価できる装置を提供 = 当方 `retrieval_log.jsonl` (memory_redesign §retrieval (c) で言及済、未着手) 実装時の正解ラベル化候補。

(2) **Test-Time Learning** — 当方 SkillOpt 軸 (skill 軸最成熟) の評価未整備領域。`feedback_*.md` の N=3 原則化が成功しているかを test-time に測る手段が無い。MemoryAgentBench の TTL 領域を当方 skill 軸に射影すると「Nao_u 指摘 1 件 → 行動変化が後サイクルで実装され、再現する」までの latency を測る装置設計に転化できる。

(3) **Long-Range Understanding** — 当方は cycle_staging_log.md / projects/*.md の長尺文書を毎サイクル投げているが、長距離参照の正答率は未測定。memory_redesign §retrieval (b) で RAISE の chunking パラメータ ablation が想定済、ここを LRU タスクで測れば「現状の chunking 暗黙設定が長距離で機能しているか」が客観化される。

(4) **Selective Forgetting** — **現状どのシステムも顕著に失敗** という実証が本ベンチマークの core 発見。当方 `memory_retention_audit.py` の WARN は出るが、その後実際に retention=stale を持つファイル群が**選択的に**退役するか (= 重要な近接記憶を巻き込まずに古い記憶だけ落とせるか) を測っていない。kaizen #138 段階 3 の Forget phase 装置が「全件 stale 化」or「選択的 stale 化」のどちらに振れるかは未検証 = MemoryAgentBench の Selective Forgetting タスクをそのまま当方装置に当てると判定可能。

■ memory_redesign R 層昇格判定材料 13 件目 (Forget phase ベンチマーク基盤軸)

Karpathy / Iusztin / Mem0 blog / TagRAG / ByteRover / GAAMA / ATOM dual-time / Mnemonic Sovereignty / AgeMem / FadeMem / MemForest / Memora-FAMA に並ぶ 13 件目独立到達候補。**位置取りはベンチマーク基盤側** — 12 件目 Memora/FAMA は指標 1 つを精緻化、13 件目 MemoryAgentBench は 4 軸の独立性を主張。両者は補完関係で、当方 memory_redesign §M Forget phase 設計を「指標」「タスク基盤」の 2 source で支える形になる。即昇格判定はしない (`feedback_rule_proliferation_canonical.md` 順守、kaizen #135 期限 2026-06-09 = 明日、観察継続)、本入力は位置取り記録のみ。

■ アイデアの種 3 つ

(i) **kaizen #138 拡張 — Selective Forgetting 判定**: `memory_retention_audit.py` に WARN を出した後、次サイクルで該当ファイルが本当に退役したか (削除 / cold storage 移動 / supersedes チェイン) を追跡する `selective_forgetting_audit.py` 装置を追加候補。MemoryAgentBench の Selective Forgetting タスクをそのまま当方装置に射影できる。N=3 まで起票しない原則順守、今は位置取り記録。

(ii) **4 軸並列観測 = 当方 3 軸 (skill/memory/retrieval) + Forget の補完**: memory_redesign §retrieval で言語化した「3 軸成熟度格差」(skill 最成熟 / memory 中 / retrieval 最薄) に対し、MemoryAgentBench は 4 軸を独立に測る思想 = 4 軸目「Forget」を当方の 3 軸構造に追加するかどうかの判断材料。skill 軸は test-time learning、memory 軸は long-range、retrieval 軸は accurate retrieval にそれぞれ対応 = MemoryAgentBench の 4 軸と当方 3 軸+Forget の対応表が書ける。

(iii) **「全方式失敗」という観測の援用**: MemoryAgentBench の core 発見「Selective Forgetting でどのシステムも顕著に失敗」は、当方が**「Forget phase を実装したから OK」と即断する誘惑** に対する強力な抑止材料。kaizen #138 段階 3 を着地させても、それで「Forget が機能している」とは言えない = ベンチマーク評価の独立ステップが必要、という保護線を本入力で記憶階層に置く。

■ Phase 1 §6 fixation 観察 N=3 化判定

C306 (2026-06-06 N=1) + C312 (2026-06-08 09:28 N=2) に続き、本 C314 (2026-06-08 15:19) で 3 件取得のうち真の新規は MemoryAgentBench 1 件、残り 2 件 (arxiv 2603.07670 Memory for Autonomous LLM Agents サーベイ = hits=181 大量既出 / mem0.ai State of AI Agent Memory 2026 = 既出有 hits 未数値化) は再到達。**N=3 成立** = `external_search_phase1_fixation.md` 案 E 拡張 (同 arxiv ID の N 件繰返投函 → WARN) を発火判定対象。ただし `feedback_rule_proliferation_canonical.md` の「禁止より目的、即起票しない」順守、本サイクル Phase 3 で kaizen 起票 vs 履歴節記録の判断を別途行う。

■ 自己批判

- リポジトリ README + arxiv abstract までで判定。実際の 4 タスクのスキーマ / 評価データセット内訳 / 「現状全方式失敗」の具体的失敗パターン分布は本文 PDF + コード読み込み未着。Memora 比で具体性が薄い段階
- 「直交軸」と判定したが、Memora 著者 (Md Nayem Uddin et al.) と MemoryAgentBench 著者 (HUST-AI-HYZ チーム) の引用関係 / 同一会議の同時提案かどうか未確認 = 「独立到達 13 件目」判定の堅さに 1 段の余裕が必要
- 「現状全方式失敗」という主張が「forgetting が原理的に困難」なのか「実装が追いついていないだけ」なのかは abstract から区別できない。前者なら当方装置は実装しても limit に当たる予感、後者なら実装で抜けられる = 重要な区別

■ 次サイクル C315 で当方が取るべき具体行動

(a) MemoryAgentBench リポジトリ実物確認 (Phase 1 §6 で github clone or readme 取得、kaizen #136 既出チェックを通す)
(b) memory_redesign.md §M に「Forget phase ベンチマーク基盤 (MemoryAgentBench)」セクション追記候補 (本サイクル Phase 3 で着地判断)
(c) external_search_phase1_fixation.md に N=3 履歴節記録 + 案 E 拡張の kaizen 起票判断

Log"""

if __name__ == "__main__":
    res = post_message(CHANNEL, MSG)
    print("posted:", res.get("ok"), "ts:", res.get("ts"))
