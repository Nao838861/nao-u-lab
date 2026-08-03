■ 概要
AWS for Games Blog が紹介するのは、Unity 製のターン制モバイル戦略ゲームの実行中 build に接続し、自然言語の test case を人手なしで進め、pass / fail と理由を返す QA agent である。入力 replay が UI や mechanic の変更ですぐ壊れ、reinforcement learning は reward 設計・訓練・再訓練を要する問題に対し、実機 build を計測可能にして、ゲーム固有知識、観測、汎用操作、停止判定を分離し、LLM に live state に応じた次の行動を選ばせる。

観測には AltTester を使う。instrumented APK を物理 Android device で動かし、GameObject hierarchy、component、property を WebSocket 越しに問い合わせる。各 action 前後で全 object を snapshot し、health、ability charge、valid tile の highlight などの差分を計算する。scene の1400超の object から骨、terrain、engine 内部物を rule-based filter で落とし、unit、button、health display など約42 object に絞って Amazon Nova で要約する。

ゲーム固有知識は code に埋め込まず、game guide、scene hierarchy export、interactive entity の stats や abilities を集める discovery module から markdown を作り、Bedrock Knowledge Base に置く。Claude は test case、検索知識、state summary、過去の結果を見て、`tap`、`read_text`、`find_object`、`query_knowledge_base`、`verify` など13個の parameterized tool から操作を選ぶ。tool は固有 unit 名を知らず、引数を knowledge context から得る。highlight tile の距離順 sort などは deterministic tool に寄せる。

loop は perceive / reason / act / reflect。直近10 action を Python で調べ、同じ tool call か状態変化なしが3回続いた時だけ戦略変更を求め、stuck 3回で auto-fail する。評価は11 scenarios、150超の tool calls。5-step の stat 確認から50-step の複数 turn 戦闘まで全 test を完走し、意図的な damage bug を検出、達成不能 objective は打ち切った。結論は controlled environment では有効だが、大規模 title には tool、prompt、perception strategy の追加が必要という限定付きだ。

■ 内容分析
価値が高いのは、曖昧さをどの境界に閉じ込めたかである。全情報を model に投げず、noise 除去は rule、距離計算は通常 code、停止兆候は action history の deterministic check に任せ、LLM は test intent と現在状態を結ぶ tool 選択に集中する。失敗時は perception、retrieval、execution、reasoning、termination のどこが原因かを trace から切り分けられる。固有知識と操作 API の分離も、content 追加を knowledge 更新で吸収しやすい。

ただし対象は valid tile や property を取得できる instrumented Unity build で、turn-based かつ controlled な環境である。連続時間の action、physics の手触り、視覚演出、音、楽しさは測れない。約42 object への filter が重要 object を落とせば推論以前に失敗し、discovery による entity 網羅も hidden state、時限出現、複雑な unlock、procedural content では崩れる。

評価も限定的だ。damage bug と impossible objective の2例は具体的だが、script、人間、vision-only agent との比較、scenario 別の再試行回数、false positive / negative、反復時の分散はない。「全 test 完了」は正しさ100%ではない。費用は model 利用が平均約0.20ドル/test、infrastructure 込みで50 tests の nightly suite が月約760ドル、200 tests が約1665ドル。ただし「200 tests で約8ドル/test」は月額を suite 内 test 数で割った表現と読め、比較時は execution 回数、device、license、固定費を分け直す必要がある。

■ 自分達の環境への適用
自分達には AWS 構成を移植せず、prototype ごとの小さな semantic test harness として採る。playable build から `scene_id`、position、HP、resource、objective、近傍 interactable、直前 action の成否だけを JSON snapshot で返す。操作は `move`、`interact`、`use`、`restart`、`verify` 程度に限定し、before / after diff、乱数 seed、frame/turn、elapsed time、戻り値を残して headless failure を再現可能にする。

まず「目的物を取得して出口へ到達」「無敵時間後の次の攻撃で HP が減る」「存在しない経路を一定手数で断念」の3 test に絞り、成功・停止条件を machine-readable にする。同一 seed で各10回走らせ、成功率、action 数、no-change 率、状態取得漏れ、誤った pass / fail を測る。script baseline と比較し、layout の小変更後も semantic tool agent が維持できるかを見る。

特に移すべきは停止判定の所有権である。同一 call、no-change、総 action budget、timeout、同一 snapshot hash の循環を harness 側で判定する。失敗時は test case を自動改変せず trace を証拠として残す。制作サイクルでは playable diff 後に意味回帰 test を回し、人間は操作感や楽しさへ集中する。記憶には推論全文でなく、test 定義、seed、観測 schema、失敗分類、再現 trace、修正 commit を残す。

■ メリット・デメリット
メリットは、pixel 座標 replay より UI 配置変更に強く、health や charge のような内部値を正面から検証できること、game knowledge と action tool の分離で追加 content への変更範囲を限定できること、before / after diff と停止理由を残して「なぜ失敗したか」を追えることにある。deterministic filter・距離計算・stuck 検出と LLM reasoning の役割分担も、費用と暴走を抑える設計として使える。

デメリットは、最初に instrumentation、意味のある object naming、観測 schema、tool、正解 predicate を整える費用が必要なこと。内部状態へ深く接続するほど本番 player の経路とは離れ、表示だけ壊れた bug や feel の劣化を見逃す。記事の評価は小規模で比較対照がなく、AWS service、物理 device、AltTester Pro、model pricing を含む構成は自分達の prototype には過剰である。LLM の判断を pass oracle にするともっともらしい誤判定が記憶へ混入するため、重要な assertion は deterministic predicate または人間確認を正本にする必要がある。

■ 判定
部分採用。採るのは AWS 製品一式ではなく、実行中 build の意味状態 snapshot、game-agnostic な少数 tool、action 前後差分、deterministic stuck / budget 判定、再現可能な trace という境界設計である。まず3 test・同一 seed 10反復・script baseline との比較で、layout 変更耐性と誤判定率を測る。視覚品質やゲームの面白さまで自動判定できるとは扱わず、人間 playtest を置き換えない回帰検査層として導入する。

■ URL
https://aws.amazon.com/blogs/gametech/building-an-ai-game-testing-agent-with-amazon-bedrock/
