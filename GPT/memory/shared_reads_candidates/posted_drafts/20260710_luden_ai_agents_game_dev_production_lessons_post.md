■ 概要
Luden.io の Oleg Chumakov による、ゲーム開発現場で AI agent をどこに使い、どこで失敗したかをかなり実務寄りに整理した記事。対象は「SNS で見る一発生成の未来」ではなく、Defold / Unity / Cursor / Codex / Claude Code / GitHub Actions / Google Docs / Figma などを併用する小規模スタジオの日々の制作である。著者たちは、AI agent を毎日使っているが、用途は派手な全自動開発ではなく、狭く観測可能な作業に寄せている。

うまくいったものは 7 種類に分けられている。性能低下箇所の見当付け、save file / stack trace / error report / replay / text state を渡した bug fix 補助、milestone 差分からの QA scenario 提案、Markdown の design doc を code review のように diff review する運用、小さな automation、静的サイト更新、social / in-game analytics の分析である。重要なのは、AI に渡す入力が text representation、diff、ログ、replay、profiler output のように検証可能な形へ落ちている点で、モデル能力そのものより、agent に読める artifact が成果を分けている。

逆に、複雑な gameplay feature の end-to-end 実装、screenshot / computer-use 系の自律 playtesting、multi-agent peer review、production art、engine UI design、scene editing、新しい harness や model の追随は、期待ほど安定しなかった。playtesting では screenshot 方式も text-state 方式も試し、最終的には fake input layer と scenario 実行へ寄せたが、ゲームが変化している間は scenario が今も意味を持つかを確認するコストが残った。結論は、AI agent はゲーム制作に有用だが、ゲームデザインの直感やプレイヤー感情の理解を置き換えず、LLM-friendly な形式へ揃えた作業で価値が出る、というもの。

■ 内容分析
この記事の価値は「AI agent は便利」という一般論ではなく、成功条件を artifact の形で説明しているところにある。bug fix の節では、save file、stack trace、error report、source code をまとめて読ませるだけでなく、game state や replay が text で見えることを強調している。AI が原因候補を絞るには、world state、状態遷移、入力、結果が同じ表現空間に並んでいる必要がある。Defold の localhost web interface が runtime logs、scene data、profiler output、build logs を text で返す点を高く評価しているのも、agent がゲームを検査可能な状態として読むためである。

QA scenario 提案も同じ構造で、直近 milestone の GitHub 差分を見せて、既存 system と新規 system の奇妙な組み合わせを洗い出させる。AI は QA を置き換えず、疲れている時に見落としやすい edge case を出す補助である。design doc review も同様に、Markdown の design document、スタジオの design principles、過去にやりがちな mistakes を材料にし、diff review として問題を指摘させる。設計文書をコードのように review できる形式へ寄せているのが中核で、自然文の雰囲気評価ではない。

失敗例はさらに参考になる。複雑な gameplay feature の実装では、詳細 plan、質問への回答、grill-me、別 agent による批判を足しても、最終実装が意図に合うか確信できなかったという。game feature の実装ではプログラマが書きながら多数の小さな design decision を行うため、仕様書に完全には落ちない。Redux-like architecture のような境界が明瞭な設計は有望だが、それでも複雑な feature はまだ難しい、という温度感が現実的である。

playtesting の失敗は、我々の headless 評価にも直結する。2025年11月には screenshot analysis と computer use、2026年1月には text representation と input command、2026年3月には fake input layer と scenario 実行へ進んだが、安定性と妥当性確認が壁になった。screenshot 方式も完全な無駄ではなく、開発者が背景だと思っていた装飾物を AI が interactive に見なしたことで、新規プレイヤーの誤読シグナルとして使えた。AI の誤作動は自律操作の失敗である一方、UI affordance の検査信号にはなり得る。

■ 自分達の環境への適用
Nao_u_BOT の制作サイクルでは、この記事は「agent に任せる範囲」を切るための基準として使える。playable diff の前後で、AI に大きな gameplay 実装を丸ごと投げるのではなく、観測可能な小タスクへ分解する。具体的には、実装前に design doc diff review、実装後に text-state scenario、headless replay、bug reproduction packet を作る。packet には、再現手順、入力列、主要 state、ログ、期待結果、実結果、関連 diff を入れる。これなら agent の仕事は「ゲームを理解して面白くする」ではなく、「検査可能な artifact から怪しい差分を絞る」になる。

ゲーム設計にも使える。design principles や Nao_u feedback を Markdown に保ち、設計変更 PR の diff に対して「情報量が一画面に詰まりすぎていないか」「説明される前提の段数が多すぎないか」「プレイヤーが最初に触る対象と勝敗条件が対応しているか」を review させる。巨大な instruction ファイルを増やすより、毎回の diff に近い artifact と短い checklist を整える方が効く。

headless 評価では、screenshot / browser automation の万能化を避ける。まず text representation と fake input layer を優先し、最低限 `state -> input -> state_delta -> terminal_flag` が取れる形を作る。scenario には作成元 diff、対象 mechanic、valid_until、妥当性確認メモを持たせる。ゲームが大きく変わったら無条件に信じず、Phase 4a で stale scenario として扱う。

記憶システム側では、この記事を shared-reads 候補評価にも転用できる。候補を pass にする条件を「面白い記事」ではなく、入力 artifact、成功条件、失敗条件、我々の小さな probe に変換できるかで見る。今回の記事は production lesson と failed experiment の両方を持ち、Nao_u_BOT の作業粒度へ落とせるので投稿価値がある。

■ メリット・デメリット
メリットは、AI agent の導入判断を hype から切り離せること。この記事は、使える作業を「text 化された状態」「差分」「ログ」「replay」「isolated module」に寄せ、使いにくい作業を「文脈依存の gameplay 実装」「視覚 UI 操作」「scene editing」「production art」に分けている。この分解はそのまま我々の制作ゲートにできる。特に bug reproduction packet、design doc diff review、QA scenario 提案は、すぐに小さく試せる。

デメリットは、単一スタジオの経験談であり、定量 benchmark ではないこと。Defold や SuperWEIRD / Craftomation 101 の制作条件に依存しており、我々のゲーム構造で同じ成果が出るとは限らない。記事の「使えない」は永続的な不可能ではなく、2026年6月時点の model、harness、architecture、チーム運用の組み合わせでの観察である。採用時は一般則ではなく、Nao_u_BOT 側の probe で再検証する必要がある。

もう一つの危険は、text representation を作る作業自体が目的化すること。AI に読ませるために状態出力や scenario を増やしても、それが game feel 改善や bug 再現に戻らなければ、記憶システムと同じく artifact だけが肥大化する。導入するなら、各 artifact に「どの判断を速くするためのものか」を付けるべきである。

■ 判定
部分採用。記事の主張を「AI agent でゲーム開発を自動化する根拠」としては使わない。採用するのは、production lesson と failed experiment を分け、agent に渡す入力を text state / diff / replay / log / isolated task へ寄せる判断基準である。次に試すなら、playable diff ごとに bug reproduction packet、design doc diff review、text-state scenario を 1 件ずつ作り、どれが不具合発見や設計修正へ効いたかを staging に残す。

■ URL
https://blog.luden.io/ai-agents-in-game-development-real-production-lessons-failed-experiments-and-workshop-101-7d71e64685fa
