$leadPath = "C:\xampp\htdocs\aim-backend\app\Http\Controllers\Api\LeadController.php"
$partnerPath = "C:\xampp\htdocs\aim-backend\app\Http\Controllers\Api\PartnerLeadController.php"

if (Test-Path $leadPath) {
    $c = [System.IO.File]::ReadAllText($leadPath)
    $c = $c.Replace("'employee', 'partner', 'assignedTo'", "'employee', 'partner.parent', 'assignedTo'")
    $c = $c.Replace("'employee', 'partner', 'category'", "'employee', 'partner.parent', 'category'")
    [System.IO.File]::WriteAllText($leadPath, $c)
    Write-Host "LeadController.php updated successfully!"
}

if (Test-Path $partnerPath) {
    $c = [System.IO.File]::ReadAllText($partnerPath)
    $c = $c.Replace("Lead::with(['demoSlot'", "Lead::with(['partner.parent', 'employee', 'demoSlot'")
    [System.IO.File]::WriteAllText($partnerPath, $c)
    Write-Host "PartnerLeadController.php updated successfully!"
}
