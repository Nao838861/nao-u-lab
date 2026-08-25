■ 概要
この論文は、embedding cosine similarity の固定 threshold gate が、「二文は同じ意味か」ではなく主に「語彙がどれだけ変わったか」を測るという構成概念妥当性を監査する。semantic cache、deduplication、drift guard、answer grader は高 cosine を意味保存とみなすが、命令の反転は not の追加、must→should、数値変更のような minimal edit で作れる。一方、意味を保つ自然な言い換えは多くの語を替えるため、表層が近い違反を承認し、遠い同意を拒否する gate になり得る。

中心は decision（同じ／反対）× lexical overlap（近い／遠い）の 2×2 factorial corpus である。二 task、各 10 anchor、各 cell 10 pair の計 80 pair を作り、全 cell が anchor を共有する。encoder を見ずに生成し、decision class 内の token-Jaccard を anchor ごとに揃えることで、目的の decision agreement と交絡する overlap を同じ pair 群で分けて測る。seven checkpoint 由来の nine configuration と production の exact path を監査した。

naive 比較は high-overlap reversal と low-overlap faithful rewrite を比べるため、18 configuration-task cell 中 13 cell で decision AUROC 0.000、全 cell でも最大 0.040 と逆転した。overlap を揃えると stratified AUROC は 0.440～0.815 に戻る。一方、positive control の lexical 軸は全 configuration・両 task で 0.975～1.000。noise ではなく、cosine が overlap をよく測り、decision は不均一にしか測らない結果である。

強い configuration は matched-overlap の reversal と paraphrase を AUROC 0.79～0.90 で分離した。しかし最適 threshold は lexical stratum 間で 0.11～0.56 も移動する。実運用由来の五 threshold を使う 90 cell の balanced accuracy は中央値 0.525。production guard は意味を壊す 56 mutation を一件も検出せず、「投与しない」から「投与する」への反転も cosine 0.9608 で承認した。

単純な修理も held-out では失敗した。最良 encoder swap は 0.485／0.433、cosine と Jaccard の conditioned gate は in-sample 0.750 から別 authoring session の 0.533、NLI も 0.831 から 0.533 へ落ちた。embedding が無価値なのではなく、cosine-only threshold に decision agreement の権限を与えず、反転 class を含む matched-pair audit を構成ごとに行うべき、という結論である。

■ 内容分析
強みは、negation への弱さを列挙するだけでなく、評価 corpus が誤結論を作る機構を示した点にある。自然な reversal は token-Jaccard 約 0.715、faithful rewrite は約 0.062 になる。naive corpus では decision と overlap が反相関し、cosine が lexical signal を正しく拾うほど decision AUROC は 0.000 に近づく。representation 単体でなく corpus design との積で起きるため、交絡を残して encoder だけ替えても直らない。

factorial design は decision agreement と overlap を同一 anchor 上で直交させる discriminant validity test である。positive control で lexical 軸をほぼ完全に回収したため、「小標本で何も測れない」とは言いにくい。decision 軸のばらつきは、極性情報が皆無なのではなく configuration と input regime に依存し、単一 global threshold へ圧縮すると失われることを示す。

negative result も重要である。conditioned gate は自作 corpus で 0.750 まで改善したが、別 authoring session で 0.533 に崩れた。著者自身も reversal が rewrite より embedding を 2.6～10.3 倍動かしにくいという claim を作った後、overlap の anti-match と判明して撤回した。注意深さでなく authoring context を跨ぐ設計が必要だという実例である。

ただし各 cell 10 pair、single annotator、一つの短文 register である。end-to-end 監査は一 system で、多くの per-stratum CI は chance を跨ぎ、人間 replication もない。「全 embedding gate が失敗する」でなく、「妥当性の証拠なしに cosine threshold を意味判定として扱えない」が支持範囲である。

■ 自分達の環境への適用
危険なのは、仕様、design intent、player feedback、memory atom の「似ている」を同じ判断と解釈する箇所である。「boss は 3 回被弾で倒れる／倒れない」「移動速度を 20% 下げる／20 下げる」は文字列が近くても条件が反転する。cosine は検索や clustering の補助に留め、仕様一致、重複確定、regression pass、directive supersede を単独で決めさせない。

実際の設計文、test assertion、feedback から 20 anchor 程度を選び、高／低 overlap × 同じ／反対判断の四 cell を作る。反転は否定だけでなく、must→should、上限→下限、増加→減少、AND→OR、数値・単位・entity・例外範囲の変更を含める。作成者、session、prompt を分けた held-out set も用意する。

評価は各 overlap stratum の reversal recall、faithful rewrite recall、balanced accuracy、AUROC、false merge、false drift を出す。現行 encoder と threshold は凍結して測り、tuning は training corpus 内に限定する。component test には表層を保つ反転と、表層を替える同意の両方を置く。duplicate preflight は高 cosine だけで skip せず URL を確認し、memory recall は関連候補の提示に留める。

重要 gate は polarity、modality、quantity、unit、actor、object、scope、exception を構造化し、parser や schema comparison で deterministic に照合する。含意が残る場合は pair-level judge を使うが、mutation class ごとの test と human spot check を持たせる。cosine の権限を surface-form retrieval に狭め、decision agreement は別 evidence に接地する。

■ メリット・デメリット
メリットは、安価で広く使われる similarity gate を、実装名ではなく測定器として監査できることだ。2×2 matched design は小さく offline で再現でき、encoder、prefix、dimension、threshold、task のどこで失敗したかを分離できる。false merge と false drift を同時に測るため、単なる negation test より運用判断に近い。自分達の仕様回帰、候補重複、記憶検索にすぐ転用できる。

デメリットは、domain ごとに anchor、mutation taxonomy、held-out authoring set を作る手間があり、小 corpus に合わせ過ぎると同じ失敗を再生産することだ。NLI や強い encoder への置換も自動解決ではなく、別 register、長文、複数条件、暗黙の例外で再監査が必要になる。論文の deployed failure 一例や 56 mutation、80 factorial pair だけから普遍的な failure rate は出せない。また cosine の利用を全面禁止すると、安価な retrieval・近似候補提示という本来得意な用途まで失う。

■ 判定
部分採用。cosine は関連候補を絞る signal として残すが、意味保存、仕様一致、重複確定、受入 pass を単独で決めさせない。ゲーム仕様と記憶 lifecycle から 2×2 corpus と別 authoring session の held-out set を作り、reversal recall と false merge を測る。重要 field は deterministic comparison、残る意味判断は pair-level review へ分離する。

■ URL
https://arxiv.org/abs/2608.10216v1
https://github.com/eigenforma/polaritycheck
