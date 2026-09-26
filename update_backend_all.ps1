$partnerModelPath = "C:\xampp\htdocs\aim-backend\app\Models\Partner.php"
$leadControllerPath = "C:\xampp\htdocs\aim-backend\app\Http\Controllers\Api\LeadController.php"
$partnerLeadControllerPath = "C:\xampp\htdocs\aim-backend\app\Http\Controllers\Api\PartnerLeadController.php"

# 1. Update Partner.php model to auto-include parent relation
if (Test-Path $partnerModelPath) {
    $c = [System.IO.File]::ReadAllText($partnerModelPath)
    if ($c -notmatch "protected\s+`$with\s*=") {
        $c = $c.Replace("protected `$table = 'partners';", "protected `$table = 'partners';`r`n`r`n    protected `$with = ['parent'];")
        try {
            [System.IO.File]::WriteAllText($partnerModelPath, $c)
            Write-Host "Updated Partner.php with protected `$with = ['parent'];"
        } catch {
            Write-Host "Error writing Partner.php: $_"
        }
    } else {
        Write-Host "Partner.php already has `$with property."
    }
}

# 2. Update LeadController.php
if (Test-Path $leadControllerPath) {
    $c = [System.IO.File]::ReadAllText($leadControllerPath)
    $c = $c.Replace("'employee', 'partner', 'assignedTo'", "'employee', 'partner.parent', 'assignedTo'")
    $c = $c.Replace("'employee', 'partner', 'category'", "'employee', 'partner.parent', 'category'")
    try {
        [System.IO.File]::WriteAllText($leadControllerPath, $c)
        Write-Host "Updated LeadController.php successfully."
    } catch {
        Write-Host "Error writing LeadController.php: $_"
    }
}

# 3. Update PartnerLeadController.php
if (Test-Path $partnerLeadControllerPath) {
    $c = [System.IO.File]::ReadAllText($partnerLeadControllerPath)
    $c = $c.Replace("Lead::with(['demoSlot'", "Lead::with(['partner.parent', 'employee', 'demoSlot'")
    try {
        [System.IO.File]::WriteAllText($partnerLeadControllerPath, $c)
        Write-Host "Updated PartnerLeadController.php successfully."
    } catch {
        Write-Host "Error writing PartnerLeadController.php: $_"
    }
}
