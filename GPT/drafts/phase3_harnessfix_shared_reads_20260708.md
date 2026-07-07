■ 概要
この論文は、LLM agent の失敗を「モデルの推論ミス」として片付けず、モデルを囲む agent harness のどこが失敗を作ったかまで診断し、修復する枠組み HarnessFix を提案している。harness は、実行環境、tool interface、context / memory、lifecycle / orchestration、observability、verification、governance を含む実行基盤である。既存手法は、最終スコアだけを見て prompt や workflow を動かしがちで、失敗 trajectory のどの step に責任証拠があり、どの artifact が不安定さを作ったかを特定できない問題設定である。

中核は、raw execution trace と prompt、tool schema、orchestration code、validator などの artifact を Harness-aware Trace Intermediate Representation (HTIR) に変換すること。HTIR は実行を TraceStep に分け、request / response、role、status、artifact / state effect を持たせる。さらに data-flow link で前の tool 出力や制約が後続 request にどう反映されたかを追い、control-flow link で retry、validate、finalize、terminate などの遷移条件を記録する。そこへ implementation anchor を付け、runtime evidence を artifact に対応させる。

診断では、外部評価の失敗症状から逆向きに evidence backtracking を行い、responsible TraceStep、root cause、implementation anchor、implicated harness layer を出す。複数 trajectory の診断を統合して flaw record にし、layer ごとの repair operator に写像する。修復は自由編集ではなく、許可 artifact、禁止 artifact、満たすべき挙動を持つ repair specification に制約され、最後に validation set で target flaw の改善と regression を確認する。評価は GAIA、SWE-Bench Verified、AppWorld、Terminal-Bench 2.0 Verified で行われ、初期 harness から 6.3-18.4 point の改善が示されている。

■ 内容分析
強い点は、agent の失敗を「反省文」ではなく、runtime evidence と implementation artifact の対応問題として扱っているところにある。TraceStep は model call、tool action、validation、finalization などの実行単位を、外部に観測可能な state effect つきで扱う。単に tool が success を返したかではなく、期待される DB record、file diff、session state change が起きたかを見るため、AppWorld の例のように API call が成功扱いでも実際の副作用がないまま complete_task に進む失敗を表現できる。

data-flow と control-flow を分ける点も効いている。data-flow は、API documentation、tool result、制約、過去観測が後続 prompt や request construction にどう反映されたかを見る。control-flow は、success、timeout、retry limit、completion guard などが次 step をどう選ばせたかを見る。この分離により、「必要な user_email が文書には出ていたのに tool call に入らなかった」失敗と、「state effect がないのに success status だけで finalization した」失敗を別責任として扱える。

implementation anchor があるため、診断結果が「context が悪い」「validator が弱い」という感想で止まらない。prompt template、tool schema、orchestration routine、logging hook、verification script のどれを編集対象にできるかまで下ろす。ここが repair specification に接続されるので、patch は broad な自己改造ではなく、verification-gated finalization や state-delta logging などの修復型に制約される。

評価設計も、成功率比較だけではない。RQ2 では responsible step、cause、anchor、layer、operator の診断精度を見ており、Full HTIR は step accuracy 85.0%、anchor accuracy 81.3%、layer macro-F1 86.2%、operator accuracy 82.5% とされる。RQ3 では trace-grounded diagnosis、scoped repair operator、regression-aware acceptance を外すと性能が落ちる。つまり、失敗ログを保存するだけでは足りず、修復可能な形に正規化し、実装上の編集単位へ結びつける必要がある。

限界は、HTIR の構築、診断、修復、検証に複数の LLM agent を使うため、trace と harness artifact が十分に揃っていない環境では重いこと。implementation anchor の正しさは repository 構造や logging の質に依存する。ゲーム制作では、state effect と verification signal を別途設計しないと同じ形式では回らない。

■ 自分達の環境への適用
自分達の制作サイクルでは、HarnessFix 全体を自動修復として入れるより、failed trajectory を「修復可能な flaw record」に変換する部分を先に取り込むのが現実的である。AI playtest、browser automation、canvas screenshot probe、headless validation が失敗した時に、失敗を観測層、入力層、検証層、制御層に分けて記録する。

具体的には、playtest / probe の失敗ログに四つの欄を追加できる。`failed_step` は、どの操作、スクリーンショット、DOM / canvas probe、tool call、validator が失敗を表したか。`expected_effect` と `observed_effect` は、「ジャンプ入力後に y 座標が変化する」「敵接触で HP が減る」のような状態差分を記録する。`harness_layer` は、input、observation、state probe、validator、orchestration のどれに近いかを付ける。`repair_scope` は、ゲーム本体、test harness、probe script、prompt / instruction、logging のどこを編集候補にするかを分ける。

特に有効なのは finalization guard の発想である。今の自動評価では、ブラウザが開いた、ボタンを押せた、console error がない、という success signal だけで「動いた」と判定しやすい。しかしゲームでは、クリックは成功してもゲームが開始していない、canvas は非 blank でも主要オブジェクトが画面外、といった失敗がある。完了前に expected state effect evidence を要求し、screenshot、pixel check、game state dump、短い replay log を組み合わせる形で始めたい。

■ メリット・デメリット
メリットは、失敗修正の単位が狭くなること。最終 outcome だけを見て prompt 全体や workflow 全体をいじるより、responsible step、harness layer、editable artifact、repair operator を分けるため、再発防止に向く。regression-aware validation が最初から入っている点も、ある場面の操作感を直して別の場面を壊すことが多いゲーム制作に合う。

デメリットは、導入コストが高いこと。HTIR 相当の trace を作るには、tool call、request / response、state diff、screenshot、validator result、artifact reference を最初から取っておく必要がある。また、論文の repair operator は agent harness 向けで、ゲーム本体の設計変更、難易度調整、感覚品質の改善にはそのまま対応しない。診断を LLM に任せすぎると、anchor や layer がもっともらしいが誤った分類になり、修復の視野を狭める危険もある。最初は自動 patch 生成ではなく、失敗記録の構造化に留めるのが安全である。

■ 判定
部分採用。HarnessFix 全体を自動修復システムとして導入する段階ではないが、failed trajectory を TraceStep、data / control flow、harness layer、flaw record、repair scope、regression validation に分ける設計は、自分達の headless 評価と制作サイクルに直接使える。次に入れるなら、playtest 失敗ログの schema を小さく増やし、「success status だけで完了扱いしない」「expected state effect evidence を残す」「修復対象がゲーム本体か評価 harness かを分ける」の三点から始める。

■ URL
https://arxiv.org/abs/2606.06324
