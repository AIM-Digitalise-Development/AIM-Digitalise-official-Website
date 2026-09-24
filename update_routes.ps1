$path = 'C:\xampp\htdocs\aim-backend\routes\api.php'
$c = [System.IO.File]::ReadAllText($path)
$target = "Route::delete('/quotations/{id}', [GeneralClientController::class, 'deleteQuotation']);"
$add = @"
Route::delete('/quotations/{id}', [GeneralClientController::class, 'deleteQuotation']);
    Route::post('/quotations/{id}/record-payment', [GeneralClientController::class, 'recordPayment']);
    Route::post('/general-clients/quotations/{id}/record-payment', [GeneralClientController::class, 'recordPayment']);
"@
$c = $c.Replace($target, $add)
[System.IO.File]::WriteAllText($path, $c)
Write-Host "api.php routes updated"
