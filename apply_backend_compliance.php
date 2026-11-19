<?php
$filePath = 'C:/xampp/htdocs/aim-backend/app/Http/Controllers/Api/GeneralClientController.php';
$content = file_get_contents($filePath);

$target = '        // Fetch Purchases (Purchase TDS / Bills with uploaded document)';

$addition = <<<'PHP'
        // Fetch SaaS & Subscription Clients Processing Fees (including Nepali & International Clients)
        try {
            $clientOrders = \Illuminate\Support\Facades\DB::table('client_orders')
                ->where('payment_status', 'paid')
                ->orderBy('activated_at', 'desc')
                ->orderBy('id', 'desc')
                ->get();

            foreach ($clientOrders as $co) {
                $isNepal = (strtoupper($co->country_code ?? '') === 'NP' || str_starts_with($co->client_id ?? '', 'AIMNP'));
                $invNo = $co->invoice_id ?: ($co->payment_id ?: ('INV-PF-' . $co->client_id));
                $invAmt = (float)($co->processing_fee ?: ($co->paid_amount ?: ($isNepal ? 2034 : 1180)));
                $recAmt = (float)($co->paid_amount ?: $invAmt);
                $baseAmt = (float)($co->base_amount ?: round($invAmt / 1.18, 2));
                $taxAmt = round($invAmt - $baseAmt, 2);
                $invDate = $co->activated_at ? substr($co->activated_at, 0, 10) : ($co->created_at ? substr($co->created_at, 0, 10) : date('Y-m-d'));
                $schoolOrCompany = $co->school_name ?: ($co->company_name ?: $co->client_name);

                $tdsRecords[] = [
                    'record_type' => $isNepal ? 'nepal_client_order' : 'saas_processing_fee',
                    'invoice_category' => $isNepal ? 'nepal' : 'processing_fee',
                    'id' => 'PF-' . $co->id,
                    'client_order_id' => $co->id,
                    'quotation_id' => null,
                    'quotation_number' => $co->order_id ?: ($co->payment_id ?: ('REG-' . $co->client_id)),
                    'quotation_date' => $invDate,
                    'invoice_number' => $invNo,
                    'invoice_date' => $invDate,
                    'client' => [
                        'id' => $co->id,
                        'client_id' => $co->client_id,
                        'client_name' => $co->client_name,
                        'company_name' => $schoolOrCompany,
                        'school_name' => $co->school_name,
                        'contact_number' => $co->contact_number,
                        'email' => $co->email,
                        'gstin' => $co->gstin ?: ($co->vat_pan_number ?: ''),
                        'vat_pan_number' => $co->vat_pan_number,
                        'country_code' => $co->country_code ?: ($isNepal ? 'NP' : 'IN'),
                        'address' => $co->address ?: ($co->district ? "{$co->district}, {$co->state}" : ''),
                    ],
                    'client_id' => $co->client_id,
                    'client_name' => $co->client_name,
                    'company_name' => $schoolOrCompany,
                    'client_reg_date' => $co->created_at ? substr($co->created_at, 0, 10) : $invDate,
                    'total_amount' => $invAmt,
                    'total_received' => $recAmt,
                    'total_tds' => 0,
                    'total_settled' => $recAmt,
                    'due_amount' => max(0, $invAmt - $recAmt),
                    'is_paid' => true,
                    'status' => 'paid',
                    'items' => [
                        (object)[
                            'item_name' => ($isNepal ? 'Nepali Client Onboarding & Setup Fee (' : 'Software Processing Fee (') . ($co->product_name ?: 'SaaS Platform') . ')',
                            'product_name' => ($isNepal ? 'Nepali Client Onboarding & Setup Fee (' : 'Software Processing Fee (') . ($co->product_name ?: 'SaaS Platform') . ')',
                            'description' => 'Database configuration, server registration and platform activation for ' . $schoolOrCompany,
                            'quantity' => 1,
                            'qty' => 1,
                            'rate' => $baseAmt,
                            'price' => $baseAmt,
                            'selling_price' => $baseAmt,
                            'amount' => $baseAmt,
                            'hsn_code' => '998313',
                            'hsn_sac' => '998313',
                            'tax_rate' => (float)($co->tax_rate ?: 18),
                            'tax_amount' => $taxAmt,
                            'total_amount' => $invAmt,
                        ]
                    ],
                    'payments' => [
                        (object)[
                            'amount' => $recAmt,
                            'payment_date' => $invDate,
                            'payment_status' => 'success',
                            'payment_method' => $co->payment_gateway ?: 'Online/Offline',
                            'transaction_id' => $co->payment_id,
                            'tds_amount' => 0
                        ]
                    ],
                    'raw_order' => $co,
                    'created_at' => $co->created_at,
                ];
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error appending SaaS client orders to compliance list: ' . $e->getMessage());
        }

        // Fetch SaaS & Subscription Recurring Cycle Payments
        try {
            $subPayments = \Illuminate\Support\Facades\DB::table('subscription_payments')
                ->where('payment_status', 'paid')
                ->orderBy('payment_date', 'desc')
                ->orderBy('id', 'desc')
                ->get();

            foreach ($subPayments as $sub) {
                $clientOrder = \Illuminate\Support\Facades\DB::table('client_orders')
                    ->where('id', $sub->client_id)
                    ->orWhere('client_id', $sub->client_display_id)
                    ->first();

                $isNepal = $clientOrder && (strtoupper($clientOrder->country_code ?? '') === 'NP' || str_starts_with($clientOrder->client_id ?? '', 'AIMNP'));
                $invNo = $sub->invoice_id ?: ($sub->payment_id ?: ('INV-SUB-' . $sub->id));
                $invDate = $sub->payment_date ? substr($sub->payment_date, 0, 10) : ($sub->created_at ? substr($sub->created_at, 0, 10) : date('Y-m-d'));
                $totAmt = (float)$sub->amount;
                $baseAmt = round($totAmt / 1.18, 2);
                $taxAmt = round($totAmt - $baseAmt, 2);
                $cycleName = ucfirst($sub->cycle ?: 'annual');
                $clientId = $sub->client_display_id ?: ($clientOrder ? $clientOrder->client_id : 'AIM-SUB');
                $clientName = $clientOrder ? $clientOrder->client_name : 'Subscription Client';
                $schoolOrCompany = $clientOrder ? ($clientOrder->school_name ?: $clientOrder->company_name ?: $clientOrder->client_name) : 'Subscription Client';

                $tdsRecords[] = [
                    'record_type' => $isNepal ? 'nepal_subscription' : 'saas_subscription',
                    'invoice_category' => $isNepal ? 'nepal' : 'subscription',
                    'id' => 'SUB-' . $sub->id,
                    'subscription_payment_id' => $sub->id,
                    'quotation_id' => null,
                    'quotation_number' => strtoupper($sub->cycle ?: 'SUB') . ' (' . ($sub->months_paid ?: 1) . 'M)',
                    'quotation_date' => $invDate,
                    'invoice_number' => $invNo,
                    'invoice_date' => $invDate,
                    'client' => [
                        'id' => $clientOrder ? $clientOrder->id : $sub->client_id,
                        'client_id' => $clientId,
                        'client_name' => $clientName,
                        'company_name' => $schoolOrCompany,
                        'school_name' => $clientOrder ? $clientOrder->school_name : '',
                        'contact_number' => $clientOrder ? $clientOrder->contact_number : '',
                        'email' => $clientOrder ? $clientOrder->email : '',
                        'gstin' => $clientOrder ? ($clientOrder->gstin ?: ($clientOrder->vat_pan_number ?: '')) : '',
                        'vat_pan_number' => $clientOrder ? $clientOrder->vat_pan_number : '',
                        'country_code' => $clientOrder ? ($clientOrder->country_code ?: ($isNepal ? 'NP' : 'IN')) : 'IN',
                        'address' => $clientOrder ? ($clientOrder->address ?: '') : '',
                    ],
                    'client_id' => $clientId,
                    'client_name' => $clientName,
                    'company_name' => $schoolOrCompany,
                    'client_reg_date' => $clientOrder && $clientOrder->created_at ? substr($clientOrder->created_at, 0, 10) : $invDate,
                    'total_amount' => $totAmt,
                    'total_received' => $totAmt,
                    'total_tds' => 0,
                    'total_settled' => $totAmt,
                    'due_amount' => 0,
                    'is_paid' => true,
                    'status' => 'paid',
                    'items' => [
                        (object)[
                            'item_name' => "{$cycleName} Subscription Fee (" . ($clientOrder->product_name ?? 'SaaS Platform') . ')',
                            'product_name' => "{$cycleName} Subscription Fee (" . ($clientOrder->product_name ?? 'SaaS Platform') . ')',
                            'description' => 'Billing Period: ' . ($sub->period_start ?: '—') . ' to ' . ($sub->period_end ?: '—') . ($sub->student_count > 0 ? " ({$sub->student_count} Students)" : ''),
                            'quantity' => 1,
                            'qty' => 1,
                            'rate' => $baseAmt,
                            'price' => $baseAmt,
                            'selling_price' => $baseAmt,
                            'amount' => $baseAmt,
                            'hsn_code' => '998313',
                            'hsn_sac' => '998313',
                            'tax_rate' => 18,
                            'tax_amount' => $taxAmt,
                            'total_amount' => $totAmt,
                        ]
                    ],
                    'payments' => [
                        (object)[
                            'amount' => $totAmt,
                            'payment_date' => $invDate,
                            'payment_status' => 'success',
                            'payment_method' => 'Subscription',
                            'transaction_id' => $sub->payment_id,
                            'tds_amount' => 0
                        ]
                    ],
                    'raw_subscription' => $sub,
                    'created_at' => $sub->created_at,
                ];
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error appending SaaS subscriptions to compliance list: ' . $e->getMessage());
        }

        // Fetch Add-on Payments
        try {
            $addonPayments = \Illuminate\Support\Facades\DB::table('addon_payments')
                ->where('payment_status', 'paid')
                ->orderBy('payment_date', 'desc')
                ->orderBy('id', 'desc')
                ->get();

            foreach ($addonPayments as $addon) {
                $clientOrder = \Illuminate\Support\Facades\DB::table('client_orders')
                    ->where('id', $addon->client_id)
                    ->orWhere('client_id', $addon->client_display_id)
                    ->first();

                $invNo = $addon->invoice_id ?: ($addon->payment_id ?: ('INV-ADDON-' . $addon->id));
                $invDate = $addon->payment_date ? substr($addon->payment_date, 0, 10) : ($addon->created_at ? substr($addon->created_at, 0, 10) : date('Y-m-d'));
                $totAmt = (float)$addon->amount;
                $baseAmt = round($totAmt / 1.18, 2);
                $taxAmt = round($totAmt - $baseAmt, 2);
                $clientId = $addon->client_display_id ?: ($clientOrder ? $clientOrder->client_id : 'AIM-ADDON');
                $clientName = $clientOrder ? $clientOrder->client_name : 'Add-on Client';
                $schoolOrCompany = $clientOrder ? ($clientOrder->school_name ?: $clientOrder->company_name ?: $clientOrder->client_name) : 'Add-on Client';

                $tdsRecords[] = [
                    'record_type' => 'saas_addon',
                    'invoice_category' => 'addon',
                    'id' => 'ADDON-' . $addon->id,
                    'addon_payment_id' => $addon->id,
                    'quotation_id' => null,
                    'quotation_number' => 'ADDON-' . strtoupper($addon->addon_type ?: 'GENERAL'),
                    'quotation_date' => $invDate,
                    'invoice_number' => $invNo,
                    'invoice_date' => $invDate,
                    'client' => [
                        'id' => $clientOrder ? $clientOrder->id : $addon->client_id,
                        'client_id' => $clientId,
                        'client_name' => $clientName,
                        'company_name' => $schoolOrCompany,
                        'school_name' => $clientOrder ? $clientOrder->school_name : '',
                        'contact_number' => $clientOrder ? $clientOrder->contact_number : '',
                        'email' => $clientOrder ? $clientOrder->email : '',
                        'gstin' => $clientOrder ? ($clientOrder->gstin ?: '') : '',
                        'country_code' => $clientOrder ? ($clientOrder->country_code ?: 'IN') : 'IN',
                        'address' => $clientOrder ? ($clientOrder->address ?: '') : '',
                    ],
                    'client_id' => $clientId,
                    'client_name' => $clientName,
                    'company_name' => $schoolOrCompany,
                    'client_reg_date' => $clientOrder && $clientOrder->created_at ? substr($clientOrder->created_at, 0, 10) : $invDate,
                    'total_amount' => $totAmt,
                    'total_received' => $totAmt,
                    'total_tds' => 0,
                    'total_settled' => $totAmt,
                    'due_amount' => 0,
                    'is_paid' => true,
                    'status' => 'paid',
                    'items' => [
                        (object)[
                            'item_name' => 'Add-on Service: ' . ($addon->addon_type ?: 'Feature Add-on'),
                            'product_name' => 'Add-on Service: ' . ($addon->addon_type ?: 'Feature Add-on'),
                            'description' => 'Add-on module for ' . ($addon->recipient_type ?: 'student') . ' (Count: ' . ($addon->student_count ?: 1) . ')',
                            'quantity' => 1,
                            'qty' => 1,
                            'rate' => $baseAmt,
                            'price' => $baseAmt,
                            'selling_price' => $baseAmt,
                            'amount' => $baseAmt,
                            'hsn_code' => '998313',
                            'hsn_sac' => '998313',
                            'tax_rate' => 18,
                            'tax_amount' => $taxAmt,
                            'total_amount' => $totAmt,
                        ]
                    ],
                    'payments' => [
                        (object)[
                            'amount' => $totAmt,
                            'payment_date' => $invDate,
                            'payment_status' => 'success',
                            'payment_method' => 'Addon',
                            'transaction_id' => $addon->payment_id,
                            'tds_amount' => 0
                        ]
                    ],
                    'raw_addon' => $addon,
                    'created_at' => $addon->created_at,
                ];
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error appending add-ons to compliance list: ' . $e->getMessage());
        }

        // Fetch Customization Payments
        try {
            $custPayments = \Illuminate\Support\Facades\DB::table('customization_payments')
                ->where('payment_status', 'paid')
                ->orderBy('payment_date', 'desc')
                ->orderBy('id', 'desc')
                ->get();

            foreach ($custPayments as $cust) {
                $clientOrder = \Illuminate\Support\Facades\DB::table('client_orders')
                    ->where('id', $cust->client_id)
                    ->orWhere('client_id', $cust->client_id)
                    ->first();

                $invNo = $cust->invoice_id ?: ($cust->payment_id ?: ('INV-CUST-' . $cust->id));
                $invDate = $cust->payment_date ? substr($cust->payment_date, 0, 10) : ($cust->created_at ? substr($cust->created_at, 0, 10) : date('Y-m-d'));
                $totAmt = (float)($cust->total_amount ?: ($cust->amount ?: 0));
                $baseAmt = round($totAmt / 1.18, 2);
                $taxAmt = round($totAmt - $baseAmt, 2);
                $clientId = $clientOrder ? $clientOrder->client_id : ('AIM-' . $cust->client_id);
                $clientName = $clientOrder ? $clientOrder->client_name : 'Customization Client';
                $schoolOrCompany = $clientOrder ? ($clientOrder->school_name ?: $clientOrder->company_name ?: $clientOrder->client_name) : 'Customization Client';

                $tdsRecords[] = [
                    'record_type' => 'saas_customization',
                    'invoice_category' => 'customization',
                    'id' => 'CUST-' . $cust->id,
                    'customization_payment_id' => $cust->id,
                    'quotation_id' => null,
                    'quotation_number' => $cust->order_id ?: ('CUST-' . $cust->id),
                    'quotation_date' => $invDate,
                    'invoice_number' => $invNo,
                    'invoice_date' => $invDate,
                    'client' => [
                        'id' => $clientOrder ? $clientOrder->id : $cust->client_id,
                        'client_id' => $clientId,
                        'client_name' => $clientName,
                        'company_name' => $schoolOrCompany,
                        'school_name' => $clientOrder ? $clientOrder->school_name : '',
                        'contact_number' => $clientOrder ? $clientOrder->contact_number : '',
                        'email' => $clientOrder ? $clientOrder->email : '',
                        'gstin' => $clientOrder ? ($clientOrder->gstin ?: '') : '',
                        'country_code' => $clientOrder ? ($clientOrder->country_code ?: 'IN') : 'IN',
                        'address' => $clientOrder ? ($clientOrder->address ?: '') : '',
                    ],
                    'client_id' => $clientId,
                    'client_name' => $clientName,
                    'company_name' => $schoolOrCompany,
                    'client_reg_date' => $clientOrder && $clientOrder->created_at ? substr($clientOrder->created_at, 0, 10) : $invDate,
                    'total_amount' => $totAmt,
                    'total_received' => $totAmt,
                    'total_tds' => 0,
                    'total_settled' => $totAmt,
                    'due_amount' => 0,
                    'is_paid' => true,
                    'status' => 'paid',
                    'items' => [
                        (object)[
                            'item_name' => 'Software Customization & Feature Development',
                            'product_name' => 'Software Customization & Feature Development',
                            'description' => 'Bespoke customization request approved for ' . $schoolOrCompany,
                            'quantity' => 1,
                            'qty' => 1,
                            'rate' => $baseAmt,
                            'price' => $baseAmt,
                            'selling_price' => $baseAmt,
                            'amount' => $baseAmt,
                            'hsn_code' => '998313',
                            'hsn_sac' => '998313',
                            'tax_rate' => 18,
                            'tax_amount' => $taxAmt,
                            'total_amount' => $totAmt,
                        ]
                    ],
                    'payments' => [
                        (object)[
                            'amount' => $totAmt,
                            'payment_date' => $invDate,
                            'payment_status' => 'success',
                            'payment_method' => 'Customization',
                            'transaction_id' => $cust->payment_id,
                            'tds_amount' => 0
                        ]
                    ],
                    'raw_customization' => $cust,
                    'created_at' => $cust->created_at,
                ];
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error appending customizations to compliance list: ' . $e->getMessage());
        }

PHP;

$replacement = $addition . "\n" . $target;

if (strpos($content, $target) !== false) {
    $newContent = str_replace($target, $replacement, $content);
    file_put_contents($filePath, $newContent);
    echo "SUCCESS: Added all SaaS, Subscription and Nepal invoices to GeneralClientController.php\n";
} else {
    echo "ERROR: Target string not found.\n";
}

