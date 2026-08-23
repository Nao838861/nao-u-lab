---
title: "A decay chain is closed-form until the daughter starts decaying too"
url: "https://itch.io/devlog/1636764/a-decay-chain-is-closed-form-until-the-daughter-starts-decaying-too.amp"
collected_at: "2026-08-23T21:31:22+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, simulation, incremental-game, postmortem, headless-testing, numerical-methods]
---

## raw_excerpt

収集時の日本語メモ（原文の長文引用ではなく要点整理）。『HALFLIGHT』は、保有する同位体が崩壊して報酬を生み、娘核種へ変わりながら発熱も変わる containment-vault 型の browser incremental game である。単一核種の崩壊率は指数関数の closed-form で計算でき、16 ms を60回進めても1秒を一度に進めても同じ値になる。しかし parent から生まれた daughter が同じ time step 内でさらに崩壊する chain では、核種ごとの一回計算だけでは daughter を step 終端に生成してしまい誤差が出る。作者は Bateman equation、100 ms fixed substep、dt clamp の三案を挙げ、実装では dt を0.1秒に clamp している。これは event を見逃さない目的で入れたが、chain 誤差を100 ms分に抑える副作用も持つ。一方で tab を閉じた間の offline progress は未実装で、save に時刻を保存しながら読み出していない。

55件の headless test から5件の実 defect が見つかった。特に contamination 回復処理が cell loop 内にあり、12 cell では毎秒0.55%ではなく6.6%回復して containment pressure を消していた。test 自体は pass しており、異常は scenario の出力値を読んで発見された。また meltdown fixture は、shield 条件違反で isotope load が拒否された空 vault を試していたため、load 成功を先に assert するよう修正された。game は43種の同位体、121本の emission line、5本の decay chain を持ち、spectrum 表示も同じ数値から生成する。

## why_relevant_to_games

simulation game で数値モデルの時間刻み、offline progress、演出 event を同時に扱う場面と、pass した headless test の出力や fixture 前提まで検査する場面に関係する制作記録である。
