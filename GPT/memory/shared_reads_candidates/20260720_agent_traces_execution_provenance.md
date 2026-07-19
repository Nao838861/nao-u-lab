---
title: "From Agent Traces to Trust: A Survey of Evidence Tracing and Execution Provenance in LLM Agents"
url: https://arxiv.org/abs/2606.04990
collected_at: 2026-07-20T01:46:14+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, playtesting, provenance, observability, debugging]
---

## raw_excerpt

arXiv:2606.04990v4、2026-06-03 submitted、2026-06-28 revised。対象は、planning、tool use、retrieval、memory access、environment interaction、multi-agent collaboration を行う LLM agent の実行過程を、最終回答の正誤だけでは見えない検証対象として扱う survey。著者らは execution provenance を agent execution の typed graph、evidence tracing をそこから evidence-support relation を取り出した projection と定義する。この枠組みは、どの evidence が各 claim を支えたか、tool call が正当だったか、memory が後続判断へどう影響したか、failure がどこから生じたかを結び付ける。taxonomy は trace source、evidence と execution の unit、provenance relation、tracing granularity と timing、representation form、trust function を含む。方法論として provenance representation、evidence attribution、tool-use provenance、runtime guardrail、provenance-bearing memory、observability、failure diagnosis を整理し、benchmark、dataset、metric、未解決課題まで扱う。最終結果だけでなく、観測・検索・記憶・tool action・判断の因果的なつながりを監査・debug・recovery へ使うための外部資料である。

## why_relevant_to_games

自動 playtest や game-generation agent が、どの画面・状態・ログを根拠にどの操作や修正を行ったかを追跡し、失敗再現と修正検証へつなぐ場面で参照できる。
