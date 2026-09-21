from __future__ import annotations


def page() -> str:
    return """<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>StackChan Avatar</title>
<style>
:root{color-scheme:light;--ink:#28231f;--paper:#fffaf2;--card:#fff;--accent:#ef6c57;--gold:#f2b84b;--muted:#6b625b}
*{box-sizing:border-box}body{font-family:system-ui,sans-serif;max-width:900px;margin:2rem auto;padding:0 1rem;background:var(--paper);color:var(--ink)}
h1{margin-bottom:.25rem}.lead{margin-top:0;color:var(--muted)}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1rem}
.card{background:var(--card);border:2px solid var(--ink);border-radius:20px;padding:1.25rem;box-shadow:5px 5px 0 var(--gold);margin-bottom:1rem}
.guide{border-color:#4f6d7a;box-shadow:5px 5px 0 #9ec5d4}.guide ol{padding-left:1.5rem}.guide li{margin:.65rem 0;line-height:1.5}.guide strong{color:#b53e2e}.mini{margin:.35rem 0 0;padding-left:1.25rem}.mini li{margin:.3rem 0}.choice{display:grid;gap:.7rem}.choice div{padding:.8rem;border-radius:12px;background:#f1eee9}.choice b{display:block;margin-bottom:.2rem}.no-firmware{border-left:6px solid #3a9b52}.firmware{border-left:6px solid var(--accent)}
label{display:block;font-weight:700;margin:.75rem 0 .25rem}input,select,textarea{width:100%;font:inherit;padding:.7rem;border:2px solid #999;border-radius:10px;background:white}
textarea{min-height:6rem}.row{display:flex;gap:.6rem;flex-wrap:wrap;margin-top:1rem}button{font:inherit;font-weight:700;padding:.7rem 1.05rem;border:0;border-radius:999px;background:var(--accent);color:white;cursor:pointer}
button.secondary{background:#4f6d7a}button:disabled{opacity:.45;cursor:wait}.status{padding:.65rem .8rem;border-radius:10px;background:#f1eee9}.ok{background:#dcf4df}.warn{background:#fff0c7}.error{background:#ffd9d5}
.hint{font-size:.88rem;color:var(--muted)}pre{white-space:pre-wrap;word-break:break-word;background:#201d1b;color:#f8f3eb;padding:1rem;border-radius:12px;max-height:300px;overflow:auto}.reply{white-space:pre-wrap;min-height:2rem}.camera-preview{display:none;width:100%;max-width:480px;margin-top:1rem;border:2px solid var(--ink);border-radius:12px}input[type=range]{padding:.3rem}
</style></head><body>
<h1>スタックちゃん セットアップ</h1><p class="lead">上から順に入力すれば、PCアプリの設定とファーム書き込みができます。</p>
<div id="deviceStatus" class="status">接続状態を確認中…</div>
<section class="card"><h2>いま、どのボタンを押す？</h2><div class="choice">
<div class="no-firmware"><b>APIキーや会話モードだけを変えた</b>「PC設定だけ保存」を押してアプリを再起動します。<strong>ファームの再書き込みは不要です。</strong></div>
<div class="no-firmware"><b>設定済みのAPIキーを試したい</b>保存も転送も不要です。下の「5. 会話テスト」で文章を入力し、「話す」を押します。本体未接続でも文字の返答を確認できます。</div>
<div class="no-firmware"><b>前回と同じ設定で使う</b>保存も転送も不要です。スタックちゃんの電源を入れ、接続後に「5. 会話テスト」へ進みます。</div>
<div class="firmware"><b>初回セットアップ、Wi-Fi名・パスワード・PCアドレスを変えた</b>「PC設定だけ保存」の後、「本体へ書き込む」を押します。この場合だけファーム転送が必要です。</div>
</div></section>
<section class="card guide"><h2>はじめに：初回はこの順番です</h2>
<ol>
<li><strong>まず診断モードのまま進める</strong><br>OpenAI APIキーは後から設定できます。最初は通信できることを確認します。</li>
<li><strong>下の「1. 会話」と「2. Wi-Fi」を確認して「PC設定だけ保存」</strong><br>このボタンでは本体へ転送しません。スタックちゃんには2.4 GHzのWi-Fiが必要です。PCは同じ家庭内LANなら5 GHz接続でも構いません。</li>
<li><strong>スタックちゃんをUSBでPCにつなぐ</strong><br>データ通信対応ケーブルをベース側USB-C端子へ挿します。首の周囲には物を置かないでください。</li>
<li><strong>「本体へ書き込む」を押して、完了まで待つ</strong><br>ビルドも自動で行うため、通常は「先にビルド」を押さなくて構いません。初回は数分かかります。</li>
<li><strong>成功したら本体を再起動し、この画面を開いたまま待つ</strong><br>上の表示が「スタックちゃん接続中」になれば準備完了です。「4. 本体機能」や「5. 会話テスト」を試せます。</li>
</ol>
<p class="hint">2回目以降は、PCでこのアプリを起動してからスタックちゃんの電源を入れるだけです。Wi-Fi情報を変えた場合だけ再書き込みします。</p>
</section>
<div class="grid">
<section class="card"><h2>1. 会話の設定</h2>
<p class="hint">初回は「診断モード」を選んでください。接続確認後、OpenAI会話へ切り替えられます。</p>
<label for="brain">動作モード</label><select id="brain"><option value="echo">診断モード（APIキー不要）</option><option value="openai">OpenAI会話</option></select>
<label for="apiKey">OpenAI APIキー</label><input id="apiKey" type="password" autocomplete="off" placeholder="設定済みなら空欄でOK">
<p id="keyState" class="hint"></p><p class="hint">変更後は、このアプリを閉じてもう一度ダブルクリックすると反映されます。</p>
</section>
<section class="card"><h2>2. Wi-FiとPC</h2>
<p class="hint">入力済みの値を確認し、「PC設定だけ保存」を押します。このボタンだけでは本体へ転送しません。</p>
<label for="ssid">2.4 GHz Wi-Fi名</label><input id="ssid" autocomplete="off" placeholder="設定済みなら空欄でOK">
<label for="wifiPassword">Wi-Fiパスワード</label><input id="wifiPassword" type="password" autocomplete="off" placeholder="ローカル設定済みなら空欄でOK">
<label for="serverHost">このPCのLANアドレス</label><input id="serverHost" inputmode="decimal">
<p class="hint">通常は自動入力されます。127.0.0.1の場合はOSのネットワーク設定で確認してください。</p>
<div class="row"><button id="save">PC設定だけ保存（転送しない）</button></div><p id="saveResult" class="hint"></p>
</section>
</div>
<section class="card"><h2>3. 初回・Wi-Fi変更時だけ：USBでファームを書き込む</h2>
<p class="status warn"><strong>APIキーや会話モードだけを変えた場合、この手順は飛ばしてください。</strong></p>
<ul class="mini"><li>ベース側USB-C端子とPCをデータ通信対応ケーブルでつなぐ</li><li>ポートが出なければ「ポート再検索」を押す</li><li>通常は「本体へ書き込む」を1回押す</li></ul>
<label for="serialPort">スタックちゃんのUSBポート</label><select id="serialPort"><option value="">自動検出</option></select>
<div class="row"><button id="refreshPorts" class="secondary">ポート再検索</button><button id="build" class="secondary">動作確認用ビルド</button><button id="upload">本体へ書き込む（必要時のみ）</button></div>
<p class="hint">本体のベース側USB-C端子を使用し、首の周囲を空けてください。初回ビルドは数分かかります。</p>
<pre id="jobLog">まだ処理を実行していません。</pre>
</section>
<section class="card"><h2>4. 本体機能：音量とカメラ</h2>
<p class="hint">この機能を追加した新しいファームを書き込んだ後に使えます。撮影はボタンを押した時だけ行い、本体画面にも「CAMERA」と表示します。</p>
<label for="volume">スピーカー音量：<span id="volumeValue">160</span> / 230</label><input id="volume" type="range" min="0" max="230" value="160">
<div class="row"><button id="setVolume" class="secondary">この音量にする</button><button id="takePhoto">静止画を1枚撮る</button></div>
<p id="deviceResult" class="hint"></p><img id="cameraPreview" class="camera-preview" alt="スタックちゃんが撮影した画像">
</section>
<section class="card"><h2>5. 会話テスト</h2>
<p class="hint">APIキーだけを試す場合は、本体未接続でも実行できます。文章を入力して「話す」を押し、文字の返答が出れば成功です。本体が接続中なら音声でも話します。</p>
<p class="hint">接続中は「音量を120にして」「目の前に何がある？」のように頼むと、本体機能を会話から使えます。</p>
<textarea id="text" placeholder="スタックちゃんに話しかける"></textarea>
<div class="row"><button id="send">話す</button></div><p id="reply" class="reply"></p>
</section>
<div class="row"><button id="stopApp" class="secondary">アプリを終了</button></div>
<script>
const $=s=>document.querySelector(s);let jobRunning=false;
async function jsonFetch(url,options={}){const r=await fetch(url,options);let j={};try{j=await r.json()}catch{}if(!r.ok)throw new Error(j.detail||`HTTP ${r.status}`);return j}
async function refreshStatus(){try{const s=await jsonFetch('/api/status');$('#deviceStatus').className='status '+(s.connected_devices?'ok':'warn');$('#deviceStatus').textContent=s.connected_devices?`スタックちゃん接続中（${s.connected_devices}台）`:'スタックちゃん未接続 — APIキーの文字テストは可能です。初回なら書き込み、書き込み済みなら本体の電源とWi-Fiを確認してください';}catch(e){$('#deviceStatus').textContent=e.message}}
function fillPorts(ports){const current=$('#serialPort').value;$('#serialPort').innerHTML='<option value="">自動検出</option>';for(const p of ports){const o=document.createElement('option');o.value=p.device;o.textContent=`${p.device} — ${p.description}`;$('#serialPort').append(o)}$('#serialPort').value=current}
async function refreshSetup(){try{const s=await jsonFetch('/api/setup');$('#brain').value=s.brain;if(!$('#ssid').value)$('#ssid').value=s.default_wifi_ssid||'';if(!$('#serverHost').value)$('#serverHost').value=s.suggested_ip;$('#keyState').textContent=s.openai_key_configured?'APIキーは設定済みです。試すだけなら保存やファーム転送はせず、会話テストへ進んでください。':'APIキーはまだ設定されていません。';if(s.local_config_error)$('#saveResult').textContent=s.local_config_error;else if(s.local_configured)$('#saveResult').textContent='ローカル設定を読み込みました。Wi-Fiパスワードは表示しません。';fillPorts(s.serial_ports);renderJob(s.job)}catch(e){$('#saveResult').textContent=e.message}}
function setupBody(){return{brain:$('#brain').value,openai_api_key:$('#apiKey').value,wifi_ssid:$('#ssid').value,wifi_password:$('#wifiPassword').value,server_host:$('#serverHost').value,server_port:8000}}
async function save(){const r=await jsonFetch('/api/setup/save',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(setupBody())});$('#apiKey').value='';$('#wifiPassword').value='';$('#saveResult').textContent=r.restart_required?'保存しました。会話設定はアプリを再起動すると反映されます。':'保存しました。';return r}
function renderJob(job){jobRunning=job.running;for(const b of ['#build','#upload'])$(b).disabled=jobRunning;$('#jobLog').textContent=(job.log||[]).join('\\n')||'まだ処理を実行していません。';$('#jobLog').scrollTop=$('#jobLog').scrollHeight;if(jobRunning)setTimeout(pollJob,1000)}
async function pollJob(){try{renderJob(await jsonFetch('/api/firmware/job'))}catch(e){$('#jobLog').textContent=e.message}}
async function startJob(action){try{await save();if(action==='upload'&&!confirm('購入時のファームをカスタムファームに置き換えます。続けますか？'))return;const job=await jsonFetch('/api/firmware/start',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action,port:$('#serialPort').value})});renderJob(job)}catch(e){$('#jobLog').textContent=e.message}}
$('#save').onclick=()=>save().catch(e=>$('#saveResult').textContent=e.message);$('#refreshPorts').onclick=refreshSetup;$('#build').onclick=()=>startJob('build');$('#upload').onclick=()=>startJob('upload');
$('#volume').oninput=()=>$('#volumeValue').textContent=$('#volume').value;
$('#setVolume').onclick=async()=>{try{const j=await jsonFetch('/api/device/volume',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({level:Number($('#volume').value)})});$('#deviceResult').textContent=`音量を ${j.level} にしました。`}catch(e){$('#deviceResult').textContent=e.message}};
$('#takePhoto').onclick=async()=>{if(!confirm('スタックちゃんの正面を静止画で1枚撮影します。続けますか？'))return;$('#deviceResult').textContent='撮影中…';try{const j=await jsonFetch('/api/device/camera',{method:'POST'});$('#cameraPreview').src=j.image_url;$('#cameraPreview').style.display='block';$('#deviceResult').textContent=`撮影しました（${j.width}×${j.height}）`;}catch(e){$('#deviceResult').textContent=e.message}};
$('#send').onclick=async()=>{const text=$('#text').value.trim();if(!text)return;$('#reply').textContent='考え中…';try{const j=await jsonFetch('/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text,speak:true})});$('#reply').textContent=j.reply}catch(e){$('#reply').textContent=e.message}refreshStatus()};
$('#stopApp').onclick=async()=>{if(!confirm('StackChan Avatarを終了しますか？'))return;try{await jsonFetch('/api/app/stop',{method:'POST'});document.body.innerHTML='<main class="card"><h1>終了しました</h1><p>このタブを閉じてください。</p></main>'}catch(e){alert(e.message)}};
refreshStatus();refreshSetup();setInterval(refreshStatus,3000);
</script></body></html>"""


__all__ = ["page"]
