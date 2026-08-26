■ 概要
GameXpert-Bench は、coding agent のゲーム制作能力を「最初のゲームを生成できたか」だけで測ると、実際の制作で重要な修復と継続改善を取り落とす、という問題から出発する。著者らは人間と agent の実制作 trajectory を分析し、成果物が変化する局面を、空の workspace から初稿を作る GameGen、不具合を診断・修復する GameFix、人間の要求を累積的に反映する GameOpt の三つに分けた。三 track は固定 pipeline ではなく、改善が新しい不具合を生み、修復が再改善を要求する実制作上の反復を、比較可能な別課題として切り出したものだ。

GameGen は 11 genre・97 task（2D 53、3D 44）で、template、既存 asset、指定 engine のない状態から browser-native game を一度の依頼で作らせる。全 model の生成物から gameplay event を統合し、人手で core / bonus event の共通 rubric を作る。Completeness と Richness は code inspection と live interaction を併用し、実行時に効果が確認できた項目だけを加点する。Visual Quality と Player Experience は人間が評価する。15 model・1455 run・43081 event の結果では首位も Completeness 94.4 に対し Richness 72.0。「遊べる核」は作れても厚みが追いつかない。2D から 3D で平均 Overall は 65.9 から 60.1 へ下がり、主因は見た目より Completeness の 8.8 point 低下だった。

GameFix は、人間が二重確認した非公開 50 level に、7 領域・61 subcategory の可逆 mutation で各 19～27 bug を同時注入する。全 bug を列挙する Explicit Issue と、一部症状だけ示す Self-Discovery を設け、headless Chromium、固定 clock、synthetic input、state snapshot で検査する。Fail-to-Pass と、既存挙動を守る Pass-to-Pass の双方を通った bug だけを修復済みとする。90～100% 修復域を見る Strict は最上位でも 39.0。未提示 bug の発見、挙動検証、値の復元、複数 bug の計画、回帰制御、停止条件が差を作った。

GameOpt は playable な途中 snapshot から gameplay、level、balance、art、UI、audio の六要求を順に与え、agent 自身の成果物へ累積する。17 game・102 turn を、392 requirement、212 challenge、97 regression、計 701 criteria で最終成果物から判定する。reachable code、runtime log、screenshot、audio trace は証拠になるが、dead code、comment、自己説明はならない。15 model の Overall は 93.96 から 35.89 まで分離したが、turn と設計次元が交絡するため長文脈保持の証明にはならない。結論は、もっともらしい実装と、豊かで実行確認済みかつ回帰のないゲームは別物だ、という点にある。

■ 内容分析
この論文の強さは、制作上の失敗を「生成」「探索を伴う修復」「累積改善」の責任境界へ分解したことにある。GameFix では全 bug 明示時の 17 model 差が約 13 point なのに、自己発見条件では約 38 point へ広がる。未記載 bug を意図的仕様と解釈したり、「最小変更」の範囲外として直さなかったりする例もある。失敗は発見不能だけでなく、「見つけたが権限外と判断した」という authorization 解釈でも生じる。探索範囲、変更権限、保存すべき invariant、終了条件を別々に設計しなければ、過剰修正と見逃しの間を揺れる。

GameGen の 43081 event 中、code 上は implemented なのに runtime で Fail / Partial だったものが 2293 件、5.32% ある。内訳は load / crash 56.0%、誤った state transition 16.0%、feedback 不明瞭 13.1%、visual response 欠落 11.9%。GameOpt でも CSS の closing tag 一個の欠落で body が描画されず、全機能が到達不能になった。game code の品質は機能数の和ではなく、起動、入力、状態遷移、feedback、終了までの reachable path の積で決まり、一点の統合欠陥が複数の局所成功を無効化する。

ただし benchmark 自体にも注意が要る。GameGen の Shared Rubric は比較対象 model の生成 event を集めて作るため、将来の model が全く新しい遊びを出した時の richness が現 cohort に依存しうる。GameFix は非公開 50 level なので contamination を抑えられる反面、第三者が同一 corpus で再現・監査できない。19～27 bug 同時注入は長期計画を強調する人工的 stress test であり、通常の defect 密度とは違う。GameOpt は JavaScript 17 game、各六 turn に限られ、synthetic request も混ざる。さらに audio が常に第六 turn など順序と内容が交絡し、著者自身も retention の因果証拠ではないと認める。Game feel や visual coherence の 33 項目は proxy に過ぎず、証拠があることと面白さが上がったことも同一ではない。

■ 自分達の環境への適用
最も使えるのは、三 track を自分達の制作 cycle の検査面へ写すことだ。新規 prototype では build 成功でなく「起動→入力→core loop→勝敗または一区切り」まで到達する playable diff を最低証拠にする。core requirement と richness を分ければ、「動く最小物」を完成品と誤認しにくい。

改修時は各変更に target failure と preserved behavior を一対で置く。敵出現の修正なら、期待する出現列だけでなく、既存の入力、score、clear、restart も同じ headless run で確認する。固定 seed / clock、synthetic input、state snapshot、screenshot を組み合わせ、code diff や自己説明を証拠にしない。指摘箇所の修正後には同じ play path 周辺を自力で走査する。ただし探索対象、変更可能範囲、保護 invariant、終了条件を開始時に明記する。

累積改善は GameOpt 相当として、各 turn の要求を acceptance ledger に残す。新しい gameplay、level、balance、art、UI、audio の変更ごとに、要求そのもの、統合上必要な challenge、過去機能の regression を分け、最終 build で再確認する。小さな導入案は、次の prototype 一件だけで、各 cycle に三列の表を作ることだ。「今回通す observable」「壊してはいけない observable」「人間の体験判定が必要な項目」を各 1～3 件に限定し、headless 証拠と実プレイ判定を混同しない。成功条件は項目数ではなく、局所実装が reachable な一連の play path に統合され、次 cycle 後も同じ証拠が再取得できることとする。

■ メリット・デメリット
メリットは、playable diff、headless test、実プレイ評価を一つの score に潰さず、制作 lifecycle のどこで失敗したかを追える点にある。F2P と P2P の対、dead code を証拠にしない規則、challenge と regression の分離はそのまま移植できる。また「指摘された箇所を直せる」と「未提示の欠陥を発見して完了まで持っていける」を分けることで、自律制作能力を過大評価しにくい。

デメリットは、完全移植すると rubric と test の整備が制作そのものを圧迫することだ。閉鎖 corpus の Strict や model 順位を自分達のゲームへ一般化する根拠も弱い。deterministic probe は state transition や回帰には強いが、面白さ、手触り、画面の読みやすさを置き換えない。評価項目を細分化しすぎると、既知 rubric への最適化が未知の遊びや大胆な改変を抑える危険もある。したがって自動化は到達可能性と非退行へ限定し、体験品質は人間の実プレイによる独立判定として残す必要がある。

■ 判定
部分採用。三 track 全体の再現ではなく、変更ごとに「直す挙動／守る挙動／人間が判定する体験」を分け、実行時証拠で閉じる評価設計を採る。特に self-discovery と停止条件を独立能力として扱う。一方、総合 score、閉鎖 dataset の順位、game feel proxy は制作判断へ直接持ち込まない。

■ URL
https://arxiv.org/abs/2608.21833v1
