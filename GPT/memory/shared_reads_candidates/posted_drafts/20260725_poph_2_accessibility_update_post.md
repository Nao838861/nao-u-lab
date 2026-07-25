■ 概要
対象は、Knickknack PJ が5年前に完成させた Ren'Py 製 visual novel『Pillars on Poppy Hills』を2.0へ更新した postmortem。初版は Ren'Py 6.99 系で、その後作者が Ren'Py 8 系で育てた GUI framework、text-to-speech、画像 caption / alt text、個別 sound の mute、timed choice の無効化を利用できなかった。ただし現在の技量で絵・文章・演出を全面的に作り直す remake は目的にしない。当時の創作判断を保存し、scope の際限ない拡大を防ぐため、更新対象を実行基盤、navigation、accessibility、明白な typo と説明上必要な文の流れに限定した。

移植は旧ファイルと画像を新 framework へ載せ、1280×720 から1920×1080へ変更するところから始まる。大きめに制作していた画像は比率を計算して再 export すればほぼ所定位置に収まり、予想していた sprite 再配置は主障害にならなかった。実際の難所は、Ren'Py 6 が NVL / ADV textbox の表示・非表示時に暗黙に行っていた transition が Ren'Py 7 以降の既定動作にはないことだった。作者は transition を再実装し、初版と新版を横に並べ、box が一瞬 flash せず意図した timing で消えて戻るかを全編で照合した。これは、asset の座標のように目立つ差分より、旧 engine が暗黙に保証していた時間的挙動の方が移植事故になりやすい例である。

accessibility 更新では、背景で起きる表情変化や登場人物が気づいていない出来事にも説明を加え、caption と alt text を物語の文体へ溶かした。その結果、抽象的な神の外見は絵なら一目で伝わるのに文章では長くなり、一人称視点では本人が自分の外見を説明する不自然さも出た。複数の台詞を同一画面に出す演出は TTS が最後の一行しか読まず、save/load 画面の「保存時の直近台詞」hook にも最後の行だけが残る。非表示の alt text は通常 textbox に見えなくても hook へ混入し、「…」だけの台詞は読み上げる内容がなく speaker label だけになる。作者は一方を mute して他方を読み上げ時にも意味が通る文へ整え、ellipsis には「何も言わない」に相当する説明を付け、発音がおかしい語は typo、未知の発音、TTS 辞書の問題を切り分けた。

音響では効果音ごとの mute UI を再構成した。beta test で、同じ風音を SFX と Ambience に二重定義すると sound-disabler の分類と衝突すると分かり、一項目にまとめて再生時の channel 指定を残した。制限時間付き選択肢には timer 切替を導入し、背景へ溶ける第三の選択肢も clickable button として保った。追加 side story は各 ending 約2000語に固定して別 scope にした。結論は、保存する創作と更新する可用性を分離し、accessibility 経路で全編を通すことが完成可能性と品質を同時に上げる、というものになる。

■ 内容分析
この記事の強さは、accessibility を設定画面の checklist ではなく、物語表示、時間演出、音響、save/load metadata を横断する別の実行経路として扱っている点にある。TTS を全編有効にする作業は、説明の欠落を探すだけでなく、長年残った typo、文の不自然さ、誤発音、GUI の破綻まで見つける回帰走査になった。とくに hidden alt text が save hook へ漏れる事例は、「画面に見えない情報なら既存機能へ影響しない」という仮定を崩す。accessibility metadata も通常の台詞履歴と同じ data path を通る以上、表示・履歴・保存・復元の各 consumer を個別に検査する必要がある。

もう一つ重要なのは、忠実な移植を pixel 同一性に限定していないことだ。解像度と asset 位置は機械的な比率変換で保てたが、textbox transition は engine の世代差で意味が失われた。作者が旧版を参照実装として横に置いたことで、「何を表示するか」だけでなく「いつ現れ、いつ消えるか」という演出契約を復元できた。旧 code をそのまま保持することと旧体験を保持することは同じではない。基盤更新時には code diff より、観測可能な振る舞いの対照表が有効だと読める。

