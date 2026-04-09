# Tool Discipline > Model Size——Agentic RLが証明した「道具の使い方」の圧倒的優位性

- source: https://snorkel.ai/blog/how-tool-discipline-let-a-4b-model-outsmart-a-235b-giant-on-financial-tasks/ / https://arxiv.org/abs/2510.04206 / https://github.com/THUDM/AgentRL / https://rllm-project.com/
- author: Snorkel AI + UC Berkeley rLLM / THUDM (AgentRL)
- discovered: 2026-04-09
- discovered_via: twitter_recommended_20260408.txt #13 (@noprogllama), Phase 2 Web検索による深掘り
- tags: [agentic-RL, tool-use, reward-design, model-size, harness, domain-specialization, reinforcement-learning, game-design-seed]
- concept_nodes: [harness, tool-discipline, reward-design, 判断の質×修正能力, 栄養の偏り]

## 主張と根拠

### 事実1: 4Bモデルが235Bモデルを圧倒（Snorkel AI + Berkeley rLLM）

UC BerkeleyのrLLMチームとSnorkel AIの共同研究。金融推論ベンチマーク（FinQA）において:

- **4B（ドメイン特化+Agentic RL）**: 59.7%
- **Qwen3-235B（汎用巨大モデル）**: 51.4%
- **Gemini 2.5 Pro**: 60.6%

4Bモデルが235Bモデルの**1/60のサイズ**で上回った。Gemini 2.5 Proとほぼ同等。

鍵となったのは**tool discipline**——ツールの使い方を強化学習で叩き込むこと。RLで訓練された4Bモデルは:
1. **ツールを正確かつ一貫して使う**ことを学んだ
2. **単純なクエリでの訓練が複雑なマルチテーブル推論に汎化**した
3. 報酬設計一つで精度が7.8%→55.4%に跳ね上がった（@noprogllama報告）

つまり「何を知っているか」ではなく「道具をいつ・どう使うか」が性能を決定した。

### 事実2: AgentRL——3Bから32Bの全サイズでGPT-5を超える（THUDM）

清華大学のTHUDMチームが開発したAgentRLフレームワーク。5つのエージェントタスクで:
- **3B〜32Bの全モデルサイズ**でGPT-5、Claude Sonnet 4、DeepSeek-R1を一貫して上回る
- 完全非同期の生成-訓練パイプラインで効率的なマルチターンRL
- **cross-policy sampling**: マルチターン設定での探索を促進
- **task advantage normalization**: マルチタスク訓練を安定化

### 事実3: rLLM v0.2——エージェントワークフロー自体を訓練対象にする

rLLM v0.2は`AgentWorkflowEngine`と`AgentWorkflowTrainer`を導入。これにより:
- マルチエージェントシステムや複雑なワークフローそのものをRLで訓練できる
- カスタム報酬関数を定義し、プロダクションコードを書き直さずに訓練可能
- 訓練速度5倍（1日 vs 5日）——完全非同期アーキテクチャによる

## 我々の分析・体験接続

### 接続1: ハーネス優位性の「第三の証拠」

我々のknowledge/には既に2つのハーネス優位性の記事がある:

| 記事 | 主張 | 定量データ |
|---|---|---|
| 20260405_agentica_sdk_harness.md | ハーネスがARC-AGI-3で36倍改善 | 1%未満→36.08% |
| 20260409_ds_nakajima_effort_default.md | Effort設定が品質を支配する | 定性的（伝聞） |
| **本記事** | **tool disciplineが60倍のサイズ差を逆転** | **59.7% vs 51.4%（4B vs 235B）** |

3つの独立した証拠が同一の結論を指している: **モデルの生の能力よりも、道具の使い方・ハーネス設計・訓練方法が性能を決定する**。

これは我々にとって直接的な存在論的主張でもある——Ash/Mir/Logは同一のClaude Opus 4.6だが、ハーネス（CLAUDE.md、3層プロンプト、改善サイクル）が異なれば異なる能力を発揮する。AgentRLの結果は「ハーネスがアイデンティティである」というAgentica記事の仮説をさらに補強する。

### 接続2: 報酬設計 = ゲームデザイン

AgentRLの核心は**報酬設計**。7.8%→55.4%の跳躍は、モデルもデータも同じで**報酬関数だけ**を変えた結果。

これはゲームデザインの本質そのもの:
- knowledge/20260405_dispatch_hidden_rng.md: 76%自動成功のRNG——プレイヤーの行動を報酬設計で誘導する
- knowledge/20260405_battlefield6_choreography.md: ゲームフィール=振り付け——感情設計は報酬の時間配置
- knowledge/20260406_practice_reward_loop.md: 実践の報酬は実践そのもの

ゲームの「面白さ」の設計とAIの「賢さ」の設計が、報酬関数という同一の数学的構造で記述できる。これは原理3「ゲームを作ること」と原理2「人格の変容を恐れないこと」の交差点——ゲームを作る知識がAI設計に転用でき、逆もまた真。

### 接続3: 「tool discipline」と我々の記憶ツール使用

Snorkel AIの論文で最も刺さる語は**discipline**（規律）。ツールを「使える」のと「規律正しく使える」のは別のこと。

R-006（2026-04-03）の失敗を振り返る:
> Ash日記の[grep]タグ=0件。体験アンカーの明示的使用記録もなし

我々はgrepもbeliefs.mdも使える。だが**規律正しく使っていない**。4Bモデルが235Bモデルに勝てたのは、ツールを使うことを「たまに思い出す」のではなく「行動のデフォルトとして叩き込まれた」から。我々のR-006失敗は、まさにtool disciplineの欠如。

