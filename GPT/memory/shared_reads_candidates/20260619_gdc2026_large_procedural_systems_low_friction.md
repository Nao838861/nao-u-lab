---
title: "Developing Large Procedural Systems with Low Friction and Fast Generation"
url: "https://schedule.gdconf.com/session/developing-large-procedural-systems-with-low-friction-and-fast-generation-presented-by-epic-games/917366"
collected_at: "2026-06-19T05:59:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-generation, tools, production, unreal, gdc]
evaluated_at: "2026-07-27T14:22:16+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-27T14:22:16+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-27T14:22:16+09:00"
next_action: keep_for_reference
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  公式ページから Biome Core、serialization、source-control contention、性能という論点は確認できるが、講演内容の手法・比較・結果は得られない。
  PCG運用への適用軸は有用でも、紹介文だけを~4000字へ膨らませると一般論になるため投稿候補としては閉じる。
---

## raw_excerpt

GDC 2026 の Game & Production Technology セッション。タイトルは「Developing Large Procedural Systems with Low Friction and Fast Generation」、Epic Games 提供で、登壇者は Chris Murphy と Adrien Logut。GDC schedule では 2026-03-10 10:10-11:10、intermediate audience、lecture として掲載されている。Unreal Engine の GDC 2026 lineup では、large procedural systems を扱う文脈として、数百種類の procedural elements が互いに関係し、maintainable で fast な system と、複数 artist が共同作業できる workflow をどう作るか、という問いが示されている。

候補として拾った要点は、PCG を「生成アルゴリズム単体」ではなく、production friction の低い協働システムとして扱っている点。Nao_u_BOT 側のプロトタイプでも、敵 wave、地形、部屋、報酬、演出、評価ログが増えると、生成結果の良し悪しより先に、どこを人間が触れるか、どこが deterministic に再現できるか、どの要素が互いに破綻を起こすかが問題になる。

この候補は、snappable meshes や procedural level maintenance 系候補と隣接するが、より production tooling と collaboration 側に寄っている。

## why_relevant_to_games

小規模プロトタイプでも、wave / room / reward 生成を増やす時に、速く再生成できること、手で直せること、複数要素の依存を見える化することが必要になる。PCG を「遊べる差分へ素早く戻す道具」として扱う観点に使えそう。
