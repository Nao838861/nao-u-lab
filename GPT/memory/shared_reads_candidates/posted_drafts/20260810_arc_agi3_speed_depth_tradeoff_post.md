■ 概要
ARC-AGI-3 は、説明のない新規ゲームを画面観察と離散行動だけで攻略させ、未知ルールの発見能力を測ろうとする対話型ベンチマークである。本論文はまず、その公開 25 ゲームが本当に「探索して理解する能力」を要求しているかを監査した。結果は厳しい。10 ゲームは最初の盲目的な 1 行動、5 ゲームは 1 回の probe 後の ACTION6、1 ゲームは ACTION1 反復、1 ゲームは多様な探索、残る 8 ゲームも 50～200 step の予算で単一行動を反復すれば到達できた。さらに arc_agi v0.9.8 では ACTION6 に null 座標を渡した際の例外を wrapper が WIN と誤分類し、18/25 ゲームを 1 step で迂回できた。これは正規の攻略ではなく library-level vulnerability だが、公開集合のクリア判定だけでは理解と偶然・反復・実装穴を区別できないことを示す。

その上で論文は AERA（Adaptive Epistemic Reasoning Agent）を提案する。EXPLORE で情報利得の高い行動を選び、VERIFY で有力仮説を 1～3 行動かけて反証し、PLAN+EXECUTE で実行へ移る三段階構成である。予想外の観察が出れば EXPLORE へ戻り、直近 10 step の episodic memory と重複 probe 検出を使う。Qwen2.5-0.5B、公開 25 ゲームでは探索 budget 1 と 5 がともに RHAE=0.2116、4/25 solved、random と no-explore は 0 だった。8 独立 run の RHAE は平均 0.164±0.059 で、FT09 は 8/8 で解けたが他の solved game は変動した。結論は「先に世界モデルを作り、反証してから計画する」ことの有用性と同時に、現在の公開集合ではその能力自体を十分識別できない、という二重のものになっている。

■ 内容分析
最も価値があるのは、agent の勝率を評価する前に、環境側の最小攻略戦略を洗い出した順序である。blind action、単一 action 反復、座標付き反復、crash-win を先に列挙すると、solve は少なくとも「到達できた」としか言えず、「ルールを同定した」「目的を理解した」とは言えない。特に null-coordinate bypass は 18 ゲームに共通する wrapper の偽陽性で、ゲーム個別の知能ではなく harness の例外処理を測っていた。反復戦略も不正ではないが、十分な budget があるだけで成功するなら、公開集合は探索方針間の差を弱くしか識別しない。攻略率の前に exploit floor を測る、という benchmark hygiene が本論文の中核である。

AERA の EXPLORE / VERIFY / PLAN 分解も実装可能な粒度がある。EXPLORE は HYPOTHESIS / UNCERTAIN / NEXT_ACTION / REASON を出し、VERIFY は仮説を支持する行動ではなく falsification action を選ぶ。PLAN は CONFIDENCE と FALLBACK を持ち、観察が予測から外れれば再探索する。この構造は、行動列だけでなく「何を知らないか」「何なら仮説を棄却するか」を状態として持つ点が強い。一方、論文中の belief entropy は実装では UNCERTAIN 欄の文字列長で近似されており、校正された確率ではない。探索予算を human median の約 40% とする値も、5 ゲーム・実質 1 environment の小さな ablation から得た heuristic で、一般則ではない。budget 1 と 5 が同点、3 が低い非単調性もあり、「探索は多いほど良い」とは読めない。

比較実験にも重要な confound がある。0.5B の no-explore が 0 なのは、仮説が空だと PLAN が行動を生成しない実装選択の影響を受ける。ReAct は 50 step で 8/25、RHAE=0.388 と AERA より高いが、探索と実行に使える予算が揃っておらず、10/25 で存在しない ACTION8 を出した。FT09 では最初の ACTION6 が偶然 win condition を起動した疑いが残り、1.5B より 0.5B の方が良かった結果も「小型 model の事後分布が平坦」という測定済みの説明ではなく事後仮説である。Speed–Depth の Pareto frontier と RHAE の二次罰則の対応も、一般環境では未証明の convexity assumption に依存する。従って AERA の数値を強い優越性証明として採るのは危険だが、失敗要因を epistemic failure、action token bias、budget allocation、harness bug に分解した点は非常に有用である。

■ 自分達の環境への適用
headless playtest では、最終 score を記録するだけでなく、評価を四層に分ける。第一層は exploit preflight で、全 action の 1 step 実行、同一 action の budget 上限までの反復、無効値・null・境界座標、例外、reset 後の状態漏れを deterministic に走査する。ここで達成できる score を exploit floor として本番 agent の成績から分離する。第二層は epistemic trace で、各 step に「現在の仮説」「未確定点」「次の probe が区別する対立仮説」「期待観察」「実観察」を JSONL に残す。第三層は VERIFY gate で、仮説に確信した直後に支持例を増やすのではなく、最小の反証行動を 1 回要求する。第四層は execution で、予測外の state diff が出た時だけ再探索へ戻す。

小さな検証は、同じ prototype に対して blind-repeat baseline、explore なし planner、EXPLORE→VERIFY→PLAN agent を同一 action budget・同一 seed 群で比較すればよい。指標は solved rate と総 action 数に加え、ユニーク state 到達数、仮説更新回数、反証に成功した probe 数、重複 probe 率、最初の有効仮説までの action、commit 後の巻き戻り cost、無効 action 率を取る。さらに win trigger を少し移動した held-out variant を用意し、公開版で得た action 反復が転移しないことを確認する。これにより「偶然クリアした agent」と「変更後も再同定できる agent」を分けられる。

ゲーム設計側にも効く。プレイヤーに発見してほしい mechanic が、入力総当たりや一方向連打で露出するなら、難易度ではなく情報設計の問題である。逆に probe の結果が複数仮説を区別せず、entropy plateau に陥るなら、agent の弱さだけでなく feedback 不足を疑うべきである。探索効率を human median に正規化する考え方は参考になるが、固定 40% は移植せず、prototype ごとの情報地形を ablation で測る。harness は例外を勝利へ変換せず、invalid / crash / solved を別 terminal state として保存する。

■ メリット・デメリット
メリットは、勝率の前に評価集合の識別力を監査する手順、探索・反証・計画を別 phase にする構造、予測外観察で再探索する制御をそのまま採用できることだ。特に exploit baseline と epistemic trace は model 非依存で、ゲーム prototype の regression test にも使える。成功の再現性を複数 run と solved game の内訳で見る姿勢もよい。

デメリットは、AERA の主要比較が小型 model と公開 25 ゲームに偏り、no-explore baseline、FT09、budget 差に大きな confound があることだ。UNCERTAIN 文字列長は不確実性指標として弱く、Pareto 理論や探索 40% を設計規則に昇格させる根拠も足りない。また公開集合の脆弱性から private 55 ゲームの妥当性までは直接証明できない。採るべきなのは architecture の名称や報告 score ではなく、評価の偽陽性を先に潰す監査方法である。

■ 判定
部分採用。exploit preflight、仮説ログ、反証 gate、同一 budget での baseline 比較を headless 評価の標準候補にする。一方、探索予算 40%、UNCERTAIN 長による entropy、AERA の優越性、公開集合から private 集合への一般化は保留し、prototype ごとの ablation で決める。

■ URL
https://arxiv.org/abs/2605.25931
