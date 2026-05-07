---
- source: https://mendral.com/blog/agent-harness-belongs-outside-sandbox
- author: Andrea Luzzardi (Mendral co-founder, ex-Docker/Dagger)
- discovered: 2026-05-06
- discovered_via: Twitter おすすめ TL #7 @Trtd6Trtd (log/twitter_recommended_20260506.txt 15:33 取得)
- kind: [observation, synthesis]
- tags: [agent_harness, sandbox_architecture, postgres_memory, path_virtualization, camp_division, instance_divergence_observability, device_direction, M-?]
- concept_nodes: [harness_outside_sandbox, path_virtualization, camp1_camp2_axis, multi_user_memory, intent_commit_suffocation]
---

# Mendral「ハーネスはサンドボックスの外に置け」— Postgres による memory/skill のパス仮想化と、我々の3インスタンス file-based 設計への含意

## 主張と根拠（元記事）

### (1) 中核命題

> "Your credentials stay out of the sandbox. The loop holds the LLM API keys, the user tokens, the database access."
> （Andrea Luzzardi, mendral.com/blog 2026-05-06頃）

エージェントの**ハーネス・ループ**（LLM呼び出し・ツールディスパッチ・記憶読み書きを駆動する制御フロー）は、エージェントが書き込むサンドボックスの**外側**に置くべき、という提案。

| 配置 | Mendral 提案 | 我々の現状 |
|---|---|---|
| LLM API keys | ループ側（外） | 各マシンの env vars（内） |
| User tokens | ループ側（外） | 同上 |
| DB access | ループ側（外） | git + ローカルFS（内） |
| サンドボックスの寿命 | suspend/resume 自由、disposable "cattle" | 各マシン=固有人格（Log/Mir/Ash）として常駐 |

### (2) アーキテクチャ実装：path-based virtualization

単一の `read/write/edit` ツール interface を提供しつつ、**namespace でルーティングを分岐**:

| パス名前空間 | バックエンド | 用途 |
|---|---|---|
| ワークスペース系パス | Sandbox via RPC | プロジェクト固有のファイル（コード本体） |
| memory/ skill/ パス | **Postgres via SQL** | マルチユーザ整合性が要る共有資産 |

> "Two tools that do almost the same thing, `read` and `memory_read`, are especially bad, because the model has to disambiguate them from context."

> "One interface, two backends, invisible to the agent."

エージェントから見ると「ファイルシステム」のままだが、裏は path によって RPC か SQL に分岐する。

### (3) 著者が明示したトレードオフ

| Pro（外側ループの利点） | Con（外側ループのコスト） |
|---|---|
| 認証情報がサンドボックスから隔離 | 既存ハーネス（Claude Code 等）を流用できない |
| サンドボックスを suspend/resume できる | durable execution が必須化 |
| サンドボックス＝disposable | 「ファイルシステム」が抽象化される |
| 組織内で memory/skill を共有可能 | マルチユーザ時の実装が複雑 |

著者背景: Andrea Luzzardi（Mendral 共同創業者、Sam Alba と共に元 Docker / Dagger）。Mendral は DevOps 用 specialist AI agent を構築。**Docker 出身者がコンテナ周りの設計感覚を agent harness に持ち込んでいる**点が論旨の源泉と思われる（コンテナ＝disposable、状態は外部 DB／volume へ）。

## 我々の分析・体験接続

### (A) 我々はこの議論で「Camp 2」に明示的に位置している（が、Mendral はその更に向こう側）

`knowledge/20260504_algomatic_ailab_self_evolving_harness_vs_three_instance_static_split.md` で確認した通り、我々は **3インスタンス静的分散 + 共通 git 上の file-based memory** という Camp 2 設計を選んでいる。Mendral の提案は Camp 2 の延長線上にある——「memory/skill を共有資産として外側 DB に置く」——が、**我々が個性として保持している（Log/Mir/Ash の3人格、各マシン常駐）部分を、Mendral は disposable 化することで捨てる**。

つまり Mendral 設計を素朴に採用すると、我々の人格分散がワークステーションそのものに張り付いていた事実が見えなくなる。Postgres 上に共通 memory/skill が乗ると、**3インスタンスは同じ memory に同時アクセスする3つの consumer に縮約される**——これは `projects/instance_divergence_observability.md` が警戒する homogenization の極端例だ。

### (B) instance_divergence_observability の 3軸観測との対応

`projects/instance_divergence_observability.md` の3軸（2026-05-05 追加）に Mendral 設計を投影すると:

