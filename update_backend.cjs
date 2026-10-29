const fs = require('fs');
const path = require('path');

// 1. Update ClientOrder.php
const clientOrderPath = 'C:\\xampp\\htdocs\\aim-backend\\app\\Models\\ClientOrder.php';
let clientOrderContent = fs.readFileSync(clientOrderPath, 'utf8');
if (!clientOrderContent.includes("'institution_type'")) {
  clientOrderContent = clientOrderContent.replace(
    /'school_session',(\r?\n)/,
    `'school_session',$1        'institution_type',$1        'established_year',$1        'website',$1`
  );
  fs.writeFileSync(clientOrderPath, clientOrderContent, 'utf8');
  console.log('Updated ClientOrder.php');
} else {
  console.log('ClientOrder.php already has institution_type');
}

// 2. Update Client.php
const clientPath = 'C:\\xampp\\htdocs\\aim-backend\\app\\Models\\Client.php';
let clientContent = fs.readFileSync(clientPath, 'utf8');
if (!clientContent.includes("'institution_type'")) {
  clientContent = clientContent.replace(
    /'school_session',(\r?\n)/,
    `'school_session',$1        'institution_type',$1        'established_year',$1        'website',$1`
  );
  fs.writeFileSync(clientPath, clientContent, 'utf8');
  console.log('Updated Client.php');
} else {
  console.log('Client.php already has institution_type');
}

// 3. Update ClientController.php
const clientCtrlPath = 'C:\\xampp\\htdocs\\aim-backend\\app\\Http\\Controllers\\Api\\ClientController.php';
let clientCtrlContent = fs.readFileSync(clientCtrlPath, 'utf8');
if (!clientCtrlContent.includes("'institution_type' =>")) {
  clientCtrlContent = clientCtrlContent.replace(
    /'school_session' => \$client->school_session,(\r?\n)/,
    `'school_session' => $client->school_session,$1                'institution_type' => $client->institution_type ?? null,$1                'established_year' => $client->established_year ?? null,$1                'website' => $client->website ?? null,$1`
  );
  fs.writeFileSync(clientCtrlPath, clientCtrlContent, 'utf8');
  console.log('Updated ClientController.php profile response');
}

// 4. Update PublicController.php
const publicCtrlPath = 'C:\\xampp\\htdocs\\aim-backend\\app\\Http\\Controllers\\Api\\PublicController.php';
let publicCtrlContent = fs.readFileSync(publicCtrlPath, 'utf8');

// Update createOrder rules
const newRules1 = `    // Check if per_person == 1 or Institute type product
    if ($product->id == 18 || str_contains(strtolower($product->name), 'institute plus')) {
        $rules['school_name'] = 'required|string|max:255';
        $rules['school_short_name'] = 'required|string|max:50|unique:client_orders,school_short_name';
        $rules['institution_type'] = 'nullable|string|max:100';
        $rules['established_year'] = 'nullable|string|max:20';
        $rules['website'] = 'nullable|string|max:255';
        $rules['gstin'] = 'nullable|string|max:50';
        $rules['vat_pan_number'] = 'nullable|string|max:50';
    } else if ($product->per_person == 1) {
        $rules['school_name'] = 'required|string|max:255';
        $rules['school_short_name'] = 'required|string|max:50|unique:client_orders,school_short_name';
        $rules['school_session'] = 'required|string|max:10';
        $rules['total_students'] = 'required|integer|min:1';
        $rules['gstin'] = 'nullable|string|max:50';
        $rules['vat_pan_number'] = 'nullable|string|max:50';
    } else {`;

