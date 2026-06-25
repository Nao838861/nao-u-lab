■ 概要
Mind-Studio は、部分観測ゲームのプレイ軌跡から、単に次状態を当てる予測器ではなく、単独で実行できる pygame 風の world model プログラムを合成する研究である。対象は Atari 系の Montezuma's Revenge、Alien、Assault、Skiing。入力は state-action-next-state の trajectory で、観測を OC-Atari の object-centric state に変換し、プレイヤー、敵、アイテム、位置、サイズ、状態フラグなどのスロットとして扱う。問題設定は、既存の symbolic / LLM world model が観測された遷移を局所的に再現できても、移動、接触、死亡、spawn、pickup、境界条件、更新順序が絡むと、別状態から実行した時に同じ機構として動く保証が弱い、という点にある。

手法の中核は三段階。第一に、全 trajectory をそのまま LLM に渡さず、entropy-based selection で「ルールが露出しやすい行」を選ぶ。普通の移動だけでなく、object attribute の出現・消滅、接触関係の変化、イベント、rare interaction を重く見る。Montezuma では rope や conveyer belt のように、触れた時だけ移動物理が変わるケースも coverage に入れる。第二に、選ばれた遷移を、永続オブジェクトの static interface と、各 step で変化した state increment に圧縮する。第三に、game skill file を添えて LLM に transition program を生成させる。skill file には object type、legal action、domain convention、static scene layout が入り、RAM 由来 state がない場合も screenshot から pixel-level scene extraction で静的レイアウトを補える、という設計になっている。

出力物は説明文ではなく executable Python program である。状態遷移フックと rendering hook を持ち、現在状態から各 action を一定フレーム hold した endpoint を出せる。評価もこの性質に合わせている。Mind-Studio は生成された world model を held-out replay tuple で選別した後、LLM-as-Planner harness に接続する。planner は現在の symbolic state、実環境で検証済みの subgoal prefix、各 action の world-model preview table を受け取り、次の action または短い action chunk を選ぶ。subgoal の達成判定は world model の予測ではなく Real-ALE の真の状態でだけ進み、terminal reset や停滞時には最後の checkpoint へ rollback する。

評価指標は二層で、NSP は world model と Real-ALE を同じ snapshot から同じ action で K frame rollout した時に、プレイヤー座標が一致するかを見る。SR は Montezuma では 8 個の ordered subgoal のどこまで進んだか、他ゲームでは kills や gates などの achievement count を見る。抽象要旨では、Montezuma's Revenge の chosen-action NSP が PoE-World の 0.3% から Mind-Studio の 48.7% へ上がり、8 subgoal 中 5 個を検証したと報告されている。Alien、Assault、Skiing でも、free-form language の想像や局所 rule mixture より、branch-level fidelity の強い lookahead source になる、という結論である。

■ 内容分析
この論文の面白さは、world model を「ゲーム画面をそれっぽく未来生成するもの」ではなく、「branch preview に使える検査可能な小型 simulator」として扱っている点にある。動画生成型 world model では、見た目の連続性は評価しやすいが、敵との接触優先順位、鍵を取った後の door flag、境界での押し戻し、spawn/death の順序など、ゲームとして重要な制御構造が曖昧になりやすい。Mind-Studio はそこを object slot と control flow に寄せ、LLM の役割を「自由に未来を語る」から「実行できる transition code を書く」へ狭めている。

もう一つ重要なのは、評価が単なる offline prediction で終わっていないこと。次状態一致率だけなら、目立つ物体や固定 patrol を覚えればある程度上がる可能性がある。論文は planner に per-action preview を見せ、選んだ action を実環境で実行し、実 subgoal だけを正とする harness に置く。これにより、world model が「当たっているように見える」だけでなく、意思決定に使えるかを測れる。特に chosen-action NSP と branch NSP を分けているのは実用上よい。全 branch が粗くても、planner が選ぶ branch だけ当たるなら進行に効くし、逆に平均 NSP が高くても重要 action が外れるならゲーム攻略には弱い。

弱さも明確で、対象は object-centric state が取れる Atari 環境に強く依存している。OC-Atari parser、固定 sprite、比較的低次元の座標、既知の action set があるから transition program に落とせる。現代的な物理、曖昧な narrative state、広い連続空間、プレイヤーが作ったオブジェクトを含むゲームでは、skill file と extractor の設計が主戦場になる。また、LLM synthesizer が作るコードは検査可能だが、完全自動で正しい rule extraction が保証されるわけではない。だから本論文は「ゲーム全体を自動理解する方法」ではなく、「ログから検査可能な小型モデルを作り、lookahead と評価に使う型」と読むのがよい。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、いきなり汎用 world model を作るより、playable diff ごとに小さな executable preview を持つ方向が合う。たとえば敵、弾、接触、pickup、door、checkpoint のような少数要素だけを JSON state と deterministic transition function に落とし、実ゲーム replay から 10-30 個の rule-bearing frame を抜く。Phase 3b/4a では、その transition function が「同じ seed の replay を再現できるか」「別 branch の preview として破綻しないか」を見る。

ブラウザゲームや Godot prototype なら、Playwright / headless run のログを、単なる動画やスクショではなく state-action-next-state の行として残す。全部をモデル化せず、まずはプレイヤー xy、主要 hazard、contact flag、取得済み item、死亡/勝利 flag だけでよい。Mind-Studio の entropy selection は、そのまま「退屈な移動ログではなく、接触、spawn、状態変化、rare event を優先して記憶に残す」ルールとして使える。shared-reads からの戻し先としては、次の playable diff review に「branch preview が作れる最小 state は何か」という確認項目を足すのが現実的である。

■ メリット・デメリット
メリットは、ゲームの挙動を自然言語の感想ではなく、実行可能な検査対象へ落とせること。branch preview、rollback、subgoal predicate と組み合わせると、AI playtest の失敗を「操作が悪い」「preview が外れた」「predicate が粗い」に分解しやすい。ログの保存価値も上がる。

デメリットは、extractor と skill file の手入れが必要なこと。見た目や物語の多いゲームでは、何を state slot にするかを間違えると、本当に面白さを左右する変数を落とす。LLM 合成コードの検証も必須で、生成した simulator を信じて採点すると逆に評価が濁る。

■ 判定
部分採用。研究全体を再現するのではなく、replay から rule-bearing transition を選び、小さな executable transition model と branch preview で prototype を検査する考え方を採用する。特に Phase 3b/4a の playable diff probe に向く。

■ URL
https://arxiv.org/abs/2606.16070
https://arxiv.org/html/2606.16070
