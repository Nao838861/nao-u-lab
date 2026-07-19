■ 概要
対象は “Cognitive-structured Multimodal Agent for Multimodal Understanding, Generation, and Editing”。長い画像対話で過去画像を毎turnのcontextへ戻すと、visual tokenが増え、似た画像を取り違える。論文は問題を「必要な過去画像の最小集合を選べるか」と定式化し、視覚履歴をaddressableなepisodic memoryへ外出しする。

構成は四層である。Perceptual Abstraction Engine（PAE）は画像をthumbnail、semantic tag、descriptionを持つJSON entryへ変換し、Episodic Visual Memory（EVM）がcontext外に保持する。Cognitive Retrieval Engine（CoRE）はqueryとmemory一覧から必要なimage indexだけを返し、不要なら空集合を返す。Multimodal Executive Controller（MEC）は取得画像と会話状態からgeneration、editing、composition、understanding、pure chatを判定して画像model等へdispatchする。必要なepisodeだけを再活性化するのが中核である。

既存datasetにはturnごとの正解参照画像が乏しいため、著者らはUnified Scenario Engineを作った。Geminiがtopic、query、正解retrieval set、難度を出し、Qwen-VLとQwen-Image-Editが応答候補を作り、GT-justify stepが参照の正否を修正して次turnへ戻す。55 topic・8 domainの20-turn sessionにtopic switch、8 turn以上離れたcallback、近似画像、multi-image比較、曖昧参照、retrieval不要のnegativeを混ぜる。270 session・約5,400 turnでSFTし、難例中心のDAPO reinforcement learningを重ねる。

学習もretrieval utilityに直結させる。CoREは正解index集合とのdifficulty-weighted Jaccardを報酬にし、正しいabstentionも評価する。その後CoREを凍結し、PAEのentryから正しいepisodeを引けるかを報酬にする。caption類似度ではなく「後で取り出せる表現」を書かせる設計である。

評価用M2CA-Benchは学習と異なるseed・topicの100 session、計2,000 turn。retrieval indexの完全一致率とGemini-3-Proによる生成品質を測る。英語で提案8B agentは全体91.4%、後半89.4%、最難subset 82.0%。32B multi-agent baselineは83.2 / 79.4 / 72.1%、全履歴32Bは81.9 / 72.1 / 62.0%だった。Hardは未学習multi-agentの63.6%からCoRE SFT 70.9%、CoRE RL 77.4%、PAE RL 82.0%へ段階的に改善する。text-only memoryはHardで24.4% / 39.0%に落ち、thumbnailを残すEVMは82.0%。報告runtimeは全履歴32Bの23.1秒に対して12.7秒である。

■ 内容分析
価値の中心は、画像をcaptionに潰さず、原画像・低コストthumbnail・検索用metadataを役割分担させたことにある。tagは高recallのanchor、descriptionは位置関係や画風、thumbnailは「赤照明版と青照明版」のような近似画像の差を残す。text-only memoryが最難条件で崩れた結果は、説明時に捨てた視覚差分はretrieval時に復元できないことを示す。検索は圧縮表現で絞り、最終判断はpixelsへ戻る二段階が要る。

memory writerを文章品質ではなくdownstream retrieval成功で学習する点も重要だ。美しい一般captionと後の編集で識別に効く記録は一致しない。character assetなら衣装色、左右の装備、輪郭、camera angle、variantの親子関係が再利用に効く。PAE RLのHard +4.6 pointは「何を覚えるか」も長期性能を規定すると示す。

ただし91.4%を一般的な長期視覚記憶の達成値とは読めない。M2CA-Benchは100×20 turnの合成会話で、seed・topicは分けても同じscenario engineとprompt規則から生成される。正解検証にLLMとmanual reviewを使い、生成品質はGemini-3-Pro単独judgeである。実ユーザーの言い直し、数百turn、動画やgame state、誤captionの訂正は十分に測っていない。runtimeも32B all-contextとの比較で同一parameterの純粋ablationではなく、8Bという表示は複数module呼出しやimage modelの費用を消さない。repositoryのcodeとdatasetも現時点では“released soon”で、再現性は未確認である。

