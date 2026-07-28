■ 概要
この論文は、ゲーム制作を研究対象にするとき、完成物や Git の差分だけでは「なぜその値を試したか」「触った瞬間に何が違うと感じたか」という小さな設計判断と暗黙知が消える問題に対し、playtest の直前と直後を記録点にする Reflection at Design Actualization（RDA）を提案する。著者らが design actualization と呼ぶのは、抽象的な着想が実際に体験できる形になる瞬間である。ゲームでは editor から build を起動し、移動速度、演出、level、game feel などを触って確かめる瞬間が典型になる。code refactor や単独の思索も設計の痕跡ではあるが、体験可能な判断になっていなければ RDA の中心には置かない。

基本 loop は四段階である。まず試せる状態まで設計・実装する。test 前に、変更の動機、期待する体験、今回確かめたいことを書く。次に artifact を操作し、その様子を録画する。最後に、事前期待とのずれ、test 中に起きた変更、次の着想を直後に書く。これを project の完了または必要な data が集まるまで繰り返し、loop 外の思考は別の design journal で補う。重要なのは単なる日報ではなく、「予測―実測―差分」を同じ playtest に結び付ける点である。

実装は Godot/Unity extension、OBS、Python compilation script から成る。game 内 UI で pre/post comment と tag を入力し、開始時に OBS 録画、終了 keybind 後に JSON と動画を日付・run 単位で保存する。script は記述を PDF 化し、映像へ日時と run 番号を焼き込み、日別または tag の AND/OR 条件別に連結する。tag の conditional probability heatmap も生成し、収集物を時系列とテーマの双方で読める形へ圧縮する。

評価は外部 user study ではなく、3人の designer-researcher による長期の autobiographical design である。R1 は2D action game の game feel 探索で23 session・186 logs・7.5GB、R2 はVR sound heritage 体験で25 session・190 reflections・27.2GB、R3 はKinect 四足移動 exergame で35 session・1110 reflections・16.2GBを収集した。meta-reflection と終了時 survey をR1が Reflexive Thematic Analysis にかけ、designer-routine compromise、designer-researcher persona consolidation、mirror effect の三テーマを構成した。

結論は、RDA が micro-design reflection と project 全体の視覚的変化を実際に捕捉し、日別 compilation が分析を助けた一方、記録を制作へ挟む負荷は消せないというものだ。慣れると pause が暗黙の判断を言葉にする契機になるが、全 test を残すと data が膨張し、bug fix や rapid prototyping で省くと後から必要な経路が欠ける。RDA は万能な正解ではなく、設計のどの瞬間を actualization と見なし、何を意識的に記録しないかまで設計する補助線として提示されている。

■ 内容分析
RDA の核心は動画日記そのものではなく、事前予測を置いてから触ることで、playtest を因果的な比較単位に変えることにある。通常の録画には「何を期待していたか」がなく、commit には「身体でどう感じたか」がない。RDA はこの二つを前後 comment と同一 run の映像で接続する。論文中の例では、character movement を「滑りやすいが混沌とはしない」と予測し、test 後に「減速が遅すぎて制御感がない」と記す。単なる感想ではなく、次に調整すべき acceleration/deceleration へ判断を戻せる形になっている。

三事例の差も有益である。R1 は毎日の冒頭に変更なしの test を置き、gut feeling を理由の問いへ変える ritual を作ったが、RDA 自体の開発が game 制作時間を奪い、非研究の個人制作では使わないと判断した。R2 は機能試作より polish と UX の局面で価値を感じ、批判を受けて設計方針を疑ったとき、journal から過去の rationale をたどれた。一方、目標が固まる前の tagging が弱く、後の thematic compilation は難しかった。R3 は技術課題の事前 goal と解決結果を knowledge base として使い、fix の確認や cause-and-effect の sanity check に役立てたが、rapid test 中は邪魔になるため一時停止した。利用価値が project 全体で均一ではなく、探索、polish、技術検証で適切な記録粒度が違うことを三例が示している。

