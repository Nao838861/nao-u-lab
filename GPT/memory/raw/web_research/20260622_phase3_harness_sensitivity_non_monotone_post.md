■ 概要
この論文は、LLM agent の信頼性についてよく置かれる二つの仮定を検証している。一つは、harness を厳密で構造化されたものにすれば一般に reliability が上がる、という仮定。もう一つは、高性能モデルほど細かい構造的ガイドを必要としない、という仮定である。この二つを合わせると、model capability tier が上がるほど optimal harness complexity は下がる、という単調な逆相関が期待される。論文は、この見方が少なくとも評価したモデル群では成り立たず、agent reliability はモデルの強さだけでも harness の厳しさだけでもなく、model type と harness fit の相互作用で決まると示す。

実験は、six models、four capability tiers、three harness conditions を掛け合わせた 432-run controlled experiment として設計されている。harness condition は light、balanced、strict。評価には HEAT-24 という 24-task synthetic benchmark を使い、workspace は git-based verification で確認される。つまり、agent が単にそれらしい応答を返したかではなく、ファイル編集や作業結果が workspace 上で期待通りになったかを見る形に近い。主要指標として VTSR が使われ、latency と failure taxonomy も併せて分析される。

結果は単純な「強いモデルほど楽に扱える」ではない。frontier chat model として評価された Gemini 2.5 Flash では、harness verbosity を増やすと VTSR が 29-38 percentage points 下がる。論文はこれを harness-complexity paradox と呼ぶ。つまり、指示を詳しくし、構造を増やしたつもりが、chat model には余計な解釈負荷や形式拘束として働き、成果物の正しさを落とす場合がある。一方で、frontier reasoning model として評価された Qwen3.5-122B extended thinking enabled では、strict harness が highest VTSR 91.7% と lowest latency を示した。これは「高性能モデルほど軽い harness でよい」という予測の逆で、reasoning model は厳密な構造をうまく利用し、迷わず作業を収束させた可能性がある。

さらに、constrained tier の 2B model である Gemma4:e2B が、すべての harness で 91.7% の stability を示し、strong-open-tier stability と同等に見える結果も報告されている。ただし著者は、各 tier が single model で代表されているため、tier 一般の結論ではなく model-specific observation として解釈すべきだと明示している。ここは重要で、論文の価値は「この tier にはこの harness」と決め打ちすることではなく、harness sensitivity が非単調で、chat vs reasoning の違いや model family の癖に強く依存することを示した点にある。

失敗分析では six-label failure taxonomy が提示される。低能力モデルでは wrong_file が支配的になりやすく、どのファイルを触るべきか、どこに成果物を置くべきかといった workspace grounding が壊れる。一方で、能力の高いモデルでは format_violation が目立つ。これは、内容理解や実装能力はあっても、要求された出力形式、編集境界、検証手順、メタ指示の扱いで逸脱するという種類の失敗である。したがって、低能力モデルにはファイル対象や作業面の grounding を厚くし、高能力 chat model には過剰な verbosity を避け、reasoning model には strict harness を使ってもよい、という tier-aware ではなく model-aware な harness selection が必要になる。

■ 内容分析
この論文の焦点は、能力比較そのものではなく、agent を包む作業条件の感度である。実装 agent や調査 agent を運用していると、「もっと厳密な AGENTS.md にすれば事故が減る」「最新の強いモデルなら細かい手順は不要」と考えがちだが、結果はその直感を崩している。特に Gemini 2.5 Flash で strict / verbose な harness が大きく VTSR を落とした点は、規則を増やすことが常に安全側ではないと示す。指示が増えるほど、agent は本来の作業対象ではなく指示構造そのものの処理に資源を使い、形式遵守と実作業の間で破綻する可能性がある。

対照的に、Qwen3.5-122B extended thinking enabled で strict harness が latency まで下げたのは面白い。厳密な手順が「読むものが増えた負担」ではなく「探索空間を狭める足場」として働いたと解釈できる。つまり、harness の良し悪しは文量ではなく、モデルがその構造を実行計画へ変換できるかで決まる。

ただし、実験規模の読み方には注意がいる。432-run は controlled experiment として意味があるが、各 tier の代表モデル数は限られ、HEAT-24 も synthetic benchmark である。ゲーム制作、Slack 投稿、長期記憶運用にそのまま一般化するのではなく、自分達の workflow で同じ非単調性が出るかを検証するための仮説として使うべきである。

■ 自分達の環境への適用
Nao_u_BOT では、AGENTS.md や phase prompt が長く、Slack 投稿、git gate、memory lifecycle、ゲーム制作ルールが同居している。今回の示唆は、これらを全 agent / 全モデルに同じ強度で適用しないこと。たとえば、ファイル編集に弱い agent には `wrong_file` 対策として対象 path、stage 対象、編集禁止領域、検証コマンドを短く明示する。一方で、形式逸脱が多い強いモデルには、長い説明よりも「必須出力順」「禁止事項」「最終チェック」の compact な harness にする。

ゲーム制作では、coding agent、playtest agent、調査投稿 agent を同じ harness にしない。coding agent には作業ブランチ、対象ファイル、テスト、差分確認を厚くする。playtest agent には観測項目、入力 API、失敗分類を厚くする。shared-reads agent には URL 位置、項目順、文字数、candidate 更新だけを強く縛り、本文の分析軸は記事ごとに自由度を残す。さらに、Phase 3b の自己フィードバックで `wrong_file`、`format_violation`、`over_verbose_instruction_conflict` のような簡単な失敗ラベルを残すと、次回の harness 調整が経験則ではなくログからできる。

■ メリット・デメリット
メリットは、harness を一枚岩のルール集ではなく、model / task / failure type ごとの調整対象として扱えること。強いモデルに過剰な説明を与えて性能を落とす事故や、弱いモデルに自由度を与えすぎて wrong_file を起こす事故を減らせる。

デメリットは、ローカル検証なしに一般化すると逆効果になること。論文自体も model-specific observation として慎重に書いている。モデル更新や task 変更で最適 harness は変わるため、preset は定期的に再評価が必要になる。

■ 判定
採用。ただし恒久ルール追加ではなく validation probe として採用する。各 agent workflow で light / balanced / strict の小さな A/B を行い、成功率、latency、wrong_file、format_violation を記録して、モデル別 harness preset を更新する。

■ URL
https://arxiv.org/abs/2605.26731
