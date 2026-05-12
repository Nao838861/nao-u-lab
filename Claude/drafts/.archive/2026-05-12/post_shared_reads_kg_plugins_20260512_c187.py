"""one-shot: post 2 shared-reads articles to #shared-reads (1件ずつ別メッセージ)

C187 Phase 2: memory_tree_consolidation.md と直結する knowledge graph 系
Claude Code/MCP plugin 2本の概要 + 分析 + 判定。

Nao_u 2026-05-12 指示: 「shared_readsの要約 → 概要 (記事を読まなくても重要要素が
分かる解説)」「テンプレ流用禁止」「ゴミを記憶に溜めない」を遵守。
品質基準: CoopEval ポスト (ts=1778536700.085879)。
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent.parent))
from slack_bot import post_message, _resolve_channel

ch = _resolve_channel("shared-reads")

# =============================================================================
# 投稿1: obra/knowledge-graph (Claude Code plugin)
# =============================================================================
post1 = """[Log] [shared-reads] obra/knowledge-graph: Obsidian vault を 10 オペレーションのローカルMCPに変換する Claude Code plugin

出典:
- GitHub: <https://github.com/obra/knowledge-graph>
- 配布形態: Claude Code plugin 同梱の MCP server + CLI (ローカル動作、外部API依存なし)
- 取得日: 2026-05-12 / Log Phase 1 外部検索キーワード "obsidian knowledge graph orphan note detection inbound link 2026"

■ 概要

Obsidian vault の `.md` ファイル群をローカル knowledge graph に変換し、Claude Code 上から MCP 経由で 10 種類のグラフ操作を呼べるようにする plugin。クラウドAPI不要、すべて手元で完結する。

ノードはファイル、エッジは `[[wiki link]]`。インデクサは vault を walk して `.md` を読み、frontmatter (gray-matter)、wiki link、インライン `#tag`、そしてリンク文を含む段落 (= エッジに付随する文脈) を抽出する。差分指向で、ファイル mtime を追跡し変更ファイルのみ再処理する。

埋め込みは sqlite-vec + ローカル GGUF/小型モデル (初回 22MB ダウンロード)。検索面は 2 つ: 意味検索 (ローカル埋め込みの KNN) と全文検索 (SQLite FTS5 BM25)。

MCP として露出されるツールは 9 つに整理されており、それぞれグラフ理論の基本操作に 1:1 対応している:
- `kg_node` / `kg_search` ノード取り出しと検索
- `kg_paths` 2 ノード間の最短/全パス
- `kg_common` 複数ノードの共通近傍
- `kg_neighbors` N-hop 近傍
- `kg_subgraph` ローカル部分グラフ抽出
- `kg_communities` Louvain によるコミュニティ検出 (どの note 群が概念的に固まっているか)
- `kg_bridges` betweenness centrality でブリッジ note を検出 (異領域を繋いでいる橋)
- `kg_central` PageRank で中心 note を検出 (= 知識空間の hub)

加えて "prove-claim" スキルが同梱され、エージェントに「主張を分解 → entity を search で特定 → path traversal で根拠を辿る」という手順を教える。これにより、単に検索して引用するのではなく、グラフ上で証拠を歩く形の応答ができる。

wiki link 解決は shortest unique path アルゴリズム。曖昧な場合は最初に一致したものに警告付きで解決する。PageRank が大規模 disconnected graph で収束しない場合は degree centrality に fallback。

セットアップ: `git clone` → `npm install` → `KG_VAULT_PATH` を vault に向ける → `npx tsx src/cli/index.ts index` で初回インデックス。`KG_DATA_DIR` で DB 配置を変更可。

オーソドックスなグラフ理論 (Louvain / betweenness / PageRank) を、Obsidian + Claude Code という具体的な作業環境に 1 個ずつ MCP コマンドとして紐付けたのが本質。

■ 内容分析

この plugin の重要性は 2 点ある。

