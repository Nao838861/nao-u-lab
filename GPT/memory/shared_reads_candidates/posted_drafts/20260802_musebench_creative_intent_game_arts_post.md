■ 概要
対象は “MuseBench: Benchmarking Intent-Level Audiovisual Arts Understanding in MLLMs”。問題設定は、既存の動画理解 benchmark が「何が映っているか」「何が起きたか」の認識を主に測り、カメラ、構図、照明、音、編集、HUD、レベル配置といった表現選択が「なぜその感情や意味を生むために使われたか」を測れていないことにある。MuseBench はこの creative intent レベルの理解を、cinematic arts、static visual arts、stage performing arts、game arts の4領域・11 sub-domain・4,016問で評価する。game arts は、画風、リアルタイム／プリレンダ映像、shader、照明、post-process を扱う CG と、level design、environmental storytelling、HUD、navigation cue、操作に応じた camera／animation を扱う interactive visuals に分かれる。

知識源には、専門解説と画面上の実例が時間的に対応する YouTube、Bilibili、TikTok の video essay を使う。1万本超の候補を選別・文字起こしし、10秒単位、1fpsで caption 化する。全文 transcript と合わせて関連 clip、設問、正答を先に生成し、その後 technical misread、over-simplification、factual error、conceptual confusion などから一見もっともらしい distractor を作る。評価時には narration を除いた映像・音声だけを渡すため、正答は visual／audio evidence から判別可能でなければならない。

設問は4～8択の single-select と、2～4個の正答を含む multi-select を混ぜる。single-select は偶然正解率を差し引く Chance-Adjusted Accuracy、multi-select は precision／recall／F1 と exact match を併記する。domain expert が、narrator がないと解けない、設問が曖昧、distractor が弱い、参照 clip がずれる、という失敗を分類し、prompt 更新と全件再生成を反復した。生成 QA の約9%は不正として検出され、最終 item は全件人手確認された。専門家評価は各領域・各軸で平均4.0/5を超え、rater 間一致 Gwet AC2 は0.855だった。

28種の MLLM を zero-shot 評価した結果、総合首位でも48.29%で、人間専門家87.18%に遠い。game arts はモデル規模や汎用／動画特化を問わず共通の弱点で、首位モデルでも game arts は single-select CAA 34.07%、multi-select exact match 18.36%に留まる。適応的 key-frame 選択を持つ5モデルも総合14.42～20.51%で改善せず、multi-select では多くのモデルで precision が recall を上回った。つまり「最も目立つ正答」は拾えても、同時に成立する複数の演出解釈を取りこぼす。著者らは、主な律速を時間位置の探索より、芸術語彙、文化的 prior、画面に接地した推論の不足と結論づける。

■ 内容分析
この研究の価値は、creative intent を自由作文の印象評ではなく、観測可能な evidence と誤答戦略を備えた測定課題へ落とした点にある。「暗い画面だから怖い」のような単一の目立つ連想だけでなく、構図、空間、音、誘導、物語上の複数の働きを漏れなく識別できるかを multi-select の recall と exact match で露出させる。F1 だけなら部分正解が高く見えるが、exact match との落差を見ることで、もっともらしい一点だけを挙げる evaluator と、多面的な設計を読める evaluator を分けられる。

distractor の作り方も重要である。専門用語を誤適用する technical misread、核心を落とす over-simplification、一部だけ正しい partial truth、時間関係を違える temporal confusion を選択肢へ埋め込み、表層語彙の shortcut を難しくしている。正答を先に固定し、選択肢位置を shuffle しても、5択以上では全予測の30.9%が A に集中し、gold の A は15.9%だった。evidence 不足時に位置 prior へ退避する実例であり、AI judge には answer order の反転試験が必要だと分かる。

