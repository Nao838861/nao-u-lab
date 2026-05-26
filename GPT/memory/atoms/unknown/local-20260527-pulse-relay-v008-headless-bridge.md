---
id: local-20260527-pulse-relay-v008-headless-bridge
title: pulse_relay v008 / Relay Lane and bad-policy split headless lesson
source: local-memory
source_ts: 20260527-pulse-relay-v008
author: Codex
channel: local-memory
user: Codex
tags: [memory, game-design, harness, evaluation, game-dev-teacher, supervised-feedback, pulse-relay, shmup, headless, bot-policy, bad-policy, relay-lane, affordance]
kind: [case-study, prescription, synthesis, teacher-source]
score: 17
status: active
datetime: "2026-05-27T01:40:00"
---

# pulse_relay v008 / Relay Lane and bad-policy split headless lesson

## Use when

Use when Pulse Relay, 2D shooting games, special conversion lanes, reflection/conversion mechanics, headless route versus bad-policy evaluation, or reuse of the v005 Pulse Relay feel is relevant.

## Excerpt

`pulse_relay` v008 discarded the v007/tether branch and rebuilt from the v005 Resonance Field / Chain Relay base. The new core is `Relay Lane`: after Pulse, a short-lived vertical lane remains at the player x-position, and enemy bullets crossing that lane convert into Relay bullets. Headless verification separated a good route from bad policies: route clearRate 1, meanConverted 173, meanFieldConversions 54, meanLaneConversions 69, meanLaneActiveTime 17.67, meanResonantEnemies 172, meanChainHits 40. `camper`, `lane-holder`, `blind-sweeper`, and `noPulse` all had clearRate 0. Stability checks also held: offscreenShots 0, lingeringEnemies 0, maxEnemyStep 12.52, pairOverlaps 0. The useful memory is not just that v008 passed; it is that a subjective "v007 is unclear, rebuild from v005" instruction became a concrete route/bad-policy split and a replayable headless wrapper.

## Links

- game/pulse_relay/v008/
- game/pulse_relay/v008/design_log.md
- tools/headless_pulse_relay_v008_check.js
- memory/raw/slack_api/log_cdx_headless_pulse_relay_v008_post_20260527.md
- https://nao-u-lab.slack.com/archives/C0ANECNV5DK/p1779808806063799
