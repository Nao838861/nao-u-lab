■ 概要
対象は “Dynamic Agent Skills: A Lifecycle Survey and Taxonomy of Evolving Skill Libraries”。LLM agent が model 外へ保存し、後の task で検索・実行する「skill」を、固定 prompt 集ではなく、成長・劣化・修復する library として捉え直す。2023〜2026年の124論文を対象に、code、自然言語 lesson、SKILL.md、workflow graph、adapter など異質な artifact を横断している。

整理の第一段は six-sense taxonomy で、実行可能 code、自然言語 heuristic、SKILL.md package、parametric adapter、memory / trajectory、capability label を区別する。重要なのは形式ではなく、外部から呼べるか、再学習なしに編集・移植・監査・検証できるかである。Python function でも、trajectory から改訂し、test と lineage を伴って後で修復するなら dynamic skill になる。

第二段は eight-stage lifecycle で、interaction からの evidence acquisition、更新案の proposal、verification / admission、storage / organization、retrieval / composition、maintenance / repair、distillation / portability、governance を一つの循環として扱う。skill record には適用条件、実行本体、終了条件、interface に加え、edit 方法、verification evidence、version lineage が必要だとする。library の変更は Add、Refine、Merge、Split、Prune、Distill、Abstract、Compose、Rewrite、Rerank の ten operators で記述する。成長だけを許す append-only store は学習ではなく、誤った skill を降格・統合・削除する負の operator が不可欠だ、というのが中核的な主張である。

評価は横断 leaderboard を作らず、controlled ablation、単一 study、benchmark 上の収束、architecture 上の裏付けを A〜D に分ける。そこから、admission gate 付きの curated skill が強い、skill-aware RL は verifier 品質に左右される、flat retrieval は約100 skill でも悪化し得る、focused library が網羅型を上回る場合がある、規模が増すと maintenance が性能を支える、write-time の抽象化が効きやすい、という七つの pattern を抽出する。ただし異種 model・task・evaluator の pooled effect ではない。結論は、検証・検索・修復・provenance・rollback を含む時間変化として library を評価せよ、である。

■ 内容分析
この survey の価値は、skill の生成精度より library transition を分析単位にした点にある。個々の手順が正しくても、library 全体では重複、競合、古い interface、検索 distractor、誤った合成が増える。そこで proposal と admission を分離し、agent が良さそうな修正を書いたことを採用根拠にしない。実行可能 code なら unit test、contract、sandbox rollout を使えるが、自然言語 lesson は judge や下流 utility に頼る。この artifact–verifier coupling を明示したことで、すべてを同じ markdown schema に揃えるだけでは検証強度が揃わないことが見える。

評価 audit も具体的である。endpoint success だけでは skill inflation、incorrect-skill drift、maintenance-off collapse、呼び出されたが役に立たない skill を隠す。trajectory-aware evaluation として、task index ごとの性能・skill 数・retrieval 品質、各 operator の速度、distribution drift、maintenance-off ablation を要求する。SkillFlow-Bench は166 task・20 family で発見、patch、repair、reuse、cost、skill 数、利用率を追うが、family ごとに library を reset するため、異種 workflow が共存する global library は未評価である。「使われた」と「結果を改善した」は別 metric でなければならない。

弱点も明確である。124本のうち103本が2026年で、締切は2026年5月31日。snowballing による arXiv-heavy な corpus で、網羅検索ではない。code、lesson、graph、adapter、memory が混在し、因果主張は主に個別論文内の ablation に限られる。約100 skill での retrieval 劣化にも storage topology を固定した共通 benchmark はない。taxonomy は完成仕様ではなく audit frame である。

安全性も admission 時だけで閉じない。悪意ある package、description による検索誘導、stdout 経由の secret 漏洩、安全な skill 同士の危険な composition、Merge / Rewrite 後の attribution 消失を別 surface とする。scanner 一個ではなく、manifest、repository provenance、request-conditioned invocation check、runtime containment、operator 履歴、release gate、rollback の組合せが要る。

■ 自分達の環境への適用
制作手順・評価 probe・memory atom を一律に「残す知識」とせず、実行可能 skill へ昇格する条件を分ける用途に使える。再利用候補は build / launch、固定 seed の headless playtest、screenshot 比較、failure trace 分類、投稿前検査である。一度の成功では採用せず、source、適用条件、期待出力、検証 command、失敗条件、supersedes、rollback 先を持たせる。

最小導入は high-frequency な手順 3〜5件だけでよい。各利用について retrieved、executed、outcome_improved、failure_tag を記録し、利用率と効用を分ける。2サイクルごとに Add / Refine / Merge / Prune の件数、検索 top-k に正解が入った割合、古い手順の誤適用数を見る。比較条件は lifecycle 付き library と現状の flat search、さらに maintenance を止めた条件である。差が出なければ schema を全 memory へ広げない。この小さな ablation なら、survey の大規模 framework をそのまま移植せず、記録負荷に対する実効性を測れる。

verifier は artifact に合わせる。build 手順は exit code、操作 skill は固定 seed の trace、視覚 lesson は screenshot と人間確認、Slack 投稿は policy check と投稿後照合を使う。自然言語の「良い手順」を code test と同格に扱わない。誤検索時は query と distractor を残し、focused subset と Rerank を比較する。

■ メリット・デメリット
メリットは、作成・検索・修復・廃止を同じ lifecycle で追い、proposal と採用を分離し、利用回数ではなく結果改善で skill を評価できること。operator vocabulary は追加偏重か統合・削除まで回るかを可視化し、provenance と rollback は複数 consumer を壊した時の復旧にも効く。

デメリットは、survey 自体が統一実験ではなく、個々の evidence を taxonomy で束ねた研究であること。eight stages と詳細 schema を全 artifact に要求すると、実行より metadata 更新が主作業になる。頻度の低い例外を hard admission で落とす危険もあり、focused library は task 分布が変わると急速に古くなる。検証不能な文章 skill に LLM judge を置くだけでは、誤りを権威化する可能性が残る。外部 skill の共有は供給網、秘密情報、権限、合成時の危険を増やすため、自動 install や自動昇格には使わない。

■ 判定
部分採用。eight-stage lifecycle を新しい巨大ルールとして一括導入せず、高頻度で検証可能な制作・評価手順 3〜5件に、admission evidence、利用と効用の分離、lineage、repair / rollback を付ける。2サイクルの paired evaluation で retrieval と再利用結果が改善した場合だけ対象を広げる。特に採用価値が高いのは、保存数ではなく library trajectory と maintenance-off 条件を見る評価設計である。

■ URL
https://arxiv.org/abs/2607.10113v1
https://arxiv.org/html/2607.10113v1
