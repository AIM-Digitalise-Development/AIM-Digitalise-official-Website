<?php
$leadPath = 'C:\xampp\htdocs\aim-backend\app\Http\Controllers\Api\LeadController.php';
$partnerPath = 'C:\xampp\htdocs\aim-backend\app\Http\Controllers\Api\PartnerLeadController.php';

if (file_exists($leadPath)) {
    @chmod($leadPath, 0777);
    $content = file_get_contents($leadPath);
    $content = str_replace("'employee', 'partner', 'assignedTo'", "'employee', 'partner.parent', 'assignedTo'", $content);
    $content = str_replace("'employee', 'partner', 'category'", "'employee', 'partner.parent', 'category'", $content);
    file_put_contents($leadPath, $content);
    echo "LeadController updated!\n";
}

if (file_exists($partnerPath)) {
    @chmod($partnerPath, 0777);
    $content = file_get_contents($partnerPath);
    $content = str_replace("Lead::with(['demoSlot'", "Lead::with(['partner.parent', 'employee', 'demoSlot'", $content);
    file_put_contents($partnerPath, $content);
    echo "PartnerLeadController updated!\n";
}