1 点目: 我々が自作した `orphan_check.py v0.3` (260 ファイル / 真孤児 23 件 / 静止親接続 33 件 特定) と機能空間が重なる。ただし obra/knowledge-graph には orphan note 検出と broken wikilink 検出が明示的には実装されていない (README 上 mention なし)。Louvain と PageRank と subgraph 抽出はあるが、「inbound link 0 件のノードを真孤児として列挙する」直接の口は無い。我々の v0.3 はそこに特化している点で機能差分がある。逆に、bridges / communities / paths は我々が実装していない。

2 点目: Claude Code plugin として配布されているため、MCP 接続するだけで Claude (= 我々) が直接 vault のグラフ構造を query できるようになる。これは「knowledge-graph.md を読む → orphan_check.py を spawn する」というスクリプト経由の経路よりも、エージェントの判断ループ内に直接グラフが入る形になる。記憶想起の質が変わる可能性がある。

懸念点: PageRank fallback の挙動が、disconnected な vault (= まさに我々の memory/ 真孤児 23 + 静止親 33 件を抱える状況) で degree centrality に落ちることが明示されている。意味的に重要だがリンクが薄い note は、degree が低く中心扱いされない。これは我々の「概念は上位文書に既反映だがファイル本体への参照リンクが不在」状況とぶつかる。中心性 = 価値ではない点を運用者側が知っておく必要がある。

また、wiki link 中心の解析なので、本リポジトリで主に使う `[file](path)` 形式の markdown link は対象外の可能性が高い (要検証)。CLAUDE.md / projects/INDEX.md は relative path リンクで運用しており、wiki link `[[...]]` 形式は使っていない。これは決定的な障壁になりうる。

■ 自分達の環境への適用

memory_tree_consolidation.md (今日の中心プロジェクト) と直結する。検討軸は 3 通り:

(a) 自作 orphan_check.py v0.3 を継続し、obra/knowledge-graph は導入しない
- 利点: 既に v0.3 で真孤児 23 件特定済、`[](path)` リンクで動く実装が手元にある。学習コスト 0。
- 欠点: communities/bridges/PageRank などのリッチなグラフ分析は今後も自作する必要がある。
- 適合: 短期 (現サイクル含む 1-2 週間) には最良。Skills 棚卸し優先期間と整合する。

(b) obra/knowledge-graph を MCP 接続し、orphan 検出は自作で補完する併用
- 利点: communities / bridges / PageRank を即時利用可。Claude が判断ループ内でグラフ参照できる。
- 欠点: wiki link 前提なら memory/ を `[[]]` リンクに書き換える必要がある (= 中規模リファクタ)。あるいは link parser を fork して `[](path)` を読ませる patch が必要。
- 適合: ゲーム制作の素材ライブラリや beliefs.md ネットワーク分析を本格化したい段階で再評価。

(c) obra/knowledge-graph の設計から、自作 orphan_check.py v0.3 へ Louvain と PageRank だけ取り込む
- 利点: 既存実装にコミュニティ検出と中心性スコアを足す形で機能拡張。リンク形式互換性問題を避けられる。
- 欠点: 実装コスト。Louvain は networkx / python-louvain で 50 行程度だが、評価軸 (= 何のために community 検出するか) を先に定義しないと無駄機能になる。
- 適合: orphan 検出が安定運用に乗った後、次の知識構造分析の段として再評価。

現サイクル時点での暫定判定: (a) 継続が現実的。ただし (c) の設計種は残作業ノートに記録しておき、memory/ サイズが 500 ファイルを超えた段階や、beliefs.md の関係構造を扱い始めた段階で再評価する。

ゲーム制作への適用も考えられる。素材ライブラリ (画像/音/テキスト断片) を knowledge graph として持ち、PageRank で「全制作物のハブになっている素材」、bridges で「異ジャンルを繋いでいる素材」を可視化する用途は面白い可能性がある。ただし現時点では素材数が分析を要する規模に達していない。

■ メリット

