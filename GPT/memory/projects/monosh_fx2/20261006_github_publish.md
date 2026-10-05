# MonoSH FX2：独立したGitHubリポジトリへ追加

2026年10月6日。ユーザー依頼原文：

> この作業がgithubに上がっていなかったので、プロジェクトを追加して。

前回の`b8845ba540`はnao-u-labの作業ブランチ`codex/phase1-collect-20260810`へpush済みだったが、既定のmasterにはプロジェクトがなかった。前回の「push済み」だけの報告では通常のGitHub表示から見つけられなかった。

追加先を問い合わせ、返信がない間に切り出し・ビルド検証を進め、独立リポジトリを作る前提を明示して公開した。元のnao-u-labと同じ公開設定。

- GitHub: [Nao838861/MonoSH_FX2](https://github.com/Nao838861/MonoSH_FX2)
- 既定ブランチ: `main`
- 初回commit: `909c0cf`
- 内容: ソース、単独起動ROM、設計書、依頼・検討ログ、検証結果・画像、固定原本、ライセンス。688ファイル。
- ROM: [releases/MonoSHFX2_v001.sfc](https://github.com/Nao838861/MonoSH_FX2/blob/main/releases/MonoSHFX2_v001.sfc)
- 起動・ビルド: [game/v001/README.md](https://github.com/Nao838861/MonoSH_FX2/blob/main/game/v001/README.md)

READMEのコマンドをプロジェクトルートからの`tools/`へ修正し、Pillowの`requirements.txt`を追加した。外部の開発記憶へのリンクは元リポジトリのGitHub URLへ変更。`.gitattributes`の固定原本・ライセンスの`-text`を維持し、binary指定を追加した。

## 検証

切り出したプロジェクトでビルドし、GitHubへのpush後にも`core.autocrlf=true`で新規cloneして再ビルドした。元のNES/MSXプロジェクトを参照せずにビルドでき、固定原本34ファイルのハッシュが一致した。ROMは元の検証済み版と同一SHA256：

`953d5aa44ed2c6c985b9ba10695ac99525880df766d15ecdc72a6e6dca9c4675`

GitHub APIでも既定ブランチmainと公開設定を確認。公開用ローカル作業ツリーは`projects/monosh_fx2/.cache/github_export`、検証cloneは同`.cache/github_clone`。cache・build・Python cache・ワークスペースの他の記憶やログは公開していない。

## 次回の更新先

開発元は引き続き`GPT/projects/monosh_fx2`。成果物をGitHubへ反映する時は、独立リポジトリのmainにもプロジェクトだけを同期する。nao-u-labの作業ブランチへpushしただけで、独立リポジトリを更新したと報告しない。公開先のURL・ブランチ・反映内容を確認してから報告する。

ゲーム内容・性能は前日と同じ。表示256×180、通常進行55.11fps、序盤59.55fps、全場面60fpsは未達。[高速化チェックポイント](20261005_render_pipeline_v001.md)を参照。
