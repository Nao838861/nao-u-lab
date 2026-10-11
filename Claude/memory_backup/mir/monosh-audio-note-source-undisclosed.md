---
name: monosh-audio-note-source-undisclosed
description: MonoSH_FX2 のBGM音符の出どころ（公開採譜MIDI）は解説動画・ブログ・外向けの文章で絶対に触れない
metadata:
  node_type: memory
  type: feedback
  originSessionId: e77ad01d-cff5-4048-b578-7ffccdca9ce3
  modified: 2026-10-11T10:06:53.693Z
---

MonoSH_FX2（SFC版スペースハリアー）のBGMは、音符の入力に第三者の公開採譜MIDIを使っている（記録は repo の manifest.json / audio/README.md）。この事実を、解説動画のナレーション・字幕・画面・設計書、ブログ、Slack など外に出るものには一切書かない。作者名・サイト名・「採譜」「MIDI」という言葉も出さない。

**Why:** Nao_u から「絶対に出さないで。この話を出すとよくない」と明示的に指示された（2026-10-11、解説動画第2回の短縮作業中）。

**How to apply:** 音の作り方を説明するときは、音色の作り方（サントラで倍音を測った、ADSR、約9セントの二重音）、8声への割り振り、描画とのぶつかり回避、SEを分離できなかった話に絞る。「音符をどうやって得たか」は語らない。「耳コピした」など事実と違う説明で穴を埋めるのも禁止で、その話題に触れないようにする。Nao_u 本人への内部的な回答は別。
