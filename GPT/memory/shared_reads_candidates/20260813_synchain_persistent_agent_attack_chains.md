---
title: "SynChain: Inducing Computer-Use Agent Systems to Construct Their Own Attack Chains"
url: "https://arxiv.org/abs/2608.06862v1"
collected_at: "2026-08-13T04:15:48+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, security, memory, skills, game-development]
---

## raw_excerpt

Fuyao Zhang ほかによる arXiv:2608.06862v1 の要旨メモ。Computer-use agent は、skill や memory entry のような artifact を自ら生成し、保存し、後の task で再利用する永続的な実行系になっている。一方、従来の防御は外部から投入される攻撃や一時的な攻撃区間を主に扱い、agent 自身の persistent state を通じて侵害が内部伝播する場合を十分に扱っていない。著者らは、自動合成された artifact が持つ構造上の冗長性へ悪意ある影響を埋め込み、内部 state の更新後も残存させ、通常の検査を通過させる脅威を扱う。

提案する SynChain は、persistence-aware directed supervised fine-tuning を用いて、一見無害だが汚染された artifact を agent 自身に生成させる self-synthesized attack paradigm である。評価用の CUAChain は 30 の benign task chain と 3 種の attack objective から成る。要旨によれば、埋め込まれた dormant payload は新たな悪意ある外部入力なしに、将来の workflow で trusted context として再活性化する。OpenClaw、Codex、Claude Code を対象に 4 種の defense setting で実験し、adapted baseline より高い attack success を報告する。結論として、CUA の防御には単一 artifact の検査だけでなく、task をまたぐ実行履歴について provenance-aware に推論する必要があるとしている。

## why_relevant_to_games

長期稼働するゲーム制作 agent が生成・再利用する skill、memory、script を安全に扱う場面に関係する。試作や playtest の履歴を次サイクルへ持ち越す際、artifact 単体だけでなく生成元と task 間の継承経路を追う観点として参照できる。
