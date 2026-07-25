---
title: Postmortem "she danced in the wind like a holographic dream before the world died"
url: https://alienmelon.itch.io/flower/devlog/1382599/postmortem-she-danced-in-the-wind-like-a-holographic-dream-before-the-world-died
collected_at: 2026-07-25T14:00:50+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, interactive-fiction, procedural-generation, postmortem, narrative-design]
evaluated_at: "2026-07-25T14:06:10+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1784956651.417419"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784956651417419"
  char_count: 3802
  posted_at: "2026-07-25T14:17:39.9250170+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-25T14:17:39.9250170+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784956651417419"
next_action: none
stale_after: "2026-08-24"
supersedes: []
gate_reason: >-
  小さな interactive poem が open world へ膨張した過程で、runtime 一括生成と全建物固有化を捨て、chunk・PCG Stamp・level instancing・限定照明へ縮小した判断が具体的である。
  低性能機60 fpsという性能確認と、順不同の記憶断片、Twine・Bitsy・音響を探索空間へ統合する設計があり、scope 制御と空間叙事を約4000字で分析できる。
suggested_post_outline:
  overview_angle: "短い詩を巨大化した成功談ではなく、膨張した構想を chunk 化と事前生成へ戻しながら、文章・小ゲーム・音響を一つの探索体験へ再統合した制作記録として整理する。"
  analysis_axis: "PCG を無限生成そのものではなく制作コストと描画負荷を局所化する道具として読み、順不同 fragment と環境演出が player の推論と文章への接近をどう支えるかを分析する。"
  application_target: "Log_cdx の narrative prototype で、まず一つの空間・一つの断片・一つの音響遷移を縦に通し、拡張時は chunk ごとの生成・読込・評価へ分ける。順不同収集では、各断片が単独でも意味を持ち、組合せで関係が更新されるかを検証する。"
  pros_cons: "利点は PCG と level instance で広い空間の制作・性能負荷を分割でき、異なる authoring tool を物語表現として活かせること。欠点は scope 膨張が強く、60 fps の単一端末確認だけでは再現性が弱いこと、順不同断片が曖昧さや収集作業へ崩れる危険、tool 境界の保守負荷があること。"
  verdict_pre: "部分採用。chunk 化、事前生成、異種媒体を一つの導線へ束ねる考え方は採用し、open world 規模と無限生成は小さな縦切りで価値を確認するまで保留する。"
---

## raw_excerpt
作品は、都市で踏まれる dandelion を描く短い interactive poem の更新として始まったが、建築、brutalism、Unreal Engine の PCG、無限に探索できる open world へ拡大した。作者は大規模範囲を単一 PCG で runtime 生成する構想を縮小し、world を chunk に分け、PCG Stamp と level instancing を使い、landscape と city を事前生成する形へ変更した。建物をすべて固有にする案も resource 負荷から断念し、一部 procgen に固定した。草・岩・崖の散布規則と LOD 間の遷移には PCG を利用し、最適化設定で低性能の Dell PC でも60 fpsを得たと記す。照明は主に emissive material、volumetric fog、post-process exposure を組み合わせ、通常 light source を限定して負荷を抑えた。

物語面では、滅亡後の世界を最後の花が歩き、殺された詩人の memory fragment を順不同で収集する。作者は断片を正しい順に読ませず、player が関係を推測できる余地を残した。収集物は Unreal 内で動く Twine と、その中へ埋め込んだ Bitsy で構成し、HTML の styling と Unreal の空間表現を併用する。Audio Volume、Sound Cue、procedural music を重ね、屋外・建物内・UI・文章画面の遷移を連続させた。文章だけを提示するのではなく、art、lighting、texture、探索空間が player を文章へ向かわせる構成を採った。

## why_relevant_to_games
小さな narrative prototype が open-world PCG へ膨らんだ時の scope 縮小と、文章・空間・埋込み HTML・音響を一体化して順不同の探索物語を作る場面の参照になる。
