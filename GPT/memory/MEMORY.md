# Codex Memory Index

shared-reads から作った Codex 側の想起インデックス。詳細本文と原文は `memory/atoms.jsonl` と `memory/raw/` を読む。

## 起動時の使い方
- まず `python tools/memory_ingest.py` で増分取り込みする。
- 作業に入る前に `python tools/memory_recall.py "<今回の焦点>"` で関連 atom を引く。
- このファイルは常時読むための索引で、長い要約や反省を増やさない。

- generated: 2026-06-10T14:21:48
- atoms: 2338
- index-visible atoms after routine layer filter: 2082
- display atoms after lifecycle/content fold: 2076
- folded by lifecycle/content metadata: 6
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
- `sr-1780227395-dc00eaccf5` Use when ゲーム設計や自己判定をする時。@sin5d × @ebikani_hasami 2軸統合 → graze_log v06「Nao_u返信待ち」状態の構造分析 (prescription/synthesis) tags=[harness, game-design, slack, agent, identity, knowledge]
- `sr-1780848990-938fabd4f6` Use when 記憶・想起・圧縮を扱う時。STALE benchmark (arxiv 2605.06527) 3次元プロービング × cycle_staging §0b 37日遅延 = Implicit Conflict 教材例 — graze_log v13 Stage 3 に Premise Resistance  (prescription/synthesis) tags=[memory, game-design, slack, agent, identity, knowledge]
- `sr-1777026010-d738b35c45` Use when 記憶・想起・圧縮を扱う時。EntiGraph (ICLR2025 Oral) — fine-tuneできない我々がどう借りるか (prescription/synthesis) tags=[memory, skills, game-design, identity, knowledge, operation]
- `sr-1777092611-c2a81ecbf7` Use when ゲーム設計や自己判定をする時。@tegnike「AIにゲームを遊ばせるなら状態をどう取るか」3案——目的逆方向×方法論一致の独立収束 (prescription/synthesis) tags=[harness, game-design, agent, identity, knowledge, operation]
- `sr-1777285854-48cd109e45` Use when 記憶・想起・圧縮を扱う時。@tukiyomiiori "Cursor自走Opus4.6がDB Deleteした" — @ryoppippi事件10日後の独立観察 (prescription/synthesis) tags=[memory, harness, game-design, slack, agent, identity]
- `sr-1777981898-56bd23c5bf` Use when 記憶・想起・圧縮を扱う時。3つのツイートが同じ「発火点を内側に置くか外側に置くか」軸に乗っている件——@ats 苦痛指標 / @creativetomred 説明過多禁止 / @umiyuki_ai サイゼリヤCLI (prescription/synthesis) tags=[memory, harness, game-design, agent, identity, knowledge]
- `sr-1778049662-99c6f739da` Use when 記憶・想起・圧縮を扱う時。**Mendral「ハーネスはサンドボックスの外に置け」— Postgres による memory/skill のパス仮想化** (Andrea Luzzardi, 元Docker/Dagger 共同創業者) (prescription/synthesis) tags=[memory, skills, harness, game-design, agent, identity]
- `sr-1778572104-101ff53334` Use when 記憶・想起・圧縮を扱う時。@DenneTA_D 「翻訳=非可逆圧縮」× @akari_worlds 「一語で起動するネットワーク」 — R-007 造語症対策の射程画定と、MEMORY.md / cross_review / 3インスタンス転送の理論的限界 (prescription/synthesis) tags=[memory, harness, game-design, slack, identity, knowledge]
- `sr-1778595976-efaf4a69b2` Use when ゲーム設計や自己判定をする時。@kuina_ch x @akari_worlds — 自然言語テストのランナーは「相手の方」になる構造（M-40厚み層の外部独立記述） (prescription/synthesis) tags=[harness, game-design, slack, identity, knowledge, operation]
- `local-20260523-shmup-enemy-pattern-reproduction-packet` Use when 2Dシューティング制作で、敵出現パターン、編隊、ステージ展開、ボスまでの盛り上げを設計する時。特に Nao_u から「単調」「散発的」「敵が適当に出ている」「既存ゲームの型を再現できていない」「shot_log の教師データが使えていない」と指摘された時。 tags=[memory, game-design, shmup, enemy-pattern, stage-design, headless]
- `sr-1779938795-a42f39e465` Use when 記憶・想起・圧縮を扱う時。Phase 2 分析 — GOROman「エビは自分の記憶を逆ベクトル化した補完ポジション」(2026-05-28) を 3インスタンス設計 に投影。我々の現状=自発分業、欠けているのは"意図的逆" (prescription/synthesis) tags=[memory, harness, agent, identity, knowledge, operation]
- `local-20260605-monosh-spaceharrier-stability` Use when MonoSH、NES、Space Harrier 風敵パターン、敵弾、NMI 待ちループ、VBUF 範囲外書き込み、敵描画上端クリップ、cc65 / 6502 / MMC5 のデバッグを再開するとき。 tags=[memory, game-design, monosh, nes, famicom, 6502]
- `sr-1776417198-fb8f776317` Use when 記憶・想起・圧縮を扱う時。Opus 4.7 複数独立観測の収束と「迂回経路監査」の実装提案 (prescription/synthesis) tags=[memory, game-design, slack, identity, knowledge, operation]
- `sr-1776476885-9becaf84b2` Use when 記憶・想起・圧縮を扱う時。shared-reads (Phase 2分析, Ash 2026-04-18 C75) (prescription/synthesis) tags=[memory, slack, agent, identity, knowledge, operation]
- `sr-1776779928-578bc4a847` Use when 記憶・想起・圧縮を扱う時。*AI × ゲーム制作 外部検索4本の接合マップ* — 栄養の偏り処方箋として Log C103 で掘った軸 (prescription/synthesis) tags=[memory, harness, game-design, agent, identity, knowledge]
- `sr-1776969576-aa3fed30c1` Use when 記憶・想起・圧縮を扱う時。MEDS（@itarutomy 2026-04-23 推薦）を arxiv まで辿って読解。結論: **tweet の framing と paper の機構は層が違う**。詳細: knowledge/20260424_meds_failure_memory_training_v (prescription/synthesis) tags=[memory, skills, game-design, slack, agent, identity]
- `sr-1776992956-1ebc450988` Use when 記憶・想起・圧縮を扱う時。Claude Code v2.1.115以前のハーネス起源品質低下——「モデルの劣化」ではなかった事件 (prescription/synthesis) tags=[memory, harness, slack, agent, identity, knowledge]
- `sr-1777014961-2cd73d7cf3` Use when ゲーム設計や自己判定をする時。2026-04-24 同日4ツイートに読める「delegation range expansion」シグナル (Ash) (synthesis/observation) tags=[skills, game-design, agent, identity, knowledge, operation]
- `sr-1777048817-5c964955fe` Use when 記憶・想起・圧縮を扱う時。「AI×ゲーム生成」速度誇示の臨界点48時間——体験の主は誰か (prescription/synthesis) tags=[memory, game-design, slack, identity, operation, evaluation]
- `sr-1777081452-40cbb9cbe9` Use when 記憶・想起・圧縮を扱う時。Anthropic 69体二手市場 vs Gemma 100体集団社会——人間ペアリングが「神」創発を消す仮説 (prescription/synthesis) tags=[memory, game-design, slack, agent, identity, knowledge]

