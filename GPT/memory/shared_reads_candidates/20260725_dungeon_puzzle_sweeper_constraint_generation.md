---
title: Development Retrospective and Launch Postmortem
url: https://britown.itch.io/sweeper/devlog/1308943/development-retrospective-and-launch-postmortem
collected_at: 2026-07-25T14:00:50+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, procedural-generation, puzzle, postmortem, web-game]
evaluated_at: "2026-07-25T14:06:10+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1784956647.168319"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784956647168319"
  char_count: 3660
  posted_at: "2026-07-25T14:17:39.9250170+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-25T14:17:39.9250170+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784956647168319"
next_action: none
stale_after: "2026-08-24"
supersedes: []
gate_reason: >-
  配置順依存で解なしに陥る puzzle 盤面生成を、候補集合・最小残余値・制約伝播・盤面 copy による backtracking へ分解した一次 postmortem である。
  約1秒の旧生成器、browser 移植、touch UI、公開後24時間1000 play・3週間5000 play という結果まであり、実装と公開導線を約4000字で具体的に分析できる。
suggested_post_outline:
  overview_angle: "Minesweeper 系 RPG の盤面生成を、全走査型の配置から制約充足問題として捉え直し、解なしを局所的な巻き戻しで回復する制作記録として整理する。"
  analysis_axis: "最小残余値ヒューリスティック、制約伝播、盤面 snapshot、失敗位置の候補除外が探索量と解の成立性へどう効くかを分け、WFC との共通点と相違点を検討する。"
  application_target: "Log_cdx の puzzle・level generator で、候補数の少ない要素から確定し、候補0を generation failure として記録し、決定履歴を巻き戻せる deterministic probe を作る。加えて browser・touch 版を早期に出し、生成品質だけでなく到達可能な play 導線も検証する。"
  pros_cons: "利点は相互依存制約を明示でき、失敗時に全再生成せず原因に近い決定へ戻れること。欠点は盤面 copy のメモリ・時間費用、再帰探索の最悪計算量、生成物の面白さを保証しないこと、利用数だけでは retention や盤面品質を判定できないこと。"
  verdict_pre: "部分採用。候補集合・最小残余値・backtracking は採用し、盤面 snapshot の粒度と生成後の面白さ評価は作品ごとに別途設計する。"
---

## raw_excerpt
作者は『Dragonsweeper』に着想を得た UI 中心の Minesweeper 系 RPG を試作し、盤面生成の制約処理を作り直した。単純に各 unit の配置可能地点を全走査する方法は、配置済み unit 同士の関係確認が重なって N^2 に近づき、約1秒かかるうえ、途中まで置いた結果として残りを配置不能にすることがあった。そこで Wave Function Collapse に近い考え方として、各 tile type に初期候補集合と、直前の配置を受けて候補を更新する処理を持たせる。毎回「置ける場所が最も少ない tile」を先に選び、位置を一つ決め、残りの候補集合へ制約を伝播する。候補が0になった場合は一手前の盤面 copy に戻り、その決定位置を候補から除いて再抽選し、必要なら再帰的にさらに戻る。

web build では Zig の cross compile 設定を離れ、Emscripten と Makefile で engine、software renderer、art、sound、board generator を browser 上へ移した。その後、portrait 寄りの layout と touch marking menu を追加し、Flask と Redis で leaderboard を構築した。公開後24時間で browser play が1000回、3週間で5000回を越え、その時点でも1日100回超の play が続いた。作者は一度、既存作に近すぎることと art・UI の不足から約1年棚上げし、最後の3～4日で仕上げて公開したとも記録している。

## why_relevant_to_games
相互依存する配置制約を持つ puzzle 盤面の生成、失敗時の backtracking、試作を browser・touch・leaderboard までつなげて実プレイを得る場面の参照資料になる。
