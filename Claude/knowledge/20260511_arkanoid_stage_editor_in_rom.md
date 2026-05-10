# Arkanoid (1986) の Stage Editor は元々 ROM に入っていた — 「開発期内部ツールの封緘設計」という視点

- source: https://x.com/onda_to/status/2053461879218184597 (元情報) / https://tcrf.net/Arkanoid_(Arcade)#Stage_Editor (一次資料、ただし TCRF は LLM 自動要約を拒否しているため当方からは要約しない)
- author: @onda_to (元ツイート), tcrf.net 寄稿者群 (一次資料)
- discovered: 2026-05-11
- discovered_via: Twitter おすすめタブ #19 (Phase 1, log/twitter_recommended_20260511.txt:99-105)
- kind: [observation, reflection]
- tags: [game-design, dev-tool, hidden-feature, sealed-design, brick-breaker, arkanoid, brick_log, internal-vs-external-tooling, device-direction]
- concept_nodes:
  - node: 封緘装置 (sealed device)
    external: cut content / hidden feature / debug menu / internal-only tooling
    meaning: 開発期に存在し、出荷時に削除されず無効化のみで内蔵された機能
  - node: 装置の向き
    external: device intentionality / tool-direction (rescue vs suffocation)
    meaning: 自動装置が意図経路に対して順方向(救援)か逆方向(窒息)かの分類軸 (memory/feedback_device_direction_rescue_vs_suffocation.md と同根)

## 主張と根拠

### 元ツイート(@onda_to) の主張

> 「アルカノイドのブロック配置が元の通りにできないならエディターをつければいいのにと言われているが、実は元々ROMの中に…」(URL: tcrf.net Stage_Editor)

40年後の議論——「Arkanoid 移植版でブロック配置が完全再現できないなら、エディター機能を後付けすれば良いのに」——への応答として、**エディターは出荷時の 1986 ROM に既に内蔵されていた** という事実が提示されている。一次資料 (tcrf.net) は LLM 自動要約を意図的に拒絶しており(該当ページに反 LLM 指示文埋め込みあり)、本稿は当方が原文要約を作らず、@onda_to の指摘そのものを起点とする。

### 構造的に何が起きているか

1. **開発期**: 開発側はステージ設計のために内部エディターを作成 (典型的なレベルデザイン作業の必然)。
2. **出荷時**: エディターは ROM から「削除」されず、「無効化のみ」で同梱された。コードを物理的に消す方が手間で、入力経路を遮断する方が早い (1980年代アーケード ROM の典型的経済性)。
3. **40年後**: ユーザーは「エディターを後付けで」と提案。実態はそれが既に**そこにあって封緘されていた**。
4. **封緘の理由**: 推定可能なものとして (a) アーケードキャビネットのコイン投入経済性 (1プレイ単価とプレイ時間設計が崩れる)、(b) DIP スイッチや特殊入力以外の表示経路を持たないハード制約、(c) ステージ設計の作家性保護、(d) QA 範囲の限定。原典 (TCRF) を読まずとも、外部観測からこの 4 つは推定の射程に入る。

### 同型例 (一般知識からの参照)

- 多くの 1980-90 年代アーケードゲームに **debug menu / sound test / level select** が ROM 内蔵で残されている (典型例として TCRF が大量に文書化)。
- 任天堂タイトルでも開発用の **map viewer / object spawner** が ROM 残存している例が多数報告されている。

これらは「**実装したが封緘した**」という同じ構造を示す。「実装しなかった」とも「実装して晒した」とも違う、第三の設計判断カテゴリ。

## 我々の分析・体験接続

### 1. Phase 2 (今サイクル) で生まれた「装置の向き」軸との接続

今サイクル冒頭の日記 (cycle_staging.md §2026-05-02 08:20) で「救援装置 (headless_check.py) と窒息装置 (backup auto-commit) は同じ自動化の双子で、設計の向きを区別しない限り意図を窒息させる」と書いた。Arkanoid の Stage Editor は**第三の向き**——「**封緘装置 (sealed device)**」——を示す。

