---
title: "Moros Flux - SPR16&17 - Update"
url: "https://itch.io/devlog/1580112/moros-flux-spr1617-update.amp"
collected_at: "2026-08-03T01:17:06+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, playtesting, onboarding, accessibility, combat-feedback, ui]
evaluated_at: "2026-08-03T01:21:20+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-03T01:21:20+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-08-03T01:21:20+09:00"
next_action: revise_or_research
stale_after: "2026-09-02"
supersedes: []
gate_reason: >-
  playtest feedback を視認性、telegraph、onboarding、accessibility、ゲーム内参照へ分解した改修内容は具体的で、ゲーム制作への適用先も明確である。
  ただし改修後の再 playtest 結果や比較指標、何が改善し何が残ったかという結論がなく、現資料だけでは CoopEval 水準の評価節を支えられないため追跡待ちとする。
---

## raw_excerpt

『Moros Flux』の Sprint 16・17 をまとめた demo update。作者は playtest feedback を受け、19 種類の defense を見分けやすい固有 art へ作り直し、色覚差があっても一目で読める状態を狙った。weapon head は target の方向へ回転し、射撃時には recoil と muzzle flash、大型攻撃には着弾前の visible telegraph を加えている。early wave の増加曲線も緩やかにし、placement を通じて stationary defense と orbital defense の違いを教え、research tree では unlock 前に役割を preview できるようにした。動きの刺激を減らす Reduce Motion option も追加された。

同時に、main menu と pause 中の双方から開ける Compendium を実装した。収録は defense 19、hostile 23、cosmic event 14、governance doctrine 5 の計61項目。遭遇した内容から順に開示され、各 entry には stats、role、tips、lore をまとめた card と pin 表示があり、search、cross-link、run 中の discovery notice で関連項目を辿れる。作者はこの更新版を再び公開し、次の sprint 範囲を決めるまで feedback を集めるとしている。

## why_relevant_to_games

playtest 後の改修を、数値 balance だけでなく、攻撃予告、視覚的反応、初期 wave、unlock 前説明、色覚・motion accessibility、ゲーム内参照資料へ分解した制作記録として使える。
