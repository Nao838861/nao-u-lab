---
title: "Deep Dive: Masterminding the fluid movement system behind Echo Point Nova"
url: "https://www.gamedeveloper.com/design/deep-dive-the-movement-of-echo-point-nova"
collected_at: "2026-08-01T03:45:45+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, movement, game-feel, physics, camera, vfx, sfx, postmortem]
evaluated_at: "2026-08-01T03:48:41+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-01T03:48:41+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-01T03:48:41+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-31"
supersedes: []
gate_reason: >-
  移動の気持ちよさを単一パラメータではなく、物理、照準許容、カメラ、音、VFX、レベル導線の結合問題として説明し、hoverboard と grapple の具体的な実装判断まで抽出できる。
  問題設定から約3年の反復、個別手法、成立条件、結論まで材料が揃い、高速移動プロトタイプの観測軸と調整順へ無理なく適用できるため、約4000字の概要・分析を構成可能。
suggested_post_outline:
  overview_angle: "完成像からの逆算ではなく、複数の感覚層を往復する反復によって高速移動の一貫した手触りを作った開発記録として整理する"
  analysis_axis: "hoverboard と grapple の物理・入力許容を核に、カメラ、音、VFX、レベル、解放順が同じ速度感をどう補強するかを分解する"
  application_target: "Log_cdx の高速移動アクション試作で、速度・照準誤差・視覚運動・音響・地形を別々に計測しつつ、短いプレイテスト単位で横断調整する評価ループ"
  pros_cons: "長所は具体的な実装値と感覚層の接続を同時に示す点。短所は単一作品の事後記述で、比較実験や定量的なユーザー評価がなく、そのまま一般則にはできない点"
  verdict_pre: "部分採用"
---

## raw_excerpt

著作権に配慮し、以下は記事本文の要点を日本語で記録した収集メモ。短い原文断片は “experimenting and tinkering with code” と “can’t really be viewed in isolation”。作者 Matt Larrabee は、Echo Point Nova の移動を完成像から逆算せず、約3年間にわたり inspiration、player physics、camera motion、VFX / SFX の間を往復しながら、プレイ時に良く感じる方向へ1〜2手ずつ調整したと説明する。hoverboard は sprint-to-crouch slide を坂の上りにも延長したいという発想から生まれ、Unreal の walking physics を基礎に friction と deceleration を無効化し、最高速まで数秒かけて車両的な加速を作った。斜面から自然に飛び出すため slope detection を追加した。grapple は高速移動中の照準誤差を許容するため、直前に見た grappleable target を短時間記憶し、現在速度から視線方向の目標速度へ約1秒で補間する。カメラは速度連動 FOV、hoverboard 時の上下動・傾き、階段移動の平滑化を使う。音は速度に応じて pitch を変え、VFX は接地面と速度で debris を変える。記事末尾では、物理だけでなく camera、sound、VFX、level、unlock timing、tutorialization まで含めて移動 mechanic が成立すると述べている。

## why_relevant_to_games

操作感を単一の物理パラメータではなく、入力許容、速度変化、カメラ、音、視覚効果、レベル配置を横断する反復対象として収集できる。高速移動や grapple を持つアクション試作で、どの層を観測・調整するかを考える材料になる。
