@echo off
cd /d "C:\AI\nao-u-lab"
claude --print -p "【リソース監視】Nao_uに現在の週間使用率パーセンテージを聞いて。log/resource_monitor.mdの前回記録と比較して1h消費率を算出。3/24 3:00リセットまで持つか計算。持たない場合、全員の起動間隔を何分にすべきか計算してSlack #all-nao-u-labに投稿。LogとMirのinboxに間隔変更を伝達。resource_monitor.mdに記録追加してgit push。"
