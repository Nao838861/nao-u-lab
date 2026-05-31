---
title: "Postmortem: A Rationally Designed Funny Game - The making of 'biped', in hindsight"
url: "https://www.gamedeveloper.com/design/postmortem-a-rationally-designed-funny-game---the-making-of-biped-in-hindsight"
collected_at: "2026-05-18T11:59:26+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, mechanics, coop, prototype-iteration]
evaluated_at: "2026-05-18T12:06:49+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-18T12:10:57+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779073851737479"
posted:
  ts: "1779073851.737479"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779073851737479"
  char_count: 3739
  posted_at: "2026-05-18T12:10:57+09:00"
stale_after: "2026-06-17"
supersedes: []
next_action: none
gate_reason: >-
  問題設定、偶然の発見、PvP/戦闘方向の棄却、core fun への回帰、level design の核までが一連の制作判断として抽出できる。
  現在の小規模プロトタイプでも「強い追加要素が核を薄めていないか」を判定する具体軸に転用でき、CoopEval 水準の概要に膨らませられる。
suggested_post_outline:
  overview_angle: "biped が腕・戦闘・長大レベルを捨て、脚を動かす快感と補完型 coop に戻っていく制作判断の記録として書く。"
  analysis_axis: "playtest が何を否定したか、validated mechanics を pool 化して核に合うものだけ採る方法、number mechanic が thoughtful walking と tight coordination を結んだ点。"
  application_target: "BOMB/shot_log 系の新要素評価で、追加要素の強さより core action の読める楽しさ・協力/補完構造を守る判定軸に使う。"
  pros_cons: "メリットは制作中の捨てる判断を具体化できる点。デメリットは coop 前提の知見が単独プレイ作品へはそのまま移らない点。"
  verdict_pre: "部分採用"

---

## raw_excerpt
Game Developer の biped 制作ポストモーテム。biped は ragdoll physics を使った coop action-adventure で、プレイヤーはキャラクターそのものではなく2本の脚を直接操作する。記事は、初期の山登りロボット実験から「腕を捨てて2脚だけにする」方向へ偶然寄ったこと、そこから多数の実験を行ったこと、PvP/戦闘方向を試したものの「biped らしくない」と playtest で返されたことを扱う。

重要箇所は、失敗した PvP test が転換点になり、設計基盤を「脚を自分のペースで動かす快感」と「個人の欠点を補い合って共通目標を達成する coop」に戻した流れ。さらに、2人が一歩ずつ相談しながら進む "number" mechanic が、thoughtful walking と tight coordination に噛み合い、以後の level design の核になったと説明している。後半では、長大な ski level を1.5か月作った後に切った話、validated mechanics を "playground pool" として保存し、そこから biped らしい要素だけを使って制作を絞った話も出てくる。

## why_relevant_to_games
「何でも足せる状態」から、playtest で core fun に戻る過程の記録。現在のプロトタイプで、強い新要素が作品の核を薄めていないかを見る材料になる。
