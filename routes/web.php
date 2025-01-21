<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClimaController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/tiempo/{id?}', [ClimaController::class, 'index']);
Route::get('/municipio/{name?}', [ClimaController::class,'datosMunicipio']);
