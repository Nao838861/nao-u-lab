---
title: "IF:CARGO: LLM-Based Semantic Compilation for Al-Native Rule Programming Games"
url: "https://arxiv.org/abs/2608.12195"
collected_at: "2026-08-13T19:45:48+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, ai-native-games, puzzle, llm, natural-language-rules, playtesting]
---

## raw_excerpt

arXiv abstract からの採取メモ（日本語パラフレーズ）: IF:CARGO は、LLM を自律的なプレイヤーやルール決定者ではなく、自然言語を制約付き命令へ変換する semantic compiler として組み込んだ実験的パズルゲームである。プレイヤーは IF/THEN 形式の規則を自然言語で記述し、モデルがそれを限定された command schema に翻訳する。翻訳後の命令はゲームエンジン側で決定論的に検証・実行されるため、遊びの循環は「表現する→実行する→結果を見る→規則を直す」となり、AI との対話自体が semantic debugging として扱われる。8 レベルを用いた24人の mixed-methods playtest では、試行回数、思考時間、制御可能感、調整可能感、AI の役割理解を観測した。参加者は概して AI を翻訳の仲介者として捉え、フィードバックを手掛かりに方略を修正できた一方、周期コマンド、複数ロボットの協調、規則の優先順位は認知負荷と診断負荷を高めた。著者らは、自然言語入力を制約し、プレイヤーの authorship を保ち、実行を決定論的にする構成を AI-native gameplay の実装パターンとして提示している。

## why_relevant_to_games

自然言語の自由度を残しながら、ゲーム状態の更新を決定論的な schema と engine validation に閉じ込める設計例として、LLM を core mechanic に使うパズルやルール編集ゲームの試作時に参照できる。
