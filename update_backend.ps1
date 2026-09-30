$path = 'C:\xampp\htdocs\aim-backend\app\Http\Controllers\Api\AdminController.php'
$lines = [System.IO.File]::ReadAllLines($path)

$outLines = New-Object System.Collections.Generic.List[string]

$skipNext = $false
for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]

    if ($skipNext) {
        $skipNext = $false
        continue
    }

    $outLines.Add($line)

    # 1. After $addonCarts = ... ->groupBy('client_id');
    if ($line -like "*->groupBy('client_id');*" -and $lines[$i-1] -like "*->get()*" -and $lines[$i-3] -like "*DB::table('addon_cart')*") {
        $outLines.Add('')
        $outLines.Add('        // Fetch paid addon records')
        $outLines.Add('        $addonPayments = \DB::table(''addon_payments'')')
        $outLines.Add('            ->whereIn(''client_id'', $clientIds)')
        $outLines.Add('            ->where(function($q) {')
        $outLines.Add('                $q->where(''payment_status'', ''paid'')')
        $outLines.Add('                  ->orWhere(''payment_status'', ''completed'');')
        $outLines.Add('            })')
        $outLines.Add('            ->get()')
        $outLines.Add('            ->groupBy(''client_id'');')
    }

    # 2. Update use ($externalDbService, ...)
    if ($line -like "*$processedClients = $clients->map(function ($client) use (*") {
        $outLines.Add('            $externalDbService, $latestPayments, $addonCarts, $addonPayments, $customizations, $productsMap,')
        $skipNext = $true
    }

    # 3. Replace section 4 (lines 547-560)
    if ($line -like "*// 4. Addons in Add to Cart (Due Amount)*") {
        # Remove the header line we just added and replace block
        $outLines.RemoveAt($outLines.Count - 1)

        $outLines.Add('            // 4. Addons in Add to Cart & External DB Live Usage (Due Amount)')
        $outLines.Add('            $clientCartItems = isset($addonCarts[$client->id]) ? $addonCarts[$client->id] : collect();')
        $outLines.Add('            $clientPaidAddons = isset($addonPayments[$client->id]) ? $addonPayments[$client->id] : collect();')
        $outLines.Add('')
        $outLines.Add('            $addonsDetails = $clientCartItems->map(function($item) {')
        $outLines.Add('                return [')
        $outLines.Add('                    ''id'' => $item->id,')
        $outLines.Add('                    ''addon_type'' => $item->addon_type,')
        $outLines.Add('                    ''recipient_type'' => $item->recipient_type ?? ''All'',')
        $outLines.Add('                    ''amount'' => floatval($item->amount),')
        $outLines.Add('                    ''subtotal'' => floatval($item->subtotal),')
        $outLines.Add('                    ''gst_amount'' => floatval($item->gst_amount),')
        $outLines.Add('                ];')
        $outLines.Add('            })->toArray();')
        $outLines.Add('')
        $outLines.Add('            // Calculate duration days for add-on pricing')
        $outLines.Add('            $startDate = now()->startOfDay();')
        $outLines.Add('            $pEndForAddon = $latestPayment && $latestPayment->period_end ? $latestPayment->period_end : $client->period_end;')
        $outLines.Add('            if ($pEndForAddon && \Carbon\Carbon::parse($pEndForAddon)->gte($startDate)) {')
        $outLines.Add('                $addonDays = $startDate->diffInDays(\Carbon\Carbon::parse($pEndForAddon)->startOfDay()) + 1;')
        $outLines.Add('            } else {')
        $outLines.Add('                $addonDays = 365;')
        $outLines.Add('            }')
        $outLines.Add('')
        $outLines.Add('            // Check External DB for 3 specific add-ons (Transportation, Hostel, Previous Year Backup)')
        $outLines.Add('            $extAddonTypes = [')
        $outLines.Add('                [')
        $outLines.Add('                    ''type'' => ''Transportation'',')
        $outLines.Add('                    ''display_name'' => ''Transportation (Live DB)'',')
        $outLines.Add('                    ''rate'' => 36.0,')
        $outLines.Add('                    ''count_method'' => ''getTransportationAssignmentsCount'',')
        $outLines.Add('                ],')
        $outLines.Add('                [')
        $outLines.Add('                    ''type'' => ''hostel'',')
        $outLines.Add('                    ''display_name'' => ''Hostel (Live DB)'',')
        $outLines.Add('                    ''rate'' => 60.0,')
        $outLines.Add('                    ''count_method'' => ''getHostelAllocationsCount'',')
        $outLines.Add('                ],')
        $outLines.Add('                [')
        $outLines.Add('                    ''type'' => ''previous_year'',')
        $outLines.Add('                    ''display_name'' => ''Previous Year Backup (Live DB)'',')
        $outLines.Add('                    ''rate'' => 36.0,')
        $outLines.Add('                    ''count_method'' => ''getPreviousYearDuesCount'',')
        $outLines.Add('                ],')
        $outLines.Add('            ];')
        $outLines.Add('')
        $outLines.Add('            foreach ($extAddonTypes as $config) {')
        $outLines.Add('                $addonType = $config[''type''];')
        $outLines.Add('')
        $outLines.Add('                // Check if already in addon_cart')
        $outLines.Add('                $inCart = $clientCartItems->contains(function($i) use ($addonType) {')
        $outLines.Add('                    return strtolower($i->addon_type) === strtolower($addonType);')
        $outLines.Add('                });')
        $outLines.Add('')
        $outLines.Add('                // Check if already paid in addon_payments')
        $outLines.Add('                $isPaid = $clientPaidAddons->contains(function($p) use ($addonType) {')
        $outLines.Add('                    return isset($p->addon_type) && strtolower($p->addon_type) === strtolower($addonType);')
        $outLines.Add('                });')
        $outLines.Add('')
        $outLines.Add('                if (!$inCart && !$isPaid) {')
        $outLines.Add('                    $method = $config[''count_method''];')
        $outLines.Add('                    $count = $externalDbService->$method($client->school_name, $client->school_short_name);')
        $outLines.Add('')
        $outLines.Add('                    if ($count > 0) {')
        $outLines.Add('                        $subtotal = round(($count * $config[''rate'']) * ($addonDays / 365.0), 2);')
        $outLines.Add('                        $gstAmount = round($subtotal * 0.18, 2);')
        $outLines.Add('                        $totalAmount = round($subtotal + $gstAmount, 2);')
        $outLines.Add('')
        $outLines.Add('                        $addonsDetails[] = [')
        $outLines.Add('                            ''id'' => ''ext_'' . strtolower($addonType) . ''_'' . $client->id,')
        $outLines.Add('                            ''addon_type'' => $config[''display_name''],')
        $outLines.Add('                            ''recipient_type'' => ''Student ('' . $count . '' active)'',')
        $outLines.Add('                            ''amount'' => $totalAmount,')
        $outLines.Add('                            ''subtotal'' => $subtotal,')
        $outLines.Add('                            ''gst_amount'' => $gstAmount,')
        $outLines.Add('                        ];')
        $outLines.Add('                    }')
        $outLines.Add('                }')
        $outLines.Add('            }')
        $outLines.Add('')
        $outLines.Add('            $addonsCount = count($addonsDetails);')
        $outLines.Add('            $addonsDue = round(array_sum(array_column($addonsDetails, ''amount'')), 2);')

        # Skip original section 4 lines until section 5
        while ($i + 1 -lt $lines.Count -and -not ($lines[$i + 1] -like "*// 5. Customization Dues*")) {
            $i++
        }
    }
}

[System.IO.File]::WriteAllLines($path, $outLines, [System.Text.Encoding]::UTF8)
Write-Host "SUCCESSFULLY_MODIFIED"
