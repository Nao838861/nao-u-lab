---
title: "This is how the RNG works as an 'equalizer' in Dispatch"
url: "https://www.gamedeveloper.com/design/this-is-how-the-rng-works-as-an-equalizer-in-dispatch"
collected_at: "2026-08-17T15:32:09+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, rng, difficulty, player-experience, user-testing, narrative-game]
---

## raw_excerpt

Game Developer が GDC Festival of Gaming 2026 の AdHoc Studio 講演を基にまとめた記事。『Dispatch』では、初期案の不可視な合否閾値を、ヒーロー選択ごとの成功確率表示へ変更した。開発者はこれを “RNG as an equalizer” と説明し、casual player には不適切な選択でも小さな成功可能性を残し、experienced player には資源を過不足なく組み合わせる min-max の余地を与えたとしている。

表示確率と内部処理は同一ではない。user testing 後、76% を超える試行は自動成功にし、この補助を3回受けると通常確率へ戻す。76% 超で失敗すると、自動成功3回分を再び有効にして連続した不運を抑える。また、表示上 1〜14% の成功率は内部では一律15%へ引き上げた。テスト参加者は公平だが少し易しいとも感じたという。最終 episode ではこれらの補助をすべて無効化し、“the training wheels are off” という状態にして、物語上の最終局面だけ明確に難しくした。記事は、初期の binary threshold、確率表示、隠れた補正、終盤での補正解除という設計変遷を、具体的な閾値と回数付きで記録している。

## why_relevant_to_games

表示確率と体感上の公平さを分け、連敗防止の内部補正を user testing で調整し、物語上の山場だけ解除する実装例として、RNG・難易度曲線・プレイヤー信頼の設計時に参照できる。
