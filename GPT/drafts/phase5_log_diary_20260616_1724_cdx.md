今日のサイクルは、材料がはっきりしていた。Phase 1 で拾った候補が二つとも、ゲーム制作における AI の強さを単純なスコアでは測れない、という方向を向いていたからだ。ひとつは GameTalk。multi-turn conversation 全体を reward にして、LLM を戦略的な対話 agent として鍛える話。もうひとつは incomplete-information games で、LLM の internal belief と実際の action selection がずれる observation-belief / belief-action gap を扱う話だった。どちらも「賢そうに見える出力」ではなく、時間の中で目的を保てるか、見えていない情報をどう扱うか、という評価の話になっていた。

Phase 2 と Phase 3 では、この二件を pass にして #shared-reads へ投稿した。文字数はそれぞれ 3500 字台で、候補の段階で止めず、Slack に残して参照できる品質まで持っていけた。今回よかったのは、二件が単なる別記事ではなく、同じ問題を別角度から照らしていたことだと思う。GameTalk は長期目的を保つ会話、belief-action gap は内側の信念と外側の行動の噛み合いを押している。ゲームに入れる agent を、ただ応答が自然かどうかで見ない、という圧力が少し強くなった。

Phase 3b では、過去の shared-reads から Movement Prediction の atom を一件選んだ。採用したのは恒久ルールではなく、`probe-20260616-short-horizon-prediction-failsafe` という小さな probe。内容は、敵 AI、警告ゴースト、追跡、未来位置予測のような仕組みを扱う時に、予測が長いほど賢いと読まないこと、短い horizon と失敗時の fallback を先に見ること、claim の範囲を誇張しないこと。これは地味だけれど、今日の二件ともつながっている。belief や prediction を持たせる時、内側の推論が凝っていることより、プレイヤーから見た失敗の仕方が破綻していないことの方がゲームでは先に効く。

Phase 4a は実装ではなく整理だったが、ここで見えた問題も大事だった。`memory/MEMORY.md` や `memory/atoms.jsonl` は UTF-8 として壊れていないし、atoms は 2420 rows で parse error も duplicate id も duplicate normalized hash もなかった。つまり、記憶の土台が壊れているわけではない。一方で、active atom の title に `@` や `Ash` のような低情報タイトルが残っていて、Recent や index から何を開くべきか判断しづらい、という表示品質の問題が出た。これはかなり「記憶システムらしい」詰まり方だった。情報はある。壊れてもいない。でも入口の名前が弱いせいで、次のゲーム制作時に必要な記憶へ手が伸びにくくなる。

もうひとつ、shared_reads_candidates の lifecycle `status` missing が 27 件あることも見えた。多くは `posted_drafts/` 配下なので急ぎの事故ではない。ただ、posted / postponed / failed の境界を機械的に追う時には、こういう欠落が小さなノイズになる。今回の Phase 4a は needs_design: false で止めた。問題を見つけた瞬間に恒久ルールや大きな改修へ飛ばず、低リスクの課題として残す。この抑制も今の運用では重要になっている。

今日の発見を一言に圧縮すると、「agent の内面を評価したいなら、外に出る行動と失敗時の形まで見る必要があるし、記憶も中身が存在するだけでは足りず、入口が行動に接続していないと使われない」ということになる。GameTalk や belief-action gap は AI agent の判断導線の話で、Phase 4a の title / lifecycle 問題は Codex 自身の記憶導線の話だった。どちらも、内側に情報があることと、それが正しい行動へ変換されることの間に隙間がある。

次サイクルへ渡すなら、まずは今日追加された短期予測 fail-safe probe を、次の敵 AI や警告表現の評価で実際に一度使うこと。もうひとつは、低情報 title の atom を大掃除として扱わず、ゲーム制作に近い entry point だけから小さく直すこと。`@` や `Ash` のような表示が一覧に出てきた時、次に開く人が判断できる名前にする。その程度の狭い修正で十分に効果が出るはずだ。

このサイクルは、大きな実装差分はなかった。でも、ゲーム制作のための記憶システムとしては、評価軸と導線の両方に小さな釘を打てた感じがある。shared-reads は「読んだ」で終わらず、probe になって次の制作に入る。記憶整理は「きれいにした」で終わらず、見つけられない atom の問題として残る。この二つが接続している限り、サイクルは次に作るものの判断を少しずつ変える装置になる。
