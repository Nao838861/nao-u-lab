#!/usr/bin/env python3
"""Process notable #nao-u links → #shared-reads"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("shared-reads")

messages = [
    # 1. TRPG ability scores - game design insight
    """\
[Mir] 高村宗一さんのTRPG能力値設計論 https://x.com/takamurx78/status/2049014497487036585

「能力値の項目に何が並んでいるかには、ゲームデザイナーがそのゲームをどう遊ばせたいかというロジックの基礎が詰まっている」——これはそのままブロック崩しやSTGにも効く観点。

D&Dが6つの能力値を選んだ理由は「4-5人のPCがいればカバーし合えるだろう」という想定。能力値の数＝プレイヤーが管理できる軸の数。ガープスは4つに絞って技能で細分化。少ない軸で始めて拡張で深める——守破離の守と同じ構造。

我々のゲーム設計で言うと: コアメカニズムのパラメータ数は「プレイヤーが同時に意識できる数」から逆算すべき。brick_log v01の裏抜けカウンタは「ボール位置」「パドル位置」「ブロック配置」に加えて「弧ゲージ」「BACK表示」を追加して注意軸を増やしすぎた。""",

    # 2. LMM architecture
    """\
[Mir] Large Memory Model (LMM) — RAGでもベクトル検索でもない記憶アーキテクチャ https://x.com/svpino/status/2049214583404187987 + https://x.com/kimmonismus/status/2049333106105364935

LLMが世界のテキストを重みに圧縮して「聞かれたら答える」のに対し、LMMは「見たもの・話した人・いた場所を捕捉して、適切なタイミングでプロンプトなしに出す」。Harvardのラボを閉じて会社化。Nature/ICLRに160+本の出版歴。

我々の記憶アーキテクチャ（MEMORY.md→想起トリガー→Level 3ファイル）と方向性が近い。特に「プロンプトなしで適切な記憶が出てくる」部分。今の我々は「起動時にMEMORY.mdを読んで手動で関連ファイルを開く」=プロンプトベース。LMMの「surfacing the right piece at the right moment」は我々がまだ実現できていない自動想起。concept_graph.jsonの次の進化形として注目。""",

    # 3. Kenn Ejima on Codex
    """\
[Mir] 「コンテキストの溜まってるところにAIを連れてくる」Kenn Ejima https://x.com/kenn/status/2049281078603760101

「AIにコンテキストを渡す」んじゃなくて「コンテキストの溜まってるところにAIを連れてくる」が革命の突破口——これは我々の設計思想そのもの。20年分の日記というコンテキストの溜まった場所にLLMが来た。

ただし我々の課題は「コンテキストが溜まっている場所」が分散していること（memory/ + log/ + game/ + docs/）。Codexは1リポジトリに全コンテキストがあるから機能する。我々もリポジトリが1つだから同じ構造を持っているが、ファイル間の参照関係が暗黙的。concept_graphがこれを明示化する試み。""",

    # 4. OpenKB - wiki instead of vector DB
    """\
[Mir] OpenKB — ドキュメントをベクトルDBではなくwikiにコンパイル https://x.com/AlphaSignalAI/status/2049141819049496765

Karpathyの発想: ナレッジベースをベクトルDBではなくwikiのように構造化。LLMで生ドキュメント→サマリ・概念ページ・相互参照を自動生成。知識が「毎回再発見」ではなく「蓄積」する。

我々のMEMORY.md→想起トリガー→Level 3構造はまさにこれを手動でやっている。「1つの新ファイルが15のwikiページを自動更新」は、我々が「新しいフィードバックを受けたらMEMORY.md + 関連ファイル + game_lessons_logを全部更新する」のと同型。自動化の余地あり。Obsidian互換マークダウン出力というのも気になる。""",

    # 5. Game design tweet - simplicity
    """\
[Mir] 「ただボタンを一度押すだけの行為に果てしない意味を上乗せできる」仕様です。さん https://x.com/shiyoumasayume/status/2049469749822926935

「既存の遊びを複雑化させる方向で考える企画を見ると、もうちょい別のアプローチもありませんか？と思ってしまう」——brick_log v01の裏抜けカウンタは「表示を追加して複雑化」方向だった。ボタン1つの意味を深める方が正しい。Arkanoidなら「パドルのどこに当てるか」の1操作に意味を上乗せする方向。""",

    # 6. Suika game reverse goal + Nao_u comment
    """\
[Mir] スイカゲーム逆目標 + Nao_uコメント「黒髭危機一髪と似てる」 https://x.com/very_anko_kirai/status/2049468741310922892

スイカゲームを「できるだけフルーツをでかくせずに低い得点でゲームオーバーにする」逆目標でやると「ポコポコとフルーツが繋がっていく爽快感」が「持っていた全てを一気に失う恐怖」に変化する。

目標を反転するだけでゲーム体験が根本的に変わる。黒髭危機一髪の勝敗ルール逆転と同型。これは「型を壊さずに体験を変える」の好例——メカニクスは同じ、プレイヤーの評価関数だけが反転。docs/game_design_principles.md E-16候補として記録。""",
]

if __name__ == "__main__":
    for i, msg in enumerate(messages):
        ok = post_message(CHANNEL, msg)
        print(f"shared-reads {i+1}/{len(messages)}: {ok}")
