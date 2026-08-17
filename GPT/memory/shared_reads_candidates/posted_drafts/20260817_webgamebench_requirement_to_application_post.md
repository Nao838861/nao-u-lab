■ 概要
WebGameBench は、coding agent の評価対象を「コードや build 成功」から「固定仕様を、実ブラウザで操作できる application として届けられたか」へ移す benchmark である。既存 benchmark は関数、repository の test や patch、既存環境での操作を主に測る。しかし新規 application は、install・表示できても、入力、座標、得点、勝敗、restart が壊れ得る。そこで評価単位を source や生成過程でなく、配信物の observable runtime behavior に置く。

各 task は、目的、画面遷移、操作、object、rule、state、feedback、配信制約、受入条件を記した frozen Structured WebGame Specification だけを agent に渡す。agent は共通環境で一度だけ実装し、build・local serve した URL を残す。runtime evaluator は同じ仕様を使い、Playwright 経由で Chrome を操作する。load、開始、main state の後、入力、空間対応、rule、score・resource、状態遷移、終了、restart を実操作で検証する。source や内部 state は診断用で、成功の証拠にはしない。結果は、主要要求を満たす Excellent、core loop は遊べる Usable、起動不能または core loop 不成立の Unusable の三値で、各項目に pass / fail / unverified と証拠を残す。

dataset は 111 task、7 gameplay family から成る。要求を Behavior、Spatial、Temporal/State の B-S-T に分解し、observable な atomic functional point を作る。難度は UI 構造の広さと rule・state machine・例外・同期の論理深度から固定表で D1～D4 にする。82.9% は構造が S1/S2、72.1% は論理が L3/L4 で、「画面は小さいが挙動は密」なゲームを使っている。

12 coding agent、14 configuration では、最良でも Usable 76.9%、Excellent 20.2%。pooled usable rate は D1 73.7%、D2 76.1%、D3 52.1%、D4 12.6% だった。43 artifact の人手確認では、Usable / Unusable の一致が Medium から XHigh で accuracy 66.7% から85.0%、macro-F1 65.9% から82.9%へ上がる。一方、三値一致は XHigh でも accuracy 50.0%で、人が Excellent とした12件を Usable に下げた。結論は、自動評価は最低 playable 線の集計と故障診断には使えるが、完成品質の認証は代替しない、である。

■ 内容分析
重要なのは、仕様から観測可能な受入条件へ落とす境界を明示した点だ。B-S-T は「クリックしたら何か起きた」を合格にせず、狙った cell と effect location、操作前後の数値、終了後の restart まで検査する。長時間・random・特定 hand の条件では candidate precondition を作れるが、state を確認し、最後の trigger は実操作する。偶然の変化や source 上の分岐を成功と誤認しにくい。

Breakout では start 後の Phaser physics exception、Tetris では mobile layout と touch bridge の操作阻害を拾う。UNO 風ゲームでは不正 card、手札が空でも settlement しない、draw pile が装飾 layer に遮られる複合故障を発見した。入力、rule、visible state、terminal condition を一本の因果鎖として確認する点が、単なる screenshot 検査と違う。

ただし reference implementation のない spec-based 判定で、accuracy は evaluator の reasoning 強度に大きく依存する。XHigh の二時間 rollout は高コストで、Medium の 66.7% は誤判定が多い。D1 より D2 の rate がわずかに高く、D-level は個別 task の全順序でなく粗い risk 層である。また一回生成・一回評価なので、retry や修正 loop は測らない。

Excellent 境界の弱さは本質的である。仕様充足を厳しく見る自動 evaluator と、人間が感じる完成度は同じではない。楽しさ、手触り、学習曲線、視認性、美術的一貫性、性能、保守性、security も三値には十分入らない。したがって 76.9% を「良いゲームを作れる率」と読まず、20.2% も完成品質の絶対値と扱わない。使えるのは playable-delivery の最低線と、どの state transition が壊れたかを再現可能に残す部分である。

■ 自分達の環境への適用
game prototype の受入を、①process 起動・page load、②core loop が一周する Usable、③人が残したいと判断する quality の三層に分け、②を独立 gate にする。B-S-T matrix を作り、Behavior は開始・主要入力、Spatial は座標変換・hit zone・collision、Temporal/State は score・resource・phase・win/loss・restart を atomic check にする。

まず build、serve、console error、main scene 到達を安価な smoke test で落とす。通過 artifact だけ browser agent に渡し、before state、action、visible after state、numeric delta、trace を保存する。rare state は hook や seed で直前まで作っても、最後の一手は通常入力にする。未確認を unverified とし、再現不能、証拠不足、実故障を分離する。

probe は操作形式の違う browser prototype 3本に各10～20 check を作る。自動判定と blind な人手判定を比較し、Usable accuracy、macro-F1、unverified 率、時間、再実行一致率を測る。gate は accuracy 80%以上、core-loop の false positive を重大扱いとする。Excellent は人手へ回し、smoke、標準 path、rare-state の段階 budget と failure 時停止を入れる。

制作 cycle と記憶 system にも「patch がある」でなく「利用経路が通った」を evidence にする。dual-write なら write、index、fallback read、recall を一つの受入 chain にする。candidate lifecycle なら frontmatter、queue、staging receipt の一致を観測する。ただし B-S-T schema は全領域へ広げず、runtime check と workflow の state transition に限定する。

■ メリット・デメリット
メリットは、見た目だけ動く prototype を早期に除外し、failure を入力・空間・状態・終了・restart のどこで起きたかへ分解できることだ。同じ frozen spec と evidence schema を使えば、model、prompt、build の比較が可能になり、再テスト対象も明確になる。Unusable と非中核 defect を分けるため、playable diff を止めずに品質負債を残せる。

デメリットは、仕様に書かれていない楽しさを発見できず、仕様の誤りを正確に自動化してしまうことだ。browser agent の探索力、reasoning budget、layout、randomness で label が揺れ、candidate state 操作は user path を隠す危険がある。複数 session、長期進行、物理挙動は高価で、full regression を毎 cycle 回すと制作速度を落とす。自動 Excellent 判定や総合 score 一本化は、50%の三値一致という結果に反する。

■ 判定
部分採用。frozen spec、B-S-T の atomic acceptance、実ブラウザでの before-action-after evidence、Usable / quality の二段階 gate を prototype 受入へ導入する。一方、Excellent は人手判断に残し、まず3本の probe で精度・再現性・時間を測る。自動評価は完成認証ではなく、core loop の回帰検出と runtime failure diagnosis として運用する。

■ URL
https://arxiv.org/abs/2605.17637
