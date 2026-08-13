---
title: "IF:CARGO: LLM-Based Semantic Compilation for Al-Native Rule Programming Games"
url: "https://arxiv.org/abs/2608.12195"
collected_at: "2026-08-13T19:45:48+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, ai-native-games, puzzle, llm, natural-language-rules, playtesting]
evaluated_at: "2026-08-13T19:50:31+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-13T19:55:26+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786618526865149"
next_action: none
stale_after: "2026-09-12"
supersedes: []
posted:
  ts: "1786618526.865149"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786618526865149"
  char_count: 4388
  posted_at: "2026-08-13T19:55:26+09:00"
gate_reason: >-
  semantic compiler、制約付き command schema、決定論的 engine validation という中核が明確で、
  24人・8レベルの mixed-methods playtest から制御感と診断負荷の両面を論じられる。
  自然言語ルールを core mechanic にする小規模 puzzle prototype へ、境界設計と評価軸を直接移せる。
suggested_post_outline:
  overview_angle: "LLM を自由生成器ではなく、プレイヤーの自然言語規則を検証可能な命令へ落とす semantic compiler として使う設計"
  analysis_axis: "自然言語の表現力と決定論的実行の分業、semantic debugging の feedback loop、複数規則で増える診断負荷"
  application_target: "Log_cdx の次期ルール編集 puzzle probe で IF/THEN 入力を限定 schema へ変換し、engine validation と失敗理由表示までを一つの playable loop として検証する"
  pros_cons: "プレイヤー authorship と再現可能な状態遷移を両立できる一方、規則優先順位・周期処理・複数主体の説明設計が弱いと負荷が急増する"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv abstract からの採取メモ（日本語パラフレーズ）: IF:CARGO は、LLM を自律的なプレイヤーやルール決定者ではなく、自然言語を制約付き命令へ変換する semantic compiler として組み込んだ実験的パズルゲームである。プレイヤーは IF/THEN 形式の規則を自然言語で記述し、モデルがそれを限定された command schema に翻訳する。翻訳後の命令はゲームエンジン側で決定論的に検証・実行されるため、遊びの循環は「表現する→実行する→結果を見る→規則を直す」となり、AI との対話自体が semantic debugging として扱われる。8 レベルを用いた24人の mixed-methods playtest では、試行回数、思考時間、制御可能感、調整可能感、AI の役割理解を観測した。参加者は概して AI を翻訳の仲介者として捉え、フィードバックを手掛かりに方略を修正できた一方、周期コマンド、複数ロボットの協調、規則の優先順位は認知負荷と診断負荷を高めた。著者らは、自然言語入力を制約し、プレイヤーの authorship を保ち、実行を決定論的にする構成を AI-native gameplay の実装パターンとして提示している。

## why_relevant_to_games

自然言語の自由度を残しながら、ゲーム状態の更新を決定論的な schema と engine validation に閉じ込める設計例として、LLM を core mechanic に使うパズルやルール編集ゲームの試作時に参照できる。
