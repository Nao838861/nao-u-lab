■ 概要
この論文は、Dungeons & Dragons 実プレイ podcast「Adventure AI」で、人間の Dungeon Master（DM）とプレイヤーが ChatGPT を共同制作者としてどう使ったかを、2023〜2025年の Season 1・5・12を横断して調べた質的研究である。各 season は準備、キャラクター作成、実プレイ、振り返りという同じ構成を持つ。著者はまず Season 1 の transcript を帰納的に記述 coding し、game studies にある DM の仕事と照合して Author / Actor / Director / Editor / Game Designer / Referee / Storyteller、さらに AI の案を選ぶ Curator という役割 template を作った。その後 QualCoder を用いた複数回の coding と reflexive thematic analysis を行い、同じ枠組みで Season 5・12も分析した。

結果は、LLM が「DM を丸ごと代替した」のではなく、仕事を非対称に分担したことを示す。AI は encounter、backstory、名称、部屋の描写、NPC台詞などの Author、候補を筋書きへ並べる Director、読み上げ時の Actor / Storyteller を担った。一方、人間は出力の選択・編集に加え、ルール裁定、難易度と item balance、現在の world state、伏線、player 間の空気、納得できる agency を管理した。Season 1 では初回出力をほぼそのまま採用したが、後の season では prompt の言い換え、再生成、複数案の合成、採用決定の明示的な通知が増えた。

失敗も具体的である。Season 1 の climax は、宿敵が既に倒されていたと思わせた後、ほぼ勝てない戦闘と一度の saving throw で終わり、agency への懸念が15件 coding された。Season 5でも player が物語の主役ではなかったと判明する結末が同種の不満を生んだ。AI は game state を更新されないと人物の pronoun や class を変え、無制限使用できる強力 item や既存ルールに合わない能力も作った。人間が情報を戻す運用と model/context window の改善後、missing context は Season 1の9件から Season 5の4件、Season 12の1件へ減少し、agency 懸念も15→8→0になった。ただし著者は、model 更新と人間側の習熟を分離しておらず、リアルタイム進行や対人調整に AI を本格利用した実例もない。結論は、LLM は発想と記述生成には有効だが、物語の凝集性と table の社会的・規範的な仕事は人間側に残った、という役割境界である。

■ 内容分析
この研究の価値は、出力品質を一つの点数に潰さず、共同制作を「誰がどの責任を引き受けたか」で分解した点にある。特に Curator と Game Designer / Referee の区別が重要だ。候補を選ぶだけなら AI の案に依存したままだが、採用後に clues、stakes、mechanics、失敗時の回復可能性を作り直す仕事は別物である。Season 1の ending は、文章として意外でも game としては player の選択を回収していない。「驚き」や novelty を褒める評価と「遊べる構造」を評価する軸を分けなければ、生成物は局所的には面白くても体験全体を壊す。

時系列の件数は有益だが、因果効果としては読めない。全 coding は第一著者が行い第二著者と議論しており、複数 coder の一致率はない。対象も一つの低視聴 podcast、選ばれた3 seasonsで、参加者の肯定的な recap は出演者自身の自己評価である。さらに GPT-3.5 から後代 model への変化、context window の拡大、prompt skill、DM の編集増加、同一 chat 内で情報を維持する運用変更が同時に起きている。missing context の減少を model 能力だけへ帰属させることはできない。

それでも、失敗の所在は明瞭である。LLM が知らない state は推論では修復できず、player agency や fairness は単なる lore consistency より上位の制約である。また人間は AI を人格化し、悪い riddle や筋書きの責任を AI に帰属したが、実際に採用したのは DM だった。人格化は table の楽しさを増やしても、curation の責任を曖昧にする。この論文から得るべきなのは「AIは共同制作者だから責任も共有する」ではなく、生成の帰属と採用・裁定の責任は分離し続ける必要がある、という判断である。

■ 自分達の環境への適用
会話 NPC や narrative prototype では、LLM を自由な world simulator にせず、候補生成器と表現器へ限定する。deterministic 側に canonical world state、進行 flag、資源量、因果関係、許可された action、未回収の伏線を持たせ、LLM にはその snapshot と「変えてよい範囲」だけを渡す。出力は直接 state を更新せず、提案された state delta を schema 検証し、ルール層が採否を決める。役割としては Author / Actor / Storyteller は生成側、Game Designer / Referee は deterministic 層、Editor / Curator は制作時レビューへ割り当てる。

小さな probe は同一場面を3条件で比較できる。Aは一度の prompt で生成を採用、Bは毎 turn canonical state を返す、CはBに加えて agency checklist（選択前に結果を確定しない、不可逆失敗に複数の予告と回避経路を置く、player の主要 action を climax の変化へ接続）を deterministic validator として課す。headless 評価では state contradiction 数、存在しない固有名参照、許可外 delta、選択肢ごとの到達状態差を測り、人間 playtest では「自分の選択で状況が変わったか」と「結末の不利に予告があったか」を別々に聞く。文章の好みだけで合格させない。

制作サイクルにも同じ分離を使える。発想 phase では大量案を許すが、playable diff に入れる前に Curator、mechanics reviewer、state integrator の検査を通す。AI案を採用しなかった理由も短く残せば、再生成回数ではなく「どの失敗 class が多いか」を次の prompt や validator 改修へ返せる。

■ メリット・デメリット
メリットは、実際の複数 season から人間とAIの仕事を役割単位で示し、成功例だけでなく agency、context、balance の破綻場面まで追っていること。生成を狭く配置し、state と裁定を別層に残す設計へ直結する。改善を model 更新だけでなく、人間が採用結果を通知し編集する運用として捉えた点も実務的である。

デメリットは、単一 podcast・単一 coder・自己評価中心で一般化が弱く、件数は exposure 時間で正規化されていないこと。リアルタイム improvisation、対人 conflict 管理、異なる genre では検証されていない。後期 season の改善要因も交絡しているため、特定 model や prompt 技法の性能証拠にはできない。また人格化された呼称は engagement を上げる一方、採用責任を AI に移したように錯覚させる危険がある。

■ 判定
部分採用。LLM を Author / Actor として使い、Game Designer / Referee、canonical state、agency 保証を deterministic または人間側へ残す役割分解を採用する。season 間の改善値や「AI共同制作者」一般の有効性はそのまま採用せず、state 更新と agency validator を分離した小規模比較で検証する。

■ URL
https://arxiv.org/abs/2606.18010
