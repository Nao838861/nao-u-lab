Option Explicit

Dim shell
Dim fileSystem
Dim runner
Dim command
Dim exitCode

If WScript.Arguments.Count <> 1 Then
  WScript.Quit 2
End If

Set shell = CreateObject("WScript.Shell")
Set fileSystem = CreateObject("Scripting.FileSystemObject")
runner = fileSystem.GetAbsolutePathName(WScript.Arguments(0))

If Not fileSystem.FileExists(runner) Then
  WScript.Quit 3
End If

' Window style 0 keeps cmd.exe and all console children hidden. Waiting for the
' runner preserves Task Scheduler's IgnoreNew behavior and propagates its exit code.
command = shell.ExpandEnvironmentStrings("%ComSpec%") & _
  " /D /S /C " & Chr(34) & Chr(34) & runner & Chr(34) & Chr(34)
exitCode = shell.Run(command, 0, True)
WScript.Quit exitCode