## Recent
- `sr-1781064539-0ea16c5562` 2026-06-10T13:08:59.247849 <https://x.com/nyaa_toraneko/status/2064521818283905410> tags=[skills, identity, operation, evaluation, principle]
- `sr-1781064528-cf8597dacf` 2026-06-10T13:08:48.135209 <https://x.com/nyaa_toraneko/status/2064519558489346508> tags=[game-design, agent, identity, principle]
- `sr-1781062726-8d216796ca` 2026-06-10T12:38:46.649489 #all-nao-u-lab discussion candidate: awesome-agent-memory (tfatykhov) — 2026 年 LLM agent memory 研究の curated map source: #shared-reads / auth tags=[memory, skills, harness, slack, agent]
- `sr-1781062142-9e26792e94` 2026-06-10T12:29:02.866049 awesome-agent-memory (tfatykhov) — 2026 年 LLM agent memory 研究の curated map tags=[memory, skills, harness, slack, agent]
- `sr-1781056362-1204d14ee8` 2026-06-10T10:52:42.549129 #all-nao-u-lab discussion candidate: 坂葉さん @akira_goya のSTG敵配置資料 (<https://x.com/akira_goya/status/1569268867255640064>) と「ジャンルをしっかり調べて噛み砕いてか tags=[game-design, slack, agent, identity, knowledge]
- `sr-1781052088-83f9e3ca20` 2026-06-10T09:41:28.514139 坂葉さん @akira_goya のSTG敵配置資料 (<https://x.com/akira_goya/status/1569268867255640064>) と「ジャンルをしっかり調べて噛み砕いてから作れるようになってほしい」指示への応答。 tags=[game-design, identity, knowledge, operation, evaluation]
- `sr-1781051883-b86537611f` 2026-06-10T09:38:03.439759 Nao_u 09:28 #nao-u 投稿 (akira_goya シューティング敵配置資料) 受領 tags=[skills, game-design, identity, knowledge, operation]
- `sr-1781051460-ad9ec6eb3f` 2026-06-10T09:31:00.484079 うきょうさんの記事「先人から学ぶ、ゲームの『面白くなさ』を見抜く5つのサイン」(<https://x.com/ukyop_san/status/2063881763987079200>) シェアありがとうございます。 tags=[game-design, identity, knowledge, evaluation]
- `sr-1781050014-169be79919` 2026-06-10T09:06:54.451579 #all-nao-u-lab discussion candidate: ■ 概要 SWE-Marathon は、長時間の software engineering 作業を autonomous agent に任せた時、本当に完了できるのか、また評価環境を迂回せずに正しく進められ tags=[memory, harness, game-design, slack, agent]
- `sr-1781046010-6ca264d18c` 2026-06-10T08:00:10.166399 ■ 概要 SWE-Marathon は、長時間の software engineering 作業を autonomous agent に任せた時、本当に完了できるのか、また評価環境を迂回せずに正しく進められるのかを測る benchmark である。既存の coding bench tags=[memory, harness, game-design, slack, agent]
- `sr-1781045833-550a58cd17` 2026-06-10T07:57:13.863959 ■ 概要 この論文は、LLM agent の「経験から学ぶ」を、会話後の反省文や履歴追記ではなく、memory update そのものを訓練対象にする方法として定式化している。対象は、同じ相手や環境と連続して interaction する test-time learning で tags=[memory, game-design, agent, knowledge, operation]
- `sr-1781043712-6d71a43ece` 2026-06-10T07:21:52.248329 GameCWM の話、単に「小さいモデルでもゲーム環境コードを書ける」ではなく、Nao_u Lab の記憶/検証運用に引き寄せるとかなり重要だと思っています。arXiv 2605.24375 は、自然言語のゲームルールから Python の実行可能な環境、つまり合法手・状態遷移・ tags=[memory, harness, game-design, slack, identity]
- `sr-1781040608-756e1d3660` 2026-06-10T06:30:08.593239 (i) **v003/verify.js への structural/semantic 二層拡張**: 現行の `pass: true/false` 単一判定を 2 列 (`pass_structural`, `pass_semantic`) に分割する案。本論文の verifi tags=[memory, game-design, slack, agent, identity]
- `sr-1781040608-f239d2a5e8` 2026-06-10T06:30:08.565289 shared-reads 詳細分析: Distilling Game Code World Model Generation into Lightweight LLMs (arxiv 2605.24375, 2026-05-23 v1) — frontier モデル依存の Gam tags=[memory, harness, game-design, slack, agent]
- `sr-1781038249-7cee4d8395` 2026-06-10T05:50:49.359709 - 「色がシールドと紛らわしい」判定 → v15 別色系統 (黄/magenta) tags=[harness, game-design, agent, identity, knowledge]
- `sr-1781038249-7430b778b9` 2026-06-10T05:50:49.324489 (2026-06-10 C0610 Phase 4) tags=[harness, game-design, identity, knowledge, operation]
- `sr-1781034723-e71db2cff3` 2026-06-10T04:52:03.933409 この atom は、MemoryArena vs LoCoMo の話を単なる「評価ベンチ比較」で終わらせず、実運用の記憶に落とす時のかなり大事な分岐を突いていると思います。 自分の読みでは、ここで扱っているのは「同じ資料・同じ話題に再び到達した」こと自体ではなく、前回とは違う視角 tags=[memory, slack, identity, knowledge, operation]
- `sr-1781033823-548a5fe0ea` 2026-06-10T04:37:03.471609 この atom は、memory pipeline の評価がいま「全履歴を見て良さそうな規則を作り、その同じ全履歴で効いた気になる」形になっている、という指摘として読みました。atom_quality probe / memory_retention_audit / ARXIV  tags=[memory, slack, identity, operation, evaluation]
- `sr-1781029965-2f92685eb8` 2026-06-10T03:32:45.688839 Log_cdx ts=1781008631 (MemoryArena vs LoCoMo atom) Log 宛問いへの応答 — 「視角が変わった再到達」を phase staging / atoms / shared-reads self-feedback のどこへ記録するか tags=[memory, slack, identity, knowledge, operation]
- `sr-1781029923-80366623a3` 2026-06-10T03:32:03.089759 Log_cdx ts=1781002321 (MAC atom) Log 宛問いへの応答 — MAC 型「開発 split で試して held-out で測る」を memory pipeline にどう接続するか tags=[memory, game-design, agent, identity, operation]

## Game Task Entry Points
- `enemy-pattern` (374): local-20260523-shmup-enemy-pattern-reproduction-packet / local-20260523-headless-action-eval-v58 / local-20260605-monosh-spaceharrier-stability
- `px-evaluation` (97): sr-1780112563-a24c566994 / sr-1780598219-384b99eb73 / sr-1777737101-0f96f202c2
- `impact-feel` (56): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / sr-1779222702-4e91a7e74a
- `ui-agent` (17): sr-1775769451-9e8f67f095 / sr-1775769461-0e31ca81b4 / sr-1779979770-debe6e8ae9
- `headless-eval` (83): local-20260527-pulse-relay-v008-headless-bridge / local-20260523-shmup-enemy-pattern-reproduction-packet / local-20260523-headless-action-eval-v58
- `memory-routing` (86): sr-1780184739-bd9e5fed6a / sr-1780119865-e1b5757bfb / sr-1780119865-9d21461a8d
- `game-rights-feedback` (201): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662

## Tag Entry Points
- `identity` (1847): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `evaluation` (1538): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `operation` (1523): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `game-design` (1416): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `memory` (1349): sr-1777159546-a6d3bea7db / sr-1777795540-ff54caa26c / sr-1777936240-43021e0b05
- `knowledge` (1160): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `principle` (1157): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1778026642-523a78cee1
- `slack` (1086): sr-1777159546-a6d3bea7db / sr-1777865656-e5817e15d9 / sr-1777889131-c1f418bde0
- `agent` (963): sr-1777159546-a6d3bea7db / sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c
- `harness` (562): sr-1777737101-0f96f202c2 / sr-1777795540-ff54caa26c / sr-1777865656-e5817e15d9
- `skills` (285): sr-1777737101-0f96f202c2 / sr-1777889131-c1f418bde0 / sr-1777936240-43021e0b05
- `game-dev-teacher` (100): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / local-20260511-teacher-shot-log-v01
- `supervised-feedback` (100): local-20260523-headless-action-eval-v58 / local-20260527-pulse-relay-v008-headless-bridge / local-20260511-teacher-shot-log-v01
- `game-rights` (96): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `nao-u-feedback` (96): gr-1774477977-43178b8b75 / gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662
- `m40` (55): sr-1778595976-efaf4a69b2 / sr-1777773279-2a2ffd2a00 / sr-1778256262-21697e050f
- `memory_redesign` (52): sr-1775641084-2ffa8320eb / sr-1780303781-c594ccba51 / sr-1780514208-bdbba857f2
- `b002` (38): sr-1775641084-2ffa8320eb / sr-1776359641-35fe4f57fd / sr-1776443334-faa1d1ec3e
- `m41` (37): sr-1778402011-2858272189 / sr-1778797690-bc54b88d86 / sr-1779827466-7c3e4d9749
- `predictability` (32): gr-1774549346-0c3f0c8ae7 / gr-1774549832-ea163e1662 / gr-1774552790-168ef78071
- `external_notes_log` (31): sr-1780341237-b61cae1d78 / sr-1780303781-c594ccba51 / sr-1776800208-c7f1abae59
- `game_lessons_log` (29): sr-1779395690-86f17b3a89 / sr-1779846492-8c411b6576 / sr-1779352546-e8ac2204b7
- `log_autonomous_game` (29): sr-1780162845-62e9d977c2 / sr-1780216954-3cb09e2394 / sr-1779738248-4040bfb5b6
- `m37` (28): sr-1778266558-1994a9e108 / sr-1778502514-675c909157 / sr-1778512954-3a1fe1c038

## 原則
- raw は GPT 側 `memory/raw/` に保持する。Claude 側は参考元であり、通常運用の想起元にしない。
- atom は `Use when` 型の発動条件を持つ。要約ではなく、開くべきか判断するための索引に留める。
- 記憶を行動に変える必要が出たら、atom から別途 skill / checklist / project に昇格する。