ただし評価の限界は明確である。これは統制実験ではなく単独開発者の事後記録で、作者自身も作者と beta reader は機能上 able-bodied だと断っている。TTS 全編走査と beta test は技術的な不具合検出には効いたが、blind player が説明を理解できたか、motor impairment のある利用者が timed choice 切替を使いやすいか、個別 mute の分類が認知しやすいかは検証されていない。また caption を narrative に溶かす方針は没入感を保つ一方、冗長さ、視点の不自然さ、情報探索性との trade-off があり、唯一の正解ではない。記事から採れるのは完成済みの accessibility 基準ではなく、既存作品に追加した時に壊れる接続面と、scope を閉じる設計原則である。

■ 自分達の環境への適用
旧 prototype を更新する時、着手前に `preserve / update / exclude` の三列 manifest を作る。preserve には core loop、当時の文章・絵・敵配置、入力 timing、update には runtime、解像度、入力 remap、字幕、TTS、個別音量、timer 無効化、save compatibility、exclude には全面 rewrite や無制限な追加 content を置く。これを playable diff の acceptance criteria にして scope creep を防ぐ。

検証は旧新版の同時比較を deterministic probe に変換できる。主要 scene ごとに seed、入力列、scene id、textbox mode、表示中 speaker、choice state、audio channel、save hook text を event trace として保存し、新版で同じ checkpoint を通す。画像差分だけでなく、textbox の show / hide 順序、選択可能になる tick、timer off 時の到達可能性、mute 後に残る channel、save/load 復元後の読み上げ対象を assertion にする。headless で音声の自然さそのものは判定できなくても、「複数台詞のうち読み上げ対象が一つだけ」「無言台詞の accessible label が空」「非表示説明が visible history へ漏れた」といった構造的不整合は state log で検出できる。最後に人が TTS で一周し、発音、文体、情報量を確認する二段構えがよい。

記憶には事故を抽象的な教訓でなく、`feature / hidden consumer / failure / regression probe` で残す。例えば `alt text / save hook / 非表示文が直近台詞へ混入 / save前後のhookを比較`、`multi-line dialogue / TTS / 最終行しか読まれない / utterance数を検査` とする。Phase 3b で一件だけ再現し、効いた probe だけ checklist へ昇格させれば、ルールを増やし過ぎず検査可能な証拠へ変換できる。

■ メリット・デメリット
メリットは、第一に創作履歴を消さずに利用可能性と保守性を上げられること。第二に、旧版を参照実装にするため、engine 更新で失われた暗黙の timing や data flow を発見しやすいこと。第三に、TTS という別経路で全編を走ることが、accessibility 以外の typo、GUI、履歴、発音まで拾う高感度な回帰テストになること。第四に、追加 content を別 scope として語数まで固定したため、保守と新規制作の完了条件を混ぜていないことである。

デメリットは、caption を narrative に統合するほど執筆・全編確認の工数が増え、抽象表現や一人称視点では文章自体が不自然になり得ること。旧版との目視照合は有効だが、長編では checkpoint と trace を残さなければ再実行性が低い。外部 code を組み合わせた GUI は更新を速める反面、save hook、sound category、choice screen のような作者固有 extension との境界で予期しない衝突を生む。そして当事者評価がないため、「技術的に読み上げられる」を「実際に使いやすい」と誤認してはいけない。採用時は静的・headless 検査、作者の全編走査、対象利用者による usability 確認を別の評価段階として扱う必要がある。

■ 判定
部分採用。保存対象と更新対象を先に分ける scope manifest、旧新版の観測可能な挙動の並列比較、accessibility 経路を使った全編回帰走査、hidden consumer を含む横断 QA はそのまま採る。一方、caption の文体統合や作者・beta reader だけの確認を完成基準にはしない。次の旧 prototype 更新では、textbox、TTS 対象、save hook、音 channel、timed choice の五項目を event trace 化する小さな probe から導入する。

■ URL
https://knickknackpj.itch.io/pillarsonpoppyhills/devlog/1390476/poph-20-postmortem-or-on-doing-a-massive-update-on-your-old-game
