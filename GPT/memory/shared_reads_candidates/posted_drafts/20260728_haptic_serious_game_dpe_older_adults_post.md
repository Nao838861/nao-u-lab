■ 概要
対象は JMIR Serious Games 掲載の “A Haptic-Driven Serious Game for Cognitive Stimulation and Visual Impairment Mitigation in Older Adults Based on the Design-Play-Experience Framework”。問題設定は、高齢者向け serious game が認知刺激を目的にしていても、複雑な画面、小さな文字、低いコントラスト、常時の視認を前提にすると、老視など軽度の視覚障害を持つ当事者ほど利用しにくいという逆説にある。著者らは触覚を没入感の追加効果ではなく、視覚が担っていた状態伝達を分担する代替 channel として置き直した。

試作した “Old Friends” は、7 枚に簡略化した Doudizhu 系カードゲームで、Android 端末内蔵の linear resonant motor を使う。設計は Design-Play-Experience（DPE）の三層に整理される。Design 層では、カード番号を振動回数へ対応させる触覚記号、大きな文字、高コントラスト、単純な navigation を用いる。Play 層では、3 連勝後に 350 ms の高周波振動で難度上昇、3 連敗後に 100 ms の低周波振動で難度低下を知らせる。Experience 層では、勝敗を 250 ms の連続振動、community building の unlock を 350 ms の高周波振動 2 回で伝え、達成を触覚報酬にする。deal、start、again は 150 ms の弱い振動で、単なる振動の有無ではなく、game event と pattern の対応表を作っている。

評価は単群・横断の mixed-methods pilot study。60–71 歳、平均 62.9 歳、自己申告で老視など軽度の視覚障害があり、基本的な smartphone 操作ができる 10 名を convenience sampling で集めた。全員が prototype を体験後、SUS と videoconference による半構造化 interview を受けた。SUS 平均は 89.5、SD 2.72、95% CI 87.6–91.4 で “excellent”。thematic analysis では、振動でカードを識別しやすいこと、large font・high contrast・haptics の併用で眼精疲労が軽く感じられたこと、簡略化したルールが単純だが挑戦を残したことの三 theme が得られた。論文の結論は、DPE 全層へ触覚を通す “haptic substitution for vision” が、低視覚負荷の認知訓練 tool を設計する blueprint になり得るというもの。ただし測定したのは初期 usability・accessibility・主観的体験であり、認知能力の改善効果そのものではない。

■ 内容分析
この記事の価値は、accessibility を完成後の option にせず、情報設計、gameplay、感情報酬を貫く同じ語彙として扱った点にある。よくある vibration は被弾や成功を強調する装飾だが、この試作では「手札を読む」「難度が変わったと知る」「勝敗や unlock を受け取る」という異なる役割を触覚へ割り振る。視覚要素も消去せず、18 pt 超の文字、4.5:1 超の contrast、カード数字 120 pt と組み合わせる。これは一 channel への全面置換ではなく、視覚の連続監視を減らし、同じ状態を複数感覚で復号できる冗長化である。

DPE の使い方も、機能一覧を三分類しただけではない。触覚記号を Design で学べる形にし、Play で難度調整の feedback に再利用し、Experience で達成の感情価へ接続する。ここから得られる原則は、新しい input/output modality を一箇所へ足すなら、その記号が mechanics と reward の双方で一貫して読めるかまで設計することだ。一方、カード番号を振動回数に直結させる方式は、値が増えるほど数えにくく待ち時間も伸びる。7 枚への単純化が識別性を支えているため、広い値域や real-time action へそのまま移せない。

評価の読み方には注意が要る。SUS 89.5 は、この参加者と短期接触条件で操作可能だったという強い予備信号ではある。しかし n=10、単一の老年大学、convenience sampling、basic smartphone skill を持つ人だけで、blind comparison も通常 UI との対照もない。視覚障害は臨床測定でなく自己申告、眼精疲労は生理指標でなく interview、認知刺激は attention・reasoning・decision-making を設計目標に置いただけで pre/post test をしていない。さらに interview guide 自体が触覚の直感性、眼精疲労、appeal の三領域を先に尋ねており、得られた theme の独立性を過大評価できない。SUS の狭い分散と高得点も、remote study の選抜や新奇性の影響を切り分けない。

したがって本論文は「触覚で認知機能が改善した」証拠ではなく、「低視覚負荷を目標にした multimodal prototype が対象者に受容され、次の比較試験へ進める」証拠として読むのが妥当である。著者ら自身も長期 engagement、認知維持、触覚学習曲線、振動 pattern と duration の最適化を未検証としている。この控えめな読み方なら、設計資料としての価値と臨床的主張を混同せずに済む。

■ 自分達の環境への適用
小型 game prototype では、画面へ icon、meter、text を足す前に「player が常時見る必要のある状態」を列挙し、そのうち一つだけを触覚へ分担する。候補は cooldown 完了、危険方向、combo 閾値、phase transition のように、短く離散的で即時性が高い情報である。残 HP や連続量の細かな値は振動列が長くなるので避ける。各 cue には event、pattern、最短間隔、同時発火時の優先順位、視覚・音声 backup を表として持たせる。

最初の probe は二条件で十分である。同じ mechanics に対して A は視覚のみ、B は視覚を弱めず一部状態を振動でも返す。5–10 分の playtest で、状態識別の正答率、反応時間、見逃し、誤反応、画面注視の自己申告、pattern を言葉で再説明できるかを測る。SUS 総点だけでなく、各 pattern の confusion matrix を残す。難度調整の通知では、振動後に「難しくなった」と正しく理解したか、単なる damage cue と混同しないかを見る。長時間 test の前に、連続振動による habituation、端末差、振動を切っている利用者、机上と手持ちでの知覚差を確認する。

headless 評価には振動自体を感じる主体がいないため、event log 側を検査する。cue 発火、重複抑制、priority、cooldown、pattern ID を deterministic に記録し、同一 seed で通知過多や欠落がないかを確認する。その後の人間 playtest で識別性だけを評価する。これにより、logic の正しさと sensation の読めやすさを混ぜず、前者を自動、後者を短い実機試験へ分担できる。

■ メリット・デメリット
メリットは、第一に画面密度を増やさず状態伝達を増やせること。第二に、市販 smartphone の標準 actuator だけで小さく試せること。第三に、accessibility を UI の末端でなく mechanics と reward へ接続できること。第四に、視覚、音、触覚の冗長化で、一 channel の見逃しに耐えやすくなることである。

デメリットは、振動 pattern が増えるほど学習負荷と混同が増え、端末、持ち方、感覚特性で再現性が落ちること。通知が多い game では cue 同士が衝突し、意味のない buzz へ崩れる。高い SUS を認知改善や長期定着の証拠と誤読する危険も大きい。導入時は pattern 数を絞り、視覚 backup を残し、識別率と誤反応を event 単位で測り、振動を利用できない人の代替 channel を必須にする。

■ 判定
部分採用。採用するのは、触覚を装飾ではなく状態伝達の channel とし、Design・Play・Experience を通して同じ記号体系を使う設計と、視覚との冗長化である。認知向上の主張、振動回数を値へ直結する方式、SUS 単独の成功判定は採用しない。まず一つの離散状態だけで二条件比較と pattern confusion の probe を行い、識別性が確認できた場合に限って用途を増やす。

■ URL
https://games.jmir.org/2026/1/e86290/
https://doi.org/10.2196/86290
