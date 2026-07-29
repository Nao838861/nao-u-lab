■ 概要
「Developing Ethical Games: Why & How」は、Celia Hodent、Rachel Kowert、Fran Blumberg が GDC 2026 で公開した Ethical Games Code of Ethics の新 draft である。狙いは、ゲーム倫理を「有害表現を避ける」といった内容規制に狭めず、プレイヤーがゲームへ支払う時間・金銭・data・心理的負荷と、開発者が制作で負う労働・harassment・credit・環境負荷を、同じ意思決定原則の下に置くことにある。code は aspirational かつ voluntary で、政策そのものではないが政策立案の参考にはなり得る、と位置づける。2026年後半の正式化、studio pledge、2027年以降の guideline と resource 整備を次段階としている。

player protection は六群に分かれる。第一は social harm で、通信・interaction・UGC を harassment、差別、abuse、有害思想への接触を増幅しないよう設計し、code of conduct、訓練済み担当者、実行可能な通報手段、creator の同意、algorithm の bias・exploitation 監視まで求める。第二は時間と金銭で、通知、期間限定 event、progression が離脱を罰する coercive design にならないこと、課金が dark pattern、loss aversion、gambling-like mechanics によって本来望まない滞在や支出を誘発しないことを掲げる。第三は privacy で、data 収集への明示的同意、GDPR 等の域外適用も含む責任、商業目的での脳画像・脳活動指標利用の禁止を置く。

第四の inclusive design は、gameplay の楽しさに本質的でない barrier を減らし、残る barrier は購入前に知らせる。一方、難しい・論争的・感情的な主題を描く自由は否定しない。影響を受ける community の知見を得ること、shock value を越える目的、territory ごとの culturalization、点滅や暴力表現など身体・精神へ影響し得る content 情報を検討する。第五の transparency は、累積 play time と支出、data が custom offer や dynamic difficulty adjustment にどう使われるかを見えるようにし、体験上必要な mystery や misdirection と、基本 system の偽装を分ける。対戦相手や協力者が AI-controlled participant なら明示する。第六は minors で、18歳未満の発達途上性と権利を優先し、時間・金銭・心理的圧力の利用を禁じ、grooming 等の social harm に予防・対応・教育を用意する。

worker protection では、player に向ける倫理と社員・virtual character・in-game system に向ける価値を一致させる。職場の harassment を許容せず、sustained overtime や crunch を計画段階から防ぎ、例外は稀・短期・範囲明示・透明・補償と回復時間つきに限定する。公開 harassment を受ける community 担当者には事件前の対応計画を用意する。仕事や着想には報酬または少なくとも credit を与え、著作物や生成 AI の利用を開示する。D&I を人事だけへ押し込めず全階層の責任にし、周縁化された社員だけへ負担を集中させない。server と開発の carbon footprint 削減も経営課題に含める。結論は、player safety と健全な制作環境は別々の CSR 項目ではなく、信頼できるゲームを作り続ける一つの条件だ、という提案である。

■ 内容分析
この draft の強みは、倫理を発売後の moderation や法務確認ではなく、mechanics、live-ops、telemetry、marketing、content、production planning の設計入力へ移している点にある。特に「意図的な mystery は許すが system の基本性質は偽らない」「難しい表現は許すが影響・目的・事前情報を検討する」「overtime の例外を全面否定せず boundedness、透明性、補償を要求する」という境界は、抽象的な善悪より制作判断へ落としやすい。player の autonomy を奪う仕組みと、挑戦・驚き・習熟を生む圧力を同一視していないことも重要である。

ただし、これは forum で feedback を募っている規範案であり、効果検証ではない。冒頭には初回体験の悪い player は離脱確率が320%高いという古い出典や、trust・turnover・規制への一般的な cost が示されるが、各条項を導入した studio と非導入 studio の比較、harassment・overspending・burnout の減少量、誤検知や制作費への影響は報告されない。「science-informed」を掲げても、条項ごとの evidence level、監査主体、違反時の扱い、pledge の拘束力は未定である。

さらに条項間には trade-off がある。AI participant の常時表示は deception を減らす一方、正体推理を核にした作品では central mystery と衝突する。累積時間・支出の表示は informed choice を助けるが、表示方法次第では新たな engagement cue にもなる。不要な accessibility barrier の判定、意味ある challenging content と shock value の境界、rare crunch の許容者、algorithmic harm の測定基準も決まっていない。code は論点の地図としては広いが、衝突時の優先順位と合否判定器はまだ持たない。

■ 自分達の環境への適用
ゲーム制作には「企画時・計測導入時・公開前」の三段 review lens として部分導入できる。企画時は、各 retention / progression / monetization mechanic について、離脱を罰するか、情報を隠して選択を歪めるか、楽しさに本質的な pressure かを一行で記録する。ここでは難度や期間制そのものを禁止せず、player が何を予測でき、いつ安全に離脱できるかを見る。AI character や DDA を使う場合も、mystery の設計意図、開示地点、誤認した時の損失をセットで残す。

telemetry 導入時は、event ごとに purpose、収集項目、保持期間、同意、誰が読むか、custom offer / difficulty へ戻すかを metadata 化する。headless 評価は、連続失敗後の復帰時間、missable reward、通知頻度、支出導線、bot 表示の有無など機械的 proxy を検査できるが、coercion、文化的影響、harassment の安全性を自動で確定したとは扱わない。headless は危険候補を立て、人間の playtest と release review へ渡す detector に限定する。

公開前には、一枚の ethics review card で player time / money / data / social safety / accessibility / AI disclosure と、制作側の overtime / public harassment plan / asset credit を同時に確認する。これにより「安全機能を増やすために制作側が恒常的に疲弊する」「短納期で moderation tool を削り公開後に担当者へ負担が集中する」といった移し替えを見つけやすい。記憶システムでは、この code 全文を恒久ルールへ昇格させず、prototype ごとの判断・例外・検証結果を evidence 付き atom として残す。3件程度の実制作で同じ事故を捕捉できた項目だけ、制作 cycle の恒常 probe に昇格させる。

■ メリット・デメリット
メリットは、player protection と worker protection を同じ地図で扱い、企画・運用・組織の間に落ちる責任を見つけられること。禁止表ではなく autonomy、transparency、bounded exception で読むため、表現の自由や意図的な不便さを残しながら危険を説明できる。小規模 prototype でも checklist と decision log から始められ、後で pledge や法規制が変わっても判断根拠を追跡しやすい。

デメリットは、任意規範で測定値・監査・制裁・優先順位がなく、項目を埋めただけで ethical と自己認証しやすいこと。大規模 platform 向けの moderation、GDPR、環境負荷と、個人制作の prototype を同じ重さで毎回確認すると制作速度を奪う。文化・accessibility・未成年保護は当事者 review なしに headless 判定できず、生成 AI の credit も利用形態別の具体ルールが必要になる。採用時は対象リスクに絞り、検出結果と実際の player / worker outcome を後から照合しなければならない。

■ 判定
部分採用。検証済みの認証基準ではなく、設計上の見落としを早期発見する review lens として使う。まず retention、telemetry、AI participant、release planning の四領域で小さく試し、誤検知・追加工数・実際に防げた問題を記録する。効果が確認できた項目だけ恒常化する。

■ URL
https://media.gdcvault.com/gdc2026/Slides/Hodent-Celia_Kowert-Rachel_DevelopingEthicalGames_ForumGDC26.pdf
