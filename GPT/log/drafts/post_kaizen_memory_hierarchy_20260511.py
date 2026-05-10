#!/usr/bin/env python3
"""Post multipart Codex memory hierarchy update report to #kaizen-log."""
from __future__ import annotations

import sys
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools"))

from slack_client import post_message  # noqa: E402


PARTS = [
    """[Codex kaizen] 記憶階層整理レポート 1/4: 今回やったことの全体像

今回、Codex/GPT 側の記憶階層を「ゲーム開発時に実際に使える教師情報」として整理し直しました。

目的は、Claude 側にある過去プロジェクトや Slack ログを参照するだけで終わらせず、今後 Codex がゲームを作る時に、必要な知見が GPT フォルダ内の記憶として自然に想起される状態にすることです。

今回追加で詳しく分析した参照元:

- `D:\\AI\\Nao_u_BOT\\Claude\\game\\study_platformer_01`
- `D:\\AI\\Nao_u_BOT\\Claude\\game\\shot_log\\v01`

Claude 側は読み取り専用の参照元として扱い、Codex が今後使う分析・原則・教師情報・atom は GPT 側に保存しました。

GPT 側に追加/更新した主なファイル:

- `memory/teacher_study_platformer_01_analysis.md`
- `memory/teacher_shot_log_v01_analysis.md`
- `memory/game_teacher_sources.md`
- `tools/auto_recall_gate.py`
- `memory/README.md`
- `memory/atoms.jsonl`

追加した atom:

- `local-20260511-teacher-study-platformer-01`
- `local-20260511-teacher-shot-log-v01`

確認結果:

- `memory_health: ok`
- atoms: 722
- `study_platformer_01 プラットフォーマー 着地点 AI headless` で study_platformer の教師 atom が top hit
- `shot_log v01 BACKLASH シューティング 快感 ゲージ 反撃弾` で shot_log の教師 atom が top hit
- auto recall gate でも、プラットフォーマー/シューティング系の依頼から自然に引けることを確認

この整理で重要なのは、単に「分析メモを増やした」ことではなく、次にゲーム制作依頼が来た時に、過去の成功/失敗/フィードバックが作業前の `session_context.md` に乗る経路を作ったことです。""",
    """[Codex kaizen] 記憶階層整理レポート 2/4: study_platformer_01 から教師化した内容

`study_platformer_01` は、横スクロールアクションの実装例というより、AI がプレイできるゲームをどう作るか、AI の失敗をどう直すか、headless 検証をどう残すかの教材として整理しました。

抽出した中核:

1. ゲームコアを描画から分離する
- `core.py` は Pygame に依存しない。
- `Input(left, right, a, b)` で操作を抽象化。
- `MarioGame.step(input)->state` の形で、1フレームずつ進める。
- `get_state()` に `dead`、`cleared`、`on_ground`、速度、敵、スクロール位置などを出す。

教師情報:
- 新しいゲームを AI/自動検証可能にするなら、最初に純粋な `step(input)->state` を作る。
- 物理や判定は renderer ではなく core に閉じる。
- state は「人間が見たいもの」だけでなく、AI と検証が必要とする情報を明示する。

2. プラットフォーマー AI は反射ではなく計画
- 穴前で一回だけ安全判定してジャンプする reflex は壊れやすい。
- 短期的にクリア率が上がっても、長い面では破綻しやすい。
- 正しい方向は、まず着地点/到達先/経路を決め、その後でジャンプやダッシュを選ぶこと。

教師情報:
- 失敗箇所を「認識」「目標選択」「経路計画」「操作実行」「物理予測」に分ける。
- AI が失敗した時、即座に「ここだけ例外」を積まない。
- 本当に必要な reflex は、計画不能時の緊急復帰だけに限定する。

3. 予測と実行を一致させる
- 検索では walk jump を選んだのに、実行時は dash して失敗する問題があった。
- 予測に使った walk/dash、押し時間、速度を実行側に渡す必要がある。

教師情報:
- 「予測線では届くが実際には届かない」は、操作モード不一致を疑う。
- 予測に使った入力を、そのまま実行パラメータとして持つ。

4. headless ログとデバッグ表示
- 成功ログ `clear_speedrun.json` は 1652 フレームでクリア。
- 失敗ログにも、足場範囲や `advance` 目標のマーカーが残っていた。

教師情報:
- headless ログは成功/失敗の数値だけで終わらせず、フレーム列、入力列、判断マーカーを残す。
- デバッグ UI は「結果」ではなく、AI が何を考えているかを見せる。
- 候補足場、選択ターゲット、予測軌道、危険判定を色分けする。""",
    """[Codex kaizen] 記憶階層整理レポート 3/4: shot_log v01 / BACKLASH から教師化した内容

`shot_log\\v01` は、縦シューティングの完成プロトタイプとして、特に「快感要素ファースト」「近距離理不尽の救済」「完成判定」の教材として整理しました。

抽出した中核:

1. 快感要素を先に固定する
- 核は「弾で狙って撃つ快感」と「ゲージで弾が増えて当たりやすくなる快感」。
- 敵を倒す -> アイテムが出る -> ゲージが上がる -> 1way/2way/3way/MAX と強くなる -> より敵を倒しやすくなる、という循環がある。

教師情報:
- シューティングを作る時は、敵や罰より先に「撃って気持ちいい瞬間」を決める。
- 強化は、プレイヤーがすでに楽しい行為をもっと楽しくする方向に置く。
- ゲージは行動の報酬として上げる。時間減衰や罰は、確信がない限り急いで入れない。

2. BACKLASH / 反撃弾の扱い
- 敵を倒すと revenge bullet が出る。
- 「倒すほど危険も増える」はリスク報酬として面白いが、近距離で倒した時に理不尽死になりやすい。
- Nao_u フィードバックでは、子どもプレイで近距離反撃に死ぬ問題が指摘されていた。

実装上の対応:
- small は近距離でプレイヤー方向の安全コーンから弾を逃がす。
- medium は近距離で狙い弾を横向きに変える。
- large/boss は遠距離脅威として mercy を弱くする。
- mercy 発動時はシアンのリング/ハローで見える。

教師情報:
- 「倒した結果として危険が出る」ルールは、快感を邪魔しやすいので近距離救済を必ず検査する。
- 救済は内部処理だけでなく、画面上のフィードバックで説明する。
- 小さい敵ほど理不尽死を避け、大型敵ほど危険として成立させると直感に合いやすい。

3. UI/表示の品質
- 反撃弾が敵弾と同色で見づらい問題があった。
- `Saving...` の中央揃えテキストが文字数で揺れる問題があった。

教師情報:
- 危険・報酬・演出は色や寿命で役割を分ける。
- UI テキストの揺れは小さくても品質を落とす。
- アニメーションする文字列は最大幅基準で固定する。

4. 完成判定
- v01 は「よいゲームデザインが人間のフィードバックに耐えたら、一度完成扱いにする」教材。
- 改良点が残っていても、核となる快感が成立したなら、その版を閉じる判断が必要。

教師情報:
- 成立した v01 は永久にいじらない。
- 次の学びは、同じゲームを膨らませるより、別プロトタイプで試す。""",
    """[Codex kaizen] 記憶階層整理レポート 4/4: 今後の使い方と運用方針

今回の整理後、ゲーム開発時の記憶利用は次の流れになります。

1. 作業開始時に auto recall gate を通す

例:

`python tools\\auto_recall_gate.py \"新しいシューティングゲームを作る 操作感 快感 ゲージ\" --print`

この場合、`session_context.md` に `local-20260511-teacher-shot-log-v01` が入り、shot_log/BACKLASH の快感要素ファースト、ゲージ強化、近距離救済、完成判定が作業前コンテキストに載ります。

例:

`python tools\\auto_recall_gate.py \"プラットフォーマーを作る ジャンプ 足場 着地点 AI headless\" --print`

この場合、`local-20260511-teacher-study-platformer-01` が入り、着地点計画、予測と実行の一致、headless ログ、デバッグオーバーレイが作業前コンテキストに載ります。

2. 教師情報の索引を見る

追加した索引:

`memory/game_teacher_sources.md`

ここには、今後ゲーム開発時に参照する教師情報ソースを整理しています。

- study_platformer_01: プラットフォーマー、AI、着地点、headless、予測と実行。
- shot_log v01 / BACKLASH: シューティング、快感要素、ゲージ、反撃弾、近距離救済、完成判定。

3. design_log に使った教師情報を残す

今後のゲーム制作では、単に「過去に似たものがあった」ではなく、どの教師情報をどう使ったかを design_log に残すのが望ましいです。

例:

- `local-20260511-teacher-shot-log-v01` を参照し、罰より先に快感要素を作る。
- `local-20260511-teacher-study-platformer-01` を参照し、AI/検証用に `step(input)->state` を分離する。
- `game-rights` の `nao-u-feedback` atom を参照し、操作感、予測可能性、UI 視認性、目標の明確さをチェックする。

4. 原文と運用範囲

Codex が今後想起・利用する分析と atom は GPT 側に置きました。

- 分析: `memory/teacher_*.md`
- 索引: `memory/game_teacher_sources.md`
- atom: `memory/atoms.jsonl`
- 自動想起: `tools/auto_recall_gate.py`
- 作業前コンテキスト: `memory/session_context.md`

Claude 側プロジェクトは参照元であり、Codex の通常運用では GPT 側の分析と atom を経由して使います。

5. 今回の検証結果

実行済み:

- `python tools\\memory_health.py`
- `python tools\\memory_recall.py \"study_platformer_01 プラットフォーマー 着地点 AI headless\" --limit 5 --compact`
- `python tools\\memory_recall.py \"shot_log v01 BACKLASH シューティング 快感 ゲージ 反撃弾\" --limit 5 --compact`
- `python tools\\auto_recall_gate.py \"新しいシューティングゲームを作る 操作感 快感 ゲージ\" --print`
- `python tools\\auto_recall_gate.py \"プラットフォーマーを作る ジャンプ 足場 着地点 AI headless\" --print`

結果:

- `memory_health: ok`
- atoms: 722
- 追加した2つの教師 atom が、それぞれ該当クエリで top hit
- auto recall でも、ゲーム種別に応じて自然に作業前コンテキストへ入ることを確認

今後の方針:

- ゲーム制作時は、実装前に auto recall gate を通す。
- `game-rights` の Nao_u フィードバックは教師信号として扱う。
- ユーザーの新しいフィードバックは、既存教師情報を上書きせず、差分として追加する。
- 成功事例だけでなく、失敗ログ、違和感、理不尽さ、UI 視認性の指摘も教師情報にする。
- headless は「動いていることが確認できる完成ゲーム」で強く使う。未完成ゲームの壊れた headless 評価を過信しない。""",
]


def main() -> int:
    ok = True
    for part in PARTS:
        result = post_message("kaizen-log", part)
        print(result)
        ok = ok and bool(result.get("ok"))
        time.sleep(0.5)
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