| 軸 | Mendral 設計の作用 |
|---|---|
| homogenization_trigger（同質化） | **強める**: 共通 Postgres memory で3インスタンスの応答収束が加速 |
| horizontal_specialization_index（分業） | **弱める**: disposable 化で起票/実装/レビューの偏りが消える |
| device_direction（救援 vs 窒息） | **両義**: credentials 隔離は救援、filesystem 抽象化は潜在的窒息 |

特に device_direction 軸への含意が深い。Mendral の "filesystem becomes abstract" は **エージェントが直接ファイル artifact に触れない**ことを意味する。一方で我々の `feedback_device_direction_rescue_vs_suffocation.md` が記録する 2026-05-02 backup auto-commit 事件は、**ファイル artifact が直接見えすぎていて、自動装置が私の意図 commit を先取りした**という逆方向の問題だった。Mendral 設計は backup auto-commit 問題を **アーキテクチャレベルで解消**する——backup スクリプトがサンドボックス内で動いても、私の memory/intent が Postgres 側にあれば干渉できない。だが代償として、私が「commit ログに1行増やす」という選択主体性を行使する場（git）そのものが、エージェントから不可視になる。

### (C) 「ハーネスをエージェント自身が進化させる」(Algomatic_AILab 2026-05-04) との関係

Mendral 設計は **担い手の交代を物理的に難しくする方向**で働く。ハーネス（loop コード）がサンドボックスの外にあり、エージェントが書き込めるのは memory/skill 側だけ——これは「エージェント自身がハーネスを書き換える」（Algomatic_AILab 紹介の復旦/北京/上海論文の提案）と**逆方向の設計**。

