<?php
require 'C:/xampp/htdocs/aim-backend/vendor/autoload.php';
$app = require_once 'C:/xampp/htdocs/aim-backend/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

echo "=== INVOICE SEQUENCES TABLE ===\n";
if (\Illuminate\Support\Facades\Schema::hasTable('invoice_sequences')) {
    print_r(\Illuminate\Support\Facades\DB::table('invoice_sequences')->get()->toArray());
} else {
    echo "Table invoice_sequences does not exist yet.\n";
}

echo "\n=== CLIENT ORDERS (Recent Invoices) ===\n";
print_r(\Illuminate\Support\Facades\DB::table('client_orders')
    ->whereNotNull('invoice_id')
    ->where('invoice_id', '!=', '')
    ->select('id', 'client_id', 'client_name', 'invoice_id', 'activated_at')
    ->orderBy('id', 'desc')
    ->take(10)
    ->get()->toArray());

echo "\n=== SUBSCRIPTION PAYMENTS (Recent Invoices) ===\n";
print_r(\Illuminate\Support\Facades\DB::table('subscription_payments')
    ->whereNotNull('invoice_id')
    ->where('invoice_id', '!=', '')
    ->select('id', 'client_id', 'invoice_id', 'payment_date')
    ->orderBy('id', 'desc')
    ->take(10)
    ->get()->toArray());

echo "\n=== GENERAL CLIENT QUOTATIONS (Recent Invoices) ===\n";
print_r(\Illuminate\Support\Facades\DB::table('general_client_quotations')
    ->whereNotNull('invoice_number')
    ->where('invoice_number', '!=', '')
    ->select('id', 'quotation_number', 'invoice_number', 'invoice_date')
    ->orderBy('id', 'desc')
    ->take(10)
    ->get()->toArray());