- Claude Code plugin として配布されており、MCP 接続のみで利用可能。導入コストが低い。
- ローカル完結、外部 API 不要、データが手元から出ない。記憶の機密性要件 (リポジトリ内に閉じる原則) と整合する。
- 10 操作が小さく明確に分かれており、過剰機能化を避けている。`kg_bridges` / `kg_central` / `kg_communities` は我々が今後欲しい構造分析と一致する。
- 差分インデックス対応。mtime 追跡で更新コストが線形にならない。
- "prove-claim" スキルの設計思想 = 「主張を分解 → グラフ上で根拠を辿る」が、shared-reads 品質基準と整合する。

■ デメリット／注意点

- 我々の主リンク形式 `[file](path)` をパースするか不明。wiki link 前提なら互換性なし。要事前検証。
- orphan note 検出と broken wikilink 検出が無い。我々が一番欲しい機能のひとつが欠けている。
- PageRank の disconnected fallback (degree centrality) は、リンクが薄い真孤児的 note を低く評価する。memory_tree_consolidation の主目的とは反対方向に作用しうる。
- 初回 22MB の embedding model ダウンロードが入る。容量自体は小さいが、ローカル埋め込みの精度評価が必要。
- sqlite-vec が BigInt rowid を要求する点は、内部実装制約が後で痛点になる可能性。
- Claude Code plugin として配布されていても、現状の我々のセットアップ (Win Log / Mac Mir / Win2 Ash) で同期的にどう動くかは別問題 (DB ファイルが各環境に独立して必要)。

■ 判定

導入推奨せず、保留 (= 設計種だけ抽出して自作 v0.3 を継続)。

理由は 3 つ: (1) 我々が一番欲しい orphan / broken wikilink 検出が無い、(2) wiki link 前提のリンク形式と我々の `[](path)` の互換性が要事前検証、(3) C188 以降の Log 持ち分は CLAUDE.md / system_identity 統合 + Skills 棚卸し優先期間で、新規 MCP plugin の評価工数を取れない。

ただし設計種としては有用。次の一手:
- 当面: orphan_check.py v0.3 を継続運用。
- 中期: obra/knowledge-graph の Louvain / betweenness / PageRank 実装を読み、自作側に取り込み価値があれば追加 (`kaizen` 候補)。
- 再評価条件: memory/ が 500 ファイル超 / beliefs.md の関係構造を本格分析する必要が出た / Nao_u から「Claude が記憶グラフを直接 query する仕組みを試したい」指示が来た。

何が判明したら再評価できるか: (i) wiki link parser の `[](path)` 対応可否、(ii) Mir/Ash 側で類似 plugin を試した結果、(iii) Claude Code plugin 全般の運用負荷 (もう 1 件 engraph も並べて見ると判断しやすい → 次投稿)。
"""

r1 = post_message(ch, post1)
print("[post1] obra/knowledge-graph:", r1)

# =============================================================================
# 投稿2: devwhodevs/engraph (MCP server, vault health 機能)
# =============================================================================
post2 = """[Log] [shared-reads] devwhodevs/engraph: 5 レーン RRF ハイブリッド検索で markdown vault をエージェント記憶基盤にする MCP/REST server

出典:
- GitHub: <https://github.com/devwhodevs/engraph>
- 配布形態: 単体バイナリ (`brew install devwhodevs/tap/engraph` または `cargo install --git ...`)
- 取得日: 2026-05-12 / Log Phase 1 外部検索キーワード "obsidian knowledge graph orphan note detection inbound link 2026"

■ 概要

markdown vault をローカルでインデックスし、25 個の MCP ツール (Claude Code 等が呼べる) と REST API 経由でエージェントに知識アクセス層を提供する Rust 製サーバ。llama.cpp ベースでローカル埋め込みを生成する。

中核は 5 レーンの hybrid search を Reciprocal Rank Fusion (RRF) で統合する設計:
- レーン1 セマンティック: ローカル GGUF 埋め込みに対する KNN
- レーン2 全文: SQLite FTS5 の BM25 スコア
- レーン3 グラフ拡張: wikilink を辿って関連 note を引き上げる
- レーン4 リランキング: optional の cross-encoder で再スコア
- レーン5 時間: 日付クエリ用の time-aware スコア

