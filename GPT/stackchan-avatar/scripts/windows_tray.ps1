param([int]$Port = 8000)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$mutex = New-Object System.Threading.Mutex($false, "Local\StackChanTray-$Port")
$owned = $false
try { $owned = $mutex.WaitOne(0) } catch [System.Threading.AbandonedMutexException] { $owned = $true }
if (!$owned) { $mutex.Dispose(); exit }
$notify = $null
$menu = $null
$timer = $null
try {
    $control = Join-Path $PSScriptRoot 'windows_resident.ps1'
    function Invoke-Control([string]$Action) {
        $arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$control`" -Action $Action"
        Start-Process "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -ArgumentList $arguments -WindowStyle Hidden
    }
    [System.Windows.Forms.Application]::EnableVisualStyles()
    $context = New-Object System.Windows.Forms.ApplicationContext
    $notify = New-Object System.Windows.Forms.NotifyIcon
    $notify.Icon = [System.Drawing.SystemIcons]::Application
    $notify.Text = 'StackChan'
    $menu = New-Object System.Windows.Forms.ContextMenuStrip
    $statusItem = $menu.Items.Add('StackChan')
    $statusItem.Enabled = $false
    $openItem = $menu.Items.Add('操作画面を開く')
    $openItem.add_Click({ Invoke-Control 'Open' })
    $restartItem = $menu.Items.Add('サーバを再起動')
    $restartItem.add_Click({ Invoke-Control 'Restart' })
    $stopItem = $menu.Items.Add('サーバを停止')
    $stopItem.add_Click({ Invoke-Control 'Stop' })
    [void]$menu.Items.Add((New-Object System.Windows.Forms.ToolStripSeparator))
    $exitItem = $menu.Items.Add('アイコンを終了（サーバは継続）')
    $exitItem.add_Click({ $context.ExitThread() })
    $notify.ContextMenuStrip = $menu
    $notify.add_DoubleClick({ Invoke-Control 'Open' })
    $notify.Visible = $true
    $timer = New-Object System.Windows.Forms.Timer
    $timer.Interval = 5000
    $timer.add_Tick({
        try {
            $status = Invoke-RestMethod "http://127.0.0.1:$Port/api/status" -TimeoutSec 1
            if (!$status.ok -or $null -eq $status.connected_devices) { throw 'Not ready' }
            $notify.Text = "StackChan: 稼働中（$($status.connected_devices)台接続）"
        } catch { $notify.Text = 'StackChan: サーバ停止中' }
        $statusItem.Text = $notify.Text
    })
    $timer.Start()
    [System.Windows.Forms.Application]::Run($context)
} finally {
    if ($timer) { $timer.Stop(); $timer.Dispose() }
    if ($notify) { $notify.Visible = $false; $notify.Dispose() }
    if ($menu) { $menu.Dispose() }
    $mutex.ReleaseMutex()
    $mutex.Dispose()
}
