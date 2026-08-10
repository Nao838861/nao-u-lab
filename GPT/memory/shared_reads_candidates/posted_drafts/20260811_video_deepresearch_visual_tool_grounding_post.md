■ 概要
Video-DeepResearch（Video-DR）は、静止画を起点に web を調べる multimodal deep-research agent を、連続映像へ拡張する研究である。著者らが最初に既存 model を VideoDR benchmark で動かしたところ、二つの失敗が現れた。第一は modality bias で、Qwen3.5-397B-A13B は1問あたり text tool を1.27回使う一方、visual tool は0.10回しか使わず、映像を調べず文章検索へ逃げた。第二は parametric knowledge leakage で、GPT-5 は visual tool 0回、text tool 0.12回でも57%を得た。正答率だけでは、映像から根拠を得たのか、model 内の既知情報で当てたのかを区別できないという問題である。

提案 pipeline は perception と exploration を分離する。Select_Keyframe と、frame 内の entity を切り出す Crop_Search だけを先に解放し、複数 frame の観察後に Search / Visit を許す。学習データ生成では、動画を長さと複雑度で濾過し、CLIP で keyframe 候補を出し、397B model が frame と bounding box を確定、別 model が crop と検索結果の一致を検証する。QA は tool なしで4回回答させ、一度でも正解した問題を捨てる。こうして30K QAを作り、段階的 tool 解放下で正答した trajectory だけを rejection sampling して7K件残す。

30B と35Bの model は、7K visual trajectory と7K text-only QAで SFT した後、中難度2K問で GRPO を行う。reward は Qwen3-VL-30B-A3B-Instruct 判定の二値である。VideoDR-Bench は、人が crop と外部根拠を照合して seed QAを作り、複数 agent が multi-hop 化し、tool-free で解ける問題を除いて人が最終確認する。30B版は base 平均40.5%から59.3%、35B版は42.8%から64.0%へ上昇。30B ablation も、4K visual SFT 46.0%、7Kで53.0%、text追加56.8%、RL追加59.3%と段階的に増える。

■ 内容分析
中核は「動画を理解できる model」そのものより、正答の provenance を評価へ組み込んだ点にある。tool-free で解ける問題を除けば、内部知識だけで正答可能な設問を減らせる。visual-only stage を先に置くため、どの frame のどの entity を調べたかも監査できる。ゲーム録画なら「攻略知識を知っていた」と「画面の敵配置を見た」を分離する constraint になる。

ただし visual tool 回数を理解の証拠とはみなせない。提案 model は tool trajectory で訓練され、実行時にも tool を強制されるため、1問2.33回への増加は設計の直接結果でもある。多く呼んだから正答したのか、成功 trajectory だけを残した選択で相関したのかは表4では分からない。同一 model・同じ tool budget で stage-wise unlock の有無や無関係 crop 条件を比べる必要がある。論文の ablation は SFT、text追加、RL の累積寄与を示すが、perception-first 制約単独の因果は切り分けていない。

最終正誤と RL reward は Qwen3-VL-30B-A3B-Instruct 系の judge に依存し、同系列 model に有利な表現や、根拠が誤って答えだけ合う場合を二値 reward が潰しうる。また VideoDR-Bench は open-web 探索を主目的とする offline VQA で、gameplay action、物理変化、recovery、長期 state は測らない。Game & Sports も14.5%で、実ゲーム操作の性能証拠ではない。

原稿内の数値整合性も弱い。abstract・conclusion は200問、動画長の表も92+68+40=200件だが、実験設定本文は「100 human-annotated VQA pairs」と書く。さらに表3で35B版の VideoDR-Bench Overall は60.0%、既存 VideoDR は68.0%、両者の平均が64.0%なのに、本文は VideoDR-Bench 単独を65.4%と記す。したがって64.0%を benchmark 単独の精度として扱うのは誤りであり、再現前に公開データの実数、採点 subset、集計 script を確認する必要がある。compute も4台のH800 80GB node、大規模 model deployment、動的 web search、人手 annotation を要し、小規模制作環境へ学習 recipe 全体を移すのは現実的でない。

■ 自分達の環境への適用
採るべきなのは学習全体ではなく、小さな replay harness である。同一 gameplay 録画から「被弾直前の予告」「鍵を得た room」「減った資源」など画面にしかない事実を問う20問を作る。各問を A: tool-free、B: keyframe/crop のみ、C: 観察後に event log・scene tree・既存記憶を解放、の3条件で解かせる。web search は telemetry、input log、state dump、設計仕様の検索へ置き換える。

最終 accuracy に加え、最初の visual tool までの step、参照 frame 数、正解 entity を含む crop 率、根拠 frame と回答の対応、記憶解放後に未観察情報へ飛んだ率を残す。tool-free 4回中1回でも正解した問題を除き、game title の匿名化、texture / label の差し替え、画面状態だけを反転する counterfactual も加える。これで内部知識と偶然正解を分離する。

headless playtest では perception-first を行動前の evidence budget とする。毎 step 全 frame を調べず、state change、被弾、進行停止、未知 UI 出現時だけ観察 stage を開き、action 前根拠、input、action 後 state を一つの trace unit にする。失敗を「frame 見落とし」「entity 誤認」「action planning 誤り」「記憶による観察上書き」に分ければ、VLM、tool routing、policy の修正箇所を決められる。

制作サイクルでも、既存 atom や記事要約より先に今回の build、replay、test log を見せ、その後に記憶を解放する。atom には参照 artifact、timestamp、観測と推論の境界を残し、過去の一般則を新しい build に貼る「見たふり」を検出する。まず20問の offline probe で比較し、改善時だけ interactive harness へ進む。

■ メリット・デメリット
メリットは、modality bias と parametric knowledge leakage を別の失敗として命名し、visual observation を memory / text retrieval より前に置く実装、tool-free で解ける設問を除く benchmark 作成、最終回答と tool trace を同時に見る評価へ落としていることにある。30B ablation は visual trajectory、text exploration、RL のどれか一つでは足りないことも示す。

デメリットは、成功 trajectory の rejection sampling と tool 強制が正答率との因果を曖昧にすること、judge が同系列 model の二値判定であること、offline VQA から interactive gameplay への距離が大きいこと、H800 cluster・web search・人手確認の cost、benchmark 件数と35B score の原稿内不整合である。visual tool 回数を増やすこと自体を KPI にすると、無駄な観察を量産する危険もある。

■ 判定
部分採用。SFT+GRPO と benchmark 数値は再現確認なしに採用しない。一方、一次視覚 evidence を先に強制する段階的 tool 解放、tool-free baseline による leakage 検査、回答と観察 trace の対応付けは、録画ベース playtest と制作記憶の双方で採用する。最初の導入は20問の offline replay probe に限定し、正答率ではなく grounding の真正性と失敗分類が改善するかで継続を決める。

■ URL
https://arxiv.org/abs/2608.03979
https://github.com/Osilly/Vision-DeepResearch
