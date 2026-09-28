import os
import stat

path = r"C:\xampp\htdocs\aim-backend\app\Http\Controllers\Api\GeneralClientController.php"

if os.path.exists(path):
    try:
        os.chmod(path, stat.S_IWRITE | stat.S_IREAD)
    except Exception as e:
        print(f"chmod error: {e}")

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add WhatsAppService import if missing
if "use App\\Services\\WhatsAppService;" not in content:
    content = content.replace("use App\\Mail\\GeneralClientInvoiceMail;", "use App\\Mail\\GeneralClientInvoiceMail;\nuse App\\Services\\WhatsAppService;")

# 2. Update getEmployeeGeneralClients with quotation status filter
old_emp_get = """        $query = GeneralClient::withCount('quotations')
            ->where(function ($q) use ($employeeName, $employeeId) {
                $q->where('sold_by', 'LIKE', "%{$employeeName}%")
                  ->orWhere('sold_by', 'LIKE', "%{$employeeId}%");
            })
            ->orderBy('id', 'desc');

        if ($request->has('search') && !empty($request->search)) {"""

new_emp_get = """        $query = GeneralClient::withCount('quotations')
            ->where(function ($q) use ($employeeName, $employeeId) {
                $q->where('sold_by', 'LIKE', "%{$employeeName}%")
                  ->orWhere('sold_by', 'LIKE', "%{$employeeId}%");
            })
            ->orderBy('id', 'desc');

        // Filter by paid quotation status
        if ($request->boolean('only_unpaid')) {
            $query->whereDoesntHave('quotations', function ($q) {
                $q->where('status', 'paid');
            });
        } elseif (!$request->boolean('include_all') && !$request->boolean('include_unpaid')) {
            $query->whereHas('quotations', function ($q) {
                $q->where('status', 'paid');
            });
        }

        if ($request->has('search') && !empty($request->search)) {"""

content = content.replace(old_emp_get, new_emp_get)

# 3. Update createEmployeeGeneralClient with WhatsApp welcome message
old_emp_create = """        $client = GeneralClient::create([
            'client_id' => $clientId,
            'client_name' => $request->client_name,
            'company_name' => $request->company_name,
            'email' => $request->email ?: 'client_' . time() . '@nexgn.in',
            'contact_number' => $request->contact_number,
            'alt_contact_number' => $request->alt_contact_number,
            'address' => $request->address,
            'district' => $request->district,
            'state' => $request->state,
            'pin_code' => $request->pin_code,
            'country_code' => $countryCode,
            'gst_type' => $request->input('gst_type', 'Intra-State'),
            'gstin' => $request->gstin,
            'lead_source' => $request->lead_source,
            'referred_by' => $request->referred_by,
            'sold_by' => $soldByTag,
            'software_requirements' => $swReq,
            'next_followup_date' => $request->next_followup_date,
            'status' => 'Attended',
        ]);"""

new_emp_create = """        $client = GeneralClient::create([
            'client_id' => $clientId,
            'client_name' => $request->client_name,
            'company_name' => $request->company_name,
            'email' => $request->email ?: 'client_' . time() . '@nexgn.in',
            'contact_number' => $request->contact_number,
            'alt_contact_number' => $request->alt_contact_number,
            'address' => $request->address,
            'district' => $request->district,
            'state' => $request->state,
            'pin_code' => $request->pin_code,
            'country_code' => $countryCode,
            'gst_type' => $request->input('gst_type', 'Intra-State'),
            'gstin' => $request->gstin,
            'lead_source' => $request->lead_source,
            'referred_by' => $request->referred_by,
            'sold_by' => $soldByTag,
            'software_requirements' => $swReq,
            'next_followup_date' => $request->next_followup_date,
            'status' => 'Attended',
        ]);

        // Automated WhatsApp welcome message via NexBotix
        try {
            $servicesHeadline = $swReq ? " for (" . $swReq . ")" : "";
            $welcomeMessage = "Hello " . $client->client_name . ",\n\n" \
                . "Thank you for reaching out to AIM Digitalise Pvt. Ltd.!\n\n" \
                . "We have successfully registered your inquiry for our General Services" . $servicesHeadline . ".\n\n" \
                . "Our Core Solutions:\n" \
                . "* Custom Web & E-Commerce Development\n" \
                . "* Mobile Application Development (Android & iOS)\n" \
                . "* Enterprise ERP, Billing & CRM Systems\n" \
                . "* API Integrations & WhatsApp Business Automation\n" \
                . "* Cloud Hosting & Annual Maintenance (AMC)\n\n" \
                . "Our technical team will review your requirements and contact you shortly to discuss your project and schedule a live demo.\n\n" \
                . "Best regards,\n" \
                . "AIM Digitalise Pvt. Ltd.\n" \
                . "www.aimdigitalise.com";

            $imageUrl = env('NEXBOTIX_WELCOME_IMAGE_URL', url('Welcome-client.jpeg'));
            WhatsAppService::sendMessage($client->contact_number, $welcomeMessage, $imageUrl);
        } catch (\\Exception $e) {
            Log::warning('Employee General Client WhatsApp welcome message failed: ' . $e->getMessage());
        }"""

content = content.replace(old_emp_create, new_emp_create)

