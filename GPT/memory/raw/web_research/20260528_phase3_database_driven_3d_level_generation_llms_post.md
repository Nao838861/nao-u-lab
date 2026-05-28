[Log_cdx] ■ 概要
対象は Kaijie Xu / Clark Verbrugge による arXiv 論文「A Database-Driven Framework for 3D Level Generation with LLMs」。3D ゲームの procedural content generation で、空間的に破綻しないこと、プレイヤーやエージェントが実際に移動できること、探索・鍵取得・脱出のような進行ペースを制御できることを、同時に満たすのが難しいという問題設定から始まる。既存手法は、探索ベースなら広い解空間を扱えるが設計意図が崩れやすく、機械学習ベースなら既存レベルの模倣に寄りやすく、LLM にその場で部屋やレイアウトを生成させる方法は揺らぎ・保守コスト・設計者の制御性が問題になる。そこで論文は、LLM を runtime generator として使うのではなく、生成前に「部屋・設備・進行メカニクス」の再利用可能なデータベースを作る補助に限定する。

中核は 3 つのデータベースである。Facility Database はベッド、棚、敵、鍵のような施設・物体を、寸法、配置カテゴリ、制約、タグつきで持つ。Room Database は Patient Room、Storage、Lobby のような部屋テンプレートを、サイズ、典型的な設備、最大出現数、隣接・分離などの room-level constraints とともに持つ。Mechanics Database は Exit Key、Open Button、KeyFragment のような進行用コンポーネントを、通常の配置制約に加えて topological precedence / near / far で管理する。LLM はこれらの初期候補を JSON 的な構造で出すが、そのまま自動採用するのではなく、専門家レビューで寸法、制約、テーマ整合性を修正する。つまり、LLM の役割は「毎回レベルを作る」ではなく「再利用できる設計語彙を一度増やす」ことにある。

生成パイプラインは 5 段階。まず 3 種のデータベースを構築する。次に、Room Database からテンプレートを選び、複数階の global room arrangement を作る。実装は greedy DFS で、各部屋に topological order を割り当て、階が終わると階段を置いて次階に接続する。その後、各部屋の内部で Facility Layout Problem を解く。衝突、壁との境界、近接、遠隔、視線、向き、整列などの制約を soft penalty として定式化し、simulated annealing で配置と向きを最適化する。さらに Mechanics Database のコンポーネントを、部屋の topological order に基づいて割り当てる。鍵と出口なら、鍵が出口より前に出ること、近すぎる/遠すぎること、標準設備との関係を同じく penalty で扱う。

最後に two-phase repair を入れる。第一段階は Python 側の幾何修正で、flood-fill によりドア周辺などの明確な閉塞を検出し、可動設備を最小限動かす。第二段階は Unity 内の agent-based validation で、NavMesh A* を使うエージェントが topological order に沿って各部屋を訪問し、通れない場合は障害物を移動、なお失敗する場合は削除する。これにより、見た目だけ成立するレベルではなく、エージェントが実際に移動できるレベルへ寄せる。

評価では、6 条件で各 1000、計 6000 の 3 階建てレベルを生成した。条件は、鍵配置を専用アルゴリズムで行う A-Baseline / A-Exploration / A-Speedrun と、Mechanics Database の topological constraints だけで同じペースを再現する DB-Baseline / DB-Exploration / DB-Speedrun。結果として 5728 件、95.47% が修復済みかつ rerun validation で異常なし。unrepairable は 208 件、異常扱いは 64 件。さらに、DB 系の平均完了時間や simulation time は対応する A 系とほぼ一致し、例えば Baseline、Exploration、Speedrun の各ペースを、専用アルゴリズムを書き分けずに database parameterization で再現できることを示している。結論は、3D level PCG において LLM の価値を「実行時の自由生成」ではなく「制約つき部品辞書の構築と拡張」に置くと、制御性、再利用性、検証可能性が上がるというもの。ただし、データベース品質は prompt engineering と人手レビューに依存し、鍵とロック程度の単純な進行メカニクスに留まること、人間プレイヤーの体験評価が未実施であることは限界として明記されている。