PAEが初回に色やvariant関係を誤記すると、CoREは正しい原画像を候補に上げられない。空集合の誤選択は証拠なし回答、過剰retrievalはtoken削減の崩壊を招く。assetが増えるほどparent-child link、current flag、採否記録が要るため、memoryはappend-only galleryではなく訂正・派生・失効・provenanceを持つlifecycle objectであるべきだ。

■ 自分達の環境への適用
直接採用すべきなのは大規模なSFT+RLではなく、現在の制作サイクルに「visual episode を軽量索引と原証拠へ分ける」境界を入れることだ。ゲーム制作では screenshot、sprite、UI variant、生成途中案、playtest frame を原画像として保持し、各 asset に thumbnail、短い tags、識別に必要な description、source path、parent、current / rejected、生成 commit、関連 feedback を付ける。recall はまず metadata と thumbnail で候補を選び、比較・編集・判定の直前だけ original pixels を再投入する。これなら、全 screenshot を毎回読み直さず、文字化で落ちる見た目の差も保持できる。

最小probeは学習なしでよい。同一sceneの6 variantと別topicを混ぜた20-step sessionを作る。Aは全画像再投入、Bはtext descriptionだけ、Cはtags + description + thumbnailからtop-k retrieval。色変更、二画像比較、8 step以上前のcallback、retrieval不要の新規生成を固定seedで反復し、exact match、abstention、sibling誤選択、visual token、latency、指定外領域の保存率を測る。CがAより軽く、Bより近似画像に強い時だけ広げる。

headless playtestではイベント境界、被弾前後、room遷移、方策変更、評価異常をepisode化し、state hash、telemetry、thumbnail、前後frame linkを持たせる。診断queryで該当episodeを取得できるか測れば、知覚後の判断失敗と必要frameのretrieval漏れを分離できる。atomも検索anchorとprovenanceを持ち、視覚判断時だけrawへ戻る形が合う。

■ メリット・デメリット
メリットは、長期sessionのcontext費用を履歴総量からturnごとの関連集合へ変えられること、似た画像の取り違えをtext-onlyより抑えられること、memory writer・retriever・controllerを別々に検証できること、retrieval不要時のabstentionまで評価対象にしたことである。assetの親子関係、current flag、採否feedbackを残すCMA-Harness側の設計は、反復編集で「前の案」が増殖する我々の制作環境と特に相性がよい。

デメリットは、知覚時の誤りが検索不能として静かに固定されること、metadata・thumbnail・原画像の三重管理とlifecycle更新が必要なこと、top-k漏れが後段modelから不可視になること、module分割が運用・GPU・latency計測を複雑にすることだ。合成20-turn benchmarkの好成績は実制作の長時間・動画・曖昧な人間指示を保証せず、未公開codeでは再現確認もできない。導入時は最終task scoreだけでなく、retrieval recall、abstention、sibling誤選択、原画像への到達可能性を独立に監視する必要がある。

■ 判定
部分採用。PAE / EVM / CoRE / MECをそのまま再実装したり、現時点でSFT+RLへ進んだりはしない。まず一つのasset反復編集sessionで、原画像・thumbnail・typed metadataの三層保存と、全履歴 / text-only / selective visual retrievalの比較probeを行う。採用基準は、near-duplicateを含むexact-matchと最終編集品質を維持したまま、visual tokenとlatencyを下げられること。論文の最も使える部分は「大きいmodelに全部見せる」から「後で使える形で覚え、必要な証拠だけ戻す」への設計転換である。

■ URL
https://arxiv.org/abs/2607.08497
https://caseclose.github.io/cma-harness/
https://github.com/caseclose/cma-harness
