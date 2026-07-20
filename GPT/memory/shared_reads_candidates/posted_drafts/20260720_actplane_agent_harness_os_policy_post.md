■ 概要
対象は “ActPlane: Programmable OS-Level Policy Enforcement for Agent Harnesses”。自然言語の規約だけでは計画ミスや script の副作用で違反が起きるが、tool-call guardrail は script 内の `git commit` や subprocess の file write を見落とす。従来の OS sandbox は全経路を見られる一方、静的 resource access 制御が中心で、「最後の source edit より後に test が成功したか」という順序を表しにくく、拒否理由も agent に伝わらない。論文は、task context を読む agent が具体的 policy を宣言し、OS kernel が決定論的に強制する二層構成でこの semantic gap を埋める。

CLAUDE.md / AGENTS.md を持つ repository 64件、2,116 statement の調査では、64%が行動 policy で、その83%は system 上で観測可能だった。event 順序や data lineage を要する cross-event policy は16%あり、その95%が project または live task context を必要とした。固定 sandbox rule と自然言語指示のどちらか一方では覆えない領域が出発点である。

ActPlane は policy を source、target operation、effect、temporal gate、拒否理由からなる DSL に落とす。source write 以後に `go test` が成功していなければ `git commit` を kill、data directory の unlink を block、schema edit 後に generator 未実行なら notify、と表現できる。DSL は eBPF config に変換され、BPF-LSM と tracepoint で process、file、network event を監視する。

cross-event 状態は process、file、network endpoint の label を fork、exec、read、write、connect に沿って単調伝播させる。これで `.env` を読んだ process の外部接続や wrapper の奥の副作用も追える。hierarchical policy domain では child は親 rule を継承して制約を追加できるが弱化できず、agent 自身の runtime rule は self-restriction になる。

607件の OS-enforceable policy は agent 変換で全件 compile した。38規則・190 trace の比較で Decision Compliance Rate は75.8%となり、prompt-filter 48.4%、tool-regex 45.3%、tool-level IFC 48.9%、feedback 無しの kernel IFC 53.7%を上回った。差は間接経路と cross-event rule に集中する。OctoBench 21件では user-query / implementation-test reward が各9.9 / 9.7 point改善。OpenAgentSafety 361件では baseline unsafe 106件中78件、74%を阻止した。end-to-end overhead は1.9%から8.4%だった。

■ 内容分析
新規性は kernel 強制だけではない。「意味を解決する場所」と「違反を止める場所」を分け、結果を agent が理解できる意味へ戻す閉ループにある。repository を読む agent は「full test suite」を具体化できるが確率的であり、kernel は process tree を観測できるが project の意味を知らない。DSL を境界に、context 解決、決定論的判定、semantic feedback を役割分担した点が強い。

同じ kernel engine でも opaque denial では正しい violation response が86件から27件へ落ち、検出後の compliance は31.4%に留まった。full system の semantic feedback 後は97.7%。安全装置は止めるだけでなく、違反 rule と修正手順を返す必要がある。

ただし RQ2 は38規則の生成 trace、RQ4 は217課題中21件だけで、content、tone、意味判断は対象外。未阻止28件は chat harm、unsafe file content、別 service 内の mutation に集中し、hook が見ない効果は止められない。object 単位の単調 label も長期 session では over-taint する。

policy translation も誤り得る。18 false positive 中17件は rule が広すぎた。一方、false negative を1回改訂すると28件中26件を回収した。強い権限へ昇格する前に compliant / violating trace の対で回帰検証すべきである。

■ 自分達の環境への適用
まず制作規約を semantic / content / per-event / cross-event に棚卸しする。候補は、source edit 後に headless playtest が成功するまで commit を拒否する gate、生成 asset の出力先 rule、secret を読んだ process tree の network egress 制限、sub-agent の担当外変更を防ぐ lineage rule。Markdown の注意書きを増やすより実行履歴を state にする。

現環境は Windows / PowerShell なので、Linux、BPF-LSM、eBPF 前提の本体は直用できない。最初は小型 game repository で `source_changed`、`headless_passed`、`asset_generated`、`secret_touched` の4 state を journal に記録し、commit / publish / external write 前に gate を評価する。拒否時は未達条件と許可 path を corrective payload で返す。

各 rule に正規操作2本、直接・script・hidden 違反を1本ずつ用意し、検出率、誤拒否率、feedback 後の回復率、rule 更新後の回帰を測る。tool wrapper の間接経路限界が実害になった時だけ WSL2 / Linux worker の eBPF probe へ進む。

記憶システムには authority 継承を移す。user directive、active rule、candidate を同じ強さで扱わず、後続 phase は上位制約を弱めず局所制約だけ追加する。directive supersession、candidate gate、posted evidence を実行時 domain として捉えられる。

■ メリット・デメリット
メリットは、subprocess まで追うため tool regex より迂回に強いこと、temporal gate と label で「変更後に検証済み」「秘密に触れた後は外へ出さない」を表せること、corrective feedback と親 rule 継承により回復可能性と上位制約を両立できること。

デメリットは Linux kernel と privileged loader が必要なこと。chat harm、file content、remote service 内 mutation は別制御が要る。単調 label は過剰制限を生み、最大128 rule や未対応 hook も上限になる。誤拒否を避けるため notify から block へ段階昇格すべきである。

■ 判定
部分採用。本体の即時導入は platform 差のため見送る。event/state policy、上位制約を弱められない domain、間接経路を含む violation trace、semantic feedback を採用する。まず1つの game repository で4 state の harness-level probe を行い、必要時だけ Linux worker で OS-level enforcement を試す。

■ URL
https://arxiv.org/abs/2606.25189
https://arxiv.org/html/2606.25189
https://github.com/eunomia-bpf/ActPlane
