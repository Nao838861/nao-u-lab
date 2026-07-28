■ 概要
Thunderrock Innovations は、戦略性と反復プレイを重視する二人組 studio である。商業第一作『Keep Keepers』は次作の資金を残した一方、Steam の「Popular Upcoming」に届く wishlist と可視性があっても、長期運営や十分な財務余裕を保証しないことを示した。この経験から、第二作『Islantiles』以降は、生存可能な制作条件を先に固定し、その中で独自性を作る方式へ移った。

中心となる制約は、一作およそ一年、単一の core mechanic、原則 Steam 一平台である。独自性は未知の genre の発明ではなく、既知の仕組みを組み合わせ、簡単な rule から戦略的 trade-off を生むことに置く。一目で genre と遊びを理解できる familiar anchor を残しつつ、長期計画、build、失敗した実験を語りたくなる decision space を作る。project 間では asset より、engine の知識、tool、pipeline、機能した design pattern を再利用する。

企画は、小さな prototype を経験豊富な友人へ渡して選別する。強い signal は感想の好意度ではなく、再訪、次の iteration の質問、数日おきの新 build 要求である。ただし、内輪の Fun と市場の Appeal は分ける。prototype 段階から screenshot と短い clip を作り、触る前の人に core mechanic が読めるかを試す。demo では median playtime が約50分に達するまで onboarding と depth を反復する。制作開始後は scope を固定制約とし、変更は追加より refinement または replacement を選ぶ。判断は「投入時間に見合うほど core experience を改善するか」に戻す。

marketing と discoverability は開発後の告知ではなく、demo、data、player との対話、見せ方の反復を含む development とする。Codecks を game 内へ埋め込み、状況付き feedback を ticket system へ直接送り、actionable task にする。不得手で最終価値への影響が大きい領域は外部へ委ねる。結論は、期間、得意領域、platform、行動 signal、engagement、外からの可読性を同じ制約契約として運用することが少人数制作の持続性を高める、というものだ。

■ 内容分析
scope を feature budget ではなく、企画選定から販売時の理解可能性まで貫く連鎖として扱う。一年という期限は、単一 mechanic、Steam 集中、genre clarity、知識再利用、追加より置換という後続判断を拘束する。各施策を別々の成功談として読むと「短く作る」「早く test する」という一般論になるが、実際の強みは、財務 runway から逆算した一つの constraint が、何を作るか、誰に見せるか、何を測るか、何を切るかを揃えていることにある。

また、Fun と Appeal を別問題にした観測設計がよい。再来訪や build 要求は、社交辞令を避け、prototype を再起動する intrinsic pull の proxy になる。median playtime は demo の onboarding と depth を、screenshot と clip は接触前に mechanic が読めるかを測る。三者を混ぜないため、「遊べば面白いが伝わらない」「映像は強いが継続されない」を別の失敗として診断できる。

ただし、これは controlled study ではなく一 studio の事後的な実践報告である。約50分という閾値に、売上や retention との対応、sample 数、genre 別比較は示されない。友人の再訪も、経験豊富な developer/player という偏った母集団と既存関係の影響を受ける。Steam の view-to-wishlist 比は流入元で大きく変わると記事自身が認めており、clip 反応にも広告配信量、既存 audience、visual polish が交絡する。『Keep Keepers』から『Islantiles』へ工程を変えた前後で、同じ市場条件による比較もない。したがって、これらは成功を予測する普遍的 KPI ではなく、次の判断を止めずに行うための局所的な evidence と読むべきである。

scope 固定は、core mechanic を早く lock できる strategy / roguelike 系には合うが、narrative pacing、network effect、live operation が価値の中心なら過度な切り詰めになり得る。Steam 一平台も team の既存知識と audience が一致した結果である。外注も brief、integration、revision の管理費を増やす。それでも「不得手で、最終価値への影響が大きいか」で境界を引くのは、二人の時間を希少資源として扱う判断である。

■ 自分達の環境への適用
playable diff の自己評価に、機能数ではなく小さな constraint contract を導入する。各 prototype の先頭に、今回固定する core experience、投入上限時間、変更可能範囲、観測対象を記録する。diff 後は「何を足したか」ではなく、core experience の改善量が実装時間に見合ったかを判定し、見合わなければ次 cycle で追加せず replacement か撤回を選ぶ。これにより、技術的に面白い実装が playable な価値へ接続しないまま scope を膨らませるのを防げる。

観測は段階別に分ける。第一に、prototype の intrinsic pull として、同じ build への自発的な再実行、次 build の要求、同じ mechanic を異なる方法で試した回数を残す。人間の継続 test が少ない場合、headless 評価では再来訪そのものを偽装せず、state coverage、方策の分岐数、再試行時に異なる outcome が生じる率を下位 proxy とする。第二に onboarding と depth では、median session length だけでなく、最初の meaningful choice までの時間、rule 誤解による停止、最初の失敗後の再試行率を記録する。50分を目標値にはせず、project 内で build 間の分布がどう変化したかを見る。

第三に Appeal を独立させる。短い無音 clip または一枚の screenshot を作り、初見者が「player が何を操作し、何を選び、何が変化する game か」を説明できるか確認する。映像の like 数を Fun の代用にせず、説明の一致率と誤読の型を記録する。core mechanic が実際には面白いのに clip で読めない場合、mechanic を捨てる前に camera、feedback、UI、state change の見せ方を修正する。逆に clip は理解されるが再試行が起きない場合は、presentation ではなく decision depth を疑う。

feedback は原文、build id、発生 state、再現手順、期待と実際を一つの record に結び、収集先と backlog を分断しない。全件を即 ticket 化せず、core constraint との接続、再現性、影響範囲を付けて action に昇格する。次の3 playable diff だけ「core 改善仮説」「投入時間」「内部 signal」「外向き可読性」「keep / refine / replace」を残し、次手を決めやすくなるかを比較する。Fun と Appeal の混同が減ったか、scope 追加を replacement に変えられたかで採否を決める。

■ メリット・デメリット
メリットは、財務・制作・design・marketing を別々の checklist にせず、一つの制約から判断を導けることにある。単一 mechanic と時間上限は playable diff の done condition を鋭くし、行動 signal、median、外向き可読性の分離は失敗箇所を特定しやすくする。asset ではなく知識と pipeline を再利用する考え方は、prototype ごとの見た目が違っても制作速度を累積できる。追加より refinement / replacement を優先するため、良い案を断る根拠も残る。

デメリットは、局所的な運用値が数字の権威を持ちやすいことだ。50分、1年、Steam 一平台を規則化すると、project の価値構造を無視する。友人の再訪、clip の理解、session length はそれぞれ bias を持ち、売上の因果指標ではない。scope lock が早すぎれば探索価値を失い、外向き可読性を重視しすぎれば、触って初めて分かる深さや未知の表現を排除する。ticket 直結も処理能力を超えると priority noise を増やす。したがって採用すべきなのは閾値ではなく、制約を明示し、段階ごとに異なる evidence を使い、追加の前に置換を問う判断構造である。

■ 判定
部分採用。期間や50分という数値、Steam 集中は転用せず、core experience・投入時間・変更範囲を先に固定する constraint contract、Fun と Appeal の分離、発言より行動を見る prototype signal、追加より refinement / replacement を優先する判断を3 cycle の可逆な probe として採用する。成果は売上予測ではなく、playable diff の次手が明確になったかと scope creep が減ったかで判定する。

■ URL
https://80.lv/articles/workflows-challenges-of-developing-games-as-a-two-person-team