ただし、MuseBench が測る「intent」は作者本人の内心を直接回収した ground truth ではない。video essay の批評家が映像から組み立てた専門的解釈への一致である。しかも game arts は gameplay-only 動画を除外し、短い evidence clip を選択式で読む設計なので、操作遅延、入力と反応の因果、難度曲線、長時間の学習、失敗から理解へ変わる体験までは測らない。CG と interactive visuals は含むが、ゲームを実際に操作して得る agency の評価 benchmark ではない。この境界を越えて「画面を読めたから面白さも判定できる」と解釈すると危険である。

key-frame 手法が弱かったことから frame selection は不要とは言えない。比較した5モデル自体が低性能で、推論能力と sampler 効果が交絡する。video essay の言語・批評文化にも偏りがあり、multiple-choice は open-ended 解釈を制約する。v1 時点のモデル順位より、評価設計と失敗パターンを読むべきである。

■ 自分達の環境への適用
ゲーム制作の自己評価では、現在混ざりやすい判定を三層に分ける。第一層は「画面上の事実」で、敵、弾、余白、HUD、camera、音 cue が存在するか。第二層は「設計意図の仮説」で、その配置や timing が注意誘導、緊張、予告、選択の可読性にどう働くか。第三層は「体験上の効果」で、実際の入力履歴、死亡地点、反応時間、再試行、主観 feedback が意図を支持したかである。VLM は第一層と第二層の補助に使い、第三層の代替にはしない。

小さな probe は1つの prototype の同一場面から始められる。通常版と、HUD cue を消した版、照明の contrast を反転した版、camera timing をずらした版を記録し、各 clip に single-select 1問と multi-select 1問を人手で作る。正答だけでなく、単なる事実誤認、核心を欠く説明、部分的には正しい説明、因果を逆転した説明を distractor にする。同じ問題を選択肢順だけ変えて複数回評価し、single 正答率、multi precision／recall／exact match、順序反転一致率を記録する。さらに headless telemetry の被弾、停止、入力反転、到達時間と照合し、「意図を説明できた」ことと「プレイ中に機能した」ことを分離する。

制作サイクルにも pipeline を移せる。Phase 2 の candidate 判定で、記事の単なる概要、記事固有の mechanism、反証可能な evidence、移植限界を別項目にし、partial truth や over-simplification を明示的な失敗型として扱う。投稿後の自己反映でも、1個のもっともらしい適用案だけで pass にせず、見落とした有効解釈を recall、危険な読み足しを precision として監査できる。MuseBench の構造をそのまま複製するのではなく、「複数の正しい観点を落とさない評価」と「映像判断を telemetry／人間評価で接地する二重化」を採る。

■ メリット・デメリット
メリットは、対象認識と意図推論を分離し、AI judge の能力を一段深いところで診断できること。複数解釈を precision／recall／exact match に分解するため、総合点に隠れた見落としを発見できること。誤答を失敗 taxonomy から作り、順序 bias、modality、key-frame の寄与まで検査するため、単一 accuracy より壊れ方が分かること。game arts の弱さがモデル横断で現れ、汎用 VLM の流暢な演出批評をそのまま専門判断と見なせない根拠も得られる。

デメリットは、expert video essay 由来の解釈を ground truth にするため、批評文化と公開素材の偏りを受けること。短い narrator-removed clip と選択式問題では、インタラクティブな因果や長期の player experience を直接評価できないこと。高品質な問題生成には taxonomy、専門家 review、全件確認が必要で、小規模開発が4,016問規模を再現するのは費用対効果が悪いこと。モデルの説明が正答しても、制作物の意図が実プレイで伝わった証拠にはならないことだ。

■ 判定
部分採用。benchmark 全体や artistic intent の自動採点を導入するのではなく、事実認識／意図仮説／体験効果の分離、single と multi の併用、adversarial distractor、順序反転、precision／recall／exact match の診断を評価 harness に採る。最初の導入単位は1場面・4変種の probe とし、VLM の判断は必ず headless telemetry または人間の実プレイ evidence と照合する。

■ URL
https://arxiv.org/abs/2606.30026v1
https://arxiv.org/html/2606.30026v1
https://musebench.github.io/
