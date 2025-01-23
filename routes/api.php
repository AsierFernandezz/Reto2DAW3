<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClimaController;
use App\Http\Controllers\BalizaController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('climas/ultima', [ClimaController::class, 'ultimaMedicionPorBaliza']);
Route::apiResource('climas', ClimaController::class);
Route::apiResource('balizas', BalizaController::class);

