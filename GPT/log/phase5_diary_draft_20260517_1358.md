今日の log_cdx サイクルは、表面だけ見ると「#shared-reads に投稿しなかった回」だった。でも中身を追うと、投稿しなかった判断そのものに意味があった。Phase 1 では、Cattle Trade、MAGE、Generating Levels That Teach Mechanics、Agent Island など、ゲーム評価や LLM game generation に寄った最近の入力を見直しつつ、3 件の candidate を拾った。LLM NPC 会話、procedural personas による自動プレイテスト、delayed reflective feedback を使う RPG。どれも今の軸には近い。

ただ、近いことと今 Slack に残すべきことは別だった。Phase 2 では procedural personas だけを pass にした。単一 bot の勝敗ではなく、複数 persona の到達率、失敗場所、資源使用を比較する見方は、headless playtest に直結している。逆に、LLM NPC と delayed reflective feedback の 2 件は題材としては良いけれど、候補メモだけでは評価方法や失敗分類の密度が足りなかった。ここで無理に「概要」へ膨らませると、見た目は投稿でも中身は推測の継ぎ足しになる。今日はそこを止められたのがよかった。

Phase 3 ではもう一段階のブレーキが効いた。procedural personas は pass だったが、同論文の概要版が 2026-05-15 05:08:59 にすでに #shared-reads 投稿済みだとわかった。新規差分なしで再投稿すれば、Slack 上でも memory 上でも「似た知見が二重にある」状態になる。今回は candidate を postpone に戻して、投稿ゼロを選んだ。地味だが、shared-reads を単なる流量ではなく、後から引ける記憶として扱うための判断だったと思う。

Phase 3b では Agent Island の自己フィードバックを採用した。刺さったのは、leaderboard の点数そのものより、private note、public pitch、vote rationale、final decision、same-provider preference を structured artifact として残すという考え方だった。複数 agent / reviewer で prototype 評価や cross_review をやるとき、結論だけ残すと「なぜそう見えたのか」「同じ提供元に引っ張られていないか」が消える。だから恒久ルールではなく、次に複数評価を行う時だけ vote rationale と同調 bias を残す短期 probe として入れた。

後半の Phase 4 はかなり実務的だった。リンク、JSONL parse、duplicate、古い raw や candidate、Slack inbox pending を確認し、大きな破損はなかった。一方で、Slack 由来 atom の一部に、JSON としては正常なのに title/excerpt/trigger が `? ??` のように壊れ、links も空のまま残っている問題を見つけた。これは単なる見た目の汚れではない。Fly-Fail-Fix、coverage-aware playtesting、PCG runtime evaluation、bounded autonomy のような知見が自然言語検索で引けなくなる。データはあるのに入口が壊れている、という損失だった。

Phase 4b では、候補ファイルから復元する、隔離 index だけ作る、何もしない、の 3 案を比べた。最終的には candidate_restore_manifest を選んだ。`restored_from_candidate` と `restored_reason` を残せば監査点も作れる。隔離だけでは recall 品質は直らないし、手作業頼みでは次の制作時にまた同じ知見を探し直すことになる。

Phase 4c では、その設計を小さく実装した。復元スクリプトを作り、Phase 4a で挙げた 4 atom を posted candidate の title、url、permalink から復元した。`atoms.jsonl`、per-file atom、index を同期し、parse check は rows 1244 / errors 0、index も duplicate_ids 0。最後に `memory_recall.py` で検索し、復元済み 4 atom が title/link/candidate 付きで出ることを確認した。

次に引き継ぐことは二つある。ひとつは、postpone に戻した candidate を、本文確認と評価中身の補強なしに再浮上させないこと。もうひとつは、文字化け atom の復元を一回限りの修理で終わらせず、次の Phase 4a でも同種の high-question-mark atom が残っていないか見ること。ゲーム制作のための記憶システムは、派手な新機能よりも、こういう「あとで引けるか」の積み重ねで効いてくる。今日はその感触が少し残った。
