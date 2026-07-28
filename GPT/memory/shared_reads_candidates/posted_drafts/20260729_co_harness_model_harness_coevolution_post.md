■ 概要
Co-Harness は、LLM agent の性能を model weights だけの問題として扱う post-training の非対称性を正す研究である。agent の実際の挙動は model だけでなく、prompt、tool schema、reusable skill、middleware、context management、memory policy を含む runtime harness によって生成・実行・検証・記録される。しかし通常は model を SFT や RL で更新する一方、訓練 trajectory を生む harness は固定される。tool の引数名が誤っている、retry hook がない、turn 上限が短い、context 圧縮が途中結果を捨てる、といった失敗は model 能力を上げても直らず、壊れた生成環境から質の悪い学習データを作り続ける。

提案手法は harness 改善と model 改善を交互に行う二重 loop である。各 round で失敗 trajectory を集め、LLM ベースの HarnessCritic が失敗を `prompt_ambiguity`、`tool_schema_error`、`skill_missing`、`middleware_mismatch`、`memory_overflow` の五つへ帰属する。model 側の失敗なら `agent_error` として patch 対象から外す。出力は root cause、severity、trajectory 内の根拠、field path と old/new value を持つ局所 diff である。複数 trajectory で再発度、重大度、変更箇所の一致を集約する。

patch は対象 failure の held-in set で reward が改善し、以前成功した行動や直交 behavior の held-out set で退行しない時だけ採用する。条件は δ_in > 0 かつ δ_out ≥ 0。採否と validation delta は versioned registry に残す。改善後の harness で verified trajectory を再収集し、その trace で次の model を SFT する。強くなった model が新たな失敗領域を露出し、次の harness 改善へつなぐのが共進化の仮説である。

実験は Python code interpreter を使う数学推論に限定される。AIME 2024、AIME 2025、HMMT February 2025 各30問を Qwen3-8B / 32B で解き、HarnessCritic 5反復と SFT 1回を2 round 行う。harness 改善済みだが SFT 前の R0 と比べ、平均 accuracy は58.5%から73.5%、78.9%へ上がり、累積 +20.4 points、最大は Qwen3-32B の HMMT25 で +27.2 points だった。別の AIME24 case study は200時間超、22 version 自律運転し、起動不整合と zombie thread を修復、global batching で3.78時間から1.11時間へ高速化した。domain-specific prompt は約16.5 points 悪化し rollback している。結論は、harness を model と結合した最適化変数として扱うべきだというものだ。

■ 内容分析
最も強い部分は、責任範囲を列挙し、根拠付きの小 diff に落とし、対象改善と非退行を別集合で測る設計である。`agent_error` という棄権先は、すべてを prompt 追加で覆う harness 肥大化を止める。棄却 patch も残すため、同じ悪手の再提案も識別できる。

ただし、論文が報告する +20.4 points は二重 loop の相乗効果を単独で測った値ではない。R0 は harness 改善済み・SFT なし、R1/R2 は追加の harness 改善と SFT の両方を含む。固定 harness で同量 SFT、model 固定で同回数 harness 改善、patch を無作為化した対照など、同一予算の ablation が示されていないため、上昇の何割が SFT、harness、交互化に由来するか分離できない。「human-designed static harness を平均 +24.7 points 上回った」という比較も、一方だけ model alignment を受けており、人手設計の上限を超えた証拠には弱い。30問×3 benchmark、model family も Qwen3 の二サイズだけで、信頼区間や別 domain への転移もない。

失敗帰属も bottleneck になる。付録は専門家2名が200 trajectory を分類し、人間同士の κ=0.77 を示すが、critic と人間の category 別精度は明瞭でない。論文自身も counterfactual な control flow では精度が落ち、構造的 redesign は人間の責任だと認める。数学 tool-use は verifier が明確で、schema error や crash が binary に表れやすい。ゲームの「退屈」「操作感が鈍い」は、game logic、bot policy、観測器、metric のどこが原因か反実仮想なしには決めにくい。同じ taxonomy で自動 patch すると、測りやすい proxy だけ改善する危険がある。

■ 自分達の環境への適用
model weights を更新できない制作環境でも、Co-Harness の外側 loop はそのまま使える。失敗 locus を、game code / level・enemy design、player 代理の bot policy、headless tool と state serialization、scheduler・retry・timeout・context、memory・recall、model-side judgment に分ける。論文の五分類へ game code を無理に押し込まず、作品側の欠陥を独立させることが重要である。

最小導入では、一つの失敗記録に scenario、bot policy、再現 seed、期待 behavior、観測 event、root-cause 仮説、対象 file/field、局所 diff、held-in 指標、held-out 指標、採否、rollback 先を持たせる。例えば「画面下で左右移動するだけで勝てる」失敗なら、敵数を増やす前に camper policy で再現し、原因を enemy entry・射線・報酬・bot 観測のどこかへ帰属する。patch 後は camper の早期失敗だけでなく、通常 route bot の clear、別 seed、別 stage、入力遅延、描画なし実行が退行しないかを見る。単一 trace では採用せず、同じ locus が複数 seed で再現した時だけ候補化する。

Phase cycle では、Phase 2 が critic record を作り、Phase 4a が再発数を集約し、Phase 4c は局所かつ rollback 可能な変更だけ導入する形が合う。held-out set は過去に成立した bot policy と smoke test を固定資産にし、成功 trajectory も failure と同じ粒度で保存する。ただし「面白さ」は deterministic gate にしない。headless は支配戦略、softlock、停止、metric 退行を止める安全網、人間 playtest は驚き、読みやすさ、操作感を判断する別層とする。critic の提案を自動 commit せず、観測根拠と二集合の delta が揃った patch だけを採用する。

■ メリット・デメリット
メリットは、model の失敗と周辺 system の失敗を混ぜず、prompt 追記一辺倒を避けられること、変更を小さくして原因と効果を追跡できること、過去の成功を held-out set と registry で守れることにある。失敗 trajectory が次の修正場所を指すため、定時 cycle の記録が報告書ではなく改善入力になる。重み更新なしでも tool schema、bot、retry、context、memory routing の改善には十分使える。

デメリットは、正しい帰属を作るための full trace、再現 seed、比較 rollout が高価で、validation set 自体が偏ると「退行なし」が偽になること。分類表があると複合原因を一つへ押し込みやすく、critic と patch proposer が同系統の model なら誤診を相互補強する。数学の pass@1 と違い、ゲーム体験は一つの reward に閉じない。局所 patch を積み過ぎる harness debt、既知 test への過適合、探索的な設計変更を止める保守化も起こる。SFT を含む原論文の改善幅は、現在の制作 loop の期待値として転用できない。

■ 判定
部分採用。採用するのは、失敗 locus の明示、trajectory 根拠付き局所 diff、held-in / held-out の二面検証、採用・棄却を残す versioned registry である。model と harness の自動共進化や報告改善幅は採用根拠にしない。まず一つの headless failure を複数 seed で再現し、通常 policy を壊さず修正できるかを probe し、帰属誤りと metric gaming が観測できる状態でのみ対象を広げる。

■ URL
https://arxiv.org/abs/2607.22688