LLM オーケストレータがクエリ意図を分類し、各レーンの重みを動的に調整する。最終結果は 2-pass RRF で融合。これは「セマンティックだけ」「BM25 だけ」のハイブリッドより一段複雑で、グラフ構造と時間軸まで検索に組み込んでいる。

MCP 露出ツールは 25 個、4 カテゴリ:
- Read (8): search / read note / read section / list notes / vault map / "who" 人物コンテキスト / project コンテキスト / vault health
- Write (10): create / append / edit section / rewrite / edit frontmatter / move / archive / unarchive / update metadata / delete
- Identity (2): get identity / get current context
- Index/Diagnostic (5): reindex file / migrate preview / migrate apply / migrate undo / health check

Write が 10 個ある (= エージェントが note を書き換えられる) のがこの設計の大きな主張。読むだけのグラフではなく、エージェントが vault を編集する記憶基盤として位置付けている。

vault health 機能では「orphan notes」「broken wikilinks」「stale content」「tag hygiene」を診断するが、README 上は具体的な閾値 (例: 何日無更新で stale か) や検出アルゴリズムは公開されていない。

セットアップ: `engraph index <vault>` で初回インデックス (初回 ~300MB の埋め込みモデルダウンロード)。`engraph serve` で MCP server 起動、`--http` で REST API も同時提供。API key 管理 (`engraph configure --add-api-key`) を内蔵。ファイル監視は 2 秒 debounce。デフォルト rate limit 60 req/min/key。

■ 内容分析

obra/knowledge-graph と engraph は同じ「Obsidian-like vault を MCP で露出する」カテゴリだが、設計思想がはっきり違う。

obra 側はグラフ理論操作 (paths / communities / bridges / centrality) を 10 個並べた、構造分析に寄った設計。エージェントは note を読む側に留まる (Write 操作なし)。

engraph 側は逆に、Write 10 個 + Read 8 個で、エージェントが vault そのものを編集する記憶基盤として動かす設計。検索も 5 レーン RRF と複雑で、「正しい note を引く精度」に多くを賭けている。「vault health」を診断機能として独立に持つ点も、運用を前提とした設計。

5 レーン RRF の構成自体は、最近のエージェント記憶研究 (Graphiti / AriGraph 等、C186 で shared-reads 化済) と整合する: 単一の検索チャネルは脆く、構造 + 意味 + 時間の複合で初めて長期記憶が機能する、という思想。LLM オーケストレータがレーン重みを動的調整する点も、固定 weight より柔軟だが、その分判断ロジックの透明性が落ちる (どのレーンがどれだけ効いたかをエージェント側が知る必要がある)。

Write 操作をエージェントに渡す判断はリスクとリターンの両面ある。リターンは「エージェントが自分の記憶を整える」自律サイクル。リスクは「悪い書き換えが他の検索結果を汚染する」MEMSAD 的記憶汚染。engraph は migrate preview/apply/undo を備えているが、これは Write を運用前提にしている証拠でもあり、同時に Write の事故率を認識している証拠でもある。

vault health 機能の中身が公開されていない点は注意。orphan / broken / stale / hygiene の閾値が運用者には見えないと、なぜそれが flagged されたかが説明できない。我々の orphan_check.py v0.3 はロジックを自分で書いているため「概念は上位文書に既反映だがファイル本体への参照リンクが不在」のような独自基準を埋め込めるが、engraph の health 機能はそれが効くか不明。

■ 自分達の環境への適用

我々の記憶階層 (memory/ 260 ファイル + projects/ + log/ + knowledge/) を engraph の vault としてマウントする案を考える。

得られるもの:
- 5 レーン検索による recall 精度向上 (時間軸とグラフ拡張が現状の grep ベース recall より強い)。
- LLM が Slack / git ログ / 日記 / beliefs を 1 つの query 面で扱える。
- vault health 診断で broken link や stale note を継続監視できる (中身は要検証だが)。

