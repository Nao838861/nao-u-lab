■ 概要
Unity による Hologryph への取材記事は、大型オンラインゲームの live ops を「発売後にコンテンツを足す運用」ではなく、追加するほど制作・同期・性能確認が破綻しにくい基盤設計として扱っている。対象の『SAND: Raiders of Sophie』は、プレイヤーが Trampler と呼ばれる巨大な歩行機械を拠点・金庫・武器として組み立て、procedural に生成される砂漠を走る extraction game である。1 機の Trampler だけで数百 entity を持ち、広大な世界の streaming、client/server で一致する地形生成、大量 entity の同期を行いながら、部品・武器・VFX・季節環境を継続的に増やすことが問題設定になっている。

中核は、制作上の変動箇所をデータ化し、システム境界を下層で引き受け、固定シナリオで毎日回帰を見る三層構造にある。Trampler は deck、cabin、support frame、equipment room などの compartment の組合せとして表現される。新しい compartment は model と設定を作れば既存の building system へ入り、新 mechanic が必要な場合だけ programmer が局所的に実装する。ひとつの部品追加が複数の build と組合せられるため、制作コストに対してプレイヤー側の選択空間を大きく増やせる。内部では custom inversion-of-control container と改変版 Entitas ECS を組み合わせ、custom network engine が replication を gameplay code より下で引き受ける。これにより、新 mechanic の試作ごとに通信実装を書く範囲を減らす。

性能面では、procedural terrain の heightmap・biome sampling、Trampler の移動計算、custom occlusion culling を C# Job System と Burst の job chain に載せ、main thread の外で実行する。world streaming の load/unload は Addressables に統一し、長距離移動でも memory 使用量を平坦に保つ設計である。client と authoritative server は別の Unity project だが、asset は独自の転送処理で同一 pipeline から両方へ渡す。「client では動くが server の data が古い」不整合を、テストで発見するのではなく生成経路の一意化で防ぐ。client/server 両方の固定シナリオを自動計測し、Unity Profiler の system 別時間と日次 trend から劣化をすぐ追うのが評価ループである。

同じ発想は制作ツールにも一貫する。武器ごとに VFX Graph を新作せず、muzzle flash や impact に size、color、timing、debris、smoke などを露出した configurable system を用意し、artist は値の調整で個性を作る。tech artist は個別作業ではなく、再利用される表現系自体を豊かにする。その他、GPU Instancer Pro を砂漠の scatter、Amplify Impostors を遠景、Odin Inspector を designer 向け data tooling に利用する。通話も crew radio と 3D proximity voice を併用し、後者は単な会話機能ではなく、砂漠で遭遇した他 crew との交渉・共闘・裏切りを生む gameplay system として使う。近接通話の座標更新は移動時だけ、約 20 Hz に制限し、社会的な効果と実行コストを両立させる。記事の結論は、更新速度を最後の人海戦術で稼ぐのではなく、新要素の大半を設定で挿せる拡張面、不整合が起きにくいデータ経路、性能回帰を日次で見つける計測を一体にすることにある。

■ 内容分析
この事例で重要なのは、「modular にする」という抽象的な助言ではなく、変更頻度と失敗半径で境界を引いていることだ。compartment や VFX の多くは data/configuration で閉じ、未知の mechanic だけを小さな code 差分にする。network replication と asset 配送は共通基盤へ下げ、各 gameplay programmer が毎回同じ失敗を再実装しない。そして performance test は不安定化した後の調査ではなく、毎日の trend にして「いつ悪くなったか」を狭める。個別の工夫より、三つの境界が連鎖している点が核である。

但し、これは査読論文ではなく、Unity の製品・生態系を扱うベンダー側の取材記事である。定量評価として公開されているのは proximity voice の約 20 Hz 程度で、フレーム時間、memory 使用量、同時接続数、部品あたりの制作時間、更新間隔、回帰検出率は示されていない。「密度を増やしても frame cost を増やさない」「memory は移動距離に依らず平坦」「client/server 不整合は構造的に起き得ない」は重要な設計意図だが、第三者が追試できる結果ではない。

また、client と server を別 Unity project にする選択は、runtime と build の責務を明確にする一方、システム自体を複雑化する。同一 pipeline は asset/data の同一性を強くできても、code version、serialization schema、build flag、platform 固有差まで自動的に消すわけではない。「構造的に不可能」という表現は、転送対象と version contract が完全に定義されている範囲に限って読むべきである。

■ 自分達の環境への適用
移植すべきのは特定の Unity package より、「追加コンテンツの接続面と、性能回帰の観測面をセットで作る」原則である。継続更新する game prototype では、enemy、weapon、stage chunk、VFX preset を、ID、config、asset reference、必要な局所 hook で定義する。新要素の追加が「必ず核心ループを書き換える」状態なら、live ops に向いた境界になっていない。反対に、新 mechanic まで無理に config 化しない。既存プロトコルで表現できる変種と、ルール自体の変更を分ける。

headless 評価では、各コンテンツ単体の pass/fail だけでなく、固定 seed、固定 input replay、固定時間のシナリオを daily で走らせる。記録項目は frame/update time の p50/p95/p99、peak memory、spawn/despawn 後の残留 entity、streaming 前後の asset 数、client/server の world hash、テスト対象 build hash とする。単発の閾値超過に加え、7 日移動中央値からの悪化率を見れば、新 content の累積で少しずつ劣化するケースを拾える。visual の品質はこの数値で代替せず、代表 preset の screenshot diff と人手確認を別 gate にする。

小さな probe は、既存 prototype へ三種類の variant を追加する差分計測でよい。A は既存データだけで追加、B は小さな mechanic hook を追加、C は従来型の直接分岐で追加する。変更 file 数、必要な手作業、headless test の更新数、不具合の波及範囲、実行コストを比較する。採用 gate は、A/B で変更範囲が局所化し、固定 replay の determinism を壊さず、基盤コードの理解コストを追加効果が上回ることとする。

■ メリット・デメリット
メリットは、content 追加の差分と失敗半径を小さくし、programmer、designer、artist が同じ基盤上で並行作業できることだ。共通 pipeline は、確認項目を増やすよりも前に、不整合の発生経路を減らす。固定 scenario の日次 trend は、間欠的な最適化会議を、原因 commit が追える小さな修正に変えられる。また、設定で生まれる組合せがプレイヤーの選択や偶発的体験につながるなら、運用効率と game design の豊かさが同じ投資から生まれる。

デメリットは、この構造を作る初期コストと、共通化した基盤が新しい失敗の一点集中になることだ。設定項目を増やし過ぎれば不正な組合せも増え、data-driven は複雑性を消すのではなく code から schema・validation・tooling へ移すだけになる。独自 ECS、network engine、asset transfer、複数 project は強力だが、少人数・短命の prototype にそのまま持ち込むと、作るゲームより基盤の維持が主作業になる。さらに、ベンダー取材で成功側だけが見え、破棄した設計、移行コスト、事故数、実際の cadence 改善量が分からないため、記事を実証値の根拠には使えない。

■ 判定
部分採用。compartment や特定 package を模倣するのではなく、頻繁に増える要素は data/config に寄せ、複数 runtime の入力を同一 pipeline から生成し、固定 seed/replay の日次 trend で性能回帰を見る、という三点を採る。どの構造も小さな prototype で変更差分と回帰検出を測ってから広げる。独自 network/ECS や二重 project 構成は規模と運用寿命が合わない限り採用せず、公開されていない定量成果は自分達の probe で補う。

■ URL
https://unity.com/blog/hologryph-sand-raiders-of-sophie