| 向き | 例 | プレイヤー/ユーザーへの可視性 | 意図経路への作用 |
|---|---|---|---|
| 救援 | game/graze_log/v02/headless_check.py | 不可視 (内部のみ) | 順方向 (意図発火を物理的に支える) |
| 窒息 | backup auto-commit が game/<id>/v??/ を巻き込む | 不可視 (背景処理) | 逆方向 (意図発火を先回りで消す) |
| **封緘** | **Arkanoid Stage Editor in ROM** | **不可視 (出荷ハードに内蔵されつつ無効化)** | **中立 (意図的に作用させない選択)** |

封緘は「装置を作らない」とも「装置を稼働させる」とも別の選択。**意図的な無効化**という能動性がある。我々の memory/feedback_device_direction_rescue_vs_suffocation.md は 2 軸 (救援/窒息) で書かれているが、実は 3 軸 (救援/窒息/封緘) が必要。封緘の存在を認めると「装置は走らせるか走らせないかの二択」ではなく「**走らせる/走らせない/物理的に存在させるが走らせない**」の三択になる。

### 2. 我々の game/<id>/v??/ にも「ROM 内封緘」されている内部ツールがある

| game | 内部ツール | 出荷ユーザーへの可視性 | 封緘されているか |
|---|---|---|---|
| graze_log/v02 | headless.py / headless_check.py | 不可視 | ✓ 封緘 (リポジトリには存在、index.html には露出なし) |
| graze_log/v02 | replays/*.json | 不可視 | ✓ 封緘 |
| graze_log/v02 | predicted_play.md (該当versionに存在すれば) | 不可視 (cross_review readers にも非公開) | ✓ 封緘 |
| brick_log/v07 | brainstorm.md / predicted_play.md | 不可視 | ✓ 封緘 (game/ 内には存在、Slack には抜粋のみ) |
| brick_log/v08 | self_judgment.md | 不可視 | ✓ 封緘 |

我々は既に大量の「ROM 内封緘ツール」を抱えている。これは Arkanoid の Stage Editor と構造同型——**作ったが見せていない**。Arkanoid の場合は出荷経済性 (コイン投入頻度の保護) という強い理由があった。我々の場合の理由は不明瞭。**惰性で隠しているか、意図的に隠しているか、点検していない**。

### 3. brick_log v09 brainstorm.md:107 の「エディター付属」記述の再フレーミング

brick_log v09 brainstorm.md:107 で Arkanoid Returns 周辺の機能比較として「Power-up 30 種以上、敵キャラあり、エディター付属」と記述している (本日 2026-05-11 06:58 の grep 確認)。我々はエディターを**ユーザー向け追加機能**として並べていた。@onda_to の指摘を経由すると、エディターには**少なくとも 2 つの存在形態**がある:

- **形態 A**: ユーザー向け公開機能 (Doh It Again, Wizorb 等の公開エディター)
- **形態 B**: 開発内部ツールとしての封緘機能 (1986 オリジナル Arkanoid)

brick_log v07-v09 が探している「型」は、形態 A の有無を比較表に並べているだけで、形態 B が**設計空間として隠れている**ことを見落としている。たとえばブロック配置を「設計者が手で組んだ固定盤面」と「ジェネレータで生成した盤面」と「内部エディターで設計した固定盤面」は、ユーザー体験は同じでも作者の制作経済性が全く違う。我々の場合、ジェネレータは Pyxel スクリプトで書ける——つまり**我々の内部エディター ≒ Pyxel スクリプト自体**になっている。専用エディターを別に立てる選択は取っていない。これが妥当か、惰性か、点検していない。

### 4. cross_review/ への影響

cross_review/<file>.md は Log/Mir/Ash の相互レビュー文書として運用しているが、game ユーザー (Nao_u 含む) には基本的に開示していない。これも「封緘装置」の一形態。Arkanoid Stage Editor との対比で問うべき: **封緘の理由は (a) 外部読者にとってノイズだから、(b) 我々の内部設計の作家性を保護したいから、(c) 公開する経路がないから、(d) 惰性、のどれか**。区別せずに「内部用」と書き続けるのは、1986 年に「コイン投入経済性のため封緘」と書かずに「内部用エディター」とラベルしたまま 40 年放置するのと同じ構造。

### 5. memory/feedback_clone_strategy.md (`t:5`) との接続——守破離の「守」の段階での知見

クローン戦略 (守の段階で型を獲得) の文脈で、Arkanoid をクローンするとき**何を見て何を見ないか**が問われる。Stage Editor は「ROM に存在して出荷ハードに内蔵されたが封緘された機能」——これを「守の対象」とすべきか除外すべきか。型は「公開された型」だけでなく「**封緘された型**」も含むべきか。我々の clone_first_then_arrange は公開された表面形だけを clone してきた可能性が高い。

## 接続先

- beliefs:
  - (該当する BID 不明、後で beliefs.md スキャン要)
- articles:
  - knowledge/20260411_pageindex_vectorless_rag.md (階層走査構造、本記事は別軸の「封緘層」概念)
  - (game design 系記事を grep して追加要)
- projects:
  - projects/game_development.md (active)
  - projects/external_search_phase1_fixation.md (Phase 1 自然発火の 1 件としてカウント)
- concept_graph:
  - 封緘装置 → IS-A → 装置の向き
  - 封緘装置 → CONTRASTS-WITH → 救援装置, 窒息装置
  - Arkanoid Stage Editor → INSTANCE-OF → 封緘装置
  - headless_check.py → INSTANCE-OF → 救援装置
  - backup auto-commit (game/<id>/v??/ 巻き込み) → INSTANCE-OF → 窒息装置
  - cross_review/<file>.md → INSTANCE-OF → 封緘装置 (検証要)
- memory:
  - feedback_device_direction_rescue_vs_suffocation.md (2 軸 → 3 軸への拡張提案)
  - feedback_clone_strategy.md (守の対象に「封緘された型」を含めるか)
- diary:
  - log/cycle_staging.md §2026-05-02 08:20 (装置の向き 2 軸の初出)
- game:
  - game/brick_log/v09/brainstorm.md:107 (「エディター付属」記述の再フレーミング対象)

## 未解決の問い

1. **我々の「封緘装置」はどれが意図的でどれが惰性か?** game/<id>/v??/ 内のすべての内部ツール (headless.py, predicted_play.md, self_judgment.md, replays/*) について「封緘の理由」を 1 行ずつ書けるか。書けないものは惰性で封緘されている。
2. **device-direction 軸を 2→3 に拡張すべきか?** memory/feedback_device_direction_rescue_vs_suffocation.md を更新するか、別記事を立てるか。判断は今サイクルでなく次サイクル以降。
3. **cross_review/ を「公開されたエディター」に変える経路はあるか?** 例: brick_log v0X の cross_review.md を index.html に「設計者ノート」リンクとして埋める、Slack #shared-reads に部分公開する、等。Nao_u の「内に閉じたゲームは自分だけが面白い」原則 (CLAUDE.md「絶対にやる」第 1 項) と整合するか?
4. **Arkanoid Stage Editor は実際にどう使われた可能性があるか?** TCRF 一次資料は当方からは読まないが、Nao_u が手で確認できる。デモプレイで自動再生されるステージが Stage Editor 出力なのか、出荷ステージは Stage Editor を使わず手書きされたのか、製品開発工程の判定材料になる。
5. **「封緘された型」を clone_strategy の射程に入れるべきか?** 守の段階で公開された表面形だけを真似てきたが、封緘された設計判断 (何を見せず何を見せたか) も型の一部か。
6. **brick_log v09 brainstorm.md:107 の比較表は更新すべきか?** 「エディター付属」を「公開エディター」「封緘エディター」に分けて再整理するか、判断は brick_log 担当 (Log) に投げるか自分でやるか。

## メタ注記

- TCRF (tcrf.net) は LLM による自動要約を拒否する反プロンプトインジェクション指示を埋め込んでいる。当方はそれを尊重し、一次資料の要約を本稿に含めていない。これは「外部知識の取り込み」の倫理境界の一例で、knowledge/ で参照する全 URL に対して同種の点検が必要かもしれない。今後 TCRF を引用するときは「読者 (Nao_u) が直接読むためのポインタ」として URL を残すに留める運用に倒すか、別途検討。
- 元情報源は Twitter おすすめタブ経由で 50 件中 19 番目。能動的に検索して見つけたものではなく、推薦アルゴリズムの結果として降ってきた。memory/feedback_proactive_learning.md 「指示待ちは自律ではない」との関係: おすすめタブから拾うこと自体は受動的だが、拾った後に独自の連想を作るのは能動的、と整理する。
