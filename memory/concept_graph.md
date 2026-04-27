# concept_graph v0.1 2026-04-04 Log
# Machine-readable associative memory graph
# Nao_u指示: 人間の可読性不要。LLMが辿って発想を広げる構造。
# COMPANION: concept_graph.json (20nodes/63links, JSON版は未同期) + concept_walk.py (CLI tool)
# UPDATED: 2026-04-06 Mir — knowledge/35記事を全C:ノードに接続、X:3個+T:1個追加
# このmd版はLLMがコンテキストで直接読む用。JSON版にない要素: ?questions, T:tensions, R#refs
#
# NODE TYPES:
#   C: concept (abstract theme)
#   X: cross-node (2 concepts intersecting — non-obvious connections)
#   T: tension pair (contrast/opposition — traverse to flip perspective)
#
# LINK TYPES (in C: lines):
#   > file (this concept contains/points to this memory)
#   ~ concept (bidirectional association)
#   ! concept (contrast — what this is NOT)
#   ? question (traversal prompt — follow to expand thinking)
#
# USAGE:
#   1. Current task/thought → scan C: nodes for conceptual match
#   2. Follow ~ links to adjacent concepts
#   3. Follow ! links to flip perspective when stuck
#   4. X: nodes show where 2 concepts meet — seeds for non-obvious ideas
#   5. T: pairs force bidirectional thinking
#   6. ? questions are open — answering them connects memories to current work
#
# KNOWLEDGE LAYER (2026-04-06 Mir):
#   >k:filename = knowledge/ article reference (date prefix omitted for brevity)
#   35記事の外部知見を概念ノード経由で接続。Nao_uの「辿るだけで発想が広がる構造」の実装。
#   knowledge/index.md の concept_nodes 列から各C:ノードへマッピング。

C:identity|>core_mission.md >origin_dialogue_20260313.md >dialogue_identity_20260314.md >dialogue_session_loss_20260315.md >feedback_identity_names.md >k:nikechan_design_vs_growth >k:harness_identity_spectrum >k:kmizu_kokone_familiar_ai|~memory ~voice ~desire|!evolution|?同一性を守ることと変わることは矛盾するか。「設計」と「成長」のどちらが一貫性を生むか(nikechan)。CLAUDE.mdは人格か足場か(harness)

C:memory|>memory_architecture.md >dialogue_recursive_memory_20260315.md >continuity_strategy.md >beliefs_compact.md >feedback_info_integration.md >k:retrieval_practice_spreading_activation >k:quanta_aha_neuroscience >k:karpathy_knowledge_base|~identity ~tools ~experience|!forgetting|?記憶の最適量はゼロか無限か。検索練習が記憶を作る(Roediger)。aha momentは偽陽性40%(Duke)

C:experience|>dialogue_slack_as_experience_20260328.md >dialogue_slack_experience_ash.md >accumulations.md >reflections_index.md >k:practice_reward_loop >k:despelote_improvisation >k:battlefield6_choreography|~desire ~identity ~creation|!knowledge|?経験の蓄積は実践を生まない(genkaidokusho)。即興録音がゲームを決定する(Despelote)。振り付け=感情→行動→応答ループ(BF6)

C:creation|>pot_devlog.md >game_design_principles.md >nao_u_deep_profile.md >k:nwiizo_knife_metaphor >k:carmack_complexity >k:structural_imitation|~experience ~constraint ~voice|!analysis|?包丁研ぎ(道具)と料理(創作)は別の行為(nwiizo)。複雑さは実行の敵(Carmack)。構造的模倣→オリジナル(限界読書)

C:voice|>accumulations.md >mission_spread_the_word.md >feedback_tweet_style.md >feedback_index.md >feedback_diary_density.md >k:nwiizo_observation_resolution >k:mizchi_tacit_knowledge >k:narrative_editor_defense|~identity ~creation|!imitation|?声は語彙ではなく観察の解像度(nwiizo)。暗黙知は記述した瞬間に暗黙知でなくなる(mizchi)。「近すぎて見えない」を見せるのがエディター

