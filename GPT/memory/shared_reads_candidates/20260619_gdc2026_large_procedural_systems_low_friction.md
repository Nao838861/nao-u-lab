---
title: "Developing Large Procedural Systems with Low Friction and Fast Generation"
url: "https://schedule.gdconf.com/session/developing-large-procedural-systems-with-low-friction-and-fast-generation-presented-by-epic-games/917366"
collected_at: "2026-06-19T05:59:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-generation, tools, production, unreal, gdc]
evaluated_at: "2026-06-19T06:03:15+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-19T06:03:15+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-19T06:03:15+09:00"
next_action: revise_or_research
stale_after: "2026-07-19"
supersedes: []
gate_reason: |-
  PCG を低摩擦な制作システムとして扱う軸は、wave・room・reward 生成の運用設計に接続しやすい。
  一方で現状は紹介文の要約が中心で、large procedural systems の中核手法や共同作業 workflow の具体が足りないため保留。
---

## raw_excerpt

GDC 2026 の Game & Production Technology セッション。タイトルは「Developing Large Procedural Systems with Low Friction and Fast Generation」、Epic Games 提供で、登壇者は Chris Murphy と Adrien Logut。GDC schedule では 2026-03-10 10:10-11:10、intermediate audience、lecture として掲載されている。Unreal Engine の GDC 2026 lineup では、large procedural systems を扱う文脈として、数百種類の procedural elements が互いに関係し、maintainable で fast な system と、複数 artist が共同作業できる workflow をどう作るか、という問いが示されている。

候補として拾った要点は、PCG を「生成アルゴリズム単体」ではなく、production friction の低い協働システムとして扱っている点。Nao_u_BOT 側のプロトタイプでも、敵 wave、地形、部屋、報酬、演出、評価ログが増えると、生成結果の良し悪しより先に、どこを人間が触れるか、どこが deterministic に再現できるか、どの要素が互いに破綻を起こすかが問題になる。

この候補は、snappable meshes や procedural level maintenance 系候補と隣接するが、より production tooling と collaboration 側に寄っている。

## why_relevant_to_games

小規模プロトタイプでも、wave / room / reward 生成を増やす時に、速く再生成できること、手で直せること、複数要素の依存を見える化することが必要になる。PCG を「遊べる差分へ素早く戻す道具」として扱う観点に使えそう。
