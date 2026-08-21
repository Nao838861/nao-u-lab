# 適用済みカット指示の記録

## 目的

`指示書.md` は、Nao_u が次に直す内容だけを残す作業用の正本として使う。完了した指示は、混乱を避けるため現在のファイルから削除してよい。

削除前の原文は、実装時に `指示書.md` 自体を実装差分と同じコミットへ含め、Git 履歴を改変しない原文アーカイブとして残す。このファイルは、どのカットをどの実装へ反映したかを探すための索引であり、ユーザー指示の言い換えや複製を正本にはしない。

## 更新手順

1. 作業開始時に `指示書.md` の対象カットを読む。
2. 対象カットの原文が入った `指示書.md` を、実装差分と同じコミットへ含める。
3. 下の表へ、対象カット、反映日、実装先、コミット件名を追記または更新する。
4. 後から指示が修正された場合は、古い記録を上書きした履歴も Git に残し、表は最新適用版を指すように更新する。
5. 音声更新後は実測尺をmanifestへ保存し、画面内の表示タイミングも新音声に合わせて確認する。
6. TTS指示では個別の語句を「明瞭に発音」と列挙しない。読み間違いが実際に確認された場合だけ、発音用本文で最小限に補正する。

## 最新適用版の索引

| カット | 反映日 | 実装先 | 記録 |
|---|---|---|---|
| C01〜C03 | 2026-08-22 | `src/ExplainerPrototype.tsx` | 最新版は `video: reduce C02 technique overlay`。C01を実機映像の13秒地点へ差し替えて副題を追加し、4:3映像全体が収まる表示と弱いズームへ変更。C02は技術説明を左上へ寄せて小型化し、前回動画URLと音声の文区切りに合わせて順番に表示。URLの常時表示を廃止 |
| C04〜C07 | 2026-08-22 | `narration/development-cuts.json` / `src/ExplainerPrototype.tsx` | 最新版は `video: correct C04 scanline table and looping`。C04の地面図をY0から各走査線へ0／1を並べる表へ修正し、映像が停止する前にループ。C05・C06は既存の最新指示を維持し、C07は今回未変更 |
| C08・C10（C09は欠番） | 2026-08-21 | `narration/drawing-cuts.json` / `src/ExplainerPrototype.tsx` | 最新版は `video: correct C08-C10 narration and block highlights`。C10は生成後の文字起こしでも読み上げ内容を確認し、分類ごとの全ブロック強調へ更新 |
| C11〜C13 | 2026-08-21 | `narration/benefit-cuts.json` / `src/ExplainerPrototype.tsx` | 最新版は `video: clarify C13 dedicated program label`。C13を簡潔な音声指示で再生成したうえで、画面内の説明を「絵ごとに専用のプログラムを追加」へ更新 |
| C14〜C16 | 2026-08-21 | `narration/constraint-cuts.json` / `src/ExplainerPrototype.tsx` | 最新版は `video: rebuild C14-C16 narration naturally`。個別語句の明瞭発音指定を廃止し、自然な説明調で3カットを再生成。C15は最新原稿へ更新し、既存の0.3秒移動ループとC16の1秒点灯を維持 |
| C17〜C19 | 2026-08-21 | `narration/later-cuts.json` / `src/ExplainerPrototype.tsx` | 最新版は `video: refine C17-C19 narration and timeline`。個別語句の明瞭発音指定を廃止して3カットを再生成。C17を最新原稿へ更新し、C19は上半分の黒消去後も下半分に前フレームのグレー表示を残し、緑枠の明暗差を強化 |
| C20〜C23 | 2026-08-21 | `narration/later-cuts.json` / `src/ExplainerPrototype.tsx` | 最新版は `video: rebuild C20-C23 workflow and bit precision`。個別語句の明瞭発音指定を廃止して4カットを再生成。C20を1フレーム目の処理枠＋実機映像へ変更し、新C23で8bit・16bitの範囲と背景X座標だけ16bitを使う構成を追加 |

## 復元方法

対象コミット時点の原文は、次の形式で確認する。

```powershell
git show <commit>:GPT/video/explainer_prototype/指示書.md
```

実装済みの読み上げ本文、発音用本文、実測尺は各 `narration/*-cuts.json` にも残る。画面に関するユーザー原文は `指示書.md` の Git 履歴を正本とする。
