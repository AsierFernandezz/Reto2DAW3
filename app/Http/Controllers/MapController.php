<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MapController extends Controller
{
    public function index()
    {
        return view('tiempo');
    }

    public function obtenerDatos()
    {
        $balizas = \DB::table('baliza')->get();
        return response()->json($balizas);
    }
}
