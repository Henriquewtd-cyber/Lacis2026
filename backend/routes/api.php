<?php
 
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CidadesController;

use Illuminate\Support\Facades\Route;
 
 
Route::middleware('admin.token')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    

    Route::post('/cidades', [CidadesController::class, 'store']);

    Route::put('/cidades/', [CidadesController::class, 'update']);

    Route::post('/cidades/importar', [CidadesController::class, 'import']);
});



Route::get('/cidades/', [CidadesController::class, 'show']);
Route::post('/login/', [AuthController::class, 'login']);