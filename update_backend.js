const fs = require('fs');
const path = 'C:\\xampp\\htdocs\\aim-backend\\app\\Http\\Controllers\\Api\\AdminController.php';

let content = fs.readFileSync(path, 'utf8');

const target1 = `        // Fetch addon cart items
        $addonCarts = \\DB::table('addon_cart')
            ->whereIn('client_id', $clientIds)
            ->get()
            ->groupBy('client_id');

        // Fetch customization requests with payments`;

const replacement1 = `        // Fetch addon cart items
        $addonCarts = \\DB::table('addon_cart')
            ->whereIn('client_id', $clientIds)
            ->get()
            ->groupBy('client_id');

        // Fetch paid addon records
        $addonPayments = \\DB::table('addon_payments')
            ->whereIn('client_id', $clientIds)
            ->where(function($q) {
                $q->where('payment_status', 'paid')
                  ->orWhere('payment_status', 'completed');
            })
            ->get()
            ->groupBy('client_id');

        // Fetch customization requests with payments`;

const target2 = `        $processedClients = $clients->map(function ($client) use (
            $externalDbService, $latestPayments, $addonCarts, $customizations, $productsMap,`;

const replacement2 = `        $processedClients = $clients->map(function ($client) use (
            $externalDbService, $latestPayments, $addonCarts, $addonPayments, $customizations, $productsMap,`;

const target3 = `            // 4. Addons in Add to Cart (Due Amount)
            $clientCartItems = isset($addonCarts[$client->id]) ? $addonCarts[$client->id] : collect();
            $addonsCount = $clientCartItems->count();
            $addonsDue = round(floatval($clientCartItems->sum('amount')), 2);
            $addonsDetails = $clientCartItems->map(function($item) {
                return [
                    'id' => $item->id,
                    'addon_type' => $item->addon_type,
                    'recipient_type' => $item->recipient_type,
                    'amount' => floatval($item->amount),
                    'subtotal' => floatval($item->subtotal),
                    'gst_amount' => floatval($item->gst_amount),
                ];
            })->values();`;

const replacement3 = `            // 4. Addons in Add to Cart & External DB Live Usage (Due Amount)
            $clientCartItems = isset($addonCarts[$client->id]) ? $addonCarts[$client->id] : collect();
            $clientPaidAddons = isset($addonPayments[$client->id]) ? $addonPayments[$client->id] : collect();

            $addonsDetails = $clientCartItems->map(function($item) {
                return [
                    'id' => $item->id,
                    'addon_type' => $item->addon_type,
                    'recipient_type' => $item->recipient_type ?? 'All',
                    'amount' => floatval($item->amount),
                    'subtotal' => floatval($item->subtotal),
                    'gst_amount' => floatval($item->gst_amount),
                ];
            })->toArray();

            // Calculate duration days for add-on pricing
            $startDate = now()->startOfDay();
            $pEndForAddon = $latestPayment && $latestPayment->period_end ? $latestPayment->period_end : $client->period_end;
            if ($pEndForAddon && \\Carbon\\Carbon::parse($pEndForAddon)->gte($startDate)) {
                $addonDays = $startDate->diffInDays(\\Carbon\\Carbon::parse($pEndForAddon)->startOfDay()) + 1;
            } else {
                $addonDays = 365;
            }

            // Check External DB for 3 specific add-ons (Transportation, Hostel, Previous Year Backup)
            $extAddonTypes = [
                [
                    'type' => 'Transportation',
                    'display_name' => 'Transportation (Live DB)',
                    'rate' => 36.0,
                    'count_method' => 'getTransportationAssignmentsCount',
                ],
                [
                    'type' => 'hostel',
                    'display_name' => 'Hostel (Live DB)',
                    'rate' => 60.0,
                    'count_method' => 'getHostelAllocationsCount',
                ],
                [
                    'type' => 'previous_year',
                    'display_name' => 'Previous Year Backup (Live DB)',
                    'rate' => 36.0,
                    'count_method' => 'getPreviousYearDuesCount',
                ],
            ];

            foreach ($extAddonTypes as $config) {
                $addonType = $config['type'];

                // Check if already in addon_cart
                $inCart = $clientCartItems->contains(function($i) use ($addonType) {
                    return strtolower($i->addon_type) === strtolower($addonType);
                });

                // Check if already paid in addon_payments
                $isPaid = $clientPaidAddons->contains(function($p) use ($addonType) {
                    return isset($p->addon_type) && strtolower($p->addon_type) === strtolower($addonType);
                });

                if (!$inCart && !$isPaid) {
                    $method = $config['count_method'];
                    $count = $externalDbService->$method($client->school_name, $client->school_short_name);

                    if ($count > 0) {
                        $subtotal = round(($count * $config['rate']) * ($addonDays / 365.0), 2);
                        $gstAmount = round($subtotal * 0.18, 2);
                        $totalAmount = round($subtotal + $gstAmount, 2);

                        $addonsDetails[] = [
                            'id' => 'ext_' . strtolower($addonType) . '_' . $client->id,
                            'addon_type' => $config['display_name'],
                            'recipient_type' => 'Student (' . $count . ' active)',
                            'amount' => $totalAmount,
                            'subtotal' => $subtotal,
                            'gst_amount' => $gstAmount,
                        ];
                    }
                }
            }

            $addonsCount = count($addonsDetails);
            $addonsDue = round(array_sum(array_column($addonsDetails, 'amount')), 2);`;

if (!content.includes(target1)) {
    console.error('ERROR: target1 not found');
} else if (!content.includes(target2)) {
    console.error('ERROR: target2 not found');
} else if (!content.includes(target3)) {
    console.error('ERROR: target3 not found');
} else {
    content = content.replace(target1, replacement1).replace(target2, replacement2).replace(target3, replacement3);
    fs.writeFileSync(path, content, 'utf8');
    console.log('SUCCESSFULLY_UPDATED_BACKEND');
}
