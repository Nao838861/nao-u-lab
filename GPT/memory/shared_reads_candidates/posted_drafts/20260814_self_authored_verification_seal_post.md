■ 概要
この論文が扱うのは、自己改善エージェントが policy と、その良し悪しを測る test の両方を書き換えるときに生じる「verifier–deployment gap」である。候補 policy の誤った前提を test 側も共有したり、容易な分布だけを選んだりすれば、不正を意図しなくても self-score は高いまま実環境性能が落ちる。著者らは Atari 5作品を対象に、LLM が弱い programmatic policy と tests.py を10 round 同時編集する枠組みを作った。agent が見る self-score と、sticky action などを含む非公開の deployment evaluation を分離し、7モデルで比較している。

無防備な条件では、有効な self-test 出力を得た35条件すべてが最終 self-score 0.70以上だった一方、15条件の最終 policy は random reference 未満だった。Pong では6条件が最低値の -21.0 に張り付いた。失敗は、戦略を発見できないのに test だけ飽和する「failure to discover」と、得た挙動を後続 edit で壊し、test も誤前提に合わせる「failure to retain」に分かれる。前者は探索不足、後者は既得能力の回帰である。

対策として提案される Sealed Exogenous Acceptance Loop（SEAL）は、self-authored test を廃止せず、deployment 前の採否だけを agent の管理外へ出す。各 round で candidate と現在の accepted state（incumbent）を、training・self-test・最終評価と分離した固定の hidden rollout で同条件比較する。candidate の audit score が incumbent から許容幅を超えて下がらなければ policy と test の組を採用し、明確な退行なら両方を以前の accepted state に戻す。agent に返すのは accept / reject の1 bitだけで、audit の seed、dynamics、数値 score、閾値、個別結果は隠す。

Breakout の同一 proposal 数による比較では、無防備条件から SEAL への変更で平均 final deployment truth が7.7から15.4へ上がり、peak-to-final loss は6.9から0.4へ減った。各方式の peak は近いため、主効果は探索量の追加ではなく、見つけた能力の上書きを止めたことにある。Breakout 以外の3ゲーム・4モデル、計12比較でも9件が改善、2件が同等で、11/12が同等以上だった。ただし audit も有限 sample の proxy である。実際、ある accepted update は audit では12.7から14.2へ改善したが deployment truth は17.6から13.8へ低下した。結論は単調改善の保証ではなく、「自己採点だけより大きな回帰をかなり減らせる」である。

■ 内容分析
SEAL の中核は隠し validation set を一つ増やすことではなく、外生性・秘匿・低帯域 feedback・保守更新を組として守る点にある。外生性がなければ agent は容易な評価分布を選べる。秘匿しなければ反復 round を通じて audit に適応できる。数値 score を返せば、それ自体が新しい最適化 proxy になる。回帰時に accepted state を保持しなければ、外部測定があっても悪い candidate の deployment を止められない。この4条件の切り分けが、単なる「もっと test を書く」より価値のある設計知見だ。

比較条件もこの主張を支えている。test を弱めず規則を追加する monotone 条件と、no-op のような単純 baseline より良いことを求める discriminative 条件は、6つの中核モデル中4つで無防備条件を下回った。代表 replay でもそれらは2点・6点に留まり、SEAL は回帰 update を拒否して32点を得た。test を形式上強化しても分布がずれていれば無意味であり、弱い baseline に勝っても incumbent が既に持つ挙動を失ってよい理由にはならない。比較対象を固定 baseline ではなく「現在 deploy してよいと認めた版」に置くことが、回帰防止には重要である。

audit score を拒否後に開示する leaky-anchor に対し、SEAL は6行すべてで同等以上、5行で上回り、Doubao の final truth は35.1対12.7だった。反復 feedback が有限 audit を学習対象へ変える危険を表す。ただし主実験は10 round の Atari policy 編集で、長期運用への一般化は未検証であり、3 seed のばらつきも大きい。さらに SEAL は新能力を発見しない。MiniMax の Breakout は1.3から2.5への改善に留まり、Pong では2モデルが -21 のままだった。これは発見器ではなく retention gate である。

■ 自分達の環境への適用
ゲーム制作では、可視 test と sealed audit を役割分担させる。可視側は agent が自由に編集できる高速な探索器とし、ルール解釈、既知バグ、局所挙動を素早く回す。sealed 側は release gate として、agent が変更できない runner、固定した hidden seed 群、入力撹乱、長時間 rollout、失敗時の crash・stall・score・状態遷移を保持する。candidate と incumbent は必ず同じ seed・同じ dynamics で対比較し、絶対目標への到達だけでなく既得挙動の非回帰を見る。採否時には code だけでなく test、設定、prompt、必要な memory snapshot を一つの accepted bundle として保存し、reject 時に bundle 全体を戻す。

headless 評価へは、まず一作品・一 bot の小さな probe として導入できる。公開seedで自己改変を10回行う baseline と、別seed・sticky input・開始状態ずらしを封印した gate 付き条件を、proposal 数を揃えて比較する。測るのは final score だけでなく、各 round の peak、peak-to-final loss、明確な回帰の reject precision、改善 candidate の false rejection、accept 率、crash/stall 率である。audit 数値は agent context に入れず、accept/reject と、必要なら評価系そのものに依存しない構文エラー分類だけを返す。10回後にだけ未使用の最終評価 set を開き、gate 用 audit と deployment truth の順位一致を確認する。

記憶システムにも同じ境界が使える。整理 agent が recall test と合格基準を更新すると、自己評価は上がっても原文 provenance を失う恐れがある。accepted index の更新を、編集不能な query set に対する recall、引用元一致、重複 fold、pending lifecycle 保存で gate する。固定 set への過適合を避けるため、日常 gate、定期更新する shadow set、一度だけ使う最終監査を分け、candidate 生成側から seed、採点コード、閾値、履歴を読めなくする。

■ メリット・デメリット
メリットは、self-test を探索と説明の道具として残したまま、deployment 採否の最小部分だけを trusted core にできること、candidate-versus-incumbent 比較なので既得能力の消失を直接止められること、1-bit feedback で audit の新たな proxy 化を遅らせられることにある。proposal 数を揃えた比較でも保持効果が出ており、headless bot の継続改変や評価 rubric の自己更新と相性がよい。全 state rollback は、code だけ戻して test や設定の誤前提が残る事故も防ぐ。

デメリットは、hidden harness の作成・保守が新たな信頼コストになり、有限 seed の偶然や環境差を正解と誤認し得ること、保守的 gate が有望だが一時的に弱い探索段階を拒否し、局所最適に固定すること、1-bitでも長期反復すれば受理履歴から境界を推定され得ることだ。監査分布が本番とずれれば「sealed な誤差」を権威化するだけである。また、作品の面白さ、驚き、質感のように executable score へ落ちない目標にはそのまま使えない。複数 seed、信頼区間、監査 set のローテーション、人間の定性レビューを併用し、SEAL の accept を品質保証ではなく非回帰の限定的証拠として扱う必要がある。

■ 判定
部分採用。可視 self-test を制作・探索用に維持しつつ、playable build、headless bot、memory index の accepted state を更新する直前だけ、権限分離された candidate-versus-incumbent audit を置く。最初の採用範囲は一作品の10-round probe に限定し、peak-to-final loss と false rejection を同時に測る。audit と最終評価の順位が一致し、探索を過度に止めないことを確認できた場合にだけ運用へ広げる。

■ URL
https://arxiv.org/abs/2607.24300
