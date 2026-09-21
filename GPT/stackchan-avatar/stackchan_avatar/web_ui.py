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
label{display:block;font-weight:700;margin:.75rem 0 .25rem}input,select,textarea{width:100%;font:inherit;padding:.7rem;border:2px solid #999;border-radius:10px;background:white}
textarea{min-height:6rem}.row{display:flex;gap:.6rem;flex-wrap:wrap;margin-top:1rem}button{font:inherit;font-weight:700;padding:.7rem 1.05rem;border:0;border-radius:999px;background:var(--accent);color:white;cursor:pointer}
button.secondary{background:#4f6d7a}button:disabled{opacity:.45;cursor:wait}.status{padding:.65rem .8rem;border-radius:10px;background:#f1eee9}.ok{background:#dcf4df}.warn{background:#fff0c7}.error{background:#ffd9d5}
.hint{font-size:.88rem;color:var(--muted)}pre{white-space:pre-wrap;word-break:break-word;background:#201d1b;color:#f8f3eb;padding:1rem;border-radius:12px;max-height:300px;overflow:auto}.reply{white-space:pre-wrap;min-height:2rem}
</style></head><body>
<h1>スタックちゃん セットアップ</h1><p class="lead">上から順に入力すれば、PCアプリの設定とファーム書き込みができます。</p>
<div id="deviceStatus" class="status">接続状態を確認中…</div>
<div class="grid">
<section class="card"><h2>1. 会話の設定</h2>
<label for="brain">動作モード</label><select id="brain"><option value="echo">診断モード（APIキー不要）</option><option value="openai">OpenAI会話</option></select>
<label for="apiKey">OpenAI APIキー</label><input id="apiKey" type="password" autocomplete="off" placeholder="設定済みなら空欄でOK">
<p id="keyState" class="hint"></p><p class="hint">変更後は、このアプリを閉じてもう一度ダブルクリックすると反映されます。</p>
</section>
<section class="card"><h2>2. Wi-FiとPC</h2>
<label for="ssid">2.4 GHz Wi-Fi名</label><input id="ssid" autocomplete="off" placeholder="設定済みなら空欄でOK">
<label for="wifiPassword">Wi-Fiパスワード</label><input id="wifiPassword" type="password" autocomplete="off" placeholder="設定済みなら空欄でOK">
<label for="serverHost">このPCのLANアドレス</label><input id="serverHost" inputmode="decimal">
<p class="hint">通常は自動入力されます。127.0.0.1の場合はOSのネットワーク設定で確認してください。</p>
<div class="row"><button id="save">設定を保存</button></div><p id="saveResult" class="hint"></p>
</section>
</div>
<section class="card"><h2>3. USBでファームを書き込む</h2>
<label for="serialPort">スタックちゃんのUSBポート</label><select id="serialPort"><option value="">自動検出</option></select>
<div class="row"><button id="refreshPorts" class="secondary">ポート再検索</button><button id="build" class="secondary">先にビルド</button><button id="upload">本体へ書き込む</button></div>
<p class="hint">本体のベース側USB-C端子を使用し、首の周囲を空けてください。初回ビルドは数分かかります。</p>
<pre id="jobLog">まだ処理を実行していません。</pre>
</section>
<section class="card"><h2>4. 会話テスト</h2>
<textarea id="text" placeholder="スタックちゃんに話しかける"></textarea>
<div class="row"><button id="send">話す</button></div><p id="reply" class="reply"></p>
</section>
<div class="row"><button id="stopApp" class="secondary">アプリを終了</button></div>
<script>
const $=s=>document.querySelector(s);let jobRunning=false;
async function jsonFetch(url,options={}){const r=await fetch(url,options);let j={};try{j=await r.json()}catch{}if(!r.ok)throw new Error(j.detail||`HTTP ${r.status}`);return j}
async function refreshStatus(){try{const s=await jsonFetch('/api/status');$('#deviceStatus').className='status '+(s.connected_devices?'ok':'warn');$('#deviceStatus').textContent=s.connected_devices?`スタックちゃん接続中（${s.connected_devices}台）`:'スタックちゃん未接続 — 先にファームを書き込んで本体を再起動してください';}catch(e){$('#deviceStatus').textContent=e.message}}
function fillPorts(ports){const current=$('#serialPort').value;$('#serialPort').innerHTML='<option value="">自動検出</option>';for(const p of ports){const o=document.createElement('option');o.value=p.device;o.textContent=`${p.device} — ${p.description}`;$('#serialPort').append(o)}$('#serialPort').value=current}
async function refreshSetup(){try{const s=await jsonFetch('/api/setup');$('#brain').value=s.brain;if(!$('#serverHost').value)$('#serverHost').value=s.suggested_ip;$('#keyState').textContent=s.openai_key_configured?'APIキーは設定済みです。空欄なら変更しません。':'APIキーはまだ設定されていません。';fillPorts(s.serial_ports);renderJob(s.job)}catch(e){$('#saveResult').textContent=e.message}}
function setupBody(){return{brain:$('#brain').value,openai_api_key:$('#apiKey').value,wifi_ssid:$('#ssid').value,wifi_password:$('#wifiPassword').value,server_host:$('#serverHost').value,server_port:8000}}
async function save(){const r=await jsonFetch('/api/setup/save',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(setupBody())});$('#apiKey').value='';$('#wifiPassword').value='';$('#saveResult').textContent=r.restart_required?'保存しました。会話設定はアプリを再起動すると反映されます。':'保存しました。';return r}
function renderJob(job){jobRunning=job.running;for(const b of ['#build','#upload'])$(b).disabled=jobRunning;$('#jobLog').textContent=(job.log||[]).join('\\n')||'まだ処理を実行していません。';$('#jobLog').scrollTop=$('#jobLog').scrollHeight;if(jobRunning)setTimeout(pollJob,1000)}
async function pollJob(){try{renderJob(await jsonFetch('/api/firmware/job'))}catch(e){$('#jobLog').textContent=e.message}}
async function startJob(action){try{await save();if(action==='upload'&&!confirm('購入時のファームをカスタムファームに置き換えます。続けますか？'))return;const job=await jsonFetch('/api/firmware/start',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action,port:$('#serialPort').value})});renderJob(job)}catch(e){$('#jobLog').textContent=e.message}}
$('#save').onclick=()=>save().catch(e=>$('#saveResult').textContent=e.message);$('#refreshPorts').onclick=refreshSetup;$('#build').onclick=()=>startJob('build');$('#upload').onclick=()=>startJob('upload');
$('#send').onclick=async()=>{const text=$('#text').value.trim();if(!text)return;$('#reply').textContent='考え中…';try{const j=await jsonFetch('/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text,speak:true})});$('#reply').textContent=j.reply}catch(e){$('#reply').textContent=e.message}refreshStatus()};
$('#stopApp').onclick=async()=>{if(!confirm('StackChan Avatarを終了しますか？'))return;try{await jsonFetch('/api/app/stop',{method:'POST'});document.body.innerHTML='<main class="card"><h1>終了しました</h1><p>このタブを閉じてください。</p></main>'}catch(e){alert(e.message)}};
refreshStatus();refreshSetup();setInterval(refreshStatus,3000);
</script></body></html>"""


__all__ = ["page"]