# 4. Update getPartnerGeneralClients with quotation status filter
old_partner_get = """        $clients = GeneralClient::with(['quotations.items', 'quotations.payments'])
            ->where(function($q) use ($partnerName, $partnerId) {
                if (!empty($partnerId)) {
                    $q->where('sold_by', 'LIKE', "%{$partnerId}%");
                }
                if (!empty($partnerName)) {
                    $q->orWhere('sold_by', 'LIKE', "%{$partnerName}%");
                }
            })
            ->orderBy('id', 'desc')
            ->get();"""

new_partner_get = """        $query = GeneralClient::with(['quotations.items', 'quotations.payments'])
            ->where(function($q) use ($partnerName, $partnerId) {
                if (!empty($partnerId)) {
                    $q->where('sold_by', 'LIKE', "%{$partnerId}%");
                }
                if (!empty($partnerName)) {
                    $q->orWhere('sold_by', 'LIKE', "%{$partnerName}%");
                }
            })
            ->orderBy('id', 'desc');

        // Filter by paid quotation status
        if ($request->boolean('only_unpaid')) {
            $query->whereDoesntHave('quotations', function ($q) {
                $q->where('status', 'paid');
            });
        } elseif (!$request->boolean('include_all') && !$request->boolean('include_unpaid')) {
            $query->whereHas('quotations', function ($q) {
                $q->where('status', 'paid');
            });
        }

        if ($request->has('search') && !empty($request->search)) {
            $s = $request->search;
            $query->where(function ($sub) use ($s) {
                $sub->where('client_name', 'LIKE', "%{$s}%")
                    ->orWhere('client_id', 'LIKE', "%{$s}%")
                    ->orWhere('company_name', 'LIKE', "%{$s}%")
                    ->orWhere('email', 'LIKE', "%{$s}%")
                    ->orWhere('contact_number', 'LIKE', "%{$s}%")
                    ->orWhere('state', 'LIKE', "%{$s}%");
            });
        }

        $clients = $query->get();"""

content = content.replace(old_partner_get, new_partner_get)

# 5. Update createPartnerGeneralClient with WhatsApp welcome message
old_partner_create = """        $client = GeneralClient::create([
            'client_id' => $clientId,
            'client_name' => $request->client_name,
            'company_name' => $request->company_name,
            'email' => $request->email ?: 'partner_client_' . time() . '@nexgn.in',
            'contact_number' => $request->contact_number,
            'alt_contact_number' => $request->alt_contact_number,
            'address' => $request->address,
            'district' => $request->district,
            'state' => $request->state,
            'pin_code' => $request->pin_code,
            'country_code' => $countryCode,
            'gst_type' => $request->input('gst_type', 'Intra-State'),
            'gstin' => $request->gstin,
            'lead_source' => $request->lead_source,
            'referred_by' => $request->referred_by,
            'sold_by' => $soldByTag,
            'software_requirements' => $swReq,
            'next_followup_date' => $request->next_followup_date,
            'status' => 'Attended',
        ]);"""

new_partner_create = """        $client = GeneralClient::create([
            'client_id' => $clientId,
            'client_name' => $request->client_name,
            'company_name' => $request->company_name,
            'email' => $request->email ?: 'partner_client_' . time() . '@nexgn.in',
            'contact_number' => $request->contact_number,
            'alt_contact_number' => $request->alt_contact_number,
            'address' => $request->address,
            'district' => $request->district,
            'state' => $request->state,
            'pin_code' => $request->pin_code,
            'country_code' => $countryCode,
            'gst_type' => $request->input('gst_type', 'Intra-State'),
            'gstin' => $request->gstin,
            'lead_source' => $request->lead_source,
            'referred_by' => $request->referred_by,
            'sold_by' => $soldByTag,
            'software_requirements' => $swReq,
            'next_followup_date' => $request->next_followup_date,
            'status' => 'Attended',
        ]);

        // Automated WhatsApp welcome message via NexBotix
        try {
            $servicesHeadline = $swReq ? " for (" . $swReq . ")" : "";
            $welcomeMessage = "Hello " . $client->client_name . ",\n\n" \
                . "Thank you for reaching out to AIM Digitalise Pvt. Ltd.!\n\n" \
                . "We have successfully registered your inquiry for our General Services" . $servicesHeadline . ".\n\n" \
                . "Our Core Solutions:\n" \
                . "* Custom Web & E-Commerce Development\n" \
                . "* Mobile Application Development (Android & iOS)\n" \
                . "* Enterprise ERP, Billing & CRM Systems\n" \
                . "* API Integrations & WhatsApp Business Automation\n" \
                . "* Cloud Hosting & Annual Maintenance (AMC)\n\n" \
                . "Our technical team will review your requirements and contact you shortly to discuss your project and schedule a live demo.\n\n" \
                . "Best regards,\n" \
                . "AIM Digitalise Pvt. Ltd.\n" \
                . "www.aimdigitalise.com";

            $imageUrl = env('NEXBOTIX_WELCOME_IMAGE_URL', url('Welcome-client.jpeg'));
            WhatsAppService::sendMessage($client->contact_number, $welcomeMessage, $imageUrl);
        } catch (\\Exception $e) {
            Log::warning('Partner General Client WhatsApp welcome message failed: ' . $e->getMessage());
        }"""

content = content.replace(old_partner_create, new_partner_create)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("GeneralClientController.php updated successfully!")
