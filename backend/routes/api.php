<?php
 
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CidadesController;
use App\Http\Controllers\EventosController;

use Illuminate\Support\Facades\Route;
 
 
Route::middleware('admin.token')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    

    Route::post('/cidades', [CidadesController::class, 'store']);

    Route::put('/cidades/', [CidadesController::class, 'update']);

    Route::post('/cidades/importar', [CidadesController::class, 'import']);

    // Eventos (admin). Com arquivo, use POST /eventos/{id} com _method=PUT.
    Route::get('/admin/eventos', [EventosController::class, 'adminIndex']);
    Route::get('/admin/eventos/{id}', [EventosController::class, 'adminShow'])->whereNumber('id');
    Route::post('/eventos', [EventosController::class, 'store']);
    Route::put('/eventos/{id}', [EventosController::class, 'update'])->whereNumber('id');
    Route::delete('/eventos/{id}', [EventosController::class, 'destroy'])->whereNumber('id');
});



Route::get('/cidades/', [CidadesController::class, 'show']);
Route::get('/cidades/all', [CidadesController::class, 'getAll']);
Route::post('/login/', [AuthController::class, 'login']);

// Eventos (publico): so os publicados
Route::get('/eventos', [EventosController::class, 'index']);
Route::get('/eventos/{id}', [EventosController::class, 'show'])->whereNumber('id');