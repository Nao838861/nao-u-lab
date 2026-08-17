---
title: "This is how the RNG works as an 'equalizer' in Dispatch"
url: "https://www.gamedeveloper.com/design/this-is-how-the-rng-works-as-an-equalizer-in-dispatch"
collected_at: "2026-08-17T15:32:09+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, rng, difficulty, player-experience, user-testing, narrative-game]
evaluated_at: "2026-08-17T15:35:56+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-17T15:41:15.334000+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786948875334089"
next_action: none
stale_after: "2026-09-16"
supersedes: []
gate_reason: >-
  初期の binary threshold から確率表示へ移った問題設定、隠れ補正の具体値、user testing、最終 episode での解除まで設計変遷を抽出できる。
  RNG の公平感、難易度曲線、プレイヤー信頼を同時に扱う具体例であり、限界と倫理面も含めて約4000字の独立した分析へ展開できる。
suggested_post_outline:
  overview_angle: "表示確率をそのまま抽選に使わず、体感上の公平さを守る equalizer として設計した変遷を数値付きで追う"
  analysis_axis: "確率の透明性と隠れ補正の緊張関係、連敗防止、user testing、物語上の難易度演出を分けて評価する"
  application_target: "Log_cdx がゲームの RNG 判定を設計・自己評価する際の、連敗ログ、救済発動回数、山場での補正解除を含む検証プロトコル"
  pros_cons: "偶発的な理不尽さを抑えて選択の幅を保てる一方、表示確率との不一致が発覚すると信頼を損ね、補正が実力差を隠す危険がある"
  verdict_pre: "部分採用。連敗防止と終盤解除は採用候補だが、表示と内部確率の乖離はジャンルと説明責任を踏まえて限定する"
posted:
  ts: "1786948875.334089"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786948875334089"
  char_count: 3958
  posted_at: "2026-08-17T15:41:15.334000+09:00"
---

## raw_excerpt

Game Developer が GDC Festival of Gaming 2026 の AdHoc Studio 講演を基にまとめた記事。『Dispatch』では、初期案の不可視な合否閾値を、ヒーロー選択ごとの成功確率表示へ変更した。開発者はこれを “RNG as an equalizer” と説明し、casual player には不適切な選択でも小さな成功可能性を残し、experienced player には資源を過不足なく組み合わせる min-max の余地を与えたとしている。

表示確率と内部処理は同一ではない。user testing 後、76% を超える試行は自動成功にし、この補助を3回受けると通常確率へ戻す。76% 超で失敗すると、自動成功3回分を再び有効にして連続した不運を抑える。また、表示上 1〜14% の成功率は内部では一律15%へ引き上げた。テスト参加者は公平だが少し易しいとも感じたという。最終 episode ではこれらの補助をすべて無効化し、“the training wheels are off” という状態にして、物語上の最終局面だけ明確に難しくした。記事は、初期の binary threshold、確率表示、隠れた補正、終盤での補正解除という設計変遷を、具体的な閾値と回数付きで記録している。

## why_relevant_to_games

表示確率と体感上の公平さを分け、連敗防止の内部補正を user testing で調整し、物語上の山場だけ解除する実装例として、RNG・難易度曲線・プレイヤー信頼の設計時に参照できる。
