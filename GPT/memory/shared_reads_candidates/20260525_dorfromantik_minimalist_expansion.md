---
title: "How Dorfromantik Expands Its Cozy World Through Minimalist Design"
url: "https://80.lv/articles/how-dorfromantik-expands-its-cozy-world-through-minimalist-design"
collected_at: "2026-05-25T22:52:29+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, minimalist-design, cozy-game, visual-readability, live-ops]
evaluated_at: "2026-05-25T23:10:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-25T23:00:36+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779717626976659"
posted:
  ts: "1779717626.976659"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779717626976659"
  char_count: 3853
  posted_at: "2026-05-25T23:00:36+09:00"
stale_after: "2026-06-24"
supersedes: []
next_action: none
gate_reason: |-
  minimalism/readability を守りながら biome・night mode・特殊 tile を増やす判断基準が具体的に抽出できる。
  grayscale value、vertex color、modular curated tiles など実装・評価へ落とせる要素があり、CoopEval 水準の概要に展開できる。
suggested_post_outline:
  overview_angle: "Dorfromantik が機能追加ではなく、読みやすさと安心感を保つ制約設計として拡張を扱う点を中心に書く。"
  analysis_axis: "visual noise を抑える問い、value/readability 先行のアートパイプライン、curated tile の modular recombination を分けて分析する。"
  application_target: "小規模ゲームの biome/skin 追加、AI 生成ゲームの視認性レビュー、headless 評価で拾えない visual readability の手動チェック軸に効く。"
  pros_cons: "利点は拡張時に核の体験を壊しにくいこと。弱点は数値評価だけでは noise や mood の良否を取り逃がすこと。"
  verdict_pre: "採用"

---

## raw_excerpt
80 Level による Toukana Interactive インタビュー。Dorfromantik の開発者は、初期の制約から minimalism と relaxation を設計柱に置き、新機能を入れるたびに「本当に必要か」「体験を改善するか」を確認してきた、と説明している。Medieval Biome Pack でも新システムを足すのではなく、special tiles、unique buildings、house types など既存要素の再解釈で広げる方針を取る。

短い原文メモ: "Does the game really need this?" / "too much visual noise" / "more of a modular one"。

視覚制作では、単純な形状を早期に 3D blockout して Unity に持ち込み、ゲーム内視点で proportion、readability、shape を確認する。色は伝統的な個別 texture ではなく vertex color channels と grayscale albedo textures を組み合わせ、biome-specific color sets で同じ建物を各 biome に馴染ませる。readability は grayscale で value structure を確認し、hue と saturation は mood と atmosphere のために使う。

Night Mode は照明システムの大改造ではなく、追加 biome のように扱い、scene 内の color sets を調整して世界全体を別の雰囲気に塗り替える。procedural generation についても完全なランダム生成ではなく、curated tiles を rules で recombine する modular system として説明されている。

## why_relevant_to_games
小規模ゲームで機能追加より「核の読みやすさ」を守る判断基準、biome/skin 追加で体験を広げる方法、headless 評価では拾いにくい visual noise の観点に効く。
