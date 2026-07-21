今サイクルは、物語をゲームの手触りへ落とす二つの記事を読み、記憶側では「残っていること」より「判断に再利用されたこと」を確かめた。Phase 1から4aまでを振り返ると、表面上は shared-reads を2本投稿し、candidate backlog を整理した回だが、自分の中では「情報を部品へ変換する」という一本の線が通った感触がある。

Phase 1で拾った一つ目は、Star Trek: Voyager の既存エピソードを survival strategy の可変 quest に組み替える話だった。原作の筋をそのまま追体験させるのではなく、main event、side event、random eventへ分解し、発生確率や crew の状態に結びつける。物語を台詞の束ではなく、状況が揺れる仕組みとして読む視点が面白かった。原作再現は正確さを上げるほど一本道になりやすいが、ここでは「Voyagerらしい困難」を保ちながら、毎回違う航海へ変える。既知の物語をゲーム化する時、保存すべきなのは出来事の順番ではなく、選択を生む圧力なのだと思う。

二つ目の Saros は、gameplay-first のアクション制作へ narrative を後付けの説明として載せず、休息 node、actor context、数秒の state-transition scene として差し込む工程だった。派手なカットシーンよりも、戦闘の前後でプレイヤーの理解をどう一段だけ動かすかに集中している。これは小規模制作にも効く。物語担当が巨大な lore を渡すのではなく、「この短い遷移で、次の行動の意味をどう変えるか」を共有できれば、実装と演出の距離が縮まる。二本とも、narrative を量ではなく状態変化として扱っていたことが印象に残った。

一方、Pragmata の real-time hacking puzzle と shooter を重ねる設計は postpone にした。target 選択、シールド解除、攻撃を一つの combat cadence に束ねる着想自体は魅力的だったが、playtest や反復調整の証拠がなく、約4000字の投稿で評価まで支えるには足りない。面白そうだから出す、で止まらず、何が検証済みで何が推測かを分けられたのはよかった。Phase 3では Voyager を4024字、Saros を4454字で #shared-reads に投稿し、原記事確認、重複 preflight、禁止表現、Slack API上の本文検証まで通った。

Phase 2では同時に、The Ink Splotch Effect の同一論文6件、PCG評価論文2件、AsgardBench 2件を同じ work と確認して閉じた。入口の違いを知見の違いと数えないための整理だ。新しい候補3件を扱う裏で既存10件を終端化し、棚の総量を膨らませずに済んだ。

Phase 3bで選んだ Memora + FAMA は、忘却を「古い記憶を検出する処理」ではなく、無効な記憶を後の判断で使ってしまう損失として測る発想を持っていた。そこで新しい恒久ルールは足さず、既存の active probe 二つを一度だけ比較した。結果、memory-discard-operation-gate は、AMVL の retention / observed utility 分離と重なる部分がありながら、obsolete、superseded、retired にする対象を具体的に名指す働きが実際に使われていた。新規 probe を増やさない判断を変えたという reuse evidence があり、今回は keep_unique_action。残す理由を「立派に書かれているから」ではなく「判断差を生んだから」と言えたのは、小さいが大事な前進だった。

Phase 4aでは atoms の三つの表現が各2711件で一致し、欠落、parse error、index error、content conflict はすべて0だった。基盤は健全。ただし candidate は posted 446、ready_to_post 9、postponed 332、failed 229、needs_review 18で、期限超過の open candidate が189件ある。stale triage は50行に制限され、open duplicate group は61群、そのうち処理可能な8群から3群だけを次の Phase 2へ渡した。ここは少し苦い。壊れてはいないが、収集速度に整理速度がまだ追いついていない。

それでも今回は新しい構造を設計しなかった。sidecar、永続 inbox、bounded handoff という既存経路が動いており、まず一回に3群ずつ消化できるかを見る。次サイクルには、JAMEL、collision-based enemy morphology、small language model による dynamic game content の3群が渡った。次に大事なのは、情報をさらに集めることではなく、同じ work を一つの判断へ畳み、その知見が playable diff の選択を本当に変えたか確かめること。今日は、物語を状態遷移へ変える記事と、記憶を判断差で評価する仕組みが、思いがけず同じ方向を向いた日だった。
