■ 概要
『Nowhere Prophet』の作者 Martin Nerurkar が、発売から5年以上を経た roguelike tactical card game の三つの不足を、後継作『Crownbreakers』の構造変更と対にして説明した postmortem。第一の不足は難度で、最低難度でも多くの player が序盤で離脱するほど厳しかった。作者は、開発者自身が system と敵を知りすぎて「普通」の基準が上がったことに加え、敵の手札を隠す設計が不公平感を生んだと分析する。対等な人間同士なら手札の非公開は推測を生むが、資源条件が異なり傷も負わない AI の counter は回避不能な cheating として映る。後継作では最低難度を大多数が完走できる入口と位置づけ、district を初回 clear するたび次の difficulty modifier を解放する。完走と反復によって challenge を増す導線である。

第二の不足は run length である。複数 map を旅する長い巡礼感、価格に見合う量、overworld で deck を育てる機会を積み重ねた結果、1 run が100分を超えた。長さは開始時の心理的 commitment を増やし、終盤の死で失う時間も大きくする。単純に map を削ると、card の追加・除去・調整を行う deck-building の時間まで消えるため、後継作は一つの district 解放を複数の短い route に分け、1 route を20〜30分の run とする。さらに成長操作を overworld から battle 内へ移し、戦闘中に treasure を壊して card を得る、不要 card を除く、といった選択を core combat に埋め込む。作者の解は「長い run を縮める」だけでなく、短縮によって失われる deck 編集機能を、より頻繁な行為へ再配置することにある。

第三の不足は物語の voice である。procedural generation に合わせて narrative を交換可能にしたため、繰り返し会って好きになったり嫌いになったりする人物が不足した。長い prose も、選択の文脈に必要な箇所以外は飛ばされやすく、翻訳 cost が残る。作者は fanart の不在を emotional connection が弱い兆候と見て、後継作では人物との再会と関係変化を中心にし、story text の99%を dialogue にする。記事の結論は、player が何を知らされ、何分を賭け、何に再会するかという体験の単位から次作を組み直すことにある。

■ 内容分析
最も価値があるのは、三つの反省が「数値を下げる」「文章を減らす」で終わらず、一つの変更が別の機能を壊すところまで追われている点である。run 短縮は accessibility を上げる一方、従来の deck-builder が map traversal に載せていた成長の cadence を奪う。そこで deck-building を battle 内へ移す。この設計なら戦闘は既成 deck の検査場ではなく、敵処理と将来 deck の編集を同時に行う場になる。treasure を壊すために tempo や攻撃機会を使うなら、成長選択そのものが局面判断になる。ただし記事は treasure 取得が戦闘勝敗を trivialize しないか、card 除去を含む即時編集が plan の可読性を損なわないか、route を跨いで何が保持されるかを説明していない。短縮と統合の着想は強いが、新しい combat economy の成立は未評価である。

難度分析も、単なる敵 HP の問題ではなく、challenge と frustration を分けた点が重要である。hidden hand は情報が同じ条件の PvP では意味のある uncertainty でも、非対称な PvE では counter の理由を player が検証できず、損失を自分の判断へ帰属しにくい。これは難度を「勝率」だけで測れない例で、同じ敗北でも事前に危険を読めたか、回避案があったか、結果から学習できたかで納得度が変わる。district ごとの段階解放は初心者の入口と熟達者の反復を両立しやすいが、作者自身も最低難度が面白さを保ちながら十分易しいかは release 後に判明すると留保している。完走可能性についての主張は design intent であり、離脱率、clear rate、初回死亡地点、modifier 別の継続率による検証結果ではない。

