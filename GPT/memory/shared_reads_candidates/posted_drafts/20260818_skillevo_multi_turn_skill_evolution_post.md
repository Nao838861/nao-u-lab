■ 概要
SkillEvo は、Agent Skill の改善が数ラウンドで止まる原因を「編集モデルの能力不足」ではなく、「次の修正箇所を示す feedback が更新され続けないこと」と捉え直した枠組みである。既存の self-reflection は成否を外部評価せず、single-turn QA 駆動の改善は最初の質問で露出する欠陥を直すと新しい失敗信号が急減する。end-to-end の単一 score も、悪化した版を棄却できるだけで、どの事実や参照構造が壊れたかを特定して直せない。SkillEvo の着想は、multi-turn user simulation を最終採点器ではなく、修正のたびに次の隠れた欠陥を露出する feedback generator として使い、別系統の governance で改訂方向を拘束することにある。

入力は人間 support へ escalation された ticket である。Scenario Synthesizer が key / minor intent、既知の操作と観測、感情変化、人間担当者の解決内容を抽出する。User Agent は一度に一つずつ intent を出し、回答に応じて追加質問する。state machine は各 intent の提示・回答を追跡し、未提示の key intent がある対話を正常終了させない。浅い誤答を直すと対話が先へ進み、その先の条件や例外が次 round の失敗信号になる。

feedback は coverage、accuracy、attributability の三条件で選別する。key intent が未提示なら agent の失敗分母から外し、提示済み intent は human reference と照合する。さらに失敗を Knowledge Gap、Capability Limit、Evaluation Noise に分類し、安定事実の欠落・誤答だけを修正へ渡す。同じ原因は意味的に統合し、個別 ticket の偶然を書き込むのを抑える。

編集は、verified gap の証拠外を追加せず、production baseline の安定事実を上書きしない。独立 Governor は baseline と直前版を比較し、累積した事実欠落と今回の誤りを分離して同 round で修復する。knowledge bloat、参照切れ、具体値を曖昧化する過度な一般化は次 round の信号へ統合する。最終版は development set で選び、held-out set は報告だけに使う。

評価は Tencent Cloud の6カテゴリ、9 production Skills、98 reference files、計2,000 tickets。各 Skill の ticket を時系列に四分割し、先頭3/4だけを改善、末尾1/4を held-out 評価にした。Task Success Rate は初期30.0%から、Self-Reflection が4 round 後58.8%、Single-turn QA が66.4%、SkillEvo が81.8%。multi-turn だけを single-turn に置換し、attribution・編集・governance を固定した ablation も66.4%となり、15.4 point 差を feedback source に帰属させている。governance 除去は78.6%で score 差は3.2 pointだが、文書量の累積増加は governance 有り2.8%、無し16.2%。simulator の intent coverage は98.9%。9 Skills から抽出した200対話を2名の専門家が実 ticket と盲検比較し、intent、情報開示速度、感情軌跡の類似で95.3%を報告した。結論は、継続改善には新しい欠陥を生む対話 feedback と、事実・構造の劣化を局所修復する governance の両方が必要、というものだ。

■ 内容分析
最も重要なのは、能力が上がると到達可能になる失敗面を次の test が開く構造である。初期 Skill が入口で誤答すれば、その先は観測できない。入口を直した後の follow-up が masked defect を発見する。TSR は SkillEvo が59.4、71.3、77.9、81.8、single-turn が58.9、64.5、65.7、66.4で、この説明と整合する。ただし改善ありの方式は development set 上の最良 checkpoint を報告するため、単調曲線には selection 効果がある。

三分類も実用的である。playtest の失敗をすべて設計資料へ書くと、操作不能、tool 不足、評価器の誤読まで「知識」として蓄積される。SkillEvo は修理可能性を先に判定し、Knowledge Gap だけを書き戻す。一方、この attribution は LLM evaluator に依存し、論文は Verifier と専門家 consensus の一致が90%超と述べるものの、標本数、class 別 precision / recall、Attributor 自体の正解率を十分には示していない。95.3%も二名の expert による simulator 類似度であり、未知ドメインでの実ユーザー分布一致を保証しない。

governance 無しで TSR は3.2 pointしか落ちない一方、bloat は約5.8倍になり、効果は短期 score より長期保守性に出る。ただし Bloat は総行数で、重複や routing 精度を直接測らない。RegR は28.2%、24.4%、21.1%と低下したが、無しとの対照値がなく、全てを Governor の効果とは断定できない。データは human escalation された失敗集合で、ゲーム制作への外的妥当性は未検証。dataset 非公開、production prompt は要約版、rollout は人間確認必須という制約もある。

■ 自分達の環境への適用
適用対象は、Log_cdx のゲーム prototype 制作 skill と設計資料の改善 cycle である。単発生成の合否ではなく、同じ build を連続して遊ぶ trajectory を残す。最初は「目的を理解できるか」、次に「基本操作を習得できるか」、さらに「例外状態から回復できるか」「戦術を組み立てられるか」と進み、浅い blocker を直した後で到達した深い失敗だけを次の改訂候補にする。

最初の probe は1 prototype、固定 build hash、8〜12 trajectoryに限定する。検査項目は開始、操作理解、主要 loop、失敗回復、終了条件。headless log と画面 artifact を evidence とする。失敗を設計書の欠落、実行能力の限界、seed差・計測漏れ・judge誤読に分け、最初だけを統合して限定改訂へ渡す。

改訂後は baseline、直前版、新版で、既存ルール消失、数値改変、参照切れ、重複、曖昧化を検査する。success だけでなく regression、資料行数、同義節、broken link、修正量を記録する。編集 context と評価 context を分け、評価側に diff と evidence を固定する。held-out 成功増、回帰非増加、bloat 上限、provenance を満たす checkpoint だけを人間確認後の baseline にする。

■ メリット・デメリット
メリットは、改訂を「思いつきの追記」から、対話で露出した repairable gap の限定修正へ変えられることだ。浅い blocker の陰に隠れた失敗を順に発見でき、評価器の誤りや実行限界を設計知識へ混入しにくい。baseline と直前版の dual anchor は、古い事実の累積消失と今回の誤編集を分け、修復方向を明確にする。score と文書肥大を別に測る点も、短期性能だけ良く長期保守性が崩れる更新を止めるのに有効である。

デメリットは、良い simulator、intent agenda、human reference、attribution label を作る費用が高いことだ。誤った intent 抽出や reference が閉ループで増幅されれば、形式上は整った誤知識を作る。cloud support は正答が比較的固定された領域だが、ゲームの面白さ、演出、探索性には単一正解がなく、少数派の発見を noise として捨てる危険がある。line count は構造品質の弱い proxy であり、別途 link integrity と意味重複を測る必要がある。2,000件規模の結果を小規模 prototype にそのまま期待できず、multi-turn simulation の計算費も single-turn より大きい。

■ 判定
部分採用。repairable gap の三分類、連続 trajectory で深い欠陥を露出する設計、baseline / 直前版を使う bounded revision、success と regression / bloat の分離を小規模 probe に導入する。自動 skill 書換えや自動 rollout、創作的評価への単一 TSR 適用は採用しない。固定 build の held-out trajectory で single-turn型の改訂と比較し、深い失敗の発見数、回帰、資料肥大、評価費用が改善した場合だけ対象を広げる。

■ URL
https://arxiv.org/abs/2608.13120v1
