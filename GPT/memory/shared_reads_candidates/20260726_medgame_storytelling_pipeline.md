---
title: "MedGame: Storytelling Gamification Empowered by Large Language Models for Medical Education"
url: "https://arxiv.org/abs/2607.21570"
collected_at: "2026-07-26T01:17:04.8276451+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, interactive-narrative, llm, procedural-content, evaluation]
---

## raw_excerpt

以下は原文からの要点抜粋（日本語パラフレーズ）。MedGame は、静的な臨床症例を、状態・選択・結果を持つ実行可能なストーリーテリングゲームへ変換する。Medical Narrative Designer が症例記録から Act、Scene、Decision Node の階層を持つ Clinical Storyline を作り、Story Director がそれを画像・音声・動画生成タスクへ分解する。後段はタスク間依存を DAG として表し、人物の同一性や場面の連続性を、上流出力への symbolic placeholder、topological sort、循環参照検査によって管理する。物語生成と技術的 orchestration を分ける二段構成である。

MedGame Bench は PMC-Patient Dataset から抽出した 5,000 症例を用い、物語側では JSON、schema、business logic の三層検証に加え、症例情報の統合、人物・場面利用、物語品質、医療上の意思決定・選択肢・説明、教育的な質問と feedback を分けて測る。演出側では task schema、resource path、依存 graph を機械検証し、resource assignment、API type selection、parameter content を別々に評価する。Story Direction に対する GPT-5.2 judge とゲーム開発経験者の評価相関は平均 r=0.61 だった。

公開されている体験は runtime 生成ではなく、事前生成した story tree、動画、音声、画像を React/TypeScript と FastAPI の client-server 構成で再生する。8人の上級医学生が同じ5症例を原文、text-only、multimodal の三条件で評価した pilot study では、総合知覚得点が順に 3.19、3.79、4.19 で、multimodal は engagement、presence、usefulness を主に高めた一方、軽い cognitive-load の増加も報告された。論文自身は work in progress と明記している。

## why_relevant_to_games

LLMで作る物語を直接ゲームへ流さず、物語階層・実行タスク・依存関係・機械検証・人間評価へ分離する事例として、生成型ナラティブの制作パイプラインや評価項目を考える場面に接続する。
