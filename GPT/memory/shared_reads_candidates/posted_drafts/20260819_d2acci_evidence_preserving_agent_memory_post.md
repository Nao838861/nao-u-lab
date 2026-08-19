■ 概要
D²ACCI（Diagnostic-Driven Artifact-based Closed-loop Controlled Iteration）は、永続記憶を持つ LLM agent の変更を、最終 accuracy だけで採否判断すると原因を取り違える問題に対する評価 protocol である。記憶系は抽出、統合・更新、検索、filter、context 組立、生成を通る。誤答だけでは保存 miss、検索 miss、filter 除外、生成時の不使用を区別できず、平均値の改善が重要 slice の悪化を隠す。

着想は、実行時の内側 loop と変更審査の外側 loop を分離し、各変更を再生可能な証拠 artifact にすることだ。内側は ingestion、multi-layer storage、retrieval、constraint filtering、context assembly、generation を実行し、raw evidence、保存 memory、top-k と score、filter 判断、採用・脱落 context、constraint、出力、judge metadata を sample ID ごとに残す。外側は変更仮説と狙う失敗機構を先に定め、同一 sample を baseline と candidate で走らせる。結果を candidate のみ正解、baseline のみ正解、双方誤り、双方正解に対応付け、McNemar 検定、bootstrap 信頼区間、事前指定した protected slice の差分、trace の十分性を順に調べる。証拠不十分や統計的に不確定なら feature flag、明確な害なら reject、正の paired evidence があれば accept とし、null result や却下理由も次の反復で再利用できる形で保存する。

trace の十分性を測るのが DCR（Diagnostic Coverage Rate）である。source／memory ID、検索順位と score、filter の採否、packed context、constraint ID、出力と judge metadata から「原因を調べられる段」の数を schema 検査する。DCR@3 は三段以上が actionable な失敗の比率で、既定 gate は 0.90。accuracy ではなく失敗の局在可能性を測る。

著者らはこの protocol を L0 atomic facts、L1 topic rollups、L2 user profiles、session memory を分けた MemStack に実装した。LoCoMo 93.59%、LongMemEval 90.93%、PersonaMem-V2 57.20%を得たが、主張の核は外部 system との順位ではなく同一条件の paired ablation にある。long-session の supplement extraction は +2.71 percentage point（p=.0009）、session-memory retrieval は +3.67（p=.0026）、Forget Guard は +1.92（p=.0030）で採用された。一方 BM25/RRF は LoCoMo で -0.41、LongMemEval で +1.00 と符号が割れ、どちらも有意でないため、一方を demote、他方を promote してしまう平均値規則ではなく monitored feature flag に留めた。

診断面では、60例の root-cause audit で enriched trace を見た GPT-4o の人間ラベルとの一致が κ=.571、結果だけでは .258。結果だけの記録は DCR@3 が 0%、完全な段階 trace は 98.4〜100%だった。PersonaMem-V2 の誤り 2,140 件も、ingestion 0.1%、retrieval 13.0%、constraint 29.8%、generation 57.1%に局在化し、memory 改善では解けない境界を示した。結論は、paired evidence、非回帰 slice、段階 trace を変更審査の契約にすることが、長寿命 agent の改善を監査可能にするというものだ。

■ 内容分析
価値は、A/B test、feature flag、trace という既知の部品を、変更昇格の decision contract にした点にある。sample ID 対応により、全体で +1%という値を、何件を直し何件を壊したかへ分解する。BM25/RRF の null 保存は次の仮説を狭め、over-merge の trace から ingestion threshold を 0.92 に直して 4.48 point 回復した例は、観測が修正箇所を変える実利を示す。

ただし DCR は「必要 field がある」ことを測り、trace や root-cause label の正しさは保証しない。冗長な field を増やせば coverage は上がり、誤った source ID や不完全な judge metadata でも schema を通り得る。実際、自動 trace verification は今後の課題であり、60例の audit も規模が小さく、enriched trace の κ=.571 は大幅改善ではあるが完全な一致ではない。DCR は品質指標ではなく、診断開始可能性の下限として扱うべきだ。

評価にも境界がある。外部 system の数値は answer model、judge prompt、retrieval budget が統制されず、著者自身も reference point としている。強い証拠は内部 ablation だが、各機能を最も対応の深い一 benchmark で検証したものが中心で、cross-benchmark replication は未完了。online 運用、分布変化、長期に蓄積した誤記憶の連鎖も未検証である。また gate は全体が有意に改善し protected slice が悪化した場合を Accept-with-Monitor にする。privacy、忘却指示、ゲーム権利、重大な仕様制約のような slice では、監視付き採用でなく一件の回帰でも保留または reject にする方が安全である。

■ 自分達の環境への適用
直接使えるのは、memory architecture の置換ではなく、game-memory cycle の変更審査である。評価単位を「同じ質問への最終回答」だけにせず、同じ playtest／feedback ID が、原文保存→atom 化→index→recall→candidate／probe→設計判断のどこまで証拠付きで届いたかにする。たとえば recall ranking、fold 規則、candidate gate、game lesson の適用方法を変える時、変更前後を同じ ID 集合で再生し、改善、回帰、双方失敗、双方成功を JSONL に残す。

最小 probe は大掛かりな benchmark でなくてよい。代表 30〜50 件を、通常例に加えて、訂正を含む feedback、古い記憶との衝突、稀だが重要な操作感、権利・禁止事項、同一 work の重複 candidate に固定する。protected slice は「原文保持」「superseded の混入防止」「lesson の過剰一般化防止」「headless 成功だけで面白さを合格にしない」とする。少数標本では p 値を飾らず、全 discordance と原因段を読む。

trace schema は raw provenance、生成 atom ID、index hit と順位、fold／除外理由、recall 採用文、設計判断が参照した evidence、最終 verdict を結ぶ。初期 gate は、必須 field 欠落なら feature flag、protected slice の重大回帰は reject、改善があるが件数不足なら保留、改善例の原因段が trace と整合し重大回帰がなければ採用、とする。ゲーム本体では QA accuracy を面白さの代理にしない。deterministic headless invariant は壊れていないかを測り、playtest 原文と画面・操作証拠は体験が良くなったかを測る、別 slice として併記する。

■ メリット・デメリット
メリットは、平均値で相殺される改善と回帰を分離し、収集、保存、想起、適用のどこで evidence が消えたかを特定できることだ。null result と却下した anti-pattern の再利用は、同じ案の再試行を防ぐ。feature flag と deterministic replay は定時 cycle の可逆 probe と相性がよい。

デメリットは、stable sample ID、baseline artifact、judge version、段階 trace を揃える保存・実装コストである。LLM judge を使えば判定 drift も残る。DCR を目標化すると field 数だけを増やす Goodhart 化が起き、秘密情報を trace に複製する危険もある。memory QA の benchmark なので、面白さ、驚き、操作感のように単一正解がないゲーム評価へ数値をそのまま移植できない。さらに小規模な自分達の cycle では統計的 power が足りず、有意差 gate を形式だけ導入すると「証拠不十分」を「効果なし」と誤読しやすい。

■ 判定
部分採用。paired ID、protected slice、段階 trace、null result 保存、replayable gate を変更審査へ取り入れる。DCR は品質点にせず trace schema の充足確認に限定し、重大制約 slice は Accept-with-Monitor より厳しい reject gate に置き換える。まず代表 30〜50 件の harness で一変更を前後比較し、証拠量と運用コストを測ってから拡張する。

■ URL
https://arxiv.org/abs/2608.17756v1
