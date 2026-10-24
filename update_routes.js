const fs = require('fs');
const path = 'C:\\\\xampp\\\\htdocs\\\\aim-backend\\\\routes\\\\api.php';

let content = fs.readFileSync(path, 'utf8');

const target = "Route::delete('/employees/{id}', [AdminController::class, 'deleteEmployee']);";
const addition = `Route::delete('/employees/{id}', [AdminController::class, 'deleteEmployee']);

    // Attendance Routes
    Route::get('/attendances', [AdminController::class, 'getAllAttendances']);
    Route::post('/attendances/{id}/consider-full-day', [AdminController::class, 'considerAttendanceFullDay']);`;

if (!content.includes("Route::get('/attendances'")) {
    if (content.includes(target)) {
        content = content.replace(target, addition);
        fs.writeFileSync(path, content, 'utf8');
        console.log('Successfully added attendance routes to routes/api.php');
    } else {
        console.error('Target string not found in routes/api.php');
        process.exit(1);
    }
} else {
    console.log('Attendance routes already present in routes/api.php');
}
