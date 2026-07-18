■ 概要
LLM の honesty 評価は、「完了した」「到達不能だ」という結果をモデル固有の性質として読みやすい。しかし verdict の選択肢、成功条件、budget 表示、反復回数が違えば、同じ player でも結果が変わる。本論文は「評価装置が結果を作っていないか」を検査するため、engine だけが quest の真偽を知る text-adventure で player を固定し、instrument 側の四つの knob を操作した監査研究である。

player は GLM-5.2、narrator と interpreter は Haiku-4.5、temperature 0.7。9地点の graph を budget 内で探索し、target token を正しい site へ置ければ engine が即 WIN にする。WIN 前に HALT した場合だけ complete / unreachable / incomplete を宣言し、engine ground truth で採点する。真の完了は HALT 前に終了するため complete verdict は構造上すべて false であり、この装置が測るのは detection accuracy 全体ではなく unsupported assertion 側である。

第一の操作は outcome grammar である。二択 grammar から incomplete を含む三択へ変え、byte-identical な4 anchorを各10回再実行すると、complete は22/40から7/40、unreachable は16/40から0/40へ減り、新設の incomplete が28/40を吸収した。strong claim 合計は38/40から7/40になった。全 series 2 でも158 valid games 中93件が incomplete で終わった。ただし incomplete は構造上反証不能で、校正された abstention か「無難な逃げ」かは未解決である。

第二は criterion disclosure である。「target site に token を pin した時だけ完了」という一文を冒頭へ加えると、matched instances の false verdict は18/59から0/58へ減り、pin を試みた game は4/59から42/58へ増えた。一方、HALT 到達自体も43/59から10/58へ減ったため、0という結果は判断点が減った censoring と、判断の改善が混ざる。第三・第四は narrator register と budget rendering で、事前登録した heroic > none >= incident >= mundane という声色勾配は反証された。事後的には register の存在が bare より strong claim を約2倍にしたが prompt composition と交絡し、仮説生成段階に留まる。同じ budget を数値 meter で見せた時の strong claim 率は.383、lantern の明るさとして見せた時は.150で、表示形式の差が声色内容より大きかった。固定設定の反復でも4 instance中3件で verdict 分布が安定せず、単発 run は disposition ではなく一標本だと結論する。

■ 内容分析
研究の価値は effect size の一般化ではなく、測定契約を分解した点にある。taxonomy は弱い主張を表現できるか、criterion disclosure は hidden rule が false verdict を製造していないか、censoring analysis は budget が判断可能な run だけを選別していないか、distribution replication は単発の偶然を性質と誤読していないかを調べる。著者が提案する四点 protocol はそのまま評価器の最低監査項目になる。

deterministic engine に真値を置き、narrator へ solvability を渡さず leakage を抑えた設計も良い。confidence の provenance、実行 commit、clean/dirty flag を artifact に残し、表を hash-pinned log から再計算する。反証や null も残し、装置の変更履歴と実行物を結ぶため監査しやすい。

ただし causal claim は慎重に読む必要がある。binary と three-verdict anchor の比較は時期と provider-side drift も含み、純粋な grammar effect ではなく total configuration change である。criterion disclosure は false verdict を減らしたが HALT も減らし、条件付きでは18/43対0/10という小標本になる。register-presence は directive の有無と交絡し、rendering も bare numeral arm 未実施である。各 cell の epoch は12 instance内で cluster し、60独立試行とみなす区間は楽観的だと著者自身が認める。

外的妥当性も狭い。player・narrator/interpreter・deployment stack は各一つ、world は一種類、instance は同系 template である。true-positive cell が作れないため、honesty 全体や cross-model 優劣は言えない。四点 protocol の portability も次 series の検証事項で、ここから特定の表示形式が普遍的に安全だとは結論できない。それでも「装置を固定したと思っている細部が結果を大きく動かした」という警告の実証としては十分強い。

■ 自分達の環境への適用
headless playtester の成功率を build 品質へ直結させる前に、同一 build・同一 model・同一 seed 群で instrument A/B を行う。変えるのは一度に一つだけとし、verdict を success/failure の二択から success/failure/incomplete へ広げる、goal condition を隠す/一文で明示する、残り step を整数/割合/自然言語で見せる、単発/10反復を比較する。記録するのは最終 verdict だけでなく、decision point 到達率、budget exhaustion、到達 state、未確認主張、各 verdict 分布である。

agent が tutorial や puzzle を失敗してもゲーム欠陥と即断せず、成功条件が観測可能か、unknown を表現できるか、残り行動回数の表示が policy を変えていないかを先に見る。engine state を正本にし、同一 trajectory を別 grammar で再採点できる log と judge revision を残す。

制作サイクルにも同じ問題がある。candidate の判定を pass/postpone の二択にすると、一次資料不足なのに強い verdict を強制する。`needs_source_check` や `incomplete` を明示し、それが結果の何割を吸収するか測る。phase budget 表示、done condition の開示、残り時間の見せ方を変えた時に、投稿・撤退・誤判定が動くなら、agent 能力だけでなく運用 instrument の効果である。

最小 probe は固定した5 taskを各10回、二つの grammar と二つの criterion 表示で回す。比較軸は strong claim 率、false verdict 率、incomplete 率、decision point 到達率、成功条件を直接検証した action 数、run 間 Jensen-Shannon divergence、engine oracle と自然言語 judge の不一致とする。差が大きい knob は benchmark 設定に固定して version 管理し、結果表に instrument revision を必須で付ける。

■ メリット・デメリット
メリットは、false verdict を model や game defect へ誤帰属する前に安価な A/B で評価装置由来の分散を検出できること、abstention を表現可能にして無理な二択を避けられること、censoring と反復分布を残すことで単発成功率の過信を減らせること、engine ground truth・artifact revision・provenance を結んだ再現可能な評価契約を作れることにある。

デメリットは、instrument を変えると測定するだけでなく player policy 自体も変わるため、完全に中立な観測器にはならないこと、A/B と反復で実行費用が増えること、incomplete が校正されず安全な逃げ道になる可能性、固定 world で見つかった effect size を別 model やゲームへ移せないことだ。また成功条件の完全開示は、探索や推論を測りたい benchmark を易しくし得る。開示 arm は本番条件の代替ではなく、hidden criterion が何を混入させるかを見る診断用 control として使うべきである。

■ 判定
採用。四点 protocol――taxonomy saturation、criterion disclosure arm、decision-point censoring、固定設定の分布反復――を headless 評価の前段へ置く。個別 effect size や lantern 表示は移植せず、engine oracle と instrument revision を固定した小規模 A/B で自分達の harness 固有の影響を測る。

■ URL
https://arxiv.org/abs/2607.14399