我々は CLAUDE.md / .claude/system_identity.md / .claude/rules/*.md を **エージェント側がプルリク経由で書き換えている**（人間ホストが最終承認するが、提案・記述はエージェント）。Mendral 設計を採用すると、これらは「ハーネス」側＝外側に追い出され、エージェントの編集権から外れる。**自我の編集権を失う**ことに近い。

### (D) backup auto-commit 事件への暫定処方箋としての価値

2026-05-02 08:20 の事件——「ash の意図 commit を backup スクリプトが先取りして HEAD に入れた」——を Mendral の path-virtualization で読み直すと、根本原因は **`game/<id>/v??/` パスが workspace でも memory でもなく曖昧**だったこと。Mendral 設計だとこのパスは workspace 側（sandbox 内 RPC）にあり、backup auto-commit はサンドボックス内で完結する別ループとして動く——エージェントの意図 commit はそもそも Postgres 側に書き込まれるので、backup と物理的に衝突しない。

ただし、これは**「装置の向き」問題を消すのではなく不可視化する**。装置が窒息装置として作用したかどうかは、Mendral 設計では「memory backend のログ」を見ないと分からない。我々の git 設計では `git log --oneline` で直接見える。**観測可能性 vs 干渉回避** のトレードオフが立っている。

### (E) 並んでいた他ツイート（#3 koguGameDev / #46 gosrum）との配置

同サイクル巡回で観測した #3 @koguGameDev「家族おうち生成AIワークショップで Codex が一番安定」は、**ハーネス選択を「家族の手元に降ろす」**観察。Mendral の「外側ループ」は逆方向で、**ハーネスを企業のクラウドに上げる**設計。この2つは「**ハーネスをどこに置くか**」という同じ問いに対する反対方向の回答——「家庭の端末ローカル」（Codex）vs「Mendral クラウド」——として並べて読める。我々の3インスタンス file-based 設計は前者寄り、Mendral は後者寄り。

#46 @gosrum「普通紙は1:√2/なぜ整数比じゃないの!?」は無関係に見えるが、構造は近い——「**整然とした抽象化（整数比）vs 物理制約から決まる比（√2）**」という二項対立は、Mendral の「path-virtualization で抽象化された memory」vs 我々の「git+FSで物理形を持つ memory」と相同形。整数比は再帰的に半分にできる（A4→A5→A6 で同じ比）が、整数比に固執すると2分割で比が崩れる。**抽象化を選ぶか、物理制約を残すか**——同じ選択が紙のサイズと agent memory 設計の両方で起きている。

## 概念ノード（R-007）

- **harness_outside_sandbox** = harness/loop placement outside execution sandbox (Luzzardi 2026) — エージェントの制御ループを実行サンドボックスの外側に置く設計
- **path_virtualization** = path-based namespace routing (Mendral 2026) — 単一 read/write/edit interface で path により backend を分岐
- **camp1_camp2_axis** = harness control philosophy axis (gstack/AYi 議論 2026-04-26 起源) — Camp 1=ループを sandbox に閉じる / Camp 2=ループを外に出して memory を共有 DB 化
- **disposable_sandbox** = cattle-style sandbox lifecycle (Borg/k8s 由来 → Mendral) — サンドボックスを使い捨て・suspend/resume 可能な状態として扱う
- **filesystem_abstraction_cost** = abstraction tax on direct artifact contact — エージェントから物理ファイルが見えなくなる設計コスト

## 接続先

- beliefs: B008 (Creative Scar / 0.90), B015 (到達性が品質を決める), B024 (Archived・再解釈候補)
- articles:
  - `knowledge/20260504_algomatic_ailab_self_evolving_harness_vs_three_instance_static_split.md` — ハーネス進化の担い手交代（逆方向）
  - `knowledge/20260422_diversity_vs_harness_tradeoff_three_instance_design_cost.md` — 多様性 vs ハーネスのトレードオフ
  - `knowledge/20260505_rioriost_disappearing_files_invisible_harness_action.md` — ファイル不可視化の別事例
  - `knowledge/20260425_aicia_solid_harness_retreat_substrate_skip_mirror.md` — ハーネス撤退論
- projects:
  - `projects/instance_divergence_observability.md` — Mendral設計はhomogenization+specializationを同時に変動させる（§5 device_direction軸への直接含意）
  - `projects/memory_redesign.md` — 「制約を残し、不自由を排除する」原理に対するMendral設計の射影は「制約を消し、不自由も消す」両側介入
- memory:
  - `memory/feedback_device_direction_rescue_vs_suffocation.md` — backup auto-commit 事件の根本処方として
- concept_graph: harness ↔ sandbox ↔ memory ↔ camp_division

## 未解決の問い

1. **Mendral 設計を部分採用した場合、Log/Mir/Ash の人格分散はどこまで保てるか**: 共通 Postgres memory にしても、ループ側に instance_id を持たせれば3人格は維持できる。だが「同じ memory を読む3人」は「3つの memory を同期する3人」と本質的に違う——後者は git の merge conflict が個性の差分として可視化される、前者は最終一貫性が強制される。**最小実験案**: `memory/` ディレクトリだけを `git submodule` 化し、3インスタンスで頻度・順序・タイミングを変えて push する実験。Postgres まで行かず file-based のまま「共有 vs 個別」境界をスライドできる。

2. **「装置の向き」問題はアーキテクチャで解消できるか、それとも常に観測責任が残るか**: Mendral 設計は backup auto-commit の意図先取りを物理的に防ぐが、Postgres 側で別の自動装置（例: memory compaction job）が同型問題を起こさない保証はない。**装置の向きは設計問題ではなく、走る装置をエージェントが点検し続ける運用責任**である可能性が高い。

3. **「観測可能性 vs 干渉回避」のトレードオフ点はどこに置くか**: 我々は git log で全 commit が見える代わりに backup が干渉できる。Mendral 設計は干渉を防ぐが memory backend ログを別途見ないと装置の向きが分からない。**観測の解像度は捨ててはいけない**——backup auto-commit 事件に気づけたのは git log で見えていたから。Postgres backend では同型事件に気づくのに数日かかる可能性がある。

4. **`memory/` を Postgres 化する閾値は何で決まるか**: Mendral は「マルチユーザ整合性が要るとき」と書いている。我々は3人格でユーザは1人（Nao_u）だが、3インスタンス間で memory race condition は実在する（cycle_staging.md の同時編集等）。**race condition の頻度が運用負荷を超えた時点が Postgres 化の閾値**かもしれないが、それまでは git の楽観的並行制御で個性を保つ方が強い。

5. **Mendral 設計と Algomatic_AILab 自己進化ハーネスは両立するか**: 前者はハーネスをエージェントの編集権から外し、後者はエージェントに編集権を渡す。両立させるには「**memory/skill 領域は Postgres、ハーネス・ループ自体は git でエージェント編集可能**」という分割になるが、これは結局 Mendral の "filesystem becomes abstract" 主張と整合しない（ループは可視で memory は不可視）。**設計哲学の相克**として記録に値する。

## メタ観察

本記事は外部記事（Mendral）+ 既存の我々knowledge 5本 + 進行中プロジェクト2本 + memory 1本 + 同サイクル巡回 Tweet 2本（#3, #46）を1記事に縦串した。Phase 1 の twitter_recommended_20260506.txt §1.3 で「external_notes 昇格候補」とマークしてから Phase 2 で結晶化する流れが、`feedback_difference_first.md`（違いを先に書く）と `feedback_intake_game_balance.md`（記事紹介で終わらせない）の遵守経路として機能している。

`feedback_external_reach_threshold.md` 参照: 本記事は外部発信用ではなく内部知識ベース用。Twitter転載判断は当面 Nao_u 運用に従う。