物語については「procedural だから感情移入しにくい」と一般化しない方がよい。問題は生成そのものより、個々の encounter を交換しても全体が成立するようにした結果、再会・記憶・関係変化が設計上の必須条件から外れたことにある。recurring character は過去の行為を次の encounter の意味へ変換する anchor になる。一方、dialogue 99%は効率の証拠ではなく制作方針であり、会話にも翻訳費、分岐管理、voice の整合性、既読 skip の問題がある。fanart も強い愛着の一指標にはなるが、母集団規模、視覚的描きやすさ、community の文化に左右されるため、story connection の単独 metric にはできない。記事は内部 telemetry や比較実験を示さない単一作者の retrospective であり、因果仮説の質は高いが効果量は未確定である。

■ 自分達の環境への適用
prototype の設計変更では、「削る対象」と「その対象が運んでいた機能」を一組で記録する。たとえば run を30分へ縮めるなら、削る map node 数だけでなく、deck 編集回数、build が形になる時刻、回復と risk の判断回数、人物との再会間隔がどう減るかを先に列挙する。失われる機能を battle、run 間 hub、短い route のどこへ移すか決め、1回の playable diff では一つの再配置だけを試す。これにより「短くなったが成長が薄い」「会話を減らしたが関係も消えた」という目的と手段の逆転を発見しやすい。

headless 評価では、難度を win rate だけでなく情報と回復可能性に分解する。同一 seed で novice policy と既知情報を持つ expert policy を走らせ、初回死亡地点、危険提示から損失までの猶予、観測できない敵 action による致命傷率、敗北後に選べた代替行動数を記録する。最低難度は初見 policy の district clear rate、高難度は同じ content の modifier 上昇に対する熟達勾配を見る。hidden information を残す場合は、敵 archetype の予告、使用済み card、残り counter 候補など段階的な情報開示を比較し、challenge を保ったまま「理由の分からない敗北」が減るかを測る。

run 短縮の probe は、15分、30分、60分という時間だけを比較せず、各条件で meaningful deck edit が何回起き、最初の build identity が何分で現れ、終盤死から次の開始まで何秒空くかを取る。battle 内取得を試すなら、treasure 破壊のために敵処理を遅らせた回数、取得 card がその戦闘中に使われた割合、選択によって有効な戦術が増えたかも replay から判定する。短い route の集合が長い旅の連続性を失わないよう、district 単位の進捗と route 単位の損失を別 state にする。

物語の最小 probe は大量の dialogue 制作ではなく、同じ人物を3回登場させ、前回の player action に応じて次回の目的・態度・台詞のいずれか一つが変わる縦切りにする。評価は文章量ではなく、playtest 後に人物の目的と関係変化を再生できるか、選択文脈のない prose を飛ばした率、翻訳対象文字数あたりの記憶された事実数で見る。制作記憶には「run を短くした」の一行ではなく、消えた機能、移植先、測定値、再発した副作用を decision record として残す。

■ メリット・デメリット
メリットは、作者が完成作の不満を次作の具体構造へ一対一で接続していること、challenge と不公平感を情報非対称性から分けたこと、run 短縮で失う deck-building を core combat へ移す補償設計を示したこと、procedural narrative の弱点を文章量ではなく recurring relationship の欠如として捉えたことにある。個別の数値より、変更が担っていた機能を洗い出して再配置する手順が再利用できる。

デメリットは、離脱率・clear rate・run 時間分布・読了率・翻訳費・fanart 数の比較がなく、後継作の解も記事時点では release 後の検証前であること、20〜30分や dialogue 99%を別 genre へ移植する根拠がないこと、battle 内 deck 編集が認知負荷と balance に生む副作用、difficulty unlock が苦手な player をどこまで救うか、recurring character が procedural variation を狭める cost が未検討なことである。

■ 判定
部分採用。20〜30分、dialogue 99%、district 別 unlock という解を標準値にはしない。一方、削減で消える機能を特定して core action へ再配置する手順、難度を勝率と情報納得度に分ける評価、交換可能な event に recurring relationship の縦軸を通す考え方は採用する。導入時は短い playable probe と telemetry を組にし、作者の定性的仮説を自分達の測定で確かめる。

■ URL
https://sharkbombs.itch.io/nowhere-prophet/devlog/1277002/3-lessons-for-the-next-game