const regexOldRules1 = /\/\/ Check if per_person == 1 \(Institute\/School type product\)[\r\n\s]+if \(\$product->per_person == 1\) \{[\r\n\s]+\$rules\['school_name'\] = 'required\|string\|max:255';[\r\n\s]+\$rules\['school_short_name'\] = 'required\|string\|max:8\|unique:client_orders,school_short_name';[\r\n\s]+\$rules\['school_session'\] = 'required\|string\|max:10';[\r\n\s]+\$rules\['total_students'\] = 'required\|integer\|min:1';[\r\n\s]+\$rules\['gstin'\] = 'nullable\|string\|max:50';[\r\n\s]+\$rules\['vat_pan_number'\] = 'nullable\|string\|max:50';[\r\n\s]+\} else \{/;

if (regexOldRules1.test(publicCtrlContent)) {
  publicCtrlContent = publicCtrlContent.replace(regexOldRules1, newRules1);
  console.log('Updated createOrder rules in PublicController.php');
} else {
  console.log('createOrder rules already updated or regex did not match');
}

// Update orderData in createOrder
const regexOrderData1 = /'school_name' => \$request->school_name,[\r\n\s]+'school_short_name' => \$request->school_short_name,[\r\n\s]+'school_session' => \$request->school_session,[\r\n\s]+'total_students' => \$request->total_students,/;

const newOrderData1 = `'school_name' => $request->school_name ?? $request->company_name,
        'school_short_name' => $request->school_short_name,
        'school_session' => $request->school_session ?? ($request->established_year ? $request->established_year . '-' . substr(((int)$request->established_year + 1), -2) : '2026-27'),
        'total_students' => $request->total_students ?? 1,`;

if (regexOrderData1.test(publicCtrlContent)) {
  publicCtrlContent = publicCtrlContent.replace(regexOrderData1, newOrderData1);
  console.log('Updated orderData in PublicController.php');
}

// Add extra fields assignment if columns exist
const newOrderCreate = `    // Safely assign extra fields for Institute Plus if columns exist
    if (\\Illuminate\\Support\\Facades\\Schema::hasColumn('client_orders', 'institution_type') && $request->filled('institution_type')) {
        $orderData['institution_type'] = $request->institution_type;
    }
    if (\\Illuminate\\Support\\Facades\\Schema::hasColumn('client_orders', 'established_year') && $request->filled('established_year')) {
        $orderData['established_year'] = $request->established_year;
    }
    if (\\Illuminate\\Support\\Facades\\Schema::hasColumn('client_orders', 'website') && $request->filled('website')) {
        $orderData['website'] = $request->website;
    }

    // Set company_name based on product type
    if ($product->per_person == 1 || $product->id == 18) {
        $orderData['company_name'] = $request->school_name ?? $request->company_name;
    } else {
        $orderData['company_name'] = $request->company_name;
    }

    $clientOrder = ClientOrder::create($orderData);`;

const regexOrderCreate = /\/\/ Set company_name based on product type[\r\n\s]+if \(\$product->per_person == 1\) \{[\r\n\s]+\$orderData\['company_name'\] = \$request->school_name;[\r\n\s]+\} else \{[\r\n\s]+\$orderData\['company_name'\] = \$request->company_name;[\r\n\s]+\}[\r\n\s]+\$clientOrder = ClientOrder::create\(\$orderData\);/;

if (regexOrderCreate.test(publicCtrlContent)) {
  publicCtrlContent = publicCtrlContent.replace(regexOrderCreate, newOrderCreate);
  console.log('Updated company_name & extra fields in PublicController.php');
}

fs.writeFileSync(publicCtrlPath, publicCtrlContent, 'utf8');
console.log('Done backend updates.');

// Update Khalti & Esewa in PublicController
const publicCtrlPath2 = 'C:\\xampp\\htdocs\\aim-backend\\app\\Http\\Controllers\\Api\\PublicController.php';
let pContent = fs.readFileSync(publicCtrlPath2, 'utf8');

const khaltiOld = /if \(\$product->per_person == 1\) \{[\r\n\s]+\$rules\['school_name'\] = 'required\|string\|max:255';[\r\n\s]+\$rules\['school_short_name'\] = 'required\|string\|max:8\|unique:client_orders,school_short_name';[\r\n\s]+\$rules\['school_session'\] = 'required\|string\|max:10';[\r\n\s]+\$rules\['total_students'\] = 'required\|integer\|min:1';[\r\n\s]+\$rules\['vat_pan_number'\] = 'nullable\|string\|max:50';[\r\n\s]+\} else \{/g;

const khaltiNew = `if ($product->id == 18 || str_contains(strtolower($product->name), 'institute plus')) {
            $rules['school_name'] = 'required|string|max:255';
            $rules['school_short_name'] = 'required|string|max:50|unique:client_orders,school_short_name';
            $rules['institution_type'] = 'nullable|string|max:100';
            $rules['established_year'] = 'nullable|string|max:20';
            $rules['website'] = 'nullable|string|max:255';
            $rules['vat_pan_number'] = 'nullable|string|max:50';
        } else if ($product->per_person == 1) {
            $rules['school_name'] = 'required|string|max:255';
            $rules['school_short_name'] = 'required|string|max:50|unique:client_orders,school_short_name';
            $rules['school_session'] = 'required|string|max:10';
            $rules['total_students'] = 'required|integer|min:1';
            $rules['vat_pan_number'] = 'nullable|string|max:50';
        } else {`;

pContent = pContent.replace(khaltiOld, khaltiNew);
fs.writeFileSync(publicCtrlPath2, pContent, 'utf8');
console.log('PublicController khalti and esewa rules updated.');
