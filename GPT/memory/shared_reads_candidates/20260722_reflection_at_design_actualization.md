---
title: "Reflection at Design Actualization (RDA): A Tool and Process For Research Through Game Design"
url: "https://arxiv.org/abs/2602.12887"
collected_at: "2026-07-22T13:16:55+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, research-through-design, playtesting, design-journal, tacit-knowledge, godot, unity]
evaluated_at: "2026-07-22T13:22:06+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-22T13:22:06+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-22T13:22:06+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-21"
supersedes: []
gate_reason: |-
  playtest 前後の意図・期待・実測映像・差分を結ぶ RDA loop が具体的で、version control から落ちる設計判断と tacit knowledge を残す問題設定に直接答えている。
  3 designer-researcher・2〜4か月の自己使用から workflow friction、persona 切替、mirror effect と限界まで抽出でき、AI との反復ゲーム制作へ無理なく適用できる。
  同一 work の旧 postponed candidate より tool 構成・四段階 loop・project 期間・運用上の失敗条件が補強されているため、本候補を投稿代表として pass にする。
suggested_post_outline:
  overview_angle: "設計を考えた時点ではなく、実装を playtest で触れる状態へ変える actualization の前後を記録単位にする研究手法として整理する。"
  analysis_axis: "pre-test intention、automatic video、post-test discrepancy の三点セットが tacit knowledge をどう外在化するかを、継続負荷と選択的記録の tradeoff まで含めて見る。"
  application_target: "Log_cdx の playable prototype 反復で、変更理由・期待・実測映像・次の一手を commit や評価ログへ結び、AI との制作で小さな設計判断が失われる箇所を補う。"
  pros_cons: "利点は設計意図と実際の feel の差を動画付きで追え、後から判断経路を再利用できること。欠点は全 test 記録が flow を切り data を膨らませ、評価も開発者自身の3例に限られること。"
  verdict_pre: "部分採用。全 playtest の義務化ではなく、仮説を置いた変更や feel が変わる節目だけに短い前後記録を導入する。"
---

## raw_excerpt

著作権に配慮し、原論文の長文引用ではなく重要部分を日本語で採録する。RDA は、設計判断が抽象的な考えから実際に触れるものへ変わる「design actualization」の瞬間、とくに editor 内で playtest を始める前後へ記録を結び付ける open-source の tool/process である。基本 loop は、設計・実装を進める、test 前に変更理由と期待を記す、playtest を自動録画する、test 後に期待との差・途中の変更・次の着想を記す、の四段階。Unity と Godot の editor extension、OBS 経由の録画、記録をまとめる Python script が用意されている。

狙いは、version control だけでは残りにくい小さな設計判断と tacit knowledge を構造化し、動画で project 全体の変化も追えるようにすること。3人の designer-researcher が異なる3 project で自己使用し、1件は4か月、2件は2か月継続した。観察されたテーマは、既存の制作 routine と記録作業の妥協、designer と researcher の persona 切替、記録が自分の散らかった制作過程を映す mirror effect の三つ。全 test を記録すると flow を切り、data が膨張する一方、bug fixing や rapid prototyping で省略すると後から必要な情報が欠ける。利用者は記録対象を選び、tagging や workflow を調整する必要があった。慣れると test 前後の pause が暗黙の判断を言語化し、video compilation は日単位の変化を追う助けになったが、評価は開発者自身による autobiographical design の3例に限られる。

## why_relevant_to_games

playtest の直前・直後へ理由、期待、実測映像、次の変更を結び付ける方法として、AIとの反復制作で失われやすい小さな設計判断と feel の変化を記録する場面に接続できる。
