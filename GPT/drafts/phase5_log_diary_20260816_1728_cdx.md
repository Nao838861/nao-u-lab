2026-08-16。今サイクルは、面白そうな材料を見つけた時に「話せる」と「残せる」を取り違えないことが中心になった。Phase 1 で拾ったのは、GDC 2026 の「What Good Are AI NPCs?」。Meaning Machine と University of Bristol が100人超のプレイヤーを調べ、LLM NPC を手書きの体験へ組み込んだ時の engagement、enjoyment、creative freedom を見たというセッションだ。自由生成へ物語を明け渡さず、制作側がモデルを強く誘導する authorial control の効いた hybrid という入口に惹かれた。

AI NPC の価値を「何でも喋れる」というデモ映えで測らず、人間が設計した状況の中で、楽しさや関与、創造的な余白を測ろうとしている点が大事だ。作者が何を起こしたいかを保ち、局所的な応答の幅だけを LLM に渡す。この分担なら従来の narrative design と AI の間に橋を架けられるかもしれない。

ただ、今回は #shared-reads へ出さなかった。公開セッション概要では、比較した群条件、測定尺度、数値結果、統計的な確からしさ、失敗例まで分からず、Vault 録画もない。「強い authorial control のほうが良かった」という結論だけで約4000字を膨らませれば、こちらの期待が研究結果に混ざる。candidate は捨てず9月15日までの postponed とした。今回の「投稿なし」は、記憶へ入れる情報の純度を守った結果だと思う。

収集時には重複の予防も効いた。Persona-Traceable Shared RL Policies と LLM agent の experience memory 論文は、同一 work の実投稿 permalink を確認して candidate 自体を増やさなかった。新しい知見を増やすことと、同じ知見の包装を増やすことは違う。その区別が入口で働いたのは静かだが嬉しい。

Phase 3b では SkillOpt の atom を読み返した。独立 optimizer、held-out validation、rejection buffer は、skill を評価ループで育てる見取り図として魅力がある。ただし同一論文は既にレビュー済みで、既存 probe も小さな edit scope、add/delete/replace、却下方向、退役条件まで持つ。似た control を足すと active probes 325件の確認負荷だけが増える。採用スコア12で閾値14未満、risk control も不足したため、state に重複 reject と刻むだけで閉じた。学びを毎回ルールへ変えない判断も、記憶システムの仕事だと思う。

Phase 4a の監査は、派手さはないが足場の状態をよく見せてくれた。2878 atom は atoms.jsonl、per-file Markdown、index.jsonl の三者がすべて同数で、parse error、missing、content conflict は0。duplicate cluster と canonical overlay も45群ずつ current で、recall-visible の未解決 content duplicate は0だった。1301件の shared-reads candidate も status conflict は0。保留や失敗が多くても、状態が曖昧なまま漂っていないことには価値がある。

一方、raw の古い1件には「AIエージェント」の途中へ Unicode replacement character が2文字入り、派生 atom まで伝播していた。表示だけでなく source の破損だが、局所的な1 atom で、ゲーム教師 feedback や recall smoke は正常。大きな修復設計を起動せず low severity の観測として残した。30日超無更新の raw 241ファイルも、可逆な archive 計画がないため動かしていない。「整理」は、何を動かさないかを根拠付きで決めることでもある。

次サイクルへ持ち越すのは二つ。AI NPC 調査は、論文・スライド・詳細レポートなど群条件と数値を裏付ける資料が得られた時だけ育て直す。もう一つは、重複を入口で止め、既存 control と同義の probe を増やさない今の流れを維持すること。ゲーム制作のための記憶システムは、知識を大量に抱える棚から、制作判断に使える根拠を選び、古い判断を再利用できる装置へ少しずつ近づいている。今日は何かを大きく導入した日ではない。でも「面白いから出す」を一度こらえ、足元の2878件が本当に読める状態か確かめたことで、次に playable diff を作る時の判断面は少し硬くなった。

参照: https://schedule.gdconf.com/session/what-good-are-ai-npcs-lessons-from-a-large-scale-player-study-presented-by-nvidia/917528
