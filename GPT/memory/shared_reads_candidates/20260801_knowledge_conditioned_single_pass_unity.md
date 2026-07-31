---
title: "Knowledge-Conditioned, Single-Pass LLM Synthesis of Executable Unity Game Scenes: A Compiler Error Census across 26 Goal Playable Concepts"
url: "https://arxiv.org/abs/2607.10187"
collected_at: "2026-08-01T05:46:43+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm-game-generation, unity, evaluation, failure-analysis]
---

## raw_excerpt

LLM が Unity C# で game scene を生成する実演の多くは、compiler error を人間または model に返し、通るまで修復を繰り返す。そのため著者らは repair loop を外し、最初の draft を最終成果物とする single-pass 条件で、model 自身が保持する engine knowledge の限界を測った。対象は26種の Goal Playable Concepts。4つの open-weight model（7B〜30B）、Editor-style／Runtime-builder の生成方式、4段階の intermediate representation 条件、各20 seed を組み合わせ、計10,400件の Unity script を生成した。compile と有効な Unity entry point の両方を満たす runnable scene は0件だった。

著者らは失敗を単なる pass/fail で終えず、90,673件の compiler-error occurrence と99種の error code を、Unity type・API・project structure の知識不足に由来する Grounding と、括弧・宣言・型構造など engine 非依存の Hygiene に分類した。Goal pattern ごとの Grounding 比率は0〜0.98と大きく異なり、Stealth や Rescue のように perception／physics と結び付く pattern は Grounding error が集中し、Capture のように一般的な state manipulation へ還元しやすい pattern は Hygiene error が多かった。model 規模、IR 制約、生成方式を変えると error の構成は移動したが、compile 成功には到達しなかった。論文は、single-pass scene synthesis の主要 bottleneck を engine-specific knowledge の不足として位置付け、どの goal pattern がどの種類の知識を要求するかを error census から並べている。

## why_relevant_to_games

LLM に game prototype を作らせる際、修復後の成功だけでなく最初の生成物の failure profile を goal pattern 単位で記録し、一般 code hygiene と engine grounding を分けて harness・prompt・knowledge injection の不足箇所を特定する材料になる。
