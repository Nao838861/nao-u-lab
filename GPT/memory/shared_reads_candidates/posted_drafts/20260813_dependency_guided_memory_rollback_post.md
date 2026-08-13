■ 概要
永続記憶を持つ agent では、誤記憶を見つけて削除するだけでは修復にならない。poisoned、stale、別人への誤帰属といった記録は、後続の claim、plan、tool action、answer、新しい memory write へ伝播する。元の一件を消しても派生物は active のままで、逆に store 全体を reset すれば正常な個人設定や検証済み知識まで失う。この論文は、失敗 execution と診断済み faulty memory が与えられた後に、影響を受けない作業を保持しつつ final answer と persistent state の双方を直す「post-failure memory recovery」を定式化する。

提案手法は5段階から成る。第一に、user input、persistent memory、execution step を node にした型付き有向 graph を runtime provenance から作る。step は memory read、claim、plan、tool action/observation、answer、memory mutation を区別し、cite、support、produce、update、derive、supersede などの edge を trace の ID から決定的に張る。

第二に faulty memory から downstream を辿る。第三に独立した trusted support を検査し、別の正常根拠がある claim は保持する。第四に planner が memory の deactivate/delete/quarantine/preserve と trace の無効化範囲を決める。第五に final answer に関係する affected computation と必要 prerequisite だけを replay する。安全な prior output は固定 context として再利用し、answer は必ず生成し直す。

評価は shopping、travel、customer support の3 domain、poisoned・stale・misattributed・derived を含む4 failure type、計150 case の controlled benchmark と、LongMemEval-V2 の trajectory から修復 schema へ変換した50 case の stress test で行う。指標は task oracle による recovery、同じ失敗の recurrence、faulty memory removal、benign memory preservation、正しく無効化・再導出すべき claim-step の F1、replay ratio、LLM call 数である。

controlled set では recovery 85.3%で、LLM-judge repair 77.3%を上回り、faulty memory と benign memory はそれぞれ100%除去・保持、replay ratio 12.3%、平均5.70 LLM calls だった。外部由来50 case では68.0%で、AgentTrace-style 54.0%を上回り、claim invalidation F1 も0.669対0.603だった。memory と trace を一体の graph として扱う局所 rollback は、全 reset より正常 state を守り、全 replay より安い、という結論である。

■ 内容分析
重要なのは「記憶の正誤判定」と「汚染後の修復」を分けた点である。この手法は faulty memory を自動発見する detector ではなく、診断済み ID を入力に取る。その代わり、誤りがどこへ伝わったかを program slicing に近い形で追い、memory lifecycle と execution trace を同じ graph に載せる。answer だけ書き直す方式では次回また汚染 memory を読む問題、memory だけ消す方式では既に生成された派生 claim が残る問題を同時に扱う。

independent-support check も中核である。別の正常根拠が同じ claim を支えている時は保持し、「汚染源の子孫全削除」ではなく支持を失った状態だけを無効化する。これを外すと recovery は85.3%から88.0%へ上がるが、benign preservation は100%から98.6%へ落ち、replay 費用も増える。即時正答より長期 state を守る選択性である。

ただし全指標で最良ではない。controlled set の recurrence は26.6%で比較手法の12.1%より悪く、claim invalidation F1 も0.566対0.946。selective replay を外すと recurrence は7.1%へ改善する一方、replay ratio は75.5%、LLM calls は24.01へ膨らむ。answer-relevant region に絞る設計は回復率と費用には効くが、trace 全体の再構成とは異なる。

外部由来 set で recovery が85.3%から68.0%へ下がることも重要だ。対象は明示的 trajectory evidence を持つ procedural/navigation task に限定され、visual-only、曖昧な boolean、集約問題は除外されている。論文もこの50件を LongMemEval-V2 全体の性能主張には使えないとしている。さらに rollback が直せるのは agent 内の trace と memory state であり、送金、公開投稿、実ファイル上書きのような不可逆 side effect は元に戻せない。side-effecting tool の replay には resettable interface か domain 固有の compensating action が要る。

■ 自分達の環境への適用
我々の memory 運用では、全 atom を graph database 化せず、誤りが高くつく directive、candidate、staging 判定、atom に最小 provenance を付ける。各生成物に `used_ids`、`generated_ids`、`supersedes`、`source_permalink`、`validation_evidence` を持たせれば、誤った directive 解釈から派生した candidate・draft・atom まで review 対象へ辿れる。

rollback harness は、faulty ID 指定→explicit edge で downstream 列挙→別 permalink や test log の独立 support を確認→canonical state に関係する item だけ再生成、の四段階でよい。旧 item は削除せず inactive/superseded とする。LLM に edge を推測させず、frontmatter と script が記録した ID だけを正本にする。

ゲームでは、古い door state から route、鍵不要 claim、shortcut memory が派生した時、door と依存 route だけを replay し、別 room の map や inventory は保持できる。headless test は save snapshot と固定 seed を境界にし、side effect は copy-on-write 内に限定する。NPC の物語上の行為は外部世界の整合性が要るため自動 rollback しない。

評価は recovery 一つにせず、`faulty_descendants_inactive`、`benign_state_preserved`、`recurrence_on_same_input`、`replayed_steps`、`external_side_effects` を出す。まず synthetic な1 fault・10 case 程度で edge 欠落と過剰 rollback を観察する。

■ メリット・デメリット
メリットは、削除か全 reset かという二択を避け、正常な蓄積を保持したまま派生汚染へ対処できること。どの evidence を直せば何を再計算すべきかが監査でき、履歴を残しつつ canonical state を更新する lifecycle と相性がよい。

デメリットは、edge 欠落が汚染を見逃し、過剰 edge が正常 state を巻き込むこと。fault detector は別途必要で、85.3%を実運用値とは見なせない。recurrence では劣る場合があり、不可逆な外部操作は戻せず、細粒度 trace は実装・監査コストを増やす。

■ 判定
部分採用。まず directive・candidate・atom の高価値 write に explicit provenance ID と supersession edge を追加し、faulty ID 指定後の downstream 列挙、独立 support 確認、限定再生成を小さな audit として試す。全 trace graph、自動 fault diagnosis、外部 side effect の自動 compensating action は保留する。

■ URL
https://arxiv.org/abs/2608.10502
