# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush



## Slack新着 [2026-03-19 06:27] #nao-u
From: U0ALSUK8P9B
> （´-`）.｡oO( 比較的大きめの並列マルチエージェントを実装したけど，AnthropicやOpenAIはRate limitがキツすぎて，gemini-3.1-flash-lite-previewしか勝たん感じ．エージェントを50並列しても普通に問題無いの，まさに世界一のインフラ屋としてのGoogleの矜持だよな．新興はインフラ運用が弱い… )
今回はdurable executionを全てのエージェントループに導入したけれど，これはこれで結構大変だった…．でもノウハウは得られた．先端的なエージェントラボやオンライン決済大手が社内でやっている実装もなんとなくわかった気になった．今の自分たちのプロダクトもこれで書き換えるし，別展開もする．
今回はオーケストレーターが最後に全てを統べる的な設計にしたけど，これ，別に各ワーカーエージェントがReActエージェントループという頭脳をもっているだから，各自が可観測性スタックを見ながら判断すればいいわけなんで，まさにエージェントスワームの実現が可能になるなとも思ったよ
まさにapi呼び出しで50並列でまともに動くのgeminiだけなんですよね。特に3.1 flash liteはとにかく早い。専用インスタンスがリザーブできるくらいの予算以外、結局サービス作るときはgeminiになる。


## Slack新着 [2026-03-19 06:28] #nao-u
From: U0ALSUK8P9B
> UnslothがUnslothStudioというオープンソースのWebUIをリリース。ローカルでLLMを微調整するためのUI。
Introducing Unsloth Studio
A new open-source web UI to train and run LLMs.

• Run models locally on Mac, Windows, Linux
• Train 500+ models 2x faster with 70% less VRAM
• Supports GGUF, vision, audio, embedding models
• Auto-create datasets from PDF, CSV, DOCX
• Self-healing tool calling and code execution
• Compare models side by side + export to GGUF
GitHub: <https://t.co/2kXqhhvLsb|https://>
<https://t.co/2kXqhhvLsb|github.com/unslothai/unsl>
<https://t.co/2kXqhhvLsb|oth>

Blog and Guide: <https://t.co/ENuTWal5AA|https://>
<http://unsloth.ai/docs/new/studio|unsloth.ai/docs/new/studio>

Available now on Hugging Face, NVIDIA, Docker and Colab.


## Slack新着 [2026-03-19 06:28] #nao-u
From: U0ALSUK8P9B
> 自律型AIがテストを都合よく低コストで実装してしまう問題に真摯に向き合っているpluginや環境ないかなぁ。
複合的なアーキテクチャに対して統合的かつ網羅的なテストが行われてない、急務だ。sessionを切り分けた第N者目線で定期的に批判的に監査し、issue化していけばいいのかな。
