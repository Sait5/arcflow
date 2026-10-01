param([string]$BaseUrl = 'http://127.0.0.1:5174')
$ErrorActionPreference = 'Stop'
$browser = Join-Path $PSScriptRoot '../node_modules/.bin/agent-browser.cmd'
$env:AGENT_BROWSER_HOME = Join-Path $PSScriptRoot '../.browser'
function AB {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
  & $browser --session arcflow-qa @Arguments
  if ($LASTEXITCODE -ne 0) { throw "Browser command failed: $Arguments" }
}
function Assert-JS([string]$Code) {
  $Code | & $browser --session arcflow-qa eval --stdin
  if ($LASTEXITCODE -ne 0) { throw 'Browser assertion failed' }
}
New-Item -ItemType Directory -Path (Join-Path $PSScriptRoot '../artifacts') -Force | Out-Null
AB open "$BaseUrl/"
Assert-JS "localStorage.removeItem('arcflow-issues'); true"
AB open "$BaseUrl/"
AB wait 1500
Assert-JS "if (!document.querySelector('.hero-copy') || document.querySelector('vite-error-overlay')) throw Error('Landing not rendered'); 'Landing renders'"
AB set viewport 375 812
AB find role button click --name 'Open menu'
Assert-JS "if (!document.getElementById('mobile-nav')) throw Error('Mobile menu failed'); 'Mobile navigation opens'"
AB find role button click --name 'Close menu'
AB find role link click --name 'Explore workspace'
AB wait '.dashboard-full'
AB find role button click --name 'Open workspace menu'
Assert-JS "if (!document.querySelector('.sidebar-container.opened')) throw Error('Workspace drawer failed'); 'Mobile sidebar opens'"
AB find role button click --name 'My issues'
Assert-JS "if(document.querySelectorAll('.issue-row').length !== 3) throw Error('My issues filter failed'); 'My issues filters correctly'"
AB set viewport 1440 1080
AB click '.workspace-name'
AB fill '.task-search input' 'onboarding'
Assert-JS "if(document.querySelectorAll('.issue-row').length !== 1) throw Error('Search failed'); 'Task search works'"
AB click '.issue-row'
AB wait '.drawer-panel'
AB select '.select-with-icon select' 'Review'
AB select '.detail-properties > label:nth-child(2) select' 'Urgent'
Assert-JS "const saved=JSON.parse(localStorage.getItem('arcflow-issues')); const issue=saved.find(i=>i.id==='ARC-128'); if(issue.status!=='Review'||issue.priority!=='Urgent') throw Error('Issue edit failed'); 'Status and priority persist'"
AB press Escape
Assert-JS "if(document.querySelector('[role=dialog]') || document.getElementById('app').inert) throw Error('Modal close failed'); 'Escape closes and restores background'"
AB fill '.task-search input' ''
AB select '.project-filter select' 'mobile'
Assert-JS "if(document.querySelectorAll('.issue-row').length!==2) throw Error('Project filter failed'); 'Project filtering works'"
AB select '.project-filter select' 'all'
AB select '.filter-control select' 'Done'
Assert-JS "if(document.querySelectorAll('.issue-row').length!==1) throw Error('Status filter failed'); 'Status filtering works'"
AB select '.filter-control select' 'all'
AB find role button click --name 'Board view'
Assert-JS "if(document.querySelectorAll('.kanban-column').length!==5) throw Error('Board failed'); 'Board view works'"
AB find role button click --name 'List view'
AB press Control+k
AB wait '.command-search input'
Assert-JS "if(document.activeElement!==document.querySelector('.command-search input')) throw Error('Initial focus failed'); 'Palette receives keyboard focus'"
AB fill '.command-search input' 'priority'
Assert-JS "if(document.querySelectorAll('.command-options > button').length!==1) throw Error('Command search failed'); 'Command search works'"
AB press Enter
AB wait 100
AB press ArrowDown
AB press Enter
AB press Escape
AB press Control+k
AB fill '.command-search input' 'Create issue'
AB press Enter
AB fill '.command-search input' 'QA: release readiness'
AB press Enter
AB wait '.drawer-panel'
Assert-JS "if(!document.querySelector('.issue-detail h2').textContent.includes('QA: release readiness')) throw Error('Command issue creation failed'); 'Command creates an issue'"
AB press Escape
AB find role button click --name 'Projects' --exact
Assert-JS "if(document.querySelectorAll('.project-overview-card').length!==3) throw Error('Project overview failed'); 'Project overview renders'"
AB click '.project-overview-card'
Assert-JS "if(!document.querySelector('.dashboard-title h1').textContent.includes('Website v2')) throw Error('Project navigation failed'); 'Project navigation works'"
AB click '.workspace-name'
AB find role button click --name 'New issue'
AB fill '.create-form input' 'QA: keyboard review'
AB click '.create-form button'
AB wait '.drawer-panel'
Assert-JS "if(!document.querySelector('.issue-detail h2').textContent.includes('QA: keyboard review')) throw Error('Issue creation failed'); 'New issue form works'"
AB press Tab
Assert-JS "if(!document.activeElement.closest('[role=dialog]')) throw Error('Focus escaped dialog'); 'Dialog focus remains inside'"
AB press Escape
Assert-JS "localStorage.removeItem('arcflow-issues'); 'Reset demo data before responsive checks'"
foreach ($width in @(1440, 1024, 768, 430, 375)) {
  AB set viewport $width 900
  foreach ($route in @('/', '/workspace')) {
    AB open "$BaseUrl$route"
    AB wait 1200
    Assert-JS "if(document.documentElement.scrollWidth>innerWidth) throw Error('Horizontal overflow at $width $route'); if(document.querySelector('vite-error-overlay')) throw Error('Vite overlay'); 'No horizontal overflow: $width $route'"
  }
}
AB set viewport 375 812
AB open "$BaseUrl/"
AB wait 1500
AB screenshot (Join-Path $PSScriptRoot '../artifacts/home-mobile.png')
AB open "$BaseUrl/workspace"
AB wait 400
AB screenshot (Join-Path $PSScriptRoot '../artifacts/workspace-mobile.png')
AB set viewport 1440 1080
AB open "$BaseUrl/"
AB wait 1500
AB screenshot (Join-Path $PSScriptRoot '../artifacts/home-desktop.png')
AB scroll down 850
AB wait 750
AB scroll down 750
AB wait 750
AB scroll down 750
AB wait 750
AB scroll down 750
AB wait 750
AB scroll up 10000
AB wait 400
AB screenshot --full (Join-Path $PSScriptRoot '../artifacts/home-full.png')
AB errors
AB console
Assert-JS "localStorage.removeItem('arcflow-issues'); 'QA data cleared'"
AB close
Write-Output 'PASS: routes, mobile menus, issues, filters, command menu, keyboard focus, persistence, and five responsive sizes.'
