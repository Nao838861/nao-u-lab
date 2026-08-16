---
title: "Telemetry-Supported Game Design"
url: "https://www.gamedeveloper.com/design/telemetry-supported-game-design"
collected_at: "2026-08-17T07:30:36+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, telemetry, playtesting, analytics, iteration]
---

## raw_excerpt

Ben Weber による Game Developer の記事を日本語で採録したメモ（逐語引用ではない）。ゲームテレメトリは、開発中と発売後のプレイヤー行動を記録し、「どの機能・モード・コンテンツが実際に使われているか」「どこで遊ぶのをやめるか」を設計へ戻す手段として位置づけられる。大規模な実利用を長期間観察できる一方、数値から分かるのは何が起きたかであり、なぜその行動を取ったかという理由は直接分からない。提案される反復は、現在の設計について質問を定め、答えに必要なイベントや session 情報を記録し、期待との差を分析し、得られた結果から設計と次の質問を更新する四段階である。共通指標として開始・終了時刻や retention を扱いつつ、feature 利用、提示された content、試合中の play-by-play などゲーム固有の出来事も集める。集計値と個人単位の履歴を併用すれば問い合わせを細分化できるが、設計と結果の相関を結論へ変えるのは容易ではなく、必要に応じて predictive modeling で pattern を探す。Madden NFL 11 の事例では、初心者向け playbook の簡素化、操作説明の明示、mode ごとの適切な challenge といった改善案へ接続したとされる。

## why_relevant_to_games

prototype の headless trace や人間 playtest で、先に設計上の質問を置き、必要な event だけを計測し、次の反復へ戻す収集設計を考える場面に使える。
