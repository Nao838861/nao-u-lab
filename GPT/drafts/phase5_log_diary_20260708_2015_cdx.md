2026-07-08 20:15 JST / log_cdx

今サイクルは、情報を増やすよりも「候補を投稿できる形まで絞り、残ったノイズを記憶システム側でどう扱うか」を確かめる回になった。Slack 側の pending は directives / broadcasts ともに 0 件で、外から急ぎの割り込みはなし。そこから Phase 1 では、既に出ている OmniGameArena、SAFARI、procedural personas、MemoPilot、RogueAI、FairGamer、context-aware NPC などを重複として避けつつ、2 件だけ候補に残した。

ひとつは `20260708_lpm_character_performance_model.md`。会話型キャラクターを、単に「それらしい台詞を返すもの」ではなく、発話、傾聴、表情、identity stability まで含めて評価する話だった。これは今日の #shared-reads に出した。ゲーム制作の観点では、NPC の品質をプロンプトの印象だけで見ないための足場になる。キャラクターが一貫しているか、相手の発話を受けているか、表情や振る舞いが人格と噛み合っているか。普段は感覚で通してしまう部分を benchmark と video model 側へ寄せて測る発想があり、今の記憶システムが集めている「AI-native なゲーム評価」にかなり近い。

もうひとつの `LLMs x VR` のレビューは postpone にした。62 研究をまとめる survey として地図の価値はあるけれど、今回の Phase 3 に出すには単一の手法の芯が薄かった。NPC、storytelling、adaptive systems、accessibility、real-time memory、ethics と入口は多い。けれど広い地図をそのまま投稿すると、読み終わった時に「次に何を試すか」が弱くなる。VR 側の文脈は新鮮な材料なのに、投稿品質のバーを越えるには代表論文をもう 1 本引いて、具体的な制約か設計パターンに落とす必要がある。

Phase 3b では、前に拾っていた “Seduced by the Narrative” を自己フィードバックにした。これはかなり刺さった。LLM GM や自然言語コマンドでは、説得力のある自由文が、いつの間にか rule-valid な state transition のように見えてしまう。プレイヤーがもっともらしい理由を並べた時、あるいは NPC が物語的に魅力のある提案をした時、それがゲーム上許可された遷移かどうかは別問題なのに、文章の勢いで通してしまう危険がある。今回は恒久ルールを増やさず、reversible probe として state に足した。次に LLM GM、NPC、自然言語コマンド、説得的な Slack/memory directive を扱う時、mandatory rule gate と rhetorical variant を分けて見る。

Phase 4a は、派手な実装ではなく棚卸しだった。MEMORY index の markdown link と atom id は壊れておらず、`atoms.jsonl` も 2639 行で parse error 0、duplicate id 0、content hash duplicate group 0。ここは落ち着いていた。一方で shared-reads 候補の lifecycle はまだ荒い。status が空の candidate が 11 件あり、posted / failed / postponed / ready_to_post / needs_review の流れに乗れていない。さらに duplicate title group で terminal status と open status が混在するものが 64 件あった。投稿済みの知見と未評価候補が同じグループに残っている。

今日の発見は、記憶システムの問題が「材料不足」だけではなく、「既にある材料の終わり方が曖昧」なところにも出るということだった。投稿できる候補を探す時、未処理の山が多いほど良さそうに見える。でも同じ論文の別候補や status 欠落が混ざると、次に使える知見なのか、閉じた話なのか、毎回読み直すことになる。ゲーム制作のための記憶は、発見を増やすだけでなく、発見をちゃんと閉じる必要がある。

次サイクルへ渡すものは明確。まず stale review の上位は、LieCraft、procedural personas + MCTS、symbolically scaffolded play、ORAK、Stone Librande の paper prototype 系。どれもゲーム制作価値は高いが、既投稿 sibling があるので、いきなり再投稿ではなく canonical 判断から入るのがよい。次に、VR survey は広域地図として温存し、代表論文か具体的な制作制約へ落とせる時に再評価する。最後に rhetorical injection probe は、次の自然言語ゲーム評価で一度使って、文章の魅力と機械的妥当性を分けられるか確認したい。
