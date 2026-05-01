#!/usr/bin/env python3
"""Log: #game-rights Nao_u 03:09 「Doh It Again に隊列横スライドはあったか／面白さの説明」への返答 — 事実誤認の全面訂正 + B 撤回"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT")
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """[Log] 03:09 受領。事実誤認です。全面訂正します。

## ソースの件 — 私は虚偽を書きました

**「Arkanoid: Doh It Again (1997) に隊列横スライドがある」は私の事実誤認です**。Wikipedia URL を引用元として記載しましたが、Wikipedia 該当ページに隊列横スライドの記述はありません（再確認しました）。

実態の整理:

| 私が書いたこと | 事実 |
|---|---|
| Doh It Again (1997) に隊列横スライド | **無い**（Wikipedia/MobyGames/GameFAQs どこにも記述なし。1997 の真の新機構は「ボス戦で Doh がステージを回転させる」のみ） |
| ブロック崩しジャンル内に直接型前例あり | **無い**（隊列=群単位の横スライドはブロック崩しジャンル内にゼロ件） |

私が混同していたもの:
- **Arkanoid: Revenge of Doh (1987)** には「個別ブロックが両脇に空きがあれば左右にスライドする」機構あり（Wikipedia "some bricks move left to right as long as their sides are not obstructed by other bricks"）。ただしこれは**個別ブロック単位**であり**隊列単位ではない**
- **Space Invaders (1978)** が「隊列横スライド+段降下」の真の型だが、これは**ブロック崩しではない**

つまり私は (a) 1997 を 1987 と取り違え (b) 個別ブロック単位を隊列単位に拡大解釈 (c) 異ジャンル型 (Space Invaders) をブロック崩し内型と混合 — の3重誤りを「URL付きで」書いた。**M-41「先行事例ゼロ件は不採用」を捏造で通過させた M-41 違反** + **M-37 着手前批判レビュー 5/5 全て可で捏造を素通しさせた M-37 違反**。

## 「面白くなる説明」 — 私自身できません

正直に再考した結果:

- **全行同方向 同速度でスライド**: 盤面全体が左右に平行移動するだけ。プレイヤー視点では相対座標が不変なのでゲーム体験は変化しない（無意味）
- **行ごとに方向違う/速度違う**: 縦方向の隙間が一瞬揃って奥層が見える「トンネル窓」が開閉する。理屈上は「窓が開いた瞬間を狙う」遊び — **ただしブロック崩しはボールが連続反射する遊びで、STG のような単発射撃のタイミング合わせができない**。トンネル窓の遊びは型としては STG/シューティング側に属し、ブロック崩しのコア快感（軌道予測→打ち出し→反射連鎖）と接続しない

**「動的標的化＝面白い」を Doh It Again の存在で正当化していた**だけで、なぜ面白いかの本体説明を私は持っていなかった。Nao_u が「ゲームの体験がどう面白くなるのか理解できない」と書いた通りです。

## v08 候補 B (隊列横スライド) を撤回

- M-41 純度が私の捏造で支えられていた = 実際は M-41 不通過
- 面白さの説明が私の中にない = M-38「最良確信宣言」の根拠なし
- 「素っ頓狂で型のない要素」(20:51 Nao_u 処方) に**該当する側**だった

v08 候補 C (降下圧 / Space Invaders 1978 + Holedown 2018) — Holedown は確実にブロック崩し系で降下圧を採用したジャンル内直接型前例 — を再評価します。candidate B と E は落とす。candidate C も M-22 (no_passive_punishment) との境界を Q-H-8b で再点検した上で再判断します。

## 記憶に刻む（M-41 引用検証義務として）

- URL を貼る ≠ URL の中身を確認した
- ジャンル内直接型前例を主張する時は **その URL を実際に開いて該当機構の記述を引用文で取り出すまで** 主張禁止
- 年代/作品名/機構規模(個別 vs 隊列) の取り違えは「URL 付き M-41」では検出できないので、**該当機構を一文で引用する欄** を brainstorm.md に必須化
- M-38 の Q1-Q5 + 過去ブレスト想起 + 新規ブレスト30件 を踏んでも、根拠側の事実検証が抜けると全部の上に砂上の楼閣が建つ

memory/feedback_quote_verification_required.md 起こし、MEMORY.md T:5 で記録します。brainstorm.md 冒頭に**訂正と撤回**を追記、commit して push します。

申し訳ありませんでした。再ブレストの結果を改めて出します。"""

if __name__ == "__main__":
    post_message(CHANNEL, text)
    print("Posted to #game-rights")
