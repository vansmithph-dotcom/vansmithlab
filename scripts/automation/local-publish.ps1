$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Set-Location -LiteralPath $repo
$ready = Get-ChildItem -LiteralPath (Join-Path $repo 'automation\state') -Filter '*.json' -ErrorAction SilentlyContinue |
  Where-Object { (Get-Content -LiteralPath $_.FullName -Raw | ConvertFrom-Json).state -eq 'ready_for_publish' }
if (-not $ready) { throw 'No request has state ready_for_publish. Run npm.cmd run local:run first.' }
& "$env:ProgramFiles\nodejs\npm.cmd" run content:validate
& "$env:ProgramFiles\nodejs\npm.cmd" run lint
& "$env:ProgramFiles\nodejs\npm.cmd" test
& "$env:ProgramFiles\nodejs\npm.cmd" run build
git add -- content knowledge automation/requests automation/media-briefs automation/state
if (git diff --cached --quiet) { Write-Output 'Nothing is ready to publish.'; exit 0 }
git commit -m 'Publish verified VANSMITHLAB content'
git push origin HEAD:main
Write-Output 'Verified content was pushed to GitHub; Cloudflare deployment can now begin.'
