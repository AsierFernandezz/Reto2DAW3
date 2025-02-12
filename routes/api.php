<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClimaController;
use App\Http\Controllers\BalizaController;
use App\Http\Controllers\EuskalmetController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('climas/ultima', [ClimaController::class, 'ultimaMedicionPorBaliza']);
Route::get('historico/{baliza_id}', [ClimaController::class, 'historico']);
Route::apiResource('climas', ClimaController::class);
Route::apiResource('balizas', BalizaController::class);
Route::get('/euskalmet/pronostico/{municipio}', [EuskalmetController::class, 'getPronostico']);

