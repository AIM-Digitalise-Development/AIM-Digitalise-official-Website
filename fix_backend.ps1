$path = "C:\xampp\htdocs\aim-backend\app\Http\Controllers\Api\AdminController.php"
$content = [System.IO.File]::ReadAllText($path)

$oldPattern = '$this->calculateDiscountedPrice($product,'
$newPattern = '$product->getDiscountedPrice('

if ($content.Contains($oldPattern)) {
    $content = $content.Replace($oldPattern, $newPattern)
    [System.IO.File]::WriteAllText($path, $content)
    Write-Host "SUCCESS: AdminController.php updated successfully."
} else {
    Write-Host "INFO: Pattern not found or already replaced."
}
