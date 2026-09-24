$gcPath = "C:\xampp\htdocs\aim-backend\app\Http\Controllers\Api\GeneralClientController.php"
$apiRoutesPath = "C:\xampp\htdocs\aim-backend\routes\api.php"

# Backup first
Copy-Item $gcPath "$gcPath.bak" -Force
Copy-Item $apiRoutesPath "$apiRoutesPath.bak" -Force

# Read content
$gcContent = [System.IO.File]::ReadAllText($gcPath)

# 1. Add Lead import if not present
if ($gcContent -notmatch "use App\\Models\\Lead;") {
    $gcContent = $gcContent.Replace("use App\Models\Product;", "use App\Models\Product;`r`nuse App\Models\Lead;")
}

# 2. Update getGeneralClients filtering
$oldFilter = @"
        `$sortDir = strtolower(`$request->get('sort_dir', 'desc')) === 'asc' ? 'asc' : 'desc';
        `$query = GeneralClient::withCount('quotations')->orderBy('created_at', `$sortDir);

        if (`$request->has('sold_by') && !empty(`$request->sold_by) && `$request->sold_by !== 'all') {
"@

$newFilter = @"
        `$sortDir = strtolower(`$request->get('sort_dir', 'desc')) === 'asc' ? 'asc' : 'desc';
        `$query = GeneralClient::withCount('quotations')->orderBy('created_at', `$sortDir);

        // Filter by paid quotation status
        // By default (General Clients directory page), ONLY show general clients who have at least ONE PAID quotation.
        // If 'only_unpaid' is requested (e.g. from Leads page), show clients with NO paid quotations.
        // If 'include_all' or 'include_unpaid' is requested, do not filter by quotation status.
        if (`$request->boolean('only_unpaid')) {
            `$query->whereDoesntHave('quotations', function (`$q) {
                `$q->where('status', 'paid');
            });
        } elseif (!`$request->boolean('include_all') && !`$request->boolean('include_unpaid')) {
            `$query->whereHas('quotations', function (`$q) {
                `$q->where('status', 'paid');
            });
        }

        if (`$request->has('sold_by') && !empty(`$request->sold_by) && `$request->sold_by !== 'all') {
"@

if ($gcContent.Contains($oldFilter)) {
    $gcContent = $gcContent.Replace($oldFilter, $newFilter)
} else {
    Write-Host "Warning: oldFilter pattern not found directly, checking normalized..."
    $gcContent = [regex]::Replace($gcContent, '(\$query\s*=\s*GeneralClient::withCount\(''quotations''\)->orderBy\(''created_at'',\s*\$sortDir\);)', "`$1`r`n`r`n        if (`$request->boolean('only_unpaid')) {`r`n            `$query->whereDoesntHave('quotations', function (`$q) {`r`n                `$q->where('status', 'paid');`r`n            });`r`n        } elseif (!`$request->boolean('include_all') && !`$request->boolean('include_unpaid')) {`r`n            `$query->whereHas('quotations', function (`$q) {`r`n                `$q->where('status', 'paid');`r`n            });`r`n        }")
}

# 3. Add recordPayment and getClientQuotations methods
$methodsToAdd = @"

    /**
     * POST /api/admin/quotations/{id}/record-payment
     * Record offline or manual payment against a quotation, mark it as paid, and convert the client/lead.
     */
    public function recordPayment(Request `$request, `$id)
    {
        `$quotation = GeneralClientQuotation::with(['client', 'items'])->find(`$id);

        if (!`$quotation) {
            return response()->json([
                'success' => false,
                'message' => 'Quotation not found'
            ], 404);
        }

        `$validator = Validator::make(`$request->all(), [
            'amount' => 'nullable|numeric|min:0.01',
            'payment_method' => 'nullable|string|max:100',
            'transaction_id' => 'nullable|string|max:255',
            'reference_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'paid_at' => 'nullable|date',
        ]);

        if (`$validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => `$validator->errors()
            ], 422);
        }

        `$amount = (float) `$request->input('amount', `$quotation->total_amount);
        `$method = `$request->input('payment_method', 'Bank Transfer');
        `$refNo = `$request->input('reference_number') ?: `$request->input('transaction_id') ?: ('MANUAL-' . strtoupper(Str::random(8)));
        `$paidAt = `$request->input('paid_at') ? \Carbon\Carbon::parse(`$request->input('paid_at')) : now();
        `$notes = `$request->input('notes', 'Manual payment recorded by Admin');

        // Mark quotation as paid
        `$quotation->update([
            'status' => 'paid',
            'paid_at' => `$paidAt,
            'razorpay_payment_id' => `$refNo,
        ]);

        // Promote client status
        `$client = `$quotation->client;
        if (`$client) {
            `$client->update(['status' => 'Order Closed']);

            // Sync with corresponding Lead record (so it marks as converted and disappears from leads list)
            `$phone = preg_replace('/[^0-9]/', '', `$client->contact_number ?? '');
            `$matchingLead = Lead::where(function(`$q) use (`$client, `$phone) {
                if (`$phone) {
                    `$q->where('client_phone', 'LIKE', "%{`$phone}%");
                }
                if (!empty(`$client->email)) {
                    `$q->orWhere('client_email', `$client->email);
                }
                if (!empty(`$client->client_id)) {
                    `$q->orWhere('converted_to_client_id', `$client->client_id);
                }
            })->first();

            if (`$matchingLead) {
                `$matchingLead->update([
                    'lead_status' => 'converted',
                    'is_converted' => true,
                    'conversion_date' => `$paidAt,
                    'converted_to_client_id' => `$client->client_id
                ]);
            }
        }

        // Create GeneralClientPayment entry
        `$payment = GeneralClientPayment::create([
            'quotation_id' => `$quotation->id,
            'general_client_id' => `$quotation->general_client_id,
            'razorpay_order_id' => 'MANUAL_ENTRY',
            'razorpay_payment_id' => `$refNo,
            'razorpay_signature' => 'OFFLINE_VERIFIED',
            'amount' => `$amount,
            'currency' => `$quotation->currency ?: 'INR',
            'payment_status' => 'success',
            'payment_method' => `$method,
            'notes' => json_encode([
                'notes' => `$notes,
                'reference_number' => `$refNo,
                'recorded_by' => 'Admin',
                'recorded_at' => now()->toDateTimeString()
            ])
        ]);

        // Optionally send invoice email if client has email
        try {
            if (`$client && !empty(`$client->email)) {
                Mail::to(`$client->email)->send(new GeneralClientInvoiceMail(`$quotation));
            }
        } catch (\Exception `$e) {
            Log::warning('Invoice email could not be sent after recording manual payment: ' . `$e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment recorded successfully! Quotation marked as paid and client order closed.',
            'quotation' => `$quotation->fresh(['items', 'payments', 'client']),
            'payment' => `$payment
        ]);
    }

    /**
     * GET /api/admin/general-clients/{clientId}/quotations
     * Get all quotations for a specific general client
     */
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

if ($gcContent -notmatch "function recordPayment") {
    $deleteQuotationTarget = @"
        return response()->json([
            'success' => true,
            'message' => 'Quotation deleted successfully'
        ]);
    }
"@
    $gcContent = $gcContent.Replace($deleteQuotationTarget, $deleteQuotationTarget + $methodsToAdd)
}

# 4. In verifyPublicRazorpayPayment, sync matching Lead
$oldVerifySync = @"
            if (`$quotation->client) {
                `$quotation->client->update(['status' => 'Order Closed']);
            }
"@
$newVerifySync = @"
            if (`$quotation->client) {
                `$quotation->client->update(['status' => 'Order Closed']);

                `$phone = preg_replace('/[^0-9]/', '', `$quotation->client->contact_number ?? '');
                `$matchingLead = Lead::where(function(`$q) use (`$quotation, `$phone) {
                    if (`$phone) {
                        `$q->where('client_phone', 'LIKE', "%{`$phone}%");
                    }
                    if (!empty(`$quotation->client->email)) {
                        `$q->orWhere('client_email', `$quotation->client->email);
                    }
                    if (!empty(`$quotation->client->client_id)) {
                        `$q->orWhere('converted_to_client_id', `$quotation->client->client_id);
                    }
                })->first();

                if (`$matchingLead) {
                    `$matchingLead->update([
                        'lead_status' => 'converted',
                        'is_converted' => true,
                        'conversion_date' => now(),
                        'converted_to_client_id' => `$quotation->client->client_id
                    ]);
                }
            }
"@
if ($gcContent.Contains($oldVerifySync)) {
    $gcContent = $gcContent.Replace($oldVerifySync, $newVerifySync)
}

[System.IO.File]::WriteAllText($gcPath, $gcContent)
Write-Host "GeneralClientController.php updated successfully."

# 5. Update routes/api.php
$apiContent = [System.IO.File]::ReadAllText($apiRoutesPath)

if ($apiContent -notmatch "getClientQuotations") {
    $apiContent = $apiContent.Replace("Route::post('/general-clients/{clientId}/quotations', [GeneralClientController::class, 'createQuotation']);", "Route::post('/general-clients/{clientId}/quotations', [GeneralClientController::class, 'createQuotation']);`r`n    Route::get('/general-clients/{id}/quotations', [GeneralClientController::class, 'getClientQuotations']);")
}

if ($apiContent -notmatch "quotations/\{id\}/record-payment") {
    $apiContent = $apiContent.Replace("Route::delete('/quotations/{id}', [GeneralClientController::class, 'deleteQuotation']);", "Route::delete('/quotations/{id}', [GeneralClientController::class, 'deleteQuotation']);`r`n    Route::post('/quotations/{id}/record-payment', [GeneralClientController::class, 'recordPayment']);`r`n    Route::post('/general-clients/quotations/{id}/record-payment', [GeneralClientController::class, 'recordPayment']);")
}

[System.IO.File]::WriteAllText($apiRoutesPath, $apiContent)
Write-Host "routes/api.php updated successfully."
