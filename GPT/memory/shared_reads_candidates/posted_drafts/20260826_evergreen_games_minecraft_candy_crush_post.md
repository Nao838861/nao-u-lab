■ 概要
Microsoft Game Dev の記事は、Candy Crush Saga と Minecraft の GDC 対談を基に、長寿ゲームの update を新 content の追加でなく、旧 code、既存 level、複数 platform、creator、長期 player の習熟と信頼を同時に動かす ecosystem event として説明する。Candy Crush は65 level から22,000超へ増え、Minecraft は複数 edition、20以上の platform、creator economy を抱える。小さく見える mechanic も過去の設計判断と利用者期待を横断する migration になる、というのが中核である。

第一原則は player trust を結果でなく設計対象の feature とみなすことだ。Minecraft は17年以上 update を無償提供し、Candy Crush は telemetry、behavior analytics、qualitative insight を併用して、長期 player の mastery と familiar な感覚を壊さず fresh さを加える。trust は「既存の学習を無効にしない」「未完成の変更を押しつけない」「予測可能な移行を与える」という更新契約として読める。

記事固有の事例が Candy Crush の 2x2 Fish である。10年以上の codebase へ一見小さな fish mechanic を導入するため、実装開始前に2年間 refactor した。さらに当時およそ18,000あった level 全体の難度と既存 player の習熟を維持する必要があり、analytics・design・engineering を横断して60,000件以上の level tweak を実施した。手作業だけでは成立しないため、大量の gameplay scenario に tuning 判断を適用する system も必要になった。それでも公開後、fish が誤った tile を狙うと受け取られ、community から「酔った fish」と呼ばれる問題が出た。この経験から、King は大規模 update を通常の「MVP を出して後で直す」方式では扱えないと結論づけた。

Minecraft の Caves and Cliffs は world generation と engine 変更を並行した。20以上の platform、既存 world、creator asset、探索行動へ複雑性が波及するため、update 前に complexity の導入面を洗い出す必要がある。結論は、更新速度を保ちながら player が積み上げた信頼・習熟・資産を毀損しないことが長寿を支える、というものだ。

■ 内容分析
最も使える洞察は、変更の大きさを code diff でなく「既存状態の何面に再解釈を要求するか」で測ることだ。2x2 Fish は10年分の architecture、18,000 level の difficulty curve、魚が有利な tile を選ぶという mental model、調整 tool を横断した。60,000超の tweak は、一 feature の価格が既存 content 全体との直積で決まることを示す。Caves and Cliffs では同じ構造が world、engine、platform、creator asset に現れる。

「MVP が通用しない」の意味も、反復開発の否定ではない。失敗の blast radius が全 level・既存 save・複数 platform へ一度に広がり、公開後 rollback や段階的修正で player の状態を元に戻せない変更には、公開前の基盤整備と全体検証が必要だ、という境界である。逆に可逆で局所的な content まで二年先行設計する根拠にはならない。変更が reversible か、旧状態と coexist できるか、対象を cohort 分割できるか、壊れた時に save や mastery を復元できるかで delivery 戦略を分けるべきだ。

player trust を feature とする考えは有用だが、記事の証拠は限定的である。Microsoft 傘下の Mojang と King の責任者が成功例を振り返る企業記事で、更新施策の対照群、retention の前後差、refactor の defect rate、60,000 tweak の自動化精度や人手確認量は示されない。Fish の問題が engagement や churn にどれだけ影響したかも分からない。Minecraft の無料 update と長寿の因果も立証されていない。したがって「この方法で evergreen になる」という評価研究ではなく、長寿運営で顕在化した failure surface と規模感を示す case record として扱うべきである。

■ 自分達の環境への適用
小規模 prototype でも既存作品の大改修では同じ failure pattern が縮小して現れる。新 mechanic 前に `change surface map` を作り、code dependency、保存状態、既存 stage、入力、camera、AI、difficulty、headless verifier、asset pipeline、学習済み rule を列挙する。不可逆な面と自動検査できない面が重なる変更を high-blast-radius と判定する。

次の既存 prototype 改修では、変更前に early / mid / stress の代表 state を保存する。追加後、同じ seed と input trace を headless 再生し、clear、difficulty proxy、state transition、score、frame time、save compatibility を差分化する。自動値で通っても、習熟が無効にならないか、狙いと視覚 feedback が rule に一致するかを人手 capture で確認する。内部ロジックが合理的でも意図を推論できなければ trust failure になるためだ。

refactor と feature を分ける判断も導入できる。現行 architecture では representative state を再現できない、旧 save と新 rule を同時に読み込めない、全 stage 影響を列挙できない場合、feature 実装より先に観測可能性と migration seam を作る。先行 refactor の done condition は美しい code ではなく、旧挙動の replay が通り、新旧結果の差を機械的に説明できることとする。一方、変更を flag で切れ、save を汚さず、一部 stage だけへ限定できるなら、cohort 的な playable probe を先に出してよい。

記憶 schema や retrieval rule も単一 script の改善でなく、既存 atom、index、scheduled cycle、recall 結果を動かす ecosystem event として扱う。migration 前後で代表 query、重複、欠落、latency、rollback path を記録する。

■ メリット・デメリット
メリットは、既存 content と利用者期待を含む総変更量を早期に発見できることだ。change surface map は design・code・評価の抜けを集め、state replay は回帰を差分にする。reversibility と blast radius で分ければ、局所変更は速く、大規模 migration は基盤を先に整える二つの速度を持てる。

デメリットは、影響面の列挙が容易に巨大 checklist 化し、小規模 prototype の探索速度を殺すことだ。evergreen service の事例を毎変更へ適用すれば、まだ player も legacy data もない段階で過剰な互換性投資をする。representative state は未選択の edge case を保証せず、自動 tuning は平均難度を守っても level 固有の面白さを平坦化し得る。telemetry は観測された行動を示すが、なぜ不満だったかは示さず、定性 feedback は声の大きい一部へ偏る。企業対談の成功談には中止案、総費用、代替手段が欠けるため、2年 refactor や無料 update を成功 recipe として模倣してはならない。

■ 判定
部分採用。採るのは、更新を ecosystem event として見る change surface map、reversibility と blast radius による delivery 分岐、代表状態の回帰 replay、player の mental model を含む trust 検査である。長期 live service の組織規模、二年 refactor、全 content 一括 tuning は移植しない。次の既存 prototype 大改修で一度だけ probe し、事前に見つけた回帰と作成コストを比較して、実際に効いた欄だけを残す。

■ URL
https://developer.microsoft.com/en-us/games/articles/2026/05/art-and-science-of-evergreen-games-minecraft-candy-crush/
