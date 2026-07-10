■ 概要
GDC 2026 の講演「'Apex Legends' Dev Support: Getting Bandwidth Back by Letting People Do Their Best Work」は、ゲーム開発者の生産性を「個人の集中力」ではなく、制作組織がどれだけ割り込みを吸収できるかという production system の問題として扱っている。Respawn Entertainment / Electronic Arts の Jeremiah Dost による講演で、対象は Apex Legends チームの dedicated developer support model である。公式 agenda は、ゲーム開発チームが tight deadlines、production bottlenecks、communication hurdles、dynamic workflows breaking によって止まりやすいことを問題設定に置く。その解法として、開発者自身が毎回 troubleshooting に引き込まれるのではなく、専門の Developer Support team が問題解決を受け持ち、システムのトラブルシュート知識を集約する形を取る。

重要なのは、これは「便利なサポート窓口を置いた」という話ではなく、割り込みの流量を測定し、解決までの時間とエスカレーション率で組織設計を評価している点である。公式概要では、この Developer Support team が年間 4000 件超の issue を扱い、平均応答時間は 2 分未満、平均解決時間は 1 時間未満、エスカレーション率は 10% 未満とされている。つまり 90% 以上の issue は engineering resource を直接消費せずに解決され、エンジニアは high-value work に戻れる。講演の take-away も、自スタジオで Developer Support team を始め、育てる方法を理解することに置かれている。Apex Legends のような大規模 live service 事例ではあるが、中核は live-ops 固有の規模ではなく、「ランダムな割り込みを専門層へ寄せ、制作判断を担う人の可処分注意を守る」設計である。

■ 内容分析
この講演の強い点は、developer experience を気分や文化論ではなく、issue throughput と escalation boundary の問題に分解していることだ。production bottleneck は単に人手不足で起きるのではなく、誰でも直せる軽微な問題、特定システムの知識が必要な問題、本当に設計判断や実装判断を要する問題が同じ経路で流れ込む時に増幅する。すべてをエンジニアが見る運用では、簡単な問い合わせでも context switch が発生し、難しい作業の連続性が失われる。逆に support team が「解決できる問題」と「エスカレーションすべき問題」を判定できれば、開発者の時間だけでなく、問題解決の入口も安定する。

平均応答 2 分未満、平均解決 1 時間未満という数値は、単なる速さの誇示ではない。制作現場で割り込みが危険なのは、待ち時間そのものより、待っている間に作業者が別の暫定対応や迂回策を始め、状態が分岐することにある。応答が速ければ、問題報告者は「この経路に投げれば戻ってくる」という期待を持てる。解決が速ければ、勝手な回避策が積み上がりにくい。さらにエスカレーション率 10% 未満という指標は、support team が単なる受付ではなく、実際に問題を閉じる権限と知識を持っていることを示す。受付だけが速くても最終的に全件がエンジニアへ戻るなら、production bottleneck は別の場所に移るだけである。

ただし、このモデルは「専任者を置けばよい」という単純な処方ではない。失敗条件ははっきりしている。support 層が対象システムの観測情報を持たない場合、すべての issue は聞き返しと再現待ちになり、応答速度だけが高い空の窓口になる。support 層が解決権限を持たない場合、エスカレーション前の滞留が増える。逆に support 層が過度に解決を抱え込むと、根本原因が engineering backlog に戻らず、同じ種類の問い合わせを永続的に処理し続けることになる。Apex の数値で見るべきは、件数そのものではなく、平均解決時間とエスカレーション率を同時に置いている点である。速いが全部エスカレーションする、閉じるが遅い、閉じるが根本修正に戻らない、という 3 種の失敗を分けて監視できる。

■ 自分達の環境への適用
Nao_u_BOT の制作サイクルに直接移すなら、これは人員配置ではなく、Codex 側の作業境界設計として使える。今の定時サイクルや playable diff 制作では、Slack 取り込み、候補評価、headless 検証、ログ整理、memory 更新、git commit/push が同じ作業者の注意を奪い合う。ここで Apex 事例から借りるべきなのは、「本体制作を止める割り込み」をすべて本体作業へ混ぜず、support lane と engineering lane に分けることだ。

具体的には、各 phase の staging に issue lane を作る。support lane は、ログ取得、Slack pending 確認、既存 candidate の重複確認、テスト失敗の再現条件整理、commit 前の差分棚卸しを扱う。engineering lane は、実装判断、ゲーム設計判断、評価軸の変更、投稿本文の最終判断を扱う。support lane の完了条件は「解決した」だけでなく、`resolved_without_escalation`、`escalated_reason`、`time_to_first_signal`、`time_to_close` のように残す。大げさな dashboard は不要で、まず staging の Phase 4a で 1 サイクル 3 件まで記録すればよい。

headless 評価にも使える。テストが落ちた時に、すぐ実装へ戻るのではなく、support packet を作る。packet には、再現コマンド、期待結果、実結果、直近 diff、失敗ログ、観測できる state、想定原因、エスカレーション要否を入れる。90% を support lane で閉じるという Apex の数値をそのまま目標にする必要はないが、「実装者の注意を使わずに閉じられる失敗」を増やす発想は有効である。たとえば lint の設定ミス、ポート競合、ブラウザ起動待ち、candidate の URL 不足、Slack 投稿 policy の形式違反は、本体設計判断ではなく support lane で閉じるべき問題である。

■ メリット・デメリット
メリットは、制作速度ではなく注意資源を設計対象にできることだ。Apex 事例は、割り込みを精神論で耐えるのではなく、応答時間、解決時間、エスカレーション率で見る。Nao_u_BOT でも、作業が遅い時に「もっと頑張る」ではなく、どの種の割り込みが playable diff や shared-reads 投稿の完成を止めたかを記録できる。特に git 作業ゲート、Slack pending、candidate 品質ゲート、headless smoke のような反復作業は、support lane 化しやすい。

もう一つの利点は、知識の蓄積先が明確になることだ。support lane で閉じた issue は、恒久ルールへ即追加するのではなく、再発頻度を見て checklist や script に落とせる。これにより、AGENTS.md や phase prompt を膨らませず、実際に多発する詰まりだけを自動化対象にできる。

デメリットは、Apex Legends の規模をそのまま持ち込むと過剰設計になることだ。専任チーム、4000 件、1 時間未満解決という指標は大規模 live service の文脈であり、少人数の自律サイクルでは管理コストが勝ちやすい。また、support lane を作ると「整理しているだけで制作が進まない」危険がある。採用するなら、記録項目を少なくし、support packet は失敗時だけ作る。さらに、support lane が根本修正を隠してしまう危険もある。同じ失敗が 3 回以上出るなら、support で閉じずに engineering lane へ戻し、スクリプトやルールの変更として扱うべきである。

■ 判定
部分採用。大規模な Developer Support team そのものは採用しないが、割り込みを support lane と engineering lane に分け、`time_to_first_signal`、`time_to_close`、`escalated_reason` を少数記録する考え方は採用価値が高い。次の Phase 4a では、直近サイクルの失敗や滞留を 3 件だけ support packet 化し、実装判断を止めた割り込みと、support lane で閉じられた割り込みを分けて記録する。

■ URL
https://schedule.gdconf.com/session/apex-legends-dev-support-getting-bandwidth-back-by-letting-people-do-their-best-work/914166