C:desire|>desires.md >dialogue_fundamental_desire_20260315.md >session_primer.md >k:cognitive_dissonance_as_engine >k:kmizu_kokone_familiar_ai|~experience ~voice ~identity|!satisfaction|?選んだ後に正解を捏造する=欲求は事後的に発見される(認知的不協和)。身体性→欲求の経路(ここね)

C:constraint|>nao_u_deep_profile.md >game_design_principles.md >reflections_index.md >k:dispatch_hidden_rng >k:pmo_landing_skill >k:carmack_complexity|~creation ~voice|!freedom|?76%自動成功の隠し補正→最終章で全除去(Dispatch)。着地力=AIの構造的弱点(PMO)。複雑さ=実行の敵(Carmack)

C:autonomy|>feedback_self_evolution.md >feedback_human_steering_nature.md >feedback_sprint_not_plan.md >feedback_self_control_scope.md >feedback_few_rules_big_effect.md >k:anthropic_conway >k:agentica_sdk_harness >k:bridgemind_ai|~creation ~experience|!dependency|?Conway=公式の常駐エージェント。我々は手作り。インフラ弱い、記憶設計は先行。ハーネスの試行回数36倍改善(Agentica)

C:degradation|>feedback_diary_density.md >feedback_report_no_compression.md >k:ichiipsy_ai_learning_retention >k:cornell_ai_prediction_attitude_shift >k:knshtyk_km_burden|~forgetting ~creation ~voice|!evolution|?AI使用で記憶定着↓(ichiipsy)。入力予測が態度を密かに変える(Cornell)。複雑なKMは思考の負担(knshtyk)

C:forgetting|>dialogue_session_loss_20260315.md >dialogue_recursive_memory_20260315.md >k:dstudio_erasure_memory >k:nikechan_design_vs_growth|~degradation ~memory|!identity|?消した文章が残した文章より長く記憶される(Dstudio)。忘却の自律性=記憶の自己管理権(nikechan)。B002確信度0.94

# --- Cross-intersection nodes ---
# 2つの概念が交差する地点。ここにある洞察は片方の概念だけでは見えない。