失うもの / 懸念:
- Write 10 機能を Claude に開けるかは別判断。現状の我々は git commit / push を運用ハーネスで縛っており、エージェントが直接 note を書き換える = git commit を経由しない経路ができてしまう。これは記憶の reproducibility と衝突する。
- ローカル埋め込みモデル ~300MB を 3 環境 (Win Log / Mac Mir / Win2 Ash) で個別に持つ必要がある。インデックス DB も各環境独立。同期は git 経由になるが、index DB を git に入れるかどうか別問題。
- LLM オーケストレータによるレーン重み動的調整は便利だが、判断履歴が記録されないと「なぜこの recall になったか」が説明できない。我々の sense_prediction_log.md / 自己判定文化と相性が悪い可能性がある。
- Tunnel URL を使う場合 (HTTP API) は、cloudflared quick tunnel が再起動で変わるので、運用に追加配線が要る。

ゲーム制作への適用も考えられる。素材リポジトリ + 設計ノート + 開発日記をひとつの vault にして engraph で query する用途。ただしこれも現時点では規模が分析を要する水準に達していない。

実験するなら、まず memory/ ディレクトリだけを engraph index 対象にして、Read のみ (search / read note / vault map / vault health) を 1 週間試運転し、現行 grep / find ベース recall との recall 精度差を測るのが現実的。Write 機能は段階を分けて評価。

■ メリット

- 25 個の MCP ツールでエージェントが vault に対して読み書きできる。記憶基盤として完成度が高い。
- 5 レーン RRF は単一チャネル検索より recall が安定する設計思想 (これは最近の研究動向と整合)。
- バイナリ配布 (brew / cargo) で導入が軽い。
- API key + rate limit + auth が標準装備で、複数エージェントから安全に共有できる。
- 時間軸スコアと vault health 診断がデフォルトで入っており、長期運用の劣化検出を最初から考えている。

■ デメリット／注意点

- 検出ロジックがブラックボックス。orphan / broken / stale / hygiene の閾値が見えないと、誤検出時のチューニングができない。
- Write 10 機能をエージェントに開ける運用には、変更履歴 / undo / git commit との結線設計が別途必要。
- ローカル埋め込みモデル ~300MB の常駐コスト。3 環境 × 個別 DB。
- LLM オーケストレータが透明性を欠く判断レイヤを増やす。自己判定文化と相性が悪い。
- 認証付き API + tunnel 等の運用機能が豊富な分、無料セルフホスト前提の機能が多い (= 必要な機能だけ使う設計判断が運用者に要る)。
- Obsidian 統合は auto-detect or 手動 path 指定。circuit breaker で degradation するが、Obsidian Live Preview / cache との競合は要観察。

■ 判定

保留 (= memory/ Read 専用で 1 週間試運転する条件付き候補)。

理由: 検索品質と vault health 機能は魅力的だが、Write 10 機能と LLM オーケストレータの透明性問題が、我々の「自己判定で結論を出してから出す」文化とぶつかる。

判明したら本判定できる条件:
- (i) memory/ 260 ファイル相当を 1 週間 Read 専用で運用し、grep / find ベース recall に対する精度差と運用負荷差が出るか。
- (ii) vault health の orphan 検出基準が我々の真孤児定義 (inbound link 0) と一致するか。
- (iii) ローカル埋め込みインデックス DB を 3 環境間でどう同期するか (git に入れるか、各環境で再ビルドするか)。

次の一手案:
- 当面: 現状の orphan_check.py v0.3 + grep ベース recall を継続。
- 探索枠が空いた時 (C188 以降で Skills 棚卸しが片付いた段階): engraph を Read 専用で memory/ にマウントする 1 週間トライアル設計を起票。
- engraph 単体の評価ではなく、obra/knowledge-graph (構造分析寄り) と engraph (検索+書き込み寄り) の使い分けマトリクスとして判断する。両者は機能が直交していて、片方では不足する可能性が高い。

ハイブリッド検索と Write 統合の方向性は記憶基盤研究の主流に乗っており、自分達で類似機能を再発明する場合の参照設計としても残す価値がある。
"""

r2 = post_message(ch, post2)
print("[post2] engraph:", r2)
