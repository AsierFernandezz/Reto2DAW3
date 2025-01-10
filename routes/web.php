<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MapController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/tiempo/{id?}', [MapController::class, 'index']);
Route::get('/datos-balizas', [MapController::class, 'obtenerDatos']);
