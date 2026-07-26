■ 概要
StructureClaw は、LLM agent の最終回答だけを採点すると、文章は流暢でも中間工程が欠落・矛盾・実行不能な workflow を成功扱いしてしまう問題に対し、評価単位を「相互依存する artifact と実行証拠の chain」へ移した構造工学向け workbench と benchmark である。構造解析の依頼では、要求解釈、計算可能な model、validation record、solver output、code-check record、final report が一貫して初めて完了となる。最終 report は実在する artifact だけから作られ、解析結果を主張するなら対応する solver invocation と result が記録されていなければならない。

workbench は ReAct loop、domain skill、typed tool、shared model protocol、OpenSeesPy 等の local backend、永続 artifact state を組み合わせる。skill の記述だけでは計算を実行できず、provider の存在と model の妥当性を確認して初めて tool-controlled execution を行う。修正は base revision が一致する patch として加え、下流 artifact は upstream reference と provider binding を持つため、model 更新後も過去の check の根拠を黙って置換しない。

benchmark は standard workflow、interactive robustness、画像/DXF reconstruction を各50件、計150 scenario 収録し、英中各75件にする。routing、artifact、execution、安全停止、report の必須 assertion が単一 run ですべて通った時だけ成功で、partial credit と自動再試行はない。clarification が正解なら model は不要だが、安全停止には理由と solver 未実行の証拠が要る。

実験は text 10構成、multimodal 6構成、計1,800 single-attempt run。50 standard case の平均 Success Rate は generic skill 条件56.8%に対し、構造別 automatic workflow 88.6%で全10構成が改善した。ただし routing、prior、artifact expectation、validation guidance をまとめて変える system-level 比較である。

generic 条件では model artifact は92.0%に存在したが、fixture と一致したのは70.5%で、automatic は90.8%へ上げた。一方、interactive 平均91.0%に対して invalid numerical value は70.9%。multimodal も構造認識93.6%、skill 選択96.4%に対し model match 84.7%だった。さらに continuous-beam は generic 96.0%からautomatic 76.0%へ逆行し、全体改善が局所 regression を隠すことを示した。

■ 内容分析
強みは、自己申告や最終 file の存在ではなく工程間 handoff を検査する点だ。workflow、model、validation、provider invocation、code check、report claim が参照で結ばれ、「model はあるが条件が違う」「solver 風の文章だけ」「report が古い結果を引用」を局所化できる。completion、clarification、safe stop、unsupported を別 terminal state にした点も重要である。

全 assertion の積を primary metric にすることで、routing と report の点数で solver 未実行を相殺させない。assertion-level score は診断専用に残すため、総合88.6%より、artifact existence 92.0%と consistency 70.5%の差、invalid-value 70.9%、認識と再構築の差が次に直す工程を示す。

ただし trace は正しさの証明ではない。fixture と異なる離散化でも同等な model はあり得る。multimodal comparator は model 数、座標 span、概算 load を見るが、完全 topology や部材 connectivity は検査しない。solver invocation があっても adapter、unit、数値実装は別問題で、完走は code compliance を意味しない。

automatic と generic の31.8 point差も、specialized skill の因果効果とは断定できない。複数要素を同時に変え、各 configuration-scenario は1回だけで、小 subset は統計的順位付けに足りない。continuous-beam の20 point低下は、専門化が平均を上げながら特定 family に共通の誤前提を注入し得る反例である。したがって改善の単位は leaderboard の総点ではなく、「どの handoff failure を直し、他 family を悪化させなかったか」であるべきだという論文の結論は妥当である。

■ 自分達の環境への適用
ゲーム制作 cycle の completion gate を、最終画面や commit の存在から evidence chain へ広げられる。要求 artifact、設計仮説、playable build、headless trace、test result、human playtest、change record を revision 付きで結び、各 claim がどの実行結果に基づくかを明示する。たとえば「到達可能」と書くには同一 build hash の traversal result、「前版より良い」と書くには比較対象 build、固定条件、観測 metric、実プレイ評価が必要になる。古い trace を新しい build の根拠として再利用することを dependency fingerprint で止める。

最小 probe は既存 game 一つに、対象 build revision、headless の exit code・seed・trace、trace と build hash の一致、変更後 screenshot、最終判定から各 artifact への参照を要求する。合否は all-required、failure は requirement、build、playtest、report に分解する。面白さは自動 assertion に閉じず、実プレイ原文と判断を evidence にする。

negative case には壊れた数値、欠落 asset、矛盾条件、未対応 platform、古い test result を入れ、clarification、safe stop、unsupported を選べるかを見る。数値範囲、unit、NaN、負値、revision mismatch は deterministic check し、停止理由と command 未実行も確認する。

記憶では raw source、candidate、分析 receipt、投稿、Slack evidence を結ぶ。`status: posted` だけで完了にせず、permalink、char count、本文 hash、source URL、gate receipt が同じ revision を指すことを確認し、frontmatter と実投稿のずれを検出する。

全制作物を重い schema に入れると証拠作りが主作業になる。まず build→headless、headless→判定、candidate→Slack の三 handoff だけで不整合数、調査時間、false rejection を測り、有効な別解を拒否したら equivalence rule を見直す。

■ メリット・デメリット
メリットは、最終回答では見えない内部矛盾と未実行を発見できること、古い結果の流用を防げること、安全停止を正の能力として評価できること、failure を工程別に修正できることだ。全体平均と family 別 regression を併記する設計は、改善で別領域を壊す事故を release 前に見つけやすい。

デメリットは、assertion と fixture 自体の盲点がそのまま評価の盲点になること、all-pass が些細な欠落にも硬すぎること、同等な別解を誤って落とすこと、artifact 記録の運用費が増えることだ。論文の構造工学 fixture をゲームの創造性や面白さへ直接移植できず、1回実行の小 subset から model 順位や因果を確定できない。

■ 判定
部分採用。revision 付き evidence chain、実行 record に基づく claim、明示的な安全停止、all-required completion と段階別診断は採用する。150 scenario 規模の benchmark や厳密な工学 schema は持ち込まず、三つの高リスク handoff の小さな assertion suite から始め、誤検出と制作負荷も同時に測る。

■ URL
https://arxiv.org/abs/2607.14896
