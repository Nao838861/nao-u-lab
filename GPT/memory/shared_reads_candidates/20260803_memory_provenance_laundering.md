---
title: "Memory Provenance Laundering in LLM Agents: A Non-Amplification Firewall for Persistent Memory"
url: "https://arxiv.org/abs/2607.29167"
collected_at: "2026-08-03T18:17:19.2025538+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, memory, security, game-development, playtesting]
---

## raw_excerpt

arXiv 要旨からの収集メモ。論文は、長期記憶を持つ LLM agent が外部観測を圧縮・統合する際、低信頼の出典が消え、見かけ上は user history や workflow の裏付けへ書き換わる現象を memory provenance laundering と呼ぶ。原文では “during LLM-based memory consolidation, an external observation may be rewritten as apparent user history or workflow support” と説明される。action trigger の意味だけが残り、その trigger を制限すべき source authority が失われる点が中心問題である。既存の prompt filter、content sanitization、tool guard だけでは、損失のある memory consolidation 後に source authority が増幅されないことを保証できないとする。

提案する Provenance-Preserving Memory Firewall (PPMF) は、platform が管理する provenance を保持し、実行しようとする tool call の risk と、関連 memory が持つ authority を照合する軽量 middleware である。固定 risk policy を用いた schema-grounded evaluation では、脆弱な consolidated memory の attack success rate が最大 1.000 に達した。一方、platform-managed provenance、confirmation、risk label を保った条件では、評価対象の unauthorized high-risk action は gate を通らず、確認済みの benign action と対象を限定した low-risk memory use は実行可能だったと要旨は報告する。

## why_relevant_to_games

外部 playtest、web 記事、生成 asset のメタデータ、repo 内ログを制作 agent の長期記憶へ取り込む時、観測情報を「ユーザー承認済み仕様」へ誤昇格させない設計に関係する。ゲーム制作の自動化で、記憶の内容だけでなく出典と権限を tool action まで保持する観点を収集する。
