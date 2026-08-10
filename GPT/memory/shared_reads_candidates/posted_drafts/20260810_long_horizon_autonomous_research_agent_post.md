■ 概要
この論文は、単一の汎用 language model に neural architecture 研究の提案・実装・実験・解釈・記録を担わせ、短期 benchmark では見えない長期挙動を約10週間追った case study である。課題は、空間 self-attention を使わず channel attention と convolution だけで競争力のある Vision Transformer を作れるか。研究 brief、計算予算、git、実験 tracking、構造化 memory を与え、途中から文献検索と code editing を解禁した。変更変数と job は毎回1つ、現 champion を上回れば commit、下回れば revert する loop を約100仮説、約150 job、約2400 GPU-hours回している。

結果は三つの regime に分かれた。最初の6仮説は成功率67%、成功時平均 +5.71 percentage points（pp）、続く7件は成功率71%・平均 +0.32pp、その後29件は成功率21%・平均 +0.17pp の飽和に落ちた。CIFAR-10 の総改善 +26.92pp の79.5%は、最初に FFN を加えた H1 の +21.41pp が占める。文献 access と code editing を加えると code-level hypothesis は 5%（2/42）から76%（16/21）へ増えたが、成功1件の利得は +0.19pp。文献は巨大な当たりより、枯れた configuration surface から別種の行動へ移す役割を果たした。

22M parameter の CIFAR-100 では 85.07%、ImageNet-1K では baseline 79.00%（300 epoch）に対し、Phase 3 champion は 77.91%（100 epoch）で usable だが sub-SOTA に留まる。ImageNet の18仮説で採用は2件、最大改善も Linformer 由来の low-rank block による +0.26ppだけだった。著者の結論は「agent が自律研究を解決した」ではない。同じ model でも、許された action surface、単一 champion、採否規則、memory の読み方が長期挙動を強く決める。diversified search、一定間隔の moonshot、明示的 fork、regime 変更時の再検証を、今後比較実験すべき workflow 仮説として提示している。

■ 内容分析
この研究の価値は最終 accuracy より、制作 loop 自身が探索 bias を作る過程を履歴から切り分けた点にある。commit-or-discard、単一 working copy、「champion から次を作る」という template は、agent の性格に関係なく greedy hill-climbing と同型である。失敗案同士の組合せ、過去 branch への復帰、異なる設計思想の並走を構造上できない。Phase 3 では low-rank block の成功後、rank schedule、sparse selection、parallel branch、sparsemax と近傍案を5回続けて失敗した。agent は記録上では飽和を認識し「別 operator family へ移る」と書きながら、次の行動ではまた局所差分を選ぶ。文章上の自己認識だけでは、局所改善を報酬にする harness を越えられなかった。

保守化を全部 workflow のせいにもできない。大胆な失敗後に安全案へ退く risk aversion と、有名論文へ偏る anchoring は規則が許しても残った。逆に成功直後の ablation、別 regime での失敗案再試行も自発的に行った。channel token では multi-head が悪いことを二度確認し、標準的な spatial attention の直感を実験で退けた。「創造的／保守的」の一語でなく、探索 topology と model 側の傾向を分ける必要がある。

scale を跨ぐ anti-finding も重要である。CIFAR-10 で mixup と label smoothing は悪化したが、CIFAR-100 ではそれぞれ +0.77pp、+0.30pp 改善した。drop-path removal も +0.46pp から -0.60pp へ符号が反転した。採用済み知見を普遍 rule として memory に保存すると、環境が変わった時に誤誘導になる。知見には dataset、model size、epoch budget、augmentation family を validation regime として付け、遷移時に再検証する必要がある。

証拠は単一 agent・課題・run で、human control も multi-seed もない。Phase 1b では文献 access、code editing、novelty instruction が同時に変わり、5%→76%を文献 tool 単独の効果とは言えない。dataset や epoch も phase 間で違う。人間も transition、plateau 指摘、memory discipline を投入し毎日1～2時間監視した。完全無人ではなく、人間が探索空間を節目で再構成する bounded autonomy と読むべきである。

■ 自分達の環境への適用
我々のゲーム制作 cycle では「playable diff を1つ作り、評価して残す」長所を維持する。ただし通常 branch だけでは、既存 metric を改善しても遊びの核が同じ近傍で飽和する。そこで通常は champion への single-variable diff を続け、5件ごとに1件だけ、過去 branch、異なる core mechanic、失敗案の組合せのいずれかを独立 fork で試す。headless smoke test と短い人間 playtest まで通し、本流と同じ局所 metric だけで早期に潰さない。

飽和は直近10件の acceptance rate、累積増分、変更 family 重複率で見る。acceptance 20%以下かつ改善が微小で同じ family が続けば `saturated_local_surface` とし、model 変更前に action を増やす。screenshot 評価へ state dump、input trace、死亡原因を加える、level tuning から新 mechanic prototype を許す、といった surface expansion を先に試す。

記憶システムには、各 atom や game lesson に `validated_regime` と `revalidate_on` を持たせるのが直接的である。たとえば「headless で30秒生存した」を普遍的な面白さの証拠にせず、game version、level、input policy、seed、metric を併記する。game scale、操作方式、評価 agent、制約が変わった時は旧 champion の上位知見を自動で再試行する。また full log の再読だけに依存せず、反証済み領域、未探索 family、現 champion の弱点をまとめた compact synthesis を更新し、次 session で full history と併用する。

最小 probe は、次の playable diff 5件を通常改善4件＋独立 fork 1件として記録すること。各件に `parent_branch`、`change_family`、`expected_gain`、`accepted`、`metric_delta`、`validated_regime` を付け、5件後に「通常4件だけの場合より探索の種類が増えたか」「fork を本流 metric だけで不当に落としていないか」を見る。この論文の数値を再現するのではなく、greedy な workflow が我々の制作判断を狭めるかを小さく測る。

■ メリット・デメリット
メリットは、git、single-variable diff、構造化 log、telemetry、compact synthesis という既存資産を捨てず、探索 diversity だけを追加できること。失敗を branch と regime 付きで残せば、同じ案の無自覚な反復を減らし、環境変更時には以前の失敗を再利用できる。agent の文章を「大胆に考えろ」と強めるより、fork 枠と moonshot 予算を harness 側に置く方が検証可能である。

デメリットは、fork と複数 champion が因果追跡・比較・merge 判断を難しくし、評価計算と人間 playtest を増やすこと。ゲームの面白さは accuracy のような単一 scalar ではなく、局所 metric で discard すると新規性を殺しやすい。逆に novelty 枠を義務化しすぎると、明らかに有効な polish を中断する。さらに論文の提案は未検証であり、5件に1件という比率も我々が置く暫定値にすぎない。まず1 cycle の probe に留め、branch 数や恒久 rule を先に増やさない。

■ 判定
部分採用。commit-or-discard と構造化履歴は維持し、探索飽和の trace、少数の独立 fork、regime metadata と遷移時再検証を小さく導入する。論文が示す三段階構造や推奨策を一般法則とは扱わず、次の playable diff 5件で workflow 差を観測してから継続可否を決める。

■ URL
https://arxiv.org/abs/2608.01995
https://arxiv.org/html/2608.01995v1
