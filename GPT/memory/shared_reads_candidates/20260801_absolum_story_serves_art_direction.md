---
title: "What happens when story serves art direction in Absolum - Narrative Notebook #2"
url: "https://www.gamedeveloper.com/design/what-happens-when-story-serves-art-direction-in-absolum-narrative-notebook-2"
collected_at: "2026-08-01T07:46:00.7571722+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, narrative-design, combat-design, environmental-storytelling, roguelite]
evaluated_at: "2026-08-01T07:50:14+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-01T07:56:20.1004110+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785538569384449"
next_action: none
stale_after: "2026-08-31"
posted:
  ts: "1785538569.384449"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785538569384449"
  char_count: 3954
  posted_at: "2026-08-01T07:56:20.1004110+09:00"
supersedes: []
gate_reason: >-
  戦闘の予備動作を読む視線を、背景探索・短い台詞・環境パズルへ再利用する設計原理が、複数の具体場面と開発者説明から抽出できる。
  形式的な実験ではないが、問題設定、実装上の調整、観察できる効果と限界が揃い、action game の tutorial・秘密・反復緩和へ具体的に適用できるため、約4000字の分析を支えられる。
suggested_post_outline:
  overview_angle: "物語を説明の追加物ではなく、art direction が要求する『周囲を見る』行動を育てる導線として設計する"
  analysis_axis: "戦闘telegraphから探索への技能転移、短いlayers and hints、navigation markerを使わない環境誘導、見落としに対する兎hintの調整"
  application_target: "action prototype のparry予備動作、背景の秘密、環境パズルを同じ注意技能で読ませ、反復runの単調さを減らす設計とplaytest観察"
  pros_cons: "操作を止めずに世界理解と発見を促せる一方、視認性やhint強度を誤ると秘密が未発見のままになり、戦闘中の認知負荷も増える"
  verdict_pre: "部分採用"
---

## raw_excerpt

Game Developer の Bryant Francis が、横スクロール action roguelite『Absolum』では物語が art direction を支えるように働いていると観察した記事。戦闘は block ではなく timing の合った dodge で parry し、Skill / Arcanum で敵の攻撃を割り込む clash もあるため、複数の敵の予備動作、短い発光、攻撃ごとに異なる着弾時刻を常に見続ける必要がある。この「細かな動きを見る」注意は戦闘だけに閉じず、海賊女王が出発地点近くの茂みの裏を探すよう話す、goblin が沼への道を頼む、背景の小さな一つ目の兎が隠し場所を示す、といった短い台詞や quest に接続される。UI の navigation marker は使わず、物語上の理由を持つ手掛かりで背景へ視線を向ける。

例として dwarven mine では、炉を再点火する目的だけが示され、操作説明は置かれない。背景の巨大な温度計と、敵を炉へ投げ込むと炎が強まる反応を戦闘中に観察して解法を掴む。記者はこれを hidden-object game に近い発見の感触として捉えている。開発側への取材では、action を中断しないため dialogue を短くし、物語を "layers and hints" として見せ、プレイヤーの直感に委ねたと説明される。一方、秘密が隠れすぎた箇所には一つ目の兎を hint として追加した。alternate path と秘密は、beat-em-up / roguelite の反復から単調さを減らし、周囲への好奇心を維持する狙いにもつながっている。

## why_relevant_to_games

戦闘の telegraph 読解、背景探索、短い物語ヒントを同じ「画面をよく見る」player skill に束ねる設計例として、action game の tutorial・秘密・反復緩和を組み合わせる場面で参照できる。
