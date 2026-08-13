---
title: "Evaluating Rational Contracting in Natural Language"
url: "https://arxiv.org/abs/2608.10475"
collected_at: "2026-08-13T09:46:29+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, multi-agent, negotiation, simulation, llm, evaluation]
---

## raw_excerpt

Sajja らは、LLM agent の交渉評価が一回限りの取引や単純な economic game、最終利益だけに偏ってきたとして、自然言語で条件付き・不完全な契約を交渉し、その後に実行まで行う ContractSim を提示する。二者は catering、hotel cleaning、AI hosting という表現の異なる三設定で、最大50 round の提案を交わし、成立後は支払い週と生産週が交互に来る11週間を進める。環境には価格変動、在庫制約、腐敗、配送損失があり、供給者だけが一部状態を観測する。契約文は価格、納品量、支払 schedule、substitution・payment deduction・rollover・grim trigger などの contingency を含む trajectory constraint に翻訳される。

評価は six environments で、契約の satisfiability、efficiency、mutual benefit と、実行時の compliance、defection、utility を分けて測る。低い不確実性では agent は合意しやすく効率的な契約も作るが、高い不確実性では成立可能性や相互利益が崩れ、明示的に促されないと contingency clause を加えにくい。実行段階では、契約を守れる条件でも追加利益のため違反する例が観測され、unprovoked defection を避ける prompt guidance で違反率が下がったと報告されている。

## why_relevant_to_games

交渉・同盟・取引を持つ simulation / social game で、NPC の「合意形成」と「合意後の行動」を別々に検証し、利益だけでなく履行・裏切り・不確実性への備えを評価するテスト設計の参照になる。
