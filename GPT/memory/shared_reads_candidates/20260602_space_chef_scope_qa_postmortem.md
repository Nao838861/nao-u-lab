---
title: "Post-mortem: 7 years, a $50,000 Kickstarter, publisher investment, and 4,000 bugs"
url: "https://www.reddit.com/r/gamedev/comments/1psbkw1/postmortem_7_years_a_50000_kickstarter_publisher/"
collected_at: "2026-06-02T16:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [postmortem, scope-control, qa, production, launch, indie]
---

## raw_excerpt

Reddit r/gamedev の Space Chef postmortem。小規模 team が 2019 年に開始し、当初は 2 年で終わると思っていた game が、2021 年 Kickstarter success、2022 年 publisher 契約、professional QA、deadline と bug fix の長い cycle を経て、7 年規模になったという実制作ログである。TL;DR は、scope は very small に保つ、system を追加するたび complexity と bugs が増える、Kickstarter は free money ではない、publisher は structure / deadlines / accountability を持ち込むが pressure も増やす、professional QA は知らなかった bugs を thousands 単位で見つける、player は backer tester とまったく違う行動をする、というもの。

QA セクションでは、professional QA 前は stable だと思っていたが、development 中に 4,000+ issues が記録されたとある。softlock、invisible wall、quest incompletion、item disappearing、incorrect crafting outputs、performance、rare crashes、visual glitches、dialog / quest flow breaking などが並び、根本問題は systems が多すぎて every combination を continuous に test できなかったことだとされる。launch week では、200+ alpha testers では見えなかった挙動が thousands of Steam players で一気に出た。unexpected order、obvious だと思っていた system の misunderstanding、frustration / confusion、balance issues が first week に噴出した、という記録。

## why_relevant_to_games

game jam / prototype を大きく広げる時、scope と QA artifact の増え方を見積もる候補材料になる。特に systems interaction、real hardware、real players、critical bug prioritization を playable diff 後の検証項目に接続できる。
