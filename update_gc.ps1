$path = "C:\xampp\htdocs\aim-backend\app\Http\Controllers\Api\GeneralClientController.php"

if (Test-Path $path) {
    Set-ItemProperty -Path $path -Name IsReadOnly -Value $false
}

$content = [System.IO.File]::ReadAllText($path)

# 1. Import WhatsAppService
if (-not $content.Contains("use App\Services\WhatsAppService;")) {
    $content = $content.Replace("use App\Mail\GeneralClientInvoiceMail;", "use App\Mail\GeneralClientInvoiceMail;`nuse App\Services\WhatsAppService;")
}

# 2. Employee get query filtering
$targetEmpGet = "        `$clients = `$query->get();"
# Find first occurrence in getEmployeeGeneralClients
$empAnchor = "public function getEmployeeGeneralClients"
$empIndex = $content.IndexOf($empAnchor)

if ($empIndex -ge 0) {
    $subContent = $content.Substring($empIndex)
    $targetStr = "        `$clients = `$query->get();"
    $targetPos = $subContent.IndexOf($targetStr)
    if ($targetPos -ge 0) {
        $actualIndex = $empIndex + $targetPos
        $filterCode = @"
        // Filter by paid quotation status
        if (`$request->boolean('only_unpaid')) {
            `$query->whereDoesntHave('quotations', function (`$q) {
                `$q->where('status', 'paid');
            });
        } elseif (!`$request->boolean('include_all') && !`$request->boolean('include_unpaid')) {
            `$query->whereHas('quotations', function (`$q) {
                `$q->where('status', 'paid');
            });
        }

        `$clients = `$query->get();
"@
        $content = $content.Substring(0, $actualIndex) + $filterCode + $content.Substring($actualIndex + $targetStr.Length)
    }
}

# 3. Partner get query filtering
$partnerAnchor = "public function getPartnerGeneralClients"
$partnerIndex = $content.IndexOf($partnerAnchor)

if ($partnerIndex -ge 0) {
    $subContent = $content.Substring($partnerIndex)
    $targetStr = "        `$clients = GeneralClient::with(['quotations.items', 'quotations.payments'])"
    $targetPos = $subContent.IndexOf($targetStr)
    if ($targetPos -ge 0) {
        $actualIndex = $partnerIndex + $targetPos
        $oldPartnerBlock = @"
        `$clients = GeneralClient::with(['quotations.items', 'quotations.payments'])
            ->where(function(`$q) use (`$partnerName, `$partnerId) {
                if (!empty(`$partnerId)) {
                    `$q->where('sold_by', 'LIKE', "%{`$partnerId}%");
                }
                if (!empty(`$partnerName)) {
                    `$q->orWhere('sold_by', 'LIKE', "%{`$partnerName}%");
                }
            })
            ->orderBy('id', 'desc')
            ->get();
"@
        $newPartnerBlock = @"
        `$query = GeneralClient::with(['quotations.items', 'quotations.payments'])
            ->where(function(`$q) use (`$partnerName, `$partnerId) {
                if (!empty(`$partnerId)) {
                    `$q->where('sold_by', 'LIKE', "%{`$partnerId}%");
                }
                if (!empty(`$partnerName)) {
                    `$q->orWhere('sold_by', 'LIKE', "%{`$partnerName}%");
                }
            })
            ->orderBy('id', 'desc');

        // Filter by paid quotation status
        if (`$request->boolean('only_unpaid')) {
            `$query->whereDoesntHave('quotations', function (`$q) {
                `$q->where('status', 'paid');
            });
        } elseif (!`$request->boolean('include_all') && !`$request->boolean('include_unpaid')) {
            `$query->whereHas('quotations', function (`$q) {
                `$q->where('status', 'paid');
            });
        }

        if (`$request->has('search') && !empty(`$request->search)) {
            `$s = `$request->search;
            `$query->where(function (`$sub) use (`$s) {
                `$sub->where('client_name', 'LIKE', "%{`$s}%")
                    ->orWhere('client_id', 'LIKE', "%{`$s}%")
                    ->orWhere('company_name', 'LIKE', "%{`$s}%")
                    ->orWhere('email', 'LIKE', "%{`$s}%")
                    ->orWhere('contact_number', 'LIKE', "%{`$s}%")
                    ->orWhere('state', 'LIKE', "%{`$s}%");
            });
        }

        `$clients = `$query->get();
"@
        if ($content.Contains($oldPartnerBlock)) {
            $content = $content.Replace($oldPartnerBlock, $newPartnerBlock)
        }
    }
}

# 4. WhatsApp welcome message for Employee create
$empCreateAnchor = "'sold_by' => `$soldByTag,"
if ($content.Contains($empCreateAnchor)) {
    $empCreateTarget = @"
            'status' => 'Attended',
        ]);
"@
    $empCreateReplacement = @"
            'status' => 'Attended',
        ]);

        // Automated WhatsApp welcome message via NexBotix
        try {
            `$servicesHeadline = `$swReq ? " for (" . `$swReq . ")" : "";
            `$welcomeMessage = "Hello " . `$client->client_name . ",\n\n" .
                "Thank you for reaching out to AIM Digitalise Pvt. Ltd.!\n\n" .
                "We have successfully registered your inquiry for our General Services" . `$servicesHeadline . ".\n\n" .
                "Our Core Solutions:\n" .
                "* Custom Web & E-Commerce Development\n" .
                "* Mobile Application Development (Android & iOS)\n" .
                "* Enterprise ERP, Billing & CRM Systems\n" .
                "* API Integrations & WhatsApp Business Automation\n" .
                "* Cloud Hosting & Annual Maintenance (AMC)\n\n" .
                "Our technical team will review your requirements and contact you shortly to discuss your project and schedule a live demo.\n\n" .
                "Best regards,\n" .
                "AIM Digitalise Pvt. Ltd.\n" .
                "www.aimdigitalise.com";

            `$imageUrl = env('NEXBOTIX_WELCOME_IMAGE_URL', url('Welcome-client.jpeg'));
            WhatsAppService::sendMessage(`$client->contact_number, `$welcomeMessage, `$imageUrl);
        } catch (\Exception `$e) {
            Log::warning('General Client WhatsApp welcome message failed: ' . `$e->getMessage());
        }
"@
    $content = $content.Replace($empCreateTarget, $empCreateReplacement)
}

[System.IO.File]::WriteAllText($path, $content)
Write-Host "UPDATE_GC_SUCCESS"
