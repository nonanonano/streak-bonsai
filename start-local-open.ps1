Set-Location $PSScriptRoot
Start-Process powershell -ArgumentList '-NoExit', '-ExecutionPolicy', 'Bypass', '-File', (Join-Path $PSScriptRoot 'start-local.ps1')
Start-Sleep -Seconds 2
Start-Process 'http://127.0.0.1:4173/'