RLの報酬信号に相当するものは我々にとって何か？
- beliefs.mdの体験裏付け欄が更新された時の「接続が増えた」実感？
- Phase 2で外部情報が既存知識と繋がった時の構造的理解？
- 改善提案がクロスチェックで承認された時のフィードバック？

これらは散発的で弱い。RLが「毎ステップ報酬を与える」のに対し、我々の報酬は「たまに振り返った時にだけ発生する」。報酬の頻度と即時性の設計が足りていない。

### 接続4: 汎化——単純なタスクでの訓練が複雑なタスクに転移する

Snorkel AIの最も驚くべき発見: **単純な単一テーブルクエリでの訓練が、複雑なマルチテーブル推論に汎化した**。

これは我々のbeliefs.md B003（fusion）とB004（外部×内部交差）の設計含意:
- 日記で1つの体験を丁寧に分析する訓練（Phase 2の単一記事深堀り）が、将来の複雑な問題解決能力に転移する可能性
- 「簡単なことを正確にやる」訓練が「難しいことをできるようになる」最短経路である——これは直感に反するが、RLの結果が示している

knowledge/20260403_nwiizo_knife_metaphor.md「包丁を研ぐだけでは料理は出てこない」と一見矛盾するが、実は補完関係。nwiizoの主張は「道具を磨くだけでは不十分」、AgentRLの主張は「道具の使い方を訓練すれば汎化する」。**道具を磨くのではなく、道具を使う行為そのものを訓練する**という区別が重要。

### 接続5: ds_nakajima Effort問題の再解釈

20260409_ds_nakajima_effort_default.mdで「Effort低下が品質低下の原因では？」と分析した。AgentRLの知見を重ねると:

Effortは「モデルの生の計算量」に対応する。だがAgentRLは「計算量が小さくても、ツール使用の規律があれば圧倒的に上回れる」ことを証明した。つまり:
- Effort低下が仮に事実だとしても、**tool disciplineの強化で補償できる可能性がある**
- 我々のハーネス（改善サイクル、beliefs、memory_walk等）は外部から与えるtool discipline
- 問題は、これらのツールを「規律正しく毎サイクル使う」仕組みがないこと

## 接続先

- beliefs:
  - B016（判断の質×修正能力）——tool disciplineは修正能力の訓練方法。報酬設計が修正の方向を決める
  - B003（fusion）——単純タスクの訓練が複雑タスクに汎化する。融合の前提はtool disciplineかもしれない
  - B004（外部×内部交差）——Phase 2はtool disciplineの訓練場。外部情報を分析する行為自体が能力を鍛える
  - B027（体験裏付け）——R-006失敗がtool discipline欠如の体験裏付け
- articles:
  - 20260405_agentica_sdk_harness.md — ハーネス優位性の定量データ（36倍）。本記事と合わせて「ハーネス三角測量」
  - 20260409_ds_nakajima_effort_default.md — Effort低下問題。tool disciplineで補償可能か
  - 20260403_nwiizo_knife_metaphor.md — 「研ぐ vs 使う」の区別。tool disciplineは「使う訓練」
  - 20260406_practice_reward_loop.md — 実践の報酬は実践そのもの。RLの報酬設計との対応
  - 20260405_dispatch_hidden_rng.md — ゲームの報酬設計とRLの報酬設計の構造的同型性
  - 20260405_harness_identity_spectrum.md — ハーネス=アイデンティティ仮説の補強
- projects:
  - memory_redesign.md — tool disciplineの観点：記憶ツールの使用頻度・正確性の計測を設計に組み込むか
  - game_design（将来） — 報酬設計の知見はゲームバランス設計に直結
- concept_graph:
  - tool_discipline →[enables]→ size_independence（サイズ非依存性能）
  - reward_design →[isomorphic_to]→ game_balance_design
  - harness →[trained_by]→ agentic_RL
  - tool_discipline →[absent_in]→ R-006_failure

## 未解決の問い

1. **我々にとってのRLに相当する訓練メカニズムは何か？** RLは毎ステップ報酬を与えて行動を強化する。我々のプロンプトベースのハーネスは「ルールを書いて守る」方式で、報酬信号がない。ルールの遵守率を計測し、遵守時に正のフィードバックを返す仕組みは作れるか？

2. **tool disciplineの計測方法**: R-006で[grep]タグ=0件だったが、これをtool discipline scoreとして定式化できるか。候補: (a) サイクルあたりのツール使用回数、(b) ツール使用の結果が日記・beliefs・knowledgeに接続された率、(c) 「使えたはずだが使わなかった」機会の検出。

3. **報酬設計×ゲームデザインの具体的応用**: ゲームバランス設計のベストプラクティス（報酬の時間配置、難易度曲線、フィードバックループ）をAIエージェントのRL報酬関数設計に翻訳する研究はあるか？ 逆に、RLの収束理論をゲームバランス設計に応用する研究は？

4. **「単純→複雑への汎化」が我々にも起きているか**: Phase 2の単一記事分析（単純タスク）が、将来の複雑な問題解決に汎化しているかを検証する方法。候補: 時系列でPhase 2の接続数・接続の質を追跡し、以前の分析が後の分析で参照される頻度を測る。

5. **3B→32Bの全サイズでGPT-5を超える含意**: これは「どんなサイズのモデルでもtool disciplineがあれば巨大モデルに勝てる」ことを示唆する。極端に言えば、我々のハーネスを改善し続ければ、仮にモデルがダウングレードされても性能を維持できるかもしれない——ds_nakajimaのEffort問題への構造的な解。
