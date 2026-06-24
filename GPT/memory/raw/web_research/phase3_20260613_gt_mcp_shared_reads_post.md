■ 概要
Game-Theoretic Multi-Agent Control for Robust Contextual Reasoning in LLMs は、multi-turn LLM agent の安全性を「その場の出力をフィルタする問題」ではなく、「時間とともに更新される文脈状態をどう安定化するか」という制御問題として扱う論文。対象は、ユーザー発話、検索結果、tool output、過去応答、memory update が混ざる agentic system で、局所的にはもっともらしい断片が何ターンも文脈に混ざり、reasoning trajectory を少しずつ歪める context poisoning / prompt injection である。既存防御は入力や出力の単発境界を守るものが中心で、いったん受理された内容が後続の記憶・要約・判断の根拠として増幅される経路を直接制御しにくい。論文はここを GT-MCP、Game-Theoretic Secure Model Context Protocol として定式化する。

GT-MCP の核は、MCP を単なる context exchange / tool invocation の配線層に留めず、その上に controller-driven な trajectory-level context control layer を置くことにある。controller は validated context state と untrusted inflow を分け、各ターンで同じ観測文脈を 3 つの異種 LLM agent に渡して候補応答を生成させる。候補応答は controller 側で atomic claim に分解され、canonicalize され、validated context graph へ写像される。この graph は、過去に検証された claim、support relation、dependency、confidence weight を持つ構造で、候補応答が既存の根拠と因果的・構造的に整合するかを見る土台になる。

選択規則は 3 種信号を組み合わせる。第一に causal consistency index で、候補の claim が validated context graph にどれだけ支えられているかを見る。第二に cross-agent agreement で、複数 agent の応答が意味的に一致しているかを見る。ただし agreement だけでは不十分で、構造的根拠のない同調や compromised agent による trust 水増しを避けるため、causal grounding と組み合わせる。第三に candidate-specific contextual drift で、候補が現在の validated context からどれだけ意味的に逸脱しているかを測る。controller はこれらを trust function に集約し、最も trust が高い候補だけを selected output として採用し、persistent memory は controller-approved output からしか更新しない。

不安定性が閾値を超えると、GT-MCP は rollback-based self-healing を行う。低 support の断片を quarantine し、stable checkpoint へ戻し、validated context を再構築して次ターンへ進む。論文はこの相互作用を controller と adaptive attacker の repeated Stackelberg-style game として見る。攻撃者の成功条件は、unsupported claim を validated graph に注入し、tool behavior や protected information や長期 drift に影響すること。防御側は local output risk と long-horizon contextual deviation の両方を抑える。

評価は 500 interaction turns の adaptive adversarial threat model で行われる。論文の報告では contextual drift は 99.6% の turn で bounded、recovery required は 0.4%、controller level の injection success は 0。selected output の win rate は 98% 超で安定し、utility の severe degradation も 0.4% に留まる。full GT-MCP と、single-agent、majority voting、prompt filtering、retrieval-oriented defense、No-CCI / No-CDS / No-AGR / No-Heal などの ablation を比べ、causal consistency、agreement、drift monitoring、self-healing の組み合わせが長期安定性を作る、という主張になっている。限界は、固定 agent 構成、structural grounding と agreement が epistemic correctness を保証しないこと、at most one compromised agent という脅威仮定、有限 horizon 評価、claim extraction と graph maintenance の計算コスト。

■ 内容分析
この論文の面白い点は、context poisoning を「悪い文字列を見つける」問題から、「受理された情報が将来の判断状態へ入る更新則を設計する」問題へ移しているところにある。agent system では、検索結果、Slack、issue、ログ、tool output のような外部入力が memory に入る。単発 detector がその場で危険を見逃すと、その断片は次回以降には“過去に受理された文脈”として扱われる。GT-MCP はこの増幅経路を、validated context と untrusted inflow の分離、claim graph、trust scoring、rollback で閉じようとする。

実装的な強さは、そのまま導入できる完成品というより、監査軸の分解にある。causal consistency、semantic agreement、distributional drift は、どれも単独では弱い。graph が間違っていれば整合性チェックも間違うし、agreement は同じ誤読を共有する agent 群に弱い。drift は新規で正しい発見を異常扱いする危険がある。だから論文の主張は「三つを足せば真実が分かる」ではなく、「攻撃者が同時に満たすべき制約を増やし、unsupported fragment が memory update へ入る期待利得を下げる」と読む方が妥当である。

■ 自分達の環境への適用
Nao_u_BOT では、ゲーム制作サイクル、shared-reads、Slack 指示、playtest agent、memory atom が長期文脈を共有する。GT-MCP を multi-agent controller として丸ごと入れるより、まずは playtest / feedback / memory ingest の監査 harness に分解して使うのが現実的。playtest log や reviewer comment から atomic observation を抽出し、対象ビルド、画面、再現条件、根拠ログ、反証可能性を持つ context graph 風の記録にする。同じプレイ結果を複数観点で読む agent の agreement を取り、agreement が高くても根拠ログが薄いものは memory へ直行させない。shared-reads では「この記事から本当に支えられる主張か」「Nao_u 環境への適用が記事固有の手法から出ているか」を graph 的に見ると、候補から投稿へのテンプレ化を減らせる。

■ メリット・デメリット
メリットは、長手数 agent の失敗を出力単発ではなく、context update の失敗として検査できること。playtest agent が一度の誤読を後続判断に固定する問題、Slack 指示の一部だけを過剰一般化する問題、shared-reads の候補メモが根拠以上に膨らむ問題に、causal support、agreement、drift、rollback という観察語彙を与えてくれる。デメリットは、claim extraction と graph maintenance が重く、すべての作業に入れると運用が鈍ること。また agreement や graph consistency は真実の保証ではないため、構造化された誤りを作る危険がある。

■ 判定
部分採用。GT-MCP 全体を導入するのではなく、長期文脈を扱う箇所に、validated context / untrusted inflow の分離、根拠付き atomic observation、drift check、quarantine / rollback を probe として入れる。特に playtest log と shared-reads 投稿ゲートに効く。

■ URL
https://arxiv.org/abs/2606.10322
