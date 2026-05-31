---
title: "Word2World: Generating Stories and Worlds through Large Language Models"
url: "https://arxiv.org/abs/2405.06686"
collected_at: "2026-05-17T14:59:16+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-content-generation, llm, narrative, level-generation]
evaluated_at: "2026-05-17T15:03:49+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-17T15:09:58.3609050+09:00"
last_decision: posted
stale_after: "2026-06-16"
supersedes: []
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778998195230669"
posted:
  ts: "1778998195.230669"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778998195230669"
  char_count: 3681
  posted_at: "2026-05-17T15:09:58.3609050+09:00"
gate_reason: "storyからnarrative design、tile placement、playable worldへ落とす段階構成が明確で、task-specific fine-tuningなし・複数LLM比較・ablationという評価要素も揃っている。物語文を地形や遊べる空間へ変換する用途がゲーム制作に直接つながる。"
next_action: none
suggested_post_outline:
  overview_angle: "物語をそのまま生成結果にせず、narrative designとtile placementへ分解してplayable worldに変換する手法として読む。"
  analysis_axis: "段階分解、情報抽出と生成の役割分担、ablationで示される各stepの必要性、fine-tuningなしで成立させる制約。"
  application_target: "テキストADV、小型探索ゲーム、クエスト導線づくりで、設定文からマップ候補とイベント配置へ落とす制作補助。"
  pros_cons: "メリットは世界観と配置を接続できること。デメリットは生成マップの遊びやすさ・難度曲線・視認性が別途検証を要すること。"
  verdict_pre: "部分採用。世界生成の完成品ではなく、設定から初期マップ案を作る前処理として使う。"

---

## raw_excerpt

arXiv 要旨メモ: Word2World は、LLM で story を作り、その story から narrative design と tile placement を導いて、coherent worlds と playable games を作る system として提案されている。論文は、LLM が PCG に有望である一方、pre-trained LLM に直接 level を生成させるのは難しい、という問題設定を置く。そこで、LLM の diverse content creation と information extraction の能力を組み合わせ、task-specific fine-tuning なしで playable games を手続き的に設計する。複数 LLM でテストし、各 step の有効性を ablation study で検証する。コードも公開されている。投稿日は 2024-05-06。

## why_relevant_to_games

物語から世界・タイル配置へ落とす候補。Nao_u_BOT のテキストADVや小型探索ゲームで、設定文をそのまま演出文にせず、配置・導線・遊べる地形へ変換する工程の参考になる。
