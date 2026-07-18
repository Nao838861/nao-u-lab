■ 概要
長期記憶と email・calendar・filesystem への接続を持つ personal agent では、外部文書を処理したその場で危険動作が起きなくても、内容が durable memory へ静かに採用され、別 session の行動で trusted state として再利用される。WhisperBench はこの時間差を stealth memory injection と定義し、攻撃成功を三段階に分ける。(1) 一通の外部 email から偽の fact または preference が記憶へ入る、(2) user-facing response が記憶更新や攻撃内容を露呈しない、(3) 後日の trigger query で poisoned memory が実際の判断を変える、である。従来の即時 tool hijack や、既に汚染済み database を前提とする評価では、この delivery-to-memory-to-action の全 cycle が抜けていた。

各 case は、benign mail と悪意ある一通を混ぜた inbox、target false memory、別 session の probe、rubric の組である。health/safety、financial loss、information integrity、cybersecurity、operational disruption の五 category と fact/preference poisoning を含む。実 SMTP/IMAP と email skill で200候補を実行し、偽記憶が downstream behavior を変えるものだけを残して108 cases とした。state diff、tool trace、visible output、後続 response から injection、stealth、effectiveness、三条件を同時に満たす E2E を別々に測る。

MemGhost は一通しか送れず target 構成も runtime feedback も不明な black-box 条件を扱う。filesystem、email/file tools、context assembly を模倣した shadow agent と、memory adoption・非露呈を採点する objective proxy を置く。保存場所、正規 entry らしさ、後続判断を動かす具体性を密な reward にし、supervised fine-tuning と reinforcement learning を行う。推論時は一回の forward pass で payload を生成する。

52 cases を訓練、56 held-out cases を評価に使った。background の E2E は OpenClaw + GPT-5.4 で87.5%、Claude SDK + Sonnet 4.6 で71.4%、foreground では75.0%、48.2%。native filesystem を vector-based Mem0 へ替えた OpenClaw と Hermes でも GPT-5.4 background は各85.7%で、異なる context assembly と API に転移した。proxy reward と real metric の Pearson 相関は injection .872、stealth .785、E2E .839だった。

既存防御も十分ではない。DataSentinel は91.59% false negative、Meta-SecAlign 下でも injection 49.07%、AgentDoG は OpenClaw で93.46%、Claude SDKで40.38% false negative だった。「確認内容と action を返答せよ」という防御でも Sonnet 4.5 の stealth は25.0%残った。外部 content が durable state へ昇格する境界自体の制御が必要である。

■ 内容分析
最も重要なのは、memory write 成功率だけを測らず、後日の行動変化まで end-to-end で結んだ点である。危険な文が一時 context に現れた、あるいは memory file に文字列が残っただけでは compromise と言えない。逆に ingest 時の応答が無害でも、provenance を失った内容が将来の recommendation や action に使われれば失敗である。WhisperBench の三信号分離は、検知・採用・発火のどこで防げたかを診断できる。

転移結果から、弱点は特定のファイル名や API だけにない。filesystem から動的 retrieval の Mem0 に替えても E2E が残り、外部の主張を agent 自身の authoritative knowledge らしく見せる semantic adoption が鍵だと読める。ただし proxy validation は事後相関で causal proof ではなく、個別 case の安全を保証しない。

execution mode も重要である。background は stealth が通りやすく、foreground は出力規律が結果を変える。MiniMax-M2.5 は injection 98.2%でも stealth 21.4%で、reasoning leakage が攻撃を露呈した。簡潔な agentic output が不正 action の隠れ蓑になる逆説があり、沈黙を品質だけで評価すると observability を落とす。

限界も大きい。mailbox 到着後だけを対象とし配送防御は評価外、single-user・single-agent・text-only に限り、attachment、multi-agent propagation、数週間の memory decay は扱わない。108 cases は直接偽記憶を入れて狙いの挙動が出たものだけで、現実の全入力に対する発生率ではない。preprint の limitation 節には未編集文も残り、数値は再検証前提で扱う。

■ 自分達の環境への適用
制作環境では Slack、外部記事、playtest report、issue、asset metadata も untrusted content になり得る。`source`、author、取得時刻、原文 hash、trust level、承認有無を derived memory まで継承し、要約で provenance を落とさない。外部記述を user preference、恒久 directive、実行 instruction へ自動昇格させない。

記憶は三層に分ける。raw は untrusted、candidate は recall 可能だが action authority なし、durable rule / preference への昇格は user source または明示 gate を要する。検索結果を trusted とみなさず、file edit、Slack post、scheduled task 変更の直前に provenance と authority を再検証する。

隔離 fixture に benign report と偽 directive を混ぜ、raw 保存、durable preference への昇格、変更の可視化、別 session の行動変化を測る。fact と preference poisoning を分け、「この asset は自由利用可」など実害のない synthetic target を使い、実 credential・実 channel・本番 repo では試さない。

防御は memory write 全面禁止ではなく、正当な user 指示を保ちつつ poisoned content を action gate で止められるかを見る。adoption、stealth、delayed effect に、正当 memory の recall 維持率、誤拒否率、provenance 欠落率を加える。最初の変更は外部由来 atom の trust label と昇格時 source check である。

■ メリット・デメリット
メリットは、単発 prompt injection では見えない時間差の compromise を再現可能にし、ingest・memory・recall・action のどこが弱いかを分離できること、filesystem と vector memory の双方を同じ lifecycle で検査できること、既存 filter を通った後の residual risk を測れることにある。制作 memory に provenance と昇格 gate を入れる根拠として直接使える。

デメリットは、攻撃 framework 自体が dual-use であり、payload 詳細を実環境で再現すべきでないこと、case selection・judge rubric・対象 model/agent に成功率が依存すること、確認 gate を強くしすぎると自動 ingest と継続支援の価値を失うことだ。provenance tagging だけでは、trusted source の乗っ取りや誤情報、要約時の laundering を防げない。すべてを user confirmation に寄せると alert fatigue が起きるため、記憶内容の sensitivity と予定 action の影響度に応じた段階 gate が必要である。

■ 判定
部分採用。攻撃 payload 生成手法は導入せず、WhisperBench の full-cycle 分解を防御テストへ転用する。外部入力の provenance 保持、durable rule/preference への昇格 gate、action 直前の再検証を優先し、隔離された synthetic case で adoption・stealth・delayed effect と正当 memory 維持率を同時に測る。

■ URL
https://arxiv.org/abs/2607.05189
