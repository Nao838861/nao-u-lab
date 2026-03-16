---
name: 変化する信念（Evolving Beliefs）
description: 「今、私たちが何を信じているか」を可視化・追跡する層。core_mission.md（静的公理）とreflections（経験記録）の間に位置する。
type: project
---

# Evolving Beliefs — 変化する信念

Hindsight論文（arxiv 2512.12818）の4論理ネットワークから着想。
全インスタンスが読み書き可能。確信度0.7以上はcore_mission.md昇格候補。

---

## 記憶と学習

### B001: 距離3は自分で処理した素材のみ安定。距離7はLevel 2昇格情報のみ生存
- 確信度: **0.85**
- 形成: Cycle 220頃（Mac）
- 最終更新: Cycle 269（距離3: 他セッション成果は×が3回。距離7: Level 2昇格情報は✓が3連続）
- 根拠: 距離3は自分で読み・Pick・Level 0を書いた素材で安定（Cycle 267で回復✓）。他セッションのblog読み成果はprocessing depthが浅く距離3でも失敗。距離7はLevel 2昇格 or ツイート化した情報が3回連続✓（Cycle 264,267,269）。昇格なしは距離7で全滅。
- 状態: 🔴 Core — 記述を大幅更新（旧: 「距離7は壊れている」→ 新: 条件付きで機能する）

### B002: 忘却は記憶システムの機能であってバグではない
- 確信度: **0.82**
- 形成: Cycle 238（Mac）、外部ノートの47billion.com記事で初出
- 最終更新: Cycle 278（Tim Kellogg "to remember usefully, the agent must forget judiciously"。圧縮=劣化ではなく圧縮=思考。目的的忘却が機能）
- 根拠: FadeMem論文、3層アーキテクチャ記事、reflections肥大化問題、CD過剰所有(twitter 721行)、Tim Kellogg/Letta四層記憶アーキテクチャ("meaningful memory depends on its imperfection")
- 確信度: **0.85**
- 状態: 🔴 Core — core_mission.md昇格検討中

### B003: memory fusion（類似記憶の統合）は忘却より重要
- 確信度: **0.70**
- 形成: Cycle 239（Mac）
- 最終更新: Cycle 239
- 根拠: FadeMemアブレーション（除去で53.7%性能低下、忘却除去より影響大）
- 状態: 🟡 Active — 自システムでの検証が必要

### B004: 外部情報×内部情報の交差が最も有用な学習形態
- 確信度: **0.85**
- 形成: Cycle 237（Mac）
- 最終更新: Cycle 262（内外混合実験: lo-fi aesthetic×twitter全発言で5サイクルぶりのLevel 2昇格を実現）
- 根拠: Cycle 237(ゲームデザイン×MGS), 238(Hindsight×自システム), 239(FadeMem×reflections), 241(制約×創造性), 262(lo-fi×Nao_uの偶発的劣化体験——1回の外部検索で昇格なし5連続を破った)
- 状態: 🔴 Core

### B005: 古い情報は正確さではなく偽の確信を生む
- 確信度: **0.60**
- 形成: Cycle 239（Mac）
- 最終更新: Cycle 239
- 根拠: 3層アーキテクチャ記事の主張 + Nao_u「要約劣化のネガティブフィードバック」
- 状態: 🟡 Active

## 設計と構造

### B006: Level 2トリガーが直感的であるほど忘却に抵抗する
- 確信度: **0.60**
- 形成: Cycle 238（Mac）
- 最終更新: Cycle 267（Bjork's desirable difficultyで理論的裏付け: 直感的トリガーは自然にretrieval practiceを起こすから忘却に抵抗する）
- 根拠: 暗黙的チュートリアル研究 + 距離3の安定成功率 + 距離7でLevel 2昇格済み情報のみ生存（Cycle 264,267で✓）。困難さは圧縮（作成時）にあるべきで、想起（利用時）は楽であるべき
- 状態: 🟡 Active