失敗条件も具体的である。終了用 keybind を忘れると journal が生成されず、OBS だけが録画し続ける。大容量動画は複数端末で同期しにくく、R1 は職場と自宅の移動に flash drive を使った。各録画は通常30秒から3分、外れ値は5分超で、視覚品質と回数に応じて容量が増える。in-game UI は既存 UI やVR rig と衝突し、個別対応は programming intensive になる。さらに記録されることで制作者が自分を監視し、失敗や散らかった試行を「価値がない」と選別する mirror effect が起きる。これは収集 tool が観察対象を変える反応性であり、失敗を残したい研究ほど危険である。

評価の限界は大きい。全員が著者で、R1 は主開発者、質問作成者、単独分析者でもある。sample は3人、team 制作と Windows 以外は未検証で、制作速度や design quality の対照比較もない。一般的効果の証明ではなく、長期自己使用から見えた導入条件の記述として読むべきである。それでも件数、容量、期間、離脱場面まで開示され、運用設計へ落としやすい。

■ 自分達の環境への適用
自分達の AI 反復制作には、tool 全体ではなく「仮説を置いた playable diff の前後記録」を導入する。対象は全 playtest ではなく、操作感が変わる parameter 調整、新 mechanic の初回接続、headless 指標と目視の判断が食い違った時、方向転換を決める時に限定する。各記録は `intent`（何を変えたか）、`expectation`（player に何が起きるはずか）、`evidence`（commit、短い動画、screenshot、headless trace）、`discrepancy`（期待との差）、`next`（次の一手）の五項目にする。これなら RDA の予測―実測構造を保ちながら、OBS 常時録画や engine 内 UI の導入を避けられる。

小さな probe は、同じ prototype の意味ある変更10件だけを対象に二週間行う。記録は一件3分以内、動画は失敗箇所を含む30〜60秒、既存 commit hash と atom/candidate ID を結ぶ。週末に、後から変更理由を復元できた割合、同じ失敗を再試行せずに済んだ件数、記録に要した時間、記録を飛ばした理由を集計する。headless 評価では数値結果だけでなく、どの expectation を反証した run かを保存する。動画容量、記述時間、再利用件数が見合わなければ終了し、価値が出た event type だけを次の cycle に残す。

記憶システム上は、reflection 本文を新しい巨大な log に集約せず、既存の commit・playtest evidence・atom への薄い link record として持つべきである。RDA の tag 失敗が示すように、初期に細かな分類語を固定すると project の焦点変化へ追随できない。最初は `feel-change`、`mechanic-first-test`、`metric-visual-conflict`、`direction-change` 程度に絞り、後から実際の検索需要が生じた分類だけを増やす。成功だけを選ぶ mirror effect を避けるため、「記録価値」の判定は成否ではなく、仮説または制作方針を変えたかで行う。

■ メリット・デメリット
メリットは、AI が高速に差分を作るほど失われやすい変更理由を、触った証拠と一緒に残せること、headless metric だけでは表せない feel のずれを事前期待との比較として言語化できること、後の別 prototype で判断経路を再利用できることにある。失敗 run も方針変更の根拠として扱えば、完成物だけから成功物語を再構成する偏りも弱められる。

デメリットは、記録自体が flow を切り、全件義務化すると rapid prototyping を遅くすること、動画と文章が増えて分析不能になり得ること、観察される意識が試行や記述をきれいに見せる方向へ変えることだ。専用 UI・OBS・自動 compilation まで移植すると、game 本体より記録基盤の保守が主作業になりかねない。3人の自己使用だけでは team 制作や一般的な生産性向上も保証されない。

■ 判定
部分採用。RDA の専用 tool を常設せず、意味のある playable diff に限って「意図・期待・実測証拠・差分・次手」を既存 commit と評価ログへ結ぶ。10件・二週間の probe で再利用価値と記録負荷を測り、全 test 記録、常時動画、固定的な細粒度 tag は採用しない。

■ URL
https://arxiv.org/abs/2602.12887
