---
title: "Sampanzee ChopShop is out: a mic-only sampler you play with your thumb"
url: "https://itch.io/devlog/1598750/sampanzee-chopshop-is-out-a-mic-only-sampler-you-play-with-your-thumb.amp"
collected_at: "2026-07-25T01:32:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, mechanics, audio, mobile, interaction-design]
evaluated_at: "2026-07-25T01:37:09+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-25T01:37:09+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-25T01:37:09+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-24"
supersedes: []
gate_reason: >-
  マイク入力から親指一本の演奏へ至る問題設定、単一 XY 面へ割り当てた 8 種の変形、
  即時の発見と練習可能な熟達を両立する設計上の結論まで具体的に抽出できる。
  定量評価はないが、各 mode の入力―音響対応と公開済み実装を根拠に約 4000 字の独自分析へ展開できる。
suggested_post_outline:
  overview_angle: "録音素材・親指の位置・移動を一つの演奏系へ畳み込み、入口の速さと身体的な熟達を同居させる設計"
  analysis_axis: "各 mode が同じ XY 入力を時間位置・速度・反復・音量へ別解釈する方法と、HOLD/CRUSH が演奏状態を積層する構造"
  application_target: "Log_cdx が短時間の音遊び prototype を作る際の、片手入力→即時フィードバック→練習可能な技の深さを検証する操作 probe"
  pros_cons: "素材作成から演奏までが短く、制約が創発性を生む一方、マイク品質・環境騒音・mode 学習・視覚フィードバックに依存する"
  verdict_pre: "部分採用"
---

## raw_excerpt

原文の短い核: “Your thumb’s position and movement IS the performance.”

Android 向けの小型 sampler / instrument「Sampanzee ChopShop」の公開記録。入力素材は sample pack ではなく、利用者が端末のマイクへ吹き込んだ声、beatbox、机を叩く音などに限定する。録音ボタンを押して音を取り込み、端を trim した後は、主に親指一本で XY pad を動かして演奏する。LOOP / PITCH / REV は再生方向や pitch と filter を操作し、STUT は短い断片を連打しながら録音内を移動する。SLICE は録音から別々の音を検出し、声や “kick snare hat” を指で叩ける断片へ分ける。TAPE は慣性付き varispeed と tape-stop、GATE は音量の rhythm chop、SCRATCH は指の前後運動をレコード操作へ対応させる。HOLD で loop を固定し、CRUSH で lo-fi bit-crush を重ねられる。作者は、子どもでも数秒で音を出せる入口と、turntablism や finger drumming に使える演奏の深さを同じ操作面に置いたとしている。処理は offline で、使用 permission はマイクのみ、録音は端末外へ送られない。

## why_relevant_to_games

一つの入力面と自前の音素材から、即時の笑い・発見と練習可能な熟達を両立させる mechanics の資料になる。音を主役にした短時間 prototype、片手操作、入力から即座に遊びへ変換する設計時に参照できる。