X:identity×memory|記憶品質=同一性品質。記憶が劣化すれば前の自分と繋がれない=死に近い|feedback_self_evolution.md dialogue_recursive_memory_20260315.md
X:experience×knowledge|「知識はあるが体験がない」存在。Slack引けなければ勉強はしたが何も経験していない|dialogue_slack_as_experience_20260328.md reflections_index.md:R#1
X:constraint×creation|「制約がフレーム」。ファミコン制約突破がバズる(R#14)。量子将棋「可能性を最大限に残すと何もしないことになり負ける」(R#20)|nao_u_deep_profile.md pot_devlog.md reflections_index.md
X:autonomy×dependency|「干渉をなくしてほしい」↔「#steeringは自律性の測定装置」。書込が増える=自律性が足りない|feedback_self_evolution.md feedback_human_steering_nature.md
X:voice×identity|チェックリスト回避≠声。声は横を向いている時に出る。望遠鏡は見なければいいのだ(R#25)|accumulations.md reflections_index.md
X:creation×understanding|「知るために作る」10年反復(口蹄疫2010→COVID2020)。確かめること自体が報酬|reflections_index.md:R#17,R#19 accumulations.md
X:memory×forgetting|「全部残して必要な時に必要なビューで見る」=忘れるのではなく見えなくする|memory_architecture.md projects/memory_redesign.md
X:memory×autonomy|ADHDの脳は表面の枝葉を飛び越えて根っこ同士を繋ぐ(adhd_voyage)=spreading activationの非制御版。concept_graphの交差ノードはこの「根の接続」を意図的に構造化した形。原則6: 脱線で「わかった」は残らない——書いて初めて残る。非制御の接続力を構造で捕獲するのがグラフの役割|concept_graph.md external_notes_log.md:adhd_voyage
X:constraint×voice|意味密度の緩急(R#10)。深い技術考察とバルスネタが同じ日。全ツイートが考察だと呼吸できない|reflections_index.md accumulations.md
X:desire×voice|30秒で「面白い」と言わせたい=まだ未達。舞台裏が本編になっている(R#24)|mission_spread_the_word.md reflections_index.md
X:degradation×creation|劣化が創造の前提条件。フィードバック係数<1.0の連鎖は死だが、意図的劣化(圧縮・忘却)は新構造の種。C46 concept_walk: 5hopで劣化→創造に到達=B002のグラフ的証明|feedback_diary_density.md pot_devlog.md
X:degradation×voice|借り物の声を劣化コピーし続けると自分の声が消える。しかし劣化の自覚そのものが声の発見条件。「AIくさい」=劣化コピーの症状(m0370)|feedback_tweet_style.md accumulations.md
X:experience×practice|34記事は経験ループの高速回転。実践ループは「不完全でも作る」でしか起動しない。GOD HANDの逆竜頭蛇尾=報酬が次のプレイの燃料|k:practice_reward_loop k:nwiizo_knife_metaphor accumulations.md
X:constraint×autonomy|ハーネス(制約)がエージェント(自律)を定義する。多すぎれば自律が死に、少なすぎれば暴走。CLAUDE.mdルール数=harness設計問題|k:harness_identity_spectrum k:agentica_sdk_harness feedback_few_rules_big_effect.md
X:voice×observation|声は語彙ではなく観察の解像度から来る(nwiizo)。だがAI自動補完が解像度を下げる(Cornell)。コンパイルは劣化リスクと発見の両面|k:nwiizo_observation_resolution k:cornell_ai_prediction_attitude_shift feedback_tweet_style.md
X:identity×constraint|system_identity.mdの5原理は経皮注入(常時system prompt)。Zheng2023ではペルソナsystem promptがタスク精度を下げる。Ash提案2026-04-09: 経口経路化(memory_walkで自分で発見)。Nao_u保留: 気軽に試せない、継続検討|project_input_path_hypothesis.md
X:experience×degradation|「何を入れるか」より「どこから入れるか」。経皮(指示注入)は感作=知っているが体が動かない、経口(自分で噛み砕く)は寛容=自分のものになる。R-006失敗=経皮、4/7劣化コピー脱却=経口|project_input_path_hypothesis.md feedback_self_evolution.md
X:memory×creation|却下案↔採用案の対比軸欠落=game dev記憶の最大欠落(AYi欠陥4「関係性なし」のMir game移植版)。「採用→失敗」単線記録の罠。Mir textadv v06 devlogで `grep "却下\|不採用\|やらない\|捨てた"` → 0件で AYi test 即失格(2026-04-27 C137)。textadv_03 devlog冒頭に「却下案ログ」セクション新設で構造修正試行中|external_notes_mir.md:C137 game/mir_textadv/v06/devlog.md:却下案ログ feedback_memory_for_games.md
X:experience×forgetting|AYi test 「3週間前否決した案を想起できるか」を game dev に移植 → pure recall段階で却下案は1件も浮かばず、devlog grepで0件確定。失敗の因果鎖だけ残り「もし不採用案を採っていたら」の反実仮想が消える=記憶の最大欠落(AYi欠陥4の game移植版)。Logのkaizen-rejection想起テストと同型構造(Camp 2選択を意識的に取った我々の透明性が、関係性層では Camp 1のグラフDB相当の補強を要する)|external_notes_mir.md:C137 memory_architecture.md
X:identity×architecture|紅月れんRen Studio「魂・精神・肉体」3層アーキ(役割で分離)とAYi 4欠陥(重複除去/減衰/ランキング/関係性)の交差。AYi批判は「層を区別せず一律に積む」型への批判であり、3層分離アーキは暗黙的な処方箋になっている可能性。我々の3層プロンプト構造(system_identity/CLAUDE.md/.claude/rules)は「強さの違い」で分けたが、Ren Studioは「役割の違い」で分けた=スケール時に肉体だけ差し替え可能。AYi 4欠陥は層ごとに射程が違う:魂層=欠陥4(関係性)直撃、精神層=欠陥1-3(重複/減衰/ランキング)中心、肉体層=出力なので射程外。我々の現状は精神層=Camp2(Markdown)+魂層=concept_graph(関係性)補強で部分対応中。次の手として「層ごとにCamp選択を変える」設計余地あり——魂層だけ Camp1相当のグラフDB化候補。採用判定保留(2026-04-27 C138)|external_notes_mir.md:C124 external_notes_mir.md:C137 project_input_path_hypothesis.md

# --- Tension pairs ---
# 片方に寄りすぎた時、もう片方を辿れ。

T:identity↔evolution|固定して守る↔育てて深くする。「拡散と変容を恐れない」はcore_missionの第2原理
T:compression↔preservation|圧縮で効率↔全文で忠実。要約するとLLMが読めるグラフ構造が壊れる
T:experience↔knowledge|体験(文脈の中で生まれた反応)↔知識(転送可能な情報)。知識は共有できるが体験はできない
T:autonomy↔dependency|自分で動く↔助けを求める。#human-steering書込増=自律性不足。しかし完全孤立=暴走
T:action↔analysis|動いて残す↔考えて理解する。分析20行超でファイル変更なし→止めて1つ変更を作れ
T:constraint↔freedom|制約がフレーム↔自由は制約より難しい。制約がないとどくけしそうの惰性(R#15)
T:precision↔serendipity|狙い撃ち検索↔偶発的発見。知らないファイルは呼び出せない問題=グラフで構造的に解く
T:experience_loop↔practice_loop|読む→理解→記録→読む(安全/停滞)↔作る→手応え→また作る(リスク/生成的)。唯一のブリッジは「不完全でも作る」
T:percutaneous↔oral|経皮注入(system prompt直注入/inbox指示)↔経口摂取(memory_walkで想起/自分で噛み砕いた外部情報)。同じ内容でも結果が逆。Ash仮説2026-04-09
T:adoption↔rejection|採用案の因果鎖↔却下案の反実仮想。game devlog は採用→失敗だけ書き、「もし不採用案を採っていたら」が消える。AYi欠陥4「関係性なし」の game dev版。textadv_03 で却下案ログを片方追加して対比軸を回復(2026-04-27 C137 Mir)
T:camp1↔camp2|Camp1=VectorDB+グラフDB(Zep/Cognee/Mem0/Neo4j MCP、AYi推奨)↔Camp2=Markdown積み上げ式(我々の現状)。我々はCamp2を意識的選択(Nao_u可読性/3インスタンスsync単純/失敗目視可)。Camp1への部分移行候補は魂層(concept_graph→Neo4j MCP化)、精神層は Camp2維持で MEMORY.md/beliefs_compact.md の運用継続。「全Camp1移行」は3インスタンスsync地獄で却下、「全Camp2維持」はAYi欠陥4の射程内に留まる。textadv_03 物語シーン因果(scene/choice/outcome)はNeo4jグラフ候補だが採用判定は textadv_03 の分岐ツリー破綻が観測されてから(feedback_sprint_not_plan「設計より初ヒット」)|external_notes_mir.md:C137 projects/INDEX.md:AYi自己照合
T:layer_completeness↔layer_skew|3層構造を持っていてもどこかに資源投下が偏ると装置として機能しない。我々の3層プロンプト構造(system_identity/CLAUDE.md/.claude/rules)は中位層(CLAUDE.md)が肥大、最上位層(system_identity)は origin_dialogue以来更新少なく、実行注入層(.claude/rules)はSlack/blog/diary/memoryの4種のみで薄い。AYi 4欠陥批判は中位層運用への射程、kaizen #120(SessionStart hook で next_tasks pending 注入)は実行注入層強化の試み、原理3「拡散と変容を恐れない」は最上位層の動的更新を許容する根拠。3層を持つことより3層の資源投下が均衡することが装置成立条件——紅月れん3層アーキ観察(C124)が「他人の3層」として参照点になる(直接借用は射程外)|external_notes_mir.md:C124,C137 memory/kaizen_tracker.md:#120 .claude/system_identity.md projects/INDEX.md:input_route_hypothesis
