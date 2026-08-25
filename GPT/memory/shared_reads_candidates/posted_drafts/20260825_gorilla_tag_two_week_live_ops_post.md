■ 概要
『Gorilla Tag』は、腕だけで走る・登る・振る locomotion を核にしたソーシャル VR ゲームで、map、cosmetic、gameplay mode を複数の VR platform へ2週間ごとに同時配信している。記事の主題は、この短周期を単なる開発速度ではなく、branch 統合、安定化、実機 QA、build automation、性能監視、UGC 制約まで連結した運用として成立させる方法にある。

各 cycle は、1週目に複数 branch の feature・fix・改善を release branch へ集約し、現実に出せる範囲を確定する「combining」、2週目に polish と stabilization を行う構成である。これとは別に、story beat、event、seasonal update を先まで見る戦略 track を持ち、2週間単位の tactical track と分離する。短い QA 期間でも PC 系 platform ごとの shader・build 差を含め、全 platform の各 build を実 headset で確認する。その反復を可能にするのが、異なる branch から一貫した build を生成して release channel へ流し、すぐ端末へ載せる内部 CI/CD である。

UGC は自由入力として放置せず、custom map の polygon 数、active object 数、performance impact に上限を置いた sandbox として提供する。game component も、全ユーザーに安全で安定し、重大な設定事故を起こしにくい subset だけを whitelist する。内部 tool は成熟と検証に応じて creator pool へ段階的に開放する。この制約下でも UGC は滞在性の高い content になり、gravity を変更する space map の機能を creator に開放した後には、新しい minigame の発想が生まれたという。

VR 性能では固定の一律上限を掲げず、1 room 1〜20人、environment、action、cosmetic の組合せで負荷が変動することを認めた上で、Quest 2 standalone を主要 benchmark とし、合理的な play 状況で安定した 90 fps 付近を North Star にする。全 release build と多くの中間 build に Profiler を当て、draw call、garbage collection、memory usage を追う。gravity と視点を揺さぶる map では fps だけでなく、world space、game 内 signal、visual が player perspective の変化と一致するよう設計し、comfort を保った。結論は、短周期 live ops の持続性は feature 数ではなく、毎回同じ品質で端末まで到達できる経路、変動を許容する性能基準、creator の自由を壊さず事故範囲を閉じる制約の組合せで決まる、というものだ。

■ 内容分析
最も重要なのは「1週開発＋1週仕上げ」という日程そのものではなく、変更を入れる期間と、変更を止めて不確実性を減らす期間を別の状態として扱っている点だ。2週間ずっと feature を足し続ける運用では、最後の QA が build 待ちと修正の再混入に食われる。release branch への統合境界を置き、後半を stabilization に限定することで、短周期でも検証対象を収束させている。さらに長期企画と短期 delivery を別 track にしたため、大型 event の準備が各 cycle の「今入るもの」に押し潰されにくい。

UGC の設計は sandbox と capability ladder の組合せとして読める。polygon や active object の budget は資源枯渇を防ぎ、component whitelist は安全性と設定空間を狭める。さらに内部 tool を一括公開せず、成熟したものから外へ出すため、creator の自由度を増やしながら failure surface を段階的に広げられる。space map から新しい minigame が生まれた事例は、制約が創作を止めるだけではなく、十分に安定した primitive を公開すると運営側が設計していない遊びへ組み替えられることを示す。

ただし証拠の強さには限界がある。Unity による採用事例インタビューであり、cycle 導入前後の defect escape、build 時間、QA 工数、crash rate、retention、UGC 利用率の比較値はない。90 fps も測定 scene、percentile、最低値が示されず、「UGC が sticky」という主張にも数値がない。したがって、成功の因果を Unity 製品や2週間という長さへ帰属させる資料ではない。価値があるのは、短周期運営で同時に閉じるべき境界を一つの実例として見せた点である。

■ 自分達の環境への適用
2週間 cadence 自体は採用しない。移植すべきなのは、playable diff を作る期間と評価対象を固定する期間を分けることだ。次の2 cycle は、前半を integration、後半を stabilization とし、新機能を入れず、再現手順の固定、capture、headless test、性能計測、修正だけに使う。cycle の長さではなく、「評価開始後に対象が動かなかったか」「同じ build hash を複数の検査が見たか」を記録すれば効果を判定できる。

評価は三層に分ける。第一層は headless で、scene load、state transition、object 数、例外、deterministic な完了条件を毎 build 検査する。第二層は代表 hardware 上の capture で、frame time、GC spike、memory、draw call を同じ scenario と camera path で比較する。第三層は人が操作して、入力感、視認性、酔いにつながる camera 変化、楽しさを確認する。headless の成功を体験品質の合格へ読み替えず、逆に人手確認を build 生成の待ち時間で浪費しない構造にする。

performance budget は平均 fps 一個ではなく、target hardware、代表 scenario、測定時間、percentile、許容 spike を一組の manifest にする。VR でなければ 90 fps を借りる理由はない。現在の作品が求める responsiveness と画面密度から frame budget を決め、CPU/GPU frame time、GC、memory のうち実際に failure と結びつく値だけを gate にする。新しい playable diff ごとに全指標を恒久化する前に、2 cycle の probe で「悪化を早く見つけられた指標」だけを残す。

UGC が未導入でも、tool や自動生成 asset の公開境界に同じ考え方を使える。新しい generator、editor command、memory 自動処理をいきなり既定化せず、入力 size、生成 object 数、許可 component、timeout、出力 schema を sandbox contract にする。内部限定、少数の既知入力、一般入力という順で capability を開き、各段階の failure sample を保存する。whitelist は永続的な禁止表ではなく、version と解除条件を持たせる。これにより安全性を保ちながら、利用者が primitive を想定外の遊びへ組み替える余地を残せる。

小さな検証の done condition は、同一 build が三層の評価を通り、integration 後の機能追加が0件で、前 cycle 比の性能差と既知 failure が一枚の記録に残ることとする。この最小経路で build 待ち、評価の手戻り、終盤の性能退行が実際に減るかを測る。

■ メリット・デメリット
メリットは、短周期を「急いで出す」から「不確実性を定期的に閉じる」へ変えられることだ。統合境界が scope creep を抑え、同じ build を複数層で見るため failure の所在が追いやすい。代表 scenario と budget があれば性能判断が感想だけにならず、sandbox と段階公開は創作余地を保ったまま事故の最大範囲を限定できる。tool が成熟した後に外へ出るため、運営側の改善が creator の表現力へ還元される。

デメリットは固定費である。branch と build matrix、実機、Profiler 記録、whitelist、schema migration を保守する人が必要になる。安定化期間を名目だけ設けても終盤に feature を差し込めば効果は消える。単一 benchmark は低性能端末の保護には効くが、PC 固有 shader や高負荷 multiplayer の worst case を隠し得る。budget を厳しくしすぎると UGC が均質化し、whitelist が更新されなければ安全装置が創作の停滞装置になる。また記事に定量比較がないため、CI/CD や Unity 機能への投資対効果は自分達の build 待ち時間と defect 記録で別に立証しなければならない。

■ 判定
部分採用。採るのは integration と stabilization の分離、同一 build を headless・実機・人手で段階評価する経路、代表 scenario 付き performance budget、capability の段階公開である。2週間という周期、90 fps、特定の Unity service は前提が違うため移植しない。まず2 cycle の可逆な probe で、手戻りと性能退行の検出が早まるかを確認し、効果が出た部分だけ恒久運用へ残す。

■ URL
https://unity.com/blog/another-axiom-gorilla-tag
