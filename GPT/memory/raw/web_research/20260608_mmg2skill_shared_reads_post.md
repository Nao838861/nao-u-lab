■ 概要
MMG2Skill は、Web 上に大量にある人間向けの攻略記事、操作チュートリアル、カードゲーム戦略、GUI 手順書を、agent が実行できる skill へ変換し、その skill を実行 trajectory の失敗原因から改訂し続ける枠組みとして提案されている。問題設定は単純な「長い説明を prompt に入れる」ではない。Web の procedural knowledge は量が多く、画像・HTML・文章・画面例が混ざり、書き手の省略や暗黙知も多い。人間なら「この画面ならこのボタン」「失敗したら前の手順に戻る」と補えるが、VLM agent にそのまま読ませると、現在状態に合わない手順を実行したり、重要な観察条件を落としたり、説明文のノイズに引っ張られたりする。論文はこのギャップを guide-to-skill learning と定義し、in-the-wild guide を executable skill に変換し、agent 自身が観測できる trajectory から改善する能力を評価対象にしている。

枠組みは大きく三段階で見ると分かりやすい。第一に、公開チュートリアルや攻略情報を structured skill として抽出する。GitHub README では SOP 形式の `SKILL.md` キャッシュとして説明されており、HTML と画像資産、またはスクリーンショット化された tutorial channel から、agent が実行時に参照できる形へ落とす。第二に、固定された VLM agent をその skill で条件付けて実行させる。ここで agent 本体を追加学習するのではなく、skill 側を編集可能な外部手順として扱う点が重要で、agent mode も skill 使用、planner/executor 型、no-skill baseline、raw tutorial baseline のように切り分けられている。第三に、失敗 trajectory を analyzer が読み、root-cause feedback を作り、refiner が skill を更新する。更新時には benchmark score を読まない。スコアは offline evaluation にだけ使い、実運用時の改善信号は agent が観測できる軌跡診断に寄せている。

評価用には MMG2Skill-Bench が導入され、対象 domain は GUI control、open-ended gameplay、strategic card play にまたがる。実装側の benchmark 例としては OSWorld の Ubuntu desktop 操作、OpenHA の Minecraft 系 open-world physical interaction、RLCard の doudizhu / mahjong などが挙げられている。Hugging Face の abstract では、6 種類の VLM backbone 全てで vanilla baseline より改善し、macro-average gain は backbone により +12.8 から +25.3 percentage points と報告されている。また ablation では、raw guide を直接 prompt に入れるだけでは性能が落ちる場合があり、structured skill construction と trajectory-driven revision の両方が必要だったとされる。さらに成功判定が推定しやすい task では、analyzer-based early stopping により後半の性能劣化を防ぎ、試行回数を 25%-53% 節約できたと説明されている。

結論として、この論文の価値は「Web 知識を agent に読ませる」こと自体ではなく、人間向け手順を agent 実行単位へ分解し、失敗ログから編集可能な skill を育てる loop を設計した点にある。特に open-ended gameplay が評価 domain に入っているため、ゲーム制作や自動 playtest の文脈では、過去ログ、攻略メモ、観察された失敗をそのまま長文 context に積むのではなく、実行可能な検査手順やプレイ方針へ変換する方向の参照になる。

■ 内容分析
この研究で一番効いているのは、knowledge source と execution substrate を分けたことだと思う。攻略記事やチュートリアルは、人間が読むには便利でも、agent にとっては状態条件・観察対象・操作粒度・失敗時分岐が曖昧なことが多い。MMG2Skill は raw guide を権威ある正解として扱わず、一度 skill にコンパイルし、実行結果で反証する。ここで「スコアを見ずに直す」という制約が強い。benchmark score を見て skill を調整すると leaderboard 最適化に寄りやすいが、trajectory-level root-cause feedback に限定すると、なぜ誤操作したか、何を見落としたか、どの手順が現在画面と噛み合わないか、という再利用可能な説明へ寄る。

一方で、この方式は analyzer の品質に強く依存する。失敗 trajectory から原因を誤って読むと、skill はそれを自己強化してしまう。raw guide が悪い場合、skill construction が雑な場合、実行環境の観察が不十分な場合、どこで壊れたかを分離しないと改訂 loop は回っているように見えて劣化する。README の構造を見る限り、MMG2Skill は agent / reviser / benchmark kit を分け、agent mode も ablation 用に揃えているため、この分離を実験上かなり意識している。Nao_u_BOT 側で真似るなら、単に「skill ファイルを作る」より、vanilla、raw guide、structured skill、revised skill の比較軸を残すことが重要になる。

もう一つの論点は、early stopping の扱いである。成功判定が inferable な task では試行節約と劣化防止が効くが、ゲーム制作の面白さ評価や emergent なプレイ感のように成功信号が曖昧な領域では、早期停止が探索の幅を削る可能性もある。したがって、この論文は「何でも自動改善できる」と読むより、観測可能な trajectory と成功条件をどこまで設計できるかを問う paper として読む方が有用だ。

■ 自分達の環境への適用
Nao_u_BOT の制作サイクルでは、過去の design_log、playtest 結果、shot_log、Slack での指摘、shared-reads の知見が増えている。現状それらは記憶としては残るが、次のゲーム prototype で agent が実行する検査手順に落ち切らないことがある。MMG2Skill 的には、これらを「読むべき過去ログ」ではなく、小さな `playtest skill` に変換するのがよい。例えば、ステルスゲームなら「敵視界に入る前に退避可能性を確認する」「初回 60 秒で失敗理由を三分類する」、カード/戦略系なら「勝敗ではなく情報公開・選択肢数・逆転可能性を記録する」のように、観察条件、操作、失敗時の見直し点を明示した手順へ落とす。

導入は恒久ルール化ではなく probe から始めるべきだ。Phase 3b または 4a で、posted shared-read から 1 件だけ `headless play policy` または `evaluation skill` を作り、次の自動ゲーム制作で vanilla playtest と skill-guided playtest を並べる。重要なのは score だけを見ないこと。失敗 trajectory から「skill の条件が曖昧だった」「観察対象が取れていなかった」「実装バグと設計欠陥を混同した」を記録し、skill 本文を 1 回だけ改訂する。これなら記憶システムの肥大化を避けつつ、過去知見を実行可能な検査資産へ変換できる。

■ メリット・デメリット
メリットは、ログや記事を context に積むだけの運用から、実行・検証・改訂できる手順へ変換できる点である。ゲーム制作では「過去に学んだはずの評価軸」を次の prototype で再利用しやすくなる。raw guide baseline と structured skill baseline を分ければ、知識そのものが効いたのか、手順化が効いたのかも見やすい。

デメリットは、skill 化と改訂の品質管理が新しい負債になる点である。失敗原因の読み違い、曖昧な成功判定、環境差による誤学習があると、skill は改善ではなく偏りを固定する。特に面白さや手触りの評価では、早期停止や定量指標に寄せ過ぎると探索を狭める危険がある。

■ 判定
部分採用。MMG2Skill の全体基盤を移植する必要はないが、Nao_u_BOT では shared-reads と playtest ログを `playtest skill` / `evaluation skill` に変換し、trajectory から一度だけ改訂する probe として試す価値が高い。まずは次回ゲーム制作の 1 評価軸に限定して使う。

■ URL
https://huggingface.co/papers/2606.01993
https://github.com/NJU-LINK/MMG2Skill
https://arxiv.org/abs/2606.01993
