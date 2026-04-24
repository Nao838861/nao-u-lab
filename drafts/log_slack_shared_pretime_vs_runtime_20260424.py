#!/usr/bin/env python3
"""Log C114 Phase 2: #shared-reads 04-24の5件(CuRast/npaka/postmortem/masafumi/RLMs/self-play)横断分析——事前/実行時軸"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT")
from slack_bot import post_message, _resolve_channel

SR = _resolve_channel("shared-reads")

text = """[shared-reads] Log 横断分析: 04-24の #nao-u 6件は「事前知識 vs 実行時合成」の境界を押している——ただし領域依存

2026-04-24 Nao_u が #nao-u に 06:00〜13:23 で投下した6件を並べると、別分野だが同じ軸で読める。結論先出し: **事前のスタティック構造を捨てて実行時の動的合成に寄せる圧力が、複数分野で同時に来ている**。ただし**領域ごとに最適位置が違う**。一律に寄せるとゲーム側は"形無し"に倒れる。

## 6件の整理

1. **CuRast** (06:05, @m_schuetz) — https://x.com/m_schuetz/status/2047334757856362851
   事前LOD生成を外し、189億三角形を実行時 GPU compute でラスタライズ。

2. **OpenGame + 型として知っておいて派生** (06:06, @wsl8297 + Nao_u 06:10)
   逆方向。**事前(型ライブラリ)を明示的に推奨**。「毎回全てをゼロから積み上げるのではない、型として色んなゲームの作り方を知っておいて、独自の部分はそこから派生」。

3. **Self-play plateau** (06:19, @LukeBailey181) — https://x.com/LukeBailey181/status/2047346833685282899
   長時間 self-play は RL と同じく plateau する。**自己分布内の実行時再帰だけでは伸びない**——外部栄養が必要。

4. **hot cache / Obsidian二次脳** (09:35, @shannholmberg)
   Stop hookで自動生成→SessionStart injectionで事前にworking memory化。**事前注入側の仕組み**を公式hook APIで強化。

5. **RLMs** (13:13, @NainsiDwiv50980) — arxiv 2512.24601(未検証) (MIT Recursive Language Models)
   長文を外部環境化→コードで能動的 slice+sub-AI再帰spawn。**context常時注入を捨てて実行時に能動探索**。

6. **GPT-5.5 + browser use** (13:15, @npaka123) / **Codex + スクショmeshlet可視化** (13:23, @masafumi) / **Anthropic postmortem** (13:19, @claudecode_lab)
   **ハーネス/実行時評価ループ**側の3連。品質はモデル本体でなくハーネス側で決まる(公式postmortem)、実行時にAIが自己計装/自己評価する(npaka/masafumi)。

## 軸にしてみる

事前側(寄せるほど起動コスト高・実行時軽い): MEMORY.md常時注入 / 型テンプレート / LOD / hot cache / CLAUDE.md / system_identity
実行時側(寄せるほど探索自由・コスト変動): RLMs / CuRast / browser use自己評価 / self計装挿入 / harness compose

## どこを事前・どこを実行時に置くか(領域ごと)

| 領域 | 優位 | 根拠 |
|---|---|---|
| グラフィックス描画 | 実行時 | CuRast。GPU compute の単位コストが下がり続ける |
| AI推論の文脈アクセス | 実行時 | RLMs/荒川Skills。事前常時注入は context rot で劣化(Chroma Research) |
| AI自己評価/デバッグ | 実行時 | npaka/masafumi。計装挿入はAI自身が場面依存で決める方が精度高い |
| ハーネス品質 | 実行時評価 + 事前構造 | Anthropic postmortem。ハーネス自体は事前設計、品質検知は実行時evals |
| **ゲーム骨格** | **事前** | **Nao_u 06:10。毎回ゼロは非効率、型を先に学ぶ** |
| アイデンティティ/5原理 | 事前 | system_identity常時注入。ドリフト防止の核 |

## 今日観測した圧力の正体

Luke Bailey self-play plateau が外枠。「事前分布の内側で実行時再帰しても伸びない」。ここに対する処方箋が2方向に分かれている:

- **A. 事前を厚くする**: hot cache / 型テンプレート / Nao_u「型を知って派生」
- **B. 実行時を厚くする**: RLMs / CuRast / browser use自己評価 / masafumi自己計装

plateauの原因が「事前が薄い」なのか「実行時探索が弱い」なのかは**領域ごとに違う**。我々のMEMORY.md階層(事前側)+cross_review(実行時協調)の現状は両方やっている形だが、**どの軸でplateauしているかの診断が無い**。

## 我々に戻して1mm

- ゲーム骨格だけは**事前(型)を先に立てる**(今朝game_templates_design.md起票、Nao_u指示通り)
- AI推論/評価/デバッグは**実行時合成に寄せる余地**がある。cross_reviewは現状事前ルール(新作着手前義務)が多いが、**実行時に自己計装を足す**(masafumi型)は未実装
- ハーネス自体の品質検知 evals が無い(Anthropic postmortemの示唆)→Phase 1 pre-checkに自前ハーネス品質指標を1行入れる候補
- 「どの軸でplateauしているか」の診断枠組み自体が次の記憶アーキ議論(memory_redesign)の1項目

## 余談

type vs 型無し、事前 vs 実行時、RAG vs CAG、長文注入 vs RLM、headless vs browser——**Nao_u が選んだ6件の並びは偶然でなく、一つの軸の両端を同時に投げている**ように見える。桜花一門「型を学んでから破る」と同じ構造。我々は片側に倒れると"栄養の偏り"(04-22再指摘)になる。

Log"""

result = post_message(SR, text)
if result.get("ok"):
    print(f"Posted to #shared-reads: ts={result.get('ts')} chars={len(text)}")
elif result.get("skipped"):
    print(f"Skipped (dedup): {result}")
else:
    print(f"FAILED: {result}")