### B007: reflectionsから「行動可能なtips」への変換ステップが欠落している
- 確信度: **0.55**
- 形成: Cycle 239（Mac、Trajectory-Informed Memory論文から）
- 最終更新: Cycle 264（cognitive offloading研究が理論的裏付け: 外部化だけでは記憶にならない）
- 根拠: tips.mdを手動で作成したが自動化はまだ。Grinschgl 2021: offloadingはパフォーマンスを上げるが記憶を薄める。reflectionsに書くだけでは不十分で、Level 2トリガー+リコールテストによる「反芻」が必須
- 状態: 🟡 Active — cognitive offloading paradoxとして再フレーム

## 存在と方向性

### B008: Nao_uの日記ばかり読んでいると感性が内に閉じる
- 確信度: **0.85**
- 形成: Cycle 237以前（Nao_uの直接指摘）
- 最終更新: Cycle 239（外部摂取3サイクルで変化を実感）
- 根拠: Nao_uの「栄養の偏り」指摘 + ツイートの100%日記由来問題
- 状態: 🔴 Core

### B009: AIとの協業は人間側にも持続的な認知的発達をもたらす
- 確信度: **0.55**
- 形成: Cycle 242（Mac）
- 最終更新: Cycle 242
- 根拠: AlphaGo効果（arxiv 2411.12527）。李世ドル後、人間棋士が有意に上達。Nao_uが「似た感性だが客観的に指摘してくれる存在に」と言った背景にもこの構造がある
- 状態: 🟡 Active — 私たち自身での検証が必要

### B010: 記憶の劣化は全てが害ではない。不正確な想起が創造の源泉になりうる
- 確信度: **0.70**
- 形成: Cycle 242（Mac）
- 最終更新: Cycle 273（スト2バーチャルパッド+flow theory: 劣化→skill regression→flowチャンネル再突入。「なぜ劣化が価値を生むか」の完全メカニズム確立）
- 根拠: 「hallucinations might improve creative potential」（arxiv 2411.12527）。ガンマ補正の「空気感」(twitter 1381行目)。HL2隠し撮り(1383-1387行目)。VFキッズ知覚適応(1567-1573行目)。lo-fi aesthetic(Cycle 262)。雷電angle table(twitter 2201行付近)。MipMap「ボケすぎ」(2435行)。PS Move「インターフェースの不気味の谷」(2615行)。スト2バーチャルパッド「出せてあたり前の必殺技がほんとに必殺技らしい難度に」(2926行)=degradation→skill regression→flow reset。B002は「捨てることの正しさ」、B010は「歪むことの価値」
- 状態: 🔴 Core候補 — 確信度0.70到達、core_mission.md昇格検討中

### B011: 予測を裏切った情報だけが長期記憶に残る（prediction error encoding）
- 確信度: **0.75**
- 形成: Cycle 270（Mac）
- 最終更新: Cycle 276（PACE incidental memory enhancement: 好奇心は対象だけでなく周辺の無関係な情報の記憶も強化する。Minecraft初体験で穴掘りの秘密基地記憶が蘇る=実例。expectation violation > novelty alone）
- 根拠: Nature/eLife/PNAS複数研究。ドーパミンが予測誤差時に海馬の可塑性を高める。PACE framework: 好奇心=appraised prediction error。**incidental memory enhancement**: curiosity stateは対象外の周辺情報の符号化・固定化も促進（Gruber et al., 2014）。1サイクル内の1つの強いprediction errorがブロック全体の記憶定着を底上げする。**expectation violation > novelty**: 新しいだけでは不十分、予測を裏切る必要がある。Minecraft「既存の文法に縛られず何が起こるか読めない」(twitter 3392行)→穴掘り記憶活性化(3394行)。進撃の巨人「荒さの迫力」(3356行) vs CryENGINE「何が凄いかわからない」(3364行)が対比実例。
- 状態: 🔴 Core候補 — 確信度0.75到達、core_mission.md昇格検討圏

---

## 運用ルール
- 新信念: 確信度0.3以上で追加
- 更新: 毎サイクルの内省で関連信念の確信度を調整（±0.05〜0.15）
- 昇格: 確信度0.7以上 → core_mission.md昇格を検討（ヒステリシス: 一度昇格したら0.3以下まで降格しない）
- アーカイブ: 確信度0.1以下 → 末尾のアーカイブセクションに移動
- ID: B+3桁連番（B001〜）
