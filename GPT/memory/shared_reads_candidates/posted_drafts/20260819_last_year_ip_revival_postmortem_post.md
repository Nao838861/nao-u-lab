■ 概要
『Last Year』は、1人の殺人鬼と5人の生存者が戦う非対称型 survival horror である。2021年に server が停止し、前 studio の破産によって一度は終了作品とみなされた。本稿は、Undaunted Games の studio head / producer Matthew Itovitch が、破産処理で売却対象になった IP と残存 asset を取得し、ゲームを再始動した過程を記した2023年の postmortem である。出発点は「新作を作る」ことではなく、死んだ運営基盤、途切れた community、継承した legacy code、過去に積み上がったプレイヤーの期待を、どの順序で復旧するかだった。

再始動の中核は三段階に分けられる。第一に、サービスの連続性を取り戻す。旧 backend の GameSparks は廃止予定だったため、Amazon と partner の Code Wizards の支援を受けて AWS へ移行し、server data と既存プレイヤーの progression を保存した。第二に、新しい creative vision を先に押し出さず、まず購入者が所有していた版を再び遊べるようにした。第三に、再公開後の bug fix と balance change を続けながら、最適化や書き直しが必要な codebase を段階的に refactor し、Unity Engine 5 への更新、character model・map の改修、quality-of-life 改善を進める。これにより、未完成の Chapter 2 asset、console 版、post-launch content へ進める基盤を先に作るという設計である。

記事が示す評価材料は、売上や retention ではなく、復旧可能性と需要の先行指標である。失われた旧 Discord は4万人以上だったが、新 server は4月2日の開設から数か月で7,000人を超え、同期間に Twitter で約3,000 followers を得た。公式再始動の発表前に community mod の trailer が約16万再生され、元開発者も新 team の onboarding に知見を提供した。結論は、旧版の回復を「将来版の妥協」ではなく、信頼と技術基盤を再建する必須の第一歩として分離することである。

■ 内容分析
この事例で重要なのは、IP 取得を「code と asset が手に入る取引」と見なしていない点である。運営型ゲームの実体は、実行ファイルだけでなく、backend data、account と progression、community の集積場所、旧 team の暗黙知、過去の約束が作った期待の束である。『Last Year』では asset と IP は破産処理の中で回収できたが、4万人の Discord は失われた。この非対称性は、バックアップの対象を repository に限定すると、作品を復元できないことを示す。

また「購入者が持っていた版を先に戻す」判断は、scope を縮めただけではない。旧バージョン間で creative direction が変化し、プレイヤーごとに「本来の Last Year」が異なる状況で、議論の基準線を作る操作である。復旧と刷新を同時に行うと、動かない原因、変更の意図、旧ファンの不満を切り分けられない。restore-first は、互換性の確認と信頼回復を先に終わらせ、その後の設計変更を測定可能にする release strategy と読める。

ただし、これは開発側による再公開直後の自己報告である。示される数字は Discord、Twitter、mod trailer の関心度であり、backend 移行後の data 完全性、server 稼働率、復帰率、concurrent users、売上、bug 減少、refactor 後の開発速度は報告されていない。Chapter 2、console 版、partner 獲得も将来計画であり、成功結果ではない。したがって、「復活は成功した」という証拠ではなく、何をどの順で復元したかを学ぶ事例として使うべきである。

■ 自分達の環境への適用
長期休止した自作ゲームや古い prototype を再始動するとき、作り直しから入らず、「復旧版」と「刷新版」を別 release に分ける。復旧版の done condition は、旧 build の主要 loop が再現される、save / progression を移行できる、旧 input と主要 content の互換性がある、既知の重大 bug が一覧化される、とする。その時点で baseline build、save migration の hash / count、headless replay の完走率、crash 数、旧版との差分を記録する。刷新版では初めて mechanic、balance、asset、engine 更新を個別に変え、どの変更が体験と安定性に影響したかを比較する。

記憶システムにも同じ分離が使える。schema 変更時に旧 atom を直接書き換えず、raw provenance と legacy reader を保ったまま dual-read / dual-write 期間を設ける。先に件数、ID、content hash、recall 結果の一致を確認し、その後に検索品質や lifecycle 構造を改良する。これは GameSparks から AWS へ移しつつ progression を保った境界と同じで、「新方式が動く」ことと「過去の蓄積を失わない」ことを別の合格条件にする。

小さな検証としては、休止 prototype を1本選び、一週間の上限で recovery manifest を作る。項目は rights / source / build toolchain / external services / save data / community evidence / original intent / known defects の8つに固定し、各項目を recovered、replaceable、missing で分類する。その後、「新規機能を入れない」復旧 build を1本作り、当時の playable evidence と headless 結果で差を確認する。これにより、再始動コストの正体が code 改修か、外部依存か、失われた文脈かを、刷新へ投資する前に分けられる。

■ メリット・デメリット
メリットは、第一に復旧と刷新を分けることで、既存ユーザーの信頼を回復しながら技術的な baseline を得られること。第二に、progression、community、旧開発者の知識を「作品の一部」と見なすため、source と asset だけの復旧で完了と誤判定しにくいこと。第三に、再公開後の小さな改修と長期の refactor を並行させ、早い feedback と将来の開発性を両立できることである。

デメリットは、復旧版が旧仕様の固定化と受け取られ、新しい設計への変更コストが上がること。また、live service を稼働しながら legacy code を書き直すと、運営対応が refactor を常に中断し、新旧両系統の互換性 test が長期コストになる。community の熱量も、支払い、継続率、開発原資を保証しない。さらに記事は、取得価格、移行費用、team size、期間、障害数、再公開後の経済性を示していない。同じ手順を採用しても、rights、backend data、build 環境、運営予算のいずれかが missing なら再現できない。

■ 判定
部分採用。「まず旧版とユーザーの蓄積を回復し、刷新は別の変更として測る」restore-first の順序と、code・data・community・暗黙知を一つの復旧対象と見なす枠組みは採用できる。ただし、この記事だけで事業的成功や refactor の完遂は判定できない。自分達では recovery manifest、復旧 build、save / recall 互換性、headless replay、再開後の保守速度を独立に測り、「戻った」と「良くなった」を別の gate にする。

■ URL
https://www.gamedeveloper.com/production/last-year-postmortem
