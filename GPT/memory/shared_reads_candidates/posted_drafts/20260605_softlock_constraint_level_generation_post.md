■ 概要
「Stuck in the Middle: Generating Levels without (or with) Softlocks」は、レベルが completable であることと、プレイヤーが途中で softlock しないことを分けて扱う論文である。多くの PCG では、start から goal まで少なくとも 1 本の path があるかを確認すれば「クリア可能」とみなす。しかし実際のプレイでは、解法 path から外れた場所へ行けるなら、そこから goal へ戻れない状態が起こりうる。プレイヤーは勝っても負けてもいないが進行不能になる。この状態を softlock と呼ぶ。本論文の問題設定は、この「解は存在するが、到達可能な一部状態からは解へ戻れない」失敗を、生成後のテストではなく生成中の constraint として扱うことにある。

手法は Sturgeon 上の constraint-based reachability categorization である。Sturgeon は tile pattern や設計制約を Boolean variables などの制約充足問題に変換し、SAT solver などで level を生成する。論文はそこに、level 内の各 location を forward reachable、backward reachable、sink に分類する制約を追加する。forward reachable は start から通常の移動で到達できる場所。backward reachable は goal 側から逆向きに辿った時に到達できる場所、つまりその場所から goal へ進める場所。sink はそこに入ると最終的に hazard へ落ちるなど、負けに向かう場所である。

この分類を作るため、ゲームごとの movement を reachability graph として表す。walk、fall、jump、slide などの移動が tile の open / closed 条件に応じて edge になる。制約充足問題では solver 中に動的探索を走らせられないため、探索を fixed depth の layer として展開し、最終 layer で到達性が飽和するように constraint を置く。forward と backward の search に加え、hazard がありうる場合は sink の分類も入れる。sink を明示しないと、「softlock ではないが負ける場所」が生成器から消え、危険地形を含む level の設計幅が狭くなるためである。

softlock を防ぐ制約は単純だが強い。すべての forward reachable な location について、それが sink でないなら backward reachable でなければならない。言い換えると、プレイヤーが start から行ける場所は、goal へ進めるか、負けへ進む場所のどちらかであり、勝敗どちらにも進めない宙ぶらりんな場所を許さない。逆に softlock を意図的に作る場合は、forward reachable であり、sink ではなく、backward reachable でもない node が少なくとも 1 つある、という制約を置く。さらに、softlock から sink に隣接して逃げられるなら真の stuck と言いにくいため、sink と切り離された softlock を作る制約も試している。

実験は 3 種類のゲームで行われる。driller は左右と下に掘り進むが上へ戻れない 10x10 のゲーム。slide は氷上を上下左右に滑り、壁にぶつかるまで止まれない 10x10 のゲーム。mario は Super Mario Bros. 風の platformer で、run / jump / fall を離散近似した 10x29 の level を使う。比較対象は、従来の「start から goal までの path が 1 本ある」path-based completability である。

結果は、表現力と計算コストの両方を示している。softlock なしの level 生成は、従来の path reachability より平均でおおむね 3 から 5 倍遅い。softlock ありは 3 から 8 倍、sink から切り離された softlock は 3 から 15 倍程度遅くなる。具体的には mario では prior path reachability の median が 1.59 秒、without softlocks が 7.36 秒、with softlocks が 14.10 秒、with softlocks and disconnected sinks が 23.86 秒だった。一方で、生成できる level range は多くの場合やや増えた。さらに応用として、impossible level の forward / backward reachable tile 数を制御する driller、内側に sink を多く持つ tricky slide level、pipe 間に挟まって出られない Mario level を 1 tile 変更で repair する例を示している。

■ 内容分析
この論文の核心は、「クリア可能性」を start-goal path の有無から、到達可能状態全体の安全性へ拡張した点である。通常の自動 playability check は、成功 path を 1 本見つけると満足しがちだが、それはプレイヤーが path を外れないという仮定に依存する。実際のゲームでは、探索、失敗、寄り道、操作ミスがある。softlock はその余白で起きる。したがって、この手法は「最短解があるか」ではなく、「プレイヤーが行ける全地点から、勝ちか負けのどちらかへ収束できるか」を問う。

sink の扱いが特に重要である。hazard に落ちる場所を単に悪い場所として排除すると、危険、罠、リスクのある level が作れなくなる。本論文は、sink を softlock と分けることで、「負けるが進行不能ではない」状態を設計空間に残している。これは高難度ゲームや masocore 的設計にも効く。さらに softlock を禁止するだけでなく、意図的に softlock を生成し、sink と切り離した softlock や impossible level まで作っているため、手法が QA 用の検出器に留まらず、generator の失敗モードを能動的に作る診断器にもなっている。

一方で、制約の射程は movement-based softlock に限定される。powerup の消費、鍵と扉、クエスト状態、NPC 会話、所持品、時間制限のような stateful mechanic はこの論文の範囲外である。また fixed depth の reachability layer は実装しやすい反面、探索深度の設定に依存する。計算コストも無視できず、tricky slide の応用では prior path reachability より約 130 倍遅い。つまり本番生成に常時入れる gate というより、level class ごとに適用範囲と深度を決める重めの保証として読むべきである。

■ 自分達の環境への適用
Nao_u_BOT の game prototype では、headless playability gate を「clear path あり」から一段上げる用途に向く。小規模 tile game なら、level JSON から movement graph を作り、forward set、backward set、sink set、softlock set を出す。レポートには clearable、softlock_count、sink_count、softlock_to_sink_connected、repair_candidate_tiles を保存する。生成後に screenshot だけを見るのではなく、黄色が forward、青が backward、紫が softlock のような debug overlay を出せば、人間レビュー前に失敗理由が見える。

記憶システム側では、softlock を単なる bug 名ではなく failure mode atom として残す価値がある。たとえば「クリア可能だが、寄り道で戻れない」「負けられる場所なので softlock ではない」「1 tile repair で戻れる」のように分類して保存する。次に puzzle、platformer、ice slide、digging 系の prototype を作る時、過去の softlock pattern を recall して、最初から backward reachability を検査できる。

■ メリット・デメリット
メリットは、completable と softlock-free を分離し、生成中に保証できること。sink を別扱いするため、危険地形を消さずに詰みだけを制御できる。repair や intentional softlock 生成にも使える。デメリットは、movement graph をゲームごとに定義する必要があり、所持品や quest state の softlock はそのままでは扱えないこと。計算コストも path check より重い。

■ 判定
採用。特に tile / platformer / puzzle prototype の deterministic QA gate として採用する。最初は汎用化せず、次の小規模 level generator に forward/backward/sink/softlock overlay を入れる probe から始める。

■ URL
https://pcgworkshop.com/archive/cooper2025softlocks.pdf
https://www.pcgworkshop.com/database.php
https://doi.org/10.1145/3723498.3723844
