■ 概要
GARL は、複数の LLM agent が同じ候補集合に異なる優先度を持つ問題を、単なる投票や会話ではなく「資源配分→裁定」の二段階 game として定式化し、その utility を role 別の reinforcement learning 信号へ変える枠組みである。対象例は訴訟の争点順位付けで、prosecution と defence が10個の候補争点へ argumentative resource を配分し、judge agent が最終 ranking を作る。

第一段の Agenda Allocation Game では、各 party が候補ごとの配分比率を出す。候補の salience は総 attention だけでなく、両 party が競って取り上げた度合いも含む contention score から作られる。party utility は、その候補が judge に重視される度合いと、その争点を中心に争った時の party 固有の戦略価値を組み合わせる。第二段の Arbitration Game では、judge が salience に加え、実務家との相談から定めた relevance、definiteness、provability、materiality、legality を考慮して ranking する。judge utility は法的妥当性を高く評価しつつ、当事者双方が強く重視した争点から大きく外れないよう罰する。つまり、多数決では拾えない「対立の強さ」と「上位基準による妥当性」を別の役割へ持たせる。

学習は allocator（prosecution / defence で parameter 共有）と arbiter を交互に更新し、連続 policy 間の KL divergence が閾値を下回るか最大5 inner steps に達すると担当を切り替える。turn 単位の utility は応答末尾 token の sparse reward として注入され、REINFORCE++ の advantage に変換される。学習は Qwen3-4B / 8B、600 steps。重要なのは、party の争点別勝率と judicial adequacy score を Qwen3.5-122B で事前計算している点で、報酬構造は完全な自己完結ではない。

評価は三層ある。Level I は LexIssue の fixed candidate ranking で、263 training casesと、原因類型が重ならない350 out-of-domain casesを用い、Recall@gold-size と mAP を測る。Qwen3-8B の allocator は direct prompt の in-domain mAP を85.22から90.43へ、out-of-domainを84.02から87.63へ上げ、同条件の GPT-4（89.18 / 87.12）と同等以上になった。一方 one-shot では改善が不安定で、例示が learned policy と干渉した。Level II の LawBench は judge 側だけ小幅改善し、8Bで47.22→47.99。Level III の GameBench は8B allocator の overall score が0.45→0.57、judge は0.52だった。著者は、資源配分に近い game では allocator、条件判断や signal 統合では arbiter が伸びる role-dependent transfer と解釈している。

■ 内容分析
中心的な貢献は「agent を増やすこと」ではなく、優先順位決定に潜む競争と裁定を明示し、それぞれ異なる utility を与えた点である。候補の重要性を単一 scorer で決めると、強い一方の視点か平均値へ潰れやすい。GARL は party が何を押すかを先に可視化し、arbiter が domain criteria と照合するため、salience と adequacy を混同しない。この構造は対立する利害があり、候補集合が固定され、最終的に順序を一つ出す課題には筋がよい。

ただし「game-theoretic」と「task 固有 reward から自由」は割り引く必要がある。salience 式、party advantage、judge criteria、両者の重みは domain 設計そのものであり、Qwen3.5-122B が勝率と妥当性を事前採点する。小型 model が GPT-4 に迫った結果は、inference 時の ranking model が小さいという意味では正しいが、system 全体が小型 model だけで学習できた証拠ではない。また training の263 casesは in-domain test と case 単位で重複し、候補 pool は変えていても完全な未見評価ではない。out-of-domain split の改善がより重要である。

role ごとの結果差も警告になる。LexIssue の gold は双方の pleading を中心に作られているため allocator utility と整合し、judge 側は judicial adequacy を学んでも annotation とずれる。これは arbiter が劣るというより、評価正解がどの役割の価値観を表すかで勝者が変わることを示す。GameBench の転移も全 game 一様ではなく、4B/8Bで最適 role が違う。さらに training dynamics の KL 安定化と loss ratio の均衡は局所的な更新安定性であって、Nash equilibrium や真の社会的最適性の証明ではない。

■ 自分達の環境への適用
ゲーム runtime へ RL をそのまま持ち込むより、まず allocation–arbitration skeleton を deterministic な設計 tool として使う。例として敵 wave 候補が10個ある時、攻撃性、学習曲線、演出、performance budget を別 allocator の関心配分として0〜1で出し、arbiter が「現在の player skill、直前3 wave の反復、必要 asset、fail recovery」を基準に最終順位を作る。勢力 AI なら各 faction が食料、領土、脅威候補へ有限 budget を置き、world-rule arbiter が不可能 action を除外する。agent の prose 議論より、有限資源をどこへ置いたかが inspection 可能になる。

制作サイクルでは、複数の自己評価結果から次の playable diff を選ぶ offline probe に向く。候補を5件へ固定し、allocator を「player value」「実装費」「未知の検証価値」に分け、各100点を配分させる。arbiter は実装可能性、既存 feedback との接続、24時間以内の観測可能な done condition を採点する。最初は学習せず、式とログだけで一週間運用し、単一 priority score と比較する。評価指標は、選択課題の完了率、次 cycle で覆った順位数、playtest 指標の改善量、allocator 間の配分差、arbiter が salience を覆した理由の再現性とする。

RL を試す条件は、同じ形式の候補選択が数百回以上あり、採用後の outcome を機械的に返せる場合に限定する。utility 入力を強い外部 LLM に依存させるなら、その費用と bias を baseline に含める。candidate を agent が自由生成する open-ended 問題、報酬が数週間後にしか分からない企画判断、正解が一つでない美的判断には適用しない。

■ メリット・デメリット
メリットは、候補への関心配分と最終裁定を分け、role-specific signal を設計できること。fixed candidate ranking では数式、学習手順、三層評価が揃い、direct prompt と one-shot の干渉、allocator と arbiter の転移差まで報告されている。ゲーム内 faction や制作 priority のように「誰が何を重要視したか」を残したい場面では監査しやすい。

デメリットは、utility の意味と重みが用途依存で、外部122B model の事前採点を含むため実装・計算 cost が重いこと。fixed candidate set を仮定し、案の生成・統合・削除を扱わない。小規模 data、in-domain case 重複、paired t-test 中心で seed 間分散の説明も薄い。学習後 model に one-shot 例を足すと悪化する場合があり、既存 prompt workflow と単純に併用できない。対立構造を作る必要のない課題へ導入すると、役割演技の overhead だけが増える。

■ 判定
部分採用。allocation–arbitration の二段階構造と有限 budget の可視化は、勢力 AI と次実装課題の offline 順位付け probe に採用する。RL、外部 LLM utility、均衡判定は同型 decision の蓄積と測定可能な outcome が揃うまで保留し、まず deterministic baseline との差を検証する。

■ URL
https://arxiv.org/abs/2606.05002
