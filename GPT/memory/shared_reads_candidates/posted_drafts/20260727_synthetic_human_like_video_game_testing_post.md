■ 概要
この論文は、ゲームをクリアする agent と、ゲームを壊す tester agent は別物だ、という切り分けから自動テストを設計している。通常の攻略 agent は報酬を最短・高得点で取るほど優秀だが、テスターは壁へ何度もぶつかる、鍵を攻撃する、想定外の順序で object を触るなど、進行に寄与しない操作も意図的に試す。そこで著者らは、RL と MCTS の探索能力を使いつつ、目的を defect finding に置き換えた synthetic agent と human-like agent の二系統を提案した。

中核となる第一の仕組みは interaction state である。ゲームの通常 state だけでは、通れない壁へ接触しても座標が変わらず、「未検査」と「既に四方向から試した」を区別できない。しかも接触に正報酬を与えると、agent が同じ壁を無限に叩く可能性がある。論文は game state に、sprite の組、位置、方向、Move/Use、avatar state、反復回数を記録する補助 state を加える。実装は移動・Use・その他を四方向ずつ持つ 12 層 grid である。

synthetic agent は、デザイナーが与えた game scenario graph から graph coverage を満たす正規経路を作り、各 edge を「鍵を取る」「扉へ入る」のような feature 列へ変換する。さらに sprite 組、操作種別、avatar state の組合せから、正規経路にない modification を一つずつ挿す。「鍵を攻撃したら」「壁を通ろうとしたら」という禁止・未定義遷移の probe である。複数 modification を一列に詰めず、一コピーにつき一つだけ挿すのは、先に発生した crash が後続 bug を隠す masking を避け、失敗箇所を特定しやすくするためである。

human-like agent は、15 人のテスターから集めた 427 trajectory をそのまま replay せず、MGP-IRL で別 level に移せる test goal へ変換する。ad hoc testing の一軌跡には「壁を調べる」「鍵を試す」「先へ進む」など複数の方策が混ざり、通常の IRL が置く単一の near-optimal policy 仮定に合わない。MGP-IRL は interaction の対象や操作種別が変わる点で軌跡を分け、隣接 segment を併合した時の尤度低下が閾値を越えるまでまとめ、反復回数・方向選好・reward weight・対象 sprite の何％を試したかを goal として抽出する。位置そのものではなく interaction feature と割合を使うため、他 level へ retarget できる。

評価は GVG-AI 上の 3 game、各 4 level、合計 45 個の fault-seeded bug で行われた。bug は interaction 記述の削除、sprite 名や順序の変更、誤った interaction の追加で作られ、model-based oracle が scenario graph と追加 constraint を毎 loop で照合する。人間は Game A/C の bug を 90％、Game B を 100％検出し、単純な A では human-like Sarsa と synthetic Sarsa が 100％に達した。全 game で正規経路だけの baseline より modification 付き synthetic agent が上回り、平均では Sarsa が MCTS より 5〜10ポイント良かった。一方、MCTS の確率的探索が人間の見逃した fake wall を拾う例もあった。MGP-IRL は軌跡を細かく分割する尤度閾値 0.0 が、人間との cross-entropy と bug finding の両方で最良だった。

■ 内容分析
この研究の最も使える発見は、探索 algorithm の新規性より、「テスト済み」を game state から分離したことにある。通常 state coverage だけでは、無効入力、衝突、拒否された Use のような no-op が消える。しかし defect finding では、その no-op 群こそ調べた証拠であり、同じ画面でも interaction history が違えばテスト状態は違う。interaction state は coverage を画面遷移数ではなく、対象×操作×方向×avatar 条件へ広げる。これは random input を大量投入する monkey test と異なり、何を試し、何が未検査かを説明できる。

synthetic と human-like は優劣ではなく、異なる blind spot を持つ。synthetic は design graph から正規経路を漏れなく辿り、禁止遷移を機械的に挿せるが、graph と constraint に書かれていない期待は検出できない。human-like は設計者が列挙しなかったテスターの癖を吸収できるが、収集した人の偏りも複製する。実験でも複数人の結果を束ねると二つの game で synthetic を越え、distinct testers の価値が出た。一方、ある壊れた壁を見つけた人が物を運び続けた軌跡を、MGP-IRL は「任意の壁で試す」へ過剰一般化した。自由度の高い puzzle の複数解も linear feature では十分に表せなかった。

評価結果にも注意が要る。対象は小さな grid game だけで、bug は既知の 45 fault、oracle はデザイナー提供の graph と constraint に依存する。visual glitch、面白さ、難易度曲線は対象外で、Sarsa の探索には数分から 6 時間かかった。強い汎用性の証明ではなく、構造化された小型ゲームで tester objective が bug 発見を増やす controlled experiment と読むべきである。

■ 自分達の環境への適用
自分達の小型 prototype には、IRL 全体より先に interaction ledger を入れる価値がある。headless run ごとに `state_id` だけでなく、`target_type / action_type / direction_or_zone / player_mode / repeat_count / outcome` を記録する。outcome は state_changed、rejected、blocked、damage、resource_changed、terminal などに分ける。すると「クリア率 100％」の裏で、画面端への接触、死亡直前の pickup、pause 中入力、同一 object への連打が未検査だと判別できる。

次に正常系 smoke bot と破壊系 probe を分離する。正常系は主要 route と victory condition を毎 commit で短く確認する。破壊系は、その route の各節に一つだけ mutation を挿し、逆順取得、無効対象への Use、境界への継続入力、同時入力、直前キャンセルを試す。一 run 一 mutation にすれば、失敗 trace の原因が混ざらず、再現手順も短い。scenario graph を新設する必要はなく、既存の state transition table や milestone list を正規経路の骨格にできる。

human-like 側は、まず手作業 playtest の trace を「再生資産」ではなく「probe grammar の発見源」にする。人が同じ壁を複数方向から調べた、危険物を所持状態別に触った、失敗後に別順序を試した、といった interaction segment を抽出し、別 map や次版で parameterized probe として再実行する。採用判定は bug 数だけでなく、interaction coverage の増分、既知 bug の再現率、新規 failure signature、実行時間で行う。面白さ判定とは別 lane に保ち、QA が通ったことを面白さの証拠にしない。

■ メリット・デメリット
メリットは、no-op を捨てず検査履歴にできること、正常経路と想定外操作を説明可能な形で組み合わせられること、人間テスターの癖を固定 replay ではなく別 level 用 goal に変換できることにある。特に一 run 一 mutation は deterministic な差分検証と相性がよく、失敗を短い repro trace に落としやすい。

デメリットは、oracle と feature 設計の負担が消えないこと。記録軸が粗ければ異なる不具合を同じ interaction に畳み、細かすぎれば state explosion を起こす。論文の 12 層 grid は小型 2D には軽いが、連続座標・physics・3D へそのまま拡張できない。人間軌跡も量と多様性が不足すると偏りを自動化するだけで、bug 発見後の執拗な exploit を一般行動と誤学習する。さらに model-based oracle が知らない視覚的不具合や設計上の退屈さは検出不能である。

■ 判定
部分採用。interaction ledger、正常 route への一 mutation 挿入、正常系と破壊系の別集計を先に導入する。MGP-IRL は trajectory が十分に蓄積するまで保留し、当面は人間 trace から parameterized probe を手動抽出する。評価対象は functional defect と coverage に限定し、面白さの自己判定は既存の別工程で維持する。

■ URL
https://arxiv.org/abs/1906.00317
