---
title: "Disgaea Mayhem: Shifting from Tactical RPG to Action RPG"
url: "https://80.lv/articles/disgaea-mayhem-shifting-from-tactical-rpg-to-action-rpg"
collected_at: "2026-07-28T12:02:02.0158137+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, action-rpg, genre-transition, combat-design, progression, production]
evaluated_at: "2026-07-28T12:08:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-28T12:20:05+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785208784564169"
next_action: none
stale_after: "2026-08-27"
supersedes: []
posted:
  ts: "1785208784.564169"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785208784564169"
  char_count: 4026
  posted_at: "2026-07-28T12:20:05+09:00"
gate_reason: |-
  tactical mechanics の直訳ではなく、シリーズ固有の大群撃破・成長・巨大 damage を体験核として残し、操作、animation、progression loop を再構成する判断が具体的である。
  社内技術の部位別再利用、Item World の短時間化、silhouette と制作順まで追え、ジャンル移植の tradeoff と制作工程を約4000字で固有に分析できるため pass とする。
suggested_post_outline:
  overview_angle: "既存 mechanics を real-time 化する話ではなく、シリーズの体験核を抽出し、別ジャンルの時間尺度・入力・画面可読性へ再実装した設計過程として整理する。"
  analysis_axis: "保持する identity と変更可能な mechanics を分け、操作負荷、animation 速度、progression の一回当たり時間、社内技術再利用が同じ体験核へ収束しているかを見る。"
  application_target: "Log_cdx が既存 prototype を別操作系や別テンポへ作り替える際、先に保持する感情・判断・報酬の核を明文化し、各 subsystem の変更をその核に照合する。"
  pros_cons: "利点は genre label に引きずられず identity を保ち、既存技術を部位ごとに再利用できること。欠点は accessible な爽快感へ寄せすぎると challenge と tactical な判断密度が薄れ、調整範囲も animation から camera・foley まで広がること。"
  verdict_pre: "採用。mechanics の互換性ではなく体験核の不変条件を先に置く設計票として、prototype の大きな形式変更時に使う。"
---

## raw_excerpt

『Disgaea Mayhem』開発チームへのインタビューは、tactical RPG のシリーズを action RPG へ移す際に、何を残し何を作り替えたかを説明する。狙いは tactical RPG の複雑さを敬遠する層にも入りやすくしつつ、シリーズ固有の成長と桁外れの damage 表現を保つことだった。『Disgaea 7』の仕組みをそのまま real-time 化せず、「派手な技で敵の大群を吹き飛ばす」「育成の頂点で巨大 damage を出す」体験へ中心を置き、dodge-cancel などで操作の負担を下げた。一方で爽快感だけでは challenge が消えるため、戦闘の細部との釣り合いを調整したという。

制作面では、tactical RPG より速い player movement に合わせて animation を想定以上に高速化し、model 実装後も action の手触りに合うまで調整を重ねた。3D collision は『Phantom Brave: The Lost Hero』、移動は『Disgaea 7』の base camp、探索は『BAR Stella Abyss』の社内技術を転用している。従来の Item World は長時間の周回が action RPG の一回の遊びに合わないため、複数 wave を生き残り survival score と item buff を得る短い構造へ再設計した。character は action 中に silhouette と pose が読めるよう従来より高身長にし、scenario、profile、concept art、model、animation、action setpiece、effect、foley、camera の順に制作する流れも記録されている。

## why_relevant_to_games

既存シリーズを別ジャンルへ移す時に、mechanics の直訳ではなく「保持する体験」を先に定め、操作、animation、progression loop、社内技術再利用を同時に組み替える工程の収集例になる。
