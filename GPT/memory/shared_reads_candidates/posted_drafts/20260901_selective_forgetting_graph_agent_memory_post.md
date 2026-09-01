■ 概要
「Selective Forgetting」は、長期稼働する LLM agent の会話記憶を knowledge graph にすれば、flat な vector retrieval より想起が良くなるという前提を、忘却機構と分けて検証した論文である。各 conversation turn を GPT-4o-mini で抽出し、Person / Event / Preference / Goal / Skill など9種類の node と属性付き edge に変換する。質問時は参照 entity を抽出して埋め込み、cosine similarity 0.75 以上の上位5 node を root とし、2-hop・最大15 node の subgraph を回答 context にする。追加時には同じ label と正規化 title、または embedding similarity 0.92 超で重複を統合する。

忘却側は、各 node を recency 0.35、access frequency 0.25、degree centrality 0.20、作成からの turn age 0.20 の重みで採点する。recency の半減期は90日、turn age は1000 turn、400 turn ごとに score 0.10 未満を incident edge ごと削る設計である。つまり「古いから消す」だけでなく、最近参照されたか、繰り返し使われたか、関係網の中心か、作成後どれだけ会話が進んだかを合成して retention を決める。

評価は LongMemEval の500問で行う。約33か月にまたがる会話履歴から、user/assistant の単一 session、preference、knowledge update、multi-session、temporal reasoning の6種を問う。実験1では各問題ごとに新しい graph を作り、同じ回答 model、同じ top-5 retrieval root の flat vector baseline と比較した。結果は graph の token F1 が0.417、baseline が0.468、paired bootstrap の差が -0.050、95% CI [-0.085, -0.016] で、graph は有意に下回った。LLM judge も0.454対0.536である。最大の失敗は過去の assistant 発言を特定して思い出す問題で、judge correctness が0.911から0.607へ落ちた。原 turn を entity と relation に分解した時、推薦の言い回しや「どれを強調したか」という surface form を失ったためと分析されている。一方、temporal reasoning の judge だけは0.293対0.278と小さく上回り、時系列・参加 entity・関係を明示する利点も限定的に見えた。

実験2では全500問の履歴を単一の persistent graph に混ぜ、27,021 node・46,538 edge・440.6MB の状態から忘却を一度だけ適用した。2,653 node（9.8%）、2,560 edge（5.5%）、42.0MB（9.5%）を削り、token F1 は0.292から0.293へほぼ不変、judge は0.300から0.284へ1.6 point 低下した。F1 差の95% CI は [-0.015, +0.016]、judge 差は [-0.038, +0.006] で、著者らは4指標の有意差を検出していない。結論は、graph 構造だけでは長期記憶は改善せず、抽出・更新・保持を一体で設計し、逐語的 context が必要な情報への経路を残すべき、というものだ。

■ 内容分析
この論文の価値は graph memory の勝利ではなく、「表現形式」と「保持方針」を別々に測った点にある。graph 対 flat の比較では candidate-generation budget を top-5 root に揃えているため、graph 側だけ大量の候補を読む不公平を避けている。その上で負けたので、少なくともこの pipeline では構造化の情報損失が multi-hop の利益を上回る。特に assistant-turn recall の大差は、要約や entity 化を原文の代替にすると、事実の有無だけでなく、選択・順序・留保・強調まで消えることを示す。knowledge update でも F1 が0.456対0.511で、confidence がない時に古い属性値を残す conflict policy が失敗源になった。構造を持つことと、更新規則が正しいことは別問題である。

forgetting の結果も慎重に読む必要がある。9.5%の容量削減で token F1 を維持したのは有用だが、persistent graph 自体の絶対性能は F1 0.292、judge 0.300と低い。500個の独立した haystack を一つに混ぜた cross-conversation interference が強く、弱い記憶基盤の周辺部を削っても指標が動きにくかった可能性がある。また設計上は400 turn ごとの pruning だが、実験は全履歴投入後の一回適用である。反復削除による cascade、削った node が後で再び必要になる delayed utility、中心 node が誤情報だった場合、低 degree でも致命的な制約や安全情報だった場合は測っていない。重み・半減期・threshold も単一設定で、ablation や他 extractor との比較はない。従って「この score が最適」ではなく、「明示的な retention policy を同一条件で測れる形にした」ことを採るべきである。

■ 自分達の環境への適用
長期自動プレイテストでは、raw episode を graph に置換せず、二層に分ける。第1層は seed、build hash、入力列、event stream、画面・ログ、agent の判断原文を immutable に保存する evidence 層。第2層は「敵」「部屋」「失敗条件」「既知の bad policy」「修正 build」の node/edge と、参照回数・最終利用時刻を持つ派生 index 層である。graph は横断検索と時系列接続に使い、厳密な再現や過去判断の確認では必ず raw へ戻る。削除対象も最初は第2層だけに限定し、raw と candidate provenance は消さない。

最小 probe は、同一ゲーム build の自動プレイ300 episode 程度を蓄積し、(1)過去の特定判断・入力列の正確な再現、(2)patch 後の最新値、(3)複数 episode にまたがる失敗因果、(4)時系列、の固定 query set を作る。raw chunk retrieval、graph retrieval、hybrid の3条件を同じ root 数と context token budget で比較する。指標は answer correctness だけでなく、根拠 episode の recall、誤った旧仕様の混入率、raw evidence まで辿れる率を分ける。その後に pruning を掛け、容量・検索時間に加えて、既知の bad policy を再び選ぶ regression rate を測る。削減率だけで合格にせず、「二度と繰り返したくない失敗」を保持できたかを veto 指標にする。初回は hard delete ではなく archive flag と30日復元窓にし、削除候補の score 内訳を receipt として残す。

現在の記憶運用にも同じ境界を使える。per-atom Markdown と index は evidence と派生 view を既に分けやすい。access frequency や centrality は整理候補の優先順位には使えるが、directive、ユーザー指示、Slack permalink、実装失敗の再現条件を自動削除してはいけない。内容価値とは別に provenance、authority、再現不能性を保護条件へ加え、forgetting は「正本の消去」ではなく「通常 recall からの降格」として先に試すのが安全である。

■ メリット・デメリット
メリットは、graph 化と忘却を同じ成功物語にせず、前者の明確な負けと後者の限定的な容量効果を報告したこと、retrieval budget を揃え、paired bootstrap と質問種別別の失敗を示したことにある。recency・frequency・centrality・age の4要素も、保持判断を監査可能な score にする出発点として使える。temporal reasoning と逐語 recall の差は、どの情報を構造化し、どれを原文保持するかの実装境界になる。

デメリットは、単一の GPT-4o-mini extractor、LongMemEval 一つ、固定 ontology と閾値だけの評価で、graph memory 一般へ外挿できないこと。persistent 条件は異なる利用者の履歴を混ぜた合成環境で絶対精度が低く、実運用の episode 連続性とは違う。削減も約10%に留まり、反復 pruning、復元、誤削除コスト、privacy deletion、最新仕様への追従は未評価である。degree centrality は「よく接続された誤り」を保護し、低頻度の致命的失敗を捨てる危険もある。

■ 判定
部分採用。graph を正本にする設計と論文の固定 weight は採らない。raw evidence を保持した hybrid retrieval、同一検索予算での質問種別別評価、派生 index だけを可逆に忘却する probe を採る。導入条件は、flat baseline を下回らず、bad-policy regression を増やさず、削除判断を provenance 付きで復元できることとする。

■ URL
https://arxiv.org/abs/2608.28978
https://github.com/skhanzad/Selective-Amnesia
