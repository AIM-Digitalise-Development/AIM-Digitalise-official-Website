$gcPath = "C:\xampp\htdocs\aim-backend\app\Http\Controllers\Api\GeneralClientController.php"
$c = [System.IO.File]::ReadAllText($gcPath)

# 1. Update getClientQuotations to support numeric ID, AIMGC code, or gc- ID
$oldGetClientQuotations = @"
    public function getClientQuotations(`$clientId)
    {
        `$quotations = GeneralClientQuotation::with(['items', 'payments', 'client'])
            ->where('general_client_id', `$clientId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => `$quotations
        ]);
    }
"@

$newGetClientQuotations = @"
    public function getClientQuotations(`$clientId)
    {
        `$numericId = `$clientId;
        if (is_string(`$clientId) && str_starts_with(`$clientId, 'gc-')) {
            `$numericId = (int) str_replace('gc-', '', `$clientId);
        }

        `$client = GeneralClient::where('id', `$numericId)
            ->orWhere('client_id', `$clientId)
            ->first();

        `$gcId = `$client ? `$client->id : `$numericId;

        `$quotations = GeneralClientQuotation::with(['items', 'payments', 'client'])
            ->where('general_client_id', `$gcId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => `$quotations
        ]);
    }
"@

if ($c.Contains($oldGetClientQuotations)) {
    $c = $c.Replace($oldGetClientQuotations, $newGetClientQuotations)
}

# 2. Update getGeneralClientDetails as well for robustness
$oldGetDetails = @"
    public function getGeneralClientDetails(`$id)
    {
        `$client = GeneralClient::with(['quotations.items', 'quotations.payments'])->find(`$id);
"@

$newGetDetails = @"
    public function getGeneralClientDetails(`$id)
    {
        `$numericId = `$id;
        if (is_string(`$id) && str_starts_with(`$id, 'gc-')) {
            `$numericId = (int) str_replace('gc-', '', `$id);
        }

        `$client = GeneralClient::with(['quotations.items', 'quotations.payments'])
            ->where('id', `$numericId)
            ->orWhere('client_id', `$id)
            ->first();
"@

if ($c.Contains($oldGetDetails)) {
    $c = $c.Replace($oldGetDetails, $newGetDetails)
}

[System.IO.File]::WriteAllText($gcPath, $c)
Write-Host "Updated GeneralClientController.php with ID lookup fix."