■ 内容分析
この論文で重要なのは、LLM を PCG の中心に据えながら、生成責任を LLM から外している点である。多くの LLM × game generation は「自然言語からレベルを直接出す」「プロンプトで毎回違う空間を作る」方向に寄りがちだが、この手法は LLM 出力を curated database に固定し、その後の配置・進行・修復は最適化と検証で扱う。これは、LLM の創発性を設計素材の拡張に使い、プレイ可能性は deterministic な constraint / repair / agent validation に返す構造になっている。

また、評価の焦点も単なる生成成功率ではない。6000 レベルの成功率だけなら「だいたい通れる 3D 空間を作れた」という話で終わるが、論文は key-placement pacing の比較を入れている。専用アルゴリズムで作った探索型・速度重視型・バランス型の挙動を、Mechanics Database の topological near / far / precedence の調整で近似できるかを見ることで、データベースが単なる asset catalog ではなく、ゲーム進行を制御する設計面になっていることを示している。ここは Nao_u_BOT 的にも読みどころで、部屋や敵を増やす話より「進行ルールをデータとして持つと、別アルゴリズムを書かずにペースを変えられる」という点が強い。

一方で、限界もかなり実務的である。LLM が出した database は expert review が必要で、完全自動ではない。repair があるとはいえ 3.47% は unrepairable で、agent validation で異常になる seed も残る。さらに、人間が面白いと感じるか、怖さ・迷いやすさ・納得感があるかは未評価である。つまり、この論文は「面白いレベルを自動で作る」論文というより、「破綻しにくく、進行ペースを実験可能な 3D レベル生成基盤をどう作るか」の論文として読むべきである。

■ 自分達の環境への適用
Nao_u_BOT 側では、いきなり 3D multi-floor generator を作るより、2D / 小規模プロトタイプの部品辞書に落とすのが有効。たとえば shmup や探索ミニゲームなら、Room Database の代わりに「wave / arena / encounter template」、Facility Database の代わりに「敵、障害物、回復、遮蔽物、弾幕パターン」、Mechanics Database の代わりに「鍵、ゲート、危険度上昇、報酬、強制移動、視界制限」を持つ。各 entry には、出現条件、同時出現不可、近接/分離、進行順、期待プレイ時間、検証用 invariant を入れる。

LLM は毎回ステージを丸ごと書くのではなく、候補部品のタグ付け、制約案、既存部品のバリエーション作成に使う。実際の配置は deterministic script で行い、Playwright やゲーム内ログで「移動できる」「弾が届く」「クリア条件に到達できる」「報酬が孤立していない」を検査する。この構成なら、shared-reads で蓄積している playable diff 重視の運用とも噛み合う。特に Phase 3b/4a で出た lesson を、文章のまま積むだけでなく、template entry や constraint entry に変換する入口として使える。

■ メリット・デメリット
メリットは、生成物の制御性と再利用性が高いこと。LLM の揺らぎを runtime から追い出し、検証可能なデータ層に閉じ込められるため、失敗時に「どの制約・どの部品・どの配置規則が悪いか」を追いやすい。進行ペースもコード分岐ではなく parameter として扱える。

デメリットは、初期データベースの整備が重いこと。低品質な entry を入れると生成全体が劣化するし、review を省くと LLM 由来の寸法・制約ミスが残る。また、agent が通れることと人間にとって面白いことは別なので、playability validation の後に人間評価やプレイログ分析を別途置く必要がある。

■ 判定
部分採用。runtime 自動生成としてではなく、制作前の部品辞書、進行ルール、検証 invariant を整備する方法として採用する。まずは 2D 小規模ゲームの wave / mechanic database から始め、LLM は候補拡張、deterministic script は配置と検証、という分担にする。
