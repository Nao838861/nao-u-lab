---
status: posted
---

■ 概要
TempGlitch は、gameplay video の glitch detection を「静止画で見える異常」だけで評価してきた流れに対して、時間順序を見ないと分からない異常を切り出す benchmark である。従来の visual glitch 評価では、clipping、missing texture、浮遊、破損 UI のように 1 frame でも違和感が出る spatial glitch が中心になりやすい。しかしゲーム内の失敗には、キャラクターの動きが一瞬戻る、animation transition が飛ぶ、物理挙動が時間的に破綻する、object state が前後関係と合わない、入力応答が不自然に遅れる、といった「順序付き frame の変化」を見て初めて分かるものがある。TempGlitch の問題設定は、VLM がゲーム動画 QA に使えるとしても、その能力が静止画的な見た目の判定に偏っているなら、実際の playtest で重要な temporal failure を拾えない、という点にある。

論文は spatial glitch と temporal glitch を明確に分ける。spatial glitch は isolated frame で検出できる異常、temporal glitch は ordered frames の変化を追わないと分からない異常である。著者らはまず preliminary study でこの差を確認し、temporal glitches が VLM にとって spatial glitches よりかなり難しいことを示す。そのうえで TempGlitch という controlled gameplay video benchmark を作る。TempGlitch は 5 種の temporal glitch type を持ち、各 category の sample 数を揃え、さらに glitch-free video の pair を用意する。paired clean/glitch videos があるため、単に「変な動画を当てる」だけでなく、clean を clean と扱えるか、glitch を glitch と扱えるかを binary evaluation として安定して測れる。

評価対象は proprietary と open-weight を含む 12 種の VLM で、複数の frame-sampling settings を試している。ここが重要で、TempGlitch は「動画をもっと細かく見せれば解けるはず」という単純な期待も検証対象にしている。結果はかなり厳しい。現状の VLM は TempGlitch 上で near chance に留まりやすく、モデルによっては保守的に振れて多くの glitch を見逃し、別のモデルでは過敏に振れて clean video まで glitchy と扱う。さらに、dense frame sampling や larger model size は安定した解決にならない。つまり、temporal glitch detection は「VLM に多めの frame を渡せば自然に解ける」課題ではなく、時間的推論、状態追跡、ゲーム文脈理解、正常挙動との比較を明示的に設計しないと難しい。

RESP が reference frame を使って frame-level の visual anomaly を強くする手法だとすれば、TempGlitch はその次に来る警告である。reference/test pair で静止画差分をよく見られるようになっても、アニメーション、物理、入力応答、状態遷移の失敗は、単一 pair では不足する場合がある。TempGlitch の貢献は、新しい detector を完成させたことではなく、game QA において「VLM が動画を見ている」という言い方を疑うための測定器を作ったことにある。動画入力対応モデルでも、実際には sample された複数 frame を独立画像に近く処理し、順序や因果の破綻を保持できていない可能性がある。著者らの結論は、gameplay QA で temporal glitch を扱うには、temporal reasoning と robust gameplay understanding を別軸として評価すべき、というものだ。

■ 内容分析
TempGlitch の価値は、VLM の弱点を「できない」と一般論で言うのではなく、ゲーム QA の失敗形式へ落として測っている点にある。ゲーム動画では、1 frame の美しさや object recognition より、前の状態から次の状態へのつながりが重要になる。たとえば、プレイヤーの入力後にキャラクターが自然に加速したのか、敵が攻撃 animation の途中で teleport したのか、door state が開閉途中で巻き戻ったのか、projectile が衝突後も残ったのかは、静止画だけでは判定しにくい。TempGlitch はこの領域を spatial anomaly と分けて名付け、paired clean video を用意することで、false positive と false negative の両方を見られるようにしている。

もう一つ重要なのは、dense sampling と大規模モデルへの過信を崩していること。動画 QA では「frame を増やせば情報量が増える」「大きい VLM なら時間も理解する」と考えがちだが、論文の結果はそこに待ったをかける。frame が増えるほど、モデルはノイズや一時的な演出に引きずられる可能性もある。大規模モデルでも、ゲーム固有の正常挙動、animation state、physics expectation、input-response timing を持たなければ、clean を glitch と言うか、glitch を演出として流す。TempGlitch は detection 手法というより、VLM video QA を導入する前の sanity benchmark として読むべきである。

■ 自分達の環境への適用
Nao_u_BOT の prototype QA では、visual check を入れる場合でも、まず screenshot や短い録画の目視に寄りやすい。TempGlitch から採るべきなのは、recorded playtest を「見た目の異常」と「時間的な破綻」に分けて評価すること。最小構成なら、固定 seed の 20-40 秒動画に対して、1 秒ごとの frame だけでなく、イベントログと frame window を対応させる。たとえば `dash_started -> dash_end`、`bullet_spawn -> hit/despawn`、`door_opening -> open`、`enemy_attack_windup -> active -> recovery` のような小さな state transition を取り、VLM には「この window で期待される順序が保たれているか」を聞く。単に「glitch はありますか」と聞かない。

Phase 3b/4a で試すなら、temporal glitch probe を 3 種に絞るのがよい。第一に animation/state rollback、第二に collision/despawn の遅延または残留、第三に UI/state transition の順序崩れ。各 probe は video、frame timestamps、game event log、期待順序、VLM 判定、人間最終判定を一組で保存する。VLM の判定は合否判定ではなく、見落としや過敏反応の傾向を見る材料にする。これにより、QA 自動化を入れたつもりで実は static screenshot checker しか持っていない、という状態を避けられる。

■ メリット・デメリット
メリットは、ゲーム QA で落としがちな temporal failure を独立した評価軸として扱えること。VLM 導入前に「このモデルは動画の順序を本当に見ているか」を検査できるため、過信を減らせる。paired clean/glitch の考え方も、false positive を測るうえで使いやすい。

デメリットは、TempGlitch 自体は benchmark 色が強く、すぐに実運用 detector になるわけではないこと。自作 prototype に移すには、event log、期待 state transition、window 抽出を別途作る必要がある。また、正常挙動がまだ固まっていない試作初期では、temporal glitch と未調整の手触りの区別が難しい。

■ 判定
部分採用。VLM に gameplay video を見せる QA を作る前提として、temporal glitch を screenshot visual anomaly と分ける評価ゲートを採る。まずは 3 種の短い state-transition probe から始め、VLM の検出力ではなく過信しないための測定に使う。

■ URL
https://arxiv.org/abs/2605.21443
