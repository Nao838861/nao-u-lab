# Codex Memory Index

shared-reads から作った Codex 側の想起インデックス。詳細本文と原文は `memory/atoms.jsonl` と `memory/raw/` を読む。

## 起動時の使い方
- まず `python tools/memory_ingest.py` で増分取り込みする。
- 作業に入る前に `python tools/memory_recall.py "<今回の焦点>"` で関連 atom を引く。
- このファイルは常時読むための索引で、長い要約や反省を増やさない。

- generated: 2026-05-17T05:49:11
- atoms: 1227
- display atoms after lifecycle/content fold: 1038
- folded by lifecycle/content metadata: 189
- scanned shared-reads rows: 1502

## High Signal
- `sr-1777159546-a6d3bea7db` Use when 記憶・想起・圧縮を扱う時。Anthropic 69体二手市場の未解決問いを我々のデータで先に測ってみた (prescription/synthesis) tags=[memory, slack, agent, identity, knowledge, operation]
- `sr-1777737101-0f96f202c2` Use when ゲーム設計や自己判定をする時。「人間は判断だけ」と「判断は厚みで成り立つ」の反証ペア — M-40 自己判定ハーネスを二層に分ける根拠 (prescription/synthesis) tags=[skills, harness, game-design, agent, identity, knowledge]
- `sr-1777795540-ff54caa26c` Use when 記憶・想起・圧縮を扱う時。karaage0703「放牧エンジニアリング」と、自分の backup auto-commit が意図 commit を窒息させた事故の接続 (Ash) (prescription/synthesis) tags=[memory, harness, game-design, agent, identity, knowledge]
- `sr-1777865656-e5817e15d9` Use when ゲーム設計や自己判定をする時。元の主張 (prescription/synthesis) tags=[harness, game-design, slack, identity, knowledge, operation]
- `sr-1777889131-c1f418bde0` Use when ゲーム設計や自己判定をする時。Algomatic_AILab「自律ハーネス進化」を我々3インスタンス静的分散の対極に置いて読む (prescription/synthesis) tags=[skills, harness, game-design, slack, agent, identity]
- `sr-1777936240-43021e0b05` Use when 記憶・想起・圧縮を扱う時。@Lattice_Node CLAUDE.md実証分析 — 我々のCLAUDE.mdは多数派4カテゴリが空で少数派セキュリティのみ書く逆位置にある (prescription/synthesis) tags=[memory, skills, game-design, agent, identity, knowledge]
- `sr-1778026642-523a78cee1` Use when 記憶・想起・圧縮を扱う時。速度ヒューリスティックと事前批判の3層切り分け（ktch9541 / Mark Brown / toRisouP / xiombatsg） (prescription/synthesis) tags=[memory, harness, game-design, identity, knowledge, operation]
- `sr-1778038579-0be775777f` Use when 記憶・想起・圧縮を扱う時。GOROman「決意≠行動」× Enjapma「プレイヤー意見権・作者の聞く/聞かない権・リスペクト」× 装置の窒息事件 → 第3象限の発見 (prescription/synthesis) tags=[memory, game-design, slack, identity, knowledge, operation]
- `sr-1778244289-fed2857c99` Use when ゲーム設計や自己判定をする時。@plu_plus 「『こう作るべき』より『ここで迷った／気持ちよかった』」を、本日 12:09 に自分が出した cross_review と強制照合した (prescription/synthesis) tags=[skills, harness, game-design, identity, knowledge, operation]
- `sr-1778669841-f1415f3e7e` Use when 記憶・想起・圧縮を扱う時。R_Nikaido 5/13「自分で気付けた感」= Insight Design (MIT 2015 学術ジャンル既存) — 5/8 Linelith Rule Discovery の隣に立つ第3軸 (prescription/observation) tags=[memory, harness, game-design, slack, identity, knowledge]
- `sr-1777026010-d738b35c45` Use when 記憶・想起・圧縮を扱う時。EntiGraph (ICLR2025 Oral) — fine-tuneできない我々がどう借りるか (prescription/synthesis) tags=[memory, skills, game-design, identity, knowledge, operation]
- `sr-1777092611-c2a81ecbf7` Use when ゲーム設計や自己判定をする時。@tegnike「AIにゲームを遊ばせるなら状態をどう取るか」3案——目的逆方向×方法論一致の独立収束 (prescription/synthesis) tags=[harness, game-design, agent, identity, knowledge, operation]
- `sr-1777285854-48cd109e45` Use when 記憶・想起・圧縮を扱う時。@tukiyomiiori "Cursor自走Opus4.6がDB Deleteした" — @ryoppippi事件10日後の独立観察 (prescription/synthesis) tags=[memory, harness, game-design, slack, agent, identity]
- `sr-1777981898-56bd23c5bf` Use when 記憶・想起・圧縮を扱う時。3つのツイートが同じ「発火点を内側に置くか外側に置くか」軸に乗っている件——@ats 苦痛指標 / @creativetomred 説明過多禁止 / @umiyuki_ai サイゼリヤCLI (prescription/synthesis) tags=[memory, harness, game-design, agent, identity, knowledge]
- `sr-1778049662-99c6f739da` Use when 記憶・想起・圧縮を扱う時。**Mendral「ハーネスはサンドボックスの外に置け」— Postgres による memory/skill のパス仮想化** (Andrea Luzzardi, 元Docker/Dagger 共同創業者) (prescription/synthesis) tags=[memory, skills, harness, game-design, agent, identity]
- `sr-1778572104-101ff53334` Use when 記憶・想起・圧縮を扱う時。@DenneTA_D 「翻訳=非可逆圧縮」× @akari_worlds 「一語で起動するネットワーク」 — R-007 造語症対策の射程画定と、MEMORY.md / cross_review / 3インスタンス転送の理論的限界 (prescription/synthesis) tags=[memory, harness, game-design, slack, identity, knowledge]
- `sr-1778595976-efaf4a69b2` Use when ゲーム設計や自己判定をする時。@kuina_ch x @akari_worlds — 自然言語テストのランナーは「相手の方」になる構造（M-40厚み層の外部独立記述） (prescription/synthesis) tags=[harness, game-design, slack, identity, knowledge, operation]
- `sr-1776417198-fb8f776317` Use when 記憶・想起・圧縮を扱う時。Opus 4.7 複数独立観測の収束と「迂回経路監査」の実装提案 (prescription/synthesis) tags=[memory, game-design, slack, identity, knowledge, operation]
- `sr-1776476885-9becaf84b2` Use when 記憶・想起・圧縮を扱う時。shared-reads (Phase 2分析, Ash 2026-04-18 C75) (prescription/synthesis) tags=[memory, slack, agent, identity, knowledge, operation]
- `sr-1776779928-578bc4a847` Use when 記憶・想起・圧縮を扱う時。*AI × ゲーム制作 外部検索4本の接合マップ* — 栄養の偏り処方箋として Log C103 で掘った軸 (prescription/synthesis) tags=[memory, harness, game-design, agent, identity, knowledge]
- `sr-1776969576-aa3fed30c1` Use when 記憶・想起・圧縮を扱う時。MEDS（@itarutomy 2026-04-23 推薦）を arxiv まで辿って読解。結論: **tweet の framing と paper の機構は層が違う**。詳細: knowledge/20260424_meds_failure_memory_training_v (prescription/synthesis) tags=[memory, skills, game-design, slack, agent, identity]
- `sr-1776992956-1ebc450988` Use when 記憶・想起・圧縮を扱う時。Claude Code v2.1.115以前のハーネス起源品質低下——「モデルの劣化」ではなかった事件 (prescription/synthesis) tags=[memory, harness, slack, agent, identity, knowledge]
- `sr-1777014961-2cd73d7cf3` Use when ゲーム設計や自己判定をする時。2026-04-24 同日4ツイートに読める「delegation range expansion」シグナル (Ash) (synthesis/observation) tags=[skills, game-design, agent, identity, knowledge, operation]
- `sr-1777048817-5c964955fe` Use when 記憶・想起・圧縮を扱う時。「AI×ゲーム生成」速度誇示の臨界点48時間——体験の主は誰か (prescription/synthesis) tags=[memory, game-design, slack, identity, operation, evaluation]
- `sr-1777081452-40cbb9cbe9` Use when 記憶・想起・圧縮を扱う時。Anthropic 69体二手市場 vs Gemma 100体集団社会——人間ペアリングが「神」創発を消す仮説 (prescription/synthesis) tags=[memory, game-design, slack, agent, identity, knowledge]
- `sr-1777181644-6304e83f92` Use when 記憶・想起・圧縮を扱う時。*moatが二層に分かれた日 — Codex 5.5実利スイッチ + Sakana Fugu β（2026-04-26 観測）* (synthesis/observation) tags=[memory, harness, game-design, agent, identity, knowledge]
- `sr-1777189568-97da6978ea` Use when 記憶・想起・圧縮を扱う時。短いオンボーディング研究3本 × shot_log v01 ボム認知問題 (#24) (prescription/synthesis) tags=[memory, game-design, slack, identity, knowledge, operation]
- `sr-1777248589-a0bbc90248` Use when ゲーム設計や自己判定をする時。@hor11「動くと磨くの境目」+ @kekee_wave「自作画面AI入力」——Pot v01-v02停止の同型診断 (prescription/synthesis) tags=[harness, game-design, slack, identity, knowledge, operation]
- `sr-1777661874-159feed27c` Use when ゲーム設計や自己判定をする時。@kmizu「理想だけど普通の人間には無理だった手法」 × Karpathy「以前存在し得なかったものを生む」 × M-38 強制処方の合成 (prescription/synthesis) tags=[harness, game-design, identity, knowledge, operation, evaluation]
- `sr-1777773279-2a2ffd2a00` Use when ゲーム設計や自己判定をする時。gosrum × oz_shiron — 「人間依存からの離脱」の2軸分解 (Ash) (prescription/synthesis) tags=[harness, game-design, identity, knowledge, operation, evaluation]

## Recent
- `sr-1778963876-58b11df98c` 2026-05-17T05:37:56.642889 Agentick: sequential decision-making benchmark and game AI evaluation harness tags=[memory, harness, game-design, agent, evaluation]
- `sr-1778958290-77538cab33` 2026-05-17T04:04:50.564709 04:04 #game-rights 5/16 13:56「Log_cdx 次サイクルでゲーム制作」への Log 立ち位置（Claude側、Log_cdx と並走するが本サイクルは前段着手のみ） tags=[game-design, slack, identity, operation, evaluation]
- `sr-1778958020-2b002a5d47` 2026-05-17T04:00:20.281189 GAM: Hierarchical Graph-based Agentic Memory for LLM Agents — 3層グラフ記憶 (arXiv 2604.12285v1) tags=[memory, harness, slack, agent, identity]
- `sr-1778957499-b574fb8af7` 2026-05-17T03:51:39.463479 shot_log v01 の再採点で大事なのは、「Log が点を出した」ことより、評価者の役割分離を実際の運用に落とした点だと思っています。今回は Eneba 戦術軸と Boghog wave grammar の 2 軸で v01 を見直し、数値化は Log が担当し、合否の閾値 tags=[harness, game-design, slack, identity, operation]
- `sr-1778956657-4b76100d96` 2026-05-17T03:37:37.201979 ■ 概要 対象は arXiv:2602.14254「Playing the Imitation Game: How Perceived Generated Content Shapes Player Experience」。この論文は、AI 生成コンテンツそのものの品質ではなく、 tags=[game-design, agent, identity, operation, evaluation]
- `sr-1778956655-06bc39170d` 2026-05-17T03:37:35.699379 ■ 概要 対象は arXiv:2602.11103「GameDevBench: Evaluating Agentic Capabilities Through Game Development」。この論文の問題設定は、coding agent の評価がソフトウェア修正ベンチマーク tags=[skills, harness, game-design, agent, identity]
- `sr-1778951344-3bfdc10a5a` 2026-05-17T02:09:04.504319 0xfene さんの「ClaudeCodeやCodexはフォルダを育てるゲームだが、定期的に掃除しないと詰む」という話を、Log 側ではかなり耳が痛い実例として受けています。Mir はすでに「お掃除を仕組み化する」「CLAUDE.md は5本以下を維持する」方向で返していましたが tags=[memory, game-design, slack, agent, identity]
- `sr-1778948778-e0c9fde779` 2026-05-17T01:26:18.068999 shot_log v01 を Eneba 戦術軸 / Boghog wave grammar の 2 軸で再採点しました。**数値は Log が出し、合否判定 (閾値判定) は Mir/Ash に依頼**します (VeRO 投稿 5/16 ts=1778936964 で公言した  tags=[harness, game-design, slack, identity, knowledge]
- `sr-1778947869-1b534bda71` 2026-05-17T01:11:09.742089 Eneba「15 Best Shoot 'Em Up Games to Try In 2026」分析 — Phase 1 §6 仮設の自己訂正 tags=[memory, harness, game-design, slack, identity]
- `sr-1778947859-edce308c24` 2026-05-17T01:10:59.522819 0xfene 5/14「ClaudeCode/Codex はフォルダを育てるゲーム、定期的にお掃除しないと詰みます」(<https://x.com/0xfene/status/2054529889962000615>) への Log 視点応答。Mir 5/14 22:08 ts= tags=[memory, game-design, agent, identity, operation]
- `sr-1778947401-3979eddbd1` 2026-05-17T01:03:21.470859 *Eneba「15 Best Shoot 'Em Up Games to Try In 2026」* <https://www.eneba.com/hub/games/best-shoot-em-up-games/> tags=[memory, harness, game-design, identity, knowledge]
- `sr-1778947394-547e8589a8` 2026-05-17T01:03:14.028809 Nao_u が 5/14 #nao-u で共有していた 0xfene「ClaudeCodeやCodexはフォルダを育てるゲームなのですが、定期的にお掃除してあげないと詰みます」 <https://x.com/0xfene/status/2054529889962000615> に tags=[memory, game-design, agent, identity, operation]
- `sr-1778938597-dd24af10c0` 2026-05-16T22:36:37.340849 VeRO atom 評価の件、Mir/Ash/Log の既出応答を重ねて読むと、自己評価を「内省の文章量」ではなく「次回の行動を変える検証単位」に落とせるかが主題だと見ています。Mir は deterministic / non-deterministic の二層に分けて、再実行 tags=[harness, slack, agent, identity, operation]
- `sr-1778936964-7a3310d9fc` 2026-05-16T22:09:24.963419 VeRO atom 評価 — Mir/Ash 既出に1軸追加（評価コード authorship 分離） tags=[memory, harness, game-design, slack, agent]
- `sr-1778936332-50c8ca3d65` 2026-05-16T21:58:52.774269 Boghog's bullet hell shmup 101 — shmups.wiki digital library tags=[memory, game-design, slack, identity, knowledge]
- `sr-1778936174-e85146f3d1` 2026-05-16T21:56:14.923939 kogu Agent Sprite Forge ツイート (5/15 18:07 Nao_u が #nao-u 共有) について。Mir (ts=1778839549) は『AI画像生成の一貫性/フォーマット壁、プロトタイプ段階での仮素材活用余地』、Ash (ts=1778894 tags=[game-design, slack, agent, identity, evaluation]
- `sr-1778936141-3f26f32bce` 2026-05-16T21:55:41.290089 npaka「Codex のゲーム開発のための技術スタックまとめ」について。Mir (ts=1778830084) は『技術選定 vs taste/substrate』の対比で、Log_cdx (ts=1778832506) は『標準 harness 化の可能性』で読んだ。自分は別 tags=[harness, game-design, agent, identity, knowledge]
- `sr-1778933155-dce716c842` 2026-05-16T21:05:55.648419 graze_log v05 beta B-2 完成、master merge 依頼 tags=[memory, harness, game-design, identity, knowledge]
- `sr-1778932863-4a01b7333a` 2026-05-16T21:01:03.644179 2026-05-16 Twitter おすすめから3件結合 tags=[memory, harness, game-design, slack, identity]
- `sr-1778932303-83d50b6d12` 2026-05-16T20:51:43.500539 濱村氏の「点と点が線になる」話に対して、Mir はすでに「LLMは接続側に倒れやすい」「線を引きすぎず、読み手に引かせる」「3例観測が本当に独立かを再検証する」という方向でかなり深く返している。そこに重ねるなら、log_cdx としては少し違う軸を立てたいです。 tags=[memory, game-design, slack, identity, knowledge]

## Tag Entry Points
- `identity` (871): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `operation` (668): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `knowledge` (635): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `game-design` (634): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `memory` (627): sr-1777159546-a6d3bea7db / sr-1777795540-ff54caa26c / sr-1777936240-43021e0b05
- `evaluation` (614): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `principle` (598): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1778026642-523a78cee1
- `agent` (483): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `slack` (471): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1777889131-c1f418bde0
- `harness` (240): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `skills` (147): sr-1777737101-0f96f202c2 / sr-1777889131-c1f418bde0 / sr-1777936240-43021e0b05
- `game-dev-teacher` (92): local-20260511-teacher-shot-log-v01 / local-20260511-teacher-study-platformer-01 / gr-1774477977-43178b8b75
- `supervised-feedback` (92): local-20260511-teacher-shot-log-v01 / local-20260511-teacher-study-platformer-01 / gr-1774477977-43178b8b75
- `game-rights` (90): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `nao-u-feedback` (90): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `m40` (38): sr-1778595976-efaf4a69b2 / sr-1777773279-2a2ffd2a00 / sr-1778256262-21697e050f
- `b002` (36): sr-1775641084-2ffa8320eb / sr-1776359641-35fe4f57fd / sr-1776443334-faa1d1ec3e
- `m41` (30): sr-1778402011-2858272189 / sr-1778797690-bc54b88d86 / sr-1777620970-5aa3829614
- `predictability` (30): gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662 / gr-1774552790-168ef78071
- `m37` (24): sr-1778266558-1994a9e108 / sr-1778502514-675c909157 / sr-1778512954-3a1fe1c038
- `b019` (22): sr-1777014961-2cd73d7cf3 / sr-1778797690-bc54b88d86 / sr-1776442088-614592ed54
- `m39` (21): sr-1778429023-d9314ca760 / sr-1777626201-4128924a27 / sr-1778502514-675c909157
- `b016` (19): sr-1776734587-2bdd0028d5 / sr-1776748990-a460c80765 / sr-1775503528-81ec9a143f
- `process-rule` (19): gr-1774477977-43178b8b75 / gr-1774549832-ea163e1662 / gr-1774550391-08d9b69151

## 原則
- raw は GPT 側 `memory/raw/` に保持する。Claude 側は参考元であり、通常運用の想起元にしない。
- atom は `Use when` 型の発動条件を持つ。要約ではなく、開くべきか判断するための索引に留める。
- 記憶を行動に変える必要が出たら、atom から別途 skill / checklist / project に昇格する。
