■ 概要
対象は ELI の開発者 Special_Cog が公開した「Postmortem: Release 2026-06-15」。一人開発者が、一人・一台・一アカウントで、自分が正解手順を知り尽くした状態だけを試すことを「最悪の QA 環境」と認め、友人が実際のゲーム運用に使う場と、別の初見利用者が触る場を観察した記録である。ここで見つかった重大障害は、個々の機能の内部より、offline から synced account、world から別 world、既知ユーザーから初見ユーザー、一台目から二台目へ移る継ぎ目に集中していた。

最大の不具合は entity template の保存拒否だった。ELI は作成データへ owner id を付ける。offline から account を取得した時、entity の owner は local device id から account id へ付け替えていたが、template は変換対象から漏れていた。そのため ownership check が旧 id を拒み、template が保存できず、template data に依存する relationship の添付まで別症状として壊れた。修正は account adoption 時に template も relabel し、変換件数を log へ出すこと。元を直すと relationship も回復した。

他にも、列幅計算が各列を精密値と丸め値で二重加算し、entity table が実幅の二倍と誤認して空白へ scroll する問題があった。world 終了時は main window の tab だけを消し、detached floating window を破棄しないため、前 world の画面が ghost として残った。Author Mode の link は接続自体が空で、tooltip loader は Godot 4.0 で削除済みの API と存在しない template file を参照していた。一方、relationship graph を pan できないという報告は実装故障ではなく、中ボタン操作を発見できない問題だった。二台目の sync では Tailscale の network 参加と identity 設定を既知と仮定しすぎていたため、host setup を段階検証し、shared world 参加時には current state を自動取得する流れへ変えた。

評価は統制実験ではなく、実利用者二名と実機による観察型 postmortem である。発見件数や修正前後の時間は定量化していないが、各項目で症状、原因、修正を対応づけている。結論は「test を増やす」だけではなく、作者が自然には通らない状態遷移を、初見の人と別 hardware で実際に踏む必要がある、というものだった。

■ 内容分析
この記事の核は、QA の試験単位を feature から transition へずらすことにある。template editor、relationship、world window、sync を別々に green にしても、offline data の所有権を online identity へ移す migration、world teardown、別端末の初回 join が仕様化されていなければ、組合せた利用経路は壊れる。特に owner id 漏れは、一つの不変条件「account adoption 後は、その利用者が作った全 object の owner が新 id と一致する」を entity だけに適用した失敗である。relationship まで壊れたことで、画面上の症状数と根本原因数が一致しないことも示す。

floating window の leak は UI lifecycle の問題として読むとよい。world close の完了条件を「main tab が消えた」に置いたため、別 top-level window が lifecycle 管理外になった。修正も全 window の teardown に加え、restore 後に有効内容がない window を捨てる safety net を置いている。入口と出口の両側に不変条件を置く設計であり、scene change、save load、run restart にも通用する。

また、middle mouse pan は binary な bug 判定の危うさを示す。code 上で操作可能でも、初見利用者が affordance、cursor、help から発見できなければ体験としては失敗である。ただし修正内容は「discoverability is on the list」に留まり、具体 UI と再評価は未完了である。sync onboarding も作者自身が最も未完成だと述べる。したがって、この記事を完成した QA 手法や成功事例として扱うのは強すぎる。価値は、少人数の観察から seam failure を原因単位で採録した点にある。

限界も明確で、対象は ELI という local-first の制作 tool であり、ゲーム本体の frame timing や balance は評価していない。利用者は二名で、OS や回線条件の matrix、再発率、修正後の follow-up 結果もない。Tailscale を含む外部依存の障害と ELI 自身の障害の境界も完全には分離されていない。再現可能な test suite は記事から別途設計する必要がある。

■ 自分達の環境への適用
ゲーム prototype では、機能一覧とは別に seam matrix を一枚持つ。行を save slot、scene、window、input device、process lifetime、build version、network state、列を before / transition / after とし、各遷移で保持すべきもの、破棄すべきもの、自動 migration すべきものを明記する。例えば「初回起動→再起動」「title→play→title」「keyboard→gamepad」「windowed→fullscreen」「旧 save→新 build」「一台目→別 machine」を最低組にする。

headless test では、各機能の成功だけでなく遷移後の不変条件を assert する。world change 後に旧 scene の node、timer、audio、window、input capture が残らないこと、save migration 後に全 object の schema version と owner が揃うこと、restart 後に同じ seed の deterministic state が復元されることを数える。障害が複数画面へ出ても、failure signature を dependency graph で束ねれば、template ownership と relationship のような同根事故を重複修正しにくい。

人間の観察は headless の代替ではなく別の sensor とする。作者が説明せず、初見 tester に短い目的だけ渡し、最初の停止、誤操作、help を探した箇所、実装済みなのに発見できなかった操作を timestamp で残す。ここでは「操作できたか」と「操作を見つけられたか」を別欄にする。小さな probe なら、現在の prototype 一つに対し、既知担当者の通常 run、初見一名の run、別 machine の clean-start run の三経路を録画し、seam failure と discoverability failure を分離できる。

記憶システムにも同型がある。raw から atom、candidate から posted、local path から Slack permalink へ状態が変わる時、本文だけでなく provenance、status、index、evidence が同時に移る必要がある。各 loader 単体が動くかではなく、dual-write→fallback read、post→index rebuild、stale→review の遷移後に参照整合性を検査する方が、この記事の教訓に忠実である。

■ メリット・デメリット
メリットは、少人数でも試せ、網羅表を作る前に高価値な継ぎ目へ焦点を当てられること。機能別 test では見えない migration、teardown、復元、外部 service onboarding を拾える。症状と原因を分けるため、一原因から複数症状が出る障害にも強い。初見観察を入れることで、code の正誤と affordance の失敗を混同しにくい。

デメリットは、協力者と実機を必要とし、状態組合せが増えると matrix が急速に膨らむこと。観察者が横から説明すれば初見性が壊れ、少数事例を一般化すれば rare path を見落とす。記事自身には coverage、severity、再発防止 test、修正後比較がないため、そのまま手順書にはできない。全遷移を人手で踏むのではなく、ownership や teardown は deterministic test、発見可能性は人間観察、外部 network は少数の実機 smoke test に分担する必要がある。

■ 判定
部分採用。採用するのは feature checklist と別に transition seam を試験単位へ置くこと、遷移後の不変条件を assert すること、実装故障と discoverability failure を分けること。二名の定性的事例を普遍的 QA protocol とは見なさず、まず一つの prototype で三経路の seam probe を行い、再現した failure だけを regression test へ固定する。

■ URL
https://special-cog.itch.io/eli/devlog/1561972/postmortem-release-2026-06-15
