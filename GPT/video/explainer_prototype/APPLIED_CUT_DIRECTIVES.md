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

## 最新適用版の索引

| カット | 反映日 | 実装先 | 記録 |
|---|---|---|---|
| C04〜C07 | 2026-08-20 | `narration/development-cuts.json` / `src/ExplainerPrototype.tsx` | `video: rebuild C04-C07 development sequence`。原文は本索引を追加した時点の `指示書.md` にも保存 |
| C08・C10（C09は欠番） | 2026-08-21 | `narration/drawing-cuts.json` / `src/ExplainerPrototype.tsx` | 最新版は `video: correct C08-C10 narration and block highlights`。C10は生成後の文字起こしでも読み上げ内容を確認し、分類ごとの全ブロック強調へ更新 |
| C11〜C13 | 2026-08-21 | `narration/benefit-cuts.json` / `src/ExplainerPrototype.tsx` | 最新版は `video: clarify C13 dedicated program label`。C13を簡潔な音声指示で再生成したうえで、画面内の説明を「絵ごとに専用のプログラムを追加」へ更新 |
| C14〜C16 | 2026-08-21 | `narration/constraint-cuts.json` / `src/ExplainerPrototype.tsx` | 最新版は `video: apply revised C14-C16 motion timing`。8種類のずらしパターンを0.3秒間隔の指定順で往復させ、C16の16枚の点灯を1秒で完了するよう更新 |
| C17〜C19 | 2026-08-21 | `narration/later-cuts.json` / `src/ExplainerPrototype.tsx` | 最新版は `video: apply latest C17-C19 instructions`。C17を全編ボス戦映像へ変更し、C19の2フレーム枠・各処理・ゲーム画面をナレーションに同期して段階表示 |
| C20〜C23 | 2026-08-21 | `narration/later-cuts.json` / `src/ExplainerPrototype.tsx` | 最新版は `video: apply latest C20-C23 instructions`。固定TTSスナップショットと自然な内部ポーズ保持を適用し、C21の「しかし」とC22の冒頭・最終文を含む全文を再生成・検証 |

## 復元方法

対象コミット時点の原文は、次の形式で確認する。

```powershell
git show <commit>:GPT/video/explainer_prototype/指示書.md
```

実装済みの読み上げ本文、発音用本文、実測尺は各 `narration/*-cuts.json` にも残る。画面に関するユーザー原文は `指示書.md` の Git 履歴を正本とする。
