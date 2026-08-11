$ErrorActionPreference = 'Stop'

$source = 'https://puntajes.admision.uni.edu.pe/resultados-admision-aptitud-academica-humanidades-20260810.json?v=20260810-1'
$repo = Split-Path -Parent $PSScriptRoot
$target = Join-Path $repo 'admission-2026-2-exam1-data.js'
$summaryTarget = Join-Path $repo 'admission-2026-2-exam1-summary.js'

$client = New-Object System.Net.WebClient
$client.Headers.Add('User-Agent', 'Mozilla/5.0')
$bytes = $client.DownloadData($source)
$json = [System.Text.Encoding]::UTF8.GetString($bytes)
$sourceRows = $json | ConvertFrom-Json

$rows = New-Object System.Collections.Generic.List[object]
$present = New-Object System.Collections.Generic.List[object]
foreach ($item in $sourceRows) {
  $raw = ([string]$item.puntaje).Trim()
  $score = $null
  if ($raw -ne 'AUSENTE') {
    $score = [double]::Parse($raw.Replace(',', '.'), [Globalization.CultureInfo]::InvariantCulture)
  }
  $row = [pscustomobject]@{
    code = ([string]$item.codigo).Trim()
    name = ([string]$item.nombres).Trim()
    exam1 = $score
    exam2 = $null
    exam3 = $null
  }
  $rows.Add($row)
  if ($null -ne $score) { $present.Add($row) }
}

$ranked = @($present | Sort-Object @{ Expression = 'exam1'; Descending = $true }, code)
$rankByCode = @{}
for ($i = 0; $i -lt $ranked.Count; $i++) { $rankByCode[$ranked[$i].code] = $i + 1 }
foreach ($row in $rows) {
  $row | Add-Member -NotePropertyName rank -NotePropertyValue $(if ($null -ne $row.exam1) { $rankByCode[$row.code] } else { $null })
}

$scores = @($present | ForEach-Object { [double]$_.exam1 })
$mean = ($scores | Measure-Object -Average).Average
$sumSquares = 0.0
foreach ($score in $scores) { $sumSquares += [Math]::Pow($score - $mean, 2) }
$sdPopulation = [Math]::Sqrt($sumSquares / $scores.Count)
$sortedAsc = @($present | Sort-Object exam1, code)
$sortedDesc = @($present | Sort-Object @{ Expression = 'exam1'; Descending = $true }, code)

$bins = New-Object System.Collections.Generic.List[object]
for ($low = 0; $low -lt 600; $low += 50) {
  $high = $low + 50
  $count = if ($high -eq 600) {
    @($scores | Where-Object { $_ -ge $low -and $_ -le $high }).Count
  } else {
    @($scores | Where-Object { $_ -ge $low -and $_ -lt $high }).Count
  }
  $bins.Add([pscustomobject]@{ low = $low; high = $high; count = $count })
}

$scoreFrequencies = @($scores | Group-Object | ForEach-Object {
  [pscustomobject]@{
    score = [double]::Parse($_.Name.Replace(',', '.'), [Globalization.CultureInfo]::InvariantCulture)
    count = $_.Count
  }
} | Sort-Object score)

$payload = [ordered]@{
  process = 'Admision UNI 2026-2'
  exam = 'Primera prueba: Aptitud Academica y Humanidades'
  publishedAt = '2026-08-10'
  source = $source
  examMax = 600
  totalMax = 1800
  completedExams = 1
  stats = [ordered]@{
    registered = $rows.Count
    present = $present.Count
    absent = $rows.Count - $present.Count
    mean = [Math]::Round($mean, 3)
    standardDeviationPopulation = [Math]::Round($sdPopulation, 3)
    minimum = [double]$sortedAsc[0].exam1
    maximum = [double]$sortedDesc[0].exam1
    minimumStudent = [ordered]@{ code = $sortedAsc[0].code; name = $sortedAsc[0].name; score = [double]$sortedAsc[0].exam1 }
    maximumStudent = [ordered]@{ code = $sortedDesc[0].code; name = $sortedDesc[0].name; score = [double]$sortedDesc[0].exam1 }
    bins = $bins
  }
  rows = @($rows | Sort-Object @{ Expression = { if ($null -eq $_.rank) { [int]::MaxValue } else { $_.rank } }; Descending = $false }, code)
}

$encoded = $payload | ConvertTo-Json -Depth 8 -Compress
$output = "window.UNIVERSE_ADMISSION_2026_2=$encoded;`n"
[System.IO.File]::WriteAllText($target, $output, (New-Object System.Text.UTF8Encoding($false)))

$summaryPayload = [ordered]@{
  process = $payload.process
  exam = $payload.exam
  publishedAt = $payload.publishedAt
  source = $payload.source
  examMax = $payload.examMax
  totalMax = $payload.totalMax
  completedExams = $payload.completedExams
  stats = $payload.stats
  scoreFrequencies = $scoreFrequencies
}
$summaryEncoded = $summaryPayload | ConvertTo-Json -Depth 8 -Compress
[System.IO.File]::WriteAllText($summaryTarget, "window.UNIVERSE_ADMISSION_2026_2=$summaryEncoded;`n", (New-Object System.Text.UTF8Encoding($false)))

Write-Host "Generated $target"
Write-Host "Generated $summaryTarget"
Write-Host "Rows: $($rows.Count) | Present: $($present.Count) | Absent: $($rows.Count - $present.Count)"
Write-Host "Mean: $([Math]::Round($mean,3)) | SD: $([Math]::Round($sdPopulation,3)) | Min: $($sortedAsc[0].exam1) | Max: $($sortedDesc[0].exam1)"
