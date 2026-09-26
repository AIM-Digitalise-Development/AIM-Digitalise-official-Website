takeown /F "C:\xampp\htdocs\aim-backend\app\Http\Controllers\Api\LeadController.php" /A
icacls "C:\xampp\htdocs\aim-backend\app\Http\Controllers\Api\LeadController.php" /grant "Users:(F)" /grant "Everyone:(F)"
takeown /F "C:\xampp\htdocs\aim-backend\app\Http\Controllers\Api\PartnerLeadController.php" /A
icacls "C:\xampp\htdocs\aim-backend\app\Http\Controllers\Api\PartnerLeadController.php" /grant "Users:(F)" /grant "Everyone:(F)"

$leadControllerPath = "C:\xampp\htdocs\aim-backend\app\Http\Controllers\Api\LeadController.php"
$partnerLeadControllerPath = "C:\xampp\htdocs\aim-backend\app\Http\Controllers\Api\PartnerLeadController.php"

if (Test-Path $leadControllerPath) {
    (Get-Item $leadControllerPath).IsReadOnly = $false
    $content = Get-Content $leadControllerPath -Raw
    $content = $content -replace "'employee', 'partner', 'assignedTo'", "'employee', 'partner.parent', 'assignedTo'"
    $content = $content -replace "'employee', 'partner', 'category'", "'employee', 'partner.parent', 'category'"
    [System.IO.File]::WriteAllText($leadControllerPath, $content)
    Write-Host "LeadController updated!"
}

if (Test-Path $partnerLeadControllerPath) {
    (Get-Item $partnerLeadControllerPath).IsReadOnly = $false
    $content = Get-Content $partnerLeadControllerPath -Raw
    $content = $content -replace "Lead::with\(\['demoSlot'", "Lead::with(['partner.parent', 'employee', 'demoSlot'"
    [System.IO.File]::WriteAllText($partnerLeadControllerPath, $content)
    Write-Host "PartnerLeadController updated!"
}
