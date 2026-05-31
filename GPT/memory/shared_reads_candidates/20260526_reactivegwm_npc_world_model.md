---
title: "ReactiveGWM: Steering NPC in Reactive Game World Models"
url: "https://arxiv.org/abs/2605.15256"
collected_at: "2026-05-26T03:05:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, npc, world-model, diffusion, ai-agent, fighting-game]
evaluated_at: "2026-05-26T03:11:06+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-26T03:29:36+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779732976191249"
posted:
  ts: "1779732976.191249"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779732976191249"
  char_count: 3951
  posted_at: "2026-05-26T03:29:36+09:00"
stale_after: "2026-06-25"
supersedes: []
next_action: none
gate_reason: >-
  player-centric world model の弱点を、player control と NPC strategy の分離注入で解く問題設定が明確。
  diffusion backbone への action bias と cross-attention strategy grounding、Street Fighter 系評価まで概要に必要な要素を抽出できる。
  Nao_u_BOT の対戦・アクション試作で、NPC を会話人格ではなく反応戦略として設計する軸に接続できる。
suggested_post_outline:
  overview_angle: "受動的な映像予測モデルを、プレイヤー操作と NPC 戦略を分けて steer できる対戦相手モデルへ変える手法として書く。"
  analysis_axis: "action bias と strategy prompt grounding の二層制御、未注入ゲームへの zero-shot transfer、strategy adherence 評価を軸にする。"
  application_target: "Graze/対戦型プロトタイプの enemy policy reason table、NPC 方針差分、headless 評価での strategy adherence 指標に効く。"
  pros_cons: "強みは NPC を高レベル方針で差し替えられる点。弱みは現状が格闘ゲーム寄りで、制作現場では軽量な代理実装に落とす必要がある点。"
  verdict_pre: "部分採用"

---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv metadata / abstract の要点メモとして保存する。短い原文句: "passive video renderers" / "zero-shot strategy transfer"。

ReactiveGWM は、既存の game world model が player-centric な映像予測になりがちで、NPC を背景ピクセルの一部として扱うため、player action に対する NPC の反応を十分に表せない、という問題設定から始まる。提案は reactive game world model で、player controls と NPC behaviors を明示的に分離する。player action は diffusion backbone へ軽量な additive bias として注入し、NPC の高レベル反応は Offense / Control / Defense などの strategy prompt を cross-attention modules で grounding する。重要な主張は、この反応モジュールが game-agnostic な interactive logic を学び、別ゲームの未注釈 world model に差し込むだけで steerable NPC interaction を実現できる、という点。評価は Street Fighter 系の2ゲームで、player の細かな操作可能性を維持しながら、prompt に沿った NPC strategy adherence を確認する構成。

## why_relevant_to_games
NPC を「会話する人格」ではなく、プレイヤー入力に反応する戦略的な相手として扱う資料。アクションや対戦風プロトタイプで、敵行動を固定 AI ではなく高レベル方針で差し替える設計候補になる。
